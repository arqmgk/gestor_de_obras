const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(BASE + path, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  get:    (path)        => request('GET',    path),
  post:   (path, body)  => request('POST',   path, body),
  put:    (path, body)  => request('PUT',    path, body),
  delete: (path)        => request('DELETE', path),
};

// ── Obras ──
export const obrasApi = {
  getAll:    (estado)  => api.get('/api/obras' + (estado ? `?estado=${estado}` : '')),
  getOne:    (id)      => api.get(`/api/obras/${id}`),
  getProgreso:(id)     => api.get(`/api/obras/${id}/progreso`),
  getTasks:  (id)      => api.get(`/api/obras/${id}/tasks`),
  create:    (data)    => api.post('/api/obras', data),
  update:    (id, data)=> api.put(`/api/obras/${id}`, data),
  delete:    (id)      => api.delete(`/api/obras/${id}`),
};

// ── Tasks ──
export const tasksApi = {
  getAll:      (obraId) => api.get('/api/tasks' + (obraId ? `?obraId=${obraId}` : '')),
  getOne:      (id)     => api.get(`/api/tasks/${id}`),
  getProgreso: (id)     => api.get(`/api/tasks/${id}/progreso`),
  getMediciones:(id)    => api.get(`/api/tasks/${id}/mediciones`),
  create:      (data)   => api.post('/api/tasks', data),
  update:      (id, data)=> api.put(`/api/tasks/${id}`, data),
  delete:      (id)     => api.delete(`/api/tasks/${id}`),
  addMedicion: (id, data)=> api.post(`/api/tasks/${id}/mediciones`, data),
};
