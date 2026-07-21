import { findProcessPathById } from '../../../layout/process-menu-tree/process-menu-tree.component';
import { BreadcrumbItem } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { TextFieldOption } from '../../../shared/ui/text-field/text-field.component';

const PROCESS_ID = 'libro-diario-mayor';

export const ACCOUNTING_BOOKS_BREADCRUMBS: BreadcrumbItem[] = [
  { label: 'Inicio', href: '/panel' },
  ...findProcessPathById(PROCESS_ID).map((node) => ({ label: node.label })),
];

export const ACCOUNTING_BOOKS_PERIODOS: TextFieldOption[] = [
  { label: 'Junio 2026', value: '2026-06' },
  { label: 'Mayo 2026', value: '2026-05' },
  { label: 'Abril 2026', value: '2026-04' },
];

export const LIBROS_CONTABLES_SCOPE_OPTIONS = [
  { label: 'Libros principales', value: 'principales' },
  { label: 'Libros auxiliares', value: 'auxiliares' },
];

export const LIBROS_CONTABLES_TIPO_OPTIONS: TextFieldOption[] = [
  { label: 'Libro Diario', value: 'diario' },
  { label: 'Libro Mayor', value: 'mayor' },
];

// Opciones de Entidad visibles para el usuario visualizador de tipo PLIEGO.
export const LIBROS_CONTABLES_ENTIDAD_PLIEGO_OPTIONS: TextFieldOption[] = [
  { label: 'Programa nacional de becas', value: 'pronabec' },
  { label: 'Integrado a nivel pliego', value: 'integrado-pliego' },
];

export const LIBROS_CONTABLES_MES_OPTIONS: TextFieldOption[] = [
  { label: 'Enero', value: '01' },
  { label: 'Febrero', value: '02' },
  { label: 'Marzo', value: '03' },
  { label: 'Abril', value: '04' },
  { label: 'Mayo', value: '05' },
  { label: 'Junio', value: '06' },
  { label: 'Julio', value: '07' },
  { label: 'Agosto', value: '08' },
  { label: 'Septiembre', value: '09' },
  { label: 'Octubre', value: '10' },
  { label: 'Noviembre', value: '11' },
  { label: 'Diciembre', value: '12' },
];

export const LIBROS_CONTABLES_ANIO_OPTIONS: TextFieldOption[] = [
  { label: '2026', value: '2026' },
  { label: '2025', value: '2025' },
  { label: '2024', value: '2024' },
];

export const LIBROS_CONTABLES_RESULT_ENTITY = {
  entidad: '010 Ministerio de Economía y Finanzas',
  sector: '10 Economía y Finanzas',
};

export type LibroContableAccountRow = {
  codigo: string;
  nombre: string;
  nivel: 1 | 2 | 3;
  debe: number;
  haber: number;
};

export type LibroContableOperacionGroup = {
  id: string;
  codCuenta: string;
  fecha: string;
  documento: string;
  cuentas: LibroContableAccountRow[];
};

export const LIBROS_CONTABLES_RESULT_GROUPS: LibroContableOperacionGroup[] = [
  {
    id: 'op1',
    codCuenta: '0000045163',
    fecha: '03/06/2024',
    documento: '000000003-0002 DISPOSITIVO LEGAL O ACTO DE ADMINISTRACIÓN',
    cuentas: [
      { codigo: '8301', nombre: 'PRESUPUESTOS DE GASTOS', nivel: 1, debe: 1000, haber: 0 },
      { codigo: '8301.01', nombre: 'Recursos Ordinarios', nivel: 2, debe: 1000, haber: 0 },
      { codigo: '8301.01.01', nombre: 'Recursos Ordinarios', nivel: 3, debe: 1000, haber: 0 },
      { codigo: '8401', nombre: 'ASIGNACIONES COMPROMETIDAS', nivel: 1, debe: 0, haber: 1000 },
      { codigo: '8401.01', nombre: 'Recursos Ordinarios', nivel: 2, debe: 1000, haber: 0 },
    ],
  },
];

