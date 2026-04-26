import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const TOKEN_NAME = "ascension_token";
const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret-before-production";
const TOKEN_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;

function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: TOKEN_MAX_AGE_MS,
    path: "/",
  };
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

export function setAuthCookie(response, userId) {
  const token = jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "7d" });
  response.cookie(TOKEN_NAME, token, getCookieOptions());
}

export function clearAuthCookie(response) {
  response.clearCookie(TOKEN_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export function getUserIdFromRequest(request) {
  const token = request.cookies?.[TOKEN_NAME];
  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return payload.sub;
  } catch (error) {
    return null;
  }
}
