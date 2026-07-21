import * as XLSX from 'xlsx';

import {
  LibroContableOperacionGroup,
  LibroMayorResultGroup,
  LibroPliegoDiarioRow,
  LibroPliegoMayorGroup,
} from '../../config/accounting-books.mock';

/** Matriz de celdas (filas x columnas) que alimenta tanto el Excel como el CSV. */
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

function metaRows(title: string, entity: ReportEntity): ExportMatrix {
  return [
    [title.toUpperCase()],
    [],
    ['Entidad', entity.entidad, 'Sector', entity.sector],
    [],
  ];
}

export function buildLibroDiarioMatrix(input: LibroDiarioExportInput): ExportMatrix {
  const matrix: ExportMatrix = metaRows(input.title, input.entity);
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
  const matrix: ExportMatrix = metaRows(input.title, input.entity);
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
  const matrix: ExportMatrix = metaRows(input.title, input.entity);
  matrix.push(['Fecha', 'Cod. Asiento', 'Mayor', 'Sub Cuenta', 'Mnen.', 'Nombre - Unidad Ejecutora', 'Debe', 'Haber']);
  matrix.push(['-VIENEN-', '', '', '', '', '', input.vienenDebe, input.vienenHaber]);

  for (const row of input.rows) {
    matrix.push([row.fecha, row.codAsiento, row.mayor, row.subCuenta, row.mnen, row.nombre, amount(row.debe), amount(row.haber)]);
  }

  matrix.push(['-VAN-', '', '', '', '', '', input.vanDebe, input.vanHaber]);
  return matrix;
}

export function buildLibroPliegoMayorMatrix(input: LibroPliegoMayorExportInput): ExportMatrix {
  const matrix: ExportMatrix = metaRows(input.title, input.entity);
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

function reportFileName(correlativo: string, title: string, extension: string): string {
  return `${correlativo} - REPORTE DE ${title.toUpperCase()}.${extension}`;
}

function escapeCsvCell(value: string | number): string {
  const text = String(value ?? '');
  if (/[",\n;]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function downloadCsv(matrix: ExportMatrix, correlativo: string, title: string): void {
  const csv = matrix.map((row) => row.map(escapeCsvCell).join(',')).join('\r\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = reportFileName(correlativo, title, 'csv');
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadExcel(matrix: ExportMatrix, correlativo: string, title: string): void {
  const worksheet = XLSX.utils.aoa_to_sheet(matrix);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');
  XLSX.writeFile(workbook, reportFileName(correlativo, title, 'xlsx'));
}
