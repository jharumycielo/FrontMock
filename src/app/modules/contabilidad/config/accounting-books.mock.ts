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
  { label: 'Hospital Dos de Mayo', value: 'hdm' },
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

// ---------------------------------------------------------------------------
// Constructores de mock data. Garantizan las reglas contables en todos los libros:
//  - Partida doble: en cada asiento Σ Debe = Σ Haber.
//  - Nro. Doc. Contable = Nro. Asiento Contable sin los decimales.
//  - Cada Unidad Ejecutora numera sus asientos con su propia serie (938, 939, 940).
//  - Saldo = Saldo inicial + Debe − Haber.
//  - El Libro Mayor se obtiene de los mismos asientos del Libro Diario.
// ---------------------------------------------------------------------------

type CuentaRef = readonly [codigo: string, nombre: string];
type Naturaleza = 'Deudora' | 'Acreedora';
type CuentaMayorRef = readonly [codigo: string, nombre: string, naturaleza: Naturaleza];

const CTA = {
  cajaBancos: ['1101', 'CAJA Y BANCOS', 'Deudora'],
  anticipos: ['1205', 'SERVICIOS Y OTROS PAGADOS POR ANTICIPADO', 'Deudora'],
  depreciacionAcum: ['1508', 'DEPRECIACIÓN, AMORTIZACIÓN Y AGOTAMIENTO', 'Acreedora'],
  contribuciones: ['2101', 'IMPUESTOS, CONTRIBUCIONES Y OTROS', 'Acreedora'],
  remuneraciones: ['2102', 'REMUNERACIONES Y BENEFICIOS SOCIALES', 'Acreedora'],
  proveedores: ['2103', 'CUENTAS POR PAGAR A PROVEEDORES', 'Acreedora'],
  ventaServicios: ['4301', 'VENTA DE BIENES Y SERVICIOS', 'Acreedora'],
  personal: ['5201', 'PERSONAL Y OBLIGACIONES SOCIALES', 'Deudora'],
  compraBienes: ['5301', 'COMPRA DE BIENES', 'Deudora'],
  estimaciones: ['5801', 'ESTIMACIONES Y PROVISIONES DEL EJERCICIO', 'Deudora'],
  presupuestoGastos: ['8301', 'PRESUPUESTOS DE GASTOS', 'Deudora'],
  asignacionesComprometidas: ['8401', 'ASIGNACIONES COMPROMETIDAS', 'Acreedora'],
  contratosAprobados: ['9101', 'CONTRATOS O COMPROMISOS APROBADOS', 'Deudora'],
  contratosPorContra: ['9102', 'CONTRATOS Y COMPROMISOS POR CONTRA', 'Acreedora'],
} as const satisfies Record<string, CuentaMayorRef>;

type Partida = {
  lado: 'D' | 'H';
  mayor: CuentaMayorRef;
  sub: CuentaRef;
  /** Divisionaria (nivel 3). Algunas cuentas de orden solo llegan a nivel 2. */
  det?: CuentaRef;
  monto: number;
};

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

const debe = (mayor: CuentaMayorRef, sub: CuentaRef, det: CuentaRef | undefined, monto: number): Partida => ({ lado: 'D', mayor, sub, det, monto });
const haber = (mayor: CuentaMayorRef, sub: CuentaRef, det: CuentaRef | undefined, monto: number): Partida => ({ lado: 'H', mayor, sub, det, monto });

type OperacionConPartidas = LibroContableOperacionGroup & { partidas: Partida[] };

type OperacionMock = Omit<LibroContableOperacionGroup, 'nroDocContable' | 'cuentas'> & {
  partidas: Partida[];
  /** Fila final del asiento: código y glosa del documento que lo sustenta. */
  referencia: CuentaRef;
};

/**
 * Arma las filas jerárquicas del asiento (mayor → sub-cuenta → divisionaria) agrupando por
 * cuenta mayor y lado, y valida la partida doble.
 */
function filasAsiento(codCuenta: string, partidas: Partida[], referencia: CuentaRef): LibroContableAccountRow[] {
  const totalDebe = round2(partidas.filter((p) => p.lado === 'D').reduce((t, p) => t + p.monto, 0));
  const totalHaber = round2(partidas.filter((p) => p.lado === 'H').reduce((t, p) => t + p.monto, 0));
  if (totalDebe !== totalHaber) {
    throw new Error(`Asiento ${codCuenta} descuadrado: Debe ${totalDebe} ≠ Haber ${totalHaber}`);
  }

  const cuentas: LibroContableAccountRow[] = [];
  const grupos = new Map<string, Partida[]>();
  for (const partida of partidas) {
    const key = `${partida.lado}-${partida.mayor[0]}`;
    grupos.set(key, [...(grupos.get(key) ?? []), partida]);
  }
  for (const partidas of grupos.values()) {
    const { lado, mayor } = partidas[0];
    const total = round2(partidas.reduce((t, p) => t + p.monto, 0));
    cuentas.push({ codigo: mayor[0], nombre: mayor[1], nivel: 1, debe: lado === 'D' ? total : 0, haber: lado === 'H' ? total : 0 });
    // Convención del Figma: el lado Debe/Haber lo indica la cuenta mayor; sub-cuentas y
    // divisionarias guardan el importe en `debe` para el escalonado (ver computeAmountSlots).
    for (const partida of partidas) {
      cuentas.push({ codigo: partida.sub[0], nombre: partida.sub[1], nivel: 2, debe: partida.monto, haber: 0 });
      if (partida.det) {
        cuentas.push({ codigo: partida.det[0], nombre: partida.det[1], nivel: 3, debe: partida.monto, haber: 0 });
      }
    }
  }
  cuentas.push({ codigo: referencia[0], nombre: referencia[1], nivel: 1, debe: 0, haber: 0 });
  return cuentas;
}

function operacion(op: OperacionMock): OperacionConPartidas {
  const { referencia, ...rest } = op;
  return { ...rest, nroDocContable: op.codCuenta.split('.')[0], cuentas: filasAsiento(op.codCuenta, op.partidas, referencia) };
}

// Sub-cuentas y divisionarias usadas por los asientos.
const SUB = {
  bancos: ['1101.03', 'Bancos'],
  bancosCtaCte: ['1101.0301', 'Cuenta corriente M/N'],
  entregasRendir: ['1205.03', 'Entregas a rendir cuenta'],
  encargosInternos: ['1205.0301', 'Encargos internos'],
  depAcumMaquinaria: ['1508.01', 'Depreciación acumulada de vehículos, maquinaria y otros'],
  depAcumEquipo: ['1508.0103', 'Maquinaria, equipo y otras unidades'],
  essaludPorPagar: ['2101.03', 'Contribuciones a EsSalud por pagar'],
  essaludPorPagarDet: ['2101.0301', 'Contribuciones a EsSalud'],
  remunPorPagar: ['2102.01', 'Remuneraciones por pagar'],
  remunPorPagarDet: ['2102.0101', 'Personal administrativo y asistencial'],
  provBienesServicios: ['2103.01', 'Bienes y servicios'],
  provNacionales: ['2103.0101', 'Proveedores nacionales'],
  ventaServicios: ['4301.02', 'Venta de servicios'],
  serviciosSalud: ['4301.0201', 'Servicios de salud'],
  retribuciones: ['5201.01', 'Retribuciones y complementos en efectivo'],
  retribucionesDet: ['5201.0101', 'Personal administrativo y asistencial'],
  essalud: ['5201.03', 'Contribuciones a EsSalud'],
  essaludDet: ['5201.0301', 'Contribuciones a EsSalud'],
  suministrosMedicos: ['5301.08', 'Suministros médicos'],
  medicamentos: ['5301.0801', 'Medicamentos'],
  materialMedico: ['5301.0802', 'Material médico descartable'],
  depreciacion: ['5801.02', 'Depreciación de vehículos, maquinaria y otros'],
  depreciacionEquipo: ['5801.0203', 'Maquinaria, equipo y otras unidades'],
  presupuestoRo: ['8301.01', 'Recursos Ordinarios'],
  presupuestoRoDet: ['8301.0101', 'Recursos Ordinarios'],
  comprometidoRo: ['8401.01', 'Recursos Ordinarios'],
  comprometidoRoDet: ['8401.0101', 'Recursos Ordinarios'],
  ordenesServicioAprobadas: ['9101.09', 'Ordenes de Servicio Aprobadas'],
  ordenesServicioPorEjecutar: ['9102.09', 'Ordenes de Servicio por Ejecutar'],
  materialesUtiles: ['5301.02', 'Materiales y útiles'],
  materialesOficina: ['5301.0201', 'Materiales y útiles de oficina'],
  cas: ['5201.05', 'Contrato Administrativo de Servicios'],
  casDet: ['5201.0501', 'Retribución CAS'],
  depreciacionEdificios: ['5801.01', 'Depreciación de edificios y estructuras'],
  depreciacionEdificiosDet: ['5801.0101', 'Edificios'],
  depAcumEdificios: ['1508.02', 'Depreciación acumulada de edificios y estructuras'],
  depAcumEdificiosDet: ['1508.0201', 'Edificios'],
} as const satisfies Record<string, CuentaRef>;

