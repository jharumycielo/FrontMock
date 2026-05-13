import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import { BreadcrumbComponent, BreadcrumbItem } from '../../../../../shared/components/breadcrumb/breadcrumb.component';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import {
  AUDITORIA_ACCIONES,
  AUDITORIA_MOCK,
  AUDITORIA_MODULOS,
  AuditoriaEventoMock,
} from '../../config/auditoria.mock';

@Component({
  selector: 'siaf-admin-auditoria',
  standalone: true,
  imports: [BreadcrumbComponent, IconComponent, PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="min-w-0">
      <div class="border-b border-[var(--sys-color-divider-default)] bg-surface">
        <siaf-breadcrumb class="block" [items]="breadcrumbs" />
        <div class="flex min-h-[56px] items-center justify-between gap-siaf-md px-siaf-md pb-siaf-md">
          <h1 class="m-0 text-sm font-bold uppercase leading-normal text-[var(--sys-color-text-brand-secondary)]">Auditoría del Sistema</h1>
          <button
            type="button"
            class="inline-flex items-center gap-siaf-xs rounded-siaf-md border border-[var(--sys-color-divider-default)] bg-surface px-siaf-md py-siaf-xs text-sm font-medium text-text transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-dark-pressed)]"
            (click)="exportar()"
          >
            <siaf-icon name="download" [size]="18" />
            Exportar
          </button>
        </div>
      </div>

      <section class="min-h-[calc(100vh-112px)] bg-[var(--sys-color-bg-surfaces-surface-lowest)] p-siaf-md">

        <!-- Filter cards -->
        <div class="mb-siaf-md flex flex-wrap items-end gap-siaf-md rounded-siaf-md bg-surface px-siaf-md py-siaf-sm">

          <!-- Fecha desde -->
          <div class="flex flex-col gap-1 min-w-[150px]">
            <label class="text-xs font-medium text-[var(--sys-color-text-neutral-low)]">Fecha desde</label>
            <input
              type="date"
              class="h-10 rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface px-siaf-md text-sm text-text outline-none transition focus:border-2 focus:border-[var(--sys-color-border-states-focus)]"
              [value]="fechaDesde()"
              (input)="onFechaDesdeChange($any($event.target).value)"
            />
          </div>

          <!-- Fecha hasta -->
          <div class="flex flex-col gap-1 min-w-[150px]">
            <label class="text-xs font-medium text-[var(--sys-color-text-neutral-low)]">Fecha hasta</label>
            <input
              type="date"
              class="h-10 rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface px-siaf-md text-sm text-text outline-none transition focus:border-2 focus:border-[var(--sys-color-border-states-focus)]"
              [value]="fechaHasta()"
              (input)="onFechaHastaChange($any($event.target).value)"
            />
          </div>

          <!-- Módulo -->
          <div class="flex flex-col gap-1 min-w-[160px]">
            <label class="text-xs font-medium text-[var(--sys-color-text-neutral-low)]">Módulo</label>
            <select
              class="h-10 rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface px-siaf-md text-sm text-text outline-none transition focus:border-2 focus:border-[var(--sys-color-border-states-focus)]"
              [value]="filtroModulo()"
              (change)="onModuloChange($any($event.target).value)"
            >
              @for (modulo of modulos; track modulo) {
                <option [value]="modulo">{{ modulo }}</option>
              }
            </select>
          </div>

          <!-- Acción -->
          <div class="flex flex-col gap-1 min-w-[200px]">
            <label class="text-xs font-medium text-[var(--sys-color-text-neutral-low)]">Acción</label>
            <select
              class="h-10 rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface px-siaf-md text-sm text-text outline-none transition focus:border-2 focus:border-[var(--sys-color-border-states-focus)]"
              [value]="filtroAccion()"
              (change)="onAccionChange($any($event.target).value)"
            >
              @for (accion of acciones; track accion) {
                <option [value]="accion">{{ accion }}</option>
              }
            </select>
          </div>

        </div>

        <div class="mb-siaf-sm px-siaf-sm">
          <siaf-pagination
            navigation="Activate"
            position="Top"
            [page]="page()"
            [pageSize]="pageSize()"
            [totalItems]="filteredEventos().length"
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
                <th class="siaf-table-th">Fecha</th>
                <th class="siaf-table-th">Hora</th>
                <th class="siaf-table-th">Usuario</th>
                <th class="siaf-table-th">DNI</th>
                <th class="siaf-table-th">Módulo</th>
                <th class="siaf-table-th rounded-r-siaf-sm">Acción</th>
                <th class="siaf-table-th">IP</th>
              </tr>
            </thead>
            <tbody>
              @for (evento of paginatedEventos(); track evento.id; let i = $index) {
                <tr class="siaf-table-row">
                  <td class="siaf-table-td px-siaf-sm text-[var(--sys-color-text-neutral-medium)]">{{ rowNumber(i) }}</td>
                  <td class="siaf-table-td text-[var(--sys-color-text-neutral-medium)]">{{ evento.fecha }}</td>
                  <td class="siaf-table-td font-mono">{{ evento.hora }}</td>
                  <td class="siaf-table-td">{{ evento.usuario }}</td>
                  <td class="siaf-table-td font-mono text-[var(--sys-color-text-neutral-medium)]">{{ evento.dni }}</td>
                  <td class="siaf-table-td">
                    <span class="inline-flex items-center rounded-siaf-sm border border-[var(--sys-color-divider-default)] bg-[var(--sys-color-bg-surfaces-surface-lowest)] px-siaf-xs py-0 text-xs text-[var(--sys-color-text-neutral-medium)]">
                      {{ evento.modulo }}
                    </span>
                  </td>
                  <td class="siaf-table-td">{{ evento.accionLabel }}</td>
                  <td class="siaf-table-td font-mono text-[var(--sys-color-text-neutral-medium)]">{{ evento.ip ?? '—' }}</td>
                </tr>
              }
              @empty {
                <tr>
                  <td colspan="8" class="px-siaf-md py-siaf-xl text-center text-sm text-[var(--sys-color-text-neutral-medium)]">
                    No se encontraron eventos con los filtros aplicados.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="mt-siaf-sm px-siaf-sm">
          <siaf-pagination navigation="Activate" position="Bottom" [rowPage]="true" [page]="page()" [pageSize]="pageSize()" [rowsPerPage]="pageSize()" [totalItems]="filteredEventos().length" [totalPages]="totalPages()" (previous)="previousPage()" (next)="nextPage()" (rowsPerPageChange)="setPageSize($event)" />
        </div>

      </section>
    </section>
  `,
})
export class AdminAuditoriaComponent {
  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Inicio', href: '/panel' },
    { label: 'Administración' },
    { label: 'Auditoría' },
  ];

  readonly modulos = AUDITORIA_MODULOS;
  readonly acciones = AUDITORIA_ACCIONES;

  readonly filtroModulo = signal('Todos');
  readonly filtroAccion = signal('Todos');
  readonly fechaDesde = signal('');
  readonly fechaHasta = signal('');
  readonly page = signal(1);
  readonly pageSize = signal(10);

  readonly filteredEventos = computed(() => {
    const modulo = this.filtroModulo();
    const accion = this.filtroAccion();

    return AUDITORIA_MOCK.filter((evento: AuditoriaEventoMock) => {
      const moduloMatch = modulo === 'Todos' || evento.modulo === modulo;
      const accionMatch = accion === 'Todos' || evento.accionLabel === accion;
      return moduloMatch && accionMatch;
    });
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredEventos().length / this.pageSize())));

  readonly paginatedEventos = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.filteredEventos().slice(start, start + this.pageSize());
  });

  onFechaDesdeChange(value: string): void {
    this.fechaDesde.set(value);
    this.page.set(1);
  }

  onFechaHastaChange(value: string): void {
    this.fechaHasta.set(value);
    this.page.set(1);
  }

  onModuloChange(value: string): void {
    this.filtroModulo.set(value);
    this.page.set(1);
  }

  onAccionChange(value: string): void {
    this.filtroAccion.set(value);
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

  exportar(): void {
    console.log('Exportar auditoría:', this.filteredEventos().length, 'eventos');
  }
}
