import jsPDF from 'jspdf';
import autoTable, { CellDef, RowInput } from 'jspdf-autotable';

import { LibroContableOperacionGroup, LibroMayorResultGroup, LibroPliegoDiarioRow, LibroPliegoMayorGroup } from '../../config/accounting-books.mock';
import { computeAmountSlots } from './libros-contables-amount-slots';

const SIAF_BLUE: [number, number, number] = [1, 72, 153];
const PAGE_MARGIN = 40;
const TOTAL_PAGES_EXP = '{total_pages_count_string}';

const SIAF_LOGO_URL = 'assets/img/LogoSIAF.svg';
const SIAF_LOGO_ASPECT = 105 / 28;
const SIAF_LOGO_WIDTH = 84;

let siafLogoPngPromise: Promise<string | null> | null = null;

/** Rasteriza el logo SVG (con PNG embebido) a un dataURL PNG usable por jsPDF/ExcelJS. Cachea el resultado. */
export function loadSiafLogoPng(): Promise<string | null> {
  if (siafLogoPngPromise) {
    return siafLogoPngPromise;
  }

  siafLogoPngPromise = (async () => {
    try {
      const response = await fetch(SIAF_LOGO_URL);
      const svgText = await response.text();
      const svgUrl = URL.createObjectURL(new Blob([svgText], { type: 'image/svg+xml' }));
      const scale = 4;

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 105 * scale;
          canvas.height = 28 * scale;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('No 2D context'));
            return;
          }
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/png'));
        };
        image.onerror = () => reject(new Error('No se pudo cargar el logo SIAF-RP'));
        image.src = svgUrl;
      });

      URL.revokeObjectURL(svgUrl);
      return dataUrl;
    } catch {
      return null;
    }
  })();

  return siafLogoPngPromise;
}

type ReportEntity = {
  entidad: string;
  sector: string;
};

export type LibrosContablesPdfReportInput = {
  correlativo: string;
  title: string;
  entity: ReportEntity;
  groups: LibroContableOperacionGroup[];
  vienenDebe: number;
  vienenHaber: number;
  totalDebe: number;
  totalHaber: number;
};

export type LibrosContablesMayorPdfReportInput = {
  correlativo: string;
  title: string;
  entity: ReportEntity;
  groups: LibroMayorResultGroup[];
};

export type LibrosContablesPliegoDiarioPdfReportInput = {
  correlativo: string;
  title: string;
  entity: ReportEntity;
  rows: LibroPliegoDiarioRow[];
  vienenDebe: number;
  vienenHaber: number;
  vanDebe: number;
  vanHaber: number;
};

export type LibrosContablesPliegoMayorPdfReportInput = {
  correlativo: string;
  title: string;
  entity: ReportEntity;
  groups: LibroPliegoMayorGroup[];
};

function formatImporte(value: number): string {
  return value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function createLandscapeDoc(): jsPDF {
  return new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' });
}

/** Dibuja el encabezado (logo, título, fecha/hora, datos del reporte) y devuelve la Y para iniciar la tabla. */
function drawReportHeader(doc: jsPDF, title: string, entity: ReportEntity, fecha: string, hora: string, logoPng: string | null): number {
  const pageWidth = doc.internal.pageSize.getWidth();

  if (logoPng) {
    const logoHeight = SIAF_LOGO_WIDTH / SIAF_LOGO_ASPECT;
    doc.addImage(logoPng, 'PNG', pageWidth - PAGE_MARGIN - SIAF_LOGO_WIDTH, PAGE_MARGIN - logoHeight + 4, SIAF_LOGO_WIDTH, logoHeight);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...SIAF_BLUE);
    doc.text('SIAF-RP', pageWidth - PAGE_MARGIN, PAGE_MARGIN, { align: 'right' });
  }

  doc.setTextColor(20, 20, 20);
  doc.setFontSize(12);
  doc.text(title.toUpperCase(), PAGE_MARGIN, PAGE_MARGIN);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  let cursorY = PAGE_MARGIN + 24;
  doc.text('Fecha:', PAGE_MARGIN, cursorY);
  doc.text('Hora:', PAGE_MARGIN, cursorY + 14);
  doc.text('Estado del documento:', PAGE_MARGIN, cursorY + 28);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 20);
  doc.text(fecha, PAGE_MARGIN + 100, cursorY);
  doc.text(hora, PAGE_MARGIN + 100, cursorY + 14);
  doc.text(`Generado el ${fecha}`, PAGE_MARGIN + 100, cursorY + 28);

  cursorY += 50;
  doc.setDrawColor(220, 220, 220);
  doc.line(PAGE_MARGIN, cursorY, pageWidth - PAGE_MARGIN, cursorY);
  cursorY += 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text('DATOS DEL REPORTE', PAGE_MARGIN, cursorY);
  cursorY += 18;

  const columnWidth = (pageWidth - PAGE_MARGIN * 2) / 2;
  const infoFields: Array<[string, string]> = [
    ['Entidad', entity.entidad],
    ['Sector', entity.sector],
  ];

  infoFields.forEach(([label, value], index) => {
    const x = PAGE_MARGIN + columnWidth * index;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(label, x, cursorY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(20, 20, 20);
    doc.text(doc.splitTextToSize(value, columnWidth - 12), x, cursorY + 14);
  });

  cursorY += 44;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('CUENTAS CONTABLES', PAGE_MARGIN, cursorY);

  return cursorY + 10;
}

