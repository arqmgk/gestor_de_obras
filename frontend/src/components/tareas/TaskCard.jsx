
export default function TaskCard({
  task,
  certificados,
  fotos,
  onEdit,
  onDelete,
}) {
  return (
    <div>
      {obraTasks.map(t => {
                const certAbierto = taskCertAbierta === t.id;
                const certs = certificados[t.id] || [];
                const totalCertificado = certs.reduce((s, c) => s + Number(c.monto), 0);
                const totalPagado = certs.filter(c => c.estado === "pagado").reduce((s, c) => s + Number(c.monto), 0);
                const presupuesto = t.precio_unitario && t.cantidad_total ? Number(t.precio_unitario) * Number(t.cantidad_total) : null;
                const fs = FECHA_STYLE[fechaStatus(t)];
                const desvios = calcDesviosTask(t, certs);

                return (
                  <div key={t.id} style={{ ...card, marginBottom: "8px", border: fs.border }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                          <strong style={{ color: "#e8e8e8", fontSize: "13px" }}>{t.titulo}</strong>
                          {t.prioridad && <span style={{ ...badge, background: prioColor[t.prioridad] + "33", color: prioColor[t.prioridad] }}>{t.prioridad}</span>}
                          <span style={{ ...badge, background: "#222", color: "#888" }}>{t.estado}</span>
                          {presupuesto && <span style={{ ...badge, background: "#0d1a2a", color: "#60a5fa" }}>${presupuesto.toLocaleString("es-AR", { minimumFractionDigits: 0 })}</span>}
                          {fs.label && <span style={{ fontSize: "11px", fontWeight: "600", color: fs.label.color }}>{fs.label.text}</span>}
                          {desvios.plazo && desvios.plazo.nivel !== 'ok' && <span style={{ ...desvBadge, background: NIVEL_COLOR[desvios.plazo.nivel].bg, color: NIVEL_COLOR[desvios.plazo.nivel].color }}>⏱ {desvios.plazo.desvio.toFixed(0)}%</span>}
                          {desvios.costo && <span style={{ ...desvBadge, background: NIVEL_COLOR[desvios.costo.nivel].bg, color: NIVEL_COLOR[desvios.costo.nivel].color }}>💰 +{desvios.costo.desvio.toFixed(0)}%</span>}
                          {desvios.cantidad && <span style={{ ...desvBadge, background: NIVEL_COLOR[desvios.cantidad.nivel].bg, color: NIVEL_COLOR[desvios.cantidad.nivel].color }}>📐 +{desvios.cantidad.porcentaje}%</span>}
                        </div>
                        {t.responsable && <p style={{ color: "#666", margin: "0 0 4px", fontSize: "12px" }}>👤 {t.responsable}</p>}
                        <p style={{ color: "#777", margin: "0 0 6px", fontSize: "12px" }}>
                          {Number(t.ejecutado).toFixed(2)} / {Number(t.cantidad_total).toFixed(2)} {t.unidad}
                          {t.precio_unitario && <span style={{ color: "#555", marginLeft: "8px" }}>· ${Number(t.precio_unitario).toLocaleString("es-AR")} / {t.unidad}</span>}
                        </p>
                        <ProgresoBar progreso={t.progreso} />
                      </div>
                      <div style={{ display: "flex", gap: "2px", marginLeft: "8px" }}>
                        <button onClick={() => toggleCertificados(t)} title="Certificados"
                          style={{ ...iconBtn, color: certAbierto ? "#60a5fa" : "#666", fontSize: "14px" }}>📋</button>
                        <button onClick={() => { setEditandoTask(t); setMostrarTaskForm(true); }} style={iconBtn}>✏️</button>
                        <button onClick={() => eliminarTask(t.id)} style={{ ...iconBtn, color: "#e74c3c" }}>✕</button>
                      </div>
                    </div>

                    {certAbierto && (
                      <div style={{ marginTop: "12px", borderTop: "1px solid #222", paddingTop: "12px" }}>
                        <CertificadoForm task={t} onSuccess={() => recargarCertificados(t.id, o.id)} />

                        {certs.length > 0 && (
                          <>
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "14px", marginBottom: "8px" }}>
                              <span style={{ color: "#666", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Historial ({certs.length})</span>
                              <span style={{ color: "#777", fontSize: "11px" }}>
                                Certificado: <span style={{ color: "#60a5fa" }}>${totalCertificado.toLocaleString("es-AR", { minimumFractionDigits: 0 })}</span>
                                {totalPagado > 0 && <span style={{ color: "#4ade80", marginLeft: "6px" }}>· Pagado: ${totalPagado.toLocaleString("es-AR", { minimumFractionDigits: 0 })}</span>}
                              </span>
                            </div>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                              <thead>
                                <tr>
                                  {["Emisión","Tipo","Cant.","Monto","Estado","Pago",""].map(h => (
                                    <th key={h} style={{ textAlign: "left", color: "#555", padding: "4px 6px", borderBottom: "1px solid #222", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "10px" }}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {certs.map(c => (
                                  <tr key={c.id} style={{ borderBottom: "1px solid #1a1a1a" }}>
                                    <td style={tdS}>{new Date(c.fecha_emision).toLocaleDateString("es-AR")}</td>
                                    <td style={tdS}><span style={{ ...tipoBadge, ...tipoColor[c.tipo] }}>{c.tipo}</span></td>
                                    <td style={tdS}>{Number(c.cantidad_certificada).toFixed(2)} {t.unidad}</td>
                                    <td style={{ ...tdS, color: "#4ade80" }}>${Number(c.monto).toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
                                    <td style={tdS}><span style={{ ...tipoBadge, ...(c.estado === "pagado" ? estadoPagado : estadoPendiente) }}>{c.estado}</span></td>
                                    <td style={tdS}>
                                      {c.estado === "pagado"
                                        ? <span style={{ color: "#555", fontSize: "11px" }}>{new Date(c.fecha_pago).toLocaleDateString("es-AR")}</span>
                                        : <button onClick={() => handleMarcarPagado(t, o.id, c.id)} style={markPaidBtn}>Marcar pagado</button>
                                      }
                                    </td>
                                    <td style={tdS}>
                                      <button onClick={() => handleEliminarCert(t, o.id, c.id)} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: "12px" }}>✕</button>
                                      <button onClick={() => openPDF(urlCertificadoTask(t.id, c.id))} title="PDF" style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontSize: "12px", marginLeft: "4px" }}>📄</button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </>
                        )}
                        {certs.length === 0 && <p style={{ color: "#555", fontSize: "12px", margin: "12px 0 0" }}>Sin certificados emitidos.</p>}

                        <div style={{ marginTop: "16px", borderTop: "1px solid #222", paddingTop: "12px" }}>
                          <p style={{ color: "#666", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px" }}>Fotos ({(fotos[t.id] || []).length})</p>
                          <FotoUploader task={t} fotos={fotos[t.id] || []}
                            onFotosChange={(nuevas) => setFotos(prev => ({ ...prev, [t.id]: nuevas }))} readonly={true} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

    </div>
  );
}