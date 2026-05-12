import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { BreadcrumbComponent, BreadcrumbItem } from '../../../../../shared/components/breadcrumb/breadcrumb.component';
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
  imports: [BreadcrumbComponent, IconComponent, RecordStatusTagComponent],
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

        <!-- Search bar -->
        <div class="mb-siaf-md flex items-center gap-siaf-md rounded-siaf-md bg-surface px-siaf-md py-siaf-sm">
          <siaf-icon name="search" [size]="20" />
          <input
            type="text"
            placeholder="Buscar por código o nombre..."
            class="flex-1 border-none bg-transparent text-sm outline-none placeholder:text-[var(--sys-color-text-neutral-low)]"
            [value]="searchTerm()"
            (input)="searchTerm.set($any($event.target).value)"
          />
        </div>

        <!-- Table -->
        <div class="overflow-x-auto rounded-siaf-md bg-surface">
          <table class="w-full border-collapse text-left text-sm min-w-[900px]">
            <thead>
              <tr class="bg-surface-high text-[10px] font-bold uppercase text-text">
                <th class="w-10 rounded-l-siaf-sm px-siaf-sm py-siaf-sm">#</th>
                <th class="px-siaf-md py-siaf-sm">Código</th>
                <th class="px-siaf-md py-siaf-sm">Nombre</th>
                <th class="px-siaf-md py-siaf-sm">Tipo</th>
                <th class="px-siaf-md py-siaf-sm">Estado</th>
                <th class="px-siaf-md py-siaf-sm w-20 text-center">Unidades</th>
                <th class="px-siaf-md py-siaf-sm w-20 text-center">Usuarios</th>
                <th class="sticky right-0 w-20 rounded-r-siaf-sm border-l border-[var(--sys-color-divider-strong)] bg-surface-high px-siaf-sm py-siaf-sm">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (entidad of filteredEntidades(); track entidad.id; let i = $index) {
                <tr class="border-b border-[var(--sys-color-divider-default)] bg-surface hover:bg-[var(--sys-color-bg-states-light-hover)]">
                  <td class="h-[58px] px-siaf-sm py-siaf-xs text-[var(--sys-color-text-neutral-medium)]">{{ i + 1 }}</td>
                  <td class="px-siaf-md py-siaf-sm font-mono font-medium">{{ entidad.codigo }}</td>
                  <td class="px-siaf-md py-siaf-sm">{{ entidad.nombre }}</td>
                  <td class="px-siaf-md py-siaf-sm text-[var(--sys-color-text-neutral-medium)]">{{ tipoLabel(entidad.tipoEntidad) }}</td>
                  <td class="px-siaf-md py-siaf-sm">
                    <siaf-record-status-tag [status]="getRecordStatus(entidad.estadoEntidad)" size="small" />
                  </td>
                  <td class="px-siaf-md py-siaf-sm text-center">{{ entidad.totalUnidades }}</td>
                  <td class="px-siaf-md py-siaf-sm text-center">{{ entidad.totalUsuarios }}</td>
                  <td class="sticky right-0 border-l border-[var(--sys-color-divider-strong)] bg-surface px-siaf-sm py-siaf-xs">
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

        <!-- Footer count -->
        <div class="mt-siaf-sm px-siaf-sm">
          <span class="text-xs text-[var(--sys-color-text-neutral-low)]">
            Total: {{ filteredEntidades().length }} entidad{{ filteredEntidades().length !== 1 ? 'es' : '' }}
          </span>
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
