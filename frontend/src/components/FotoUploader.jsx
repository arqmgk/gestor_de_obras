import { useState, useRef } from "react";
import { subirFoto, getFotos, deleteFoto } from "../api/api";

export default function FotoUploader({ task, fotos = [], onFotosChange, readonly = false }) {
  const inputRef              = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError]     = useState(null);
  const [descripcion, setDesc] = useState("");
  const [preview, setPreview] = useState(null);
  const [fileSeleccionado, setFile] = useState(null);
  const [geoStatus, setGeoStatus] = useState(null); // null | 'obteniendo' | 'ok' | 'error'
  const [coords, setCoords]   = useState(null);
  const [fotoAmpliada, setFotoAmpliada] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError(null);
    setFile(file);

    // Preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    // Obtener GPS automáticamente
    setGeoStatus('obteniendo');
    setCoords(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGeoStatus('ok');
        },
        () => setGeoStatus('error'),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setGeoStatus('error');
    }
  };

  const handleSubir = async () => {
    if (!fileSeleccionado) return;
    setUploading(true); setError(null);
    try {
      const res = await subirFoto(task.id, fileSeleccionado, {
        latitud:     coords?.lat,
        longitud:    coords?.lng,
        descripcion: descripcion || null,
        timestamp:   new Date().toISOString(),
      });
      if (res.error) { setError(res.error); }
      else {
        // Recargar fotos
        const nuevas = await getFotos(task.id);
        onFotosChange && onFotosChange(nuevas);
        // Reset
        setFile(null); setPreview(null); setDesc("");
        setCoords(null); setGeoStatus(null);
        if (inputRef.current) inputRef.current.value = "";
      }
    } catch { setError("Error de conexión"); }
    finally { setUploading(false); }
  };

  const handleDelete = async (fotoId) => {
    if (!confirm("¿Eliminar esta foto?")) return;
    await deleteFoto(task.id, fotoId);
    const nuevas = await getFotos(task.id);
    onFotosChange && onFotosChange(nuevas);
  };

  const cancelar = () => {
    setFile(null); setPreview(null); setDesc("");
    setCoords(null); setGeoStatus(null); setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      {/* GALERÍA */}
      {fotos.length > 0 && (
        <div style={galeria}>
          {fotos.map(f => (
            <div key={f.id} style={fotoWrap} onClick={() => setFotoAmpliada(f)}>
              <img src={f.url} alt={f.descripcion || "foto"} style={fotoThumb} />
              <div style={fotoMeta}>
                <span style={{ color: "#888", fontSize: "10px" }}>
                  {new Date(f.timestamp).toLocaleDateString("es-AR")}
                </span>
                {f.latitud && (
                  <span style={{ color: "#2563eb", fontSize: "10px" }}>📍</span>
                )}
              </div>
              {!readonly && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(f.id); }}
                  style={deleteFotoBtn}>✕</button>
              )}
            </div>
          ))}
        </div>
      )}

      {fotos.length === 0 && <p style={dim}>Sin fotos registradas.</p>}

      {/* UPLOAD — solo si no es readonly */}
      {!readonly && (
        <>
          {!preview ? (
            <div>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                capture="environment"  // abre cámara trasera en móvil
                onChange={handleFileChange}
                style={{ display: "none" }}
                id={`foto-input-${task.id}`}
              />
              <label htmlFor={`foto-input-${task.id}`} style={camaraBtn}>
                📷 Sacar foto
              </label>
            </div>
          ) : (
            <div style={previewWrap}>
              <img src={preview} alt="preview" style={previewImg} />

              {/* GPS status */}
              <div style={gpsRow}>
                {geoStatus === 'obteniendo' && <span style={{ color: "#f59e0b", fontSize: "12px" }}>⏱ Obteniendo ubicación...</span>}
                {geoStatus === 'ok'         && <span style={{ color: "#4ade80", fontSize: "12px" }}>📍 Ubicación capturada ({coords.lat.toFixed(5)}, {coords.lng.toFixed(5)})</span>}
                {geoStatus === 'error'      && <span style={{ color: "#ef4444", fontSize: "12px" }}>⚠ Sin ubicación — se guardará sin GPS</span>}
              </div>

              {/* Descripción opcional */}
              <input
                type="text"
                placeholder="Descripción (opcional) — ej: frente sur, 2do piso"
                value={descripcion}
                onChange={e => setDesc(e.target.value)}
                style={descInput}
              />

              {error && <p style={errTxt}>{error}</p>}

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={handleSubir}
                  disabled={uploading || geoStatus === 'obteniendo'}
                  style={subirBtn}>
                  {uploading ? "Subiendo..." : "Subir foto"}
                </button>
                <button onClick={cancelar} style={cancelBtn}>Cancelar</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* LIGHTBOX */}
      {fotoAmpliada && (
        <div style={lightboxOverlay} onClick={() => setFotoAmpliada(null)}>
          <div style={lightboxInner} onClick={e => e.stopPropagation()}>
            <img src={fotoAmpliada.url} alt={fotoAmpliada.descripcion || "foto"} style={lightboxImg} />
            <div style={{ padding: "10px 14px" }}>
              {fotoAmpliada.descripcion && (
                <p style={{ color: "#e0e0e0", fontSize: "13px", margin: "0 0 4px" }}>{fotoAmpliada.descripcion}</p>
              )}
              <p style={{ color: "#555", fontSize: "11px", margin: 0 }}>
                {new Date(fotoAmpliada.timestamp).toLocaleString("es-AR")}
                {fotoAmpliada.subida_por_nombre && ` · ${fotoAmpliada.subida_por_nombre}`}
                {fotoAmpliada.latitud && ` · 📍 ${parseFloat(fotoAmpliada.latitud).toFixed(5)}, ${parseFloat(fotoAmpliada.longitud).toFixed(5)}`}
              </p>
            </div>
            <button onClick={() => setFotoAmpliada(null)} style={closeLightbox}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ESTILOS ───────────────────────────────────────────────────────────────────
const galeria      = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px", marginBottom: "12px" };
const fotoWrap     = { position: "relative", aspectRatio: "1", borderRadius: "6px", overflow: "hidden", cursor: "pointer", background: "#1a1a1a" };
const fotoThumb    = { width: "100%", height: "100%", objectFit: "cover" };
const fotoMeta     = { position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.7))", padding: "4px 6px", display: "flex", justifyContent: "space-between", alignItems: "center" };
const deleteFotoBtn = { position: "absolute", top: "4px", right: "4px", background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", color: "#fff", cursor: "pointer", fontSize: "11px", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center" };
const camaraBtn    = { display: "block", width: "100%", boxSizing: "border-box", background: "#1a1a1a", border: "1px dashed #2a2a2a", borderRadius: "8px", color: "#555", cursor: "pointer", padding: "14px", fontSize: "15px", textAlign: "center" };
const previewWrap  = { background: "#111", border: "1px solid #1e1e1e", borderRadius: "8px", overflow: "hidden" };
const previewImg   = { width: "100%", maxHeight: "260px", objectFit: "cover", display: "block" };
const gpsRow       = { padding: "8px 12px" };
const descInput    = { width: "100%", boxSizing: "border-box", background: "#1a1a1a", border: "none", borderTop: "1px solid #1e1e1e", color: "#e0e0e0", padding: "12px", fontSize: "14px", outline: "none" };
const subirBtn     = { flex: 1, background: "#2563eb", border: "none", borderRadius: "0 0 0 8px", color: "#fff", cursor: "pointer", padding: "14px", fontWeight: "700", fontSize: "15px" };
const cancelBtn    = { background: "#1a1a1a", border: "none", borderRadius: "0 0 8px 0", color: "#555", cursor: "pointer", padding: "14px", fontSize: "14px" };
const errTxt       = { color: "#ef4444", fontSize: "12px", margin: "0", padding: "0 12px 8px" };
const dim          = { color: "#333", fontSize: "13px", margin: "0 0 10px" };
const lightboxOverlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" };
const lightboxInner   = { position: "relative", background: "#111", borderRadius: "10px", overflow: "hidden", maxWidth: "500px", width: "100%" };
const lightboxImg     = { width: "100%", maxHeight: "70vh", objectFit: "contain", display: "block" };
const closeLightbox   = { position: "absolute", top: "10px", right: "10px", background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", color: "#fff", cursor: "pointer", fontSize: "16px", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center" };
