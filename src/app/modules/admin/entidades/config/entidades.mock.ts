export type EstadoEntidad = 'activa' | 'suspendida' | 'migrada' | 'archivada';
export type TipoEntidad = 'ministerio' | 'municipalidad' | 'gobierno_regional' | 'unidad_ejecutora' | 'organismo_publico' | 'empresa_publica' | 'otra';

export interface EntidadMock {
  id: string;
  codigoNumerico: number;
  codigo: string;
  ruc: string | null;
  nombre: string;
  tipoEntidad: TipoEntidad;
  estadoEntidad: EstadoEntidad;
  entidadPadre: string | null;
  totalUnidades: number;
  totalUsuarios: number;
  fechaSuspension: string | null;
  fechaMigracion: string | null;
  fechaArchivado: string | null;
}

export const ENTIDADES_MOCK: EntidadMock[] = [
  {
    id: '1',
    codigoNumerico: 1,
    codigo: 'MEF',
    ruc: '20131369477',
    nombre: 'Ministerio de Economía y Finanzas',
    tipoEntidad: 'ministerio',
    estadoEntidad: 'activa',
    entidadPadre: null,
    totalUnidades: 2,
    totalUsuarios: 4,
    fechaSuspension: null,
    fechaMigracion: null,
    fechaArchivado: null
  },
  {
    id: '2',
    codigoNumerico: 2,
    codigo: 'MUNI-ICA',
    ruc: '20143598640',
    nombre: 'Municipalidad Provincial de Ica',
    tipoEntidad: 'municipalidad',
    estadoEntidad: 'activa',
    entidadPadre: null,
    totalUnidades: 3,
    totalUsuarios: 2,
    fechaSuspension: null,
    fechaMigracion: null,
    fechaArchivado: null
  },
  {
    id: '3',
    codigoNumerico: 3,
    codigo: 'GORE-ICA',
    ruc: '20239057919',
    nombre: 'Gobierno Regional de Ica',
    tipoEntidad: 'gobierno_regional',
    estadoEntidad: 'activa',
    entidadPadre: null,
    totalUnidades: 5,
    totalUsuarios: 3,
    fechaSuspension: null,
    fechaMigracion: null,
    fechaArchivado: null
  },
  {
    id: '4',
    codigoNumerico: 4,
    codigo: 'MUNI-PISCO',
    ruc: '20159876543',
    nombre: 'Municipalidad Provincial de Pisco',
    tipoEntidad: 'municipalidad',
    estadoEntidad: 'activa',
    entidadPadre: null,
    totalUnidades: 2,
    totalUsuarios: 1,
    fechaSuspension: null,
    fechaMigracion: null,
    fechaArchivado: null
  },
  {
    id: '5',
    codigoNumerico: 5,
    codigo: 'SUNAT',
    ruc: '20131312955',
    nombre: 'Superintendencia Nacional de Aduanas y Administración Tributaria',
    tipoEntidad: 'organismo_publico',
    estadoEntidad: 'suspendida',
    entidadPadre: null,
    totalUnidades: 4,
    totalUsuarios: 0,
    fechaSuspension: '01/05/2026',
    fechaMigracion: null,
    fechaArchivado: null
  },
  {
    id: '6',
    codigoNumerico: 6,
    codigo: 'MUNI-CHINCHA',
    ruc: null,
    nombre: 'Municipalidad Provincial de Chincha',
    tipoEntidad: 'municipalidad',
    estadoEntidad: 'archivada',
    entidadPadre: null,
    totalUnidades: 0,
    totalUsuarios: 0,
    fechaSuspension: null,
    fechaMigracion: null,
    fechaArchivado: '15/03/2026'
  }
];

export const TIPO_ENTIDAD_LABEL: Record<TipoEntidad, string> = {
  ministerio: 'Ministerio',
  municipalidad: 'Municipalidad',
  gobierno_regional: 'Gobierno Regional',
  unidad_ejecutora: 'Unidad Ejecutora',
  organismo_publico: 'Organismo Público',
  empresa_publica: 'Empresa Pública',
  otra: 'Otra'
};

export const ESTADO_ENTIDAD_COLOR: Record<EstadoEntidad, string> = {
  activa: 'text-[var(--sys-color-text-feedback-success)] bg-[var(--sys-color-bg-feedback-success-light)]',
  suspendida: 'text-[var(--sys-color-text-feedback-warning)] bg-[var(--sys-color-bg-feedback-warning-light)]',
  migrada: 'text-[var(--sys-color-text-feedback-default)] bg-[var(--sys-color-bg-feedback-default-light)]',
  archivada: 'text-[var(--sys-color-text-secondary)] bg-[var(--sys-color-bg-surfaces-surface-low)]'
};

export const ESTADO_ENTIDAD_LABEL: Record<EstadoEntidad, string> = {
  activa: 'Activa',
  suspendida: 'Suspendida',
  migrada: 'Migrada',
  archivada: 'Archivada'
};