/** Asientos de Hospital Dos de Mayo (serie 938), en orden cronológico. */
const HDM_OPERACIONES: OperacionConPartidas[] = [
  {
    id: 'op1',
    tipoRegistro: 'Asiento de ajuste',
    tipoDocumento: 'Factura',
    nroDocContable: '938-2026-5396',
    codCuenta: '938-2026-5396.1.1',
    fecha: '03/06/2026',
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
    partidas: [
      debe(CTA.presupuestoGastos, SUB.presupuestoRo, SUB.presupuestoRoDet, 1000),
      haber(CTA.asignacionesComprometidas, SUB.comprometidoRo, SUB.comprometidoRoDet, 1000),
    ],
  },
  operacion({
    id: 'op2',
    tipoRegistro: 'Serv. de contabilización',
    tipoDocumento: 'Orden de compra',
    codCuenta: '938-2026-5420.1.1',
    fecha: '05/06/2026',
    codDocOrigen: '0000001402',
    documento: 'Orden de compra - Guía de internamiento',
    partidas: [
      debe(CTA.compraBienes, SUB.suministrosMedicos, SUB.medicamentos, 18450),
      haber(CTA.proveedores, SUB.provBienesServicios, SUB.provNacionales, 18450),
    ],
    referencia: ['OC-2026-000412', 'ADQUISICIÓN DE MEDICAMENTOS PARA FARMACIA CENTRAL'],
  }),
  operacion({
    id: 'op3',
    tipoRegistro: 'Serv. de contabilización',
    tipoDocumento: 'Comprobante de pago',
    codCuenta: '938-2026-5421.1.1',
    fecha: '08/06/2026',
    codDocOrigen: '0000001405',
    documento: 'Comprobante de pago',
    partidas: [
      debe(CTA.proveedores, SUB.provBienesServicios, SUB.provNacionales, 18450),
      haber(CTA.cajaBancos, SUB.bancos, SUB.bancosCtaCte, 18450),
    ],
    referencia: ['CP-2026-001205', 'PAGO A PROVEEDOR POR ADQUISICIÓN DE MEDICAMENTOS'],
  }),
  operacion({
    id: 'op4',
    tipoRegistro: 'Serv. de contabilización',
    tipoDocumento: 'Planilla',
    codCuenta: '938-2026-5422.1.1',
    fecha: '12/06/2026',
    codDocOrigen: '0000001411',
    documento: 'Planilla única de remuneraciones',
    partidas: [
      debe(CTA.personal, SUB.retribuciones, SUB.retribucionesDet, 86320.5),
      debe(CTA.personal, SUB.essalud, SUB.essaludDet, 7768.85),
      haber(CTA.remuneraciones, SUB.remunPorPagar, SUB.remunPorPagarDet, 86320.5),
      haber(CTA.contribuciones, SUB.essaludPorPagar, SUB.essaludPorPagarDet, 7768.85),
    ],
    referencia: ['PLL-2026-06', 'PLANILLA DE REMUNERACIONES JUNIO 2026'],
  }),
  operacion({
    id: 'op5',
    tipoRegistro: 'Asiento de ajuste',
    tipoDocumento: 'Nota contable',
    codCuenta: '938-2026-5423.1.2',
    fecha: '20/06/2026',
    codDocOrigen: '0000001418',
    documento: 'Nota contable',
    partidas: [
      debe(CTA.estimaciones, SUB.depreciacion, SUB.depreciacionEquipo, 4215.6),
      haber(CTA.depreciacionAcum, SUB.depAcumMaquinaria, SUB.depAcumEquipo, 4215.6),
    ],
    referencia: ['NC-2026-000087', 'DEPRECIACIÓN MENSUAL DE EQUIPOS MÉDICOS'],
  }),
  operacion({
    id: 'op6',
    tipoRegistro: 'Serv. de contabilización',
    tipoDocumento: 'Recibo de ingreso',
    codCuenta: '938-2026-5424.1.1',
    fecha: '24/06/2026',
    codDocOrigen: '0000001421',
    documento: 'Recibo de ingreso',
    partidas: [
      debe(CTA.cajaBancos, SUB.bancos, SUB.bancosCtaCte, 12380),
      haber(CTA.ventaServicios, SUB.ventaServicios, SUB.serviciosSalud, 12380),
    ],
    referencia: ['RI-2026-003318', 'RECAUDACIÓN POR SERVICIOS DE CONSULTA EXTERNA'],
  }),
  operacion({
    id: 'op7',
    tipoRegistro: 'Asiento de ajuste',
    tipoDocumento: 'Orden de servicio',
    codCuenta: '938-2026-5425.1.1',
    fecha: '26/06/2026',
    codDocOrigen: '0000001426',
    documento: 'Orden de servicio',
    partidas: [
      debe(CTA.presupuestoGastos, SUB.presupuestoRo, SUB.presupuestoRoDet, 6200),
      haber(CTA.asignacionesComprometidas, SUB.comprometidoRo, SUB.comprometidoRoDet, 6200),
    ],
    referencia: ['OS-2026-000233', 'SERVICIO DE MANTENIMIENTO DE EQUIPOS DE RAYOS X'],
  }),
  operacion({
    id: 'op8',
    tipoRegistro: 'Serv. de contabilización',
    tipoDocumento: 'Resolución',
    codCuenta: '938-2026-5426.2.1',
    fecha: '29/06/2026',
    codDocOrigen: '0000001430',
    documento: 'Dispositivo legal o acto de administración',
    partidas: [
      debe(CTA.anticipos, SUB.entregasRendir, SUB.encargosInternos, 3500),
      haber(CTA.cajaBancos, SUB.bancos, SUB.bancosCtaCte, 3500),
    ],
    referencia: ['RD-2026-000145', 'ENCARGO INTERNO PARA CAMPAÑA DE VACUNACIÓN'],
  }),
  operacion({
    id: 'op9',
    tipoRegistro: 'Serv. de contabilización',
    tipoDocumento: 'Recibo de ingreso',
    codCuenta: '938-2026-5427.1.1',
    fecha: '03/06/2026',
    codDocOrigen: '0000001398',
    documento: 'Recibo de ingreso',
    partidas: [
      debe(CTA.cajaBancos, SUB.bancos, SUB.bancosCtaCte, 8640),
      haber(CTA.ventaServicios, SUB.ventaServicios, SUB.serviciosSalud, 8640),
    ],
    referencia: ['RI-2026-003201', 'RECAUDACIÓN POR SERVICIOS DE EMERGENCIA'],
  }),
  operacion({
    id: 'op10',
    tipoRegistro: 'Serv. de contabilización',
    tipoDocumento: 'Orden de compra',
    codCuenta: '938-2026-5428.1.1',
    fecha: '04/06/2026',
    codDocOrigen: '0000001400',
    documento: 'Orden de compra - Guía de internamiento',
    partidas: [
      debe(CTA.compraBienes, SUB.suministrosMedicos, SUB.materialMedico, 7325.4),
      haber(CTA.proveedores, SUB.provBienesServicios, SUB.provNacionales, 7325.4),
    ],
    referencia: ['OC-2026-000409', 'ADQUISICIÓN DE MATERIAL MÉDICO DESCARTABLE'],
  }),
  operacion({
    id: 'op11',
    tipoRegistro: 'Serv. de contabilización',
    tipoDocumento: 'Comprobante de pago',
    codCuenta: '938-2026-5429.1.1',
    fecha: '06/06/2026',
    codDocOrigen: '0000001403',
    documento: 'Comprobante de pago',
    partidas: [
      debe(CTA.proveedores, SUB.provBienesServicios, SUB.provNacionales, 7325.4),
      haber(CTA.cajaBancos, SUB.bancos, SUB.bancosCtaCte, 7325.4),
    ],
    referencia: ['CP-2026-001198', 'PAGO A PROVEEDOR POR MATERIAL MÉDICO DESCARTABLE'],
  }),
  operacion({
    id: 'op12',
    tipoRegistro: 'Serv. de contabilización',
    tipoDocumento: 'Recibo de ingreso',
    codCuenta: '938-2026-5430.1.1',
    fecha: '14/06/2026',
    codDocOrigen: '0000001413',
    documento: 'Recibo de ingreso',
    partidas: [
      debe(CTA.cajaBancos, SUB.bancos, SUB.bancosCtaCte, 15920.6),
      haber(CTA.ventaServicios, SUB.ventaServicios, SUB.serviciosSalud, 15920.6),
    ],
    referencia: ['RI-2026-003264', 'RECAUDACIÓN POR SERVICIOS DE LABORATORIO'],
  }),
  operacion({
    id: 'op13',
    tipoRegistro: 'Serv. de contabilización',
    tipoDocumento: 'Planilla',
    codCuenta: '938-2026-5431.1.1',
    fecha: '15/06/2026',
    codDocOrigen: '0000001414',
    documento: 'Planilla de Contrato Administrativo de Servicios',
    partidas: [
      debe(CTA.personal, SUB.cas, SUB.casDet, 42150),
      haber(CTA.remuneraciones, SUB.remunPorPagar, SUB.remunPorPagarDet, 42150),
    ],
    referencia: ['PLL-CAS-2026-06', 'PLANILLA CAS JUNIO 2026'],
  }),
  operacion({
    id: 'op14',
    tipoRegistro: 'Serv. de contabilización',
    tipoDocumento: 'Comprobante de pago',
    codCuenta: '938-2026-5432.2.1',
    fecha: '16/06/2026',
    codDocOrigen: '0000001415',
    documento: 'Comprobante de pago',
    partidas: [
      debe(CTA.remuneraciones, SUB.remunPorPagar, SUB.remunPorPagarDet, 86320.5),
      haber(CTA.cajaBancos, SUB.bancos, SUB.bancosCtaCte, 86320.5),
    ],
    referencia: ['CP-2026-001241', 'PAGO DE REMUNERACIONES JUNIO 2026'],
  }),
  operacion({
    id: 'op15',
    tipoRegistro: 'Asiento de ajuste',
    tipoDocumento: 'Nota contable',
    codCuenta: '938-2026-5433.1.2',
    fecha: '18/06/2026',
    codDocOrigen: '0000001416',
    documento: 'Nota contable',
    partidas: [
      debe(CTA.estimaciones, SUB.depreciacionEdificios, SUB.depreciacionEdificiosDet, 6480.25),
      haber(CTA.depreciacionAcum, SUB.depAcumEdificios, SUB.depAcumEdificiosDet, 6480.25),
    ],
    referencia: ['NC-2026-000085', 'DEPRECIACIÓN MENSUAL DE EDIFICIOS'],
  }),
  operacion({
    id: 'op16',
    tipoRegistro: 'Asiento de ajuste',
    tipoDocumento: 'Orden de compra',
    codCuenta: '938-2026-5434.1.1',
    fecha: '22/06/2026',
    codDocOrigen: '0000001419',
    documento: 'Orden de compra',
    partidas: [
      debe(CTA.presupuestoGastos, SUB.presupuestoRo, SUB.presupuestoRoDet, 12500),
      haber(CTA.asignacionesComprometidas, SUB.comprometidoRo, SUB.comprometidoRoDet, 12500),
    ],
    referencia: ['OC-2026-000431', 'COMPROMISO POR ADQUISICIÓN DE REACTIVOS DE LABORATORIO'],
  }),
  operacion({
    id: 'op17',
    tipoRegistro: 'Serv. de contabilización',
    tipoDocumento: 'Recibo de ingreso',
    codCuenta: '938-2026-5435.1.1',
    fecha: '27/06/2026',
    codDocOrigen: '0000001428',
    documento: 'Recibo de ingreso',
    partidas: [
      debe(CTA.cajaBancos, SUB.bancos, SUB.bancosCtaCte, 9870),
      haber(CTA.ventaServicios, SUB.ventaServicios, SUB.serviciosSalud, 9870),
    ],
    referencia: ['RI-2026-003355', 'RECAUDACIÓN POR SERVICIOS DE IMAGENOLOGÍA'],
  }),
  operacion({
    id: 'op18',
    tipoRegistro: 'Asiento de ajuste',
    tipoDocumento: 'Planilla',
    codCuenta: '938-2026-5436.1.1',
    fecha: '30/06/2026',
    codDocOrigen: '0000001432',
    documento: 'Planilla única de remuneraciones',
    partidas: [
      debe(CTA.presupuestoGastos, SUB.presupuestoRo, SUB.presupuestoRoDet, 94089.35),
      haber(CTA.asignacionesComprometidas, SUB.comprometidoRo, SUB.comprometidoRoDet, 94089.35),
    ],
    referencia: ['PLL-2026-06', 'COMPROMISO DE PLANILLA DE REMUNERACIONES JUNIO 2026'],
  }),
  operacion({
    id: 'op19',
    tipoRegistro: 'Serv. de contabilización',
    tipoDocumento: 'Rendición de cuenta',
    codCuenta: '938-2026-5437.1.1',
    fecha: '30/06/2026',
    codDocOrigen: '0000001433',
    documento: 'Rendición de cuenta',
    partidas: [
      debe(CTA.compraBienes, SUB.materialesUtiles, SUB.materialesOficina, 2980),
      haber(CTA.anticipos, SUB.entregasRendir, SUB.encargosInternos, 2980),
    ],
    referencia: ['RC-2026-000062', 'RENDICIÓN DE ENCARGO INTERNO - CAMPAÑA DE VACUNACIÓN'],
  }),
];

