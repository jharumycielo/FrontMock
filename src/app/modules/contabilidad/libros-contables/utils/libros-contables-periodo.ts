import {
  LibroContableOperacionGroup,
  LibroDiarioMatrixRow,
  LibroMayorDetalladoRow,
  LibroMayorExtendidoUeGroup,
  LibroMayorResultGroup,
  LibroPliegoDiarioRow,
  LibroPliegoDiarioUeGroup,
  LibroPliegoMayorGroup,
} from '../../config/accounting-books.mock';
import { LibrosContablesSearchCriteria } from '../components/search-panel/libros-contables-search-panel.component';

/** Ejercicio de los datos mock cuando el filtro no indica uno. */
const EJERCICIO_MOCK = 2026;

/**
 * Periodo del libro según los filtros: el ejercicio contable a mostrar y la función que ubica
 * cada fecha de los datos mock dentro del periodo consultado.
 */
export type PeriodoLibros = {
  ejercicio: number;
  /** Traslada una fecha "dd/mm/yyyy" al periodo filtrado (las vacías se conservan). */
  fecha: (fecha: string) => string;
  /**
   * Ajusta el año incluido en los números de registro/asiento (938-2026-5396.1.1) y en los
   * códigos de documentos de sustento (OC-2026-000412) al ejercicio consultado.
   */
  numero: (numero: string) => string;
};

type Rango = { inicio: Date; fin: Date };

const DIA_MS = 24 * 60 * 60 * 1000;

function parseIso(value: string): Date | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
}

function parseDmy(value: string): Date | null {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return match ? new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1])) : null;
}

