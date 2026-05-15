import { Injectable, signal, computed } from '@angular/core';

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

export type EstadoSolicitudDemo =
  | 'Elaborado'
  | 'Verificado'
  | 'Aprobado'
  | 'Rechazado'
  | 'Observado'
  | 'Eliminado';

export interface CuentaDemo {
  recordId: string;
  status: string;
  element: string;
  group: string;
  account: string;
  subAccount1: string;
  subAccount2: string;
  subAccount3: string;
  accountName: string;
  imputable: string;
  previousCode: string;
  institutionalScopes: string;
  aep: string;
  reciprocal: string;
}

export interface HistorialDemo {
  estado: EstadoSolicitudDemo;
  fecha: string;
  usuario: string;
  perfil: string;
  comentario?: string;
}

export interface SolicitudDemo {
  id: string;
  numero: string;
  tipoDocumento: string;
  tipoAccion: string;
  estado: EstadoSolicitudDemo;
  fecha: string;
  entidad: string;
  unidad: string;
  creador: string;
  justificacion: string;
  organoLinea: string;
  plan: string;
  cuentas: CuentaDemo[];
  archivos: string[];
  historial: HistorialDemo[];
}

// ─────────────────────────────────────────────
// CORRELATIVO
// ─────────────────────────────────────────────
let correlativo = 1;
const generarNumero = (): string => {
  const num = String(correlativo).padStart(5, '0');
  correlativo++;
  return `1-${new Date().getFullYear()}-${num}`;
};

// ─────────────────────────────────────────────
// SERVICIO
// ─────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class SolicitudesStateService {

  private readonly _solicitudes = signal<SolicitudDemo[]>([]);

  // ── Lecturas ──────────────────────────────────

  readonly solicitudes = this._solicitudes.asReadonly();

  // Bandeja del CREADOR — todas sus solicitudes
  readonly bandejaCreador = computed(() => this._solicitudes());

  // Bandeja del APROBADOR
  // Recibe: VERIFICADO (pendiente de acción)
  // Ve también: APROBADO, OBSERVADO, RECHAZADO (historial)
  // NO ve: ELABORADO, ELIMINADO (internos del CREADOR)
  readonly bandejaAprobador = computed(() =>
    this._solicitudes().filter(s =>
      s.estado === 'Verificado' ||
      s.estado === 'Observado' ||
      s.estado === 'Aprobado' ||
      s.estado === 'Rechazado'
    )
  );

  obtenerPorId(id: string): SolicitudDemo | undefined {
    return this._solicitudes().find(s => s.id === id);
  }

  // ── Acciones del CREADOR ──────────────────────

  crear(datos: {
    tipoAccion: string;
    plan: string;
    justificacion: string;
    organoLinea: string;
    cuentas: CuentaDemo[];
    archivos: string[];
  }): SolicitudDemo {
    const nueva: SolicitudDemo = {
      id: crypto.randomUUID(),
      numero: generarNumero(),
      tipoDocumento: 'Solicitud de Cuentas Contables',
      tipoAccion: datos.tipoAccion,
      estado: 'Elaborado',
      fecha: new Date().toLocaleDateString('es-PE'),
      entidad: 'Ministerio de Economía y Finanzas',
      unidad: 'Dirección General de Contabilidad Pública',
      creador: 'Juan Pérez García',
      justificacion: datos.justificacion,
      organoLinea: datos.organoLinea,
      plan: datos.plan,
      cuentas: datos.cuentas,
      archivos: datos.archivos,
      historial: [
        {
          estado: 'Elaborado',
          fecha: new Date().toLocaleString('es-PE'),
          usuario: 'Juan Pérez García',
          perfil: 'CREADOR - MEF/DGCP',
        },
      ],
    };

    this._solicitudes.update(list => [nueva, ...list]);
    return nueva;
  }

  verificar(id: string): void {
    this._solicitudes.update(list =>
      list.map(s => {
        if (s.id !== id) return s;
        return {
          ...s,
          estado: 'Verificado' as EstadoSolicitudDemo,
          historial: [
            ...s.historial,
            {
              estado: 'Verificado' as EstadoSolicitudDemo,
              fecha: new Date().toLocaleString('es-PE'),
              usuario: 'Juan Pérez García',
              perfil: 'CREADOR - MEF/DGCP',
            },
          ],
        };
      })
    );
  }

  eliminar(id: string): void {
    this._solicitudes.update(list =>
      list.map(s => {
        if (s.id !== id) return s;
        return {
          ...s,
          estado: 'Eliminado' as EstadoSolicitudDemo,
          historial: [
            ...s.historial,
            {
              estado: 'Eliminado' as EstadoSolicitudDemo,
              fecha: new Date().toLocaleString('es-PE'),
              usuario: 'Juan Pérez García',
              perfil: 'CREADOR - MEF/DGCP',
            },
          ],
        };
      })
    );
  }

  // ── Acciones del APROBADOR ────────────────────

  aprobar(id: string): void {
    this._solicitudes.update(list =>
      list.map(s => {
        if (s.id !== id) return s;
        return {
          ...s,
          estado: 'Aprobado' as EstadoSolicitudDemo,
          historial: [
            ...s.historial,
            {
              estado: 'Aprobado' as EstadoSolicitudDemo,
              fecha: new Date().toLocaleString('es-PE'),
              usuario: 'María López Torres',
              perfil: 'APROBADOR - MEF/DGCP',
            },
          ],
        };
      })
    );
  }

  observar(id: string, comentario: string): void {
    this._solicitudes.update(list =>
      list.map(s => {
        if (s.id !== id) return s;
        return {
          ...s,
          estado: 'Observado' as EstadoSolicitudDemo,
          historial: [
            ...s.historial,
            {
              estado: 'Observado' as EstadoSolicitudDemo,
              fecha: new Date().toLocaleString('es-PE'),
              usuario: 'María López Torres',
              perfil: 'APROBADOR - MEF/DGCP',
              comentario,
            },
          ],
        };
      })
    );
  }

  rechazar(id: string, comentario: string): void {
    this._solicitudes.update(list =>
      list.map(s => {
        if (s.id !== id) return s;
        return {
          ...s,
          estado: 'Rechazado' as EstadoSolicitudDemo,
          historial: [
            ...s.historial,
            {
              estado: 'Rechazado' as EstadoSolicitudDemo,
              fecha: new Date().toLocaleString('es-PE'),
              usuario: 'María López Torres',
              perfil: 'APROBADOR - MEF/DGCP',
              comentario,
            },
          ],
        };
      })
    );
  }
}
