const API = "http://localhost:8000/api";

// OBRAS
export const getObras = () => fetch(`${API}/obras`).then(r => r.json());
export const getObraById = (id) => fetch(`${API}/obras/${id}`).then(r => r.json());
export const createObra = (data) => fetch(`${API}/obras`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json());
export const updateObra = (id, data) => fetch(`${API}/obras/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json());
export const deleteObra = (id) => fetch(`${API}/obras/${id}`, { method: "DELETE" }).then(r => r.json());
export const getProgresoObra = (id) => fetch(`${API}/obras/${id}/progreso`).then(r => r.json());
export const getTasksConProgreso = (obraId) => fetch(`${API}/obras/${obraId}/tasks`).then(r => r.json());

// TASKS
export const getTasks = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return fetch(`${API}/tasks${qs ? "?" + qs : ""}`).then(r => r.json());
};
export const getTask = (id) => fetch(`${API}/tasks/${id}`).then(r => r.json());
export const createTask = (data) => fetch(`${API}/tasks`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json());
export const updateTask = (id, data) => fetch(`${API}/tasks/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json());
export const deleteTask = (id) => fetch(`${API}/tasks/${id}`, { method: "DELETE" }).then(r => r.json());
export const getProgresoTask = (id) => fetch(`${API}/tasks/${id}/progreso`).then(r => r.json());

// MEDICIONES
export const getMediciones = (taskId) => fetch(`${API}/tasks/${taskId}/mediciones`).then(r => r.json());
export const addMedicion = (taskId, data) => fetch(`${API}/tasks/${taskId}/mediciones`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json());
