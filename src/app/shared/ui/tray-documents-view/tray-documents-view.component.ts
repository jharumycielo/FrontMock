import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { CustomFilterApplyEvent, CustomFilterComponent, FilterRow } from '../../components/custom-filter/custom-filter.component';
import { FlowStatusTagComponent } from '../flow-status-tag/flow-status-tag.component';
import { IconComponent } from '../icon/icon.component';
import { PaginationComponent } from '../pagination/pagination.component';

type TrayDocumentRow = {
  document: string;
  number: string;
  actionType: string;
  status: TrayDocumentStatus;
  system: string;
  date: string;
  institutionalScope: string;
  entity: string;
};

type TrayDocumentStatus = 'Elaborado' | 'Verificado' | 'Eliminado' | 'Aprobado' | 'Observado' | 'Rechazado';
type TrayTitle = 'Recibidos' | 'Enviados' | 'Borradores' | 'Papelera' | string;

type AppliedCustomFilter = {
  id: string;
  campo: keyof TrayDocumentRow;
  campoLabel: string;
  condicion: string;
  valor: string;
};

@Component({
  selector: 'siaf-tray-documents-view',
  standalone: true,
  imports: [CustomFilterComponent, FlowStatusTagComponent, IconComponent, PaginationComponent],
  template: `
    <section class="min-h-[calc(100vh-56px)] bg-[var(--sys-color-bg-surfaces-surface-lowest,rgba(32,32,32,0.04))]">
      <section class="bg-surface">
        <nav class="flex h-10 items-center gap-siaf-xxs px-siaf-md py-siaf-xxs text-xs" aria-label="Breadcrumb">
          <button class="inline-flex size-8 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted" type="button" aria-label="Inicio">
            <siaf-icon name="home" [size]="20" />
          </button>
          <siaf-icon class="text-text-muted" name="keyboard_arrow_right" [size]="12" />
          <span class="font-medium text-[var(--sys-color-text-neutral-medium)]">Bandeja de Documentos</span>
          <siaf-icon class="text-text-muted" name="keyboard_arrow_right" [size]="12" />
          <span class="font-normal text-[var(--sys-color-text-neutral-low)]">{{ title }}</span>
        </nav>

        <header class="flex min-h-[73px] items-start border-b border-[var(--sys-color-divider-default,rgba(32,32,32,0.12))] px-siaf-lg py-siaf-md">
          <h1 class="m-0 min-h-6 max-w-[448px] truncate text-base font-bold uppercase leading-normal tracking-[0.02px] text-text">
            {{ title }}
          </h1>
        </header>
      </section>

      <section class="relative p-siaf-md">
        <article class="min-h-[808px] overflow-hidden rounded-siaf-md bg-surface">
          <header class="flex min-h-14 items-center px-siaf-lg pt-siaf-md">
            <h2 class="m-0 text-base font-bold uppercase leading-normal tracking-[0.02px] text-text">Lista de documentos</h2>
          </header>

          <div class="flex flex-col gap-siaf-lg px-siaf-lg pb-siaf-lg pt-siaf-md">
            <div class="flex flex-col gap-siaf-md lg:flex-row lg:items-start">
              <label class="flex h-10 min-w-0 flex-1 items-center gap-siaf-xs rounded-siaf-md border border-[var(--sys-color-border-states-enabled,rgba(32,32,32,0.4))] bg-surface px-siaf-md">
                <siaf-icon class="shrink-0 text-text-muted" name="search" [size]="24" />
                <span class="sr-only">Buscar</span>
                <input class="min-w-0 flex-1 bg-transparent text-sm leading-normal tracking-[0.025px] outline-none placeholder:text-text-muted" placeholder="Buscar" />
              </label>

              <div class="flex shrink-0 items-center justify-end gap-siaf-xs">
                <div class="relative">
                  <button
                    class="inline-flex size-10 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[rgba(32,32,32,0.12)]"
                    type="button"
                    aria-label="Campos"
                    [class.bg-surface-muted]="fieldsMenuOpen"
                    (click)="toggleFieldsMenu()"
                  >
                    <siaf-icon name="layers" [size]="24" />
                  </button>

                  @if (fieldsMenuOpen) {
                    <button class="fixed inset-0 z-20 cursor-default bg-transparent" type="button" aria-label="Cerrar campos" (click)="closeFieldsMenu()"></button>
                    <div class="absolute right-0 top-12 z-30 w-[248px] overflow-hidden rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-highest,white)] py-siaf-xs shadow-[0_8px_10px_rgba(0,0,0,0.14),0_3px_14px_rgba(0,0,0,0.12),0_5px_5px_rgba(0,0,0,0.2)]" (click)="$event.stopPropagation()">
                      @for (option of fieldsMenuOptions; track option.label) {
                        <button class="flex min-h-8 w-full items-center gap-siaf-md px-siaf-md py-siaf-xxs text-left text-sm text-[var(--sys-color-text-neutral-medium)] transition hover:bg-[var(--sys-color-bg-states-light-hover,rgba(32,32,32,0.04))]" type="button" (click)="selectFieldsMenuOption(option.label)">
                          <span class="min-w-0 flex-1">{{ option.label }}</span>
                          @if (option.hasChildren) {
                            <siaf-icon name="chevron_right" [size]="24" />
                          }
                        </button>
                      }
                    </div>
                  }
                </div>

                <div class="relative">
                  <button
                    class="inline-flex size-10 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[rgba(32,32,32,0.12)]"
                    type="button"
                    aria-label="Favorito"
                    [class.bg-surface-muted]="favoriteMenuOpen"
                    (click)="toggleFavoriteMenu()"
                  >
                    <siaf-icon name="star_border" [size]="24" />
                  </button>

                  @if (favoriteMenuOpen) {
                    <button class="fixed inset-0 z-20 cursor-default bg-transparent" type="button" aria-label="Cerrar favoritos" (click)="closeFavoriteMenu()"></button>
                    <div class="absolute right-0 top-12 z-30 w-[248px] overflow-hidden rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-highest,white)] py-siaf-xs shadow-[0_8px_10px_rgba(0,0,0,0.14),0_3px_14px_rgba(0,0,0,0.12),0_5px_5px_rgba(0,0,0,0.2)]" (click)="$event.stopPropagation()">
                      <button class="flex min-h-8 w-full items-center px-siaf-md py-siaf-xxs text-left text-sm text-[var(--sys-color-text-neutral-medium)] transition hover:bg-[var(--sys-color-bg-states-light-hover,rgba(32,32,32,0.04))]" type="button" (click)="selectFavoriteOption('observed')">
                        Solicitudes observadas
                      </button>
                      <div class="h-px w-full bg-[var(--sys-color-divider-default,rgba(32,32,32,0.12))]"></div>
                      <button class="flex min-h-8 w-full items-center px-siaf-md py-siaf-xxs text-left text-sm text-[var(--sys-color-text-neutral-medium)] transition hover:bg-[var(--sys-color-bg-states-light-hover,rgba(32,32,32,0.04))]" type="button" (click)="selectFavoriteOption('save-search')">
                        Guardar b&uacute;squeda actual
                      </button>
                    </div>
                  }
                </div>

                <button class="inline-flex size-10 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[rgba(32,32,32,0.12)]" type="button" aria-label="Mas opciones">
                  <siaf-icon name="more_vert" [size]="24" />
                </button>
              </div>
            </div>

            <div class="flex min-h-8 flex-wrap items-center gap-siaf-xs">
              <div class="relative">
                @if (selectedStatusFilter) {
                  <button class="inline-flex h-8 items-center gap-siaf-xs overflow-hidden rounded-siaf-md border border-[var(--sys-color-border-states-active)] bg-[var(--sys-color-bg-states-light-selected,rgba(1,72,153,0.08))] px-siaf-xs py-siaf-xxs text-sm leading-normal tracking-[0.025px] text-[var(--sys-color-text-neutral-activated)] transition hover:bg-[var(--sys-color-bg-states-light-hover,rgba(32,32,32,0.04))]" type="button" (click)="toggleStatusFilterMenu()">
                    <siaf-icon name="check" [size]="20" />
                    Estado: {{ selectedStatusFilter }}
                    <span class="inline-flex size-5 items-center justify-center rounded-siaf-sm" role="button" tabindex="0" aria-label="Quitar filtro de estado" (click)="clearStatusFilter($event)" (keydown.enter)="clearStatusFilter($event)" (keydown.space)="clearStatusFilter($event)">
                      <siaf-icon name="close" [size]="20" />
                    </span>
                  </button>
                } @else {
                  <button class="inline-flex h-8 items-center gap-siaf-xs rounded-siaf-md border border-[var(--sys-color-border-states-enabled,rgba(32,32,32,0.4))] bg-surface px-siaf-sm text-sm leading-normal tracking-[0.025px] text-text transition hover:bg-surface-muted" type="button" [class.bg-surface-muted]="statusFilterMenuOpen" (click)="toggleStatusFilterMenu()">
                    Estado
                    <siaf-icon [name]="statusFilterMenuOpen ? 'expand_less' : 'expand_more'" [size]="20" />
                  </button>
                }

                @if (statusFilterMenuOpen) {
                  <button class="fixed inset-0 z-20 cursor-default bg-transparent" type="button" aria-label="Cerrar estados" (click)="closeStatusFilterMenu()"></button>
                  <div class="absolute left-0 top-10 z-30 w-[220px] overflow-hidden rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-highest,white)] py-siaf-xs shadow-[0_8px_10px_rgba(0,0,0,0.14),0_3px_14px_rgba(0,0,0,0.12),0_5px_5px_rgba(0,0,0,0.2)]" (click)="$event.stopPropagation()">
                    @for (option of statusFilterOptions; track option) {
                      <button class="flex min-h-8 w-full items-center px-siaf-md py-siaf-xxs text-left text-sm text-[var(--sys-color-text-neutral-medium)] transition hover:bg-[var(--sys-color-bg-states-light-hover,rgba(32,32,32,0.04))]" type="button" (click)="selectStatusFilter(option)">
                        {{ option }}
                      </button>
                    }
                  </div>
                }
              </div>

              <div class="relative">
                @if (selectedActionTypeFilter) {
                  <button class="inline-flex h-8 items-center gap-siaf-xs overflow-hidden rounded-siaf-md border border-[var(--sys-color-border-states-active)] bg-[var(--sys-color-bg-states-light-selected,rgba(1,72,153,0.08))] px-siaf-xs py-siaf-xxs text-sm leading-normal tracking-[0.025px] text-[var(--sys-color-text-neutral-activated)] transition hover:bg-[var(--sys-color-bg-states-light-hover,rgba(32,32,32,0.04))]" type="button" (click)="toggleActionTypeFilterMenu()">
                    <siaf-icon name="check" [size]="20" />
                    Tipo de acci&oacute;n: {{ selectedActionTypeFilter }}
                    <span class="inline-flex size-5 items-center justify-center rounded-siaf-sm" role="button" tabindex="0" aria-label="Quitar filtro de tipo de accion" (click)="clearActionTypeFilter($event)" (keydown.enter)="clearActionTypeFilter($event)" (keydown.space)="clearActionTypeFilter($event)">
                      <siaf-icon name="close" [size]="20" />
                    </span>
                  </button>
                } @else {
                  <button class="inline-flex h-8 items-center gap-siaf-xs rounded-siaf-md border border-[var(--sys-color-border-states-enabled,rgba(32,32,32,0.4))] bg-surface px-siaf-sm text-sm leading-normal tracking-[0.025px] text-text transition hover:bg-surface-muted" type="button" [class.bg-surface-muted]="actionTypeFilterMenuOpen" (click)="toggleActionTypeFilterMenu()">
                    Tipo de acci&oacute;n
                    <siaf-icon [name]="actionTypeFilterMenuOpen ? 'expand_less' : 'expand_more'" [size]="20" />
                  </button>
                }

                @if (actionTypeFilterMenuOpen) {
                  <button class="fixed inset-0 z-20 cursor-default bg-transparent" type="button" aria-label="Cerrar tipos de accion" (click)="closeActionTypeFilterMenu()"></button>
                  <div class="absolute left-0 top-10 z-30 w-[220px] overflow-hidden rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-highest,white)] py-siaf-xs shadow-[0_8px_10px_rgba(0,0,0,0.14),0_3px_14px_rgba(0,0,0,0.12),0_5px_5px_rgba(0,0,0,0.2)]" (click)="$event.stopPropagation()">
                    @for (option of actionTypeFilterOptions; track option) {
                      <button class="flex min-h-8 w-full items-center px-siaf-md py-siaf-xxs text-left text-sm text-[var(--sys-color-text-neutral-medium)] transition hover:bg-[var(--sys-color-bg-states-light-hover,rgba(32,32,32,0.04))]" type="button" (click)="selectActionTypeFilter(option)">
                        {{ option }}
                      </button>
                    }
                  </div>
                }
              </div>

              @for (filter of appliedCustomFilters; track filter.id) {
                <button class="inline-flex h-8 items-center gap-siaf-xs overflow-hidden rounded-siaf-md border border-[var(--sys-color-border-states-active)] bg-[var(--sys-color-bg-states-light-selected,rgba(1,72,153,0.08))] px-siaf-xs py-siaf-xxs text-sm leading-normal tracking-[0.025px] text-[var(--sys-color-text-neutral-activated)] transition hover:bg-[var(--sys-color-bg-states-light-hover,rgba(32,32,32,0.04))]" type="button" aria-label="Filtro personalizado aplicado" (click)="editCustomAppliedFilter(filter)">
                  <siaf-icon name="bolt" [size]="20" />
                  {{ filter.campoLabel }}: {{ filter.valor }}
                  <span class="inline-flex size-5 items-center justify-center rounded-siaf-sm" role="button" tabindex="0" aria-label="Quitar filtro personalizado" (click)="clearCustomAppliedFilter(filter.id, $event)" (keydown.enter)="clearCustomAppliedFilter(filter.id, $event)" (keydown.space)="clearCustomAppliedFilter(filter.id, $event)">
                    <siaf-icon name="close" [size]="20" />
                  </span>
                </button>
              }

              <button class="inline-flex size-8 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[rgba(32,32,32,0.12)]" type="button" aria-label="Agregar filtro personalizado" [class.bg-surface-muted]="customFilterOpen" (click)="openCustomFilterForCreate()">
                <siaf-icon name="add" [size]="20" />
              </button>
            </div>

            <div class="flex min-h-10 items-center justify-between gap-siaf-md">
              <label class="inline-flex h-10 items-center gap-siaf-xs px-siaf-xxs">
                <input class="size-4 accent-brand-primary" type="checkbox" />
              </label>
              <div class="ml-auto flex h-10 items-center gap-siaf-md text-xs text-text-muted">
                <span>1-{{ filteredRows.length }} de {{ filteredRows.length }}</span>
                <button class="inline-flex size-10 items-center justify-center rounded-siaf-md text-text-muted transition hover:bg-surface-muted" type="button" aria-label="Anterior">
                  <siaf-icon name="chevron_left" [size]="24" />
                </button>
                <button class="inline-flex size-10 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted" type="button" aria-label="Siguiente">
                  <siaf-icon name="chevron_right" [size]="24" />
                </button>
              </div>
            </div>

            <div class="min-w-0 overflow-x-auto">
              <table class="w-full min-w-[1216px] border-collapse text-left text-sm">
                <thead>
                  <tr class="h-10 bg-[rgba(32,32,32,0.12)] text-xs font-bold uppercase text-text">
                    <th class="w-12 rounded-l-siaf-sm px-siaf-sm py-siaf-sm"></th>
                    <th class="w-[260px] px-siaf-md py-siaf-sm">Documento</th>
                    <th class="w-[90px] px-siaf-md py-siaf-sm">N&uacute;mero</th>
                    <th class="w-[140px] px-siaf-md py-siaf-sm">Tipo de acci&oacute;n</th>
                    <th class="w-[120px] px-siaf-md py-siaf-sm">Estado</th>
                    <th class="w-[200px] px-siaf-md py-siaf-sm">Sistema</th>
                    <th class="w-[120px] px-siaf-md py-siaf-sm">Fecha de re...</th>
                    <th class="w-[131px] px-siaf-md py-siaf-sm">ID Entidad</th>
                    <th class="w-[286px] px-siaf-md py-siaf-sm">Entidad</th>
                    <th class="sticky right-0 w-14 rounded-r-siaf-sm bg-[rgba(32,32,32,0.12)] px-siaf-sm py-siaf-sm"></th>
                  </tr>
                </thead>
                <tbody>
                  @for (row of filteredRows; track row.document + row.number) {
                    <tr class="h-[58px] border-b border-[var(--sys-color-divider-default,rgba(32,32,32,0.12))] bg-surface text-[var(--sys-color-text-neutral-medium)] hover:bg-[rgba(1,72,153,0.04)]">
                      <td class="px-siaf-sm py-siaf-sm"><input class="size-4 accent-brand-primary" type="checkbox" /></td>
                      <td class="px-siaf-md py-siaf-sm" [class.font-bold]="$index === 0">{{ row.document }}</td>
                      <td class="px-siaf-md py-siaf-sm" [class.font-bold]="$index === 0">{{ row.number }}</td>
                      <td class="px-siaf-md py-siaf-sm" [class.font-bold]="$index === 0">{{ row.actionType }}</td>
                      <td class="px-siaf-md py-siaf-sm">
                        <siaf-flow-status-tag [status]="row.status" size="standard" />
                      </td>
                      <td class="px-siaf-md py-siaf-sm" [class.font-bold]="$index === 0">{{ row.system }}</td>
                      <td class="px-siaf-md py-siaf-sm" [class.font-bold]="$index === 0">{{ row.date }}</td>
                      <td class="px-siaf-md py-siaf-sm" [class.font-bold]="$index === 0">{{ row.institutionalScope }}</td>
                      <td class="px-siaf-md py-siaf-sm" [class.font-bold]="$index === 0">{{ row.entity }}</td>
                      <td class="sticky right-0 bg-surface px-siaf-sm py-siaf-xs shadow-[-4px_0_8px_rgba(0,0,0,0.08)]">
                        <button class="inline-flex size-8 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[rgba(32,32,32,0.12)]" type="button" aria-label="Historial">
                          <siaf-icon name="history" [size]="20" />
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <siaf-pagination
              navigation="Activate"
              position="Bottom"
              [rowPage]="true"
              [page]="page"
              [pageSize]="rowsPerPage"
              [totalItems]="filteredRows.length"
              [totalPages]="1"
              [rowsPerPage]="rowsPerPage"
              [rowsPerPageOptions]="rowsPerPageOptions"
              (rowsPerPageChange)="onRowsPerPageChange($event)"
            />
          </div>
        </article>

        @if (customFilterOpen) {
          <button class="fixed inset-0 z-20 cursor-default bg-transparent" type="button" aria-label="Cerrar filtros" (click)="closeCustomFilter()"></button>
          <div class="absolute left-[40px] top-[188px] z-30 w-[936px] max-w-[calc(100%-80px)]" (click)="$event.stopPropagation()">
            <siaf-custom-filter
              [campoOptions]="filterCampoOptions"
              [condicionOptions]="filterCondicionOptions"
              [valorOptions]="filterValorOptions"
              [initialRows]="customFilterInitialRows"
              [deleteEnabled]="!!editingCustomFilterId"
              (aplicar)="onCustomFilterApply($event)"
              (cancelar)="closeCustomFilter()"
              (eliminar)="deleteEditingCustomFilter()"
            />
          </div>
        }
      </section>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrayDocumentsViewComponent {
  @Input() title = 'Borradores';

  customFilterOpen = false;
  fieldsMenuOpen = false;
  favoriteMenuOpen = false;
  statusFilterMenuOpen = false;
  selectedStatusFilter = '';
  actionTypeFilterMenuOpen = false;
  selectedActionTypeFilter = '';
  appliedCustomFilters: AppliedCustomFilter[] = [];
  customFilterInitialRows: FilterRow[] = [];
  editingCustomFilterId = '';
  private customFilterSequence = 0;

  readonly rowsPerPageOptions = [10, 25, 50, 100];
  rowsPerPage = 25;
  page = 1;

  readonly filterCampoOptions = [
    { label: 'Documento', value: 'document' },
    { label: 'Numero', value: 'number' },
    { label: 'Tipo de accion', value: 'actionType' },
    { label: 'Estado', value: 'status' },
    { label: 'Sistema', value: 'system' },
    { label: 'Fecha', value: 'date' },
    { label: 'ID Entidad', value: 'institutionalScope' },
    { label: 'Entidad', value: 'entity' }
  ];

  readonly filterCondicionOptions = [
    { label: 'Es igual a', value: 'eq' },
    { label: 'No es igual a', value: 'neq' },
    { label: 'Contiene', value: 'contains' },
    { label: 'No contiene', value: 'not_contains' },
    { label: 'Empieza con', value: 'starts_with' },
    { label: 'Termina con', value: 'ends_with' }
  ];

  readonly filterValorOptions = [
    { label: 'Elaborado', value: 'Elaborado' },
    { label: 'Verificado', value: 'Verificado' },
    { label: 'Eliminado', value: 'Eliminado' },
    { label: 'Aprobado', value: 'Aprobado' },
    { label: 'Observado', value: 'Observado' },
    { label: 'Rechazado', value: 'Rechazado' },
    { label: 'Creacion', value: 'Creacion' },
    { label: 'Solicitud de notificacion', value: 'Solicitud de notificacion' },
    { label: 'Sistema Nacional de Contabilidad', value: 'Sistema Nacional de Contabilidad' },
    { label: '1. Institucional', value: '1. Institucional' }
  ];

  readonly fieldsMenuOptions = [
    { label: 'Documento' },
    { label: 'Tipo de accion' },
    { label: 'Estado' },
    { label: 'Sistema' },
    { label: 'Fecha de registro', hasChildren: true },
    { label: 'Entidad' }
  ];

  readonly statusFilterOptions: TrayDocumentStatus[] = ['Elaborado', 'Verificado', 'Eliminado', 'Aprobado', 'Observado', 'Rechazado'];
  readonly actionTypeFilterOptions = ['Creacion'];

  readonly rows: TrayDocumentRow[] = [
    { document: 'Solicitud de notificacion', number: '0001', actionType: 'Creacion', status: 'Elaborado', system: 'Sistema Nacional de Contabilidad', date: '29/09/2025', institutionalScope: '1. Institucional', entity: '009 - Ministerio de Economia y Finanzas' },
    { document: 'Solicitud de registro de bonos', number: '0006', actionType: 'Creacion', status: 'Elaborado', system: 'Sistema Nacional de Contabilidad', date: '24/09/2025', institutionalScope: '1. Institucional', entity: '009 - Ministerio de Economia y Finanzas' },
    { document: 'Solicitud de registro de estructura', number: '0005', actionType: 'Creacion', status: 'Elaborado', system: 'Sistema Nacional de Contabilidad', date: '31/08/2025', institutionalScope: '1. Institucional', entity: '009 - Ministerio de Economia y Finanzas' },
    { document: 'Solicitud de registro de prestamo', number: '0004', actionType: 'Creacion', status: 'Elaborado', system: 'Sistema Nacional de Contabilidad', date: '15/06/2024', institutionalScope: '1. Institucional', entity: '009 - Ministerio de Economia y Finanzas' },
    { document: 'Solicitud de creacion de colocacion', number: '0003', actionType: 'Creacion', status: 'Elaborado', system: 'Sistema Nacional de Contabilidad', date: '20/01/2024', institutionalScope: '1. Institucional', entity: '009 - Ministerio de Economia y Finanzas' },
    { document: 'Solicitud de mes base', number: '0002', actionType: 'Creacion', status: 'Elaborado', system: 'Sistema Nacional de Contabilidad', date: '15/12/2023', institutionalScope: '1. Institucional', entity: '009 - Ministerio de Economia y Finanzas' },
    { document: 'Solicitud de anio base', number: '0001', actionType: 'Creacion', status: 'Elaborado', system: 'Sistema Nacional de Contabilidad', date: '20/11/2023', institutionalScope: '1. Institucional', entity: '009 - Ministerio de Economia y Finanzas' }
  ];

  get filteredRows(): TrayDocumentRow[] {
    return this.rowsForCurrentTray.filter((row) => {
      const matchesStatus = !this.selectedStatusFilter || row.status === this.selectedStatusFilter;
      const matchesActionType = !this.selectedActionTypeFilter || row.actionType === this.selectedActionTypeFilter;
      const matchesCustomFilters = this.appliedCustomFilters.every((filter) => this.matchesCustomFilter(row, filter));

      return matchesStatus && matchesActionType && matchesCustomFilters;
    });
  }

  get rowsForCurrentTray(): TrayDocumentRow[] {
    // La maqueta usa las mismas filas base y cambia el estado segun la bandeja seleccionada.
    return this.rows.map((row, index) => ({
      ...row,
      status: this.statusForTray(this.title, index)
    }));
  }

  statusForTray(title: TrayTitle, rowIndex = 0): TrayDocumentStatus {
    if (title === 'Recibidos') {
      // Recibidos debe mostrar los tres estados finales disponibles.
      const receivedStatuses: TrayDocumentStatus[] = ['Aprobado', 'Observado', 'Rechazado'];
      return receivedStatuses[rowIndex % receivedStatuses.length];
    }

    // Estados fijos solicitados para cada bandeja.
    const statuses: Record<string, TrayDocumentStatus> = {
      Enviados: 'Verificado',
      Borradores: 'Elaborado',
      Papelera: 'Eliminado'
    };

    return statuses[title] || 'Elaborado';
  }

  toggleFieldsMenu(): void {
    this.closeInlineMenus();
    this.fieldsMenuOpen = !this.fieldsMenuOpen;
  }

  closeFieldsMenu(): void {
    this.fieldsMenuOpen = false;
  }

  selectFieldsMenuOption(option: string): void {
    void option;
    this.closeFieldsMenu();
  }

  toggleFavoriteMenu(): void {
    this.closeInlineMenus();
    this.favoriteMenuOpen = !this.favoriteMenuOpen;
  }

  closeFavoriteMenu(): void {
    this.favoriteMenuOpen = false;
  }

  selectFavoriteOption(option: 'observed' | 'save-search'): void {
    void option;
    this.closeFavoriteMenu();
  }

  toggleStatusFilterMenu(): void {
    this.closeInlineMenus();
    this.statusFilterMenuOpen = !this.statusFilterMenuOpen;
  }

  closeStatusFilterMenu(): void {
    this.statusFilterMenuOpen = false;
  }

  selectStatusFilter(status: TrayDocumentRow['status']): void {
    this.selectedStatusFilter = status;
    this.page = 1;
    this.closeStatusFilterMenu();
  }

  clearStatusFilter(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.selectedStatusFilter = '';
    this.page = 1;
    this.closeStatusFilterMenu();
  }

  toggleActionTypeFilterMenu(): void {
    this.closeInlineMenus();
    this.actionTypeFilterMenuOpen = !this.actionTypeFilterMenuOpen;
  }

  closeActionTypeFilterMenu(): void {
    this.actionTypeFilterMenuOpen = false;
  }

  selectActionTypeFilter(actionType: string): void {
    this.selectedActionTypeFilter = actionType;
    this.page = 1;
    this.closeActionTypeFilterMenu();
  }

  clearActionTypeFilter(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.selectedActionTypeFilter = '';
    this.page = 1;
    this.closeActionTypeFilterMenu();
  }

  openCustomFilterForCreate(): void {
    this.closeInlineMenus();
    this.editingCustomFilterId = '';
    this.customFilterInitialRows = [];
    this.customFilterOpen = true;
  }

  editCustomAppliedFilter(filter: AppliedCustomFilter): void {
    this.closeInlineMenus();
    this.editingCustomFilterId = filter.id;
    this.customFilterInitialRows = [{ campo: filter.campo, condicion: filter.condicion, valor: filter.valor }];
    this.customFilterOpen = true;
  }

  closeCustomFilter(): void {
    this.customFilterOpen = false;
    this.editingCustomFilterId = '';
    this.customFilterInitialRows = [];
  }

  onCustomFilterApply(event: CustomFilterApplyEvent): void {
    const nextFilters = event.filters.map((filter, index) => ({
      id: this.editingCustomFilterId && index === 0 ? this.editingCustomFilterId : this.createCustomFilterId(),
      campo: filter.campo as keyof TrayDocumentRow,
      campoLabel: this.getFilterCampoLabel(filter.campo),
      condicion: filter.condicion,
      valor: filter.valor
    }));

    if (this.editingCustomFilterId) {
      const updatedFilters = this.appliedCustomFilters.map((filter) =>
        filter.id === this.editingCustomFilterId ? nextFilters[0] : filter
      );
      this.appliedCustomFilters = [...updatedFilters, ...nextFilters.slice(1)];
    } else {
      this.appliedCustomFilters = [...this.appliedCustomFilters, ...nextFilters];
    }

    this.page = 1;
    this.closeCustomFilter();
  }

  clearCustomAppliedFilter(id: string, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.appliedCustomFilters = this.appliedCustomFilters.filter((filter) => filter.id !== id);
    this.page = 1;
  }

  deleteEditingCustomFilter(): void {
    if (!this.editingCustomFilterId) {
      return;
    }

    this.appliedCustomFilters = this.appliedCustomFilters.filter((filter) => filter.id !== this.editingCustomFilterId);
    this.page = 1;
    this.closeCustomFilter();
  }

  onRowsPerPageChange(value: number): void {
    this.rowsPerPage = value;
    this.page = 1;
  }

  private closeInlineMenus(): void {
    this.customFilterOpen = false;
    this.fieldsMenuOpen = false;
    this.favoriteMenuOpen = false;
    this.statusFilterMenuOpen = false;
    this.actionTypeFilterMenuOpen = false;
  }

  private getFilterCampoLabel(campo: string): string {
    return this.filterCampoOptions.find((option) => option.value === campo)?.label ?? campo;
  }

  private createCustomFilterId(): string {
    this.customFilterSequence += 1;
    return `tray-custom-filter-${this.customFilterSequence}`;
  }

  private matchesCustomFilter(row: TrayDocumentRow, filter: AppliedCustomFilter): boolean {
    const rowValue = this.normalize(String(row[filter.campo] ?? ''));
    const filterValue = this.normalize(filter.valor);

    if (filter.condicion === 'neq') {
      return rowValue !== filterValue;
    }

    if (filter.condicion === 'contains') {
      return rowValue.includes(filterValue);
    }

    if (filter.condicion === 'not_contains') {
      return !rowValue.includes(filterValue);
    }

    if (filter.condicion === 'starts_with') {
      return rowValue.startsWith(filterValue);
    }

    if (filter.condicion === 'ends_with') {
      return rowValue.endsWith(filterValue);
    }

    return rowValue === filterValue;
  }

  private normalize(value: string): string {
    return value.toLocaleLowerCase();
  }
}
