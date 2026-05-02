import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { BreadcrumbItem } from '../../shared/components/breadcrumb/breadcrumb.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { ModalComponent } from '../../shared/ui/modal/modal.component';
import { DateTimePickerComponent } from '../../shared/ui/date-time-picker/date-time-picker.component';
import { EmptySectionComponent } from '../../shared/ui/empty-section/empty-section.component';
import { FlowStatus, FlowStatusTagComponent } from '../../shared/ui/flow-status-tag/flow-status-tag.component';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { MessageBoxComponent } from '../../shared/ui/message-box/message-box.component';
import { findProcessPathById } from '../../shared/ui/process-menu-tree/process-menu-tree.component';
import { SolicitudeHeaderState } from '../../shared/ui/solicitude-header/solicitude-header.component';
import { SolicitudePageLayoutComponent } from '../../shared/ui/solicitude-page-layout/solicitude-page-layout.component';
import { SnackbarComponent, SnackbarVariant } from '../../shared/ui/snackbar/snackbar.component';
import { PaginationComponent } from '../../shared/ui/pagination/pagination.component';
import { ReadonlyFieldComponent } from '../../shared/ui/readonly-field/readonly-field.component';
import { TextAreaControlComponent } from '../../shared/ui/text-area-control/text-area-control.component';
import { UploadedFileCardComponent } from '../../shared/ui/uploaded-file-card/uploaded-file-card.component';
import { UploadSidePanelComponent } from '../../shared/ui/upload-side-panel/upload-side-panel.component';

type ReadonlyField = {
  label: string;
  value: string;
};

const ADJUSTMENT_SEAT_PROCESS_ID = 'registro-asiento-ajuste';
const ADJUSTMENT_SEAT_PROCESS_ROUTE = '/procesos/registro-asiento-ajuste';

const getAdjustmentSeatPathHref = (nodeId: string): string => {
  if (nodeId === ADJUSTMENT_SEAT_PROCESS_ID) {
    return ADJUSTMENT_SEAT_PROCESS_ROUTE;
  }

  return '/panel';
};

const buildAdjustmentSeatBreadcrumbs = (currentLabel: string): BreadcrumbItem[] => [
  ...findProcessPathById(ADJUSTMENT_SEAT_PROCESS_ID).map((node) => ({ label: node.label, href: getAdjustmentSeatPathHref(node.id) })),
  { label: currentLabel }
];

type PeriodoRow = {
  periodo: string;
  vigencia: string;
  fechaInicio: string;
  fechaFin: string;
  fechaVigenciaAdicional: string;
  usuarioResponsable: string;
  estado: string;
};

type ClaseAjusteRow = {
  codigo: string;
  descripcion: string;
};

type DetalleAjusteRow = {
  codigo: string;
  descripcion: string;
};

type CuentaContable = {
  codigo: string;
  nombre: string;
  tipoMovimiento: 'Debe' | 'Haber';
  importe: number;
};

type PeriodoGroup = {
  anio: string;
  vigencia: string;
  fechaInicio: string;
  fechaFin: string;
  fechaVigenciaAdicional: string;
  usuarioResponsable: string;
  estado: string;
  expanded: boolean;
  subPeriodos: PeriodoRow[];
};

