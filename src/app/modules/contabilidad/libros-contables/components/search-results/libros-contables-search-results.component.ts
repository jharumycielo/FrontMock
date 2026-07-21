import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';

import { CurrentUserService } from '../../../../../core/auth/current-user.service';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { TagComponent } from '../../../../../shared/ui/tag/tag.component';
import {
  LIBROS_CONTABLES_ANIO_OPTIONS,
  LIBROS_CONTABLES_ENTIDAD_PLIEGO_OPTIONS,
  LIBROS_CONTABLES_MAYOR_RESULT_GROUPS,
  LIBROS_CONTABLES_MES_OPTIONS,
  LIBROS_CONTABLES_PLIEGO_DIARIO_ROWS,
  LIBROS_CONTABLES_PLIEGO_MAYOR_GROUPS,
  LIBROS_CONTABLES_PLIEGO_VAN_DEBE,
  LIBROS_CONTABLES_PLIEGO_VAN_HABER,
  LIBROS_CONTABLES_PLIEGO_VIENEN_DEBE,
  LIBROS_CONTABLES_PLIEGO_VIENEN_HABER,
  LIBROS_CONTABLES_RESULT_ENTITY,
  LIBROS_CONTABLES_RESULT_GROUPS,
  LIBROS_CONTABLES_RESULT_TOTAL_DEBE,
  LIBROS_CONTABLES_RESULT_TOTAL_HABER,
  LIBROS_CONTABLES_RESULT_VIENEN_DEBE,
  LIBROS_CONTABLES_RESULT_VIENEN_HABER,
  LIBROS_CONTABLES_SCOPE_OPTIONS,
  LIBROS_CONTABLES_TIPO_OPTIONS,
  LibroContableAccountRow,
} from '../../../config/accounting-books.mock';
import { LibrosContablesSearchCriteria } from '../search-panel/libros-contables-search-panel.component';
import { computeAmountSlots } from '../../utils/libros-contables-amount-slots';
import { generateLibrosContablesMayorPdfReport, generateLibrosContablesPdfReport, generateLibrosContablesPliegoDiarioPdfReport, generateLibrosContablesPliegoMayorPdfReport } from '../../utils/libros-contables-pdf-report';
import {
  ExportMatrix,
  buildLibroDiarioMatrix,
  buildLibroMayorMatrix,
  buildLibroPliegoDiarioMatrix,
  buildLibroPliegoMayorMatrix,
  downloadCsv,
  downloadExcel,
} from '../../utils/libros-contables-export';

type ReportFormat = 'pdf' | 'excel' | 'csv';

type DisplayRow =
  | { type: 'group'; groupId: string; codCuenta: string; fecha: string; documento: string }
  | { type: 'account'; groupId: string; account: LibroContableAccountRow };

