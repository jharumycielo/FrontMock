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

// Opciones de Pliego para el visualizador ENTE RECTOR (filtro adicional).
export const LIBROS_CONTABLES_PLIEGO_OPTIONS: TextFieldOption[] = [
  { label: 'Ministerio de Salud', value: 'minsa' },
  { label: 'Ministerio de Educación', value: 'minedu' },
  { label: 'Ministerio de Economía y Finanzas', value: 'mef' },
  { label: 'Ministerio del Interior', value: 'mininter' },
  { label: 'Ministerio de Transportes y Comunicaciones', value: 'mtc' },
];

// Opciones de Unidad Ejecutora para el visualizador ENTE RECTOR (filtro adicional).
export const LIBROS_CONTABLES_UNIDAD_EJECUTORA_OPTIONS: TextFieldOption[] = [
  { label: 'Todos', value: 'todos' },
  { label: 'Hospital Dos de Mayo', value: 'hdm' },
  { label: 'Hospital María Auxiliadora', value: 'hma' },
  { label: 'Instituto Nacional de Salud del Niño', value: 'insn' },
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
  // Datos del pliego y unidad ejecutora (visualizador Unidad Ejecutora · Libro Diario).
  pliego: 'Ministerio de Salud',
  unidadEjecutora: 'Hospital Dos de Mayo',
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
  /** Tipo de registro del asiento (ej. Asiento de ajuste). */
  tipoRegistro: string;
  /** Tipo de documento de origen (ej. Factura). */
  tipoDocumento: string;
  /** Nro. Documento Contable = Nro. Asiento Contable sin los decimales (ej. 938-2026-5163). */
  nroDocContable: string;
  /** Nro. Asiento Contable (con decimales, ej. 938-2026-5163.1.1). */
  codCuenta: string;
  fecha: string;
  /** Código del documento de origen (ej. 000000003-0002). */
  codDocOrigen: string;
  /** Nombre del documento de origen (ej. DISPOSITIVO LEGAL O ACTO DE ADMINISTRACIÓN). */
  documento: string;
  cuentas: LibroContableAccountRow[];
};

export const LIBROS_CONTABLES_RESULT_GROUPS: LibroContableOperacionGroup[] = [
  {
    id: 'op1',
    tipoRegistro: 'Asiento de ajuste',
    tipoDocumento: 'Factura',
    nroDocContable: '938-2026-5396',
    codCuenta: '938-2026-5396.1.1',
    fecha: '03/06/2024',
    codDocOrigen: '0000001350',
    documento: 'Nota de pago',
    cuentas: [
      { codigo: '8301', nombre: 'PRESUPUESTOS DE GASTOS', nivel: 1, debe: 1000, haber: 0 },
      { codigo: '8301.01', nombre: 'Recursos Ordinarios', nivel: 2, debe: 1000, haber: 0 },
      { codigo: '8301.01.01', nombre: 'Recursos Ordinarios', nivel: 3, debe: 1000, haber: 0 },
      { codigo: '8401', nombre: 'ASIGNACIONES COMPROMETIDAS', nivel: 1, debe: 0, haber: 1000 },
      { codigo: '8401.01', nombre: 'Recursos Ordinarios', nivel: 2, debe: 1000, haber: 0 },
      { codigo: '8401.01.01', nombre: 'Recursos Ordinarios', nivel: 3, debe: 1000, haber: 0 },
      { codigo: 'OT2024-INT-004449', nombre: 'RENDICIÓN Y REPOSICIÓN DE CAJA CHICA UE 024 OT', nivel: 1, debe: 0, haber: 0 },
    ],
  },
];

// Libro Diario para el visualizador PLIEGO con Entidad "Integrado a nivel pliego":
// la misma vista del diario estándar, agrupada por Unidad Ejecutora en acordeones.
export type LibroPliegoDiarioUeGroup = {
  id: string;
  unidadEjecutora: string;
  operaciones: LibroContableOperacionGroup[];
};

/**
 * Clona las operaciones estándar con ids únicos por Unidad Ejecutora (evita colisiones de
 * selección/expansión) y un Nro. Doc Contable/Nro. Asiento propio de esa UE — cada unidad
 * ejecutora contabiliza sus propios asientos, no puede repetir el número de otra.
 */
