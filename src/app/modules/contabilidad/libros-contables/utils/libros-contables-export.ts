import { Workbook, Worksheet } from 'exceljs';

import {
  LibroContableOperacionGroup,
  LibroMayorResultGroup,
  LibroPliegoDiarioRow,
  LibroPliegoMayorGroup,
} from '../../config/accounting-books.mock';
import { loadSiafLogoPng } from './libros-contables-pdf-report';

/** Matriz de celdas (filas x columnas) que alimenta la hoja de resultados y el CSV. */
export type ExportMatrix = (string | number)[][];

type ReportEntity = { entidad: string; sector: string };

type BaseInput = {
  correlativo: string;
  title: string;
  entity: ReportEntity;
};

export type LibroDiarioExportInput = BaseInput & {
  groups: LibroContableOperacionGroup[];
  vienenDebe: number;
  vienenHaber: number;
  totalDebe: number;
  totalHaber: number;
};

export type LibroMayorExportInput = BaseInput & {
  groups: LibroMayorResultGroup[];
};

export type LibroPliegoDiarioExportInput = BaseInput & {
  rows: LibroPliegoDiarioRow[];
  vienenDebe: number;
  vienenHaber: number;
  vanDebe: number;
  vanHaber: number;
};

export type LibroPliegoMayorExportInput = BaseInput & {
  groups: LibroPliegoMayorGroup[];
};

/** Devuelve el importe como número para Excel, o cadena vacía cuando es cero/sin valor. */
function amount(value: number): number | string {
  return value ? value : '';
}

/** Redondea a 2 decimales evitando artefactos de punto flotante en importes acumulados. */
function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

// ---------------------------------------------------------------------------
// Constructores de la tabla de resultados (encabezado + filas), sin metadatos.
// La combinación de filtros determina las columnas y el detalle, igual que el PDF.
// ---------------------------------------------------------------------------

export function buildLibroDiarioMatrix(input: LibroDiarioExportInput): ExportMatrix {
  const matrix: ExportMatrix = [];
  matrix.push(['Cod. Asiento', 'Fecha', 'Documento', 'Cuenta', 'Debe', 'Haber']);
  matrix.push(['-VIENEN-', '', '', '', input.vienenDebe, input.vienenHaber]);

  for (const group of input.groups) {
    matrix.push([group.codCuenta, group.fecha, group.documento, '', '', '']);
    for (const cuenta of group.cuentas) {
      matrix.push(['', '', '', `${cuenta.codigo} ${cuenta.nombre}`, amount(cuenta.debe), amount(cuenta.haber)]);
    }
  }

  matrix.push(['-VAN-', '', '', '', input.totalDebe, input.totalHaber]);
  return matrix;
}

export function buildLibroMayorMatrix(input: LibroMayorExportInput): ExportMatrix {
  const matrix: ExportMatrix = [];
  matrix.push(['Fecha', 'Doc. CA/REG/Nota', 'Documento', 'Nro Documento', 'Nro. Asiento', 'Debe', 'Haber', 'Saldo']);

  for (const group of input.groups) {
    matrix.push([`${group.codCuenta} ${group.nombreCuenta}`, '', '', '', '', '', '', '']);
    let saldo = group.saldoInicial;
    for (const mov of group.movimientos) {
      saldo = round2(saldo + mov.debe - mov.haber);
      matrix.push([mov.fecha, mov.docCaRegNota, mov.documento, mov.nroDocumento, mov.nroAsiento, amount(mov.debe), amount(mov.haber), saldo]);
    }
  }

  return matrix;
}

export function buildLibroPliegoDiarioMatrix(input: LibroPliegoDiarioExportInput): ExportMatrix {
  const matrix: ExportMatrix = [];
  matrix.push(['Fecha', 'Cod. Asiento', 'Mayor', 'Sub Cuenta', 'Mnen.', 'Nombre - Unidad Ejecutora', 'Debe', 'Haber']);
  matrix.push(['-VIENEN-', '', '', '', '', '', input.vienenDebe, input.vienenHaber]);

  for (const row of input.rows) {
    matrix.push([row.fecha, row.codAsiento, row.mayor, row.subCuenta, row.mnen, row.nombre, amount(row.debe), amount(row.haber)]);
  }

  matrix.push(['-VAN-', '', '', '', '', '', input.vanDebe, input.vanHaber]);
  return matrix;
}

