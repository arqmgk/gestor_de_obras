// ── CÁLCULO DE DESVÍOS ────────────────────────────────────────────────────────

/**
 * Calcula los desvíos de una tarea individual
 * @param {object} task - tarea con progreso, ejecutado, cantidad_total, precio_unitario, fecha_inicio, fecha_fin
 * @param {array}  certs - certificados de la tarea (pagos)
 * @returns {object} { plazo, costo, cantidad }
 */
export function calcDesviosTask(task, certs = []) {
  const resultado = {
    plazo:    null,
    costo:    null,
    cantidad: null,
  };

  const progreso   = parseFloat(task.progreso)    || 0;
  const ejecutado  = parseFloat(task.ejecutado)   || 0;
  const total      = parseFloat(task.cantidad_total) || 0;
  const precioUnit = parseFloat(task.precio_unitario) || 0;
  const presupuesto = precioUnit * total;

  // ── DESVÍO DE PLAZO ────────────────────────────────────────────────────────
  if (task.fecha_inicio && task.fecha_fin && task.estado !== 'finalizada') {
    const inicio  = new Date(task.fecha_inicio); inicio.setHours(0,0,0,0);
    const fin     = new Date(task.fecha_fin);    fin.setHours(0,0,0,0);
    const hoy     = new Date();                  hoy.setHours(0,0,0,0);
    const duracion = (fin - inicio) / 86400000;
    const transcurrido = Math.min((hoy - inicio) / 86400000, duracion);

    if (duracion > 0 && transcurrido > 0) {
      const esperado = (transcurrido / duracion) * 100;
      const desvio   = progreso - esperado; // negativo = atrasado

      resultado.plazo = {
        esperado:     Math.round(esperado * 10) / 10,
        real:         Math.round(progreso * 10) / 10,
        desvio:       Math.round(desvio * 10) / 10,
        // severidad
        nivel: desvio >= 0        ? 'ok'
             : desvio >= -15      ? 'leve'
             : desvio >= -30      ? 'moderado'
             :                      'grave',
      };
    }
  }

  // ── DESVÍO DE CANTIDAD ─────────────────────────────────────────────────────
  if (total > 0) {
    const exceso = ejecutado - total;
    if (exceso > 0) {
      resultado.cantidad = {
        ejecutado,
        total,
        exceso:     Math.round(exceso * 100) / 100,
        porcentaje: Math.round((exceso / total) * 100 * 10) / 10,
        nivel: exceso / total <= 0.05 ? 'leve'
             : exceso / total <= 0.15 ? 'moderado'
             :                          'grave',
      };
    }
  }

  // ── DESVÍO DE COSTO ────────────────────────────────────────────────────────
  if (presupuesto > 0 && certs.length > 0) {
    const totalCertificado = certs.reduce((s, c) => s + parseFloat(c.monto), 0);
    const pctCertificado   = (totalCertificado / presupuesto) * 100;
    const desvio           = pctCertificado - progreso; // certificado más de lo que avanzó

    if (desvio > 5) { // tolerancia del 5%
      resultado.costo = {
        presupuesto,
        certificado:    Math.round(totalCertificado * 100) / 100,
        pctCertificado: Math.round(pctCertificado * 10) / 10,
        pctFisico:      Math.round(progreso * 10) / 10,
        desvio:         Math.round(desvio * 10) / 10,
        nivel: desvio <= 15 ? 'leve'
             : desvio <= 30 ? 'moderado'
             :                 'grave',
      };
    }
  }

  return resultado;
}

/**
 * Calcula el resumen de desvíos de una obra completa
 * @param {array} tasks  - tareas con progreso
 * @param {object} certs  - { taskId: [pagos] }
 * @param {object} progreso - respuesta de getProgresoObra
 */
export function calcDesviosObra(tasks, certs = {}, progreso = null) {
  const desviosTasks = tasks.map(t => ({
    task: t,
    desvios: calcDesviosTask(t, certs[t.id] || []),
  }));

  const conPlazo    = desviosTasks.filter(d => d.desvios.plazo !== null);
  const conCosto    = desviosTasks.filter(d => d.desvios.costo !== null);
  const conCantidad = desviosTasks.filter(d => d.desvios.cantidad !== null);

  const atrasadas   = conPlazo.filter(d => d.desvios.plazo.nivel !== 'ok');
  const sobrecosto  = conCosto;
  const excedidas   = conCantidad;

  // Nivel general de la obra
  const tieneGrave = [...atrasadas, ...sobrecosto, ...excedidas]
    .some(d => Object.values(d.desvios).some(v => v?.nivel === 'grave'));
  const tieneModerado = [...atrasadas, ...sobrecosto, ...excedidas]
    .some(d => Object.values(d.desvios).some(v => v?.nivel === 'moderado'));

  return {
    nivel:     tieneGrave ? 'grave' : tieneModerado ? 'moderado' : atrasadas.length > 0 ? 'leve' : 'ok',
    atrasadas: atrasadas.map(d => ({ ...d.task, desvio_plazo: d.desvios.plazo })),
    sobrecosto: sobrecosto.map(d => ({ ...d.task, desvio_costo: d.desvios.costo })),
    excedidas:  excedidas.map(d => ({ ...d.task, desvio_cantidad: d.desvios.cantidad })),
  };
}

// ── COLORES POR NIVEL ─────────────────────────────────────────────────────────
export const NIVEL_COLOR = {
  ok:       { bg: "#0d2a0d", color: "#4ade80", label: "En plazo"  },
  leve:     { bg: "#2a2a0d", color: "#facc15", label: "Leve"      },
  moderado: { bg: "#2a1a0d", color: "#f97316", label: "Moderado"  },
  grave:    { bg: "#2a0d0d", color: "#ef4444", label: "Grave"     },
};