function pliegoDiarioUeOperaciones(prefix: string, nroBase: number): LibroContableOperacionGroup[] {
  return LIBROS_CONTABLES_RESULT_GROUPS.map((group, index) => {
    const nroDocContable = `938-2026-${nroBase + index}`;
    return { ...group, id: `${prefix}-${group.id}`, nroDocContable, codCuenta: `${nroDocContable}.1.1` };
  });
}

/**
 * Asiento propio de Hospital María Auxiliadora: serie 939 (distinta de la 938 de Hospital
 * Dos de Mayo) y cuentas de orden por contratos, con su documento de origen y glosa propios.
 */
const PLIEGO_DIARIO_MARIA_AUXILIADORA_OPERACIONES: LibroContableOperacionGroup[] = [
  {
    id: 'ue-mau-op1',
    tipoRegistro: 'Asiento de ajuste',
    tipoDocumento: 'Orden de servicio',
    nroDocContable: '939-2026-5162',
    codCuenta: '939-2026-5162.1.2',
    fecha: '03/06/2024',
    codDocOrigen: '000000181-0043',
    documento: 'ORDEN DE SERVICIO',
    cuentas: [
      { codigo: '9101', nombre: 'CONTRATOS O COMPROMISOS APROBADOS', nivel: 1, debe: 1000, haber: 0 },
      { codigo: '9101.09', nombre: 'Ordenes de Servicio Aprobadas', nivel: 2, debe: 1000, haber: 0 },
      { codigo: '9102', nombre: 'CONTRATOS Y COMPROMISOS POR CONTRA', nivel: 1, debe: 0, haber: 1000 },
      { codigo: '9102.09', nombre: 'Ordenes de Servicio por Ejecutar', nivel: 2, debe: 1000, haber: 0 },
      { codigo: '', nombre: 'Adquisición de pasajes aereos', nivel: 1, debe: 0, haber: 0 },
    ],
  },
];

export const LIBROS_CONTABLES_PLIEGO_DIARIO_UE_GROUPS: LibroPliegoDiarioUeGroup[] = [
  { id: 'ue-hospital-dos-de-mayo', unidadEjecutora: 'Hospital Dos de Mayo', operaciones: pliegoDiarioUeOperaciones('ue-hdm', 5396) },
  { id: 'ue-maria-auxiliadora', unidadEjecutora: 'Hospital María Auxiliadora', operaciones: PLIEGO_DIARIO_MARIA_AUXILIADORA_OPERACIONES },
];

// Vista matricial (tabular) del Libro Diario para Unidad Ejecutora: una fila plana
// por movimiento, con todas las dimensiones repetidas, apta para tablas dinámicas.
export type LibroDiarioMatrixRow = {
  ejercicio: number;
  cuentaMayor: string;
  descMayor: string;
  cuentaSubCta: string;
  fecha: string;
  /** Tipo de registro del asiento (ej. Asiento de ajuste). */
  tipoRegistro: string;
  /** Tipo de documento de origen (ej. Factura). */
  tipoDocumento: string;
  /** Nro. Registro Contable = Nro. Asiento sin los decimales. */
  nroDocContable: string;
  /** Código del documento de origen. */
  codDocOrigen: string;
  /** Nombre del documento de origen. */
  documentoOrigen: string;
  nroDocumentoOrigen: string;
  nroAsiento: string;
  tipoDH: 'Debe' | 'Haber';
  naturaleza: 'Deudora' | 'Acreedora';
  montoDebe: number;
  montoHaber: number;
};

const DOC_ORIGEN_COD = '0000001350';
const DOC_ORIGEN_NOMBRE = 'Nota de pago';