export function buildLibroPliegoMayorMatrix(input: LibroPliegoMayorExportInput): ExportMatrix {
  const matrix: ExportMatrix = [];
  matrix.push(['Fecha', 'Código', 'Minen.', 'Nombre - Unidad Ejecutora', 'Debe', 'Haber', 'Saldo']);

  for (const group of input.groups) {
    matrix.push([`${group.codigo} ${group.cuenta}`, '', '', '', '', '', '']);
    matrix.push([group.fecha, group.codigo, '', group.cuenta, '', '', '']);

    let sumDebe = 0;
    let sumHaber = 0;
    for (const det of group.detalles) {
      sumDebe += det.debe;
      sumHaber += det.haber;
      matrix.push(['', '', det.minen, det.nombre, amount(det.debe), amount(det.haber), det.saldo]);
    }

    matrix.push([`MOV. ACUMULADO CUENTA: ${group.codigo}`, '', '', '', round2(sumDebe), round2(sumHaber), round2(sumDebe - sumHaber)]);
  }

  return matrix;
}

// ---------------------------------------------------------------------------
// Descarga
// ---------------------------------------------------------------------------

export type ReportMeta = {
  correlativo: string;
  title: string;
  entity: ReportEntity;
  condiciones: string[];
  totalRegistros: number;
};

const SIAF_BLUE = 'FF014899';
const GRAY_LINE = 'FFD0D0D0';
const LAST_COL = 8; // ancho de referencia de la hoja Resumen (columnas A..H)

function reportFileName(correlativo: string, title: string, extension: string): string {
  return `${correlativo} - REPORTE DE ${title.toUpperCase()}.${extension}`;
}

