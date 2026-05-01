import { useState, useEffect, useMemo } from "react";
import { getObras, createObra, updateObra, deleteObra } from "../api/api.js";

export const useObras = () => {
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  const cargarObras = async () => {
    try {
      setLoading(true);
      const data = await getObras();
      setObras(data || []);
    } catch (err) {
      console.error("Error al cargar obras:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarObras();
  }, []);

  const obrasFiltradas = useMemo(() => {
    const term = busqueda.toLowerCase();
    return obras.filter(o => 
      o.nombre.toLowerCase().includes(term) || 
      (o.direccion || "").toLowerCase().includes(term)
    );
  }, [obras, busqueda]);

  const guardarObra = async (editandoId, payload) => {
    const res = editandoId 
      ? await updateObra(editandoId, payload) 
      : await createObra(payload);
    
    if (!res?.error) await cargarObras();
    return res;
  };

  const eliminarObra = async (id) => {
    await deleteObra(id);
    await cargarObras();
  };

  return {
    obras,
    obrasFiltradas,
    loading,
    busqueda,
    setBusqueda,
    guardarObra,
    eliminarObra,
    refrescar: cargarObras
  };
};