function drawPageFooter(doc: jsPDF, pageNumber: number, fecha: string, hora: string): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(140, 140, 140);
  doc.text(`Creado ${fecha} - ${hora}`, PAGE_MARGIN, pageHeight - 20);
  doc.text(`Página ${pageNumber} de ${TOTAL_PAGES_EXP}`, pageWidth - PAGE_MARGIN, pageHeight - 20, { align: 'right' });
}

function applyTotalPages(doc: jsPDF): void {
  if (typeof doc.putTotalPages === 'function') {
    doc.putTotalPages(TOTAL_PAGES_EXP);
  }
}

const SUMMARY_ROW_STYLES = { fillColor: [245, 245, 245] as [number, number, number], fontStyle: 'bold' as const };

function buildSummaryRow(label: string, debe: number, haber: number): RowInput {
  return [
    { content: label.toUpperCase(), colSpan: 5, styles: { ...SUMMARY_ROW_STYLES, halign: 'center' as const } },
    { content: formatImporte(debe), styles: { ...SUMMARY_ROW_STYLES, halign: 'right' as const } },
    { content: formatImporte(haber), styles: { ...SUMMARY_ROW_STYLES, halign: 'right' as const } },
  ];
}

function buildRows(groups: LibroContableOperacionGroup[], vienenDebe: number, vienenHaber: number): RowInput[] {
  const rows: RowInput[] = [buildSummaryRow('-Vienen-', vienenDebe, vienenHaber)];

  for (const group of groups) {
    rows.push([
      { content: group.codCuenta, styles: { fontStyle: 'bold' } },
      { content: group.fecha, styles: { fontStyle: 'bold' } },
      { content: group.documento, colSpan: 5, styles: { fontStyle: 'bold' } },
    ]);

    for (const cuenta of group.cuentas) {
      const slots = computeAmountSlots(cuenta, formatImporte);

      rows.push([
        {
          content: `${cuenta.codigo} ${cuenta.nombre}`,
          colSpan: 3,
          styles: { fontStyle: 'normal', cellPadding: { left: 6 + (cuenta.nivel - 1) * 14, top: 4, right: 4, bottom: 4 } },
        },
        ...slots.map((slot, index): CellDef => ({
          content: slot,
          styles: { halign: 'right', fontStyle: index >= 2 ? 'bold' : 'normal' },
        })),
      ]);
    }

  }

  return rows;
}

