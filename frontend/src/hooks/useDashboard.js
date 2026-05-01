import { useState, useCallback } from "react";
import { getTasksConProgreso, getProgresoObra, getFlujoPorMes } from "../api/api.js";

export const useDashboard = () => {
  const [obraAbiertaId, setObraAbiertaId] = useState(null);
  const [detalle, setDetalle] = useState({
    tasks: [],
    progreso: null,
    flujo: [],
    loading: false
  });

  const cargarDetalleObra = useCallback(async (id) => {
    if (!id) {
      setDetalle({ tasks: [], progreso: null, flujo: [], loading: false });
      return;
    }

    setDetalle(prev => ({ ...prev, loading: true }));
    try {
      const [tasks, progreso, flujo] = await Promise.all([
        getTasksConProgreso(id),
        getProgresoObra(id),
        getFlujoPorMes(id)
      ]);

      setDetalle({ tasks, progreso, flujo, loading: false });
    } catch (err) {
      console.error("Error al cargar dashboard:", err);
      setDetalle(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const seleccionarObra = (id) => {
    const nuevoId = obraAbiertaId === id ? null : id;
    setObraAbiertaId(nuevoId);
    cargarDetalleObra(nuevoId);
  };

  return {
    obraAbiertaId,
    ...detalle,
    seleccionarObra,
    refrescarDashboard: () => cargarDetalleObra(obraAbiertaId)
  };
};