const fechaOrden = (fecha: string) => fecha.split('/').reverse().join('');
// Orden cronológico: así se presentan los asientos en el Diario y los movimientos en el Mayor.
HDM_OPERACIONES.sort((a, b) => fechaOrden(a.fecha).localeCompare(fechaOrden(b.fecha)));


// ---------------------------------------------------------------------------
// Libro Diario con el Plan Contable Gubernamental (PCGU) 2026.
// En los libros los códigos se muestran sin puntos (1.1.5.1.2 → 11512); aquí se escriben con
// punto por nivel para conservar la jerarquía (cuenta mayor → sub-cuenta → divisionaria).
// Los asientos conservan en `partidas` el plan anterior, del que se sigue derivando el Libro Mayor.
// ---------------------------------------------------------------------------

const PCGU = {
  efectivo: ['111', 'EFECTIVO Y EQUIVALENTES AL EFECTIVO', 'Deudora'],
  inventarios: ['115', 'INVENTARIOS', 'Deudora'],
  ppe: ['123', 'PROPIEDADES, PLANTA Y EQUIPO', 'Deudora'],
  beneficiosPorPagar: ['211', 'BENEFICIOS A LOS EMPLEADOS Y PENSIONISTAS POR PAGAR', 'Acreedora'],
  proveedores: ['213', 'CUENTAS POR PAGAR A PROVEEDORES O CONTRATISTAS A CORTO PLAZO', 'Acreedora'],
  ventaBienesServicios: ['421', 'VENTA DE BIENES Y SERVICIOS', 'Acreedora'],
  beneficiosEmpleados: ['511', 'BENEFICIOS A LOS EMPLEADOS', 'Deudora'],
  aportacionesEmpleador: ['512', 'APORTACIONES A CARGO DEL EMPLEADOR', 'Deudora'],
  depreciacion: ['510', 'DEPRECIACIÓN, DETERIORO DE ACTIVOS Y PROVISIONES', 'Deudora'],
} as const satisfies Record<string, CuentaMayorRef>;