@Component({
  selector: 'siaf-libros-contables-search-results',
  standalone: true,
  imports: [ButtonComponent, IconComponent, NgClass, PaginationComponent, TagComponent],
  template: `
    <div class="flex flex-col gap-siaf-md">
      <div class="flex flex-wrap items-center justify-between gap-siaf-md rounded-siaf-md bg-surface px-siaf-md py-siaf-sm shadow-siaf-elevation-1">
        <div class="flex flex-col gap-siaf-xs">
          <p class="m-0 text-[10px] font-bold uppercase tracking-[0.66px] text-text-muted">Filtros aplicados de búsqueda</p>
          <div class="flex flex-wrap items-center gap-siaf-xs">
            @for (chip of filterChips(); track chip) {
              <siaf-tag tone="info">{{ chip }}</siaf-tag>
            }
          </div>
        </div>
        <siaf-button variant="secondary" size="sm" icon="delete" (click)="quitarFiltros.emit()">Quitar filtros</siaf-button>
      </div>

      <div class="flex flex-col gap-siaf-md rounded-siaf-md bg-surface p-siaf-md shadow-siaf-elevation-1">
        <div class="flex items-center justify-between gap-siaf-md">
          <h2 class="m-0 text-sm font-bold uppercase leading-normal text-text">Resultado de la búsqueda</h2>
          <div class="relative" (click)="$event.stopPropagation()">
            <siaf-button variant="accent" size="md" icon="file_download" [iconOnly]="true" ariaLabel="Descargar reporte" (click)="toggleExportMenu()" />
            @if (exportMenuOpen()) {
              <div class="absolute right-0 top-[calc(100%+8px)] z-40 flex w-[150px] flex-col gap-siaf-xxs overflow-hidden rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-highest)] p-siaf-xs shadow-siaf-lg" role="menu" aria-label="Formato de descarga">
                @for (opcion of exportOpciones; track opcion.format) {
                  <button
                    class="flex min-h-10 w-full items-center gap-siaf-md rounded-siaf-md px-siaf-sm text-left text-sm transition"
                    type="button"
                    role="menuitemradio"
                    [attr.aria-checked]="selectedFormat() === opcion.format"
                    [ngClass]="selectedFormat() === opcion.format ? 'bg-[var(--sys-color-bg-states-light-selected)]' : 'hover:bg-[var(--sys-color-bg-states-light-hover)]'"
                    (click)="descargarReporte(opcion.format)"
                  >
                    <siaf-icon
                      class="shrink-0"
                      [ngClass]="selectedFormat() === opcion.format ? 'text-[var(--sys-color-text-neutral-activated)]' : 'text-[var(--sys-color-icon-states-enabled)]'"
                      [name]="opcion.icon"
                      [size]="20"
                    />
                    <span
                      class="flex-1 truncate uppercase"
                      [ngClass]="selectedFormat() === opcion.format ? 'font-bold text-[var(--sys-color-text-neutral-activated)]' : 'text-[var(--sys-color-text-neutral-medium)]'"
                    >{{ opcion.label }}</span>
                  </button>
                }
              </div>
            }
          </div>
        </div>

        <div class="grid gap-siaf-md">
          <h3 class="m-0 text-sm font-bold uppercase leading-normal text-text">{{ bookTitle() }}</h3>

          <div class="grid gap-siaf-md sm:grid-cols-2">
            <div class="grid gap-siaf-xxs">
              <span class="text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">Entidad</span>
              <span class="text-sm text-text">{{ entity.entidad }}</span>
            </div>
            <div class="grid gap-siaf-xxs">
              <span class="text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">Sector</span>
              <span class="text-sm text-text">{{ entity.sector }}</span>
            </div>
          </div>
        </div>

        <div class="grid gap-siaf-md border-t border-[var(--sys-color-divider-default)] pt-siaf-md">
          <h3 class="m-0 text-sm font-bold uppercase leading-normal text-text">Cuenta contable</h3>

          <div class="flex flex-col gap-siaf-sm lg:flex-row lg:items-center">
            <label class="flex h-10 min-w-0 flex-1 items-center rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface px-siaf-md">
              <span class="sr-only">Buscar</span>
              <input class="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-text-muted" placeholder="Buscar" [value]="searchTerm()" (input)="onSearchChange(inputValue($event))" />
            </label>
            <button class="inline-flex size-10 shrink-0 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted" type="button" aria-label="Más opciones" (click)="onMoreOptions()">
              <siaf-icon name="more_vert" [size]="24" />
            </button>
          </div>

          <div class="flex flex-wrap items-center gap-siaf-xs">
            <button class="inline-flex h-8 items-center gap-siaf-xs rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] px-siaf-sm text-sm text-text-muted" type="button">
              Label
              <siaf-icon name="expand_more" [size]="18" />
            </button>
            <button class="inline-flex h-8 items-center gap-siaf-xs rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] px-siaf-sm text-sm text-text-muted" type="button">
              Label
              <siaf-icon name="expand_more" [size]="18" />
            </button>
            <button class="inline-flex size-8 items-center justify-center rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] text-text-muted" type="button" aria-label="Agregar filtro">
              <siaf-icon name="add" [size]="18" />
            </button>
          </div>

          <div class="flex items-center justify-between gap-siaf-md">
            <label class="inline-flex items-center gap-siaf-xs">
              <input class="size-4 border-border text-brand-primary focus:ring-brand-primary" type="checkbox" aria-label="Seleccionar todo" [checked]="allSelected()" (change)="toggleSelectAll()" />
            </label>
            <siaf-pagination navigation="Activate" position="Top" [page]="groupsPage()" [pageSize]="groupsPageSize()" [totalItems]="isPliegoDiario() ? pliegoDiarioRows().length : isPliegoMayor() ? pliegoMayorTotalRows() : isMayor() ? mayorTotalRows() : filteredGroups().length" [totalPages]="1" (previous)="previousGroupsPage()" (next)="nextGroupsPage()" />
          </div>

          @if (isPliegoDiario()) {
          <div class="siaf-table-shell">
            <table class="siaf-table w-full [&_th]:border [&_th]:border-[var(--sys-color-divider-strong)]">
              <thead>
                <tr class="siaf-table-head-row">
                  <th class="siaf-table-th align-middle" rowspan="3">Fecha</th>
                  <th class="siaf-table-th align-middle" rowspan="3">Cod. Asiento</th>
                  <th class="siaf-table-th align-middle" rowspan="3">Mayor</th>
                  <th class="siaf-table-th text-center" colspan="3">Cuenta</th>
                  <th class="siaf-table-th text-right align-middle" rowspan="3">Debe</th>
                  <th class="siaf-table-th text-right align-middle" rowspan="3">Haber</th>
                </tr>
                <tr class="siaf-table-head-row">
                  <th class="siaf-table-th text-center" colspan="3">Denominación</th>
                </tr>
                <tr class="siaf-table-head-row">
                  <th class="siaf-table-th">Sub Cuenta</th>
                  <th class="siaf-table-th">Mnen.</th>
                  <th class="siaf-table-th">Nombre</th>
                </tr>
              </thead>
              <tbody>
                <tr class="siaf-table-row bg-[var(--sys-color-bg-surfaces-surface-low)] text-[length:var(--sys-typography-size-caption-1)] font-bold">
                  <td class="siaf-table-td text-center" colspan="6">-Vienen-</td>
                  <td class="siaf-table-td text-right">{{ formatImporte(pliegoVienenDebe) }}</td>
                  <td class="siaf-table-td text-right">{{ formatImporte(pliegoVienenHaber) }}</td>
                </tr>
                @for (row of pliegoDiarioRows(); track $index) {
                  <tr class="siaf-table-row">
                    <td class="siaf-table-td whitespace-nowrap">{{ row.fecha }}</td>
                    <td class="siaf-table-td whitespace-nowrap">{{ row.codAsiento }}</td>
                    <td class="siaf-table-td whitespace-nowrap">{{ row.mayor }}</td>
                    <td class="siaf-table-td whitespace-nowrap" [style.paddingLeft.px]="row.subCuentaIndent * 24 + 16">{{ row.subCuenta }}</td>
                    <td class="siaf-table-td whitespace-nowrap">{{ row.mnen }}</td>
                    <td class="siaf-table-td whitespace-nowrap">{{ row.nombre }}</td>
                    <td class="siaf-table-td whitespace-nowrap text-right">{{ row.debe ? formatImporte(row.debe) : '' }}</td>
                    <td class="siaf-table-td whitespace-nowrap text-right">{{ row.haber ? formatImporte(row.haber) : '' }}</td>
                  </tr>
                }
                @empty {
                  <tr>
                    <td colspan="8" class="px-siaf-md py-siaf-xl text-center text-sm text-[var(--sys-color-text-neutral-medium)]">
                      No se encontraron operaciones para el criterio de búsqueda.
                    </td>
                  </tr>
                }
              </tbody>
              <tfoot>
                <tr class="siaf-table-row bg-[var(--sys-color-bg-surfaces-surface-low)] text-[length:var(--sys-typography-size-caption-1)] font-bold">
                  <td class="siaf-table-td text-center" colspan="6">-Van-</td>
                  <td class="siaf-table-td text-right">{{ formatImporte(pliegoVanDebe) }}</td>
                  <td class="siaf-table-td text-right">{{ formatImporte(pliegoVanHaber) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          } @else if (isPliegoMayor()) {
          <div class="siaf-table-shell">
            <table class="siaf-table w-full [&_th]:border [&_th]:border-[var(--sys-color-divider-strong)]">
              <thead>
                <tr class="siaf-table-head-row">
                  <th class="siaf-table-th align-middle" rowspan="3">Fecha</th>
                  <th class="siaf-table-th align-middle" rowspan="3">Código</th>
                  <th class="siaf-table-th text-center" colspan="2">Cuenta</th>
                  <th class="siaf-table-th text-right align-middle" rowspan="3">Debe</th>
                  <th class="siaf-table-th text-right align-middle" rowspan="3">Haber</th>
                  <th class="siaf-table-th text-right align-middle" rowspan="3">Saldo</th>
                </tr>
                <tr class="siaf-table-head-row">
                  <th class="siaf-table-th align-middle" rowspan="2">Minen.</th>
                  <th class="siaf-table-th text-center">Denominación</th>
                </tr>
                <tr class="siaf-table-head-row">
                  <th class="siaf-table-th">Nombre - Unidad Ejecutora</th>
                </tr>
              </thead>
              <tbody>
                @for (group of pliegoMayorGroups(); track group.id) {
                  <tr class="siaf-table-row">
                    <td class="siaf-table-td whitespace-nowrap">{{ group.fecha }}</td>
                    <td class="siaf-table-td whitespace-nowrap font-bold">{{ group.codigo }}</td>
                    <td class="siaf-table-td whitespace-nowrap font-bold" colspan="2">{{ group.cuenta }}</td>
                    <td class="siaf-table-td"></td>
                    <td class="siaf-table-td"></td>
                    <td class="siaf-table-td"></td>
                  </tr>
                  @for (det of group.detalles; track $index) {
                    <tr class="siaf-table-row">
                      <td class="siaf-table-td"></td>
                      <td class="siaf-table-td"></td>
                      <td class="siaf-table-td whitespace-nowrap">{{ det.minen }}</td>
                      <td class="siaf-table-td whitespace-nowrap">{{ det.nombre }}</td>
                      <td class="siaf-table-td whitespace-nowrap text-right">{{ formatImporte(det.debe) }}</td>
                      <td class="siaf-table-td whitespace-nowrap text-right">{{ formatImporte(det.haber) }}</td>
                      <td class="siaf-table-td whitespace-nowrap text-right">{{ formatImporte(det.saldo) }}</td>
                    </tr>
                  }
                }
                @empty {
                  <tr>
                    <td colspan="7" class="px-siaf-md py-siaf-xl text-center text-sm text-[var(--sys-color-text-neutral-medium)]">
                      No se encontraron operaciones para el criterio de búsqueda.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          } @else if (isMayor()) {
          <div class="siaf-table-shell">
            <table class="siaf-table min-w-[1000px]">
              <thead>
                <tr class="siaf-table-head-row">
                  <th class="siaf-table-th"></th>
                  <th class="siaf-table-th">Fecha</th>
                  <th class="siaf-table-th">Doc. CA/REG/Nota</th>
                  <th class="siaf-table-th">Documento</th>
                  <th class="siaf-table-th">Nro Documento</th>
                  <th class="siaf-table-th">Nro. Asiento</th>
                  <th class="siaf-table-th text-right">Debe</th>
                  <th class="siaf-table-th text-right">Haber</th>
                </tr>
              </thead>
              <tbody>
                @for (group of mayorGroups(); track group.id) {
                  <tr class="siaf-table-row">
                    <td class="siaf-table-td">
                      <input class="size-4 border-border text-brand-primary focus:ring-brand-primary" type="checkbox" [attr.aria-label]="'Seleccionar ' + group.codCuenta" [checked]="isSelected(group.id)" (change)="toggleSelected(group.id)" />
                    </td>
                    <td class="siaf-table-td font-bold">{{ group.codCuenta }}</td>
                    <td class="siaf-table-td font-bold" colspan="6">{{ group.nombreCuenta }}</td>
                  </tr>
                  @for (mov of group.movimientos; track $index) {
                    <tr class="siaf-table-row">
                      <td class="siaf-table-td">
                        <input class="size-4 border-border text-brand-primary focus:ring-brand-primary" type="checkbox" [attr.aria-label]="'Seleccionar movimiento ' + mov.nroAsiento" [checked]="isMayorRowSelected(group.id + '-' + $index)" (change)="toggleMayorRow(group.id + '-' + $index)" />
                      </td>
                      <td class="siaf-table-td">{{ mov.fecha }}</td>
                      <td class="siaf-table-td">{{ mov.docCaRegNota }}</td>
                      <td class="siaf-table-td">{{ mov.documento }}</td>
                      <td class="siaf-table-td">{{ mov.nroDocumento }}</td>
                      <td class="siaf-table-td">{{ mov.nroAsiento }}</td>
                      <td class="siaf-table-td text-right">{{ mov.debe ? formatImporte(mov.debe) : '' }}</td>
                      <td class="siaf-table-td text-right">{{ mov.haber ? formatImporte(mov.haber) : '' }}</td>
                    </tr>
                  }
                }
                @empty {
                  <tr>
                    <td colspan="8" class="px-siaf-md py-siaf-xl text-center text-sm text-[var(--sys-color-text-neutral-medium)]">
                      No se encontraron operaciones para el criterio de búsqueda.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          } @else {
          <div class="siaf-table-shell">
            <table class="siaf-table min-w-[900px]">
              <thead>
                <tr class="siaf-table-head-row">
                  <th class="siaf-table-th"></th>
                  <th class="siaf-table-th">Cod. Asiento</th>
                  <th class="siaf-table-th">Fecha</th>
                  <th class="siaf-table-th">Documento</th>
                  <th class="siaf-table-th"></th>
                  <th class="siaf-table-th"></th>
                  <th class="siaf-table-th text-right">Debe</th>
                  <th class="siaf-table-th text-right">Haber</th>
                </tr>
              </thead>
              <tbody>
                @if (displayRows().length > 0) {
                  <tr class="siaf-table-row bg-[var(--sys-color-bg-surfaces-surface-low)] text-[length:var(--sys-typography-size-caption-1)] font-bold">
                    <td class="siaf-table-td text-center" colspan="6">-Vienen-</td>
                    <td class="siaf-table-td text-right">{{ formatImporte(vienenDebe) }}</td>
                    <td class="siaf-table-td text-right">{{ formatImporte(vienenHaber) }}</td>
                  </tr>
                }
                @for (row of displayRows(); track rowKey(row)) {
                  @if (row.type === 'group') {
                    <tr class="siaf-table-row">
                      <td class="siaf-table-td">
                        <div class="flex items-center gap-siaf-xs">
                          <input class="size-4 border-border text-brand-primary focus:ring-brand-primary" type="checkbox" [attr.aria-label]="'Seleccionar ' + row.codCuenta" [checked]="isSelected(row.groupId)" (change)="toggleSelected(row.groupId)" />
                          <button class="inline-flex size-6 items-center justify-center rounded-siaf-sm hover:bg-surface-muted" type="button" [attr.aria-label]="isExpanded(row.groupId) ? 'Contraer' : 'Expandir'" (click)="toggleExpanded(row.groupId)">
                            <siaf-icon [name]="isExpanded(row.groupId) ? 'expand_more' : 'chevron_right'" [size]="20" />
                          </button>
                        </div>
                      </td>
                      <td class="siaf-table-td font-bold">{{ row.codCuenta }}</td>
                      <td class="siaf-table-td font-bold">{{ row.fecha }}</td>
                      <td class="siaf-table-td font-bold" colspan="5">{{ row.documento }}</td>
                    </tr>
                  } @else {
                    <tr class="siaf-table-row">
                      <td class="siaf-table-td"></td>
                      <td class="siaf-table-td" [style.paddingLeft.px]="(row.account.nivel - 1) * 24 + 16" colspan="3">
                        {{ row.account.codigo }} {{ row.account.nombre }}
                      </td>
                      @for (slot of amountSlots(row.account); track $index) {
                        <td class="siaf-table-td text-right" [class.font-bold]="$index >= 2">{{ slot }}</td>
                      }
                    </tr>
                  }
                }
                @empty {
                  <tr>
                    <td colspan="8" class="px-siaf-md py-siaf-xl text-center text-sm text-[var(--sys-color-text-neutral-medium)]">
                      No se encontraron operaciones para el criterio de búsqueda.
                    </td>
                  </tr>
                }
              </tbody>
              @if (displayRows().length > 0) {
                <tfoot>
                  <tr class="siaf-table-row bg-[var(--sys-color-bg-surfaces-surface-low)] text-[length:var(--sys-typography-size-caption-1)] font-bold">
                    <td class="siaf-table-td text-center" colspan="6">-Van-</td>
                    <td class="siaf-table-td text-right">{{ formatImporte(totalDebe) }}</td>
                    <td class="siaf-table-td text-right">{{ formatImporte(totalHaber) }}</td>
                  </tr>
                </tfoot>
              }
            </table>
          </div>
          }

          <siaf-pagination navigation="Activate" position="Bottom" [rowPage]="true" [page]="1" [pageSize]="rowsPerPage()" [rowsPerPage]="rowsPerPage()" [totalItems]="isPliegoDiario() ? pliegoDiarioRows().length : isPliegoMayor() ? pliegoMayorTotalRows() : isMayor() ? mayorTotalRows() : displayRows().length" [totalPages]="1" (rowsPerPageChange)="rowsPerPage.set($event)" />
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LibrosContablesSearchResultsComponent {
  @Input({ required: true }) criteria!: LibrosContablesSearchCriteria;

  @Output() quitarFiltros = new EventEmitter<void>();

  readonly entity = LIBROS_CONTABLES_RESULT_ENTITY;
  readonly vienenDebe = LIBROS_CONTABLES_RESULT_VIENEN_DEBE;
  readonly vienenHaber = LIBROS_CONTABLES_RESULT_VIENEN_HABER;
  readonly totalDebe = LIBROS_CONTABLES_RESULT_TOTAL_DEBE;
  readonly totalHaber = LIBROS_CONTABLES_RESULT_TOTAL_HABER;

  readonly pliegoVienenDebe = LIBROS_CONTABLES_PLIEGO_VIENEN_DEBE;
  readonly pliegoVienenHaber = LIBROS_CONTABLES_PLIEGO_VIENEN_HABER;
  readonly pliegoVanDebe = LIBROS_CONTABLES_PLIEGO_VAN_DEBE;
  readonly pliegoVanHaber = LIBROS_CONTABLES_PLIEGO_VAN_HABER;

  private readonly reportCorrelativo = '1234000054';
  readonly exportMenuOpen = signal(false);
  readonly selectedFormat = signal<ReportFormat | null>(null);

  readonly exportOpciones: { format: ReportFormat; label: string; icon: string }[] = [
    { format: 'csv', label: 'CSV', icon: 'description' },
    { format: 'excel', label: 'Excel', icon: 'grid_on' },
    { format: 'pdf', label: 'PDF', icon: 'picture_as_pdf' },
  ];

  @HostListener('document:click')
  closeExportMenu(): void {
    this.exportMenuOpen.set(false);
  }

  /** Abre/cierra el menú de descarga; al abrir siempre parte sin selección (todos enabled). */
  toggleExportMenu(): void {
    const willOpen = !this.exportMenuOpen();
    if (willOpen) {
      this.selectedFormat.set(null);
    }
    this.exportMenuOpen.set(willOpen);
  }

  readonly searchTerm = signal('');
  readonly expandedGroups = signal<Set<string>>(new Set(LIBROS_CONTABLES_RESULT_GROUPS.map((group) => group.id)));
  readonly selectedGroups = signal<Set<string>>(new Set());
  readonly groupsPage = signal(1);
  readonly groupsPageSize = signal(5);
  readonly rowsPerPage = signal(25);

  readonly filterChips = computed(() => {
    const chips: string[] = [];
    const scopeLabel = LIBROS_CONTABLES_SCOPE_OPTIONS.find((option) => option.value === this.criteria.scope)?.label;
    const tipoLabel = LIBROS_CONTABLES_TIPO_OPTIONS.find((option) => option.value === this.criteria.tipoLibro)?.label;
    const entidadLabel = LIBROS_CONTABLES_ENTIDAD_PLIEGO_OPTIONS.find((option) => option.value === this.criteria.entidad)?.label;
    const mesLabel = LIBROS_CONTABLES_MES_OPTIONS.find((option) => option.value === this.criteria.mes)?.label;
    const anioLabel = LIBROS_CONTABLES_ANIO_OPTIONS.find((option) => option.value === this.criteria.anioCuenta)?.label;

    if (scopeLabel) chips.push(scopeLabel);
    if (tipoLabel) chips.push(`Tipo de Libro: ${tipoLabel}`);
    if (entidadLabel) chips.push(`Entidad: ${entidadLabel}`);
    if (mesLabel) chips.push(`Mes: ${mesLabel}`);
    if (anioLabel) chips.push(`Año cuenta: ${anioLabel}`);
    if (this.criteria.fechaDesde) chips.push(`Desde: ${this.criteria.fechaDesde}`);
    if (this.criteria.fechaHasta) chips.push(`Hasta: ${this.criteria.fechaHasta}`);

    return chips;
  });

  readonly bookTitle = computed(() => {
    const tipoLabel = LIBROS_CONTABLES_TIPO_OPTIONS.find((option) => option.value === this.criteria.tipoLibro)?.label ?? 'Libro Contable';
    const mesLabel = LIBROS_CONTABLES_MES_OPTIONS.find((option) => option.value === this.criteria.mes)?.label;
    const anioLabel = LIBROS_CONTABLES_ANIO_OPTIONS.find((option) => option.value === this.criteria.anioCuenta)?.label;
    const periodo = mesLabel && anioLabel ? ` al mes de ${mesLabel} de ${anioLabel}` : '';

    return `Datos del ${tipoLabel}${periodo}`;
  });

  readonly reportTitle = computed(() => {
    const tipoLabel = LIBROS_CONTABLES_TIPO_OPTIONS.find((option) => option.value === this.criteria.tipoLibro)?.label ?? 'Libro Contable';
    const mesLabel = LIBROS_CONTABLES_MES_OPTIONS.find((option) => option.value === this.criteria.mes)?.label;
    const anioLabel = LIBROS_CONTABLES_ANIO_OPTIONS.find((option) => option.value === this.criteria.anioCuenta)?.label;
    const periodo = mesLabel && anioLabel ? ` al mes de ${mesLabel} del ${anioLabel}` : '';

    return `${tipoLabel}${periodo}`;
  });

  readonly filteredGroups = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return LIBROS_CONTABLES_RESULT_GROUPS;
    }

    return LIBROS_CONTABLES_RESULT_GROUPS.filter((group) =>
      group.documento.toLowerCase().includes(term) || group.codCuenta.toLowerCase().includes(term)
    );
  });

  readonly displayRows = computed<DisplayRow[]>(() => {
    const rows: DisplayRow[] = [];

    for (const group of this.filteredGroups()) {
      rows.push({ type: 'group', groupId: group.id, codCuenta: group.codCuenta, fecha: group.fecha, documento: group.documento });

      if (this.isExpanded(group.id)) {
        for (const account of group.cuentas) {
          rows.push({ type: 'account', groupId: group.id, account });
        }
      }
    }

    return rows;
  });

  readonly allSelected = computed(() => this.filteredGroups().length > 0 && this.filteredGroups().every((group) => this.selectedGroups().has(group.id)));

  private readonly currentUserService = inject(CurrentUserService);

  readonly isMayor = computed(() => this.criteria.tipoLibro === 'mayor');

  private readonly esPliego = computed(() => this.currentUserService.visualizadorTipo() === 'pliego');

  /**
   * La vista consolidada por unidad ejecutora solo aplica al visualizador PLIEGO cuando
   * la Entidad es "Integrado a nivel pliego". Con "Programa nacional de becas" (u otra
   * entidad puntual) se muestran las tablas y reportes estándar del libro.
   */
  private readonly esIntegradoPliego = computed(() => this.esPliego() && this.criteria.entidad === 'integrado-pliego');

  /** El visualizador PLIEGO integrado con Libro Diario ve el desglose por unidad ejecutora. */
  readonly isPliegoDiario = computed(() => this.esIntegradoPliego() && !this.isMayor());

  /** El visualizador PLIEGO integrado con Libro Mayor ve los saldos por unidad ejecutora. */
  readonly isPliegoMayor = computed(() => this.esIntegradoPliego() && this.isMayor());

  readonly pliegoMayorGroups = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return LIBROS_CONTABLES_PLIEGO_MAYOR_GROUPS;
    }

    return LIBROS_CONTABLES_PLIEGO_MAYOR_GROUPS.map((group) => ({
      ...group,
      detalles: group.detalles.filter((det) =>
        det.nombre.toLowerCase().includes(term) || det.minen.toLowerCase().includes(term)
      ),
    })).filter((group) => group.detalles.length > 0 || group.cuenta.toLowerCase().includes(term) || group.codigo.toLowerCase().includes(term));
  });

  readonly pliegoMayorTotalRows = computed(() => this.pliegoMayorGroups().reduce((total, group) => total + group.detalles.length, 0));

  readonly pliegoDiarioRows = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return LIBROS_CONTABLES_PLIEGO_DIARIO_ROWS;
    }

    return LIBROS_CONTABLES_PLIEGO_DIARIO_ROWS.filter((row) =>
      row.subCuenta.toLowerCase().includes(term) ||
      row.nombre.toLowerCase().includes(term) ||
      row.mnen.toLowerCase().includes(term) ||
      row.mayor.toLowerCase().includes(term)
    );
  });

  readonly mayorGroups = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return LIBROS_CONTABLES_MAYOR_RESULT_GROUPS;
    }

    return LIBROS_CONTABLES_MAYOR_RESULT_GROUPS.map((group) => ({
      ...group,
      movimientos: group.movimientos.filter((mov) =>
        mov.documento.toLowerCase().includes(term) ||
        mov.docCaRegNota.toLowerCase().includes(term) ||
        mov.nroDocumento.toLowerCase().includes(term) ||
        mov.nroAsiento.toLowerCase().includes(term)
      ),
    })).filter((group) => group.movimientos.length > 0);
  });

  readonly mayorTotalRows = computed(() => this.mayorGroups().reduce((total, group) => total + group.movimientos.length, 0));

  readonly selectedMayorRows = signal<Set<string>>(new Set());

  isMayorRowSelected(key: string): boolean {
    return this.selectedMayorRows().has(key);
  }

  toggleMayorRow(key: string): void {
    this.selectedMayorRows.update((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  rowKey(row: DisplayRow): string {
    return row.type === 'group' ? `group-${row.groupId}` : `account-${row.groupId}-${row.account.codigo}`;
  }

  isExpanded(groupId: string): boolean {
    return this.expandedGroups().has(groupId);
  }

  toggleExpanded(groupId: string): void {
    this.expandedGroups.update((current) => {
      const next = new Set(current);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }

  isSelected(groupId: string): boolean {
    return this.selectedGroups().has(groupId);
  }

  toggleSelected(groupId: string): void {
    this.selectedGroups.update((current) => {
      const next = new Set(current);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }

  toggleSelectAll(): void {
    const shouldSelectAll = !this.allSelected();
    this.selectedGroups.set(shouldSelectAll ? new Set(this.filteredGroups().map((group) => group.id)) : new Set());
  }

  previousGroupsPage(): void {
    this.groupsPage.update((page) => Math.max(1, page - 1));
  }

  nextGroupsPage(): void {
    this.groupsPage.update((page) => page + 1);
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
  }

  inputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  /** Descarga el reporte en el formato elegido, respetando la combinación de filtros aplicada. */
  descargarReporte(format: ReportFormat): void {
    this.selectedFormat.set(format);
    this.exportMenuOpen.set(false);
    const correlativo = this.reportCorrelativo;
    const title = this.reportTitle();

    if (format === 'pdf') {
      this.exportarPdf();
      return;
    }

    const matrix = this.buildExportMatrix();

    if (format === 'excel') {
      downloadExcel(matrix, correlativo, title);
    } else {
      downloadCsv(matrix, correlativo, title);
    }
  }

  /** Construye la matriz de datos (Excel/CSV) equivalente al PDF según la combinación de filtros. */
  private buildExportMatrix(): ExportMatrix {
    const correlativo = this.reportCorrelativo;
    const title = this.reportTitle();

    if (this.isPliegoMayor()) {
      return buildLibroPliegoMayorMatrix({ correlativo, title, entity: this.entity, groups: this.pliegoMayorGroups() });
    }

    if (this.isPliegoDiario()) {
      return buildLibroPliegoDiarioMatrix({
        correlativo, title, entity: this.entity, rows: this.pliegoDiarioRows(),
        vienenDebe: this.pliegoVienenDebe, vienenHaber: this.pliegoVienenHaber,
        vanDebe: this.pliegoVanDebe, vanHaber: this.pliegoVanHaber,
      });
    }

    if (this.isMayor()) {
      return buildLibroMayorMatrix({ correlativo, title, entity: this.entity, groups: this.mayorGroups() });
    }

    return buildLibroDiarioMatrix({
      correlativo, title, entity: this.entity, groups: this.filteredGroups(),
      vienenDebe: this.vienenDebe, vienenHaber: this.vienenHaber,
      totalDebe: this.totalDebe, totalHaber: this.totalHaber,
    });
  }

  private exportarPdf(): void {
    const correlativo = this.reportCorrelativo;
    const title = this.reportTitle();

    if (this.isPliegoMayor()) {
      generateLibrosContablesPliegoMayorPdfReport({ correlativo, title, entity: this.entity, groups: this.pliegoMayorGroups() });
      return;
    }

    if (this.isPliegoDiario()) {
      generateLibrosContablesPliegoDiarioPdfReport({
        correlativo, title, entity: this.entity, rows: this.pliegoDiarioRows(),
        vienenDebe: this.pliegoVienenDebe, vienenHaber: this.pliegoVienenHaber,
        vanDebe: this.pliegoVanDebe, vanHaber: this.pliegoVanHaber,
      });
      return;
    }

    if (this.isMayor()) {
      generateLibrosContablesMayorPdfReport({ correlativo, title, entity: this.entity, groups: this.mayorGroups() });
      return;
    }

    generateLibrosContablesPdfReport({
      correlativo, title, entity: this.entity, groups: this.filteredGroups(),
      vienenDebe: this.vienenDebe, vienenHaber: this.vienenHaber,
      totalDebe: this.totalDebe, totalHaber: this.totalHaber,
    });
  }

  onMoreOptions(): void {
    console.log('Más opciones de operaciones bancarias');
  }

  formatImporte(value: number): string {
    return value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  amountSlots(account: LibroContableAccountRow): [string, string, string, string] {
    return computeAmountSlots(account, (value) => this.formatImporte(value));
  }
}