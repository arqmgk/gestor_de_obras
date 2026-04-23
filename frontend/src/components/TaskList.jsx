import { useEffect, useState } from "react";
import { getTasks, getProgreso } from "../api/api";
import ProgresoBar from "./ProgresoBar";

export default function TaskList({ onSelect }) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await getTasks();
console.log(data);

      const withProgress = await Promise.all(
        data.map(async (t) => {
          const prog = await getProgreso(t.id);
          return { ...t, progreso: prog.progreso };
        })
      );

      setTasks(withProgress);
    };


    load();
  }, []);

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
