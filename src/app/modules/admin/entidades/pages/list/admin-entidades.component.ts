import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { BreadcrumbComponent, BreadcrumbItem } from '../../../../../shared/components/breadcrumb/breadcrumb.component';
import { FormTableSearchComponent } from '../../../../../shared/components/form-table-search/form-table-search.component';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { RecordStatus, RecordStatusTagComponent } from '../../../../../shared/ui/record-status-tag/record-status-tag.component';
import {
  ENTIDADES_MOCK,
  EstadoEntidad,
  EntidadMock,
  TIPO_ENTIDAD_LABEL,
  TipoEntidad,
} from '../../config/entidades.mock';

const ESTADO_TO_RECORD_STATUS: Record<EstadoEntidad, RecordStatus> = {
  activa: 'Activo',
  suspendida: 'En Proceso',
  migrada: 'Validado',
  archivada: 'Inactivo',
};

@Component({
  selector: 'siaf-admin-entidades',
  standalone: true,
  imports: [BreadcrumbComponent, FormTableSearchComponent, IconComponent, PaginationComponent, RecordStatusTagComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="min-w-0">
      <div class="border-b border-[var(--sys-color-divider-default)] bg-surface">
        <siaf-breadcrumb class="block" [items]="breadcrumbs" />
        <div class="flex min-h-[56px] items-center justify-between gap-siaf-md px-siaf-md pb-siaf-md">
          <h1 class="m-0 text-sm font-bold uppercase leading-normal text-[var(--sys-color-text-brand-secondary)]">Gestión de Entidades</h1>
          <button
            type="button"
            class="inline-flex items-center gap-siaf-xs rounded-siaf-md bg-[var(--sys-color-bg-brand-accent)] px-siaf-md py-siaf-xs text-sm font-medium text-[var(--sys-color-text-brand-white)] transition hover:brightness-90 active:brightness-75"
            (click)="navigateToCreate()"
          >
            <siaf-icon name="add_business" [size]="18" />
            Nueva entidad
          </button>
        </div>
      </div>

      <section class="min-h-[calc(100vh-112px)] bg-[var(--sys-color-bg-surfaces-surface-lowest)] p-siaf-md">

        <div class="mb-siaf-md">
          <siaf-form-table-search
            placeholder="Buscar por código o nombre..."
            ariaLabel="Buscar entidades"
            [value]="searchTerm()"
            (valueChange)="onSearchChange($event)"
          />
        </div>

        <div class="mb-siaf-sm px-siaf-sm">
          <siaf-pagination
            navigation="Activate"
            position="Top"
            [page]="page()"
            [pageSize]="pageSize()"
            [totalItems]="filteredEntidades().length"
            [totalPages]="totalPages()"
            (previous)="previousPage()"
            (next)="nextPage()"
          />
        </div>

        <!-- Table -->
        <div class="siaf-table-shell">
          <table class="siaf-table min-w-[900px]">
            <thead>
              <tr class="siaf-table-head-row">
                <th class="siaf-table-th w-10 rounded-l-siaf-sm px-siaf-sm">#</th>
                <th class="siaf-table-th">Código</th>
                <th class="siaf-table-th">Nombre</th>
                <th class="siaf-table-th">Tipo</th>
                <th class="siaf-table-th">Estado</th>
                <th class="siaf-table-th w-20 text-center">Unidades</th>
                <th class="siaf-table-th w-20 text-center">Usuarios</th>
                <th class="siaf-table-th siaf-table-sticky-cell w-20 rounded-r-siaf-sm px-siaf-sm">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (entidad of paginatedEntidades(); track entidad.id; let i = $index) {
                <tr class="siaf-table-row">
                  <td class="siaf-table-td px-siaf-sm text-[var(--sys-color-text-neutral-medium)]">{{ rowNumber(i) }}</td>
                  <td class="siaf-table-td font-mono font-medium">{{ entidad.codigo }}</td>
                  <td class="siaf-table-td">{{ entidad.nombre }}</td>
                  <td class="siaf-table-td text-[var(--sys-color-text-neutral-medium)]">{{ tipoLabel(entidad.tipoEntidad) }}</td>
                  <td class="siaf-table-td">
                    <siaf-record-status-tag [status]="getRecordStatus(entidad.estadoEntidad)" size="small" />
                  </td>
                  <td class="siaf-table-td text-center">{{ entidad.totalUnidades }}</td>
                  <td class="siaf-table-td text-center">{{ entidad.totalUsuarios }}</td>
                  <td class="siaf-table-td siaf-table-sticky-cell px-siaf-sm py-siaf-xs">
                    <div class="flex items-center gap-1">
                      <button
                        type="button"
                        title="Editar entidad"
                        class="inline-flex size-8 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-dark-pressed)]"
                        (click)="editEntidad(entidad)"
                      >
                        <siaf-icon name="edit" [size]="18" />
                      </button>
                      <button
                        type="button"
                        title="Ver unidades orgánicas"
                        class="inline-flex size-8 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-dark-pressed)]"
                        (click)="verUnidades(entidad)"
                      >
                        <siaf-icon name="account_tree" [size]="18" />
                      </button>
                      <button
                        type="button"
                        title="Más opciones"
                        class="inline-flex size-8 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-dark-pressed)]"
                        (click)="moreOptions(entidad)"
                      >
                        <siaf-icon name="more_vert" [size]="18" />
                      </button>
                    </div>
                  </td>
                </tr>
              }
              @empty {
                <tr>
                  <td colspan="8" class="px-siaf-md py-siaf-xl text-center text-sm text-[var(--sys-color-text-neutral-medium)]">
                    No se encontraron entidades con los criterios de búsqueda.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="mt-siaf-sm px-siaf-sm">
          <siaf-pagination navigation="Activate" position="Bottom" [rowPage]="true" [page]="page()" [pageSize]="pageSize()" [rowsPerPage]="pageSize()" [totalItems]="filteredEntidades().length" [totalPages]="totalPages()" (previous)="previousPage()" (next)="nextPage()" (rowsPerPageChange)="setPageSize($event)" />
        </div>

      </section>
    </section>
  `,
})
export class AdminEntidadesComponent {
  private readonly router = inject(Router);

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Inicio', href: '/panel' },
    { label: 'Administración' },
    { label: 'Entidades' },
  ];

  readonly searchTerm = signal('');
  readonly page = signal(1);
  readonly pageSize = signal(10);

  readonly filteredEntidades = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return ENTIDADES_MOCK;
    return ENTIDADES_MOCK.filter(
      (e) =>
        e.codigo.toLowerCase().includes(term) ||
        e.nombre.toLowerCase().includes(term) ||
        String(e.codigoNumerico).includes(term),
    );
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredEntidades().length / this.pageSize())));

  readonly paginatedEntidades = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.filteredEntidades().slice(start, start + this.pageSize());
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

  rowNumber(index: number): number {
    return (this.page() - 1) * this.pageSize() + index + 1;
  }

  tipoLabel(tipo: TipoEntidad): string {
    return TIPO_ENTIDAD_LABEL[tipo];
  }

  getRecordStatus(estado: EstadoEntidad): RecordStatus {
    return ESTADO_TO_RECORD_STATUS[estado];
  }

  navigateToCreate(): void {
    void this.router.navigate(['/admin/entidades/nueva']);
  }

  editEntidad(entidad: EntidadMock): void {
    void this.router.navigate(['/admin/entidades', entidad.id, 'editar']);
  }

  verUnidades(entidad: EntidadMock): void {
    console.log('Ver unidades de:', entidad.codigo);
  }

  moreOptions(entidad: EntidadMock): void {
    console.log('Más opciones para:', entidad.codigo);
  }
}