export type LibroMayorResultRow = {
  fecha: string;
  docCaRegNota: string;
  documento: string;
  nroDocumento: string;
  nroAsiento: string;
  debe: number;
  haber: number;
};

export type LibroMayorResultGroup = {
  id: string;
  codCuenta: string;
  nombreCuenta: string;
  saldoInicial: number;
  movimientos: LibroMayorResultRow[];
};

export const LIBROS_CONTABLES_MAYOR_RESULT_GROUPS: LibroMayorResultGroup[] = [
  {
    id: 'mayor-1101',
    codCuenta: '1101',
    nombreCuenta: 'CAJA Y BANCOS',
    saldoInicial: 3609854.68,
    movimientos: [
      { fecha: '03/06/2024', docCaRegNota: 'R0000004025', documento: 'Nota de pago', nroDocumento: '4025.24.95.2402060', nroAsiento: '0000045396', debe: 73.13, haber: 0 },
      { fecha: '03/06/2024', docCaRegNota: 'R0000004025', documento: 'Rendición de cuenta', nroDocumento: 'MM', nroAsiento: '0000045393', debe: 0, haber: 73.13 },
      { fecha: '03/06/2024', docCaRegNota: 'R0000004031', documento: 'Nota de pago', nroDocumento: '4031.24.95.2402059', nroAsiento: '0000045401', debe: 73.20, haber: 0 },
      { fecha: '03/06/2024', docCaRegNota: 'R0000004031', documento: 'Rendición de cuenta', nroDocumento: 'MM', nroAsiento: '0000045398', debe: 0, haber: 73.20 },
      { fecha: '03/06/2024', docCaRegNota: 'R0000004044', documento: 'Rendición de cuenta', nroDocumento: 'MM N 436-2024-OT', nroAsiento: '0000045409', debe: 0, haber: 864.19 },
      { fecha: '03/06/2024', docCaRegNota: 'R0000004044', documento: 'Rendición de cuenta', nroDocumento: 'MM N 436-2024-OT', nroAsiento: '0000045412', debe: 0, haber: 145.00 },
    ],
  },
];

// Resultado del Libro Diario para el usuario visualizador de tipo PLIEGO
// (filtro Entidad: Integrado a nivel pliego). Estructura jerárquica por asiento,
// cuenta mayor, subcuentas y detalle por mnemónico (unidad ejecutora).
export type LibroPliegoDiarioRow = {
  fecha: string;
  codAsiento: string;
  mayor: string;
  subCuenta: string;
  subCuentaIndent: number;
  mnen: string;
  nombre: string;
  debe: number;
  haber: number;
};

export const LIBROS_CONTABLES_PLIEGO_DIARIO_ROWS: LibroPliegoDiarioRow[] = [
  { fecha: '31/07/2026', codAsiento: '0000000021', mayor: '1101', subCuenta: 'Caja y bancos', subCuentaIndent: 0, mnen: '', nombre: '', debe: 92191377.19, haber: 0 },
  { fecha: '', codAsiento: '', mayor: '', subCuenta: '1101.01 Caja', subCuentaIndent: 1, mnen: '', nombre: '', debe: 39372877.45, haber: 0 },
  { fecha: '', codAsiento: '', mayor: '', subCuenta: '1101.0101 Caja M/N', subCuentaIndent: 2, mnen: '', nombre: '', debe: 39372877.45, haber: 0 },
  { fecha: '', codAsiento: '', mayor: '', subCuenta: '', subCuentaIndent: 0, mnen: '000056', nombre: 'USE 01 San Juan de Miraflores', debe: 8631.33, haber: 0 },
  { fecha: '', codAsiento: '', mayor: '', subCuenta: '', subCuentaIndent: 0, mnen: '000057', nombre: 'USE 02 San Martin de Porras', debe: 16045.33, haber: 0 },
  { fecha: '', codAsiento: '', mayor: '', subCuenta: '', subCuentaIndent: 0, mnen: '000058', nombre: 'USE 03 Cercado', debe: 85109.28, haber: 0 },
  { fecha: '', codAsiento: '', mayor: '', subCuenta: '', subCuentaIndent: 0, mnen: '000059', nombre: 'USE 03 Cercado', debe: 85109.28, haber: 0 },
  { fecha: '', codAsiento: '', mayor: '', subCuenta: '', subCuentaIndent: 0, mnen: '000060', nombre: 'USE 03 Cercado', debe: 85109.28, haber: 0 },
  { fecha: '', codAsiento: '', mayor: '', subCuenta: '', subCuentaIndent: 0, mnen: '000061', nombre: 'USE 03 Cercado', debe: 85109.28, haber: 0 },
  { fecha: '', codAsiento: '', mayor: '', subCuenta: '', subCuentaIndent: 0, mnen: '000062', nombre: 'USE 03 Cercado', debe: 85109.28, haber: 0 },
];

