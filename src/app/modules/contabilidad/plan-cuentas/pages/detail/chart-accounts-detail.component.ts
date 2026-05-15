import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { BreadcrumbComponent, BreadcrumbItem } from '../../../../../shared/components/breadcrumb/breadcrumb.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { FlowStatusTagComponent, FlowStatus } from '../../../../../shared/ui/flow-status-tag/flow-status-tag.component';
import { ModalComponent } from '../../../../../shared/ui/modal/modal.component';
import { TextAreaControlComponent } from '../../../../../shared/ui/text-area-control/text-area-control.component';
import { SolicitudesStateService, SolicitudDemo } from '../../../../../core/state/solicitudes-state.service';
import { PermissionService } from '../../../../../core/auth/permission.service';

@Component({
  selector: 'siaf-chart-accounts-detail',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    ButtonComponent,
    FlowStatusTagComponent,
    ModalComponent,
    TextAreaControlComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (solicitud()) {
      <section class="min-w-0">

        <!-- Header -->
        <div class="border-b border-[var(--sys-color-divider-default)] bg-surface">
          <siaf-breadcrumb class="block" [items]="breadcrumbs" />
          <div class="flex min-h-[56px] items-center justify-between gap-siaf-md px-siaf-md pb-siaf-md">
            <div class="flex items-center gap-siaf-md">
              <h1 class="m-0 text-sm font-bold uppercase text-[var(--sys-color-text-brand-secondary)]">
                {{ solicitud()!.tipoDocumento }}
              </h1>
              <siaf-flow-status-tag [status]="flowStatus()" size="standard" />
            </div>
            <span class="text-sm font-mono font-medium text-[var(--sys-color-text-brand-secondary)]">
              {{ solicitud()!.numero }}
            </span>
          </div>
        </div>

        <!-- Content -->
        <section class="min-h-[calc(100vh-112px)] bg-[var(--sys-color-bg-surfaces-surface-lowest)] p-siaf-md flex flex-col gap-siaf-md">

          <!-- Info general -->
          <div class="rounded-siaf-md bg-surface p-siaf-xl">
            <h2 class="m-0 mb-siaf-md text-sm font-bold uppercase text-text">Información General</h2>
            <div class="grid grid-cols-2 gap-siaf-md sm:grid-cols-3">
              <div>
                <p class="text-xs text-[var(--sys-color-text-secondary)]">Tipo de operación</p>
                <p class="text-sm font-medium">{{ solicitud()!.tipoAccion }}</p>
              </div>
              <div>
                <p class="text-xs text-[var(--sys-color-text-secondary)]">Fecha de registro</p>
                <p class="text-sm font-medium">{{ solicitud()!.fecha }}</p>
              </div>
              <div>
                <p class="text-xs text-[var(--sys-color-text-secondary)]">Entidad creadora</p>
                <p class="text-sm font-medium">{{ solicitud()!.entidad }}</p>
              </div>
              <div>
                <p class="text-xs text-[var(--sys-color-text-secondary)]">Área solicitante</p>
                <p class="text-sm font-medium">{{ solicitud()!.unidad }}</p>
              </div>
              <div>
                <p class="text-xs text-[var(--sys-color-text-secondary)]">Creador</p>
                <p class="text-sm font-medium">{{ solicitud()!.creador }}</p>
              </div>
              <div>
                <p class="text-xs text-[var(--sys-color-text-secondary)]">Plan contable</p>
                <p class="text-sm font-medium">{{ solicitud()!.plan }}</p>
              </div>
            </div>
            <div class="mt-siaf-md">
              <p class="text-xs text-[var(--sys-color-text-secondary)]">Justificación</p>
              <p class="text-sm">{{ solicitud()!.justificacion || '—' }}</p>
            </div>
          </div>

          <!-- Cuentas propuestas -->
          <div class="rounded-siaf-md bg-surface p-siaf-xl">
            <h2 class="m-0 mb-siaf-md text-sm font-bold uppercase text-text">
              Cuentas Contables Propuestas ({{ solicitud()!.cuentas.length }})
            </h2>
            <div class="overflow-x-auto">
              <table class="w-full border-collapse text-left text-sm min-w-[800px]">
                <thead>
                  <tr class="bg-surface-high text-[10px] font-bold uppercase text-text">
                    <th class="px-siaf-md py-siaf-sm">Código</th>
                    <th class="px-siaf-md py-siaf-sm">Nombre</th>
                    <th class="px-siaf-md py-siaf-sm">Elemento</th>
                    <th class="px-siaf-md py-siaf-sm">Imputable</th>
                    <th class="px-siaf-md py-siaf-sm">Ámbitos</th>
                  </tr>
                </thead>
                <tbody>
                  @for (cuenta of solicitud()!.cuentas; track cuenta.recordId) {
                    <tr class="border-b border-[var(--sys-color-divider-default)] bg-surface hover:bg-[var(--sys-color-bg-states-light-hover)]">
                      <td class="px-siaf-md py-siaf-sm font-mono font-medium">
                        {{ cuenta.element }}{{ cuenta.group ? '.' + cuenta.group : '' }}{{ cuenta.account ? '.' + cuenta.account : '' }}
                      </td>
                      <td class="px-siaf-md py-siaf-sm">{{ cuenta.accountName }}</td>
                      <td class="px-siaf-md py-siaf-sm">{{ cuenta.element }}</td>
                      <td class="px-siaf-md py-siaf-sm">{{ cuenta.imputable }}</td>
                      <td class="px-siaf-md py-siaf-sm text-[var(--sys-color-text-secondary)]">{{ cuenta.institutionalScopes || '—' }}</td>
                    </tr>
                  }
                  @empty {
                    <tr>
                      <td colspan="5" class="px-siaf-md py-siaf-xl text-center text-sm text-[var(--sys-color-text-secondary)]">
                        Sin cuentas propuestas
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- Historial -->
          <div class="rounded-siaf-md bg-surface p-siaf-xl">
            <h2 class="m-0 mb-siaf-md text-sm font-bold uppercase text-text">Trazabilidad</h2>
            <div class="flex flex-col gap-siaf-sm">
              @for (h of solicitud()!.historial; track h.fecha) {
                <div class="flex items-start gap-siaf-md rounded-siaf-md border border-[var(--sys-color-divider-default)] p-siaf-md">
                  <siaf-flow-status-tag [status]="h.estado" size="small" />
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium">{{ h.usuario }}</p>
                    <p class="text-xs text-[var(--sys-color-text-secondary)]">{{ h.perfil }} — {{ h.fecha }}</p>
                    @if (h.comentario) {
                      <p class="mt-1 text-sm italic text-[var(--sys-color-text-secondary)]">"{{ h.comentario }}"</p>
                    }
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Acciones del APROBADOR -->
          @if (esAprobador() && (solicitud()!.estado === 'Verificado' || solicitud()!.estado === 'Observado')) {
            <div class="rounded-siaf-md bg-surface p-siaf-xl">
              <h2 class="m-0 mb-siaf-md text-sm font-bold uppercase text-text">Acciones</h2>
              <div class="flex flex-wrap items-center gap-siaf-md">
                <siaf-button variant="primary" icon="check_circle" (click)="abrirModalAprobar()">
                  Aprobar
                </siaf-button>
                <siaf-button variant="secondary" icon="visibility_off" (click)="abrirModalObservar()">
                  Observar
                </siaf-button>
                <siaf-button variant="danger" icon="cancel" (click)="abrirModalRechazar()">
                  Rechazar
                </siaf-button>
              </div>
            </div>
          }

        </section>
      </section>

      <!-- Modal Aprobar -->
      @if (modalAprobarOpen()) {
        <siaf-modal
          variant="approve"
          (confirmed)="onAprobar()"
          (canceled)="modalAprobarOpen.set(false)"
        />
      }

      <!-- Modal Observar -->
      @if (modalObservarOpen()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-siaf-md">
          <div class="w-full max-w-md rounded-siaf-md bg-surface p-siaf-xl shadow-xl">
            <h2 class="mb-siaf-md text-base font-bold">Observar solicitud</h2>
            <p class="mb-siaf-md text-sm text-[var(--sys-color-text-secondary)]">
              Ingrese el motivo de la observación (obligatorio):
            </p>
            <text-area-control
              labelText="Comentario"
              [required]="true"
              [value]="comentario()"
              (valueChange)="comentario.set($any($event))"
            />
            <div class="mt-siaf-md flex justify-end gap-siaf-md">
              <siaf-button variant="secondary" (click)="modalObservarOpen.set(false)">Cancelar</siaf-button>
              <siaf-button variant="primary" [disabled]="!comentario().trim()" (click)="onObservar()">
                Confirmar observación
              </siaf-button>
            </div>
          </div>
        </div>
      }

      <!-- Modal Rechazar -->
      @if (modalRechazarOpen()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-siaf-md">
          <div class="w-full max-w-md rounded-siaf-md bg-surface p-siaf-xl shadow-xl">
            <h2 class="mb-siaf-md text-base font-bold">Rechazar solicitud</h2>
            <p class="mb-siaf-md text-sm text-[var(--sys-color-text-secondary)]">
              Ingrese el motivo del rechazo (obligatorio):
            </p>
            <text-area-control
              labelText="Comentario"
              [required]="true"
              [value]="comentario()"
              (valueChange)="comentario.set($any($event))"
            />
            <div class="mt-siaf-md flex justify-end gap-siaf-md">
              <siaf-button variant="secondary" (click)="modalRechazarOpen.set(false)">Cancelar</siaf-button>
              <siaf-button variant="danger" [disabled]="!comentario().trim()" (click)="onRechazar()">
                Confirmar rechazo
              </siaf-button>
            </div>
          </div>
        </div>
      }

    } @else {
      <div class="flex min-h-screen items-center justify-center">
        <p class="text-sm text-[var(--sys-color-text-secondary)]">Solicitud no encontrada.</p>
      </div>
    }
  `
})
export class ChartAccountsDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly solicitudesState = inject(SolicitudesStateService);
  private readonly permissionService = inject(PermissionService);

  readonly modalAprobarOpen = signal(false);
  readonly modalObservarOpen = signal(false);
  readonly modalRechazarOpen = signal(false);
  readonly comentario = signal('');

  readonly solicitud = computed<SolicitudDemo | undefined>(() => {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    return this.solicitudesState.obtenerPorId(id);
  });

  readonly esAprobador = computed(() =>
    this.permissionService.currentRole() === 'approver'
  );

  readonly flowStatus = computed((): FlowStatus => {
    const estado = this.solicitud()?.estado ?? 'Elaborado';
    return estado as FlowStatus;
  });

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Inicio', href: '/panel' },
    { label: 'Plan de Cuentas Contables', href: '/procesos/plan-cuentas-contables' },
    { label: 'Detalle de solicitud' },
  ];

  abrirModalAprobar(): void {
    this.modalAprobarOpen.set(true);
  }

  abrirModalObservar(): void {
    this.comentario.set('');
    this.modalObservarOpen.set(true);
  }

  abrirModalRechazar(): void {
    this.comentario.set('');
    this.modalRechazarOpen.set(true);
  }

  onAprobar(): void {
    const id = this.solicitud()?.id;
    if (!id) return;
    this.solicitudesState.aprobar(id);
    this.modalAprobarOpen.set(false);
    void this.router.navigate(['/procesos/plan-cuentas-contables']);
  }

  onObservar(): void {
    const id = this.solicitud()?.id;
    if (!id || !this.comentario().trim()) return;
    this.solicitudesState.observar(id, this.comentario());
    this.modalObservarOpen.set(false);
    void this.router.navigate(['/procesos/plan-cuentas-contables']);
  }

  onRechazar(): void {
    const id = this.solicitud()?.id;
    if (!id || !this.comentario().trim()) return;
    this.solicitudesState.rechazar(id, this.comentario());
    this.modalRechazarOpen.set(false);
    void this.router.navigate(['/procesos/plan-cuentas-contables']);
  }
}