const PCGU_SUB = {
  depositos: ['111.3', 'Depósitos en Instituciones Financieras'],
  bancoCut: ['111.3.1.1', 'Banco CUT - Tesoro en M/N'],
  bancoRecaudados: ['111.3.2.1', 'Banco Fondos Recaudados - Entidades M/N'],
  bienes: ['115.1', 'Bienes'],
  medicamentos: ['115.1.1', 'Medicamentos'],
  materialesMedicos: ['115.1.2', 'Materiales médicos, quirúrgicos, odontológicos y de laboratorio'],
  ppeDepAcumulada: ['123.5', 'Propiedades, planta y equipo - Depreciación acumulada'],
  edificiosDepAcumulada: ['123.5.1', 'Edificios - Depreciación acumulada'],
  beneficiosPorPagar: ['211.1', 'Beneficios a los empleados por pagar'],
  remuneracionesPorPagar: ['211.1.1', 'Remuneraciones por pagar'],
  aportacionesPorPagar: ['211.3', 'Aportaciones a cargo del Empleador por pagar'],
  saludPorPagar: ['211.3.1', 'Régimen de Prestaciones de Salud por pagar'],
  cxpCortoPlazo: ['213.1', 'Cuentas por Pagar a corto plazo a Proveedores o Contratistas a corto plazo'],
  cxpInventarios: ['213.1.1', 'Cuentas por Pagar por Adquisición de Inventarios a corto plazo'],
  ventaServicios: ['421.2', 'Venta de Servicios'],
  serviciosMedicos: ['421.2.2', 'Venta de Servicios médicos'],
  plazoIndeterminado: ['511.1', 'Beneficios a los empleados a plazo indeterminado'],
  remuneracionesIndeterminado: ['511.1.1', 'Remuneraciones'],
  plazoTemporal: ['511.2', 'Beneficios a los empleados a plazo temporal'],
  remuneracionesTemporal: ['511.2.1', 'Remuneraciones'],
  saludIndeterminado: ['512.1', 'Régimen de Prestaciones de Salud a los empleados a plazo indeterminado'],
  depYAmortizacion: ['510.1', 'DEPRECIACIÓN Y AMORTIZACIÓN'],
  depEdificios: ['510.1.1', 'Depreciación de Edificios'],
} as const satisfies Record<string, CuentaRef>;

type AsientoPcgu = { partidas: Partida[]; referencia: CuentaRef };

/**
 * Código PCGU tal como se muestra en los libros: sin puntos de separación (115.1.2 → 11512).
 * Internamente se conservan los puntos para mantener la jerarquía (cuenta mayor → sub-cuenta).
 */
const codigoPcgu = (codigo: string) => codigo.replace(/\./g, '');

/** Recaudación de ingresos propios del hospital: Banco Fondos Recaudados contra Venta de Servicios médicos. */
const recaudacion = (monto: number, referencia: CuentaRef): AsientoPcgu => ({
  partidas: [
    debe(PCGU.efectivo, PCGU_SUB.depositos, PCGU_SUB.bancoRecaudados, monto),
    haber(PCGU.ventaBienesServicios, PCGU_SUB.ventaServicios, PCGU_SUB.serviciosMedicos, monto),
  ],
  referencia,
});

/** Ingreso a almacén de bienes con obligación con el proveedor. */
const compraInventario = (inventario: CuentaRef, monto: number, referencia: CuentaRef): AsientoPcgu => ({
  partidas: [
    debe(PCGU.inventarios, PCGU_SUB.bienes, inventario, monto),
    haber(PCGU.proveedores, PCGU_SUB.cxpCortoPlazo, PCGU_SUB.cxpInventarios, monto),
  ],
  referencia,
});

/** Pago al proveedor con recursos de la CUT: se cancela la obligación, no se reconoce de nuevo el inventario. */
const pagoProveedor = (monto: number, referencia: CuentaRef): AsientoPcgu => ({
  partidas: [
    debe(PCGU.proveedores, PCGU_SUB.cxpCortoPlazo, PCGU_SUB.cxpInventarios, monto),
    haber(PCGU.efectivo, PCGU_SUB.depositos, PCGU_SUB.bancoCut, monto),
  ],
  referencia,
});

/** Planilla de personal a plazo indeterminado con su aporte a EsSalud. */
const planilla = (remuneraciones: number, essalud: number, referencia: CuentaRef): AsientoPcgu => ({
  partidas: [
    debe(PCGU.beneficiosEmpleados, PCGU_SUB.plazoIndeterminado, PCGU_SUB.remuneracionesIndeterminado, remuneraciones),
    debe(PCGU.aportacionesEmpleador, PCGU_SUB.saludIndeterminado, undefined, essalud),
    haber(PCGU.beneficiosPorPagar, PCGU_SUB.beneficiosPorPagar, PCGU_SUB.remuneracionesPorPagar, remuneraciones),
    haber(PCGU.beneficiosPorPagar, PCGU_SUB.aportacionesPorPagar, PCGU_SUB.saludPorPagar, essalud),
  ],
  referencia,
});

/** Asientos del Libro Diario en PCGU 2026, por id de operación. Las operaciones sin equivalencia no se muestran. */
const ASIENTOS_PCGU: Record<string, AsientoPcgu> = {
  // Asiento del Figma (A.1-RV-17-Usuario-UE).
  op1: compraInventario(PCGU_SUB.materialesMedicos, 1000, ['OT2026-INT-004449', 'ADQUISICIÓN DE MATERIALES MÉDICOS PARA ATENCIÓN HOSPITALARIA']),
  op9: recaudacion(8640, ['RI-2026-003201', 'RECAUDACIÓN POR SERVICIOS MÉDICOS DE EMERGENCIA']),
  op10: compraInventario(PCGU_SUB.materialesMedicos, 7325.4, ['OC-2026-000409', 'ADQUISICIÓN DE MATERIAL MÉDICO DESCARTABLE PARA ALMACÉN HOSPITALARIO']),
  op2: compraInventario(PCGU_SUB.medicamentos, 18450, ['OC-2026-000412', 'ADQUISICIÓN DE MEDICAMENTOS PARA FARMACIA CENTRAL']),
  op11: pagoProveedor(7325.4, ['CP-2026-001198', 'PAGO A PROVEEDOR POR ADQUISICIÓN DE MATERIAL MÉDICO DESCARTABLE']),
  op3: pagoProveedor(18450, ['CP-2026-001205', 'PAGO A PROVEEDOR POR ADQUISICIÓN DE MEDICAMENTOS']),
  op4: planilla(86320.5, 7768.85, ['PLL-2026-06', 'PLANILLA DE REMUNERACIONES JUNIO 2026']),
  op12: recaudacion(15920.6, ['RI-2026-003264', 'RECAUDACIÓN POR SERVICIOS MÉDICOS DE LABORATORIO']),
  op13: {
    partidas: [
      debe(PCGU.beneficiosEmpleados, PCGU_SUB.plazoTemporal, PCGU_SUB.remuneracionesTemporal, 42150),
      haber(PCGU.beneficiosPorPagar, PCGU_SUB.beneficiosPorPagar, PCGU_SUB.remuneracionesPorPagar, 42150),
    ],
    referencia: ['PLL-CAS-2026-06', 'PLANILLA CAS – PERSONAL A PLAZO TEMPORAL – JUNIO 2026'],
  },
  op14: {
    partidas: [
      debe(PCGU.beneficiosPorPagar, PCGU_SUB.beneficiosPorPagar, PCGU_SUB.remuneracionesPorPagar, 86320.5),
      haber(PCGU.efectivo, PCGU_SUB.depositos, PCGU_SUB.bancoCut, 86320.5),
    ],
    referencia: ['CP-2026-001241', 'PAGO DE REMUNERACIONES AL PERSONAL ADMINISTRATIVO Y ASISTENCIAL – JUNIO 2026'],
  },
  op15: {
    partidas: [
      debe(PCGU.depreciacion, PCGU_SUB.depYAmortizacion, PCGU_SUB.depEdificios, 6480.25),
      haber(PCGU.ppe, PCGU_SUB.ppeDepAcumulada, PCGU_SUB.edificiosDepAcumulada, 6480.25),
    ],
    referencia: ['NC-2026-000085', 'DEPRECIACIÓN MENSUAL DE EDIFICIOS – JUNIO 2026'],
  },
  op6: recaudacion(12380, ['RI-2026-003318', 'RECAUDACIÓN POR SERVICIOS MÉDICOS DE CONSULTA EXTERNA']),
  op17: recaudacion(9870, ['RI-2026-003355', 'RECAUDACIÓN POR SERVICIOS MÉDICOS DE IMAGENOLOGÍA']),
  // Hospital María Auxiliadora (serie 939).
  'ue-mau-op2': compraInventario(PCGU_SUB.materialesMedicos, 9640, ['OC-2026-000188', 'ADQUISICIÓN DE MATERIAL MÉDICO DESCARTABLE PARA ALMACÉN HOSPITALARIO']),
  'ue-mau-op3': pagoProveedor(9640, ['CP-2026-000731', 'PAGO A PROVEEDOR POR ADQUISICIÓN DE MATERIAL MÉDICO DESCARTABLE']),
  // Instituto Nacional de Salud del Niño (serie 940).
  'ue-insn-op1': recaudacion(25760, ['RI-2026-001044', 'RECAUDACIÓN POR SERVICIOS MÉDICOS DE HOSPITALIZACIÓN']),
  'ue-insn-op2': planilla(142380, 12814.2, ['PLL-2026-06', 'PLANILLA DE REMUNERACIONES JUNIO 2026']),
};

