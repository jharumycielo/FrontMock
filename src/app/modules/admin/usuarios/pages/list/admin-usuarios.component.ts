import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { BreadcrumbComponent, BreadcrumbItem } from '../../../../../shared/components/breadcrumb/breadcrumb.component';
import { FormTableSearchComponent } from '../../../../../shared/components/form-table-search/form-table-search.component';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { RecordStatus, RecordStatusTagComponent } from '../../../../../shared/ui/record-status-tag/record-status-tag.component';
import {
  EstadoUsuario,
  USUARIOS_MOCK,
  UsuarioMock,
} from '../../config/usuarios.mock';

const ESTADO_TO_RECORD_STATUS: Record<EstadoUsuario, RecordStatus> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
  bloqueado: 'Anulado',
  pendiente_activacion: 'En Proceso',
};

@Component({
  selector: 'siaf-admin-usuarios',
  standalone: true,
  imports: [BreadcrumbComponent, FormTableSearchComponent, IconComponent, PaginationComponent, RecordStatusTagComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="min-w-0">
      <div class="border-b border-[var(--sys-color-divider-default)] bg-surface">
        <siaf-breadcrumb class="block" [items]="breadcrumbs" />
        <div class="flex min-h-[56px] items-center justify-between gap-siaf-md px-siaf-md pb-siaf-md">
          <h1 class="m-0 text-sm font-bold uppercase leading-normal text-[var(--sys-color-text-brand-secondary)]">Gestión de Usuarios</h1>
          <button
            type="button"
            class="inline-flex items-center gap-siaf-xs rounded-siaf-md bg-[var(--sys-color-bg-brand-accent)] px-siaf-md py-siaf-xs text-sm font-medium text-[var(--sys-color-text-brand-white)] transition hover:brightness-90 active:brightness-75"
            (click)="navigateToCreate()"
          >
            <siaf-icon name="person_add" [size]="18" />
            Nuevo usuario
          </button>
        </div>
      </div>

      <section class="min-h-[calc(100vh-112px)] bg-[var(--sys-color-bg-surfaces-surface-lowest)] p-siaf-md">

        <div class="mb-siaf-md">
          <siaf-form-table-search
            placeholder="Buscar por DNI, nombre o email..."
            ariaLabel="Buscar usuarios"
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
            [totalItems]="filteredUsuarios().length"
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
                <th class="siaf-table-th">DNI</th>
                <th class="siaf-table-th">Nombre completo</th>
                <th class="siaf-table-th">Email</th>
                <th class="siaf-table-th">Estado</th>
                <th class="siaf-table-th">Rol principal</th>
                <th class="siaf-table-th">Entidad</th>
                <th class="siaf-table-th siaf-table-sticky-cell w-20 rounded-r-siaf-sm px-siaf-sm">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (usuario of paginatedUsuarios(); track usuario.id; let i = $index) {
                <tr class="siaf-table-row">
                  <td class="siaf-table-td px-siaf-sm text-[var(--sys-color-text-neutral-medium)]">{{ rowNumber(i) }}</td>
                  <td class="siaf-table-td font-mono">{{ usuario.dni }}</td>
                  <td class="siaf-table-td font-medium">{{ usuario.apellidos }}, {{ usuario.nombres }}</td>
                  <td class="siaf-table-td text-[var(--sys-color-text-neutral-medium)]">{{ usuario.email }}</td>
                  <td class="siaf-table-td">
                    <siaf-record-status-tag [status]="getRecordStatus(usuario.estado)" size="small" />
                  </td>
                  <td class="siaf-table-td">{{ rolPrincipal(usuario) }}</td>
                  <td class="siaf-table-td">{{ entidadPrincipal(usuario) }}</td>
                  <td class="siaf-table-td siaf-table-sticky-cell px-siaf-sm py-siaf-xs">
                    <div class="flex items-center gap-1">
                      <button
                        type="button"
                        title="Editar usuario"
                        class="inline-flex size-8 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-dark-pressed)]"
                        (click)="navigateToEdit(usuario)"
                      >
                        <siaf-icon name="person_edit" [size]="18" />
                      </button>
                      <button
                        type="button"
                        [title]="usuario.estado === 'bloqueado' ? 'Activar usuario' : 'Bloquear usuario'"
                        class="inline-flex size-8 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-dark-pressed)]"
                        (click)="toggleBloqueo(usuario)"
                      >
                        <siaf-icon [name]="usuario.estado === 'bloqueado' ? 'lock_open' : 'block'" [size]="18" />
                      </button>
                    </div>
                  </td>
                </tr>
              }
              @empty {
                <tr>
                  <td colspan="8" class="px-siaf-md py-siaf-xl text-center text-sm text-[var(--sys-color-text-neutral-medium)]">
                    No se encontraron usuarios con los criterios de búsqueda.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="mt-siaf-sm px-siaf-sm">
          <siaf-pagination
            navigation="Activate"
            position="Bottom"
            [rowPage]="true"
            [page]="page()"
            [pageSize]="pageSize()"
            [rowsPerPage]="pageSize()"
            [totalItems]="filteredUsuarios().length"
            [totalPages]="totalPages()"
            (previous)="previousPage()"
            (next)="nextPage()"
            (rowsPerPageChange)="setPageSize($event)"
          />
        </div>

      </section>
    </section>
  `,
})
export class AdminUsuariosComponent {
  private readonly router = inject(Router);

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Inicio', href: '/panel' },
    { label: 'Administración' },
    { label: 'Usuarios' },
  ];

  readonly searchTerm = signal('');
  readonly page = signal(1);
  readonly pageSize = signal(10);

  readonly filteredUsuarios = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return USUARIOS_MOCK;
    return USUARIOS_MOCK.filter(
      (u) =>
        u.dni.includes(term) ||
        u.nombres.toLowerCase().includes(term) ||
        u.apellidos.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term),
    );
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredUsuarios().length / this.pageSize())));

  readonly paginatedUsuarios = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.filteredUsuarios().slice(start, start + this.pageSize());
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

  getRecordStatus(estado: EstadoUsuario): RecordStatus {
    return ESTADO_TO_RECORD_STATUS[estado];
  }

  rolPrincipal(usuario: UsuarioMock): string {
    const principal = usuario.perfiles.find((p) => p.esPrincipal);
    return principal?.rol ?? '—';
  }

  entidadPrincipal(usuario: UsuarioMock): string {
    const principal = usuario.perfiles.find((p) => p.esPrincipal);
    return principal?.entidad ?? '—';
  }

  navigateToCreate(): void {
    void this.router.navigate(['/admin/usuarios/nuevo']);
  }

  navigateToEdit(usuario: UsuarioMock): void {
    void this.router.navigate(['/admin/usuarios', usuario.id, 'editar']);
  }

  toggleBloqueo(usuario: UsuarioMock): void {
    console.log('Toggle bloqueo para:', usuario.dni, usuario.estado);
  }
}