// Resultado del Libro Mayor para el usuario visualizador PLIEGO
// (Entidad: Integrado a nivel pliego). Agrupado por cuenta mayor con detalle
// por unidad ejecutora (mnemónico), incluyendo saldo.
export type LibroPliegoMayorRow = {
  minen: string;
  nombre: string;
  debe: number;
  haber: number;
  saldo: number;
};

export type LibroPliegoMayorGroup = {
  id: string;
  fecha: string;
  codigo: string;
  cuenta: string;
  detalles: LibroPliegoMayorRow[];
};

export const LIBROS_CONTABLES_PLIEGO_MAYOR_GROUPS: LibroPliegoMayorGroup[] = [
  {
    id: 'pliego-mayor-1101',
    fecha: '03/06/2024',
    codigo: '1101',
    cuenta: 'CAJA Y BANCOS',
    detalles: [
      { minen: '000056', nombre: 'USE 01 San Juan de Miraflores', debe: 425922.53, haber: 352644.98, saldo: 73277.55 },
      { minen: '000057', nombre: 'USE 02 San Martin de Porras', debe: 815625.30, haber: 490366.99, saldo: 325258.31 },
      { minen: '000058', nombre: 'USE 03 Cercado', debe: 2722128.74, haber: 1498990.63, saldo: 1223138.11 },
      { minen: '000059', nombre: 'USE 04 Comas', debe: 538089.15, haber: 316528.44, saldo: 221560.71 },
    ],
  },
];

export const LIBROS_CONTABLES_PLIEGO_VIENEN_DEBE = 119251876641.44;
export const LIBROS_CONTABLES_PLIEGO_VIENEN_HABER = 119251876641.44;
export const LIBROS_CONTABLES_PLIEGO_VAN_DEBE = 119251876641.44;
export const LIBROS_CONTABLES_PLIEGO_VAN_HABER = 119251876641.44;

export const LIBROS_CONTABLES_RESULT_VIENEN_DEBE = 29810868889.70;
export const LIBROS_CONTABLES_RESULT_VIENEN_HABER = 29810868889.70;

export const LIBROS_CONTABLES_RESULT_TOTAL_DEBE = 29810874908.22;
export const LIBROS_CONTABLES_RESULT_TOTAL_HABER = 29810874908.22;

export const ACCOUNTING_BOOKS_CUENTAS: TextFieldOption[] = [
  { label: '1.1.3.1.1.1 - Venta de bienes por cobrar', value: '1.1.3.1.1.1' },
  { label: '1.2.1.1.01 - Caja y bancos', value: '1.2.1.1.01' },
  { label: '4.1.1.1.01 - Ingresos tributarios', value: '4.1.1.1.01' },
  { label: '5.3.1.1.01 - Gastos en bienes y servicios', value: '5.3.1.1.01' },
  { label: '5.8.0.1.0.5 - Estimaciones de cobranza dudosa - cuentas por cobrar', value: '5.8.0.1.0.5' },
];

export type LibroDiarioEntry = {
  id: string;
  fecha: string;
  asiento: string;
  glosa: string;
  cuenta: string;
  cuentaNombre: string;
  debe: number;
  haber: number;
};