/**
 * Operaciones del Libro Diario: solo las que tienen asiento PCGU, con sus filas y partidas en el
 * nuevo plan. Valida que cada asiento PCGU conserve el importe de la operación original.
 */
function diarioPcgu(operaciones: OperacionConPartidas[]): OperacionConPartidas[] {
  return operaciones.flatMap((op) => {
    const asiento = ASIENTOS_PCGU[op.id];
    if (!asiento) {
      return [];
    }
    const total = (partidas: Partida[]) => round2(partidas.filter((p) => p.lado === 'D').reduce((t, p) => t + p.monto, 0));
    if (total(asiento.partidas) !== total(op.partidas)) {
      throw new Error(`Asiento PCGU ${op.codCuenta}: importe ${total(asiento.partidas)} ≠ ${total(op.partidas)}`);
    }
    // Las filas con importe son cuentas PCGU (se muestran sin puntos); la última es la glosa.
    const cuentas = filasAsiento(op.codCuenta, asiento.partidas, asiento.referencia).map((cuenta) =>
      cuenta.debe || cuenta.haber ? { ...cuenta, codigo: codigoPcgu(cuenta.codigo) } : cuenta,
    );
    return [{ ...op, partidas: asiento.partidas, cuentas }];
  });
}

const HDM_DIARIO = diarioPcgu(HDM_OPERACIONES);

const sinPartidas = ({ partidas: _partidas, ...group }: OperacionConPartidas): LibroContableOperacionGroup => group;

export const LIBROS_CONTABLES_RESULT_GROUPS: LibroContableOperacionGroup[] = HDM_DIARIO.map(sinPartidas);

// Libro Diario para el visualizador PLIEGO con Entidad "Integrado a nivel pliego":
// la misma vista del diario estándar, agrupada por Unidad Ejecutora en acordeones.
export type LibroPliegoDiarioUeGroup = {
  id: string;
  unidadEjecutora: string;
  operaciones: LibroContableOperacionGroup[];
};

/**
 * Clona las operaciones de la UE con ids únicos por Unidad Ejecutora (evita colisiones de
 * selección/expansión). Conserva el Nro. Doc Contable/Nro. Asiento: cada unidad ejecutora
 * contabiliza sus propios asientos con su serie y no puede repetir el número de otra.
 */
function pliegoDiarioUeOperaciones(prefix: string, operaciones: LibroContableOperacionGroup[]): LibroContableOperacionGroup[] {
  return operaciones.map((group) => ({ ...group, id: `${prefix}-${group.id}` }));
}

/**
 * Asientos propios de Hospital María Auxiliadora: serie 939 (distinta de la 938 de Hospital
 * Dos de Mayo), con sus documentos de origen y glosas propios.
 */
const HMA_OPERACIONES: OperacionConPartidas[] = [
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
    partidas: [
      debe(CTA.contratosAprobados, SUB.ordenesServicioAprobadas, undefined, 1000),
      haber(CTA.contratosPorContra, SUB.ordenesServicioPorEjecutar, undefined, 1000),
    ],
  },
  operacion({
    id: 'ue-mau-op2',
    tipoRegistro: 'Serv. de contabilización',
    tipoDocumento: 'Orden de compra',
    codCuenta: '939-2026-5170.1.1',
    fecha: '09/06/2026',
    codDocOrigen: '000000184-0012',
    documento: 'ORDEN DE COMPRA',
    partidas: [
      debe(CTA.compraBienes, SUB.suministrosMedicos, SUB.materialMedico, 9640),
      haber(CTA.proveedores, SUB.provBienesServicios, SUB.provNacionales, 9640),
    ],
    referencia: ['OC-2026-000188', 'ADQUISICIÓN DE MATERIAL MÉDICO DESCARTABLE'],
  }),
  operacion({
    id: 'ue-mau-op3',
    tipoRegistro: 'Serv. de contabilización',
    tipoDocumento: 'Comprobante de pago',
    codCuenta: '939-2026-5171.1.1',
    fecha: '16/06/2026',
    codDocOrigen: '000000185-0003',
    documento: 'COMPROBANTE DE PAGO',
    partidas: [
      debe(CTA.proveedores, SUB.provBienesServicios, SUB.provNacionales, 9640),
      haber(CTA.cajaBancos, SUB.bancos, SUB.bancosCtaCte, 9640),
    ],
    referencia: ['CP-2026-000731', 'PAGO POR ADQUISICIÓN DE MATERIAL MÉDICO'],
  }),
  operacion({
    id: 'ue-mau-op4',
    tipoRegistro: 'Asiento de ajuste',
    tipoDocumento: 'Nota contable',
    codCuenta: '939-2026-5172.1.2',
    fecha: '30/06/2026',
    codDocOrigen: '000000186-0001',
    documento: 'NOTA CONTABLE',
    partidas: [
      debe(CTA.estimaciones, SUB.depreciacion, SUB.depreciacionEquipo, 2870.4),
      haber(CTA.depreciacionAcum, SUB.depAcumMaquinaria, SUB.depAcumEquipo, 2870.4),
    ],
    referencia: ['NC-2026-000041', 'DEPRECIACIÓN MENSUAL DE MOBILIARIO Y EQUIPO'],
  }),
];

