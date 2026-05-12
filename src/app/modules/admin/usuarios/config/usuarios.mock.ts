export type EstadoUsuario = 'activo' | 'inactivo' | 'bloqueado' | 'pendiente_activacion';

export interface PerfilUsuarioMock {
  id: string;
  entidad: string;
  unidad: string;
  rol: string;
  rolCodigo: string;
  ambito: string;
  esPrincipal: boolean;
}

export interface UsuarioMock {
  id: string;
  dni: string;
  nombres: string;
  apellidos: string;
  email: string;
  estado: EstadoUsuario;
  ultimoAcceso: string | null;
  debeCambiarPassword: boolean;
  perfiles: PerfilUsuarioMock[];
}

export const USUARIOS_MOCK: UsuarioMock[] = [
  {
    id: '1',
    dni: '00000001',
    nombres: 'Administrador',
    apellidos: 'Sistema OGTI',
    email: 'admin@mef.gob.pe',
    estado: 'activo',
    ultimoAcceso: '11/05/2026 20:05',
    debeCambiarPassword: false,
    perfiles: [
      { id: 'p1', entidad: 'Ministerio de Economía y Finanzas', unidad: 'OGTI', rol: 'Administrador del Sistema', rolCodigo: 'ADMIN_SISTEMA', ambito: 'sistema', esPrincipal: true }
    ]
  },
  {
    id: '2',
    dni: '12345678',
    nombres: 'Juan',
    apellidos: 'Pérez García',
    email: 'juan.perez@mef.gob.pe',
    estado: 'activo',
    ultimoAcceso: '11/05/2026 18:30',
    debeCambiarPassword: false,
    perfiles: [
      { id: 'p2', entidad: 'Ministerio de Economía y Finanzas', unidad: 'DGCP', rol: 'Creador', rolCodigo: 'CREADOR', ambito: 'entidad', esPrincipal: true }
    ]
  },
  {
    id: '3',
    dni: '87654321',
    nombres: 'María',
    apellidos: 'López Torres',
    email: 'maria.lopez@mef.gob.pe',
    estado: 'activo',
    ultimoAcceso: '11/05/2026 17:45',
    debeCambiarPassword: false,
    perfiles: [
      { id: 'p3', entidad: 'Ministerio de Economía y Finanzas', unidad: 'DGCP', rol: 'Aprobador', rolCodigo: 'APROBADOR', ambito: 'entidad', esPrincipal: true }
    ]
  },
  {
    id: '4',
    dni: '45678901',
    nombres: 'Carlos',
    apellidos: 'Ríos Mendoza',
    email: 'carlos.rios@municipalidad-ica.gob.pe',
    estado: 'activo',
    ultimoAcceso: '10/05/2026 09:15',
    debeCambiarPassword: true,
    perfiles: [
      { id: 'p4', entidad: 'Municipalidad Provincial de Ica', unidad: 'Oficina de Contabilidad', rol: 'Creador', rolCodigo: 'CREADOR', ambito: 'entidad', esPrincipal: true }
    ]
  },
  {
    id: '5',
    dni: '23456789',
    nombres: 'Ana',
    apellidos: 'Vargas Huanca',
    email: 'ana.vargas@gore-ica.gob.pe',
    estado: 'inactivo',
    ultimoAcceso: '05/05/2026 14:20',
    debeCambiarPassword: false,
    perfiles: [
      { id: 'p5', entidad: 'Gobierno Regional de Ica', unidad: 'Oficina de Contabilidad', rol: 'Revisor', rolCodigo: 'REVISOR', ambito: 'entidad', esPrincipal: true }
    ]
  },
  {
    id: '6',
    dni: '34567890',
    nombres: 'Pedro',
    apellidos: 'Huamán Ccoa',
    email: 'pedro.huaman@mef.gob.pe',
    estado: 'bloqueado',
    ultimoAcceso: '01/05/2026 11:00',
    debeCambiarPassword: false,
    perfiles: [
      { id: 'p6', entidad: 'Ministerio de Economía y Finanzas', unidad: 'DGCP', rol: 'Consulta', rolCodigo: 'CONSULTA', ambito: 'entidad', esPrincipal: true }
    ]
  },
  {
    id: '7',
    dni: '56789012',
    nombres: 'Lucía',
    apellidos: 'Flores Quispe',
    email: 'lucia.flores@municipalidad-pisco.gob.pe',
    estado: 'pendiente_activacion',
    ultimoAcceso: null,
    debeCambiarPassword: true,
    perfiles: [
      { id: 'p7', entidad: 'Municipalidad Provincial de Pisco', unidad: 'Gerencia de Administración', rol: 'Creador', rolCodigo: 'CREADOR', ambito: 'entidad', esPrincipal: true }
    ]
  }
];

export const ESTADO_USUARIO_LABEL: Record<EstadoUsuario, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
  bloqueado: 'Bloqueado',
  pendiente_activacion: 'Pendiente activación'
};

export const ESTADO_USUARIO_COLOR: Record<EstadoUsuario, string> = {
  activo: 'text-[var(--sys-color-text-feedback-success)] bg-[var(--sys-color-bg-feedback-success-light)]',
  inactivo: 'text-[var(--sys-color-text-secondary)] bg-[var(--sys-color-bg-surfaces-surface-low)]',
  bloqueado: 'text-[var(--sys-color-text-feedback-danger)] bg-[var(--sys-color-bg-feedback-danger-light)]',
  pendiente_activacion: 'text-[var(--sys-color-text-feedback-warning)] bg-[var(--sys-color-bg-feedback-warning-light)]'
};

export const ROLES_MOCK = [
  { id: 'r1', codigo: 'ADMIN_SISTEMA', nombre: 'Administrador del Sistema' },
  { id: 'r2', codigo: 'ADMIN_ENTIDAD', nombre: 'Administrador de Entidad' },
  { id: 'r3', codigo: 'CREADOR', nombre: 'Creador' },
  { id: 'r4', codigo: 'REVISOR', nombre: 'Revisor' },
  { id: 'r5', codigo: 'APROBADOR', nombre: 'Aprobador' },
  { id: 'r6', codigo: 'CONSULTA', nombre: 'Consulta' },
];

export const ENTIDADES_SELECT_MOCK = [
  { id: 'e1', nombre: 'Ministerio de Economía y Finanzas' },
  { id: 'e2', nombre: 'Municipalidad Provincial de Ica' },
  { id: 'e3', nombre: 'Gobierno Regional de Ica' },
  { id: 'e4', nombre: 'Municipalidad Provincial de Pisco' },
];
