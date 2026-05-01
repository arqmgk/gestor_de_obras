import { useEffect, useState } from "react";
import { getTasks, getProgreso } from "../../api/api";
import ProgresoBar from "./ProgresoBar";

export default function TaskList({ obraId, onSelect }) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await getTasksWithProgreso(obraId);
      setTasks(data);
    };

    load();
  }, [obraId]);

  return (
    <div>
      {tasks.map((t) => (
        <div key={t.id} onClick={() => onSelect(t)}>
          <h4>{t.titulo}</h4>
          <ProgresoBar progreso={t.progreso} />
        </div>
      ))}
    </div>
  );
}