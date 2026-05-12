import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { BreadcrumbComponent, BreadcrumbItem } from '../../../../../shared/components/breadcrumb/breadcrumb.component';
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
  imports: [BreadcrumbComponent, IconComponent, RecordStatusTagComponent],
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

        <!-- Search bar -->
        <div class="mb-siaf-md flex items-center gap-siaf-md rounded-siaf-md bg-surface px-siaf-md py-siaf-sm">
          <siaf-icon name="search" [size]="20" />
          <input
            type="text"
            placeholder="Buscar por DNI, nombre o email..."
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
                <th class="px-siaf-md py-siaf-sm">DNI</th>
                <th class="px-siaf-md py-siaf-sm">Nombre completo</th>
                <th class="px-siaf-md py-siaf-sm">Email</th>
                <th class="px-siaf-md py-siaf-sm">Estado</th>
                <th class="px-siaf-md py-siaf-sm">Rol principal</th>
                <th class="px-siaf-md py-siaf-sm">Entidad</th>
                <th class="sticky right-0 w-20 rounded-r-siaf-sm border-l border-[var(--sys-color-divider-strong)] bg-surface-high px-siaf-sm py-siaf-sm">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (usuario of filteredUsuarios(); track usuario.id; let i = $index) {
                <tr class="border-b border-[var(--sys-color-divider-default)] bg-surface hover:bg-[var(--sys-color-bg-states-light-hover)]">
                  <td class="h-[58px] px-siaf-sm py-siaf-xs text-[var(--sys-color-text-neutral-medium)]">{{ i + 1 }}</td>
                  <td class="px-siaf-md py-siaf-sm font-mono">{{ usuario.dni }}</td>
                  <td class="px-siaf-md py-siaf-sm font-medium">{{ usuario.apellidos }}, {{ usuario.nombres }}</td>
                  <td class="px-siaf-md py-siaf-sm text-[var(--sys-color-text-neutral-medium)]">{{ usuario.email }}</td>
                  <td class="px-siaf-md py-siaf-sm">
                    <siaf-record-status-tag [status]="getRecordStatus(usuario.estado)" size="small" />
                  </td>
                  <td class="px-siaf-md py-siaf-sm">{{ rolPrincipal(usuario) }}</td>
                  <td class="px-siaf-md py-siaf-sm">{{ entidadPrincipal(usuario) }}</td>
                  <td class="sticky right-0 border-l border-[var(--sys-color-divider-strong)] bg-surface px-siaf-sm py-siaf-xs">
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

        <!-- Footer count -->
        <div class="mt-siaf-sm px-siaf-sm">
          <span class="text-xs text-[var(--sys-color-text-neutral-low)]">
            Total: {{ filteredUsuarios().length }} usuario{{ filteredUsuarios().length !== 1 ? 's' : '' }}
          </span>
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
