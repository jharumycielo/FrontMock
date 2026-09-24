import { Injectable, computed, signal } from '@angular/core';

/**
 * Tipo de usuario para el rol visualizador. Determina el alcance de la
 * información visible y, más adelante, las opciones de filtro disponibles
 * en las consultas y reportes.
 */
export type VisualizadorTipo = 'pliego' | 'unidad_ejecutora' | 'ente_rector';

export const VISUALIZADOR_TIPO_LABELS: Record<VisualizadorTipo, string> = {
  pliego: 'PLIEGO',
  unidad_ejecutora: 'UNIDAD EJECUTORA',
  ente_rector: 'DGCP',
};

export type CurrentUser = {
  name: string;
  office: string;
  visualizadorTipo?: VisualizadorTipo;
};

const STORAGE_KEY = 'siaf-current-user';

// Valores mock hasta que la autenticación real provea el perfil del usuario.
const DEFAULT_USER: CurrentUser = {
  name: 'Usuario rol Visualizador',
  office: VISUALIZADOR_TIPO_LABELS.pliego,
  visualizadorTipo: 'pliego',
};

/** Recupera el usuario de la sesión del navegador para conservar su vista al recargar. */
function readStoredUser(): CurrentUser {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as CurrentUser) : DEFAULT_USER;
  } catch {
    return DEFAULT_USER;
  }
}

@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  private readonly _user = signal<CurrentUser>(readStoredUser());

  readonly user = this._user.asReadonly();

  /** Tipo de visualizador del usuario actual (undefined si el rol no es visualizador). */
  readonly visualizadorTipo = computed(() => this._user().visualizadorTipo);

  setUser(user: CurrentUser): void {
    this._user.set(user);
    this.persist();
  }

  /** Cambia el tipo de visualizador y sincroniza la oficina mostrada con su etiqueta. */
  setVisualizadorTipo(tipo: VisualizadorTipo): void {
    this._user.update((current) => ({
      ...current,
      visualizadorTipo: tipo,
      office: VISUALIZADOR_TIPO_LABELS[tipo],
    }));
    this.persist();
  }

  private persist(): void {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this._user()));
    } catch {
      // Sin almacenamiento disponible: el usuario vive solo en memoria.
    }
  }

  get name(): string {
    return this._user().name;
  }

  get office(): string {
    return this._user().office;
  }
}