function fillWhite(ws: Worksheet, lastRow: number, lastCol: number): void {
  for (let r = 1; r <= lastRow; r += 1) {
    for (let c = 1; c <= lastCol; c += 1) {
      ws.getCell(r, c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
    }
  }
}

/** Dibuja una línea separadora (borde inferior) a lo ancho, en la fila indicada. */
function separatorLine(ws: Worksheet, row: number, color: string, style: 'thin' | 'medium' | 'thick', lastCol: number): void {
  for (let c = 1; c <= lastCol; c += 1) {
    const cell = ws.getCell(row, c);
    cell.border = { ...cell.border, bottom: { style, color: { argb: color } } };
  }
}

async function buildResumenSheet(ws: Worksheet, meta: ReportMeta, logoPng: string | null): Promise<void> {
  ws.views = [{ showGridLines: false }];
  ws.columns = [
    { width: 3 }, { width: 40 }, { width: 16 }, { width: 10 },
    { width: 8 }, { width: 26 }, { width: 16 }, { width: 12 },
  ];

  fillWhite(ws, 40, 20);

  ws.getCell('B2').value = meta.title;
  ws.getCell('B2').font = { name: 'Calibri', size: 20, bold: true, color: { argb: SIAF_BLUE } };

  ws.getCell('B4').value = 'Tipo de informe:';
  ws.getCell('B4').font = { name: 'Calibri', size: 14, color: { argb: SIAF_BLUE } };
  ws.getCell('B5').value = 'Reporte';
  ws.getCell('B5').font = { name: 'Calibri', size: 14, bold: true, color: { argb: SIAF_BLUE } };

  // Línea azul gruesa bajo "Reporte"
  separatorLine(ws, 6, SIAF_BLUE, 'thick', LAST_COL);

  ws.getCell('B9').value = 'Condiciones de búsqueda';
  ws.getCell('B9').font = { name: 'Calibri', size: 14, bold: true, color: { argb: SIAF_BLUE } };
  separatorLine(ws, 10, GRAY_LINE, 'thin', LAST_COL);

  ws.getCell('B11').value = 'Entidad:';
  ws.getCell('B11').font = { name: 'Calibri', size: 11, bold: true };
  ws.getCell('F11').value = 'Sector:';
  ws.getCell('F11').font = { name: 'Calibri', size: 11, bold: true };
  ws.getCell('B12').value = meta.entity.entidad;
  ws.getCell('B12').font = { name: 'Calibri', size: 11 };
  ws.getCell('F12').value = meta.entity.sector;
  ws.getCell('F12').font = { name: 'Calibri', size: 11 };
  separatorLine(ws, 13, GRAY_LINE, 'thin', LAST_COL);

  let row = 14;
  ws.getCell(`B${row}`).value = 'Filtros aplicados:';
  ws.getCell(`B${row}`).font = { name: 'Calibri', size: 11, bold: true };
  for (const condicion of meta.condiciones) {
    row += 1;
    ws.getCell(`B${row}`).value = condicion;
    ws.getCell(`B${row}`).font = { name: 'Calibri', size: 11 };
  }

  row += 2;
  ws.getCell(`B${row}`).value = 'Resultados de la búsqueda';
  ws.getCell(`B${row}`).font = { name: 'Calibri', size: 14, bold: true, color: { argb: SIAF_BLUE } };
  separatorLine(ws, row + 1, GRAY_LINE, 'thin', LAST_COL);

  row += 2;
  ws.getCell(`B${row}`).value = 'Total de registros:';
  ws.getCell(`B${row}`).font = { name: 'Calibri', size: 11, bold: true };
  ws.getCell(`C${row}`).value = meta.totalRegistros;
  ws.getCell(`C${row}`).font = { name: 'Calibri', size: 11 };

  if (logoPng) {
    const imageId = ws.workbook.addImage({ base64: logoPng, extension: 'png' });
    // Logo arriba a la derecha (aprox. columnas P..S, fila 2)
    ws.addImage(imageId, { tl: { col: 15.2, row: 1.2 }, ext: { width: 168, height: 45 } });
  }
}

function buildResultadoSheet(ws: Worksheet, table: ExportMatrix): void {
  ws.views = [{ showGridLines: false }];
  table.forEach((row) => ws.addRow(row));

  const columnCount = table.reduce((max, row) => Math.max(max, row.length), 0);
  const widths: number[] = new Array(columnCount).fill(10);

  table.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      const cell = ws.getCell(rowIndex + 1, colIndex + 1);
      const length = String(value ?? '').length;
      widths[colIndex] = Math.max(widths[colIndex], Math.min(length + 2, 42));

      if (rowIndex === 0) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: SIAF_BLUE } };
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (typeof value === 'number') {
        cell.numFmt = '#,##0.00';
        cell.alignment = { horizontal: 'right' };
        cell.font = { name: 'Calibri', size: 10 };
      } else {
        cell.font = { name: 'Calibri', size: 10 };
      }
    });
  });

  ws.columns.forEach((column, index) => {
    column.width = widths[index] ?? 12;
  });
}

function triggerDownload(buffer: ArrayBuffer, fileName: string, mime: string): void {
  const blob = new Blob([buffer], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function downloadExcel(table: ExportMatrix, meta: ReportMeta): Promise<void> {
  const logoPng = await loadSiafLogoPng();

  const workbook = new Workbook();
  const resumen = workbook.addWorksheet('Resumen');
  await buildResumenSheet(resumen, meta, logoPng);

  const resultado = workbook.addWorksheet('Resultado');
  buildResultadoSheet(resultado, table);

  const buffer = await workbook.xlsx.writeBuffer();
  triggerDownload(buffer, reportFileName(meta.correlativo, meta.title, 'xlsx'), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}

function escapeCsvCell(value: string | number): string {
  const text = String(value ?? '');
  if (/[",\n;]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function downloadCsv(table: ExportMatrix, meta: ReportMeta): void {
  const rows: ExportMatrix = [
    [meta.title],
    [],
    ['Tipo de informe:', 'Reporte'],
    ['Entidad', meta.entity.entidad, 'Sector', meta.entity.sector],
    ['Condiciones de búsqueda', ...meta.condiciones],
    ['Total de registros:', meta.totalRegistros],
    [],
    ...table,
  ];

  const csv = rows.map((row) => row.map(escapeCsvCell).join(',')).join('\r\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = reportFileName(meta.correlativo, meta.title, 'csv');
  anchor.click();
  URL.revokeObjectURL(url);
}
