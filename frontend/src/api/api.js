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

// ── PDF ───────────────────────────────────────────────────────────────────────
export const urlCertificadoTask = (taskId, pagoId) =>
  `${API}/pdf/certificado/task/${taskId}/pago/${pagoId}`;
export const urlCertificadoObra = (obraId) =>
  `${API}/pdf/certificado/obra/${obraId}`;
export const getPagos     = (taskId) => authFetch(`${API}/tasks/${taskId}/pagos`);
export const addPago      = (taskId, data) => authFetch(`${API}/tasks/${taskId}/pagos`, { method: "POST", body: JSON.stringify(data) });
export const marcarPagado = (taskId, pagoId, data = {}) => authFetch(`${API}/tasks/${taskId}/pagos/${pagoId}/pagar`, { method: "PATCH", body: JSON.stringify(data) });
export const deletePago   = (taskId, pagoId) => authFetch(`${API}/tasks/${taskId}/pagos/${pagoId}`, { method: "DELETE" });
// ── PARTE DIARIO ──────────────────────────────────────────────────────────────
export const getParte        = (obraId, fecha) => authFetch(`${API}/partes/obra/${obraId}${fecha ? `?fecha=${fecha}` : ''}`);
export const getPartesHistorial = (obraId) => authFetch(`${API}/partes/obra/${obraId}/historial`);
export const updateParte     = (parteId, data) => authFetch(`${API}/partes/${parteId}`, { method: "PATCH", body: JSON.stringify(data) });
export const addPersona      = (parteId, data) => authFetch(`${API}/partes/${parteId}/personas`, { method: "POST", body: JSON.stringify(data) });
export const deletePersona   = (parteId, personaId) => authFetch(`${API}/partes/${parteId}/personas/${personaId}`, { method: "DELETE" });

// ── CONTACTOS ─────────────────────────────────────────────────────────────────
export const getContactos    = (obraId) => authFetch(`${API}/contactos/obra/${obraId}`);
export const addContacto     = (obraId, data) => authFetch(`${API}/contactos/obra/${obraId}`, { method: "POST", body: JSON.stringify(data) });
export const updateContacto  = (id, data) => authFetch(`${API}/contactos/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteContacto  = (id) => authFetch(`${API}/contactos/${id}`, { method: "DELETE" });

// ── FLUJO DE INVERSIÓN ────────────────────────────────────────────────────────
export const getFlujoPorMes = (obraId) => authFetch(`${API}/obras/${obraId}/flujo`);

// ── ÍNDICES CAC ───────────────────────────────────────────────────────────────
export const getIndices       = ()         => authFetch(`${API}/indices`);
export const getUltimosIndices = ()        => authFetch(`${API}/indices/ultimos`);
export const addIndice        = (data)     => authFetch(`${API}/indices`,      { method: "POST",   body: JSON.stringify(data) });
export const deleteIndice     = (id)       => authFetch(`${API}/indices/${id}`, { method: "DELETE" });
export const aplicarCoeficiente = (data)  => authFetch(`${API}/indices/aplicar`, { method: "POST", body: JSON.stringify(data) });

// ── FOTOS ─────────────────────────────────────────────────────────────────────
export const getFotos       = (taskId) => authFetch(`${API}/fotos/task/${taskId}`);
export const getFotosByObra = (obraId) => authFetch(`${API}/fotos/obra/${obraId}`);
export const deleteFoto     = (taskId, fotoId) => authFetch(`${API}/fotos/task/${taskId}/${fotoId}`, { method: "DELETE" });

export const subirFoto = async (taskId, file, { latitud, longitud, descripcion, timestamp } = {}) => {
  const token = localStorage.getItem('token');
  const form  = new FormData();
  form.append('foto', file);
  if (latitud)     form.append('latitud',     latitud);
  if (longitud)    form.append('longitud',    longitud);
  if (descripcion) form.append('descripcion', descripcion);
  if (timestamp)   form.append('timestamp',   timestamp);

  const res = await fetch(`${API}/fotos/task/${taskId}`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${token}` },
    body:    form,
    // NO incluir Content-Type — el browser lo pone con el boundary automático
  });
  return res.json();
};