@Component({
  selector: 'siaf-adjustment-seat-request',
  standalone: true,
  imports: [
    ButtonComponent,
    DateTimePickerComponent,
    EmptySectionComponent,
    FlowStatusTagComponent,
    IconComponent,
    MessageBoxComponent,
    ModalComponent,
    PaginationComponent,
    SolicitudePageLayoutComponent,
    SnackbarComponent,
    UploadedFileCardComponent,
    UploadSidePanelComponent,
    ReadonlyFieldComponent,
    TextAreaControlComponent
  ],
  template: `
    <div class="min-h-[calc(100vh-56px)] bg-[var(--sys-color-bg-surfaces-surface-lowest)] text-text">
      <siaf-solicitude-page-layout
        [breadcrumbs]="breadcrumbs"
        role="creator"
        [state]="solicitudeHeaderState"
        heading="Solicitud de registro de asiento de ajuste"
        secondaryText="Creación"
        [showReturn]="true"
        [saveDisabled]="!isFormValid"
        [verifyDisabled]="!isReadOnly"
        (returned)="goToDocuments()"
        (canceled)="goToDocuments()"
        (saved)="openSaveModal()"
        (edited)="enableEditing()"
        (verified)="openVerifyModal()"
        (deleted)="openDeleteModal()"
      >
          @if (isElaborated) {
            <section class="grid gap-siaf-md xl:grid-cols-[1fr_360px]">
              <article class="rounded-siaf-md bg-surface px-siaf-lg py-siaf-md">
                <div class="grid gap-siaf-xs">
                  @for (field of entityFields; track field.label) {
                    <div class="grid min-h-6 gap-siaf-xs md:grid-cols-[140px_1fr]">
                      <span class="truncate text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">{{ field.label }}</span>
                      <strong class="min-w-0 text-sm font-bold leading-6 text-text">{{ field.value }}</strong>
                    </div>
                  }
                </div>
              </article>

              <article class="rounded-siaf-md bg-surface px-siaf-lg py-siaf-md">
                <div class="grid gap-siaf-xs">
                  <div class="grid min-h-6 gap-siaf-xs sm:grid-cols-[140px_1fr]">
                    <span class="truncate text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">N° documento</span>
                    <strong class="min-w-0 text-sm font-bold leading-6 text-text">{{ generatedDocumentNumber }}</strong>
                  </div>
                  <div class="grid min-h-6 gap-siaf-xs sm:grid-cols-[140px_1fr]">
                    <span class="truncate text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">Estado</span>
                    <siaf-flow-status-tag [status]="documentStatus" size="standard" />
                  </div>
                </div>
              </article>
            </section>
          } @else {
            <section class="rounded-siaf-md bg-surface px-siaf-lg py-siaf-md">
              <div class="grid gap-siaf-xs">
                @for (field of entityFields; track field.label) {
                  <div class="grid min-h-6 gap-siaf-xs md:grid-cols-[140px_1fr]">
                    <span class="truncate text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">{{ field.label }}</span>
                    <strong class="min-w-0 text-sm font-bold leading-6 text-text">{{ field.value }}</strong>
                  </div>
                }
              </div>
            </section>
          }

          <section class="rounded-siaf-md bg-surface">
            <header class="flex min-h-14 items-center px-siaf-lg pt-siaf-md">
              <h2 class="m-0 text-base font-bold uppercase tracking-[0.02px] text-text">Registro de asiento de ajuste</h2>
            </header>

            <div class="flex flex-col gap-siaf-lg px-siaf-lg py-siaf-md">
              <section class="grid gap-siaf-lg">
                <h3 class="m-0 text-sm font-bold uppercase text-text">Ambito institucional</h3>
                <article class="relative rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface px-siaf-xl py-siaf-xs">
                  <span class="absolute left-[-1px] top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-siaf-sm bg-brand-primary"></span>
                  <div class="flex min-h-11 flex-col justify-center gap-siaf-xxs">
                    <span class="text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">Ambito institucional</span>
                    <strong class="text-sm font-bold">ID - Nombre del ambito</strong>
                  </div>
                </article>
              </section>

              <!-- Periodo -->
              @if (selectedPeriodo()) {
                <section class="grid gap-siaf-md">
                  <div class="flex min-h-10 items-center justify-between gap-siaf-md">
                    <h3 class="m-0 text-sm font-bold uppercase text-text">Periodo</h3>
                    @if (!isReadOnly) {
                      <siaf-button variant="accent" size="md" icon="search" ariaLabel="Cambiar periodo" [iconOnly]="true" (click)="openPeriodoPanel()" />
                    }
                  </div>
                  <article class="relative rounded-siaf-md border border-border px-siaf-xl py-siaf-xs">
                    <span class="absolute left-[-1px] top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-siaf-sm bg-brand-primary"></span>
                    <div class="flex items-center gap-siaf-md">
                      <div class="grid min-h-11 flex-1 gap-siaf-md sm:grid-cols-2 lg:grid-cols-4">
                        <div class="flex flex-col justify-center gap-siaf-xxs">
                          <span class="truncate text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">Periodo</span>
                          <strong class="text-sm font-bold">{{ selectedPeriodo()!.periodo }}</strong>
                        </div>
                        <div class="flex flex-col justify-center gap-siaf-xxs">
                          <span class="truncate text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">Fecha de inicio</span>
                          <strong class="text-sm font-bold">{{ selectedPeriodo()!.fechaInicio }}</strong>
                        </div>
                        <div class="flex flex-col justify-center gap-siaf-xxs">
                          <span class="truncate text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">Fecha fin</span>
                          <strong class="text-sm font-bold">{{ selectedPeriodo()!.fechaFin }}</strong>
                        </div>
                        <div class="flex flex-col justify-center gap-siaf-xxs">
                          <span class="truncate text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">Fecha vigencia adicional</span>
                          <strong class="text-sm font-bold">{{ selectedPeriodo()!.fechaVigenciaAdicional }}</strong>
                        </div>
                      </div>
                      @if (!isReadOnly) {
                        <button
                          class="inline-flex size-8 shrink-0 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[rgba(32,32,32,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                          type="button"
                          aria-label="Quitar periodo seleccionado"
                          (click)="selectedPeriodo.set(null)"
                        >
                          <siaf-icon name="close" [size]="20" />
                        </button>
                      }
                    </div>
                  </article>
                </section>
              } @else {
                <empty-section title="Periodo" actionIcon="search" (actionClicked)="openPeriodoPanel()" />
              }
              <section class="grid gap-siaf-md">
                <h3 class="m-0 text-sm font-bold uppercase text-text">Fecha de contabilización</h3>
                @if (isReadOnly) {
                  <readonly-field caption="Fecha *" [value]="fechaContabilizacionDisplay" />
                } @else {
                  <siaf-date-time-picker placeholder="Fecha*" variant="date" [value]="fechaContabilizacion()" (valueChange)="fechaContabilizacion.set($event)" />
                }
              </section>
              <!-- Código de clase de ajuste -->
              @if (selectedClaseAjuste()) {
                <section class="grid gap-siaf-md">
                  <div class="flex min-h-10 items-center justify-between gap-siaf-md">
                    <h3 class="m-0 text-sm font-bold uppercase text-text">Código de clase de ajuste</h3>
                    @if (!isReadOnly) {
                      <siaf-button variant="accent" size="md" icon="search" ariaLabel="Cambiar código de clase de ajuste" [iconOnly]="true" (click)="openClaseAjustePanel()" />
                    }
                  </div>
                  <article class="relative rounded-siaf-md border border-border px-siaf-xl py-siaf-xs">
                    <span class="absolute left-[-1px] top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-siaf-sm bg-brand-primary"></span>
                    <div class="flex items-center gap-siaf-md">
                      <div class="flex min-h-11 flex-1 flex-col justify-center gap-siaf-xxs">
                        <span class="truncate text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">Código de clase de ajuste</span>
                        <strong class="text-sm font-bold">{{ selectedClaseAjuste()!.descripcion }}</strong>
                      </div>
                      @if (!isReadOnly) {
                        <button
                          class="inline-flex size-8 shrink-0 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[rgba(32,32,32,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                          type="button"
                          aria-label="Quitar código de clase de ajuste"
                          (click)="selectedClaseAjuste.set(null)"
                        >
                          <siaf-icon name="close" [size]="20" />
                        </button>
                      }
                    </div>
                  </article>
                </section>
              } @else {
                <empty-section title="Buscar codigo de clase de ajuste" actionIcon="search" (actionClicked)="openClaseAjustePanel()" />
              }
              <!-- Código de detalle de ajuste — botón siempre visible, habilitado solo cuando hay clase seleccionada -->
              <section class="grid gap-siaf-md">
                <div class="flex min-h-10 items-center justify-between gap-siaf-md">
                  <h3 class="m-0 text-sm font-bold uppercase text-text">Buscar codigo de detalle de ajuste</h3>
                  @if (!isReadOnly) {
                    <siaf-button
                      variant="accent"
                      size="md"
                      icon="search"
                      ariaLabel="Buscar codigo de detalle de ajuste"
                      [iconOnly]="true"
                      [disabled]="!selectedClaseAjuste()"
                      (click)="openDetalleAjustePanel()"
                    />
                  }
                </div>

                @if (selectedDetalleAjuste()) {
                  <article class="relative rounded-siaf-md border border-border px-siaf-xl py-siaf-xs">
                    <span class="absolute left-[-1px] top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-siaf-sm bg-brand-primary"></span>
                    <div class="flex items-center gap-siaf-md">
                      <div class="flex min-h-11 flex-1 flex-col justify-center gap-siaf-xxs">
                        <span class="truncate text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">Código de detalle de ajuste</span>
                        <strong class="text-sm font-bold">{{ selectedDetalleAjuste()!.descripcion }}</strong>
                      </div>
                      @if (!isReadOnly) {
                        <button
                          class="inline-flex size-8 shrink-0 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[rgba(32,32,32,0.12)]"
                          type="button"
                          aria-label="Quitar código de detalle de ajuste"
                          (click)="selectedDetalleAjuste.set(null)"
                        >
                          <siaf-icon name="close" [size]="20" />
                        </button>
                      }
                    </div>
                  </article>
                } @else {
                  <div class="flex min-h-[49px] items-center rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-low)] px-siaf-md py-siaf-sm">
                    <p class="m-0 text-sm leading-normal tracking-[0.0249px] text-[var(--sys-color-text-neutral-medium)]">No se ha seleccionado ningún tipo. Haga clic en el botón para realizar una selección.</p>
                  </div>
                }
              </section>
              @if (isReadOnly) {
                <section class="grid gap-siaf-md">
                  <h3 class="m-0 text-sm font-bold uppercase text-text">Glosa</h3>
                  <readonly-field caption="Glosa *" [value]="glosa()" />
                </section>
              } @else {
                <text-area-control title="Glosa" placeholder="Glosa*" [value]="glosa()" (valueChange)="glosa.set($event)" />
              }

              <details class="group overflow-hidden rounded-siaf-sm border border-[var(--sys-color-divider-strong)] bg-surface" open>
                <summary class="flex min-h-14 w-full cursor-pointer list-none items-center gap-siaf-xs px-siaf-md py-siaf-xs text-left">
                  <span class="inline-flex size-10 shrink-0 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted">
                    <siaf-icon class="transition group-open:rotate-180" name="expand_more" [size]="24" />
                  </span>
                  <span class="flex min-h-10 min-w-0 flex-1 items-center text-sm font-medium uppercase text-text">
                    Codigo de asiento: {{ selectedDetalleAjuste() ? 'AA0015' : '--' }}
                  </span>
                </summary>

                <div class="flex flex-col gap-siaf-md border-t border-[var(--sys-color-divider-strong)] p-siaf-lg">
                  <h3 class="m-0 min-h-10 text-sm font-bold uppercase leading-10 text-text">Cuentas contables</h3>

                  @if (!selectedDetalleAjuste()) {
                    <message-box text="No se ha seleccionado ningún tipo. Haga clic en el botón para realizar una selección." />
                  } @else {
                    <div class="flex flex-col gap-siaf-md">

                      <!-- Búsqueda + acciones -->
                      <div class="flex items-center gap-siaf-xs">
                        <label class="flex h-10 min-w-0 flex-1 items-center rounded-siaf-md border border-[rgba(32,32,32,0.4)] bg-surface px-siaf-md">
                          <span class="sr-only">Buscar</span>
                          <input class="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-text-muted disabled:text-text-muted" placeholder="Buscar"
                            [disabled]="isReadOnly"
                            [value]="cuentasSearch" (input)="cuentasSearch = inputVal($event)" />
                        </label>
                        <button class="inline-flex size-10 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:text-text-muted" type="button" aria-label="Filtrar" [disabled]="isReadOnly">
                          <siaf-icon name="filter_list" [size]="24" />
                        </button>
                        <button class="inline-flex size-10 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:text-text-muted" type="button" aria-label="Más opciones" [disabled]="isReadOnly">
                          <siaf-icon name="more_vert" [size]="24" />
                        </button>
                      </div>

                      <!-- Paginación top -->
                      <siaf-pagination navigation="Activate" position="Top"
                        [page]="cuentasPage" [pageSize]="cuentasRowsPerPage"
                        [totalItems]="cuentasTotalItems" [totalPages]="cuentasTotalPages" />

                      <!-- Tabla -->
                      <div class="min-w-0 overflow-x-auto">
                        <table class="w-full min-w-[700px] border-collapse text-left text-sm">
                          <thead>
                            <tr class="bg-[var(--sys-color-bg-surfaces-surface-high,rgba(32,32,32,0.12))]">
                              <th class="h-10 w-[190px] px-siaf-md py-siaf-sm text-xs font-bold uppercase leading-none text-text">Cod. Cuentas Contables</th>
                              <th class="h-10 px-siaf-md py-siaf-sm text-xs font-bold uppercase leading-none text-text">Nombre de la cuenta contable</th>
                              <th class="h-10 px-siaf-md py-siaf-sm text-xs font-bold uppercase leading-none text-text">Tipo de movimiento</th>
                              <th class="h-10 w-[135px] px-siaf-md py-siaf-sm text-right text-xs font-bold uppercase leading-none text-text">Importe</th>
                            </tr>
                          </thead>
                          <tbody>
                            @for (cuenta of cuentasContables; track cuenta.codigo; let i = $index) {
                              <tr class="border-b border-[var(--sys-color-divider-default,rgba(32,32,32,0.12))]">
                                <td class="min-h-12 px-siaf-md py-siaf-sm text-sm text-text">{{ cuenta.codigo }}</td>
                                <td class="min-h-12 px-siaf-md py-siaf-sm text-sm text-text">{{ cuenta.nombre }}</td>
                                <td class="min-h-12 px-siaf-sm py-siaf-sm text-sm text-text">{{ cuenta.tipoMovimiento }}</td>
                                <td class="min-h-12 px-siaf-xs py-siaf-sm text-right">
                                  @if (isReadOnly) {
                                    <span class="text-sm text-text">{{ formatImporte(cuenta.importe) }}</span>
                                  } @else {
                                    <!-- Input importe con floating label y decimales -->
                                    <div class="relative w-full">
                                      <label class="absolute left-3 top-[-9px] z-[1] flex items-center gap-px bg-surface px-siaf-xxs">
                                        <span class="text-xs font-medium leading-none text-text-muted">Importe</span>
                                        <span class="text-xs font-bold leading-none text-[var(--sys-color-text-feedback-danger)] opacity-80">*</span>
                                      </label>
                                      <input
                                        class="h-8 w-full rounded-siaf-md border border-[rgba(32,32,32,0.4)] bg-surface px-siaf-md text-right text-sm text-text outline-none transition focus:border-2 focus:border-[rgba(1,72,153,0.8)]"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        [value]="cuenta.importe || ''"
                                        placeholder="0,0"
                                        (input)="onCuentasImporteChange(i, $event)"
                                      />
                                    </div>
                                  }
                                </td>
                              </tr>
                            }

                            <!-- Total Debe -->
                            <tr class="border-b border-[var(--sys-color-divider-default,rgba(32,32,32,0.12))]">
                              <td colspan="3" class="min-h-12 px-siaf-md py-siaf-sm text-right text-sm text-text">Total Debe</td>
                              <td class="min-h-12 px-siaf-md py-siaf-sm text-right text-sm text-text">{{ formatImporte(totalDebe) }}</td>
                            </tr>

                            <!-- Total Haber -->
                            <tr class="border-b border-[var(--sys-color-divider-default,rgba(32,32,32,0.12))]">
                              <td colspan="3" class="min-h-12 px-siaf-md py-siaf-sm text-right text-sm text-text">Total Haber</td>
                              <td class="min-h-12 px-siaf-md py-siaf-sm text-right text-sm text-text">{{ formatImporte(totalHaber) }}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <!-- Paginación bottom -->
                      <siaf-pagination navigation="Activate" position="Bottom" [rowPage]="true"
                        [page]="cuentasPage" [pageSize]="cuentasRowsPerPage"
                        [totalItems]="cuentasTotalItems" [totalPages]="cuentasTotalPages"
                        [rowsPerPage]="cuentasRowsPerPage" [rowsPerPageOptions]="cuentasRowsPerPageOptions" />
                    </div>
                  }
                </div>
              </details>
            </div>
          </section>

          <section class="rounded-siaf-md bg-surface">
            <header class="flex min-h-14 items-center px-siaf-lg pt-siaf-md">
              <h2 class="m-0 text-base font-bold uppercase tracking-[0.02px] text-text">Justificación del sustento</h2>
            </header>

            <div class="flex flex-col gap-siaf-lg px-siaf-lg py-siaf-md">
              @if (isReadOnly) {
                <readonly-field caption="Justificación del requerimiento solicitado *" [value]="justificacion()" />
              } @else {
                <text-area-control title="" placeholder="Justificación del requerimiento solicitado*" [value]="justificacion()" (valueChange)="justificacion.set($event)" />
              }

              <div class="flex flex-col gap-siaf-xs">
                <div class="flex min-h-10 items-center justify-between gap-siaf-md">
                  <h3 class="m-0 text-sm font-bold uppercase text-text">Documento de sustento</h3>
                  @if (!isReadOnly) {
                    <button
                      class="inline-flex size-10 items-center justify-center rounded-siaf-md bg-[var(--sys-color-bg-brand-accent)] text-white transition hover:brightness-90"
                      type="button"
                      aria-label="Subir documento"
                      (click)="uploadPanelOpen.set(true)"
                    >
                      <siaf-icon name="file_upload" [size]="24" />
                    </button>
                  }
                </div>

                @if (uploadedFile()) {
                  <siaf-uploaded-file-card [file]="uploadedFile()" [readonly]="isReadOnly" (replace)="uploadPanelOpen.set(true)" (removed)="uploadedFile.set(null)" />
                } @else {
                  <message-box text="No se han adjuntado archivos. Por favor, haga clic en el botón para subir un archivo." />
                }
              </div>
            </div>
          </section>
      </siaf-solicitude-page-layout>

      <siaf-upload-side-panel
        [open]="uploadPanelOpen()"
        (closed)="uploadPanelOpen.set(false)"
        (fileSelected)="uploadedFile.set($event)"
        (confirmed)="onUploadConfirmed($event)"
      />

      <!-- Panel seleccionar código de detalle de ajuste -->
      @if (detalleAjustePanelOpen()) {
        <section class="fixed inset-y-0 left-0 right-0 z-50 bg-black/55 pl-0 lg:pl-[65px]" aria-modal="true" role="dialog" aria-labelledby="detalle-ajuste-panel-title" (click)="closeDetalleAjustePanel()">
          <aside class="flex h-screen w-full flex-col overflow-hidden bg-surface shadow-[0_16px_12px_rgba(0,0,0,0.14),0_6px_15px_rgba(0,0,0,0.12),0_8px_5px_rgba(0,0,0,0.2)] lg:rounded-l-siaf-md" (click)="$event.stopPropagation()">

            <header class="flex h-14 shrink-0 items-center gap-siaf-xs border-b border-[var(--sys-color-divider-strong,rgba(32,32,32,0.24))] px-siaf-md">
              <h2 id="detalle-ajuste-panel-title" class="m-0 flex-1 text-base font-bold uppercase leading-normal tracking-[0.02px] text-text">
                Seleccionar Código de Detalle de Ajuste
                @if (selectedClaseAjuste()) {
                  <span class="ml-2 text-sm font-medium normal-case text-text-muted">— {{ selectedClaseAjuste()!.descripcion }}</span>
                }
              </h2>
              <button class="inline-flex size-10 items-center justify-center rounded-siaf-md text-text transition hover:bg-surface-muted active:bg-[rgba(32,32,32,0.12)]" type="button" aria-label="Cerrar" (click)="closeDetalleAjustePanel()">
                <siaf-icon name="close" [size]="24" />
              </button>
            </header>

            <div class="min-h-0 flex-1 overflow-y-auto border-b border-[var(--sys-color-divider-strong,rgba(32,32,32,0.24))] px-siaf-md py-siaf-md sm:px-siaf-xl">
              <div class="flex flex-col gap-siaf-lg">

                <label class="flex h-10 w-full items-center rounded-siaf-md border border-[rgba(32,32,32,0.4)] bg-surface px-siaf-md">
                  <span class="sr-only">Buscar</span>
                  <input class="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-text-muted" placeholder="Buscar"
                    [value]="detalleAjusteSearch()" (input)="detalleAjusteSearch.set(inputVal($event))" />
                </label>

                <siaf-pagination navigation="Activate" position="Top"
                  [page]="detalleAjustePage" [pageSize]="detalleAjusteRowsPerPage"
                  [totalItems]="detalleAjusteTotalItems" [totalPages]="detalleAjusteTotalPages"
                  (previous)="onDetalleAjustePreviousPage()" (next)="onDetalleAjusteNextPage()" />

                <section class="min-w-0 overflow-x-auto">
                  <table class="w-full border-collapse text-left">
                    <thead>
                      <tr class="bg-[var(--sys-color-bg-surfaces-surface-high,rgba(32,32,32,0.12))]">
                        <th class="h-10 w-10 rounded-l-siaf-sm px-siaf-sm py-siaf-sm"></th>
                        <th class="h-10 px-siaf-md py-siaf-sm text-xs font-bold uppercase leading-none text-text rounded-r-siaf-sm">Código de detalle de ajuste</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (row of detalleAjusteRows; track row.codigo) {
                        <tr
                          class="cursor-pointer border-b border-[var(--sys-color-divider-default,rgba(32,32,32,0.12))] transition hover:bg-[rgba(1,72,153,0.04)]"
                          [class.bg-[rgba(1,72,153,0.08)]]="tempSelectedDetalleAjuste?.codigo === row.codigo"
                          (click)="selectTempDetalleAjuste(row)"
                        >
                          <td class="px-siaf-sm py-siaf-xs">
                            <span class="inline-flex size-6 items-center justify-center">
                              <span class="flex size-5 items-center justify-center rounded-full border-2 transition"
                                [class.border-brand-primary]="tempSelectedDetalleAjuste?.codigo === row.codigo"
                                [class.border-[rgba(32,32,32,0.4)]]="tempSelectedDetalleAjuste?.codigo !== row.codigo">
                                @if (tempSelectedDetalleAjuste?.codigo === row.codigo) {
                                  <span class="size-2.5 rounded-full bg-brand-primary"></span>
                                }
                              </span>
                            </span>
                          </td>
                          <td class="min-h-12 px-siaf-md py-siaf-sm text-sm leading-normal text-text">{{ row.descripcion }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </section>

                <siaf-pagination navigation="Activate" position="Bottom" [rowPage]="true"
                  [page]="detalleAjustePage" [pageSize]="detalleAjusteRowsPerPage"
                  [totalItems]="detalleAjusteTotalItems" [totalPages]="detalleAjusteTotalPages"
                  [rowsPerPage]="detalleAjusteRowsPerPage" [rowsPerPageOptions]="detalleAjusteRowsPerPageOptions"
                  (previous)="onDetalleAjustePreviousPage()" (next)="onDetalleAjusteNextPage()"
                  (rowsPerPageChange)="onDetalleAjusteRowsPerPageChange($event)" />
              </div>
            </div>

            <div class="flex shrink-0 items-center justify-end gap-siaf-xs px-siaf-md py-siaf-sm">
              <button class="inline-flex min-h-10 items-center justify-center rounded-siaf-md border border-[rgba(32,32,32,0.4)] px-siaf-md py-siaf-xs text-sm font-medium text-text transition hover:bg-surface-muted active:bg-[rgba(32,32,32,0.12)]" type="button" (click)="closeDetalleAjustePanel()">Cancelar</button>
              <button class="inline-flex min-h-10 items-center justify-center rounded-siaf-md bg-[var(--sys-color-bg-brand-accent)] px-siaf-md py-siaf-xs text-sm font-medium text-white transition hover:brightness-90 disabled:opacity-50" type="button" [disabled]="!tempSelectedDetalleAjuste" (click)="aceptarDetalleAjuste()">Aceptar</button>
            </div>
          </aside>
        </section>
      }

      <!-- Panel seleccionar código de clase de ajuste -->
      @if (claseAjustePanelOpen()) {
        <section class="fixed inset-y-0 left-0 right-0 z-50 bg-black/55 pl-0 lg:pl-[65px]" aria-modal="true" role="dialog" aria-labelledby="clase-ajuste-panel-title" (click)="closeClaseAjustePanel()">
          <aside class="flex h-screen w-full flex-col overflow-hidden bg-surface shadow-[0_16px_12px_rgba(0,0,0,0.14),0_6px_15px_rgba(0,0,0,0.12),0_8px_5px_rgba(0,0,0,0.2)] lg:rounded-l-siaf-md" (click)="$event.stopPropagation()">

            <header class="flex h-14 shrink-0 items-center gap-siaf-xs border-b border-[var(--sys-color-divider-strong,rgba(32,32,32,0.24))] px-siaf-md">
              <h2 id="clase-ajuste-panel-title" class="m-0 flex-1 text-base font-bold uppercase leading-normal tracking-[0.02px] text-text">Seleccionar Código de Clase de Ajuste</h2>
              <button class="inline-flex size-10 items-center justify-center rounded-siaf-md text-text transition hover:bg-surface-muted active:bg-[rgba(32,32,32,0.12)]" type="button" aria-label="Cerrar" (click)="closeClaseAjustePanel()">
                <siaf-icon name="close" [size]="24" />
              </button>
            </header>

            <div class="min-h-0 flex-1 overflow-y-auto border-b border-[var(--sys-color-divider-strong,rgba(32,32,32,0.24))] px-siaf-md py-siaf-md sm:px-siaf-xl">
              <div class="flex flex-col gap-siaf-lg">

                <label class="flex h-10 w-full items-center rounded-siaf-md border border-[rgba(32,32,32,0.4)] bg-surface px-siaf-md">
                  <span class="sr-only">Buscar</span>
                  <input class="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-text-muted" placeholder="Buscar"
                    [value]="claseAjusteSearch()" (input)="claseAjusteSearch.set(inputVal($event))" />
                </label>

                <siaf-pagination navigation="Activate" position="Top"
                  [page]="claseAjustePage" [pageSize]="claseAjusteRowsPerPage"
                  [totalItems]="claseAjusteTotalItems" [totalPages]="claseAjusteTotalPages"
                  (previous)="onClaseAjustePreviousPage()" (next)="onClaseAjusteNextPage()" />

                <section class="min-w-0 overflow-x-auto">
                  <table class="w-full border-collapse text-left">
                    <thead>
                      <tr class="bg-[var(--sys-color-bg-surfaces-surface-high,rgba(32,32,32,0.12))]">
                        <th class="h-10 w-10 rounded-l-siaf-sm px-siaf-sm py-siaf-sm"></th>
                        <th class="h-10 px-siaf-md py-siaf-sm text-xs font-bold uppercase leading-none text-text rounded-r-siaf-sm">Código de clase de ajuste</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (row of claseAjusteRows; track row.codigo) {
                        <tr
                          class="cursor-pointer border-b border-[var(--sys-color-divider-default,rgba(32,32,32,0.12))] transition hover:bg-[rgba(1,72,153,0.04)]"
                          [class.bg-[rgba(1,72,153,0.08)]]="tempSelectedClaseAjuste?.codigo === row.codigo"
                          (click)="selectTempClaseAjuste(row)"
                        >
                          <td class="px-siaf-sm py-siaf-xs">
                            <span class="inline-flex size-6 items-center justify-center">
                              <span class="flex size-5 items-center justify-center rounded-full border-2 transition"
                                [class.border-brand-primary]="tempSelectedClaseAjuste?.codigo === row.codigo"
                                [class.border-[rgba(32,32,32,0.4)]]="tempSelectedClaseAjuste?.codigo !== row.codigo">
                                @if (tempSelectedClaseAjuste?.codigo === row.codigo) {
                                  <span class="size-2.5 rounded-full bg-brand-primary"></span>
                                }
                              </span>
                            </span>
                          </td>
                          <td class="min-h-12 px-siaf-md py-siaf-sm text-sm leading-normal text-text">{{ row.descripcion }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </section>

                <siaf-pagination navigation="Activate" position="Bottom" [rowPage]="true"
                  [page]="claseAjustePage" [pageSize]="claseAjusteRowsPerPage"
                  [totalItems]="claseAjusteTotalItems" [totalPages]="claseAjusteTotalPages"
                  [rowsPerPage]="claseAjusteRowsPerPage" [rowsPerPageOptions]="claseAjusteRowsPerPageOptions"
                  (previous)="onClaseAjustePreviousPage()" (next)="onClaseAjusteNextPage()"
                  (rowsPerPageChange)="onClaseAjusteRowsPerPageChange($event)" />
              </div>
            </div>

            <div class="flex shrink-0 items-center justify-end gap-siaf-xs px-siaf-md py-siaf-sm">
              <button class="inline-flex min-h-10 items-center justify-center rounded-siaf-md border border-[rgba(32,32,32,0.4)] px-siaf-md py-siaf-xs text-sm font-medium text-text transition hover:bg-surface-muted active:bg-[rgba(32,32,32,0.12)]" type="button" (click)="closeClaseAjustePanel()">Cancelar</button>
              <button class="inline-flex min-h-10 items-center justify-center rounded-siaf-md bg-[var(--sys-color-bg-brand-accent)] px-siaf-md py-siaf-xs text-sm font-medium text-white transition hover:brightness-90 disabled:opacity-50" type="button" [disabled]="!tempSelectedClaseAjuste" (click)="aceptarClaseAjuste()">Aceptar</button>
            </div>
          </aside>
        </section>
      }

      <!-- Panel seleccionar periodo — misma estructura que siaf-document-history-panel -->
      @if (periodoPanelOpen()) {
        <section class="fixed inset-y-0 left-0 right-0 z-50 bg-black/55 pl-0 lg:pl-[65px]" aria-modal="true" role="dialog" aria-labelledby="periodo-panel-title" (click)="closePeriodoPanel()">
          <aside class="flex h-screen w-full flex-col overflow-hidden bg-surface shadow-[0_16px_12px_rgba(0,0,0,0.14),0_6px_15px_rgba(0,0,0,0.12),0_8px_5px_rgba(0,0,0,0.2)] lg:rounded-l-siaf-md" (click)="$event.stopPropagation()">

            <!-- Header -->
            <header class="flex h-14 shrink-0 items-center gap-siaf-xs border-b border-[var(--sys-color-divider-strong,rgba(32,32,32,0.24))] px-siaf-md">
              <h2 id="periodo-panel-title" class="m-0 flex-1 text-base font-bold uppercase leading-normal tracking-[0.02px] text-text">Seleccionar Periodo</h2>
              <button class="inline-flex size-10 items-center justify-center rounded-siaf-md text-text transition hover:bg-surface-muted active:bg-[rgba(32,32,32,0.12)]" type="button" aria-label="Cerrar panel de periodo" (click)="closePeriodoPanel()">
                <siaf-icon name="close" [size]="24" />
              </button>
            </header>

            <!-- Cuerpo -->
            <div class="min-h-0 flex-1 overflow-y-auto border-b border-[var(--sys-color-divider-strong,rgba(32,32,32,0.24))] px-siaf-md py-siaf-md sm:px-siaf-xl">
              <div class="flex flex-col gap-siaf-lg">

                <!-- Búsqueda -->
                <label class="flex h-10 w-full items-center rounded-siaf-md border border-[rgba(32,32,32,0.4)] bg-surface px-siaf-md">
                  <span class="sr-only">Buscar</span>
                  <input
                    class="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-text-muted"
                    placeholder="Buscar"
                    [value]="periodoSearch()"
                    (input)="periodoSearch.set(inputVal($event))"
                  />
                </label>

                <!-- Paginación superior -->
                <siaf-pagination
                  navigation="Activate"
                  position="Top"
                  [page]="periodoPage"
                  [pageSize]="periodoRowsPerPage"
                  [totalItems]="periodoTotalItems"
                  [totalPages]="periodoTotalPages"
                  (previous)="onPeriodoPreviousPage()"
                  (next)="onPeriodoNextPage()"
                />

                <!-- Tabla -->
                <section class="min-w-0 overflow-x-auto">
                  <table class="w-full min-w-[760px] border-collapse text-left">
                    <thead>
                      <tr class="bg-[var(--sys-color-bg-surfaces-surface-high,rgba(32,32,32,0.12))]">
                        <th class="h-10 w-10 rounded-l-siaf-sm px-siaf-sm py-siaf-sm text-xs font-bold uppercase leading-none text-text"></th>
                        <th class="h-10 w-[130px] px-siaf-md py-siaf-sm text-xs font-bold uppercase leading-none text-text">Periodo</th>
                        <th class="h-10 w-[100px] px-siaf-md py-siaf-sm text-xs font-bold uppercase leading-none text-text">Vigencia</th>
                        <th class="h-10 px-siaf-md py-siaf-sm text-xs font-bold uppercase leading-none text-text">Fecha de inicio</th>
                        <th class="h-10 px-siaf-md py-siaf-sm text-xs font-bold uppercase leading-none text-text">Fecha fin</th>
                        <th class="h-10 px-siaf-md py-siaf-sm text-xs font-bold uppercase leading-none text-text">Fecha vig. adicional</th>
                        <th class="h-10 px-siaf-md py-siaf-sm text-xs font-bold uppercase leading-none text-text">Usuario responsable</th>
                        <th class="h-10 w-[120px] rounded-r-siaf-sm px-siaf-md py-siaf-sm text-xs font-bold uppercase leading-none text-text">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (group of periodoGroups; track group.anio) {
                        <tr class="border-b border-[var(--sys-color-divider-default,rgba(32,32,32,0.12))]">
                          <td class="px-siaf-sm py-siaf-xs">
                            <button class="inline-flex size-6 items-center justify-center rounded-siaf-sm transition hover:bg-surface-muted" type="button" (click)="toggleGroup(group)">
                              <siaf-icon [name]="group.expanded ? 'expand_less' : 'expand_more'" [size]="20" />
                            </button>
                          </td>
                          <td class="min-h-12 px-siaf-md py-siaf-sm text-sm font-bold leading-normal text-text">{{ group.anio }}</td>
                          <td class="min-h-12 px-siaf-md py-siaf-sm text-sm font-bold leading-normal text-text">{{ group.vigencia }}</td>
                          <td class="min-h-12 px-siaf-md py-siaf-sm text-sm font-bold leading-normal text-text">{{ group.fechaInicio }}</td>
                          <td class="min-h-12 px-siaf-md py-siaf-sm text-sm font-bold leading-normal text-text">{{ group.fechaFin }}</td>
                          <td class="min-h-12 px-siaf-md py-siaf-sm text-sm font-bold leading-normal text-text">{{ group.fechaVigenciaAdicional }}</td>
                          <td class="min-h-12 px-siaf-md py-siaf-sm text-sm font-bold leading-normal text-text">{{ group.usuarioResponsable }}</td>
                          <td class="min-h-12 px-siaf-md py-siaf-sm">
                            <span class="inline-flex items-center gap-1 rounded-siaf-sm border border-[var(--sys-color-border-feedback-info)] bg-[var(--sys-color-bg-feedback-light-info)] px-siaf-xs text-xs text-[var(--sys-color-text-feedback-info)]">
                              <siaf-icon name="check_circle" [size]="16" />{{ group.estado }}
                            </span>
                          </td>
                        </tr>

                        @if (group.expanded) {
                          @for (row of group.subPeriodos; track row.periodo) {
                            <tr
                              class="cursor-pointer border-b border-[var(--sys-color-divider-default,rgba(32,32,32,0.12))] transition hover:bg-[rgba(1,72,153,0.04)]"
                              [class.bg-[rgba(1,72,153,0.08)]]="tempSelectedPeriodo?.periodo === row.periodo"
                              (click)="selectTempPeriodo(row)"
                            >
                              <td class="px-siaf-sm py-siaf-xs">
                                <span class="inline-flex size-6 items-center justify-center">
                                  <span class="flex size-5 items-center justify-center rounded-full border-2 transition"
                                    [class.border-brand-primary]="tempSelectedPeriodo?.periodo === row.periodo"
                                    [class.border-[rgba(32,32,32,0.4)]]="tempSelectedPeriodo?.periodo !== row.periodo">
                                    @if (tempSelectedPeriodo?.periodo === row.periodo) {
                                      <span class="size-2.5 rounded-full bg-brand-primary"></span>
                                    }
                                  </span>
                                </span>
                              </td>
                              <td class="min-h-12 px-siaf-md py-siaf-sm text-sm leading-normal text-text">{{ row.periodo }}</td>
                              <td class="min-h-12 px-siaf-md py-siaf-sm text-sm leading-normal text-text">{{ row.vigencia }}</td>
                              <td class="min-h-12 px-siaf-md py-siaf-sm text-sm leading-normal text-text">{{ row.fechaInicio }}</td>
                              <td class="min-h-12 px-siaf-md py-siaf-sm text-sm leading-normal text-text">{{ row.fechaFin }}</td>
                              <td class="min-h-12 px-siaf-md py-siaf-sm text-sm leading-normal text-text">{{ row.fechaVigenciaAdicional }}</td>
                              <td class="min-h-12 px-siaf-md py-siaf-sm text-sm leading-normal text-text">{{ row.usuarioResponsable }}</td>
                              <td class="min-h-12 px-siaf-md py-siaf-sm">
                                <span class="inline-flex items-center gap-1 rounded-siaf-sm border border-[var(--sys-color-border-feedback-info)] bg-[var(--sys-color-bg-feedback-light-info)] px-siaf-xs text-xs text-[var(--sys-color-text-feedback-info)]">
                                  <siaf-icon name="check_circle" [size]="16" />{{ row.estado }}
                                </span>
                              </td>
                            </tr>
                          }
                        }
                      }
                    </tbody>
                  </table>
                </section>

                <!-- Paginación inferior -->
                <siaf-pagination
                  navigation="Activate"
                  position="Bottom"
                  [rowPage]="true"
                  [page]="periodoPage"
                  [pageSize]="periodoRowsPerPage"
                  [totalItems]="periodoTotalItems"
                  [totalPages]="periodoTotalPages"
                  [rowsPerPage]="periodoRowsPerPage"
                  [rowsPerPageOptions]="periodoRowsPerPageOptions"
                  (previous)="onPeriodoPreviousPage()"
                  (next)="onPeriodoNextPage()"
                  (rowsPerPageChange)="onPeriodoRowsPerPageChange($event)"
                />
              </div>
            </div>

            <!-- Footer -->
            <div class="flex shrink-0 items-center justify-end gap-siaf-xs px-siaf-md py-siaf-sm">
              <button class="inline-flex min-h-10 items-center justify-center rounded-siaf-md border border-[rgba(32,32,32,0.4)] px-siaf-md py-siaf-xs text-sm font-medium text-text transition hover:bg-surface-muted active:bg-[rgba(32,32,32,0.12)]" type="button" (click)="closePeriodoPanel()">
                Cancelar
              </button>
              <button class="inline-flex min-h-10 items-center justify-center rounded-siaf-md bg-[var(--sys-color-bg-brand-accent)] px-siaf-md py-siaf-xs text-sm font-medium text-white transition hover:brightness-90 disabled:opacity-50" type="button" [disabled]="!tempSelectedPeriodo" (click)="aceptarPeriodo()">
                Aceptar
              </button>
            </div>
          </aside>
        </section>
      }
      <!-- Modal confirmar grabar solicitud -->
      <siaf-modal
        variant="save"
        [open]="saveModalOpen"
        confirmVariant="primary"
        confirmLabel="Aceptar"
        cancelLabel="Cancelar"
        [showIllustration]="true"
        (canceled)="saveModalOpen = false"
        (closed)="saveModalOpen = false"
        (confirmed)="onConfirmSave()"
      />

      <!-- Modal confirmar verificacion de solicitud -->
      <siaf-modal
        variant="verify"
        [open]="verifyModalOpen"
        confirmVariant="primary"
        confirmLabel="Aceptar"
        cancelLabel="Cancelar"
        [showIllustration]="true"
        (canceled)="verifyModalOpen = false"
        (closed)="verifyModalOpen = false"
        (confirmed)="onConfirmVerify()"
      />

      <!-- Modal confirmar eliminacion de solicitud -->
      <siaf-modal
        variant="delete-request"
        [open]="deleteModalOpen"
        confirmVariant="primary"
        confirmLabel="Aceptar"
        cancelLabel="Cancelar"
        [showIllustration]="true"
        (canceled)="deleteModalOpen = false"
        (closed)="deleteModalOpen = false"
        (confirmed)="onConfirmDelete()"
      />

      <div class="fixed bottom-siaf-lg left-1/2 z-50 w-[min(430px,calc(100vw-32px))] -translate-x-1/2">
        <siaf-snackbar
          [variant]="snackbarVariant"
          [open]="saveSnackbarOpen"
          [requestNumber]="generatedDocumentNumber"
          (closed)="saveSnackbarOpen = false"
        />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdjustmentSeatRequestComponent {
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  isReadOnly = false;
  isElaborated = false;
  isVerified = false;
  isDeleted = false;
  saveSnackbarOpen = false;
  snackbarVariant: SnackbarVariant = 'creation-elaborated';
  readonly generatedDocumentNumber = '0001';

  readonly periodoPanelOpen = signal(false);
  readonly selectedPeriodo = signal<PeriodoRow | null>(null);
  readonly periodoSearch = signal('');
  tempSelectedPeriodo: PeriodoRow | null = null;
  periodoPage = 1;
  periodoRowsPerPage = 25;
  readonly periodoRowsPerPageOptions = [10, 25, 50, 100];
  readonly periodoTotalItems = 100;

  readonly claseAjustePanelOpen = signal(false);
  readonly selectedClaseAjuste = signal<ClaseAjusteRow | null>(null);
  readonly claseAjusteSearch = signal('');
  tempSelectedClaseAjuste: ClaseAjusteRow | null = null;
  claseAjustePage = 1;
  claseAjusteRowsPerPage = 25;
  readonly claseAjusteRowsPerPageOptions = [10, 25, 50, 100];
  readonly claseAjusteTotalItems = 100;

  readonly uploadPanelOpen = signal(false);
  readonly uploadedFile = signal<File | null>(null);
  saveModalOpen = false;
  verifyModalOpen = false;
  deleteModalOpen = false;
  readonly fechaContabilizacion = signal('');
  readonly glosa = signal('');
  readonly justificacion = signal('');

  cuentasContables: CuentaContable[] = [];
  cuentasSearch = '';
  cuentasPage = 1;
  cuentasRowsPerPage = 10;
  readonly cuentasRowsPerPageOptions = [10, 25, 50, 100];
  readonly cuentasTotalItems = 800;

  readonly detalleAjustePanelOpen = signal(false);
  readonly selectedDetalleAjuste = signal<DetalleAjusteRow | null>(null);
  readonly detalleAjusteSearch = signal('');
  tempSelectedDetalleAjuste: DetalleAjusteRow | null = null;
  detalleAjustePage = 1;
  detalleAjusteRowsPerPage = 25;
  readonly detalleAjusteRowsPerPageOptions = [10, 25, 50, 100];
  readonly detalleAjusteTotalItems = 100;

  readonly detalleAjusteRows: DetalleAjusteRow[] = [
    { codigo: '1.1', descripcion: '1.1 - Provisión para cuentas incobrables' },
    { codigo: '1.2', descripcion: '1.2 - Provisión para garantías' },
    { codigo: '1.3', descripcion: '1.3 - Provisión para litigios' },
    { codigo: '1.4', descripcion: '1.4 - Provisión para reestructuración' },
    { codigo: '1.5', descripcion: '1.5 - Provisión para beneficios de empleados' }
  ];

  readonly claseAjusteRows: ClaseAjusteRow[] = [
    { codigo: '1', descripcion: '1. - Provisiones' },
    { codigo: '2', descripcion: '2. - Activos circulantes' },
    { codigo: '3', descripcion: '3. - Pasivos a corto plazo' },
    { codigo: '4', descripcion: '4. - Inventarios' },
    { codigo: '5', descripcion: '5. - Cuentas por cobrar' },
    { codigo: '6', descripcion: '6. - Capital social' },
    { codigo: '7', descripcion: '7. - Cuentas por pagar' },
    { codigo: '8', descripcion: '8. - Gastos acumulados' },
    { codigo: '9', descripcion: '9. - Ingresos diferidos' }
  ];

  readonly periodoGroups: PeriodoGroup[] = [
    {
      anio: '2026',
      vigencia: 'Si',
      fechaInicio: '01/01/2026',
      fechaFin: '31/12/2026',
      fechaVigenciaAdicional: '--',
      usuarioResponsable: 'SIAF - RP',
      estado: 'Abierto',
      expanded: true,
      subPeriodos: [
        {
          periodo: '2026 - 01',
          vigencia: 'Si',
          fechaInicio: '01/01/2026',
          fechaFin: '31/01/2026',
          fechaVigenciaAdicional: '10/02/2026',
          usuarioResponsable: 'RICARDO JOHN DOE BUSTAMANTE',
          estado: 'Abierto'
        },
        {
          periodo: '2026 - 02',
          vigencia: 'Si',
          fechaInicio: '01/02/2026',
          fechaFin: '28/02/2026',
          fechaVigenciaAdicional: '--',
          usuarioResponsable: 'RICARDO JOHN DOE BUSTAMANTE',
          estado: 'Abierto'
        }
      ]
    }
  ];

  openPeriodoPanel(): void {
    if (this.isReadOnly) {
      return;
    }

    this.tempSelectedPeriodo = this.selectedPeriodo();
    this.periodoPanelOpen.set(true);
  }

  closePeriodoPanel(): void {
    this.tempSelectedPeriodo = null;
    this.periodoPanelOpen.set(false);
  }

  selectTempPeriodo(row: PeriodoRow): void {
    this.tempSelectedPeriodo = row;
  }

  aceptarPeriodo(): void {
    if (this.tempSelectedPeriodo) {
      this.selectedPeriodo.set(this.tempSelectedPeriodo);
      this.periodoPanelOpen.set(false);
      this.tempSelectedPeriodo = null;
    }
  }

  toggleGroup(group: PeriodoGroup): void {
    group.expanded = !group.expanded;
  }

  get periodoTotalPages(): number {
    return Math.ceil(this.periodoTotalItems / this.periodoRowsPerPage);
  }

  onPeriodoPreviousPage(): void {
    if (this.periodoPage > 1) this.periodoPage--;
  }

  onPeriodoNextPage(): void {
    if (this.periodoPage < this.periodoTotalPages) this.periodoPage++;
  }

  onPeriodoRowsPerPageChange(value: number): void {
    this.periodoRowsPerPage = value;
    this.periodoPage = 1;
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.uploadedFile.set(file);
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) this.uploadedFile.set(file);
  }

  openSaveModal(): void {
    this.saveModalOpen = true;
    this.cdr.markForCheck();
  }

  onConfirmSave(): void {
    this.saveModalOpen = false;
    this.isElaborated = true;
    this.isVerified = false;
    this.isDeleted = false;
    this.isReadOnly = true;
    this.snackbarVariant = 'creation-elaborated';
    this.saveSnackbarOpen = true;
    this.cdr.markForCheck();
  }

  openVerifyModal(): void {
    this.verifyModalOpen = true;
    this.cdr.markForCheck();
  }

  onConfirmVerify(): void {
    this.verifyModalOpen = false;
    this.isElaborated = true;
    this.isVerified = true;
    this.isDeleted = false;
    this.isReadOnly = true;
    this.snackbarVariant = 'creation-verified';
    this.saveSnackbarOpen = true;
    this.cdr.markForCheck();
  }

  openDeleteModal(): void {
    this.deleteModalOpen = true;
    this.cdr.markForCheck();
  }

  onConfirmDelete(): void {
    this.deleteModalOpen = false;
    this.isElaborated = true;
    this.isVerified = false;
    this.isDeleted = true;
    this.isReadOnly = true;
    this.snackbarVariant = 'creation-deleted';
    this.saveSnackbarOpen = true;
    this.cdr.markForCheck();
  }

  enableEditing(): void {
    this.isReadOnly = false;
    this.isVerified = false;
    this.isDeleted = false;
    this.saveSnackbarOpen = false;
    this.cdr.markForCheck();
  }

  get isFormValid(): boolean {
    return !!(
      this.selectedPeriodo() &&
      this.selectedClaseAjuste() &&
      this.selectedDetalleAjuste() &&
      this.fechaContabilizacion() &&
      this.glosa().trim().length > 0 &&
      this.justificacion().trim().length > 0 &&
      this.uploadedFile() &&
      (this.totalDebe > 0 || this.totalHaber > 0)
    );
  }

  get isEditingElaborated(): boolean {
    return this.isElaborated && !this.isReadOnly;
  }

  get solicitudeHeaderState(): SolicitudeHeaderState {
    if (this.isDeleted) {
      return 'deleted';
    }

    if (this.isVerified) {
      return 'verified';
    }

    if (this.isReadOnly) {
      return 'elaborated';
    }

    return this.isElaborated ? 'edit' : 'new';
  }

  get documentStatus(): FlowStatus {
    if (this.isDeleted) {
      return 'Eliminado';
    }

    return this.isVerified ? 'Verificado' : 'Elaborado';
  }

  get fechaContabilizacionDisplay(): string {
    const value = this.fechaContabilizacion();

    if (!value) {
      return '';
    }

    const [year, month, day] = value.split('-');
    return year && month && day ? `${day}/${month}/${year}` : value;
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1048576) return `${Math.round(bytes / 1024)}kb`;
    return `${(bytes / 1048576).toFixed(1)}MB`;
  }

  onUploadConfirmed(file: File): void {
    this.uploadedFile.set(file);
    this.uploadPanelOpen.set(false);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  get totalDebe(): number {
    return this.cuentasContables.filter((c) => c.tipoMovimiento === 'Debe').reduce((s, c) => s + c.importe, 0);
  }

  get totalHaber(): number {
    return this.cuentasContables.filter((c) => c.tipoMovimiento === 'Haber').reduce((s, c) => s + c.importe, 0);
  }

  get cuentasTotalPages(): number {
    return Math.ceil(this.cuentasTotalItems / this.cuentasRowsPerPage);
  }

  onCuentasImporteChange(index: number, event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value) || 0;
    this.cuentasContables = this.cuentasContables.map((c, i) => i === index ? { ...c, importe: val } : c);
  }

  formatImporte(value: number): string {
    return value.toLocaleString('es-PE', { maximumFractionDigits: 2 });
  }

  openDetalleAjustePanel(): void {
    if (this.isReadOnly) {
      return;
    }

    this.tempSelectedDetalleAjuste = this.selectedDetalleAjuste();
    this.detalleAjustePanelOpen.set(true);
  }

  closeDetalleAjustePanel(): void {
    this.tempSelectedDetalleAjuste = null;
    this.detalleAjustePanelOpen.set(false);
  }

  selectTempDetalleAjuste(row: DetalleAjusteRow): void {
    this.tempSelectedDetalleAjuste = row;
  }

  aceptarDetalleAjuste(): void {
    if (this.tempSelectedDetalleAjuste) {
      this.selectedDetalleAjuste.set(this.tempSelectedDetalleAjuste);
      this.detalleAjustePanelOpen.set(false);
      this.tempSelectedDetalleAjuste = null;
      this.cuentasContables = [
        { codigo: '5.8.0.1.0.5', nombre: 'Estimaciones de cobranza dudosa - cuentas por cobrar', tipoMovimiento: 'Debe', importe: 0 },
        { codigo: '1.1.3.1.1.1', nombre: 'Venta de bienes por cobrar', tipoMovimiento: 'Haber', importe: 0 }
      ];
    }
  }

  get detalleAjusteTotalPages(): number {
    return Math.ceil(this.detalleAjusteTotalItems / this.detalleAjusteRowsPerPage);
  }

  onDetalleAjustePreviousPage(): void {
    if (this.detalleAjustePage > 1) this.detalleAjustePage--;
  }

  onDetalleAjusteNextPage(): void {
    if (this.detalleAjustePage < this.detalleAjusteTotalPages) this.detalleAjustePage++;
  }

  onDetalleAjusteRowsPerPageChange(value: number): void {
    this.detalleAjusteRowsPerPage = value;
    this.detalleAjustePage = 1;
  }

  openClaseAjustePanel(): void {
    if (this.isReadOnly) {
      return;
    }

    this.tempSelectedClaseAjuste = this.selectedClaseAjuste();
    this.claseAjustePanelOpen.set(true);
  }

  closeClaseAjustePanel(): void {
    this.tempSelectedClaseAjuste = null;
    this.claseAjustePanelOpen.set(false);
  }

  selectTempClaseAjuste(row: ClaseAjusteRow): void {
    this.tempSelectedClaseAjuste = row;
  }

  aceptarClaseAjuste(): void {
    if (this.tempSelectedClaseAjuste) {
      this.selectedClaseAjuste.set(this.tempSelectedClaseAjuste);
      this.claseAjustePanelOpen.set(false);
      this.tempSelectedClaseAjuste = null;
    }
  }

  get claseAjusteTotalPages(): number {
    return Math.ceil(this.claseAjusteTotalItems / this.claseAjusteRowsPerPage);
  }

  onClaseAjustePreviousPage(): void {
    if (this.claseAjustePage > 1) this.claseAjustePage--;
  }

  onClaseAjusteNextPage(): void {
    if (this.claseAjustePage < this.claseAjusteTotalPages) this.claseAjustePage++;
  }

  onClaseAjusteRowsPerPageChange(value: number): void {
    this.claseAjusteRowsPerPage = value;
    this.claseAjustePage = 1;
  }

  inputVal(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Inicio', href: '/panel' },
    ...buildAdjustmentSeatBreadcrumbs('Solicitud de registro de asiento de ajuste')
  ];

  readonly entityFields: ReadonlyField[] = [
    { label: 'Fecha', value: '19/08/2025     08:00:59' },
    { label: 'Ente rector', value: 'DIRECCIÓN GENERAL DE CONTABILIDAD PÚBLICA' },
    { label: 'Entidad/ U.E/ ...', value: 'NOMBRE DE LA ENTIDAD/ U.E/ ...' }
  ];

  goToDocuments(): void {
    void this.router.navigate(['/procesos/registro-asiento-ajuste']);
  }

  goToRequest(): void {
    void this.router.navigate(['/procesos/registro-asiento-ajuste/solicitud']);
  }
}
