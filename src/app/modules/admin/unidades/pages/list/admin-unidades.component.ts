import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import { BreadcrumbComponent, BreadcrumbItem } from '../../../../../shared/components/breadcrumb/breadcrumb.component';
import { FormTableSearchComponent } from '../../../../../shared/components/form-table-search/form-table-search.component';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
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
  imports: [BreadcrumbComponent, ButtonComponent, FormTableSearchComponent, IconComponent, PaginationComponent],
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
        <div class="min-w-0 flex-1">
          <siaf-form-table-search
            placeholder="Buscar por código o nombre..."
            ariaLabel="Buscar unidades"
            [value]="searchTerm()"
            (valueChange)="onSearchChange($event)"
          />
        </div>
        <siaf-button variant="accent" icon="add" (click)="navigateToCreate()">
          Nueva unidad
        </siaf-button>
      </div>

      <div class="px-siaf-sm">
        <siaf-pagination
          navigation="Activate"
          position="Top"
          [page]="page()"
          [pageSize]="pageSize()"
          [totalItems]="filteredUnidades().length"
          [totalPages]="totalPages()"
          (previous)="previousPage()"
          (next)="nextPage()"
        />
      </div>

      <!-- Table card -->
      <div class="bg-surface rounded-siaf-md overflow-hidden border border-[var(--sys-color-divider-default)]">
        <div class="siaf-table-shell rounded-none">
          <table class="siaf-table">
            <thead>
              <tr class="siaf-table-head-row">
                <th class="siaf-table-th">Código</th>
                <th class="siaf-table-th">Nombre</th>
                <th class="siaf-table-th">Tipo de unidad</th>
                <th class="siaf-table-th">Estado</th>
                <th class="siaf-table-th">Usuarios</th>
                <th class="siaf-table-th">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (unidad of paginatedUnidades(); track unidad.id) {
                <tr class="siaf-table-row">
                  <td class="siaf-table-td font-mono font-medium">
                    {{ unidad.codigo }}
                  </td>
                  <td class="siaf-table-td">
                    {{ unidad.nombre }}
                  </td>
                  <td class="siaf-table-td text-[var(--sys-color-text-brand-secondary)]">
                    {{ unidad.tipoUnidad }}
                  </td>
                  <td class="siaf-table-td">
                    <span
                      class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                      [class]="estadoColor(unidad.estadoUnidad)"
                    >
                      {{ estadoLabel(unidad.estadoUnidad) }}
                    </span>
                  </td>
                  <td class="siaf-table-td text-center">
                    {{ unidad.totalUsuarios }}
                  </td>
                  <td class="siaf-table-td">
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

        <div class="flex items-center justify-between border-t border-[var(--sys-color-divider-default)] px-4 py-2">
          <siaf-pagination navigation="Activate" position="Bottom" [rowPage]="true" [page]="page()" [pageSize]="pageSize()" [rowsPerPage]="pageSize()" [totalItems]="filteredUnidades().length" [totalPages]="totalPages()" (previous)="previousPage()" (next)="nextPage()" (rowsPerPageChange)="setPageSize($event)" />
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
  readonly page = signal(1);
  readonly pageSize = signal(10);

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

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredUnidades().length / this.pageSize())));

  readonly paginatedUnidades = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.filteredUnidades().slice(start, start + this.pageSize());
  });

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.page.set(1);
  }

  previousPage(): void {
    this.page.update((page) => Math.max(1, page - 1));
  }

  nextPage(): void {
    this.page.update((page) => Math.min(this.totalPages(), page + 1));
  }

  setPageSize(pageSize: number): void {
    this.pageSize.set(pageSize);
    this.page.set(1);
  }

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
