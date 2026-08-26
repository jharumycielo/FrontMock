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
  ente_rector: 'ENTE RECTOR',
};

export type CurrentUser = {
  name: string;
  office: string;
  visualizadorTipo?: VisualizadorTipo;
};

@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  // Valores mock hasta que la autenticación real provea el perfil del usuario.
  private readonly _user = signal<CurrentUser>({
    name: 'Usuario rol Visualizador',
    office: VISUALIZADOR_TIPO_LABELS.pliego,
    visualizadorTipo: 'pliego',
  });

  readonly user = this._user.asReadonly();

  /** Tipo de visualizador del usuario actual (undefined si el rol no es visualizador). */
  readonly visualizadorTipo = computed(() => this._user().visualizadorTipo);

  setUser(user: CurrentUser): void {
    this._user.set(user);
  }

  /** Cambia el tipo de visualizador y sincroniza la oficina mostrada con su etiqueta. */
  setVisualizadorTipo(tipo: VisualizadorTipo): void {
    this._user.update((current) => ({
      ...current,
      visualizadorTipo: tipo,
      office: VISUALIZADOR_TIPO_LABELS[tipo],
    }));
  }

  get name(): string {
    return this._user().name;
  }

  get office(): string {
    return this._user().office;
  }
}
