import "dotenv/config";
import cookieParser from "cookie-parser";
import express from "express";
import path from "path";

import { clearAuthCookie, getUserIdFromRequest, hashPassword, setAuthCookie, verifyPassword } from "./lib/auth.js";
import { ensureDatabase, readDatabase, withDatabase } from "./lib/db.js";
import {
  addCustomQuest,
  changeQuestProgress,
  createId,
  createProfile,
  ensureCurrentDay,
  normalizeProfile,
  removeQuest,
  updateProfileTimeZone,
} from "../shared/game.js";

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const HOST = process.env.HOST || "127.0.0.1";
const DIST_DIR = path.join(process.cwd(), "dist");

app.use(express.json());
app.use(cookieParser());

function createError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function asyncHandler(handler) {
  return async (request, response, next) => {
    try {
      await handler(request, response, next);
    } catch (error) {
      next(error);
    }
  };
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function getTimeZoneFromRequest(request) {
  const timeZoneHeader = request.headers["x-timezone"];
  return typeof timeZoneHeader === "string" ? timeZoneHeader.trim() : "UTC";
}

function syncProfile(user, request) {
  user.profile = normalizeProfile(user.profile, user.name);
  updateProfileTimeZone(user.profile, getTimeZoneFromRequest(request));
  ensureCurrentDay(user.profile);
  user.updatedAt = new Date().toISOString();
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function buildSessionPayload(user) {
  return {
    user: sanitizeUser(user),
    profile: user.profile,
  };
}

async function requireAuth(request, response, next) {
  const userId = getUserIdFromRequest(request);

  if (!userId) {
    clearAuthCookie(response);
    return response.status(401).json({ message: "Authentication required." });
  }

  const database = await readDatabase();
  const user = database.users.find((candidate) => candidate.id === userId);

  if (!user) {
    clearAuthCookie(response);
    return response.status(401).json({ message: "Session expired. Please sign in again." });
  }

  request.userId = userId;
  next();
}

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

app.post("/api/auth/register", asyncHandler(async (request, response) => {
  const name = String(request.body?.name || "").trim();
  const email = normalizeEmail(request.body?.email);
  const password = String(request.body?.password || "");
  const timeZone = getTimeZoneFromRequest(request);

  if (name.length < 2) {
    throw createError(400, "Name must be at least 2 characters.");
  }

  if (!email.includes("@")) {
    throw createError(400, "Please enter a valid email address.");
  }

  if (password.length < 8) {
    throw createError(400, "Password must be at least 8 characters.");
  }

  const passwordHash = await hashPassword(password);

  const user = await withDatabase(async (database) => {
    const existingUser = database.users.find((candidate) => candidate.email === email);
    if (existingUser) {
      throw createError(409, "An account with that email already exists.");
    }

    const now = new Date().toISOString();
    const nextUser = {
      id: createId("user"),
      name,
      email,
      passwordHash,
      createdAt: now,
      updatedAt: now,
      profile: createProfile({ name, timeZone }),
    };

    database.users.push(nextUser);
    return nextUser;
  });

  setAuthCookie(response, user.id);
  response.status(201).json(buildSessionPayload(user));
}));

app.post("/api/auth/login", asyncHandler(async (request, response) => {
  const email = normalizeEmail(request.body?.email);
  const password = String(request.body?.password || "");

  if (!email || !password) {
    throw createError(400, "Email and password are required.");
  }

  const user = await withDatabase(async (database) => {
    const existingUser = database.users.find((candidate) => candidate.email === email);
    if (!existingUser) {
      throw createError(401, "Invalid email or password.");
    }

    const isValid = await verifyPassword(password, existingUser.passwordHash);
    if (!isValid) {
      throw createError(401, "Invalid email or password.");
    }

    syncProfile(existingUser, request);
    return existingUser;
  });

  setAuthCookie(response, user.id);
  response.json(buildSessionPayload(user));
}));

app.post("/api/auth/logout", (_request, response) => {
  clearAuthCookie(response);
  response.status(204).send();
});

app.get("/api/auth/session", requireAuth, asyncHandler(async (request, response) => {
  const session = await withDatabase(async (database) => {
    const user = database.users.find((candidate) => candidate.id === request.userId);
    if (!user) {
      throw createError(401, "Session expired. Please sign in again.");
    }

    syncProfile(user, request);
    return buildSessionPayload(user);
  });

  response.json(session);
}));

app.post("/api/quests", requireAuth, asyncHandler(async (request, response) => {
  const payload = await withDatabase(async (database) => {
    const user = database.users.find((candidate) => candidate.id === request.userId);
    if (!user) {
      throw createError(401, "Session expired. Please sign in again.");
    }

    syncProfile(user, request);
    const name = String(request.body?.name || "").trim();

    if (!name) {
      throw createError(400, "Quest name is required.");
    }

    addCustomQuest(user.profile, {
      name,
      category: request.body?.category,
      difficulty: request.body?.difficulty,
      target: request.body?.target,
      unit: request.body?.unit,
      dueTime: request.body?.dueTime,
      description: String(request.body?.description || "").trim(),
    });

    return buildSessionPayload(user);
  });

  response.status(201).json(payload);
}));

app.patch("/api/quests/:questId/progress", requireAuth, asyncHandler(async (request, response) => {
  const payload = await withDatabase(async (database) => {
    const user = database.users.find((candidate) => candidate.id === request.userId);
    if (!user) {
      throw createError(401, "Session expired. Please sign in again.");
    }

    syncProfile(user, request);

    if (typeof request.body?.progress !== "number") {
      throw createError(400, "Progress must be a number.");
    }

    const quest = changeQuestProgress(user.profile, request.params.questId, request.body.progress);
    if (!quest) {
      throw createError(404, "Quest not found.");
    }

    return buildSessionPayload(user);
  });

  response.json(payload);
}));

app.delete("/api/quests/:questId", requireAuth, asyncHandler(async (request, response) => {
  const payload = await withDatabase(async (database) => {
    const user = database.users.find((candidate) => candidate.id === request.userId);
    if (!user) {
      throw createError(401, "Session expired. Please sign in again.");
    }

    syncProfile(user, request);

    const quest = user.profile.quests.find((candidate) => candidate.id === request.params.questId);
    if (!quest) {
      throw createError(404, "Quest not found.");
    }

    if (!quest.custom) {
      throw createError(400, "Starter quests cannot be deleted.");
    }

    removeQuest(user.profile, request.params.questId);
    return buildSessionPayload(user);
  });

  response.json(payload);
}));

app.use("/api", (_request, response) => {
  response.status(404).json({ message: "API route not found." });
});

if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
  app.use(express.static(DIST_DIR));

  app.get("*", (request, response, next) => {
    if (request.path.startsWith("/api")) {
      next();
      return;
    }

    response.sendFile(path.join(DIST_DIR, "index.html"));
  });
}

app.use((error, _request, response, _next) => {
  const status = error.status || 500;
  const message = status >= 500 ? "Something went wrong on the server." : error.message;

  if (status >= 500) {
    console.error(error);
  }

  response.status(status).json({ message });
});

export default app;

if (!process.env.VERCEL) {
  ensureDatabase()
    .then(() => {
      const server = app.listen(PORT, HOST);

      server.on("listening", () => {
        console.log(`Ascension System API running on http://${HOST}:${PORT}`);
      });

      server.on("error", (error) => {
        if (error.code === "EACCES") {
          console.error(`Cannot bind the API server to ${HOST}:${PORT}. Try a different PORT in your .env file.`);
        } else if (error.code === "EADDRINUSE") {
          console.error(`Port ${PORT} is already in use on ${HOST}. Try a different PORT in your .env file.`);
        } else {
          console.error("The API server failed to start.", error);
        }

        process.exit(1);
      });
    })
    .catch((error) => {
      console.error("Failed to initialize the database.", error);
      process.exit(1);
    });
}
