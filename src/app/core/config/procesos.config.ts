/**
 * Catálogo central de módulos y procesos del sistema SIAF-RP.
 * El Escritorio Virtual lee este catálogo para mostrar los procesos
 * disponibles según el perfil activo del usuario.
 *
 * Cada módulo futuro (presupuesto, tesorería, abastecimiento)
 * registra sus procesos aquí.
 */

export interface ProcesoConfig {
  id: string;
  nombre: string;
  ruta: string;
  icono: string;
  permisos: string[];
}

export interface ModuloConfig {
  id: string;
  nombre: string;
  icono: string;
  permisos: string[];
  procesos: ProcesoConfig[];
}

export const MODULOS_CONFIG: ModuloConfig[] = [
  // ── Gestión Contable ─────────────────────────────────────────
  {
    id: 'contabilidad',
    nombre: 'Gestión Contable',
    icono: 'calculate',
    permisos: ['chart_account.read', 'document.read'],
    procesos: [
      {
        id: 'plan-cuentas-contables',
        nombre: 'Plan de Cuentas Contables',
        ruta: '/procesos/plan-cuentas-contables',
        icono: 'book',
        permisos: ['chart_account.read'],
      },
      {
        id: 'registro-asiento-ajuste',
        nombre: 'Registro de Asiento de Ajuste',
        ruta: '/procesos/registro-asiento-ajuste',
        icono: 'edit_note',
        permisos: ['document.read'],
      },
    ],
  },

  // ── Administración (transversal) ─────────────────────────────
  {
    id: 'admin',
    nombre: 'Administración',
    icono: 'admin_panel_settings',
    permisos: ['user.read'],
    procesos: [
      {
        id: 'usuarios',
        nombre: 'Gestión de Usuarios',
        ruta: '/admin/usuarios',
        icono: 'group',
        permisos: ['user.read'],
      },
      {
        id: 'entidades',
        nombre: 'Entidades Públicas',
        ruta: '/admin/entidades',
        icono: 'account_balance',
        permisos: ['entity.create'],
      },
      {
        id: 'auditoria',
        nombre: 'Auditoría',
        ruta: '/admin/auditoria',
        icono: 'shield',
        permisos: ['audit.read'],
      },
    ],
  },

  // ── Gestión de Presupuesto (futuro) ──────────────────────────
  {
    id: 'presupuesto',
    nombre: 'Gestión de Presupuesto',
    icono: 'bar_chart',
    permisos: ['presupuesto.read'],
    procesos: [],
  },

  // ── Gestión de Tesorería (futuro) ────────────────────────────
  {
    id: 'tesoreria',
    nombre: 'Gestión de Tesorería',
    icono: 'account_balance_wallet',
    permisos: ['tesoreria.read'],
    procesos: [],
  },

  // ── Gestión de Abastecimiento (futuro) ───────────────────────
  {
    id: 'abastecimiento',
    nombre: 'Gestión de Abastecimiento',
    icono: 'inventory',
    permisos: ['abastecimiento.read'],
    procesos: [],
  },
];
