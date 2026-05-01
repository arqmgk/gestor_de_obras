import PDFDocument from 'pdfkit';
import pool from '../config/db.js';

// ── HELPERS ───────────────────────────────────────────────────────────────────

const fmt = (n) => Number(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtCant = (n) => Number(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
const fmtFecha = (d) => d ? new Date(d).toLocaleDateString('es-AR') : '—';

const COLORS = {
  primary:   '#1a1a2e',
  accent:    '#2563eb',
  light:     '#f8fafc',
  border:    '#e2e8f0',
  text:      '#1e293b',
  muted:     '#64748b',
  success:   '#16a34a',
  pending:   '#d97706',
};

const TIPO_LABEL = { anticipo: 'Anticipo', certificado: 'Certificado', final: 'Certificado Final' };
const ESTADO_LABEL = { pendiente: 'Pendiente de pago', pagado: 'Pagado' };

// ── MEMBRETE ──────────────────────────────────────────────────────────────────

function drawMembrete(doc, empresa, nroCert) {
  const W = doc.page.width;

  // Franja superior azul
  doc.rect(0, 0, W, 70).fill(COLORS.primary);

  // Nombre del estudio
  doc.font('Helvetica-Bold').fontSize(18).fillColor('#ffffff')
     .text(empresa?.nombre || 'Estudio de Arquitectura', 40, 20, { width: W - 200 });

  // Subtítulo
  doc.font('Helvetica').fontSize(9).fillColor('#94a3b8')
     .text('Sistema de Gestión de Obras', 40, 44);

  // Nro de certificado (derecha)
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#93c5fd')
     .text(`N° ${String(nroCert).padStart(4, '0')}`, W - 130, 16, { width: 90, align: 'right' });
  doc.font('Helvetica').fontSize(8).fillColor('#94a3b8')
     .text('CERTIFICADO', W - 130, 34, { width: 90, align: 'right' });

  doc.fillColor(COLORS.text);
  return 90; // y inicial después del membrete
}

// ── LÍNEA SEPARADORA ──────────────────────────────────────────────────────────

function hLine(doc, y, color = COLORS.border) {
  doc.moveTo(40, y).lineTo(doc.page.width - 40, y).strokeColor(color).lineWidth(0.5).stroke();
  return y + 8;
}

// ── BLOQUE DE DOS COLUMNAS ────────────────────────────────────────────────────

function twoCol(doc, y, leftItems, rightItems) {
  const W = doc.page.width;
  const colW = (W - 80) / 2;
  const startY = y;
  let lY = y, rY = y;

  leftItems.forEach(([label, value]) => {
    doc.font('Helvetica').fontSize(8).fillColor(COLORS.muted).text(label.toUpperCase(), 40, lY);
    doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.text).text(value || '—', 40, lY + 11, { width: colW - 10 });
    lY += 28;
  });

  rightItems.forEach(([label, value, color]) => {
    doc.font('Helvetica').fontSize(8).fillColor(COLORS.muted).text(label.toUpperCase(), 40 + colW, rY);
    doc.font('Helvetica-Bold').fontSize(10).fillColor(color || COLORS.text).text(value || '—', 40 + colW, rY + 11, { width: colW - 10 });
    rY += 28;
  });

  return Math.max(lY, rY) + 4;
}

// ── TABLA ─────────────────────────────────────────────────────────────────────

function drawTable(doc, y, headers, rows, colWidths) {
  const W = doc.page.width;
  const tableW = colWidths.reduce((a, b) => a + b, 0);
  const startX = 40;
  const ROW_H = 22;
  const HEAD_H = 26;

  // Header background
  doc.rect(startX, y, tableW, HEAD_H).fill('#1e3a5f');
  let x = startX;
  headers.forEach((h, i) => {
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#ffffff')
       .text(h, x + 6, y + 9, { width: colWidths[i] - 12, align: i > 1 ? 'right' : 'left' });
    x += colWidths[i];
  });
  y += HEAD_H;

  // Rows
  rows.forEach((row, ri) => {
    const bg = ri % 2 === 0 ? '#ffffff' : '#f8fafc';
    doc.rect(startX, y, tableW, ROW_H).fill(bg);

    // Border bottom
    doc.rect(startX, y + ROW_H - 0.5, tableW, 0.5).fill(COLORS.border);

    x = startX;
    row.forEach((cell, i) => {
      const isNum = i > 1;
      const color = cell?.color || COLORS.text;
      const text = cell?.text !== undefined ? cell.text : cell;
      doc.font('Helvetica').fontSize(9).fillColor(color)
         .text(String(text), x + 6, y + 7, { width: colWidths[i] - 12, align: isNum ? 'right' : 'left' });
      x += colWidths[i];
    });
    y += ROW_H;
  });

  // Outer border
  doc.rect(startX, y - rows.length * ROW_H - HEAD_H, tableW, rows.length * ROW_H + HEAD_H)
     .strokeColor(COLORS.border).lineWidth(0.5).stroke();

  return y + 8;
}

// ── BLOQUE MONTO TOTAL ────────────────────────────────────────────────────────

function montoBox(doc, y, label, monto, color = COLORS.accent) {
  const W = doc.page.width;
  doc.rect(W - 220, y, 180, 44).fill(COLORS.light).stroke();
  doc.font('Helvetica').fontSize(8).fillColor(COLORS.muted)
     .text(label.toUpperCase(), W - 214, y + 7, { width: 168 });
  doc.font('Helvetica-Bold').fontSize(16).fillColor(color)
     .text(`$ ${fmt(monto)}`, W - 214, y + 18, { width: 168, align: 'right' });
  return y + 56;
}

// ── PIE DE PÁGINA ─────────────────────────────────────────────────────────────

function drawFooter(doc, firmante) {
  const W = doc.page.width;
  const H = doc.page.height;
  const y = H - 80;

  hLine(doc, y, COLORS.border);

  // Línea de firma
  doc.moveTo(W - 220, y + 36).lineTo(W - 60, y + 36).strokeColor(COLORS.border).lineWidth(0.5).stroke();
  doc.font('Helvetica').fontSize(8).fillColor(COLORS.muted)
     .text(firmante || 'Firma y aclaración', W - 220, y + 40, { width: 160, align: 'center' });

  // Texto izquierdo
  doc.font('Helvetica').fontSize(7).fillColor(COLORS.muted)
     .text(`Emitido por Gestor de Obras · ${new Date().toLocaleDateString('es-AR')}`, 40, y + 40);
}

// ── ENDPOINT: CERTIFICADO POR TAREA ──────────────────────────────────────────

export const generarCertificadoTask = async (req, res, next) => {
  try {
    const taskId = Number(req.params.id);
    const pagoId = Number(req.params.pagoId);

    // Datos del certificado
    const certRes = await pool.query(
      `SELECT p.*, t.titulo, t.unidad, t.cantidad_total, t.precio_unitario,
              o.nombre AS obra_nombre, o.direccion AS obra_direccion,
              e.nombre AS empresa_nombre
       FROM pagos p
       JOIN tasks t ON t.id = p.task_id
       JOIN obras o ON o.id = t.obra_id
       LEFT JOIN empresas e ON e.id = (SELECT empresa_id FROM usuarios LIMIT 1)
       WHERE p.id = $1 AND p.task_id = $2`,
      [pagoId, taskId]
    );

    if (certRes.rows.length === 0) {
      return res.status(404).json({ error: 'Certificado no encontrado' });
    }

    const c = certRes.rows[0];

    // Historial de certificados anteriores de esta tarea
    const histRes = await pool.query(
      `SELECT id, fecha_emision, tipo, cantidad_certificada, monto, estado
       FROM pagos WHERE task_id = $1 ORDER BY fecha_emision ASC, id ASC`,
      [taskId]
    );

    // Acumulados anteriores
    let acumCantAnterior = 0, acumMontoAnterior = 0;
    for (const h of histRes.rows) {
      if (h.id === pagoId) break;
      acumCantAnterior += Number(h.cantidad_certificada);
      acumMontoAnterior += Number(h.monto);
    }

    const presupuesto = Number(c.precio_unitario || 0) * Number(c.cantidad_total);
    const saldoPendiente = presupuesto - acumMontoAnterior - Number(c.monto);

    // ── GENERAR PDF ──
    const doc = new PDFDocument({ margin: 0, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="certificado-${String(pagoId).padStart(4,'0')}.pdf"`);
    doc.pipe(res);

    let y = drawMembrete(doc, { nombre: c.empresa_nombre }, pagoId);

    // Tipo y estado
    const estadoColor = c.estado === 'pagado' ? COLORS.success : COLORS.pending;
    doc.font('Helvetica-Bold').fontSize(14).fillColor(COLORS.accent)
       .text(TIPO_LABEL[c.tipo] || 'Certificado', 40, y);
    doc.font('Helvetica').fontSize(10).fillColor(estadoColor)
       .text(`● ${ESTADO_LABEL[c.estado]}`, 40, y + 18);
    y += 44;

    y = hLine(doc, y);

    // Datos obra y tarea
    y = twoCol(doc, y,
      [['Obra', c.obra_nombre], ['Dirección', c.obra_direccion]],
      [['Fecha de emisión', fmtFecha(c.fecha_emision)], ['Fecha de pago', fmtFecha(c.fecha_pago)]]
    );

    y = hLine(doc, y);

    y = twoCol(doc, y,
      [['Tarea', c.titulo], ['Unidad', c.unidad]],
      [['Cantidad total', `${fmtCant(c.cantidad_total)} ${c.unidad}`],
       ['Precio unitario', c.precio_unitario ? `$ ${fmt(c.precio_unitario)}` : '—']]
    );

    y = hLine(doc, y);
    y += 4;

    // Tabla del certificado actual
    doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.text).text('DETALLE DEL CERTIFICADO', 40, y);
    y += 14;

    y = drawTable(doc, y,
      ['Descripción', 'Unidad', 'Cantidad', 'Precio Unit.', 'Monto'],
      [[
        c.titulo,
        c.unidad,
        { text: fmtCant(c.cantidad_certificada), color: COLORS.text },
        { text: c.precio_unitario ? `$ ${fmt(c.precio_unitario)}` : '—', color: COLORS.muted },
        { text: `$ ${fmt(c.monto)}`, color: COLORS.accent },
      ]],
      [200, 55, 75, 90, 95]
    );

    y += 4;

    // Resumen económico
    if (presupuesto > 0) {
      y = twoCol(doc, y,
        [['Acumulado anterior', `$ ${fmt(acumMontoAnterior)}`],
         ['Este certificado', `$ ${fmt(c.monto)}`]],
        [['Presupuesto total', `$ ${fmt(presupuesto)}`],
         ['Saldo pendiente', `$ ${fmt(saldoPendiente)}`, saldoPendiente > 0 ? COLORS.pending : COLORS.success]]
      );
    }

    // Monto destacado
    montoBox(doc, y - 60, 'Monto certificado', c.monto);

    // Historial
    if (histRes.rows.length > 1) {
      y += 20;
      y = hLine(doc, y);
      doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.text).text('HISTORIAL DE CERTIFICADOS', 40, y + 4);
      y += 18;
      y = drawTable(doc, y,
        ['N°', 'Fecha', 'Tipo', 'Cantidad', 'Monto', 'Estado'],
        histRes.rows.map((h, i) => [
          String(i + 1),
          fmtFecha(h.fecha_emision),
          TIPO_LABEL[h.tipo] || h.tipo,
          { text: fmtCant(h.cantidad_certificada), color: COLORS.text },
          { text: `$ ${fmt(h.monto)}`, color: h.id === pagoId ? COLORS.accent : COLORS.muted },
          { text: ESTADO_LABEL[h.estado], color: h.estado === 'pagado' ? COLORS.success : COLORS.pending },
        ]),
        [30, 70, 90, 80, 90, 115]
      );
    }

    if (c.observaciones) {
      y += 4;
      doc.font('Helvetica').fontSize(8).fillColor(COLORS.muted)
         .text(`Observaciones: ${c.observaciones}`, 40, y, { width: doc.page.width - 80 });
    }

    drawFooter(doc, c.empresa_nombre);
    doc.end();

  } catch (error) {
    console.error(error);
    next(error);
  }
};

// ── ENDPOINT: CERTIFICADO POR OBRA (resumen) ──────────────────────────────────

export const generarCertificadoObra = async (req, res, next) => {
  try {
    const obraId = Number(req.params.id);

    const obraRes = await pool.query(
      `SELECT o.*, e.nombre AS empresa_nombre
       FROM obras o
       LEFT JOIN empresas e ON e.id = (SELECT empresa_id FROM usuarios LIMIT 1)
       WHERE o.id = $1`,
      [obraId]
    );
    if (obraRes.rows.length === 0) return res.status(404).json({ error: 'Obra no encontrada' });
    const obra = obraRes.rows[0];

    // Todas las tareas con sus certificados
    const tasksRes = await pool.query(
      `SELECT
         t.id, t.titulo, t.unidad, t.cantidad_total, t.precio_unitario,
         COALESCE(agg_m.ejecutado, 0) AS ejecutado,
         COALESCE(agg_p.certificado, 0) AS certificado,
         COALESCE(agg_p.pagado_monto, 0) AS pagado_monto,
         COALESCE(agg_p.cert_cantidad, 0) AS cert_cantidad
       FROM tasks t
       LEFT JOIN (
         SELECT task_id, SUM(cantidad) AS ejecutado FROM mediciones GROUP BY task_id
       ) agg_m ON t.id = agg_m.task_id
       LEFT JOIN (
         SELECT task_id,
                SUM(monto) AS certificado,
                SUM(CASE WHEN estado='pagado' THEN monto ELSE 0 END) AS pagado_monto,
                SUM(cantidad_certificada) AS cert_cantidad
         FROM pagos GROUP BY task_id
       ) agg_p ON t.id = agg_p.task_id
       WHERE t.obra_id = $1
       ORDER BY t.id ASC`,
      [obraId]
    );

    const tasks = tasksRes.rows;
    const presupuestoTotal = tasks.reduce((s, t) =>
      s + (Number(t.precio_unitario || 0) * Number(t.cantidad_total)), 0);
    const certificadoTotal = tasks.reduce((s, t) => s + Number(t.certificado), 0);
    const pagadoTotal      = tasks.reduce((s, t) => s + Number(t.pagado_monto), 0);
    const saldo            = presupuestoTotal - certificadoTotal;

    // ── GENERAR PDF ──
    const doc = new PDFDocument({ margin: 0, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="resumen-obra-${obraId}.pdf"`);
    doc.pipe(res);

    let y = drawMembrete(doc, { nombre: obra.empresa_nombre }, obraId);

    doc.font('Helvetica-Bold').fontSize(14).fillColor(COLORS.accent)
       .text('Resumen de Certificaciones', 40, y);
    y += 30;

    y = hLine(doc, y);

    y = twoCol(doc, y,
      [['Obra', obra.nombre], ['Dirección', obra.direccion]],
      [['Estado', obra.estado], ['Fecha de emisión', new Date().toLocaleDateString('es-AR')]]
    );

    y = hLine(doc, y);
    y += 4;

    // Tabla de tareas
    doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.text).text('ESTADO POR TAREA', 40, y);
    y += 14;

    y = drawTable(doc, y,
      ['Tarea', 'Unid.', 'Ejecutado', 'Certificado', 'Pagado', 'Presupuesto'],
      tasks.map(t => {
        const pres = Number(t.precio_unitario || 0) * Number(t.cantidad_total);
        return [
          t.titulo.length > 28 ? t.titulo.slice(0, 26) + '…' : t.titulo,
          t.unidad,
          { text: fmtCant(t.ejecutado), color: COLORS.text },
          { text: `$ ${fmt(t.certificado)}`, color: COLORS.accent },
          { text: `$ ${fmt(t.pagado_monto)}`, color: COLORS.success },
          { text: pres > 0 ? `$ ${fmt(pres)}` : '—', color: COLORS.muted },
        ];
      }),
      [170, 40, 70, 90, 85, 90]
    );

    y += 8;

    // Totales
    y = twoCol(doc, y,
      [['Total certificado', `$ ${fmt(certificadoTotal)}`],
       ['Total pagado',      `$ ${fmt(pagadoTotal)}`]],
      [['Presupuesto total', `$ ${fmt(presupuestoTotal)}`],
       ['Saldo pendiente',   `$ ${fmt(saldo)}`, saldo > 0 ? COLORS.pending : COLORS.success]]
    );

    montoBox(doc, y - 60, 'Total certificado', certificadoTotal);

    drawFooter(doc, obra.empresa_nombre);
    doc.end();

  } catch (error) {
    console.error(error);
    next(error);
  }
};