export const LIBROS_CONTABLES_DIARIO_MATRIX_ROWS: LibroDiarioMatrixRow[] = [
  { ejercicio: 2026, cuentaMayor: '8301', descMayor: 'PRESUPUESTOS DE GASTOS', cuentaSubCta: '01', fecha: '03/06/2024', tipoRegistro: 'Asiento de ajuste', tipoDocumento: 'Factura', nroDocContable: '938-2026-5396', codDocOrigen: DOC_ORIGEN_COD, documentoOrigen: DOC_ORIGEN_NOMBRE, nroDocumentoOrigen: 'DOC-0000000001', nroAsiento: '938-2026-5396.1.1', tipoDH: 'Debe', naturaleza: 'Deudora', montoDebe: 1000, montoHaber: 0 },
  { ejercicio: 2026, cuentaMayor: '8301', descMayor: 'PRESUPUESTOS DE GASTOS', cuentaSubCta: '0101', fecha: '03/06/2024', tipoRegistro: 'Asiento de ajuste', tipoDocumento: 'Factura', nroDocContable: '938-2026-5396', codDocOrigen: DOC_ORIGEN_COD, documentoOrigen: DOC_ORIGEN_NOMBRE, nroDocumentoOrigen: 'DOC-0000000002', nroAsiento: '938-2026-5396.1.1', tipoDH: 'Debe', naturaleza: 'Deudora', montoDebe: 1000, montoHaber: 0 },
  { ejercicio: 2026, cuentaMayor: '8301', descMayor: 'PRESUPUESTOS DE GASTOS', cuentaSubCta: '0102', fecha: '03/06/2024', tipoRegistro: 'Asiento de ajuste', tipoDocumento: 'Factura', nroDocContable: '938-2026-5396', codDocOrigen: DOC_ORIGEN_COD, documentoOrigen: DOC_ORIGEN_NOMBRE, nroDocumentoOrigen: 'DOC-0000000003', nroAsiento: '938-2026-5396.1.1', tipoDH: 'Debe', naturaleza: 'Deudora', montoDebe: 1000, montoHaber: 0 },
  { ejercicio: 2026, cuentaMayor: '8301', descMayor: 'PRESUPUESTOS DE GASTOS', cuentaSubCta: '0103', fecha: '03/06/2024', tipoRegistro: 'Asiento de ajuste', tipoDocumento: 'Factura', nroDocContable: '938-2026-5396', codDocOrigen: DOC_ORIGEN_COD, documentoOrigen: DOC_ORIGEN_NOMBRE, nroDocumentoOrigen: 'DOC-0000000004', nroAsiento: '938-2026-5396.1.1', tipoDH: 'Haber', naturaleza: 'Deudora', montoDebe: 0, montoHaber: 3000 },
  { ejercicio: 2026, cuentaMayor: '8401', descMayor: 'ASIGNACIONES COMPROMETIDAS', cuentaSubCta: '01', fecha: '03/06/2024', tipoRegistro: 'Asiento de ajuste', tipoDocumento: 'Factura', nroDocContable: '938-2026-5396', codDocOrigen: DOC_ORIGEN_COD, documentoOrigen: DOC_ORIGEN_NOMBRE, nroDocumentoOrigen: 'DOC-0000000005', nroAsiento: '938-2026-5396.1.1', tipoDH: 'Haber', naturaleza: 'Acreedora', montoDebe: 0, montoHaber: 1000 },
  { ejercicio: 2026, cuentaMayor: '8401', descMayor: 'ASIGNACIONES COMPROMETIDAS', cuentaSubCta: '02', fecha: '03/06/2024', tipoRegistro: 'Asiento de ajuste', tipoDocumento: 'Factura', nroDocContable: '938-2026-5396', codDocOrigen: DOC_ORIGEN_COD, documentoOrigen: DOC_ORIGEN_NOMBRE, nroDocumentoOrigen: 'DOC-0000000006', nroAsiento: '938-2026-5396.1.1', tipoDH: 'Debe', naturaleza: 'Acreedora', montoDebe: 1000, montoHaber: 0 },
];

