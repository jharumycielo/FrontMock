import { Workbook, Worksheet } from 'exceljs';

import {
  LibroDiarioMatrixRow,
  LibroMayorExtendidoUeGroup,
  LibroMayorResultGroup,
  LibroPliegoDiarioUeGroup,
  LibroPliegoMayorGroup,
} from '../../config/accounting-books.mock';
import { loadSiafLogoPng } from './libros-contables-pdf-report';

/** Matriz de celdas (filas x columnas) que alimenta la hoja de resultados y el CSV. */
export type ExportMatrix = (string | number)[][];

type ReportEntity = { entidad: string; sector?: string; pliego?: string; unidadEjecutora?: string; fecha?: string };

type BaseInput = {
  correlativo: string;
  title: string;
  entity: ReportEntity;
};

export type LibroDiarioExportInput = BaseInput & {
  rows: LibroDiarioMatrixRow[];
};

export type LibroMayorExportInput = BaseInput & {
  groups: LibroMayorResultGroup[];
};

export type LibroPliegoDiarioExportInput = BaseInput & {
  ueGroups: LibroPliegoDiarioUeGroup[];
};

export type LibroPliegoMayorExportInput = BaseInput & {
  groups: LibroPliegoMayorGroup[];
};

export type LibroMayorExtendidoUeExportInput = BaseInput & {
  ueGroups: LibroMayorExtendidoUeGroup[];
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

/** Extrae el código numérico de la entidad (ej. "010 Ministerio…" -> 10). */
function entidadCodigo(entidad: string): number | string {
  const match = entidad.match(/\d+/);
  return match ? Number(match[0]) : '';
}

/**
 * Libro Diario (Unidad Ejecutora): matriz plana/tabular, una fila por movimiento
 * con todas las dimensiones repetidas, para permitir tablas dinámicas en Excel/CSV.
 */
export function buildLibroDiarioMatrix(input: LibroDiarioExportInput): ExportMatrix {
  const matrix: ExportMatrix = [];
  matrix.push([
    'Ejercicio', 'Cod_Entidad', 'Cuenta Mayor', 'Desc.Mayor', 'Cuenta SubCta', 'Fecha',
    'Tipo Registro', 'Nro Reg. Contable', 'Nro_Asiento', 'Tipo doc origen', 'Nro doc origen', 'Documento origen',
    'Nro.Documento Origen o Expediente', 'Tipo_D_H', 'Naturaleza_de_la_Cuenta', 'Monto Debe', 'Monto Haber',
  ]);

  const codEntidad = entidadCodigo(input.entity.entidad);

  for (const row of input.rows) {
    matrix.push([
      row.ejercicio, codEntidad, row.cuentaMayor, row.descMayor, row.cuentaSubCta, row.fecha,
      row.tipoRegistro, row.nroDocContable, row.nroAsiento, row.tipoDocumento, row.codDocOrigen, row.documentoOrigen,
      row.nroDocumentoOrigen, row.tipoDH, row.naturaleza,
      amount(row.montoDebe), amount(row.montoHaber),
    ]);
  }

  return matrix;
}

const EJERCICIO = 2026;

/**
 * Libro Mayor (Unidad Ejecutora): matriz plana. Una fila por movimiento, con la
 * cuenta y su descripción repetidas y el saldo acumulado calculado por movimiento.
 */
export function buildLibroMayorMatrix(input: LibroMayorExportInput): ExportMatrix {
  const matrix: ExportMatrix = [];
  matrix.push([
    'Ejercicio', 'Cod_Entidad', 'Cuenta', 'Desc.Cuenta', 'Saldo inicial', 'Fecha', 'Nro Reg. Contable',
    'Nro Asiento', 'Tipo Registro', 'Documento origen', 'Nro doc origen', 'Debe', 'Haber', 'Saldo',
  ]);

  const codEntidad = entidadCodigo(input.entity.entidad);

  for (const group of input.groups) {
    const saldoInicial = round2(group.saldoInicial);
    let saldo = group.saldoInicial;
    for (const mov of group.movimientos) {
      saldo = round2(saldo + mov.debe - mov.haber);
      matrix.push([
        EJERCICIO, codEntidad, group.codCuenta, group.nombreCuenta, saldoInicial, mov.fecha, mov.nroDocContable,
        mov.nroAsiento, mov.tipo, mov.documento, mov.nroDocumento, amount(mov.debe), amount(mov.haber), saldo,
      ]);
    }
  }

  return matrix;
}

/**
 * Libro Diario (Pliego, integrado a nivel pliego): matriz plana/tabular. Una fila por cuenta,
 * propagando la Unidad Ejecutora (acordeón) y todo el contexto del asiento/documento de origen.
 */
export function buildLibroPliegoDiarioMatrix(input: LibroPliegoDiarioExportInput): ExportMatrix {
  const matrix: ExportMatrix = [];
  matrix.push([
    'Ejercicio', 'Cod_Entidad', 'Unidad Ejecutora', 'Tipo Registro', 'Nro Reg. Contable', 'Nro_Asiento', 'Fecha',
    'Tipo doc origen', 'Nro doc origen', 'Documento origen', 'Cuenta', 'Denominación', 'Monto Debe', 'Monto Haber',
  ]);

  const codEntidad = entidadCodigo(input.entity.entidad);

  for (const ue of input.ueGroups) {
    for (const group of ue.operaciones) {
      for (const cuenta of group.cuentas) {
        matrix.push([
          EJERCICIO, codEntidad, ue.unidadEjecutora, group.tipoRegistro, group.nroDocContable, group.codCuenta, group.fecha,
          group.tipoDocumento, group.codDocOrigen, group.documento, cuenta.codigo, cuenta.nombre,
          amount(cuenta.debe), amount(cuenta.haber),
        ]);
      }
    }
  }

  return matrix;
}

/**
 * Libro Mayor (Pliego): matriz plana. Una fila por unidad ejecutora, con la
 * cuenta y su denominación repetidas; sin banda ni fila de movimiento acumulado.
 */
export function buildLibroPliegoMayorMatrix(input: LibroPliegoMayorExportInput): ExportMatrix {
  const matrix: ExportMatrix = [];
  matrix.push([
    'Ejercicio', 'Cod_Entidad', 'Fecha', 'Codigo', 'Desc.Cuenta', 'Minen.',
    'Nombre - Unidad Ejecutora', 'Saldo inicial', 'Debe', 'Haber', 'Saldo',
  ]);

  const codEntidad = entidadCodigo(input.entity.entidad);

  for (const group of input.groups) {
    for (const det of group.detalles) {
      matrix.push([
        EJERCICIO, codEntidad, group.fecha, group.codigo, group.cuenta, det.minen,
        det.nombre, det.saldoInicial, amount(det.debe), amount(det.haber), det.saldo,
      ]);
    }
  }

  return matrix;
}

/**
 * Libro Mayor Extendido consolidado por Unidad Ejecutora (ENTE RECTOR): matriz plana con una
 * columna adicional "Unidad Ejecutora" (el acordeón) y una fila por detalle de cada sub-cuenta.
 */
export function buildLibroMayorExtendidoUeMatrix(input: LibroMayorExtendidoUeExportInput): ExportMatrix {
  const matrix: ExportMatrix = [];
  matrix.push([
    'Ejercicio', 'Cod_Entidad', 'Unidad Ejecutora', 'Fecha', 'Codigo', 'Desc.Cuenta', 'Minen.',
    'Nombre - Unidad Ejecutora', 'Saldo inicial', 'Debe', 'Haber', 'Saldo',
  ]);

  const codEntidad = entidadCodigo(input.entity.entidad);

  for (const ue of input.ueGroups) {
    for (const group of ue.cuentas) {
      for (const det of group.detalles) {
        matrix.push([
          EJERCICIO, codEntidad, ue.unidadEjecutora, group.fecha, group.codigo, group.cuenta,
          det.minen, det.nombre, det.saldoInicial, amount(det.debe), amount(det.haber), det.saldo,
        ]);
      }
    }
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

  const labelFont = { name: 'Calibri', size: 11, bold: true } as const;
  const valueFont = { name: 'Calibri', size: 11 } as const;

  ws.getCell('B11').value = 'Entidad:';
  ws.getCell('B11').font = labelFont;
  ws.getCell('B12').value = meta.entity.entidad;
  ws.getCell('B12').font = valueFont;

  // Fecha/hora de generación (última en "Datos del libro", igual que en pantalla).
  const fecha = meta.entity.fecha;

  let row: number;
  if (meta.entity.pliego && meta.entity.unidadEjecutora) {
    // Unidad Ejecutora / Pliego + Programa nacional de becas: Entidad · Pliego · Unidad Ejecutora · Fecha.
    ws.getCell('F11').value = 'Pliego:';
    ws.getCell('F11').font = labelFont;
    ws.getCell('F12').value = meta.entity.pliego;
    ws.getCell('F12').font = valueFont;
    ws.getCell('B13').value = 'Unidad Ejecutora:';
    ws.getCell('B13').font = labelFont;
    ws.getCell('B14').value = meta.entity.unidadEjecutora;
    ws.getCell('B14').font = valueFont;
    if (fecha) {
      ws.getCell('F13').value = 'Fecha:';
      ws.getCell('F13').font = labelFont;
      ws.getCell('F14').value = fecha;
      ws.getCell('F14').font = valueFont;
    }
    separatorLine(ws, 15, GRAY_LINE, 'thin', LAST_COL);
    row = 16;
  } else if (meta.entity.pliego || meta.entity.sector) {
    // Pliego · Integrado a nivel pliego: Entidad · Pliego · Fecha (o Entidad · Sector · Fecha).
    ws.getCell('F11').value = meta.entity.pliego ? 'Pliego:' : 'Sector:';
    ws.getCell('F11').font = labelFont;
    ws.getCell('F12').value = meta.entity.pliego ?? meta.entity.sector ?? '';
    ws.getCell('F12').font = valueFont;
    if (fecha) {
      ws.getCell('B13').value = 'Fecha:';
      ws.getCell('B13').font = labelFont;
      ws.getCell('B14').value = fecha;
      ws.getCell('B14').font = valueFont;
      separatorLine(ws, 15, GRAY_LINE, 'thin', LAST_COL);
      row = 16;
    } else {
      separatorLine(ws, 13, GRAY_LINE, 'thin', LAST_COL);
      row = 14;
    }
  } else {
    // Ente Rector: solo Entidad · Fecha (el Pliego va en los filtros).
    if (fecha) {
      ws.getCell('F11').value = 'Fecha:';
      ws.getCell('F11').font = labelFont;
      ws.getCell('F12').value = fecha;
      ws.getCell('F12').font = valueFont;
    }
    separatorLine(ws, 13, GRAY_LINE, 'thin', LAST_COL);
    row = 14;
  }

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

/** Columnas de importe (formato moneda). El resto de números quedan como entero (General). */
function isMoneyColumn(header: string): boolean {
  return /monto|debe|haber|saldo/i.test(header);
}

function buildResultadoSheet(ws: Worksheet, table: ExportMatrix): void {
  // La hoja de resultados conserva la cuadrícula normal (solo Resumen va en blanco).
  table.forEach((row) => ws.addRow(row));

  const headers = (table[0] ?? []).map((cell) => String(cell ?? ''));
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
        cell.font = { name: 'Calibri', size: 10 };
        if (isMoneyColumn(headers[colIndex] ?? '')) {
          cell.numFmt = '#,##0.00';
          cell.alignment = { horizontal: 'right' };
        }
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
  const entityRow: (string | number)[] =
    meta.entity.pliego && meta.entity.unidadEjecutora
      ? ['Entidad', meta.entity.entidad, 'Pliego', meta.entity.pliego, 'Unidad Ejecutora', meta.entity.unidadEjecutora]
      : meta.entity.pliego
        ? ['Entidad', meta.entity.entidad, 'Pliego', meta.entity.pliego]
        : meta.entity.sector
          ? ['Entidad', meta.entity.entidad, 'Sector', meta.entity.sector]
          : ['Entidad', meta.entity.entidad];
  // Fecha/hora de generación (última en "Datos del libro", igual que en pantalla y Excel).
  if (meta.entity.fecha) {
    entityRow.push('Fecha', meta.entity.fecha);
  }
  const rows: ExportMatrix = [
    [meta.title],
    [],
    ['Tipo de informe:', 'Reporte'],
    entityRow,
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