export async function generateLibrosContablesPdfReport(input: LibrosContablesPdfReportInput): Promise<void> {
  const doc = createLandscapeDoc();
  const now = new Date();
  const fecha = now.toLocaleDateString('es-PE');
  const hora = now.toLocaleTimeString('es-PE', { hour12: false });

  const logoPng = await loadSiafLogoPng();

  const startY = drawReportHeader(doc, input.title, input.entity, fecha, hora, logoPng);

  autoTable(doc, {
    startY,
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    head: [['COD. ASIENTO', 'FECHA', 'DOCUMENTO DE ORIGEN', '', '', 'DEBE', 'HABER']],
    body: buildRows(input.groups, input.vienenDebe, input.vienenHaber),
    foot: [buildSummaryRow('-Van-', input.totalDebe, input.totalHaber)],
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: 4, textColor: [20, 20, 20], lineColor: [220, 220, 220], lineWidth: { top: 0, bottom: 0.5, left: 0, right: 0 } },
    headStyles: { fillColor: SIAF_BLUE, textColor: [255, 255, 255], fontStyle: 'bold', lineColor: SIAF_BLUE, lineWidth: { top: 0, bottom: 0.5, left: 0, right: 0 } },
    footStyles: { fillColor: [245, 245, 245], textColor: [20, 20, 20], lineColor: [220, 220, 220], lineWidth: { top: 0.5, bottom: 0, left: 0, right: 0 } },
    columnStyles: {
      0: { cellWidth: 110 },
      1: { cellWidth: 80 },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 90, halign: 'right' },
      4: { cellWidth: 90, halign: 'right' },
      5: { cellWidth: 90, halign: 'right' },
      6: { cellWidth: 90, halign: 'right' },
    },
    didDrawPage: (data) => drawPageFooter(doc, data.pageNumber, fecha, hora),
  });

  applyTotalPages(doc);

  const fileName = `${input.correlativo} - REPORTE DE ${input.title.toUpperCase()}.pdf`;
  doc.save(fileName);
}

const MAYOR_GROUP_ROW_STYLES = { fillColor: [245, 245, 245] as [number, number, number], fontStyle: 'bold' as const };

function buildMayorRows(groups: LibroMayorResultGroup[]): RowInput[] {
  const rows: RowInput[] = [];

  for (const group of groups) {
    rows.push([
      { content: `${group.codCuenta} ${group.nombreCuenta}`, colSpan: 8, styles: MAYOR_GROUP_ROW_STYLES },
    ]);

    let saldo = group.saldoInicial;

    for (const mov of group.movimientos) {
      saldo = saldo + mov.debe - mov.haber;

      rows.push([
        mov.fecha,
        mov.docCaRegNota,
        mov.documento,
        mov.nroDocumento,
        mov.nroAsiento,
        { content: mov.debe ? formatImporte(mov.debe) : '', styles: { halign: 'right' } },
        { content: mov.haber ? formatImporte(mov.haber) : '', styles: { halign: 'right' } },
        { content: formatImporte(saldo), styles: { halign: 'right' } },
      ]);
    }
  }

  return rows;
}

export async function generateLibrosContablesMayorPdfReport(input: LibrosContablesMayorPdfReportInput): Promise<void> {
  const doc = createLandscapeDoc();
  const now = new Date();
  const fecha = now.toLocaleDateString('es-PE');
  const hora = now.toLocaleTimeString('es-PE', { hour12: false });

  const logoPng = await loadSiafLogoPng();

  const startY = drawReportHeader(doc, input.title, input.entity, fecha, hora, logoPng);

  autoTable(doc, {
    startY,
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    head: [['FECHA', 'DOC. CA/REG/NOTA', 'DOCUMENTO', 'NRO DE DOCUMENTO', 'NRO DE ASIENTO', 'DEBE', 'HABER', 'SALDO']],
    body: buildMayorRows(input.groups),
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: 4, textColor: [20, 20, 20], lineColor: [220, 220, 220], lineWidth: { top: 0, bottom: 0.5, left: 0, right: 0 } },
    headStyles: { fillColor: SIAF_BLUE, textColor: [255, 255, 255], fontStyle: 'bold', lineColor: SIAF_BLUE, lineWidth: { top: 0, bottom: 0.5, left: 0, right: 0 } },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 95 },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 110 },
      4: { cellWidth: 90 },
      5: { cellWidth: 80, halign: 'right' },
      6: { cellWidth: 80, halign: 'right' },
      7: { cellWidth: 90, halign: 'right' },
    },
    didDrawPage: (data) => drawPageFooter(doc, data.pageNumber, fecha, hora),
  });

  applyTotalPages(doc);

  const fileName = `${input.correlativo} - REPORTE DE ${input.title.toUpperCase()}.pdf`;
  doc.save(fileName);
}

