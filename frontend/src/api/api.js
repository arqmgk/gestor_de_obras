const API = "http://localhost:8000/api";

// ── helper: fetch con token ───────────────────────
const authFetch = (url, options = {}) => {
  const token = localStorage.getItem("token");
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  }).then((r) => r.json());
};

// ── AUTH (sin token) ──────────────────────────────
export const login = (data) =>
  fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const register = (data) =>
  fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());

// ── OBRAS ─────────────────────────────────────────
export const getObras = () => authFetch(`${API}/obras`);
export const getObraById = (id) => authFetch(`${API}/obras/${id}`);
export const createObra = (data) => authFetch(`${API}/obras`, { method: "POST", body: JSON.stringify(data) });
export const updateObra = (id, data) => authFetch(`${API}/obras/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteObra = (id) => authFetch(`${API}/obras/${id}`, { method: "DELETE" });
export const getProgresoObra = (id) => authFetch(`${API}/obras/${id}/progreso`);
export const getTasksConProgreso = (obraId) => authFetch(`${API}/obras/${obraId}/tasks`);

// ── TASKS ─────────────────────────────────────────
export const getTasks = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return authFetch(`${API}/tasks${qs ? "?" + qs : ""}`);
};
export const getTask = (id) => authFetch(`${API}/tasks/${id}`);
export const createTask = (data) => authFetch(`${API}/tasks`, { method: "POST", body: JSON.stringify(data) });
export const updateTask = (id, data) => authFetch(`${API}/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteTask = (id) => authFetch(`${API}/tasks/${id}`, { method: "DELETE" });
export const getProgresoTask = (id) => authFetch(`${API}/tasks/${id}/progreso`);

// ── MEDICIONES ────────────────────────────────────
export const getMediciones = (taskId) => authFetch(`${API}/tasks/${taskId}/mediciones`);
export const addMedicion = (taskId, data) => authFetch(`${API}/tasks/${taskId}/mediciones`, { method: "POST", body: JSON.stringify(data) });
