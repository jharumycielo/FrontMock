export interface AuditoriaEventoMock {
  id: string;
  fecha: string;
  hora: string;
  usuario: string;
  dni: string;
  entidad: string;
  accion: string;
  accionLabel: string;
  tablaAfectada: string | null;
  ip: string | null;
  modulo: string;
}

export const AUDITORIA_MOCK: AuditoriaEventoMock[] = [
  {
    id: '1',
    fecha: '11/05/2026',
    hora: '20:05:12',
    usuario: 'Administrador Sistema OGTI',
    dni: '00000001',
    entidad: 'MEF - OGTI',
    accion: 'usuario.login',
    accionLabel: 'Inicio de sesión',
    tablaAfectada: 'usuario',
    ip: '192.168.1.100',
    modulo: 'Auth'
  },
  {
    id: '2',
    fecha: '11/05/2026',
    hora: '21:57:59',
    usuario: 'Administrador Sistema OGTI',
    dni: '00000001',
    entidad: 'MEF - OGTI',
    accion: 'usuario.creado',
    accionLabel: 'Usuario creado',
    tablaAfectada: 'usuario',
    ip: '192.168.1.100',
    modulo: 'Usuarios'
  },
  {
    id: '3',
    fecha: '11/05/2026',
    hora: '22:29:39',
    usuario: 'Juan Pérez García',
    dni: '12345678',
    entidad: 'MEF - DGCP',
    accion: 'solicitud.creada',
    accionLabel: 'Solicitud creada',
    tablaAfectada: 'solicitud',
    ip: '192.168.1.101',
    modulo: 'Solicitudes'
  },
  {
    id: '4',
    fecha: '11/05/2026',
    hora: '22:46:58',
    usuario: 'Juan Pérez García',
    dni: '12345678',
    entidad: 'MEF - DGCP',
    accion: 'archivo.subido',
    accionLabel: 'Archivo subido',
    tablaAfectada: 'archivo',
    ip: '192.168.1.101',
    modulo: 'Documentos'
  },
  {
    id: '5',
    fecha: '11/05/2026',
    hora: '22:51:00',
    usuario: 'Juan Pérez García',
    dni: '12345678',
    entidad: 'MEF - DGCP',
    accion: 'solicitud.elaborado',
    accionLabel: 'Solicitud elaborada',
    tablaAfectada: 'solicitud',
    ip: '192.168.1.101',
    modulo: 'Solicitudes'
  },
  {
    id: '6',
    fecha: '11/05/2026',
    hora: '23:03:43',
    usuario: 'Juan Pérez García',
    dni: '12345678',
    entidad: 'MEF - DGCP',
    accion: 'solicitud.verificado',
    accionLabel: 'Solicitud verificada',
    tablaAfectada: 'solicitud',
    ip: '192.168.1.101',
    modulo: 'Solicitudes'
  },
  {
    id: '7',
    fecha: '11/05/2026',
    hora: '23:16:46',
    usuario: 'María López Torres',
    dni: '87654321',
    entidad: 'MEF - DGCP',
    accion: 'solicitud.aprobado',
    accionLabel: 'Solicitud aprobada',
    tablaAfectada: 'solicitud',
    ip: '192.168.1.102',
    modulo: 'Solicitudes'
  },
  {
    id: '8',
    fecha: '11/05/2026',
    hora: '23:16:46',
    usuario: 'María López Torres',
    dni: '87654321',
    entidad: 'MEF - DGCP',
    accion: 'cuenta_contable.creada',
    accionLabel: 'Cuenta contable creada',
    tablaAfectada: 'cuenta_contable',
    ip: '192.168.1.102',
    modulo: 'Plan Contable'
  },
  {
    id: '9',
    fecha: '11/05/2026',
    hora: '22:06:35',
    usuario: 'Administrador Sistema OGTI',
    dni: '00000001',
    entidad: 'MEF - OGTI',
    accion: 'entidad.creada',
    accionLabel: 'Entidad creada',
    tablaAfectada: 'entidad_publica',
    ip: '192.168.1.100',
    modulo: 'Entidades'
  },
  {
    id: '10',
    fecha: '11/05/2026',
    hora: '17:36:00',
    usuario: 'Administrador Sistema OGTI',
    dni: '00000001',
    entidad: 'MEF - OGTI',
    accion: 'usuario.logout',
    accionLabel: 'Cierre de sesión',
    tablaAfectada: null,
    ip: '192.168.1.100',
    modulo: 'Auth'
  }
];

export const AUDITORIA_MODULOS = ['Todos', 'Auth', 'Usuarios', 'Solicitudes', 'Documentos', 'Plan Contable', 'Entidades'];

export const AUDITORIA_ACCIONES = [
  'Todos',
  'Inicio de sesión',
  'Cierre de sesión',
  'Usuario creado',
  'Solicitud creada',
  'Solicitud elaborada',
  'Solicitud verificada',
  'Solicitud aprobada',
  'Archivo subido',
  'Cuenta contable creada',
  'Entidad creada'
];