function buildPliegoSummaryRow(label: string, debe: number, haber: number): RowInput {
  return [
    { content: label.toUpperCase(), colSpan: 6, styles: { ...SUMMARY_ROW_STYLES, halign: 'center' as const } },
    { content: formatImporte(debe), styles: { ...SUMMARY_ROW_STYLES, halign: 'right' as const } },
    { content: formatImporte(haber), styles: { ...SUMMARY_ROW_STYLES, halign: 'right' as const } },
  ];
}

function buildPliegoDiarioRows(rows: LibroPliegoDiarioRow[], vienenDebe: number, vienenHaber: number): RowInput[] {
  const body: RowInput[] = [buildPliegoSummaryRow('-Vienen-', vienenDebe, vienenHaber)];

  for (const row of rows) {
    body.push([
      row.fecha,
      row.codAsiento,
      row.mayor,
      { content: row.subCuenta, styles: { cellPadding: { left: 4 + row.subCuentaIndent * 12, top: 4, right: 4, bottom: 4 } } },
      row.mnen,
      row.nombre,
      { content: row.debe ? formatImporte(row.debe) : '', styles: { halign: 'right' } },
      { content: row.haber ? formatImporte(row.haber) : '', styles: { halign: 'right' } },
    ]);
  }

  return body;
}

export async function generateLibrosContablesPliegoDiarioPdfReport(input: LibrosContablesPliegoDiarioPdfReportInput): Promise<void> {
  const doc = createLandscapeDoc();
  const now = new Date();
  const fecha = now.toLocaleDateString('es-PE');
  const hora = now.toLocaleTimeString('es-PE', { hour12: false });

  const logoPng = await loadSiafLogoPng();

  const startY = drawReportHeader(doc, input.title, input.entity, fecha, hora, logoPng);

  const headStyles = { fillColor: SIAF_BLUE, textColor: [255, 255, 255] as [number, number, number], fontStyle: 'bold' as const, halign: 'center' as const, valign: 'middle' as const, lineColor: [255, 255, 255] as [number, number, number], lineWidth: 0.5 };

  autoTable(doc, {
    startY,
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    head: [
      [
        { content: 'FECHA', rowSpan: 3, styles: headStyles },
        { content: 'COD. ASIENTO CONTABLE', rowSpan: 3, styles: headStyles },
        { content: 'MAYOR', rowSpan: 3, styles: headStyles },
        { content: 'CUENTA', colSpan: 3, styles: headStyles },
        { content: 'DEBE', rowSpan: 3, styles: { ...headStyles, halign: 'right' as const } },
        { content: 'HABER', rowSpan: 3, styles: { ...headStyles, halign: 'right' as const } },
      ],
      [{ content: 'DENOMINACIÓN', colSpan: 3, styles: headStyles }],
      [
        { content: 'SUB CUENTA', styles: headStyles },
        { content: 'MNEN.', styles: headStyles },
        { content: 'NOMBRE', styles: headStyles },
      ],
    ],
    body: buildPliegoDiarioRows(input.rows, input.vienenDebe, input.vienenHaber),
    foot: [buildPliegoSummaryRow('-Van-', input.vanDebe, input.vanHaber)],
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: 4, textColor: [20, 20, 20], lineColor: [220, 220, 220], lineWidth: { top: 0, bottom: 0.5, left: 0, right: 0 } },
    footStyles: { fillColor: [245, 245, 245], textColor: [20, 20, 20], lineColor: [220, 220, 220], lineWidth: { top: 0.5, bottom: 0, left: 0, right: 0 } },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 80 },
      2: { cellWidth: 50 },
      3: { cellWidth: 130 },
      4: { cellWidth: 55 },
      5: { cellWidth: 'auto' },
      6: { cellWidth: 95, halign: 'right' },
      7: { cellWidth: 95, halign: 'right' },
    },
    didDrawPage: (data) => drawPageFooter(doc, data.pageNumber, fecha, hora),
  });

  applyTotalPages(doc);

  const fileName = `${input.correlativo} - REPORTE DE ${input.title.toUpperCase()}.pdf`;
  doc.save(fileName);
}

