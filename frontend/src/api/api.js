// src/api/api.js

const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// ── HELPER: FETCH CON TOKEN Y MANEJO DE ERRORES ────────────────
const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // Si enviamos FormData (fotos), el navegador pone el boundary automáticamente
  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  const response = await fetch(url, { ...options, headers });

  // Manejo de sesión expirada
  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login"; 
    return { error: "Sesión expirada" };
  }

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || "Error en la petición");
  }

  return data;
};

// ── AUTH ──────────────────────────────────────────────────────
export const login = async (credentials) => {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Credenciales incorrectas");
  return data;
};

// ── OBRAS (C.R.U.D) ───────────────────────────────────────────
export const getObras = () => authFetch(`${API}/obras`);
export const getObraById = (id) => authFetch(`${API}/obras/${id}`);
export const createObra = (data) => authFetch(`${API}/obras`, { method: "POST", body: JSON.stringify(data) });
export const updateObra = (id, data) => authFetch(`${API}/obras/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteObra = (id) => authFetch(`${API}/obras/${id}`, { method: "DELETE" });

// ── DASHBOARD & ANALYTICS ─────────────────────────────────────
export const getProgresoObra = (id) => authFetch(`${API}/obras/${id}/progreso`);
export const getFlujoPorMes = (id) => authFetch(`${API}/obras/${id}/flujo`);
export const getTasksConProgreso = (id) => authFetch(`${API}/obras/${id}/tasks`);

// ── TASKS & PAGOS ─────────────────────────────────────────────
export const updateTask = (id, data) => authFetch(`${API}/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const getPagos = (taskId) => authFetch(`${API}/tasks/${taskId}/pagos`);
export const addPago = (taskId, data) => authFetch(`${API}/tasks/${taskId}/pagos`, { method: "POST", body: JSON.stringify(data) });
export const marcarPagado = (taskId, pagoId, data = {}) => 
  authFetch(`${API}/tasks/${taskId}/pagos/${pagoId}/pagar`, { method: "PATCH", body: JSON.stringify(data) });

// ── PARTES DIARIOS & PERSONAS ─────────────────────────────────
export const getParte = (obraId, fecha) => authFetch(`${API}/obras/${obraId}/partes/${fecha}`);
export const updateParte = (parteId, data) => authFetch(`${API}/partes/${parteId}`, { method: "PUT", body: JSON.stringify(data) });
export const addPersona = (parteId, data) => authFetch(`${API}/partes/${parteId}/personas`, { method: "POST", body: JSON.stringify(data) });
export const deletePersona = (parteId, personaId) => authFetch(`${API}/partes/${parteId}/personas/${personaId}`, { method: "DELETE" });

// ── CONTACTOS ─────────────────────────────────────────────────
export const getContactos = (obraId) => authFetch(`${API}/contactos/obra/${obraId}`);
export const addContacto = (obraId, data) => authFetch(`${API}/contactos/obra/${obraId}`, { method: "POST", body: JSON.stringify(data) });
export const updateContacto = (id, data) => authFetch(`${API}/contactos/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteContacto = (id) => authFetch(`${API}/contactos/${id}`, { method: "DELETE" });

// ── FOTOS ─────────────────────────────────────────────────────
export const getFotos = (taskId) => authFetch(`${API}/fotos/task/${taskId}`);
export const getFotosByObra = (obraId) => authFetch(`${API}/fotos/obra/${obraId}`);
export const deleteFoto = (taskId, fotoId) => authFetch(`${API}/fotos/task/${taskId}/${fotoId}`, { method: "DELETE" });

export const subirFoto = (taskId, file, metadata = {}) => {
  const form = new FormData();
  form.append('foto', file);
  Object.keys(metadata).forEach(key => {
    if (metadata[key]) form.append(key, metadata[key]);
  });

  return authFetch(`${API}/fotos/task/${taskId}`, {
    method: 'POST',
    body: form,
  });
};

// ── PDFS (URLs ESTÁTICAS) ──────────────────────────────────────
export const urlCertificadoTask = (taskId, pagoId) => `${API}/pdf/certificado/task/${taskId}/pago/${pagoId}`;
export const urlCertificadoObra = (obraId) => `${API}/pdf/certificado/obra/${obraId}`;

// ── MEDICIONES (AVANCE DE OBRA) ──────────────────────────────

// Obtener todas las mediciones de una tarea específica
export const getMediciones = (taskId) => 
  authFetch(`${API}/mediciones/task/${taskId}`);

// Registrar una nueva medición (avance de item)
export const addMedicion = (taskId, data) => 
  authFetch(`${API}/mediciones/task/${taskId}`, { 
    method: "POST", 
    body: JSON.stringify(data) 
  });

// Obtener el progreso acumulado de una tarea
export const getProgresoTask = (taskId) => 
  authFetch(`${API}/tasks/${taskId}/progreso`);

// Eliminar una medición (en caso de error de carga)
export const deleteMedicion = (taskId, medicionId) => 
  authFetch(`${API}/mediciones/task/${taskId}/${medicionId}`, { 
    method: "DELETE" 
  });