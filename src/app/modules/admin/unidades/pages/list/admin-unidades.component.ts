import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import { BreadcrumbComponent, BreadcrumbItem } from '../../../../../shared/components/breadcrumb/breadcrumb.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';

type EstadoUnidad = 'activa' | 'suspendida' | 'archivada';

interface UnidadMock {
  id: string;
  codigo: string;
  nombre: string;
  tipoUnidad: string;
  estadoUnidad: EstadoUnidad;
  totalUsuarios: number;
}

const ESTADO_UNIDAD_COLOR: Record<EstadoUnidad, string> = {
  activa: 'text-[var(--sys-color-text-feedback-success)] bg-[var(--sys-color-bg-feedback-success-light)]',
  suspendida: 'text-[var(--sys-color-text-feedback-warning)] bg-[var(--sys-color-bg-feedback-warning-light)]',
  archivada: 'text-[var(--sys-color-text-secondary)] bg-[var(--sys-color-bg-surfaces-surface-low)]',
};

const ESTADO_UNIDAD_LABEL: Record<EstadoUnidad, string> = {
  activa: 'Activa',
  suspendida: 'Suspendida',
  archivada: 'Archivada',
};

const UNIDADES_MOCK: UnidadMock[] = [
  {
    id: '1',
    codigo: 'DGCP',
    nombre: 'Dirección General de Contabilidad Pública',
    tipoUnidad: 'Dirección General',
    estadoUnidad: 'activa',
    totalUsuarios: 3,
  },
  {
    id: '2',
    codigo: 'OGTI',
    nombre: 'Oficina General de Tecnologías de la Información',
    tipoUnidad: 'Oficina General',
    estadoUnidad: 'activa',
    totalUsuarios: 1,
  },
  {
    id: '3',
    codigo: 'OC-MEF',
    nombre: 'Oficina de Contabilidad',
    tipoUnidad: 'Oficina',
    estadoUnidad: 'suspendida',
    totalUsuarios: 0,
  },
];

