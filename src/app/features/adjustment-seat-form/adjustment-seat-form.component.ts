import { ChangeDetectionStrategy, Component, forwardRef, Input } from '@angular/core';

import { BreadcrumbComponent, BreadcrumbItem } from '../../shared/components/breadcrumb/breadcrumb.component';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { PaginationComponent } from '../../shared/ui/pagination/pagination.component';
import { findProcessPathById } from '../../shared/ui/process-menu-tree/process-menu-tree.component';
import { SolicitudeHeaderComponent } from '../../shared/ui/solicitude-header/solicitude-header.component';

type ReadonlyField = {
  label: string;
  value: string;
};

const ADJUSTMENT_SEAT_PROCESS_ID = 'registro-asiento-ajuste';
const ADJUSTMENT_SEAT_PROCESS_ROUTE = '/procesos/registro-asiento-ajuste';
const ADJUSTMENT_SEAT_REQUEST_ROUTE = '/procesos/registro-asiento-ajuste/solicitud';
const ADJUSTMENT_SEAT_REQUEST_LABEL = 'Solicitud de registro de asiento de ajuste';

const getAdjustmentSeatPathHref = (nodeId: string): string => {
  if (nodeId === ADJUSTMENT_SEAT_PROCESS_ID) {
    return ADJUSTMENT_SEAT_PROCESS_ROUTE;
  }

  return '/panel';
};

const buildAdjustmentSeatBreadcrumbs = (currentLabel: string): BreadcrumbItem[] => [
  ...findProcessPathById(ADJUSTMENT_SEAT_PROCESS_ID).map((node) => ({ label: node.label, href: getAdjustmentSeatPathHref(node.id) })),
  { label: ADJUSTMENT_SEAT_REQUEST_LABEL, href: ADJUSTMENT_SEAT_REQUEST_ROUTE },
  { label: currentLabel }
];

type AccountingRow = {
  code: string;
  account: string;
  movement: string;
  amount: string;
};

