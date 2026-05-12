import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import { BreadcrumbComponent, BreadcrumbItem } from '../../../../../shared/components/breadcrumb/breadcrumb.component';
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
  imports: [BreadcrumbComponent, IconComponent],
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
              (input)="fechaDesde.set($any($event.target).value)"
            />
          </div>

          <!-- Fecha hasta -->
          <div class="flex flex-col gap-1 min-w-[150px]">
            <label class="text-xs font-medium text-[var(--sys-color-text-neutral-low)]">Fecha hasta</label>
            <input
              type="date"
              class="h-10 rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface px-siaf-md text-sm text-text outline-none transition focus:border-2 focus:border-[var(--sys-color-border-states-focus)]"
              [value]="fechaHasta()"
              (input)="fechaHasta.set($any($event.target).value)"
            />
          </div>

          <!-- Módulo -->
          <div class="flex flex-col gap-1 min-w-[160px]">
            <label class="text-xs font-medium text-[var(--sys-color-text-neutral-low)]">Módulo</label>
            <select
              class="h-10 rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface px-siaf-md text-sm text-text outline-none transition focus:border-2 focus:border-[var(--sys-color-border-states-focus)]"
              [value]="filtroModulo()"
              (change)="filtroModulo.set($any($event.target).value)"
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
              (change)="filtroAccion.set($any($event.target).value)"
            >
              @for (accion of acciones; track accion) {
                <option [value]="accion">{{ accion }}</option>
              }
            </select>
          </div>

        </div>

        <!-- Table -->
        <div class="overflow-x-auto rounded-siaf-md bg-surface">
          <table class="w-full border-collapse text-left text-sm min-w-[900px]">
            <thead>
              <tr class="bg-surface-high text-[10px] font-bold uppercase text-text">
                <th class="w-10 rounded-l-siaf-sm px-siaf-sm py-siaf-sm">#</th>
                <th class="px-siaf-md py-siaf-sm">Fecha</th>
                <th class="px-siaf-md py-siaf-sm">Hora</th>
                <th class="px-siaf-md py-siaf-sm">Usuario</th>
                <th class="px-siaf-md py-siaf-sm">DNI</th>
                <th class="px-siaf-md py-siaf-sm">Módulo</th>
                <th class="px-siaf-md py-siaf-sm rounded-r-siaf-sm">Acción</th>
                <th class="px-siaf-md py-siaf-sm">IP</th>
              </tr>
            </thead>
            <tbody>
              @for (evento of filteredEventos(); track evento.id; let i = $index) {
                <tr class="border-b border-[var(--sys-color-divider-default)] bg-surface hover:bg-[var(--sys-color-bg-states-light-hover)]">
                  <td class="h-[58px] px-siaf-sm py-siaf-xs text-[var(--sys-color-text-neutral-medium)]">{{ i + 1 }}</td>
                  <td class="px-siaf-md py-siaf-sm text-[var(--sys-color-text-neutral-medium)]">{{ evento.fecha }}</td>
                  <td class="px-siaf-md py-siaf-sm font-mono">{{ evento.hora }}</td>
                  <td class="px-siaf-md py-siaf-sm">{{ evento.usuario }}</td>
                  <td class="px-siaf-md py-siaf-sm font-mono text-[var(--sys-color-text-neutral-medium)]">{{ evento.dni }}</td>
                  <td class="px-siaf-md py-siaf-sm">
                    <span class="inline-flex items-center rounded-siaf-sm border border-[var(--sys-color-divider-default)] bg-[var(--sys-color-bg-surfaces-surface-lowest)] px-siaf-xs py-0 text-xs text-[var(--sys-color-text-neutral-medium)]">
                      {{ evento.modulo }}
                    </span>
                  </td>
                  <td class="px-siaf-md py-siaf-sm">{{ evento.accionLabel }}</td>
                  <td class="px-siaf-md py-siaf-sm font-mono text-[var(--sys-color-text-neutral-medium)]">{{ evento.ip ?? '—' }}</td>
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

        <!-- Footer count -->
        <div class="mt-siaf-sm px-siaf-sm">
          <span class="text-xs text-[var(--sys-color-text-neutral-low)]">
            Total: {{ filteredEventos().length }} evento{{ filteredEventos().length !== 1 ? 's' : '' }}
          </span>
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

  readonly filteredEventos = computed(() => {
    const modulo = this.filtroModulo();
    const accion = this.filtroAccion();

    return AUDITORIA_MOCK.filter((evento: AuditoriaEventoMock) => {
      const moduloMatch = modulo === 'Todos' || evento.modulo === modulo;
      const accionMatch = accion === 'Todos' || evento.accionLabel === accion;
      return moduloMatch && accionMatch;
    });
  });

  exportar(): void {
    console.log('Exportar auditoría:', this.filteredEventos().length, 'eventos');
  }
}