/** Asientos propios del Instituto Nacional de Salud del Niño: serie 940. */
const INSN_OPERACIONES: OperacionConPartidas[] = [
  operacion({
    id: 'ue-insn-op1',
    tipoRegistro: 'Serv. de contabilización',
    tipoDocumento: 'Recibo de ingreso',
    codCuenta: '940-2026-3101.1.1',
    fecha: '04/06/2026',
    codDocOrigen: '000000092-0001',
    documento: 'RECIBO DE INGRESO',
    partidas: [
      debe(CTA.cajaBancos, SUB.bancos, SUB.bancosCtaCte, 25760),
      haber(CTA.ventaServicios, SUB.ventaServicios, SUB.serviciosSalud, 25760),
    ],
    referencia: ['RI-2026-001044', 'RECAUDACIÓN POR SERVICIOS DE HOSPITALIZACIÓN'],
  }),
  operacion({
    id: 'ue-insn-op2',
    tipoRegistro: 'Serv. de contabilización',
    tipoDocumento: 'Planilla',
    codCuenta: '940-2026-3102.1.1',
    fecha: '15/06/2026',
    codDocOrigen: '000000093-0006',
    documento: 'PLANILLA ÚNICA DE REMUNERACIONES',
    partidas: [
      debe(CTA.personal, SUB.retribuciones, SUB.retribucionesDet, 142380),
      debe(CTA.personal, SUB.essalud, SUB.essaludDet, 12814.2),
      haber(CTA.remuneraciones, SUB.remunPorPagar, SUB.remunPorPagarDet, 142380),
      haber(CTA.contribuciones, SUB.essaludPorPagar, SUB.essaludPorPagarDet, 12814.2),
    ],
    referencia: ['PLL-2026-06', 'PLANILLA DE REMUNERACIONES JUNIO 2026'],
  }),
  operacion({
    id: 'ue-insn-op3',
    tipoRegistro: 'Asiento de ajuste',
    tipoDocumento: 'Orden de servicio',
    codCuenta: '940-2026-3103.1.1',
    fecha: '22/06/2026',
    codDocOrigen: '000000094-0002',
    documento: 'ORDEN DE SERVICIO',
    partidas: [
      debe(CTA.contratosAprobados, SUB.ordenesServicioAprobadas, undefined, 7500),
      haber(CTA.contratosPorContra, SUB.ordenesServicioPorEjecutar, undefined, 7500),
    ],
    referencia: ['OS-2026-000057', 'SERVICIO DE LIMPIEZA DE ÁREAS CRÍTICAS'],
  }),
];

export const LIBROS_CONTABLES_PLIEGO_DIARIO_UE_GROUPS: LibroPliegoDiarioUeGroup[] = [
  { id: 'ue-hospital-dos-de-mayo', unidadEjecutora: 'Hospital Dos de Mayo', operaciones: pliegoDiarioUeOperaciones('ue-hdm', LIBROS_CONTABLES_RESULT_GROUPS) },
  { id: 'ue-maria-auxiliadora', unidadEjecutora: 'Hospital María Auxiliadora', operaciones: diarioPcgu(HMA_OPERACIONES).map(sinPartidas) },
  { id: 'ue-insn', unidadEjecutora: 'Instituto Nacional de Salud del Niño', operaciones: diarioPcgu(INSN_OPERACIONES).map(sinPartidas) },
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

/** Una fila matricial por partida de los asientos del Libro Diario (PCGU 2026). */
export const LIBROS_CONTABLES_DIARIO_MATRIX_ROWS: LibroDiarioMatrixRow[] = [
  ...HDM_DIARIO.flatMap((op) =>
    op.partidas.map((partida) => ({
      ejercicio: 2026,
      cuentaMayor: codigoPcgu(partida.mayor[0]),
      descMayor: partida.mayor[1],
      // Código de la sub-cuenta/divisionaria sin el prefijo de la cuenta mayor (11512 → 12).
      cuentaSubCta: codigoPcgu((partida.det ?? partida.sub)[0]).slice(codigoPcgu(partida.mayor[0]).length),
      fecha: op.fecha,
      tipoRegistro: op.tipoRegistro,
      tipoDocumento: op.tipoDocumento,
      nroDocContable: op.nroDocContable,
      codDocOrigen: op.codDocOrigen,
      documentoOrigen: op.documento,
      nroDocumentoOrigen: '',
      nroAsiento: op.codCuenta,
      tipoDH: partida.lado === 'D' ? ('Debe' as const) : ('Haber' as const),
      naturaleza: partida.mayor[2],
      montoDebe: partida.lado === 'D' ? partida.monto : 0,
      montoHaber: partida.lado === 'H' ? partida.monto : 0,
    })),
  ),
].map((row, index) => ({ ...row, nroDocumentoOrigen: `DOC-${String(index + 1).padStart(10, '0')}` }));

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
  /** Deudora: el saldo crece con el Debe; Acreedora: crece con el Haber. */
  naturaleza: Naturaleza;
  saldoInicial: number;
  movimientos: LibroMayorResultRow[];
};

export type { Naturaleza };

/** Saldo tras un movimiento, según la naturaleza de la cuenta (Deudora: +Debe −Haber; Acreedora: +Haber −Debe). */
export function aplicarMovimiento(naturaleza: Naturaleza, saldo: number, debeMonto: number, haberMonto: number): number {
  const delta = naturaleza === 'Acreedora' ? haberMonto - debeMonto : debeMonto - haberMonto;
  return round2(saldo + delta);
}

/**
 * Saldos iniciales (cierre del mes anterior) de Hospital Dos de Mayo por divisionaria PCGU 2026.
 * El saldo inicial de cada cuenta mayor es la suma de sus divisionarias.
 */
const SALDOS_INICIALES_PCGU: Record<string, number> = {
  '111.3.1.1': 2950000,
  '111.3.2.1': 659854.68,
  '115.1.1': 92250,
  '115.1.2': 48615.3,
  '123.5.1': 388815,
  '211.1.1': 0,
  '211.3.1': 7512.4,
  '213.1.1': 25480,
  '421.2.2': 245380.5,
  '511.1.1': 431602.5,
  '511.2.1': 210750,
  '512.1': 38844.25,
  '510.1.1': 32401.25,
};

/**
 * Divisionarias de contra-activo (depreciación acumulada): pertenecen a una cuenta de activo pero
 * su saldo es acreedor. Si una cuenta mayor solo se mueve por ellas, su Mayor se lleva como acreedora.
 */
const CONTRA_ACTIVO = new Set(['123.5.1']);

const naturalezaDivisionaria = (partida: Partida): Naturaleza =>
  CONTRA_ACTIVO.has((partida.det ?? partida.sub)[0]) ? 'Acreedora' : partida.mayor[2];

function naturalezaMayor(cuenta: CuentaMayorRef): Naturaleza {
  const partidas = HDM_DIARIO.flatMap((op) => op.partidas).filter((p) => p.mayor[0] === cuenta[0]);
  return partidas.length > 0 && partidas.every((p) => naturalezaDivisionaria(p) === 'Acreedora') ? 'Acreedora' : cuenta[2];
}

const saldoInicialMayor = (mayor: string) =>
  round2(Object.entries(SALDOS_INICIALES_PCGU).filter(([codigo]) => codigo.startsWith(`${mayor}.`)).reduce((t, [, monto]) => t + monto, 0));

/**
 * Movimientos del Libro Mayor de una cuenta, tomados de los asientos PCGU del Libro Diario de la UE
 * (una fila por asiento y lado, sumando sus sub-cuentas).
 */
function movimientosMayor(cuenta: CuentaMayorRef): LibroMayorResultRow[] {
  return HDM_DIARIO.flatMap((op, index) =>
    (['D', 'H'] as const).flatMap((lado) => {
      const monto = round2(op.partidas.filter((p) => p.lado === lado && p.mayor[0] === cuenta[0]).reduce((t, p) => t + p.monto, 0));
      if (!monto) {
        return [];
      }
      return [{
        fecha: op.fecha,
        docCaRegNota: `R${String(4050 + index).padStart(10, '0')}`,
        nroDocContable: op.nroDocContable,
        tipo: op.tipoRegistro,
        documento: op.documento,
        nroDocumento: op.codDocOrigen,
        nroAsiento: op.codCuenta,
        debe: lado === 'D' ? monto : 0,
        haber: lado === 'H' ? monto : 0,
      }];
    }),
  );
}

const mayorGroup = (cuenta: CuentaMayorRef): LibroMayorResultGroup => ({
  id: `mayor-${cuenta[0]}`,
  codCuenta: codigoPcgu(cuenta[0]),
  nombreCuenta: cuenta[1],
  naturaleza: naturalezaMayor(cuenta),
  saldoInicial: saldoInicialMayor(cuenta[0]),
  movimientos: movimientosMayor(cuenta),
});

/** Cuentas mayores PCGU 2026 del Libro Mayor, en el orden del plan (activo, pasivo, ingresos, gastos). */
const MAYORES_PCGU: CuentaMayorRef[] = [
  PCGU.efectivo,
  PCGU.inventarios,
  PCGU.ppe,
  PCGU.beneficiosPorPagar,
  PCGU.proveedores,
  PCGU.ventaBienesServicios,
  PCGU.depreciacion,
  PCGU.beneficiosEmpleados,
  PCGU.aportacionesEmpleador,
];