export type LibroMayorResultRow = {
  fecha: string;
  docCaRegNota: string;
  /** Nro. Documento Contable = Nro. Asiento sin los decimales. */
  nroDocContable: string;
  /** Tipo de asiento (ej. Asiento de ajuste, Serv. de contabilización). */
  tipo: string;
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
      { fecha: '03/06/2024', docCaRegNota: 'R0000004025', nroDocContable: '938-2026-5396', tipo: 'Asiento de ajuste', documento: 'Nota de pago', nroDocumento: '0000001350', nroAsiento: '938-2026-5396.1.1', debe: 73.13, haber: 0 },
      { fecha: '03/06/2024', docCaRegNota: 'R0000004025', nroDocContable: '938-2026-5393', tipo: 'Serv. de contabilización', documento: 'Rendición de cuenta', nroDocumento: '0000001181', nroAsiento: '938-2026-5393.1.2', debe: 0, haber: 73.13 },
      { fecha: '03/06/2024', docCaRegNota: 'R0000004031', nroDocContable: '938-2026-5401', tipo: 'Serv. de contabilización', documento: 'Nota de pago', nroDocumento: '0000001344', nroAsiento: '938-2026-5401.2.1', debe: 73.20, haber: 0 },
      { fecha: '03/06/2024', docCaRegNota: 'R0000004031', nroDocContable: '938-2026-5398', tipo: 'Serv. de contabilización', documento: 'Rendición de cuenta', nroDocumento: '0000001346', nroAsiento: '938-2026-5398.2.2', debe: 0, haber: 73.20 },
      { fecha: '03/06/2024', docCaRegNota: 'R0000004044', nroDocContable: '938-2026-5409', tipo: 'Asiento de ajuste', documento: 'Rendición de cuenta', nroDocumento: '0000001347', nroAsiento: '938-2026-5409.3.1', debe: 0, haber: 864.19 },
      { fecha: '03/06/2024', docCaRegNota: 'R0000004044', nroDocContable: '938-2026-5412', tipo: 'Asiento de ajuste', documento: 'Rendición de cuenta', nroDocumento: '0000001348', nroAsiento: '938-2026-5412.3.2', debe: 0, haber: 145.00 },
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
  { fecha: '31/07/2026', codAsiento: '000-2026-5163.1.1', mayor: '1101', subCuenta: 'Caja y bancos', subCuentaIndent: 0, mnen: '', nombre: '', debe: 92191377.19, haber: 0 },
  { fecha: '', codAsiento: '', mayor: '', subCuenta: '1101.01 Caja', subCuentaIndent: 1, mnen: '', nombre: '', debe: 39372877.45, haber: 0 },
  { fecha: '', codAsiento: '', mayor: '', subCuenta: '1101.0101 Caja M/N', subCuentaIndent: 2, mnen: '', nombre: '', debe: 39372877.45, haber: 0 },
  { fecha: '', codAsiento: '', mayor: '', subCuenta: '', subCuentaIndent: 0, mnen: '000056', nombre: 'USE 01 San Juan de Miraflores', debe: 8631.33, haber: 0 },
  { fecha: '', codAsiento: '', mayor: '', subCuenta: '', subCuentaIndent: 0, mnen: '000057', nombre: 'USE 02 San Martin de Porras', debe: 16045.33, haber: 0 },
  { fecha: '', codAsiento: '', mayor: '', subCuenta: '', subCuentaIndent: 0, mnen: '000058', nombre: 'USE 03 Cercado', debe: 85109.28, haber: 0 },
  { fecha: '', codAsiento: '', mayor: '', subCuenta: '', subCuentaIndent: 0, mnen: '000059', nombre: 'USE 04 Comas', debe: 20433.80, haber: 0 },
  { fecha: '', codAsiento: '', mayor: '', subCuenta: '', subCuentaIndent: 0, mnen: '000060', nombre: 'USE 05 San Juan de Lurigancho', debe: 8075.91, haber: 0 },
  { fecha: '', codAsiento: '', mayor: '', subCuenta: '', subCuentaIndent: 0, mnen: '000061', nombre: 'USE 06 Vitarte', debe: 87.50, haber: 0 },
  { fecha: '', codAsiento: '', mayor: '', subCuenta: '', subCuentaIndent: 0, mnen: '000062', nombre: 'USE 07 San Borja', debe: 12375.37, haber: 0 },
  { fecha: '', codAsiento: '', mayor: '', subCuenta: '', subCuentaIndent: 0, mnen: '000058', nombre: 'Dirección de Educación de Lima', debe: 653862.05, haber: 0 },
  { fecha: '', codAsiento: '', mayor: '', subCuenta: '', subCuentaIndent: 0, mnen: '000058', nombre: 'Escuela Nacional de Bellas Artes', debe: 55056.13, haber: 0 },
];

// Resultado del Libro Mayor para el usuario visualizador PLIEGO
// (Entidad: Integrado a nivel pliego). Agrupado por cuenta mayor con detalle
// por unidad ejecutora (mnemónico), incluyendo saldo.
export type LibroPliegoMayorRow = {
  minen: string;
  nombre: string;
  saldoInicial: number;
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
      { minen: '000056', nombre: 'USE 01 San Juan de Miraflores', saldoInicial: 5922.53, debe: 425922.53, haber: 352644.98, saldo: 73277.55 },
      { minen: '000057', nombre: 'USE 02 San Martin de Porras', saldoInicial: 15625.30, debe: 815625.30, haber: 490366.99, saldo: 325258.31 },
      { minen: '000058', nombre: 'USE 03 Cercado', saldoInicial: 2128.74, debe: 2722128.74, haber: 1498990.63, saldo: 1223138.11 },
      { minen: '000059', nombre: 'USE 04 Comas', saldoInicial: 8089.15, debe: 538089.15, haber: 316528.44, saldo: 221560.71 },
    ],
  },
];