export const LIBRO_DIARIO_MOCK: LibroDiarioEntry[] = [
  { id: 'd1', fecha: '02/06/2026', asiento: '000045', glosa: 'Provisión de cobranza dudosa del periodo', cuenta: '5.8.0.1.0.5', cuentaNombre: 'Estimaciones de cobranza dudosa - cuentas por cobrar', debe: 12500, haber: 0 },
  { id: 'd2', fecha: '02/06/2026', asiento: '000045', glosa: 'Provisión de cobranza dudosa del periodo', cuenta: '1.1.3.1.1.1', cuentaNombre: 'Venta de bienes por cobrar', debe: 0, haber: 12500 },
  { id: 'd3', fecha: '05/06/2026', asiento: '000046', glosa: 'Registro de ingresos tributarios recaudados', cuenta: '1.2.1.1.01', cuentaNombre: 'Caja y bancos', debe: 48000, haber: 0 },
  { id: 'd4', fecha: '05/06/2026', asiento: '000046', glosa: 'Registro de ingresos tributarios recaudados', cuenta: '4.1.1.1.01', cuentaNombre: 'Ingresos tributarios', debe: 0, haber: 48000 },
  { id: 'd5', fecha: '10/06/2026', asiento: '000047', glosa: 'Pago de bienes y servicios de la entidad', cuenta: '5.3.1.1.01', cuentaNombre: 'Gastos en bienes y servicios', debe: 15750, haber: 0 },
  { id: 'd6', fecha: '10/06/2026', asiento: '000047', glosa: 'Pago de bienes y servicios de la entidad', cuenta: '1.2.1.1.01', cuentaNombre: 'Caja y bancos', debe: 0, haber: 15750 },
];

export type LibroMayorMovimiento = {
  fecha: string;
  asiento: string;
  glosa: string;
  debe: number;
  haber: number;
};

export type LibroMayorCuenta = {
  cuenta: string;
  cuentaNombre: string;
  saldoInicial: number;
  movimientos: LibroMayorMovimiento[];
};

export const LIBRO_MAYOR_MOCK: Record<string, LibroMayorCuenta> = {
  '1.1.3.1.1.1': {
    cuenta: '1.1.3.1.1.1',
    cuentaNombre: 'Venta de bienes por cobrar',
    saldoInicial: 32000,
    movimientos: [
      { fecha: '02/06/2026', asiento: '000045', glosa: 'Provisión de cobranza dudosa del periodo', debe: 0, haber: 12500 },
    ],
  },
  '1.2.1.1.01': {
    cuenta: '1.2.1.1.01',
    cuentaNombre: 'Caja y bancos',
    saldoInicial: 105000,
    movimientos: [
      { fecha: '05/06/2026', asiento: '000046', glosa: 'Registro de ingresos tributarios recaudados', debe: 48000, haber: 0 },
      { fecha: '10/06/2026', asiento: '000047', glosa: 'Pago de bienes y servicios de la entidad', debe: 0, haber: 15750 },
    ],
  },
  '4.1.1.1.01': {
    cuenta: '4.1.1.1.01',
    cuentaNombre: 'Ingresos tributarios',
    saldoInicial: 0,
    movimientos: [
      { fecha: '05/06/2026', asiento: '000046', glosa: 'Registro de ingresos tributarios recaudados', debe: 0, haber: 48000 },
    ],
  },
  '5.3.1.1.01': {
    cuenta: '5.3.1.1.01',
    cuentaNombre: 'Gastos en bienes y servicios',
    saldoInicial: 0,
    movimientos: [
      { fecha: '10/06/2026', asiento: '000047', glosa: 'Pago de bienes y servicios de la entidad', debe: 15750, haber: 0 },
    ],
  },
  '5.8.0.1.0.5': {
    cuenta: '5.8.0.1.0.5',
    cuentaNombre: 'Estimaciones de cobranza dudosa - cuentas por cobrar',
    saldoInicial: 0,
    movimientos: [
      { fecha: '02/06/2026', asiento: '000045', glosa: 'Provisión de cobranza dudosa del periodo', debe: 12500, haber: 0 },
    ],
  },
};