/** Nombre de cuenta en formato oración (EFECTIVO Y EQUIVALENTES → Efectivo y equivalentes). */
const nombreEnOracion = (nombre: string) => nombre.charAt(0) + nombre.slice(1).toLowerCase();

/** Opciones del filtro "Cuenta contable": las cuentas mayores PCGU 2026 de los libros, sin puntos. */
export const LIBROS_CONTABLES_CUENTA_OPTIONS: TextFieldOption[] = MAYORES_PCGU.map(([codigo, nombre]) => ({
  label: `${codigoPcgu(codigo)} - ${nombreEnOracion(nombre)}`,
  value: codigoPcgu(codigo),
}));

/** Libro Mayor de la UE: una cuenta mayor PCGU 2026 por cada cuenta usada en el Libro Diario. */
export const LIBROS_CONTABLES_MAYOR_RESULT_GROUPS: LibroMayorResultGroup[] = MAYORES_PCGU.map(mayorGroup);

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

const USE = {
  u01: ['000056', 'USE 01 San Juan de Miraflores'],
  u02: ['000057', 'USE 02 San Martin de Porras'],
  u03: ['000058', 'USE 03 Cercado'],
  u04: ['000059', 'USE 04 Comas'],
  u05: ['000060', 'USE 05 San Juan de Lurigancho'],
  u06: ['000061', 'USE 06 Vitarte'],
  u07: ['000062', 'USE 07 San Borja'],
  u08: ['000063', 'USE 08 Surquillo'],
} as const satisfies Record<string, CuentaRef>;

/** Detalle por USE con el saldo según la naturaleza de la cuenta (por defecto, deudora). */
const det = ([minen, nombre]: CuentaRef, saldoInicial: number, debeMonto: number, haberMonto: number, naturaleza: Naturaleza = 'Deudora'): LibroPliegoMayorRow => ({
  minen,
  nombre,
  saldoInicial,
  debe: debeMonto,
  haber: haberMonto,
  saldo: aplicarMovimiento(naturaleza, saldoInicial, debeMonto, haberMonto),
});

/** Detalle por USE de una cuenta acreedora (Saldo inicial + Haber − Debe). */
const detA = (use: CuentaRef, saldoInicial: number, debeMonto: number, haberMonto: number) => det(use, saldoInicial, debeMonto, haberMonto, 'Acreedora');

const CORTE = '30/06/2026';

/** Libro Mayor integrado a nivel pliego: cuentas mayores PCGU 2026 con el detalle por USE. */
export const LIBROS_CONTABLES_PLIEGO_MAYOR_GROUPS: LibroPliegoMayorGroup[] = [
  {
    id: 'pliego-mayor-111',
    fecha: CORTE,
    codigo: codigoPcgu(PCGU.efectivo[0]),
    cuenta: PCGU.efectivo[1],
    detalles: [
      det(USE.u01, 5922.53, 425922.53, 352644.98),
      det(USE.u02, 15625.30, 815625.30, 490366.99),
      det(USE.u03, 2128.74, 2722128.74, 1498990.63),
      det(USE.u04, 8089.15, 538089.15, 316528.44),
    ],
  },
  {
    id: 'pliego-mayor-115',
    fecha: CORTE,
    codigo: codigoPcgu(PCGU.inventarios[0]),
    cuenta: PCGU.inventarios[1],
    detalles: [
      det(USE.u01, 62250, 12450, 0),
      det(USE.u02, 119377, 23875.4, 0),
      det(USE.u03, 206150.75, 41230.15, 1250),
      det(USE.u04, 49351.25, 9870.25, 0),
    ],
  },
  {
    id: 'pliego-mayor-213',
    fecha: CORTE,
    codigo: codigoPcgu(PCGU.proveedores[0]),
    cuenta: PCGU.proveedores[1],
    detalles: [
      detA(USE.u01, 18420, 12450, 15870.2),
      detA(USE.u02, 9310.5, 23875.4, 26210),
      detA(USE.u03, 41200.75, 41230.15, 39880),
      detA(USE.u04, 5120, 9870.25, 11240.6),
    ],
  },
  {
    id: 'pliego-mayor-421',
    fecha: CORTE,
    codigo: codigoPcgu(PCGU.ventaBienesServicios[0]),
    cuenta: PCGU.ventaBienesServicios[1],
    detalles: [
      detA(USE.u01, 245380.5, 0, 36810.6),
      detA(USE.u02, 118940.75, 0, 21450),
      detA(USE.u03, 402315.2, 0, 58230.9),
      detA(USE.u04, 96880.4, 0, 14120.35),
    ],
  },
  {
    id: 'pliego-mayor-511',
    fecha: CORTE,
    codigo: codigoPcgu(PCGU.beneficiosEmpleados[0]),
    cuenta: PCGU.beneficiosEmpleados[1],
    detalles: [
      det(USE.u01, 927150, 185430, 0),
      det(USE.u02, 1061902.5, 212380.5, 0),
      det(USE.u03, 1993203.75, 398640.75, 0),
      det(USE.u04, 882601.5, 176520.3, 0),
      det(USE.u05, 716052.25, 143210.45, 0),
    ],
  },
  {
    id: 'pliego-mayor-5-11',
    fecha: CORTE,
    codigo: codigoPcgu(PCGU.depreciacion[0]),
    cuenta: PCGU.depreciacion[1],
    detalles: [
      det(USE.u01, 10540.2, 2108.04, 0),
      det(USE.u03, 27315.6, 5463.12, 0),
      det(USE.u05, 8120.45, 1624.09, 0),
    ],
  },
];

/**
 * Libro Mayor Extendido (visualizador Unidad Ejecutora, variante "Libro mayor extendido").
 * Reutiliza la estructura consolidada por unidad ejecutora del Libro Mayor integrado a pliego,
 * pero el código de cuenta se muestra a nivel sub-cuenta PCGU (111.3 en vez de 111).
 */
export const LIBROS_CONTABLES_MAYOR_EXTENDIDO_GROUPS: LibroPliegoMayorGroup[] = [
  {
    id: 'mayor-ext-111-3',
    fecha: CORTE,
    codigo: codigoPcgu(PCGU_SUB.depositos[0]),
    cuenta: PCGU_SUB.depositos[1],
    detalles: [
      det(USE.u01, 309854.68, 425922.53, 352644.98),
      det(USE.u02, 315625.30, 815625.30, 490366.99),
      det(USE.u03, 2128.74, 2722128.74, 1498990.63),
      det(USE.u04, 38089.15, 538089.15, 316528.44),
    ],
  },
  {
    id: 'mayor-ext-115-1',
    fecha: CORTE,
    codigo: codigoPcgu(PCGU_SUB.bienes[0]),
    cuenta: PCGU_SUB.bienes[1],
    detalles: [
      det(USE.u01, 92250, 18450, 0),
      det(USE.u02, 48200, 9640, 0),
      det(USE.u04, 31575.5, 6315.1, 0),
    ],
  },
  {
    id: 'mayor-ext-421-2',
    fecha: CORTE,
    codigo: codigoPcgu(PCGU_SUB.ventaServicios[0]),
    cuenta: PCGU_SUB.ventaServicios[1],
    detalles: [
      detA(USE.u01, 184320.5, 0, 46810.6),
      detA(USE.u02, 95410.25, 0, 21450),
      detA(USE.u03, 412875.9, 0, 58230.9),
    ],
  },
  {
    id: 'mayor-ext-511-1',
    fecha: CORTE,
    codigo: codigoPcgu(PCGU_SUB.plazoIndeterminado[0]),
    cuenta: PCGU_SUB.plazoIndeterminado[1],
    detalles: [
      det(USE.u01, 431602.5, 86320.5, 0),
      det(USE.u02, 520415, 104083, 0),
      det(USE.u03, 918760.25, 183752.05, 0),
    ],
  },
];

