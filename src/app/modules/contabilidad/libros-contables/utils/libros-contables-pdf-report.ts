import jsPDF from 'jspdf';
import autoTable, { CellDef, RowInput } from 'jspdf-autotable';

import { LibroContableOperacionGroup, LibroMayorExtendidoUeGroup, LibroMayorResultGroup, LibroPliegoDiarioUeGroup, LibroPliegoMayorGroup } from '../../config/accounting-books.mock';
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
  sector?: string;
  // Presentes solo en Unidad Ejecutora · Libro Diario (reemplazan a Sector).
  pliego?: string;
  unidadEjecutora?: string;
  // Fecha/hora de generación; el PDF ya la muestra en su cabecera, así que no se usa aquí.
  fecha?: string;
};

export type LibrosContablesPdfReportInput = {
  correlativo: string;
  title: string;
  entity: ReportEntity;
  usuario: string;
  /** Encabezado de la sección de la tabla (mismo título del buscador en pantalla). */
  sectionTitle: string;
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
  usuario: string;
  /** Encabezado de la sección de la tabla (mismo título del buscador en pantalla). */
  sectionTitle: string;
  groups: LibroMayorResultGroup[];
};

export type LibrosContablesPliegoDiarioPdfReportInput = {
  correlativo: string;
  title: string;
  entity: ReportEntity;
  usuario: string;
  /** Encabezado de la sección de la tabla (mismo título del buscador en pantalla). */
  sectionTitle: string;
  ueGroups: LibroPliegoDiarioUeGroup[];
  vienenDebe: number;
  vienenHaber: number;
  vanDebe: number;
  vanHaber: number;
};

export type LibrosContablesPliegoMayorPdfReportInput = {
  correlativo: string;
  title: string;
  entity: ReportEntity;
  usuario: string;
  /** Encabezado de la sección de la tabla (mismo título del buscador en pantalla). */
  sectionTitle: string;
  groups: LibroPliegoMayorGroup[];
};

export type LibrosContablesMayorExtendidoUePdfReportInput = {
  correlativo: string;
  title: string;
  entity: ReportEntity;
  usuario: string;
  /** Encabezado de la sección de la tabla (mismo título del buscador en pantalla). */
  sectionTitle: string;
  ueGroups: LibroMayorExtendidoUeGroup[];
};

