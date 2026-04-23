const API = "http://localhost:8000/api";

export const getTasks = async () => {
  const res = await fetch(`${API}/tasks`);
  return res.json();
};

export const getProgreso = async (id) => {
  const res = await fetch(`${API}/tasks/${id}/progreso`);
  return res.json();
};

export const getMediciones = async (id) => {
  const res = await fetch(`${API}/tasks/${id}/mediciones`);
  return res.json();
};

export const addMedicion = async (id, data) => {
  const res = await fetch(`${API}/tasks/${id}/mediciones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