@Component({
  selector: 'siaf-admin-unidades',
  standalone: true,
  imports: [BreadcrumbComponent, ButtonComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Page header -->
    <div class="flex h-[56px] items-center justify-between border-b border-[var(--sys-color-divider-default)] bg-surface px-siaf-xl">
      <div class="flex flex-col justify-center">
        <h1 class="text-base font-semibold text-[var(--sys-color-text-brand-secondary)]">Unidades Orgánicas</h1>
      </div>
      <siaf-breadcrumb [items]="breadcrumbItems" />
    </div>

    <!-- Content -->
    <div class="flex flex-col gap-siaf-md p-siaf-md">

      <!-- Action bar -->
      <div class="flex items-center justify-between gap-siaf-md">
        <div class="relative flex-1 max-w-sm">
          <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[var(--sys-color-text-brand-secondary)]">
            <siaf-icon name="search" [size]="18" />
          </span>
          <input
            type="text"
            placeholder="Buscar por código o nombre..."
            class="w-full rounded-md border border-[var(--sys-color-divider-default)] bg-surface py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--sys-color-text-brand-accent)]"
            [value]="searchTerm()"
            (input)="searchTerm.set($any($event.target).value)"
          />
        </div>
        <siaf-button variant="accent" icon="add" (click)="navigateToCreate()">
          Nueva unidad
        </siaf-button>
      </div>

      <!-- Table card -->
      <div class="bg-surface rounded-siaf-md overflow-hidden border border-[var(--sys-color-divider-default)]">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead class="bg-[var(--sys-color-bg-surfaces-surface-lowest)]">
              <tr>
                <th class="text-left text-xs font-semibold uppercase text-[var(--sys-color-text-brand-secondary)] px-4 py-3">Código</th>
                <th class="text-left text-xs font-semibold uppercase text-[var(--sys-color-text-brand-secondary)] px-4 py-3">Nombre</th>
                <th class="text-left text-xs font-semibold uppercase text-[var(--sys-color-text-brand-secondary)] px-4 py-3">Tipo de unidad</th>
                <th class="text-left text-xs font-semibold uppercase text-[var(--sys-color-text-brand-secondary)] px-4 py-3">Estado</th>
                <th class="text-left text-xs font-semibold uppercase text-[var(--sys-color-text-brand-secondary)] px-4 py-3">Usuarios</th>
                <th class="text-left text-xs font-semibold uppercase text-[var(--sys-color-text-brand-secondary)] px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (unidad of filteredUnidades(); track unidad.id) {
                <tr class="transition hover:bg-[var(--sys-color-bg-surfaces-surface-lowest)]">
                  <td class="px-4 py-3 text-sm border-b border-[var(--sys-color-divider-default)] font-mono font-medium">
                    {{ unidad.codigo }}
                  </td>
                  <td class="px-4 py-3 text-sm border-b border-[var(--sys-color-divider-default)]">
                    {{ unidad.nombre }}
                  </td>
                  <td class="px-4 py-3 text-sm border-b border-[var(--sys-color-divider-default)] text-[var(--sys-color-text-brand-secondary)]">
                    {{ unidad.tipoUnidad }}
                  </td>
                  <td class="px-4 py-3 text-sm border-b border-[var(--sys-color-divider-default)]">
                    <span
                      class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                      [class]="estadoColor(unidad.estadoUnidad)"
                    >
                      {{ estadoLabel(unidad.estadoUnidad) }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm border-b border-[var(--sys-color-divider-default)] text-center">
                    {{ unidad.totalUsuarios }}
                  </td>
                  <td class="px-4 py-3 text-sm border-b border-[var(--sys-color-divider-default)]">
                    <div class="flex items-center gap-1">
                      <button
                        type="button"
                        title="Editar unidad"
                        class="inline-flex items-center justify-center rounded-md p-1.5 text-[var(--sys-color-text-brand-secondary)] hover:bg-[var(--sys-color-bg-surfaces-surface-lowest)]"
                        (click)="editUnidad(unidad)"
                      >
                        <siaf-icon name="edit" [size]="18" />
                      </button>
                      <button
                        type="button"
                        title="Ver usuarios de la unidad"
                        class="inline-flex items-center justify-center rounded-md p-1.5 text-[var(--sys-color-text-brand-secondary)] hover:bg-[var(--sys-color-bg-surfaces-surface-lowest)]"
                        (click)="verUsuarios(unidad)"
                      >
                        <siaf-icon name="group" [size]="18" />
                      </button>
                      <button
                        type="button"
                        title="Más opciones"
                        class="inline-flex items-center justify-center rounded-md p-1.5 text-[var(--sys-color-text-brand-secondary)] hover:bg-[var(--sys-color-bg-surfaces-surface-lowest)]"
                        (click)="moreOptions(unidad)"
                      >
                        <siaf-icon name="more_vert" [size]="18" />
                      </button>
                    </div>
                  </td>
                </tr>
              }
              @empty {
                <tr>
                  <td colspan="6" class="px-4 py-8 text-center text-sm text-[var(--sys-color-text-brand-secondary)]">
                    No se encontraron unidades con los criterios de búsqueda.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Footer count -->
        <div class="flex items-center justify-between border-t border-[var(--sys-color-divider-default)] px-4 py-2">
          <span class="text-xs text-[var(--sys-color-text-brand-secondary)]">
            Total: {{ filteredUnidades().length }} unidad{{ filteredUnidades().length !== 1 ? 'es' : '' }}
          </span>
        </div>
      </div>
    </div>
  `,
})
export class AdminUnidadesComponent {
  readonly breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Inicio', href: '/panel' },
    { label: 'Administración' },
    { label: 'Unidades Orgánicas' },
  ];

  readonly searchTerm = signal('');

  readonly filteredUnidades = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return UNIDADES_MOCK;
    return UNIDADES_MOCK.filter(
      (u) =>
        u.codigo.toLowerCase().includes(term) ||
        u.nombre.toLowerCase().includes(term) ||
        u.tipoUnidad.toLowerCase().includes(term),
    );
  });

  estadoColor(estado: EstadoUnidad): string {
    return ESTADO_UNIDAD_COLOR[estado];
  }

  estadoLabel(estado: EstadoUnidad): string {
    return ESTADO_UNIDAD_LABEL[estado];
  }

  navigateToCreate(): void {
    console.log('Navegar a crear unidad');
  }

  editUnidad(unidad: UnidadMock): void {
    console.log('Editar unidad:', unidad.codigo);
  }

  verUsuarios(unidad: UnidadMock): void {
    console.log('Ver usuarios de:', unidad.codigo);
  }

  moreOptions(unidad: UnidadMock): void {
    console.log('Más opciones para:', unidad.codigo);
  }
}