function formatImporte(value: number): string {
  return value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Ejercicio contable mostrado como primera columna de cada libro. */
const EJERCICIO = 2026;

/** Código numérico de la entidad (ej. "010 Ministerio…" -> 10), segunda columna de cada libro. */
function entidadCodigo(entidad: string): number | string {
  const match = entidad.match(/\d+/);
  return match ? Number(match[0]) : '';
}

function createLandscapeDoc(): jsPDF {
  return new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' });
}

/** Estilo base de las tablas de reporte (UE Diario, UE Mayor, Pliego Mayor). */
const TABLE_BODY_STYLES = {
  fontSize: 8,
  cellPadding: 4,
  textColor: [20, 20, 20] as [number, number, number],
  lineColor: [220, 220, 220] as [number, number, number],
  lineWidth: { top: 0, bottom: 0.5, left: 0, right: 0 } as const,
};

/**
 * Estilo exclusivo de Pliego · Libro Diario · Integrado a nivel pliego: altura de fila
 * uniforme de 24pt = 32px para todas las filas (de 1 o 2 líneas). `minCellHeight` fija las
 * de 1 línea; el padding vertical de 3.6pt (con interlineado 1.05, ver la función) mantiene
 * las de 2 líneas exactamente en 24pt.
 */
const PLIEGO_DIARIO_BODY_STYLES = {
  fontSize: 8,
  cellPadding: { top: 3.6, bottom: 3.6, left: 4, right: 4 } as const,
  minCellHeight: 24,
  valign: 'middle' as const,
  textColor: [20, 20, 20] as [number, number, number],
  lineColor: [220, 220, 220] as [number, number, number],
  lineWidth: { top: 0, bottom: 0.5, left: 0, right: 0 } as const,
};

/** Dibuja el encabezado (logo, título, fecha/hora, datos del reporte) y devuelve la Y para iniciar la tabla. */
function drawReportHeader(doc: jsPDF, title: string, entity: ReportEntity, fecha: string, hora: string, usuario: string, logoPng: string | null, sectionTitle = 'CUENTAS CONTABLES'): number {
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
  doc.text('Usuario:', PAGE_MARGIN, cursorY + 14);
  doc.text('Estado del documento:', PAGE_MARGIN, cursorY + 28);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 20);
  doc.text(`${fecha} ${hora}`, PAGE_MARGIN + 100, cursorY);
  doc.text(usuario, PAGE_MARGIN + 100, cursorY + 14);
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

  // Layout de "Datos del reporte" según los campos presentes en la entidad:
  //  - Entidad · Pliego · Unidad Ejecutora  (UE / Pliego + Programa nacional de becas)
  //  - Entidad · Pliego                       (Pliego · Integrado a nivel pliego)
  //  - Entidad · Sector                       (resto)
  //  - Entidad                                (Ente Rector: el Pliego va en los filtros)
  const infoFields: Array<[string, string]> =
    entity.pliego && entity.unidadEjecutora
      ? [
          ['Entidad', entity.entidad],
          ['Pliego', entity.pliego],
          ['Unidad Ejecutora', entity.unidadEjecutora],
        ]
      : entity.pliego
        ? [
            ['Entidad', entity.entidad],
            ['Pliego', entity.pliego],
          ]
        : entity.sector
          ? [
              ['Entidad', entity.entidad],
              ['Sector', entity.sector],
            ]
          : [['Entidad', entity.entidad]];
  const columnWidth = (pageWidth - PAGE_MARGIN * 2) / infoFields.length;

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
  doc.text(sectionTitle.toUpperCase(), PAGE_MARGIN, cursorY);

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

function buildSummaryRow(label: string, debe: number, haber: number, labelColSpan = 5): RowInput {
  return [
    { content: label.toUpperCase(), colSpan: labelColSpan, styles: { ...SUMMARY_ROW_STYLES, halign: 'center' as const } },
    { content: formatImporte(debe), styles: { ...SUMMARY_ROW_STYLES, halign: 'right' as const } },
    { content: formatImporte(haber), styles: { ...SUMMARY_ROW_STYLES, halign: 'right' as const } },
  ];
}

function buildRows(groups: LibroContableOperacionGroup[], vienenDebe: number, vienenHaber: number, codEntidad: number | string): RowInput[] {
  const rows: RowInput[] = [buildSummaryRow('-Vienen-', vienenDebe, vienenHaber, 9)];

  for (const group of groups) {
    rows.push([
      { content: EJERCICIO, styles: { fontStyle: 'bold' } },
      { content: codEntidad, styles: { fontStyle: 'bold' } },
      { content: group.tipoRegistro, styles: { fontStyle: 'bold' } },
      { content: group.nroDocContable, styles: { fontStyle: 'bold' } },
      { content: group.codCuenta, styles: { fontStyle: 'bold' } },
      { content: group.fecha, styles: { fontStyle: 'bold' } },
      { content: group.tipoDocumento, styles: { fontStyle: 'bold' } },
      { content: group.codDocOrigen, styles: { fontStyle: 'bold' } },
      { content: group.documento, colSpan: 3, styles: { fontStyle: 'bold' } },
    ]);

    for (const cuenta of group.cuentas) {
      const slots = computeAmountSlots(cuenta, formatImporte);

      rows.push([
        { content: '' },
        { content: '' },
        {
          content: `${cuenta.codigo} ${cuenta.nombre}`,
          colSpan: 5,
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

  const startY = drawReportHeader(doc, input.title, input.entity, fecha, hora, input.usuario, logoPng, input.sectionTitle);

  autoTable(doc, {
    startY,
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    head: [['EJERCICIO', 'ENTIDAD', 'TIPO REGISTRO', 'NRO REG. CONTABLE', 'NRO. ASIENTO CONTABLE', 'FECHA', 'TIPO DOC ORIGEN', 'NRO DOC ORIGEN', 'DOCUMENTO ORIGEN', 'DEBE', 'HABER']],
    body: buildRows(input.groups, input.vienenDebe, input.vienenHaber, entidadCodigo(input.entity.entidad)),
    foot: [buildSummaryRow('-Van-', input.totalDebe, input.totalHaber, 9)],
    theme: 'plain',
    styles: TABLE_BODY_STYLES,
    headStyles: { fillColor: SIAF_BLUE, textColor: [255, 255, 255], fontStyle: 'bold', valign: 'middle', lineColor: SIAF_BLUE, lineWidth: { top: 0, bottom: 0.5, left: 0, right: 0 } },
    footStyles: { fillColor: [245, 245, 245], textColor: [20, 20, 20], lineColor: [220, 220, 220], lineWidth: { top: 0.5, bottom: 0, left: 0, right: 0 } },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 46 },
      2: { cellWidth: 78 },
      3: { cellWidth: 76 },
      4: { cellWidth: 86 },
      5: { cellWidth: 52 },
      6: { cellWidth: 62 },
      7: { cellWidth: 78 },
      8: { cellWidth: 'auto' },
      9: { cellWidth: 64, halign: 'right' },
      10: { cellWidth: 64, halign: 'right' },
    },
    didDrawPage: (data) => drawPageFooter(doc, data.pageNumber, fecha, hora),
  });

  applyTotalPages(doc);

  const fileName = `${input.correlativo} - REPORTE DE ${input.title.toUpperCase()}.pdf`;
  doc.save(fileName);
}

const MAYOR_GROUP_ROW_STYLES = { fillColor: [245, 245, 245] as [number, number, number], fontStyle: 'bold' as const };
// Equivalente en RGB del token --sys-color-bg-surfaces-highlight (azul 1/72/153 al 8% sobre blanco).
const SALDO_INICIAL_ROW_STYLES = { fillColor: [235, 240, 247] as [number, number, number], halign: 'right' as const };

function buildMayorRows(groups: LibroMayorResultGroup[], codEntidad: number | string): RowInput[] {
  const rows: RowInput[] = [];

  for (const group of groups) {
    rows.push([
      { content: `${group.codCuenta} ${group.nombreCuenta}`, colSpan: 11, styles: MAYOR_GROUP_ROW_STYLES },
    ]);

    rows.push([
      { content: 'Saldo inicial', colSpan: 10, styles: SALDO_INICIAL_ROW_STYLES },
      { content: formatImporte(group.saldoInicial), styles: SALDO_INICIAL_ROW_STYLES },
    ]);

    let saldo = group.saldoInicial;

    for (const mov of group.movimientos) {
      saldo = saldo + mov.debe - mov.haber;

      rows.push([
        EJERCICIO,
        codEntidad,
        mov.fecha,
        mov.nroDocContable,
        mov.nroAsiento,
        mov.tipo,
        mov.documento,
        mov.nroDocumento,
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

  const startY = drawReportHeader(doc, input.title, input.entity, fecha, hora, input.usuario, logoPng, input.sectionTitle);

  autoTable(doc, {
    startY,
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    head: [['EJERCICIO', 'ENTIDAD', 'FECHA', 'NRO REG. CONTABLE', 'NRO. ASIENTO', 'TIPO REGISTRO', 'DOCUMENTO ORIGEN', 'NRO DOC ORIGEN', 'DEBE', 'HABER', 'SALDO']],
    body: buildMayorRows(input.groups, entidadCodigo(input.entity.entidad)),
    theme: 'plain',
    // valign middle + minCellHeight: filas de alto uniforme con texto centrado verticalmente.
    styles: { ...TABLE_BODY_STYLES, valign: 'middle', minCellHeight: 22 },
    headStyles: { fillColor: SIAF_BLUE, textColor: [255, 255, 255], fontStyle: 'bold', valign: 'middle', lineColor: SIAF_BLUE, lineWidth: { top: 0, bottom: 0.5, left: 0, right: 0 } },
    columnStyles: {
      0: { cellWidth: 48 },
      1: { cellWidth: 44 },
      2: { cellWidth: 52 },
      3: { cellWidth: 76 },
      4: { cellWidth: 84 },
      5: { cellWidth: 92 },
      6: { cellWidth: 'auto' },
      7: { cellWidth: 90 },
      8: { cellWidth: 64, halign: 'right' },
      9: { cellWidth: 64, halign: 'right' },
      10: { cellWidth: 76, halign: 'right' },
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

/** Fila de acordeón de Unidad Ejecutora (nombre en negrita, ocupa toda la fila). */
const PLIEGO_UE_ROW_STYLES = { fontStyle: 'bold' as const };

/**
 * Cuerpo del Libro Diario · Integrado a nivel pliego: por cada Unidad Ejecutora una fila
 * de cabecera (acordeón), y por cada operación el asiento + sus cuentas escalonadas,
 * igual que el diario estándar. Columnas: Tipo Registro · Nro Reg. Contable · Nro. Asiento ·
 * Fecha · Tipo doc origen · Nro doc origen · Documento origen · Debe · Haber.
 */
function buildPliegoDiarioUeRows(ueGroups: LibroPliegoDiarioUeGroup[], vienenDebe: number, vienenHaber: number, codEntidad: number | string): RowInput[] {
  const rows: RowInput[] = [buildSummaryRow('-Vienen-', vienenDebe, vienenHaber, 9)];

  for (const ue of ueGroups) {
    rows.push([{ content: ue.unidadEjecutora, colSpan: 11, styles: PLIEGO_UE_ROW_STYLES }]);

    for (const group of ue.operaciones) {
      rows.push([
        EJERCICIO,
        codEntidad,
        group.tipoRegistro,
        group.nroDocContable,
        group.codCuenta,
        group.fecha,
        group.tipoDocumento,
        group.codDocOrigen,
        { content: group.documento, colSpan: 3 },
      ]);

      for (const cuenta of group.cuentas) {
        const slots = computeAmountSlots(cuenta, formatImporte);
        rows.push([
          { content: '' },
          { content: '' },
          {
            content: `${cuenta.codigo} ${cuenta.nombre}`,
            colSpan: 5,
            styles: { fontStyle: 'normal', cellPadding: { left: 6 + (cuenta.nivel - 1) * 14, top: 2, right: 4, bottom: 2 } },
          },
          ...slots.map((slot): CellDef => ({ content: slot, styles: { halign: 'right' } })),
        ]);
      }
    }
  }

  return rows;
}

export async function generateLibrosContablesPliegoDiarioPdfReport(input: LibrosContablesPliegoDiarioPdfReportInput): Promise<void> {
  const doc = createLandscapeDoc();
  const now = new Date();
  const fecha = now.toLocaleDateString('es-PE');
  const hora = now.toLocaleTimeString('es-PE', { hour12: false });

  const logoPng = await loadSiafLogoPng();

  const startY = drawReportHeader(doc, input.title, input.entity, fecha, hora, input.usuario, logoPng, input.sectionTitle);

  autoTable(doc, {
    startY,
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    head: [['EJERCICIO', 'ENTIDAD', 'TIPO REGISTRO', 'NRO REG. CONTABLE', 'NRO. ASIENTO CONTABLE', 'FECHA', 'TIPO DOC ORIGEN', 'NRO DOC ORIGEN', 'DOCUMENTO ORIGEN', 'DEBE', 'HABER']],
    body: buildPliegoDiarioUeRows(input.ueGroups, input.vienenDebe, input.vienenHaber, entidadCodigo(input.entity.entidad)),
    foot: [buildSummaryRow('-Van-', input.vanDebe, input.vanHaber, 9)],
    theme: 'plain',
    styles: TABLE_BODY_STYLES,
    headStyles: { fillColor: SIAF_BLUE, textColor: [255, 255, 255], fontStyle: 'bold', valign: 'middle', lineColor: SIAF_BLUE, lineWidth: { top: 0, bottom: 0.5, left: 0, right: 0 } },
    footStyles: { fillColor: [245, 245, 245], textColor: [20, 20, 20], lineColor: [220, 220, 220], lineWidth: { top: 0.5, bottom: 0, left: 0, right: 0 } },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 46 },
      2: { cellWidth: 78 },
      3: { cellWidth: 76 },
      4: { cellWidth: 86 },
      5: { cellWidth: 52 },
      6: { cellWidth: 62 },
      7: { cellWidth: 78 },
      8: { cellWidth: 'auto' },
      9: { cellWidth: 64, halign: 'right' },
      10: { cellWidth: 64, halign: 'right' },
    },
    didDrawPage: (data) => drawPageFooter(doc, data.pageNumber, fecha, hora),
  });

  applyTotalPages(doc);

  const fileName = `${input.correlativo} - REPORTE DE ${input.title.toUpperCase()}.pdf`;
  doc.save(fileName);
}

function buildPliegoMayorRows(groups: LibroPliegoMayorGroup[], codEntidad: number | string): RowInput[] {
  const body: RowInput[] = [];

  for (const group of groups) {
    body.push([
      { content: `${group.codigo} ${group.cuenta}`, colSpan: 10, styles: { fillColor: [245, 245, 245], fontStyle: 'bold' } },
    ]);

    body.push([
      EJERCICIO,
      codEntidad,
      group.fecha,
      { content: group.codigo, styles: { fontStyle: 'bold' } },
      { content: group.cuenta, colSpan: 2, styles: { fontStyle: 'bold' } },
      '',
      '',
      '',
      '',
    ]);

    let sumSaldoInicial = 0;
    let sumDebe = 0;
    let sumHaber = 0;

    for (const det of group.detalles) {
      sumSaldoInicial += det.saldoInicial;
      sumDebe += det.debe;
      sumHaber += det.haber;

      body.push([
        '',
        '',
        '',
        '',
        det.minen,
        det.nombre,
        { content: formatImporte(det.saldoInicial), styles: { halign: 'right' } },
        { content: formatImporte(det.debe), styles: { halign: 'right' } },
        { content: formatImporte(det.haber), styles: { halign: 'right' } },
        { content: formatImporte(det.saldo), styles: { halign: 'right' } },
      ]);
    }

    body.push([
      { content: `MOV. ACUMULADO CUENTA: ${group.codigo}`, colSpan: 6, styles: { fillColor: [245, 245, 245], fontStyle: 'bold', halign: 'right' } },
      { content: formatImporte(sumSaldoInicial), styles: { fillColor: [245, 245, 245], fontStyle: 'bold', halign: 'right' } },
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

  const startY = drawReportHeader(doc, input.title, input.entity, fecha, hora, input.usuario, logoPng, input.sectionTitle);

  const headStyles = { fillColor: SIAF_BLUE, textColor: [255, 255, 255] as [number, number, number], fontStyle: 'bold' as const, halign: 'center' as const, valign: 'middle' as const, lineColor: [255, 255, 255] as [number, number, number], lineWidth: 0.5 };

  autoTable(doc, {
    startY,
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    head: [
      [
        { content: 'EJERCICIO', rowSpan: 3, styles: headStyles },
        { content: 'ENTIDAD', rowSpan: 3, styles: headStyles },
        { content: 'FECHA', rowSpan: 3, styles: headStyles },
        { content: 'CÓDIGO', rowSpan: 3, styles: headStyles },
        { content: 'CUENTA', colSpan: 2, styles: headStyles },
        { content: 'SALDO INICIAL', rowSpan: 3, styles: { ...headStyles, halign: 'right' as const } },
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
    body: buildPliegoMayorRows(input.groups, entidadCodigo(input.entity.entidad)),
    theme: 'plain',
    styles: TABLE_BODY_STYLES,
    columnStyles: {
      0: { cellWidth: 48 },
      1: { cellWidth: 44 },
      2: { cellWidth: 62 },
      3: { cellWidth: 55 },
      4: { cellWidth: 62 },
      5: { cellWidth: 'auto' },
      6: { cellWidth: 80, halign: 'right' },
      7: { cellWidth: 80, halign: 'right' },
      8: { cellWidth: 80, halign: 'right' },
      9: { cellWidth: 80, halign: 'right' },
    },
    didDrawPage: (data) => drawPageFooter(doc, data.pageNumber, fecha, hora),
  });

  applyTotalPages(doc);

  const fileName = `${input.correlativo} - REPORTE DE ${input.title.toUpperCase()}.pdf`;
  doc.save(fileName);
}

/** Filas del Libro Mayor Extendido consolidado: cabecera por Unidad Ejecutora + sub-cuentas y detalle. */
function buildMayorExtendidoUeRows(ueGroups: LibroMayorExtendidoUeGroup[], codEntidad: number | string): RowInput[] {
  const body: RowInput[] = [];

  for (const ue of ueGroups) {
    // Fila de Unidad Ejecutora (acordeón): fondo blanco, texto en negrita.
    body.push([
      { content: ue.unidadEjecutora, colSpan: 10, styles: { fillColor: [255, 255, 255], fontStyle: 'bold' } },
    ]);

    for (const group of ue.cuentas) {
      // Sub-cuenta: código y denominación resaltados (semibold aproximado con negrita de Helvetica).
      body.push([
        EJERCICIO,
        codEntidad,
        group.fecha,
        { content: group.codigo, styles: { fontStyle: 'bold' } },
        { content: group.cuenta, colSpan: 2, styles: { fontStyle: 'bold' } },
        '',
        '',
        '',
        '',
      ]);

      for (const det of group.detalles) {
        body.push([
          '',
          '',
          '',
          '',
          det.minen,
          det.nombre,
          { content: formatImporte(det.saldoInicial), styles: { halign: 'right' } },
          { content: formatImporte(det.debe), styles: { halign: 'right' } },
          { content: formatImporte(det.haber), styles: { halign: 'right' } },
          { content: formatImporte(det.saldo), styles: { halign: 'right' } },
        ]);
      }
    }
  }

  return body;
}

export async function generateLibrosContablesMayorExtendidoUePdfReport(input: LibrosContablesMayorExtendidoUePdfReportInput): Promise<void> {
  const doc = createLandscapeDoc();
  const now = new Date();
  const fecha = now.toLocaleDateString('es-PE');
  const hora = now.toLocaleTimeString('es-PE', { hour12: false });

  const logoPng = await loadSiafLogoPng();

  const startY = drawReportHeader(doc, input.title, input.entity, fecha, hora, input.usuario, logoPng, input.sectionTitle);

  const headStyles = { fillColor: SIAF_BLUE, textColor: [255, 255, 255] as [number, number, number], fontStyle: 'bold' as const, halign: 'center' as const, valign: 'middle' as const, lineColor: [255, 255, 255] as [number, number, number], lineWidth: 0.5 };

  autoTable(doc, {
    startY,
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    head: [
      [
        { content: 'EJERCICIO', rowSpan: 3, styles: headStyles },
        { content: 'ENTIDAD', rowSpan: 3, styles: headStyles },
        { content: 'FECHA', rowSpan: 3, styles: headStyles },
        { content: 'CÓDIGO', rowSpan: 3, styles: headStyles },
        { content: 'CUENTA', colSpan: 2, styles: headStyles },
        { content: 'SALDO INICIAL', rowSpan: 3, styles: { ...headStyles, halign: 'right' as const } },
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
    body: buildMayorExtendidoUeRows(input.ueGroups, entidadCodigo(input.entity.entidad)),
    theme: 'plain',
    styles: TABLE_BODY_STYLES,
    columnStyles: {
      0: { cellWidth: 48 },
      1: { cellWidth: 44 },
      2: { cellWidth: 62 },
      3: { cellWidth: 55 },
      4: { cellWidth: 62 },
      5: { cellWidth: 'auto' },
      6: { cellWidth: 80, halign: 'right' },
      7: { cellWidth: 80, halign: 'right' },
      8: { cellWidth: 80, halign: 'right' },
      9: { cellWidth: 80, halign: 'right' },
    },
    didDrawPage: (data) => drawPageFooter(doc, data.pageNumber, fecha, hora),
  });

  applyTotalPages(doc);

  const fileName = `${input.correlativo} - REPORTE DE ${input.title.toUpperCase()}.pdf`;
  doc.save(fileName);
}