function buildPliegoMayorRows(groups: LibroPliegoMayorGroup[]): RowInput[] {
  const body: RowInput[] = [];

  for (const group of groups) {
    body.push([
      { content: `${group.codigo} ${group.cuenta}`, colSpan: 7, styles: { fillColor: [245, 245, 245], fontStyle: 'bold' } },
    ]);

    body.push([
      group.fecha,
      { content: group.codigo, styles: { fontStyle: 'bold' } },
      { content: group.cuenta, colSpan: 2, styles: { fontStyle: 'bold' } },
      '',
      '',
      '',
    ]);

    let sumDebe = 0;
    let sumHaber = 0;

    for (const det of group.detalles) {
      sumDebe += det.debe;
      sumHaber += det.haber;

      body.push([
        '',
        '',
        det.minen,
        det.nombre,
        { content: formatImporte(det.debe), styles: { halign: 'right' } },
        { content: formatImporte(det.haber), styles: { halign: 'right' } },
        { content: formatImporte(det.saldo), styles: { halign: 'right' } },
      ]);
    }

    body.push([
      { content: `MOV. ACUMULADO CUENTA: ${group.codigo}`, colSpan: 4, styles: { fillColor: [245, 245, 245], fontStyle: 'bold', halign: 'right' } },
      { content: formatImporte(sumDebe), styles: { fillColor: [245, 245, 245], fontStyle: 'bold', halign: 'right' } },
      { content: formatImporte(sumHaber), styles: { fillColor: [245, 245, 245], fontStyle: 'bold', halign: 'right' } },
      { content: formatImporte(sumDebe - sumHaber), styles: { fillColor: [245, 245, 245], fontStyle: 'bold', halign: 'right' } },
    ]);
  }

  return body;
}

export async function generateLibrosContablesPliegoMayorPdfReport(input: LibrosContablesPliegoMayorPdfReportInput): Promise<void> {
  const doc = createLandscapeDoc();
  const now = new Date();
  const fecha = now.toLocaleDateString('es-PE');
  const hora = now.toLocaleTimeString('es-PE', { hour12: false });

  const logoPng = await loadSiafLogoPng();

  const startY = drawReportHeader(doc, input.title, input.entity, fecha, hora, logoPng);

  const headStyles = { fillColor: SIAF_BLUE, textColor: [255, 255, 255] as [number, number, number], fontStyle: 'bold' as const, halign: 'center' as const, valign: 'middle' as const, lineColor: [255, 255, 255] as [number, number, number], lineWidth: 0.5 };

  autoTable(doc, {
    startY,
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    head: [
      [
        { content: 'FECHA', rowSpan: 3, styles: headStyles },
        { content: 'CÓDIGO', rowSpan: 3, styles: headStyles },
        { content: 'CUENTA', colSpan: 2, styles: headStyles },
        { content: 'DEBE', rowSpan: 3, styles: { ...headStyles, halign: 'right' as const } },
        { content: 'HABER', rowSpan: 3, styles: { ...headStyles, halign: 'right' as const } },
        { content: 'SALDO', rowSpan: 3, styles: { ...headStyles, halign: 'right' as const } },
      ],
      [
        { content: 'MINEN.', rowSpan: 2, styles: headStyles },
        { content: 'DENOMINACIÓN', styles: headStyles },
      ],
      [{ content: 'NOMBRE - UNIDAD EJECUTORA', styles: headStyles }],
    ],
    body: buildPliegoMayorRows(input.groups),
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: 4, textColor: [20, 20, 20], lineColor: [220, 220, 220], lineWidth: { top: 0, bottom: 0.5, left: 0, right: 0 } },
    columnStyles: {
      0: { cellWidth: 65 },
      1: { cellWidth: 55 },
      2: { cellWidth: 65 },
      3: { cellWidth: 'auto' },
      4: { cellWidth: 105, halign: 'right' },
      5: { cellWidth: 105, halign: 'right' },
      6: { cellWidth: 105, halign: 'right' },
    },
    didDrawPage: (data) => drawPageFooter(doc, data.pageNumber, fecha, hora),
  });

  applyTotalPages(doc);

  const fileName = `${input.correlativo} - REPORTE DE ${input.title.toUpperCase()}.pdf`;
  doc.save(fileName);
}
