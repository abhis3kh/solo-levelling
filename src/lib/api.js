const TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("x-timezone", TIME_ZONE);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(path, {
    credentials: "include",
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 204) {
    return null;
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || "Request failed.");
  }

  return payload;
}

export function getSession() {
  return apiRequest("/api/auth/session");
}

export function registerUser(body) {
  return apiRequest("/api/auth/register", {
    method: "POST",
    body,
  });
}

export function loginUser(body) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body,
  });
}

export function logoutUser() {
  return apiRequest("/api/auth/logout", {
    method: "POST",
  });
}

export function createQuest(body) {
  return apiRequest("/api/quests", {
    method: "POST",
    body,
  });
}

export function updateQuestProgress(questId, progress) {
  return apiRequest(`/api/quests/${questId}/progress`, {
    method: "PATCH",
    body: { progress },
  });
}

export function deleteQuest(questId) {
  return apiRequest(`/api/quests/${questId}`, {
    method: "DELETE",
  });
}