function formatDmy(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

const ultimoDiaDelMes = (anio: number, mes: number) => new Date(anio, mes + 1, 0);

/**
 * Rango de fechas del filtro: Fecha desde/hasta si se indicaron; si no, el Mes elegido del
 * ejercicio. Una sola fecha se completa con el inicio o el fin de su mes.
 */
function resolverRango(criteria: LibrosContablesSearchCriteria, anio: number | null): Rango | null {
  const desde = parseIso(criteria.fechaDesde);
  const hasta = parseIso(criteria.fechaHasta);
  const mes = criteria.mes ? Number(criteria.mes) - 1 : null;

  if (!desde && !hasta && mes === null) {
    return null;
  }

  const anioBase = anio ?? desde?.getFullYear() ?? hasta?.getFullYear() ?? new Date().getFullYear();
  const inicio = desde ?? (mes !== null ? new Date(anioBase, mes, 1) : new Date(hasta!.getFullYear(), hasta!.getMonth(), 1));
  const fin = hasta ?? (mes !== null ? ultimoDiaDelMes(anioBase, mes) : ultimoDiaDelMes(inicio.getFullYear(), inicio.getMonth()));
  return fin < inicio ? { inicio: fin, fin: inicio } : { inicio, fin };
}

function numeroEnEjercicio(ejercicio: number): (numero: string) => string {
  return (numero) => numero.replace(/^(\d{3}|[A-Z]+(?:-[A-Z]+)*)-20\d{2}-/, `$1-${ejercicio}-`);
}

export function resolverPeriodo(criteria: LibrosContablesSearchCriteria): PeriodoLibros {
  const anio = criteria.anioCuenta ? Number(criteria.anioCuenta) : null;
  const rango = resolverRango(criteria, anio);

  if (rango) {
    const dias = Math.round((rango.fin.getTime() - rango.inicio.getTime()) / DIA_MS);
    const ejercicio = anio ?? rango.inicio.getFullYear();
    return {
      ejercicio,
      numero: numeroEnEjercicio(ejercicio),
      // Conserva el orden de los asientos: el día dentro de su mes se escala al rango filtrado.
      fecha: (fecha) => {
        const original = parseDmy(fecha);
        if (!original) {
          return fecha;
        }
        const diasDelMes = ultimoDiaDelMes(original.getFullYear(), original.getMonth()).getDate();
        const proporcion = diasDelMes > 1 ? (original.getDate() - 1) / (diasDelMes - 1) : 0;
        const destino = new Date(rango.inicio.getFullYear(), rango.inicio.getMonth(), rango.inicio.getDate() + Math.round(proporcion * dias));
        return formatDmy(destino);
      },
    };
  }

  if (anio) {
    // Solo ejercicio: mismo día y mes, en el año elegido (ajustando el 29/02 si no es bisiesto).
    return {
      ejercicio: anio,
      numero: numeroEnEjercicio(anio),
      fecha: (fecha) => {
        const original = parseDmy(fecha);
        if (!original) {
          return fecha;
        }
        const dia = Math.min(original.getDate(), ultimoDiaDelMes(anio, original.getMonth()).getDate());
        return formatDmy(new Date(anio, original.getMonth(), dia));
      },
    };
  }

  return { ejercicio: EJERCICIO_MOCK, fecha: (fecha) => fecha, numero: (numero) => numero };
}

const MESES = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SETIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

/**
 * Glosas con periodo ("PLANILLA ... JUNIO 2026", código "PLL-2026-06"): se reescriben con el mes y
 * año de la fecha del asiento ya trasladada al periodo filtrado.
 */
function periodoEnGlosa(texto: string, fechaAsiento: string): string {
  const fecha = parseDmy(fechaAsiento);
  if (!fecha) {
    return texto;
  }
  const mes = MESES[fecha.getMonth()];
  const anio = fecha.getFullYear();
  return texto
    .replace(new RegExp(`\\b(${MESES.join('|')}|SEPTIEMBRE) 20\\d{2}\\b`), `${mes} ${anio}`)
    .replace(/^(PLL(?:-[A-Z]+)*)-20\d{2}-\d{2}$/, `$1-${anio}-${String(fecha.getMonth() + 1).padStart(2, '0')}`);
}

/** Orden cronológico estable (dd/mm/yyyy); las filas sin fecha conservan su posición relativa. */
function porFecha<T extends { fecha: string }>(items: T[]): T[] {
  const clave = (fecha: string) => fecha.split('/').reverse().join('');
  return [...items].sort((a, b) => clave(a.fecha).localeCompare(clave(b.fecha)));
}

// Aplicación del periodo a cada estructura de libro.

export const operacionesEnPeriodo = (groups: LibroContableOperacionGroup[], p: PeriodoLibros): LibroContableOperacionGroup[] =>
  porFecha(groups.map((group) => {
    const fecha = p.fecha(group.fecha);
    return {
      ...group,
      fecha,
      nroDocContable: p.numero(group.nroDocContable),
      codCuenta: p.numero(group.codCuenta),
      cuentas: group.cuentas.map((cuenta) => ({
        ...cuenta,
        codigo: periodoEnGlosa(p.numero(cuenta.codigo), fecha),
        nombre: periodoEnGlosa(cuenta.nombre, fecha),
      })),
    };
  }));

export const pliegoDiarioUeEnPeriodo = (groups: LibroPliegoDiarioUeGroup[], p: PeriodoLibros): LibroPliegoDiarioUeGroup[] =>
  groups.map((ue) => ({ ...ue, operaciones: operacionesEnPeriodo(ue.operaciones, p) }));

export const matrizDiarioEnPeriodo = (rows: LibroDiarioMatrixRow[], p: PeriodoLibros): LibroDiarioMatrixRow[] =>
  porFecha(rows.map((row) => ({ ...row, ejercicio: p.ejercicio, fecha: p.fecha(row.fecha), nroDocContable: p.numero(row.nroDocContable), nroAsiento: p.numero(row.nroAsiento) })));

export const mayorEnPeriodo = (groups: LibroMayorResultGroup[], p: PeriodoLibros): LibroMayorResultGroup[] =>
  groups.map((group) => ({ ...group, movimientos: porFecha(group.movimientos.map((mov) => ({ ...mov, fecha: p.fecha(mov.fecha), nroDocContable: p.numero(mov.nroDocContable), nroAsiento: p.numero(mov.nroAsiento) }))) }));

export const pliegoDiarioRowsEnPeriodo = (rows: LibroPliegoDiarioRow[], p: PeriodoLibros): LibroPliegoDiarioRow[] =>
  rows.map((row) => ({ ...row, fecha: p.fecha(row.fecha), codAsiento: p.numero(row.codAsiento) }));

export const pliegoMayorEnPeriodo = (groups: LibroPliegoMayorGroup[], p: PeriodoLibros): LibroPliegoMayorGroup[] =>
  groups.map((group) => ({ ...group, fecha: p.fecha(group.fecha) }));

export const mayorExtendidoUeEnPeriodo = (groups: LibroMayorExtendidoUeGroup[], p: PeriodoLibros): LibroMayorExtendidoUeGroup[] =>
  groups.map((ue) => ({ ...ue, cuentas: pliegoMayorEnPeriodo(ue.cuentas, p) }));

export const mayorDetalladoEnPeriodo = (rows: LibroMayorDetalladoRow[], p: PeriodoLibros): LibroMayorDetalladoRow[] =>
  rows.map((row) => ({ ...row, fecha: p.fecha(row.fecha) }));
