import { useEffect, useState } from "react";
import { getObras } from "../api/api";

export default function useObras() {
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      const data = await getObras();
      setObras(data);
    } finally {
      setLoading(false);
    }
  };

  return {
    obras,
    setObras,
    loading,
    cargar,
  };
}