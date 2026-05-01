
export default function ObraDashboard({
  obra,
  progreso,
  tasks,
  certificados,
  fotos,
  flujoData,
}) {
  return (
<>

{obraAbierta && (() => {
          const o = obras.find(x => x.id === obraAbierta);
          if (!o) return null;
          const p         = progreso[o.id];
          const obraTasks = tasks[o.id] || [];
          const vencidas  = obraTasks.filter(t => ["vencida_leve","vencida_grave"].includes(fechaStatus(t))).length;

          return (
            <>
              {/* Header obra */}
              <div style={obraHeader}>
                <div>
                  <h2 style={obraTitulo}>{o.nombre}</h2>
                  {o.direccion && <p style={obraDireccion}>{o.direccion}</p>}
                </div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <button onClick={() => openPDF(urlCertificadoObra(o.id))} style={pdfBtn}>📄 PDF Resumen</button>
                  <button onClick={(e) => { e.stopPropagation(); setContactosAbierto(contactosAbierto === o.id ? null : o.id); }}
                    style={{ ...pdfBtn, color: contactosAbierto === o.id ? "#ef4444" : "#888" }}>
                    📞 Contactos
                  </button>
                </div>
              </div>

              {/* Contactos */}
              {contactosAbierto === o.id && (
                <div style={{ ...card, marginBottom: "16px" }}>
                  <Contactos obraId={o.id} readonly={false} />
                </div>
              )}

              {/* Progreso */}
              {loadingTasks[o.id] && <SkeletonProgreso />}
              {!loadingTasks[o.id] && p && (
                <div style={{ ...card, marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={sectionTitle}>Progreso físico</span>
                    <span style={{ color: barColor(p.general?.progreso), fontWeight: "700", fontSize: "16px" }}>{pct(p.general?.progreso)}%</span>
                  </div>
                  <div style={{ background: "#222", borderRadius: "4px", height: "10px", overflow: "hidden", marginBottom: "12px" }}>
                    <div style={{ background: barColor(p.general?.progreso), height: "100%", width: `${pct(p.general?.progreso)}%`, transition: "width 0.4s", borderRadius: "4px" }} />
                  </div>

                  {p.general?.presupuesto_total > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                      {[
                        ["Presupuesto", `$${Number(p.general.presupuesto_total).toLocaleString("es-AR", { minimumFractionDigits: 0 })}`, "#c0c0c0"],
                        ["Ejecutado $", `$${Number(p.general.valor_ejecutado ?? 0).toLocaleString("es-AR", { minimumFractionDigits: 0 })}`, barColor(p.general.progreso)],
                        ["Pagado", `$${Number(p.general.total_pagado ?? 0).toLocaleString("es-AR", { minimumFractionDigits: 0 })}`, "#60a5fa"],
                      ].map(([label, val, color]) => (
                        <div key={label} style={kpiBox}>
                          <p style={kpiLabel}>{label}</p>
                          <p style={{ ...kpiVal, color }}>{val}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {p.unidades && p.unidades.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                      {p.unidades.map(u => (
                        <div key={u.unidad} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ color: "#888", fontSize: "11px", width: "36px", textAlign: "right", flexShrink: 0 }}>{u.unidad}</span>
                          <div style={{ flex: 1, background: "#222", borderRadius: "2px", height: "5px", overflow: "hidden" }}>
                            <div style={{ background: barColor(u.progreso), height: "100%", width: `${pct(u.progreso)}%`, transition: "width 0.4s" }} />
                          </div>
                          <span style={{ color: barColor(u.progreso), fontSize: "11px", width: "38px" }}>{pct(u.progreso)}%</span>
                          <span style={{ color: "#555", fontSize: "10px" }}>{Number(u.ejecutado).toFixed(1)}/{Number(u.total).toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Desvíos */}
              {obraTasks.length > 0 && (() => {
                const resumen = calcDesviosObra(obraTasks, certificados);
                return <ResumenDesvios resumen={resumen} />;
              })()}

              {/* Flujo */}
              <FlujoPorMes obraId={o.id} />

              {/* Tareas — toolbar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "16px 0 10px", flexWrap: "wrap", gap: "8px" }}>
                <span style={sectionTitle}>Tareas ({obraTasks.length}){vencidas > 0 && <span style={vencBadge}> ⚠ {vencidas}</span>}</span>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <ExportButtons tasks={obraTasks} obra={o} certificados={certificados} flujo={flujoData[o.id]} />
                  <button onClick={() => setMostrarActPrecios(v => !v)} style={{ ...pdfBtn, color: mostrarActPrecios ? "#4ade80" : "#888" }}>
                    💱 Precios
                  </button>
                  <button onClick={() => setMostrarBulkEdit(v => !v)} style={{ ...pdfBtn, color: mostrarBulkEdit ? "#60a5fa" : "#888" }}>
                    ✏️ Bulk edit
                  </button>
                  <button onClick={() => { setMostrarTaskForm(true); setEditandoTask(null); }} style={btnP}>+ Tarea</button>
                </div>
              </div>

              {/* Actualizar precios */}
              {mostrarActPrecios && (
                <div style={{ marginBottom: "16px" }}>
                  <ActualizarPrecios tasks={obraTasks} obraId={o.id} onUpdated={() => recargarTasks(o.id)} />
                </div>
              )}

              {/* Bulk edit */}
              {mostrarBulkEdit && (
                <div style={{ marginBottom: "16px" }}>
                  <BulkEdit tasks={obraTasks} obraId={o.id}
                    onDone={() => { setMostrarBulkEdit(false); recargarTasks(o.id); }}
                    onCancel={() => setMostrarBulkEdit(false)} />
                </div>
              )}

              {mostrarTaskForm && (
                <TaskForm obraId={o.id} task={editandoTask} onSuccess={onTaskGuardada}
                  onCancel={() => { setMostrarTaskForm(false); setEditandoTask(null); }} />
              )}

              {loadingTasks[o.id] && <SkeletonTaskList count={3} />}

              {!loadingTasks[o.id] && obraTasks.length === 0 && !mostrarTaskForm && (
                <p style={{ color: "#666", fontSize: "13px" }}>Sin tareas. Agregá una con + Tarea.</p>
              )}

              
            </>
          );
        })()}
        </>

         );
}