@Component({
  selector: 'siaf-adjustment-seat-form',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    IconComponent,
    PaginationComponent,
    forwardRef(() => ReadonlyCardComponent),
    forwardRef(() => ReadonlyLineComponent),
    SolicitudeHeaderComponent
  ],
  template: `
    <div class="min-h-[calc(100vh-56px)] bg-[var(--sys-color-bg-surfaces-surface-lowest)] text-text">
      <section class="min-w-0">
        <div class="flex min-w-0 flex-col">
          <section class="bg-surface">
            <siaf-breadcrumb class="block" [items]="breadcrumbs" />
            <siaf-solicitude-header
              type="actions"
              heading="Solicitud de registro de asiento de ajuste"
              secondaryText="Creación"
              [showReturn]="true"
            />
          </section>

          <section class="flex flex-col gap-siaf-md p-siaf-md sm:p-siaf-lg">
            <div class="flex flex-col gap-siaf-md xl:flex-row">
              <section class="flex min-w-0 flex-1 flex-col gap-siaf-xs rounded-siaf-md bg-surface px-siaf-lg py-siaf-md">
                @for (field of entityFields; track field.label) {
                  <div class="flex min-w-0 flex-col gap-siaf-xxs sm:flex-row sm:gap-siaf-md">
                    <span class="w-[140px] shrink-0 truncate text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">
                      {{ field.label }}
                    </span>
                    <strong class="min-w-0 flex-1 text-sm font-bold leading-6 text-text">
                      {{ field.value }}
                    </strong>
                  </div>
                }
              </section>

              <section class="flex w-full flex-col gap-siaf-xs rounded-siaf-md bg-surface px-siaf-lg py-siaf-md xl:w-[360px]">
                @for (field of documentFields; track field.label) {
                  <div class="flex min-w-0 flex-col gap-siaf-xxs sm:flex-row sm:gap-siaf-md xl:flex-row">
                    <span class="w-[140px] shrink-0 truncate text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">
                      {{ field.label }}
                    </span>

                    @if (field.label === 'Estado') {
                      <span class="inline-flex h-6 w-fit items-center rounded-siaf-sm bg-[var(--sys-color-bg-feedback-dark-success)] px-siaf-xs text-xs text-white">
                        {{ field.value }}
                      </span>
                    } @else {
                      <strong class="min-w-0 flex-1 text-sm font-bold leading-6 text-text">
                        {{ field.value }}
                      </strong>
                    }
                  </div>
                }
              </section>
            </div>

            <section class="rounded-siaf-md bg-surface">
              <header class="flex min-h-14 items-center px-siaf-lg pt-siaf-md">
                <h2 class="text-base font-bold uppercase tracking-[0.02px] text-text">Registro de asiento de ajuste</h2>
              </header>

              <div class="flex flex-col gap-siaf-lg px-siaf-lg py-siaf-md">
                <section class="flex flex-col gap-siaf-lg">
                  <h3 class="text-sm font-bold uppercase text-text">Ambito institucional</h3>
                  <article class="relative rounded-siaf-md border border-border px-siaf-xl py-siaf-xs">
                    <span class="absolute left-[-1px] top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-siaf-sm bg-brand-primary"></span>
                    <div class="flex min-h-11 flex-col justify-center gap-siaf-xxs">
                      <span class="text-[11px] font-bold uppercase tracking-[0.66px] text-text-muted">Ambito institucional</span>
                      <strong class="text-sm font-bold">ID - Nombre del ambito</strong>
                    </div>
                  </article>
                </section>

                <section class="flex flex-col gap-siaf-lg">
                  <h3 class="text-sm font-bold uppercase text-text">Periodo</h3>
                  <article class="relative rounded-siaf-md border border-border px-siaf-xl py-siaf-xs">
                    <span class="absolute left-[-1px] top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-siaf-sm bg-brand-primary"></span>
                    <div class="grid min-h-11 gap-siaf-md sm:grid-cols-2 lg:grid-cols-4">
                      @for (field of periodFields; track field.label) {
                        <div class="flex flex-col justify-center gap-siaf-xxs">
                          <span class="truncate text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">{{ field.label }}</span>
                          <strong class="text-sm font-bold">{{ field.value }}</strong>
                        </div>
                      }
                    </div>
                  </article>
                </section>

                <section class="grid gap-siaf-lg">
                  <readonly-line label="Fecha de contabilizacion" caption="Fecha *" value="19/08/2026" />
                  <readonly-card label="Buscar codigo de clase de ajuste" caption="Codigo de clase de ajuste" value="1. - Provisiones" />
                  <readonly-card label="Buscar codigo de detalle de ajuste" caption="Detalle de ajuste" value="1.1. - Provision de cuentas por cobrar" />
                  <readonly-line label="Glosa" caption="Glosa *" value="Glosa que nosotros ingresamos el texto" />
                </section>

                <details class="group overflow-hidden rounded-siaf-sm border border-[rgba(32,32,32,0.24)] bg-surface" open>
                  <summary class="flex min-h-14 w-full cursor-pointer list-none items-center gap-siaf-xs px-siaf-md py-siaf-xs text-left">
                    <span class="inline-flex size-10 shrink-0 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted">
                      <siaf-icon class="transition group-open:rotate-180" name="expand_more" [size]="24" />
                    </span>
                    <span class="flex min-h-10 min-w-0 flex-1 items-center text-sm font-medium uppercase text-text">
                      Codigo de asiento:
                      <strong class="ml-siaf-xxs font-bold normal-case">AA0015</strong>
                    </span>
                  </summary>

                  <div class="flex flex-col gap-siaf-md border-t border-[rgba(32,32,32,0.24)] p-siaf-lg">
                    <div class="flex min-h-10 items-center">
                      <h3 class="text-sm font-bold uppercase text-text">Cuentas contables</h3>
                    </div>

                    <div class="flex flex-col gap-siaf-md md:flex-row md:items-center">
                      <label class="flex h-10 min-w-0 flex-1 items-center rounded-siaf-md border border-border bg-surface px-siaf-md">
                        <input class="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-text-muted" placeholder="Buscar" />
                      </label>

                      <div class="flex shrink-0 items-center justify-end gap-siaf-xs">
                        <button class="inline-flex size-10 items-center justify-center rounded-siaf-md hover:bg-surface-muted" type="button" aria-label="Filtrar">
                          <siaf-icon name="filter_list" [size]="24" />
                        </button>
                        <button class="inline-flex size-10 items-center justify-center rounded-siaf-md hover:bg-surface-muted" type="button" aria-label="Mas opciones">
                          <siaf-icon name="more_vert" [size]="24" />
                        </button>
                      </div>
                    </div>

                    <div class="flex justify-end">
                      <siaf-pagination
                        navigation="Activate"
                        position="Top"
                        [page]="page"
                        [pageSize]="rowsPerPage"
                        [totalItems]="totalItems"
                        [totalPages]="totalPages"
                      />
                    </div>

                    <div class="overflow-x-auto">
                      <table class="min-w-[760px] w-full border-collapse text-sm">
                        <thead class="bg-[var(--sys-color-bg-surfaces-surface-high)] text-xs font-bold uppercase text-text">
                          <tr>
                            <th class="w-[190px] px-siaf-md py-siaf-sm text-left">Cod. cuentas contables</th>
                            <th class="px-siaf-md py-siaf-sm text-left">Nombre de la cuenta contable</th>
                            <th class="w-[180px] px-siaf-md py-siaf-sm text-left">Tipo de movimiento</th>
                            <th class="w-[130px] px-siaf-md py-siaf-sm text-right">Importe</th>
                          </tr>
                        </thead>
                        <tbody>
                          @for (row of rows; track row.code) {
                            <tr class="border-b border-divider">
                              <td class="px-siaf-md py-siaf-sm">{{ row.code }}</td>
                              <td class="px-siaf-md py-siaf-sm">{{ row.account }}</td>
                              <td class="px-siaf-md py-siaf-sm">{{ row.movement }}</td>
                              <td class="px-siaf-md py-siaf-sm text-right">{{ row.amount }}</td>
                            </tr>
                          }
                          <tr class="border-b border-divider">
                            <td class="px-siaf-md py-siaf-sm" colspan="2"></td>
                            <td class="px-siaf-md py-siaf-sm">Total Debe</td>
                            <td class="px-siaf-md py-siaf-sm text-right">50,000</td>
                          </tr>
                          <tr class="border-b border-divider">
                            <td class="px-siaf-md py-siaf-sm" colspan="2"></td>
                            <td class="px-siaf-md py-siaf-sm">Total Haber</td>
                            <td class="px-siaf-md py-siaf-sm text-right">50,000</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div class="flex flex-col gap-siaf-md lg:flex-row lg:items-center lg:justify-between">
                      <siaf-pagination
                        navigation="Activate"
                        position="Bottom"
                        [rowPage]="true"
                        [page]="page"
                        [pageSize]="rowsPerPage"
                        [totalItems]="totalItems"
                        [totalPages]="totalPages"
                        [rowsPerPage]="rowsPerPage"
                        [rowsPerPageOptions]="rowsPerPageOptions"
                        (rowsPerPageChange)="onRowsPerPageChange($event)"
                      />
                    </div>
                  </div>
                </details>
              </div>
            </section>

            <section class="rounded-siaf-md bg-surface">
              <header class="flex min-h-14 items-center px-siaf-lg pt-siaf-md">
                <h2 class="text-base font-bold uppercase tracking-[0.02px] text-text">Justificacion del sustento</h2>
              </header>

              <div class="flex flex-col gap-siaf-lg px-siaf-lg py-siaf-md">
                <readonly-line
                  label=""
                  caption="Justificacion del requerimiento solicitado *"
                  value="Registro del asiento de ajuste para las cuentas contables"
                />

                <div class="flex flex-col gap-siaf-xs">
                  <h3 class="min-h-10 text-sm font-bold uppercase leading-10 text-text">Documento de sustento</h3>
                  <div class="flex items-center gap-siaf-sm rounded-siaf-md border border-border bg-surface p-siaf-md">
                    <img class="size-8 shrink-0" src="assets/figma/modal-annulment/xls-file.svg" alt="" />
                    <div class="min-w-0 flex-1">
                      <p class="truncate text-sm font-bold text-text">DocEntregable001.pdf</p>
                      <p class="text-xs text-text-muted">500kb</p>
                    </div>
                    <button class="inline-flex size-8 shrink-0 items-center justify-center rounded-siaf-md hover:bg-surface-muted" type="button" aria-label="Descargar documento">
                      <siaf-icon name="file_download" [size]="24" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section class="rounded-siaf-md bg-surface px-siaf-lg py-siaf-md">
              <div class="grid gap-siaf-lg md:grid-cols-3">
                @for (item of actionTracker; track item.label) {
                  <div class="flex min-w-0 flex-col gap-siaf-xs">
                    <span class="text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">{{ item.label }}</span>
                    <strong class="truncate text-sm font-bold text-text">{{ item.user }}</strong>
                    <span class="text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">Fecha</span>
                    <strong class="text-sm font-bold text-text">{{ item.date }} <span class="ml-siaf-md">{{ item.time }}</span></strong>
                  </div>
                }
              </div>
            </section>
          </section>
        </div>
      </section>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdjustmentSeatFormComponent {
  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Inicio', href: '/panel' },
    ...buildAdjustmentSeatBreadcrumbs('Formulario de asiento de ajuste')
  ];

  readonly entityFields: ReadonlyField[] = [
    { label: 'Fecha', value: '19/08/2025     08:00:59' },
    { label: 'Ente rector', value: 'DIRECCION GENERAL DE CONTABILIDAD PUBLICA' },
    { label: 'Entidad/ U.E/ ...', value: 'NOMBRE DE LA ENTIDAD/ U.E/ ...' }
  ];

  readonly documentFields: ReadonlyField[] = [
    { label: 'N documento', value: '0001' },
    { label: 'N doc. contable', value: 'AA-093-2026-01' },
    { label: 'Estado', value: 'Aprobado' }
  ];

  readonly periodFields: ReadonlyField[] = [
    { label: 'Periodo', value: '2026 - 01' },
    { label: 'Fecha de inicio', value: '01/01/2026' },
    { label: 'Fecha fin', value: '31/01/2026' },
    { label: 'Fecha vigencia adicional', value: '10/02/2026' }
  ];

  readonly rows: AccountingRow[] = [
    {
      code: '5.8.0.1.0.5',
      account: 'Estimaciones de cobranza dudosa - cuentas por cobrar',
      movement: 'Debe',
      amount: '50,000'
    },
    {
      code: '1.1.3.1.1.1',
      account: 'Venta de bienes por cobrar',
      movement: 'Haber',
      amount: '50,000'
    }
  ];

  readonly actionTracker = [
    {
      label: 'Elaborado por',
      user: 'RICARDO JOHN DOE BUSTAMANTE',
      date: '19/08/2025',
      time: '08:00:59'
    },
    {
      label: 'Verificado por',
      user: 'RICARDO JOHN DOE BUSTAMANTE',
      date: '19/08/2025',
      time: '08:00:59'
    },
    {
      label: 'Aprobado por',
      user: 'RICARDO JOHN DOE BUSTAMANTE',
      date: '19/08/2025',
      time: '08:00:59'
    }
  ];

  readonly rowsPerPageOptions = [10, 25, 50, 100];
  rowsPerPage = 10;
  page = 1;
  totalItems = 800;

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.rowsPerPage);
  }

  onRowsPerPageChange(value: number): void {
    this.rowsPerPage = value;
    this.page = 1;
  }

}

@Component({
  selector: 'readonly-card',
  standalone: true,
  template: `
    <section class="flex flex-col gap-siaf-lg">
      <h3 class="text-sm font-bold uppercase text-text">{{ label }}</h3>
      <article class="relative rounded-siaf-md border border-border px-siaf-xl py-siaf-xs">
        <span class="absolute left-[-1px] top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-siaf-sm bg-brand-primary"></span>
        <div class="flex min-h-11 flex-col justify-center gap-siaf-xxs">
          <span class="text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">{{ caption }}</span>
          <strong class="text-sm font-bold text-text">{{ value }}</strong>
        </div>
      </article>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReadonlyCardComponent {
  @Input()
  label = '';

  @Input()
  caption = '';

  @Input()
  value = '';
}

@Component({
  selector: 'readonly-line',
  standalone: true,
  template: `
    <section class="flex flex-col gap-siaf-xs">
      @if (label) {
        <h3 class="text-sm font-bold uppercase text-text">{{ label }}</h3>
      }
      <div class="px-siaf-md py-siaf-xs">
        <span class="text-xs font-medium text-text-muted">{{ caption }}</span>
        <p class="mt-siaf-xxs text-sm text-text">{{ value }}</p>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReadonlyLineComponent {
  @Input()
  label = '';

  @Input()
  caption = '';

  @Input()
  value = '';
}