/**
 * Libro Mayor Extendido consolidado por Unidad Ejecutora (visualizador ENTE RECTOR,
 * variante "Libro mayor extendido" con Unidad Ejecutora = "Todos"). Cada unidad ejecutora
 * es un acordeón que agrupa sus sub-cuentas PCGU (111.3, 115.1, …) con el detalle por USE.
 */
export type LibroMayorExtendidoUeGroup = {
  id: string;
  unidadEjecutora: string;
  cuentas: LibroPliegoMayorGroup[];
};

const cuentaExtendida = (id: string, sub: CuentaRef, detalles: LibroPliegoMayorRow[]): LibroPliegoMayorGroup => ({
  id,
  fecha: CORTE,
  codigo: codigoPcgu(sub[0]),
  cuenta: sub[1],
  detalles,
});

export const LIBROS_CONTABLES_MAYOR_EXTENDIDO_UE_GROUPS: LibroMayorExtendidoUeGroup[] = [
  {
    id: 'mayor-ext-ue-hdm',
    unidadEjecutora: 'Hospital Dos de Mayo',
    cuentas: [
      cuentaExtendida('mayor-ext-hdm-111-3', PCGU_SUB.depositos, [
        det(USE.u01, 5922.53, 425922.53, 352644.98),
        det(USE.u02, 5625.30, 815625.30, 490366.99),
        det(USE.u03, 2128.74, 2722128.74, 1498990.63),
        det(USE.u04, 8089.15, 538089.15, 316528.44),
      ]),
      cuentaExtendida('mayor-ext-hdm-115-1', PCGU_SUB.bienes, [
        det(USE.u01, 92250, 18450, 0),
        det(USE.u03, 60120.4, 12024.08, 0),
      ]),
      cuentaExtendida('mayor-ext-hdm-213-1', PCGU_SUB.cxpCortoPlazo, [
        detA(USE.u05, 1075.91, 8075.91, 9120),
        detA(USE.u06, 87.5, 87.5, 350),
      ]),
    ],
  },
  {
    id: 'mayor-ext-ue-hma',
    unidadEjecutora: 'Hospital María Auxiliadora',
    cuentas: [
      cuentaExtendida('mayor-ext-hma-111-3', PCGU_SUB.depositos, [
        det(USE.u07, 2375.37, 12375.37, 0),
        det(USE.u08, 53411.95, 653862.05, 120450.10),
      ]),
      cuentaExtendida('mayor-ext-hma-115-1', PCGU_SUB.bienes, [
        det(USE.u07, 48200, 9640, 0),
        det(USE.u08, 15320.6, 3064.12, 0),
      ]),
      cuentaExtendida('mayor-ext-hma-5-11-1', PCGU_SUB.depYAmortizacion, [
        det(USE.u07, 14352, 2870.4, 0),
      ]),
    ],
  },
  {
    id: 'mayor-ext-ue-insn',
    unidadEjecutora: 'Instituto Nacional de Salud del Niño',
    cuentas: [
      cuentaExtendida('mayor-ext-insn-111-3', PCGU_SUB.depositos, [
        det(USE.u01, 245680.3, 25760, 0),
        det(USE.u02, 118940.75, 14210.5, 8750),
      ]),
      cuentaExtendida('mayor-ext-insn-511-1', PCGU_SUB.plazoIndeterminado, [
        det(USE.u01, 711900, 142380, 0),
        det(USE.u02, 356120.5, 71224.1, 0),
      ]),
    ],
  },
];

/**
 * Libro Mayor Detallado (tabla plana): una fila por divisionaria PCGU 2026 con su saldo inicial,
 * debe, haber y saldo. Aplica al visualizador Unidad Ejecutora, al Pliego con entidad
 * "Hospital Dos de Mayo" y al Ente Rector (DGCP) con una unidad ejecutora concreta,
 * siempre con la variante "Libro mayor detallado".
 */
export type LibroMayorDetalladoRow = {
  fecha: string;
  codigo: string;
  descripcion: string;
  saldoInicial: number;
  debe: number;
  haber: number;
  saldo: number;
};

/** Una fila por divisionaria usada en el Libro Diario de la UE, con los importes del periodo. */
function mayorDetallado(): LibroMayorDetalladoRow[] {
  const filas = new Map<string, { cuenta: CuentaRef; orden: number; naturaleza: Naturaleza; debe: number; haber: number }>();
  for (const partida of HDM_DIARIO.flatMap((op) => op.partidas)) {
    const cuenta = partida.det ?? partida.sub;
    const orden = MAYORES_PCGU.findIndex((mayor) => mayor[0] === partida.mayor[0]);
    const fila = filas.get(cuenta[0]) ?? { cuenta, orden, naturaleza: naturalezaDivisionaria(partida), debe: 0, haber: 0 };
    fila[partida.lado === 'D' ? 'debe' : 'haber'] = round2(fila[partida.lado === 'D' ? 'debe' : 'haber'] + partida.monto);
    filas.set(cuenta[0], fila);
  }
  return [...filas.values()]
    .sort((a, b) => a.orden - b.orden || a.cuenta[0].localeCompare(b.cuenta[0], 'es', { numeric: true }))
    .map(({ cuenta, naturaleza, debe: debeMonto, haber: haberMonto }) => {
      const saldoInicial = SALDOS_INICIALES_PCGU[cuenta[0]] ?? 0;
      return {
        fecha: CORTE,
        codigo: codigoPcgu(cuenta[0]),
        descripcion: cuenta[1],
        saldoInicial,
        debe: debeMonto,
        haber: haberMonto,
        saldo: aplicarMovimiento(naturaleza, saldoInicial, debeMonto, haberMonto),
      };
    });
}

export const LIBROS_CONTABLES_MAYOR_DETALLADO_ROWS: LibroMayorDetalladoRow[] = mayorDetallado();

export const LIBROS_CONTABLES_PLIEGO_VIENEN_DEBE = 119251876641.44;
export const LIBROS_CONTABLES_PLIEGO_VIENEN_HABER = 119251876641.44;
export const LIBROS_CONTABLES_PLIEGO_VAN_DEBE = 119251876641.44;
export const LIBROS_CONTABLES_PLIEGO_VAN_HABER = 119251876641.44;

export const LIBROS_CONTABLES_RESULT_VIENEN_DEBE = 29810868889.70;
export const LIBROS_CONTABLES_RESULT_VIENEN_HABER = 29810868889.70;

/** Suma los importes de las cuentas mayores (nivel 1) de los asientos. */
const sumaNivel1 = (operaciones: LibroContableOperacionGroup[], lado: 'debe' | 'haber') =>
  operaciones.flatMap((op) => op.cuentas).filter((cuenta) => cuenta.nivel === 1).reduce((total, cuenta) => total + cuenta[lado], 0);

/** Van = Vienen + movimientos del periodo (Libro Diario de la Unidad Ejecutora). */
export const LIBROS_CONTABLES_RESULT_TOTAL_DEBE = round2(LIBROS_CONTABLES_RESULT_VIENEN_DEBE + sumaNivel1(LIBROS_CONTABLES_RESULT_GROUPS, 'debe'));
export const LIBROS_CONTABLES_RESULT_TOTAL_HABER = round2(LIBROS_CONTABLES_RESULT_VIENEN_HABER + sumaNivel1(LIBROS_CONTABLES_RESULT_GROUPS, 'haber'));

/** Van del Libro Diario integrado a nivel pliego: incluye los asientos de todas las unidades ejecutoras. */
const PLIEGO_DIARIO_UE_OPERACIONES = LIBROS_CONTABLES_PLIEGO_DIARIO_UE_GROUPS.flatMap((ue) => ue.operaciones);
export const LIBROS_CONTABLES_PLIEGO_DIARIO_UE_VAN_DEBE = round2(LIBROS_CONTABLES_RESULT_VIENEN_DEBE + sumaNivel1(PLIEGO_DIARIO_UE_OPERACIONES, 'debe'));
export const LIBROS_CONTABLES_PLIEGO_DIARIO_UE_VAN_HABER = round2(LIBROS_CONTABLES_RESULT_VIENEN_HABER + sumaNivel1(PLIEGO_DIARIO_UE_OPERACIONES, 'haber'));

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