/**
 * Libro Mayor Extendido (visualizador Unidad Ejecutora, variante "Libro mayor extendido").
 * Reutiliza la estructura consolidada por unidad ejecutora del Libro Mayor integrado a pliego,
 * pero el código de cuenta se muestra a nivel sub-cuenta (1101.01 en vez de 1101).
 */
export const LIBROS_CONTABLES_MAYOR_EXTENDIDO_GROUPS: LibroPliegoMayorGroup[] = [
  {
    id: 'mayor-ext-1101-01',
    fecha: '03/06/2024',
    codigo: '1101.01',
    cuenta: 'Recursos Ordinarios',
    detalles: [
      { minen: '000056', nombre: 'USE 01 San Juan de Miraflores', saldoInicial: 309854.68, debe: 425922.53, haber: 352644.98, saldo: 73277.55 },
      { minen: '000057', nombre: 'USE 02 San Martin de Porras', saldoInicial: 315625.30, debe: 815625.30, haber: 490366.99, saldo: 325258.31 },
      { minen: '000058', nombre: 'USE 03 Cercado', saldoInicial: 2128.74, debe: 2722128.74, haber: 1498990.63, saldo: 1223138.11 },
      { minen: '000059', nombre: 'USE 04 Comas', saldoInicial: 38089.15, debe: 538089.15, haber: 316528.44, saldo: 221560.71 },
    ],
  },
];

/**
 * Libro Mayor Extendido consolidado por Unidad Ejecutora (visualizador ENTE RECTOR,
 * variante "Libro mayor extendido" con Unidad Ejecutora = "Todos"). Cada unidad ejecutora
 * es un acordeón que agrupa sus sub-cuentas (1101.01, 1101.02, …) con el detalle por USE.
 */
export type LibroMayorExtendidoUeGroup = {
  id: string;
  unidadEjecutora: string;
  cuentas: LibroPliegoMayorGroup[];
};

export const LIBROS_CONTABLES_MAYOR_EXTENDIDO_UE_GROUPS: LibroMayorExtendidoUeGroup[] = [
  {
    id: 'mayor-ext-ue-hdm',
    unidadEjecutora: 'Hospital Dos de Mayo',
    cuentas: [
      {
        id: 'mayor-ext-hdm-1101-01',
        fecha: '03/06/2024',
        codigo: '1101.01',
        cuenta: 'Recursos Ordinarios',
        detalles: [
          { minen: '000056', nombre: 'USE 01 San Juan de Miraflores', saldoInicial: 5922.53, debe: 425922.53, haber: 352644.98, saldo: 73277.55 },
          { minen: '000057', nombre: 'USE 02 San Martin de Porras', saldoInicial: 5625.30, debe: 815625.30, haber: 490366.99, saldo: 325258.31 },
          { minen: '000058', nombre: 'USE 03 Cercado', saldoInicial: 2128.74, debe: 2722128.74, haber: 1498990.63, saldo: 1223138.11 },
          { minen: '000059', nombre: 'USE 04 Comas', saldoInicial: 8089.15, debe: 538089.15, haber: 316528.44, saldo: 221560.71 },
        ],
      },
      {
        id: 'mayor-ext-hdm-1101-02',
        fecha: '03/06/2024',
        codigo: '1101.02',
        cuenta: 'Ordenes de Servicio Aprobadas',
        detalles: [
          { minen: '000060', nombre: 'USE 05 San Juan de Lurigancho', saldoInicial: 1075.91, debe: 8075.91, haber: 0, saldo: 8075.91 },
          { minen: '000061', nombre: 'USE 06 Vitarte', saldoInicial: 87.50, debe: 87.50, haber: 0, saldo: 87.50 },
        ],
      },
    ],
  },
  {
    id: 'mayor-ext-ue-hma',
    unidadEjecutora: 'Hospital María Auxiliadora',
    cuentas: [
      {
        id: 'mayor-ext-hma-1102-01',
        fecha: '03/06/2024',
        codigo: '1102.01',
        cuenta: 'Recursos Ordinarios',
        detalles: [
          { minen: '000062', nombre: 'USE 07 San Borja', saldoInicial: 2375.37, debe: 12375.37, haber: 0, saldo: 12375.37 },
          { minen: '000063', nombre: 'USE 08 Surquillo', saldoInicial: 53411.95, debe: 653862.05, haber: 120450.10, saldo: 533411.95 },
        ],
      },
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
