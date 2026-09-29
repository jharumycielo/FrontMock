import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';

import { CurrentUserService, VISUALIZADOR_TIPO_LABELS } from '../../../../../core/auth/current-user.service';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { TagComponent } from '../../../../../shared/ui/tag/tag.component';
import {
  LIBROS_CONTABLES_ANIO_OPTIONS,
  LIBROS_CONTABLES_CUENTA_OPTIONS,
  LIBROS_CONTABLES_DIARIO_MATRIX_ROWS,
  LIBROS_CONTABLES_ENTIDAD_PLIEGO_OPTIONS,
  LIBROS_CONTABLES_MAYOR_DETALLADO_ROWS,
  LIBROS_CONTABLES_MAYOR_EXTENDIDO_GROUPS,
  LIBROS_CONTABLES_MAYOR_EXTENDIDO_UE_GROUPS,
  LIBROS_CONTABLES_MAYOR_RESULT_GROUPS,
  LIBROS_CONTABLES_MES_OPTIONS,
  LIBROS_CONTABLES_PLIEGO_DIARIO_ROWS,
  LIBROS_CONTABLES_PLIEGO_DIARIO_UE_GROUPS,
  LIBROS_CONTABLES_PLIEGO_DIARIO_UE_VAN_DEBE,
  LIBROS_CONTABLES_PLIEGO_DIARIO_UE_VAN_HABER,
  LIBROS_CONTABLES_PLIEGO_MAYOR_GROUPS,
  LIBROS_CONTABLES_PLIEGO_OPTIONS,
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
  LIBROS_CONTABLES_UNIDAD_EJECUTORA_OPTIONS,
  LibroContableAccountRow,
  LibroMayorExtendidoUeGroup,
  LibroPliegoDiarioRow,
  LibroPliegoMayorGroup,
  LibroPliegoMayorRow,
  aplicarMovimiento,
} from '../../../config/accounting-books.mock';
import { LibrosContablesSearchCriteria } from '../search-panel/libros-contables-search-panel.component';
import { computeAmountSlots } from '../../utils/libros-contables-amount-slots';
import {
  mayorDetalladoEnPeriodo,
  mayorEnPeriodo,
  mayorExtendidoUeEnPeriodo,
  matrizDiarioEnPeriodo,
  operacionesEnPeriodo,
  pliegoDiarioRowsEnPeriodo,
  pliegoDiarioUeEnPeriodo,
  pliegoMayorEnPeriodo,
  resolverPeriodo,
} from '../../utils/libros-contables-periodo';
import { generateLibrosContablesMayorDetalladoPdfReport, generateLibrosContablesMayorExtendidoUePdfReport, generateLibrosContablesMayorPdfReport, generateLibrosContablesPdfReport, generateLibrosContablesPliegoDiarioPdfReport, generateLibrosContablesPliegoMayorPdfReport } from '../../utils/libros-contables-pdf-report';
import {
  ExportMatrix,
  ReportMeta,
  buildLibroDiarioMatrix,
  buildLibroMayorDetalladoMatrix,
  buildLibroMayorExtendidoUeMatrix,
  buildLibroMayorMatrix,
  buildLibroPliegoDiarioMatrix,
  buildLibroPliegoMayorMatrix,
  downloadCsv,
  downloadExcel,
} from '../../utils/libros-contables-export';

type ReportFormat = 'pdf' | 'excel' | 'csv';

type DisplayRow =
  | { type: 'group'; groupId: string; tipoRegistro: string; nroDocContable: string; codCuenta: string; fecha: string; tipoDocumento: string; codDocOrigen: string; documento: string }
  | { type: 'account'; groupId: string; account: LibroContableAccountRow };

/** Filas del Libro Diario · Integrado a nivel pliego: acordeón por Unidad Ejecutora + operaciones estándar. */
type PliegoDiarioUeDisplayRow =
  | { type: 'ue'; ueId: string; unidadEjecutora: string }
  | { type: 'group'; ueId: string; groupId: string; tipoRegistro: string; nroDocContable: string; codCuenta: string; fecha: string; tipoDocumento: string; codDocOrigen: string; documento: string }
  | { type: 'account'; ueId: string; groupId: string; account: LibroContableAccountRow };

/** Filas del Libro Mayor Extendido consolidado (ENTE RECTOR): acordeón por Unidad Ejecutora + sub-cuentas y su detalle. */
type MayorExtendidoUeDisplayRow =
  | { type: 'ue'; ueId: string; unidadEjecutora: string }
  | { type: 'group'; ueId: string; group: LibroPliegoMayorGroup }
  | { type: 'detalle'; ueId: string; groupId: string; det: LibroPliegoMayorRow };

/** Fecha/hora de generación con formato DD/MM/YYYY HH:MM:SS. */
function formatFechaHora(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/** Código de cuenta escrito por el usuario, sin puntos ni espacios (1.1.5 → 115). */
function normalizarCodigoCuenta(value: string | undefined): string {
  return (value ?? '').replace(/[.\s]/g, '');
}

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

          <div class="grid gap-siaf-md" [ngClass]="esEnteRector() ? 'sm:grid-cols-2' : muestraPliegoUnidad() ? 'sm:grid-cols-4' : 'sm:grid-cols-3'">
            <div class="grid gap-siaf-xxs">
              <span class="text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">Entidad</span>
              <span class="text-sm text-text">{{ entity.entidad }}</span>
            </div>
            @if (esEnteRector()) {
              <!-- Ente Rector: el Pliego ya está en los filtros, solo se muestra Entidad. -->
            } @else if (muestraPliegoUnidad()) {
              <!-- Unidad Ejecutora: Entidad · Pliego · Unidad Ejecutora. -->
              <div class="grid gap-siaf-xxs">
                <span class="text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">Pliego</span>
                <span class="text-sm text-text">{{ entity.pliego }}</span>
              </div>
              <div class="grid gap-siaf-xxs">
                <span class="text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">Unidad Ejecutora</span>
                <span class="text-sm text-text">{{ entity.unidadEjecutora }}</span>
              </div>
            } @else if (esPliego()) {
              <!-- Pliego: en todos los resultados solo Entidad · Pliego (sin Unidad Ejecutora). -->
              <div class="grid gap-siaf-xxs">
                <span class="text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">Pliego</span>
                <span class="text-sm text-text">{{ entity.pliego }}</span>
              </div>
            } @else {
              <div class="grid gap-siaf-xxs">
                <span class="text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">Sector</span>
                <span class="text-sm text-text">{{ entity.sector }}</span>
              </div>
            }
            <!-- Fecha/hora de generación: última columna en todas las vistas y libros. -->
            <div class="grid gap-siaf-xxs">
              <span class="text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">Fecha</span>
              <span class="text-sm text-text">{{ reportFechaHora() }}</span>
            </div>
          </div>
        </div>

        <div class="grid gap-siaf-md border-t border-[var(--sys-color-divider-default)] pt-siaf-md">
          <h3 class="m-0 text-sm font-bold uppercase leading-normal text-text">{{ searchSectionTitle() }}</h3>

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
            <button class="inline-flex size-8 items-center justify-center rounded-siaf-md text-text-muted disabled:cursor-not-allowed disabled:opacity-40" type="button" aria-label="Agregar filtro" disabled>
              <siaf-icon name="add" [size]="18" />
            </button>
          </div>

          <div class="flex items-center justify-between gap-siaf-md">
            <label class="inline-flex items-center gap-siaf-xs">
              <input class="size-4 border-border text-brand-primary focus:ring-brand-primary" type="checkbox" aria-label="Seleccionar todo" [checked]="allSelected()" (change)="toggleSelectAll()" />
            </label>
            <siaf-pagination navigation="Activate" position="Top" [page]="groupsPage()" [pageSize]="groupsPageSize()" [totalItems]="isPliegoDiario() ? pliegoDiarioUeTotalRows() : isMayorExtendidoUe() ? mayorExtendidoUeTotalRows() : isMayorExtendido() ? mayorDetalladoTotalRows() : isPliegoMayor() ? mayorConsolidadoTotalRows() : isMayor() ? mayorTotalRows() : filteredGroups().length" [totalPages]="1" (previous)="previousGroupsPage()" (next)="nextGroupsPage()" />
          </div>

          @if (isPliegoDiario()) {
          <div class="siaf-table-shell max-h-[460px] [&_.siaf-table-td]:h-14">
            <table class="siaf-table min-w-[1440px]">
              <thead>
                <tr class="siaf-table-head-row">
                  <th class="siaf-table-th"></th>
                  <th class="siaf-table-th whitespace-nowrap">Ejercicio</th>
                  <th class="siaf-table-th whitespace-nowrap">Entidad</th>
                  <th class="siaf-table-th whitespace-nowrap">Tipo Registro</th>
                  <th class="siaf-table-th whitespace-nowrap">Nro Reg. Contable</th>
                  <th class="siaf-table-th whitespace-nowrap">Nro. Asiento Contable</th>
                  <th class="siaf-table-th">Fecha</th>
                  <th class="siaf-table-th whitespace-nowrap">Tipo doc origen</th>
                  <th class="siaf-table-th whitespace-nowrap">Nro doc origen</th>
                  <th class="siaf-table-th">Documento origen</th>
                  <th class="siaf-table-th text-right">Debe</th>
                  <th class="siaf-table-th text-right">Haber</th>
                </tr>
              </thead>
              <tbody>
                <tr class="siaf-table-row bg-[var(--sys-color-bg-surfaces-surface-low)] text-[length:var(--sys-typography-size-caption-1)] font-bold">
                  <td class="siaf-table-td text-center" colspan="10">-Vienen-</td>
                  <td class="siaf-table-td text-right">{{ formatImporte(vienenDebe) }}</td>
                  <td class="siaf-table-td text-right">{{ formatImporte(vienenHaber) }}</td>
                </tr>
                @for (row of pliegoDiarioUeRows(); track pliegoUeRowKey(row)) {
                  @if (row.type === 'ue') {
                    <tr class="siaf-table-row">
                      <td class="siaf-table-td font-bold" colspan="12">
                        <button class="inline-flex items-center gap-siaf-xs font-bold" type="button" [attr.aria-label]="isUeExpanded(row.ueId) ? 'Contraer ' + row.unidadEjecutora : 'Expandir ' + row.unidadEjecutora" (click)="toggleUeExpanded(row.ueId)">
                          <siaf-icon [name]="isUeExpanded(row.ueId) ? 'expand_more' : 'chevron_right'" [size]="20" />
                          <span class="font-bold">{{ row.unidadEjecutora }}</span>
                        </button>
                      </td>
                    </tr>
                  } @else if (row.type === 'group') {
                    <tr class="siaf-table-row">
                      <td class="siaf-table-td">
                        <input class="size-4 border-border text-brand-primary focus:ring-brand-primary" type="checkbox" [attr.aria-label]="'Seleccionar ' + row.codCuenta" [checked]="isSelected(row.groupId)" (change)="toggleSelected(row.groupId)" />
                      </td>
                      <td class="siaf-table-td whitespace-nowrap font-medium">{{ reportEjercicio() }}</td>
                      <td class="siaf-table-td whitespace-nowrap font-medium">{{ reportEntidadCodigo }}</td>
                      <td class="siaf-table-td whitespace-nowrap font-medium">{{ row.tipoRegistro }}</td>
                      <td class="siaf-table-td whitespace-nowrap font-medium">{{ row.nroDocContable }}</td>
                      <td class="siaf-table-td whitespace-nowrap font-medium">{{ row.codCuenta }}</td>
                      <td class="siaf-table-td whitespace-nowrap font-medium">{{ row.fecha }}</td>
                      <td class="siaf-table-td whitespace-nowrap font-medium">{{ row.tipoDocumento }}</td>
                      <td class="siaf-table-td whitespace-nowrap font-medium">{{ row.codDocOrigen }}</td>
                      <td class="siaf-table-td font-medium" colspan="3">{{ row.documento }}</td>
                    </tr>
                  } @else {
                    <tr class="siaf-table-row">
                      <td class="siaf-table-td"></td>
                      <td class="siaf-table-td"></td>
                      <td class="siaf-table-td"></td>
                      <td class="siaf-table-td" [style.paddingLeft.px]="(row.account.nivel - 1) * 24 + 16" colspan="5">
                        {{ row.account.codigo }} {{ row.account.nombre }}
                      </td>
                      @for (slot of amountSlots(row.account); track $index) {
                        <td class="siaf-table-td text-right" [class.font-medium]="$index >= 2">{{ slot }}</td>
                      }
                    </tr>
                  }
                }
                @empty {
                  <tr>
                    <td colspan="12" class="px-siaf-md py-siaf-xl text-center text-sm text-[var(--sys-color-text-neutral-medium)]">
                      No se encontraron operaciones para el criterio de búsqueda.
                    </td>
                  </tr>
                }
              </tbody>
              <tfoot>
                <tr class="siaf-table-row bg-[var(--sys-color-bg-surfaces-surface-low)] text-[length:var(--sys-typography-size-caption-1)] font-bold">
                  <td class="siaf-table-td text-center" colspan="10">-Van-</td>
                  <td class="siaf-table-td text-right">{{ formatImporte(pliegoDiarioVanDebe) }}</td>
                  <td class="siaf-table-td text-right">{{ formatImporte(pliegoDiarioVanHaber) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          } @else if (isMayorExtendidoUe()) {
          <div class="siaf-table-shell">
            <table class="siaf-table w-full [&_th]:border [&_th]:border-[var(--sys-color-divider-strong)]">
              <thead>
                <tr class="siaf-table-head-row">
                  <th class="siaf-table-th align-middle" rowspan="3">Ejercicio</th>
                  <th class="siaf-table-th align-middle" rowspan="3">Entidad</th>
                  <th class="siaf-table-th align-middle" rowspan="3">Fecha</th>
                  <th class="siaf-table-th align-middle" rowspan="3">Código</th>
                  <th class="siaf-table-th text-center" colspan="2">Cuenta</th>
                  <th class="siaf-table-th text-right align-middle" rowspan="3">Saldo inicial</th>
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
                @for (row of mayorExtendidoUeRows(); track mayorExtendidoUeRowKey(row)) {
                  @if (row.type === 'ue') {
                    <tr class="siaf-table-row">
                      <td class="siaf-table-td font-bold" colspan="10">
                        <button class="inline-flex items-center gap-siaf-xs font-bold" type="button" [attr.aria-label]="isUeExpanded(row.ueId) ? 'Contraer ' + row.unidadEjecutora : 'Expandir ' + row.unidadEjecutora" (click)="toggleUeExpanded(row.ueId)">
                          <siaf-icon [name]="isUeExpanded(row.ueId) ? 'expand_more' : 'chevron_right'" [size]="20" />
                          <span class="font-bold">{{ row.unidadEjecutora }}</span>
                        </button>
                      </td>
                    </tr>
                  } @else if (row.type === 'group') {
                    <tr class="siaf-table-row">
                      <td class="siaf-table-td whitespace-nowrap">{{ reportEjercicio() }}</td>
                      <td class="siaf-table-td whitespace-nowrap">{{ reportEntidadCodigo }}</td>
                      <td class="siaf-table-td whitespace-nowrap">{{ row.group.fecha }}</td>
                      <td class="siaf-table-td whitespace-nowrap font-bold">{{ row.group.codigo }}</td>
                      <td class="siaf-table-td whitespace-nowrap font-bold" colspan="2">{{ row.group.cuenta }}</td>
                      <td class="siaf-table-td"></td>
                      <td class="siaf-table-td"></td>
                      <td class="siaf-table-td"></td>
                      <td class="siaf-table-td"></td>
                    </tr>
                  } @else {
                    <tr class="siaf-table-row">
                      <td class="siaf-table-td"></td>
                      <td class="siaf-table-td"></td>
                      <td class="siaf-table-td"></td>
                      <td class="siaf-table-td"></td>
                      <td class="siaf-table-td whitespace-nowrap">{{ row.det.minen }}</td>
                      <td class="siaf-table-td whitespace-nowrap">{{ row.det.nombre }}</td>
                      <td class="siaf-table-td whitespace-nowrap text-right">{{ formatImporte(row.det.saldoInicial) }}</td>
                      <td class="siaf-table-td whitespace-nowrap text-right">{{ formatImporte(row.det.debe) }}</td>
                      <td class="siaf-table-td whitespace-nowrap text-right">{{ formatImporte(row.det.haber) }}</td>
                      <td class="siaf-table-td whitespace-nowrap text-right">{{ formatImporte(row.det.saldo) }}</td>
                    </tr>
                  }
                }
                @empty {
                  <tr>
                    <td colspan="10" class="px-siaf-md py-siaf-xl text-center text-sm text-[var(--sys-color-text-neutral-medium)]">
                      No se encontraron operaciones para el criterio de búsqueda.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          } @else if (isMayorExtendido()) {
          <div class="siaf-table-shell">
            <table class="siaf-table w-full min-w-[1000px]">
              <thead>
                <tr class="siaf-table-head-row">
                  <th class="siaf-table-th whitespace-nowrap">Ejercicio</th>
                  <th class="siaf-table-th whitespace-nowrap">Entidad</th>
                  <th class="siaf-table-th">Fecha</th>
                  <th class="siaf-table-th">Código</th>
                  <th class="siaf-table-th">Descripción</th>
                  <th class="siaf-table-th whitespace-nowrap text-right">Saldo inicial</th>
                  <th class="siaf-table-th text-right">Debe</th>
                  <th class="siaf-table-th text-right">Haber</th>
                  <th class="siaf-table-th text-right">Saldo</th>
                </tr>
              </thead>
              <tbody>
                @for (row of mayorDetalladoRows(); track row.codigo) {
                  <tr class="siaf-table-row">
                    <td class="siaf-table-td whitespace-nowrap">{{ reportEjercicio() }}</td>
                    <td class="siaf-table-td whitespace-nowrap">{{ reportEntidadCodigo }}</td>
                    <td class="siaf-table-td whitespace-nowrap">{{ row.fecha }}</td>
                    <td class="siaf-table-td whitespace-nowrap font-bold">{{ row.codigo }}</td>
                    <td class="siaf-table-td whitespace-nowrap font-bold">{{ row.descripcion }}</td>
                    <td class="siaf-table-td whitespace-nowrap text-right">{{ formatImporte(row.saldoInicial) }}</td>
                    <td class="siaf-table-td whitespace-nowrap text-right">{{ formatImporte(row.debe) }}</td>
                    <td class="siaf-table-td whitespace-nowrap text-right">{{ formatImporte(row.haber) }}</td>
                    <td class="siaf-table-td whitespace-nowrap text-right">{{ formatImporte(row.saldo) }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="9" class="px-siaf-md py-siaf-xl text-center text-sm text-[var(--sys-color-text-neutral-medium)]">
                      No se encontraron operaciones para el criterio de búsqueda.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          } @else if (isPliegoMayor()) {
          <div class="siaf-table-shell">
            <table class="siaf-table w-full [&_th]:border [&_th]:border-[var(--sys-color-divider-strong)]">
              <thead>
                <tr class="siaf-table-head-row">
                  <th class="siaf-table-th align-middle" rowspan="3">Ejercicio</th>
                  <th class="siaf-table-th align-middle" rowspan="3">Entidad</th>
                  <th class="siaf-table-th align-middle" rowspan="3">Fecha</th>
                  <th class="siaf-table-th align-middle" rowspan="3">Código</th>
                  <th class="siaf-table-th text-center" colspan="2">Cuenta</th>
                  <th class="siaf-table-th text-right align-middle" rowspan="3">Saldo inicial</th>
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
                @for (group of mayorConsolidadoGroups(); track group.id) {
                  <tr class="siaf-table-row">
                    <td class="siaf-table-td whitespace-nowrap">{{ reportEjercicio() }}</td>
                    <td class="siaf-table-td whitespace-nowrap">{{ reportEntidadCodigo }}</td>
                    <td class="siaf-table-td whitespace-nowrap">{{ group.fecha }}</td>
                    <td class="siaf-table-td whitespace-nowrap font-bold">{{ group.codigo }}</td>
                    <td class="siaf-table-td whitespace-nowrap font-bold" colspan="2">{{ group.cuenta }}</td>
                    <td class="siaf-table-td"></td>
                    <td class="siaf-table-td"></td>
                    <td class="siaf-table-td"></td>
                    <td class="siaf-table-td"></td>
                  </tr>
                  @for (det of group.detalles; track $index) {
                    <tr class="siaf-table-row">
                      <td class="siaf-table-td"></td>
                      <td class="siaf-table-td"></td>
                      <td class="siaf-table-td"></td>
                      <td class="siaf-table-td"></td>
                      <td class="siaf-table-td whitespace-nowrap">{{ det.minen }}</td>
                      <td class="siaf-table-td whitespace-nowrap">{{ det.nombre }}</td>
                      <td class="siaf-table-td whitespace-nowrap text-right">{{ formatImporte(det.saldoInicial) }}</td>
                      <td class="siaf-table-td whitespace-nowrap text-right">{{ formatImporte(det.debe) }}</td>
                      <td class="siaf-table-td whitespace-nowrap text-right">{{ formatImporte(det.haber) }}</td>
                      <td class="siaf-table-td whitespace-nowrap text-right">{{ formatImporte(det.saldo) }}</td>
                    </tr>
                  }
                }
                @empty {
                  <tr>
                    <td colspan="10" class="px-siaf-md py-siaf-xl text-center text-sm text-[var(--sys-color-text-neutral-medium)]">
                      No se encontraron operaciones para el criterio de búsqueda.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          } @else if (isMayor()) {
          <div class="siaf-table-shell">
            <table class="siaf-table w-full min-w-[1420px]">
              <colgroup>
                <col class="w-12" />
                <col class="w-[90px]" />
                <col class="w-[90px]" />
                <col class="w-[95px]" />
                <col class="w-[130px]" />
                <col class="w-[145px]" />
                <col class="w-[150px]" />
                <col class="w-[160px]" />
                <col class="w-[150px]" />
                <col class="w-[95px]" />
                <col class="w-[118px]" />
                <col class="w-[140px]" />
              </colgroup>
              <thead>
                <tr class="siaf-table-head-row">
                  <th class="siaf-table-th"></th>
                  <th class="siaf-table-th whitespace-nowrap">Ejercicio</th>
                  <th class="siaf-table-th whitespace-nowrap">Entidad</th>
                  <th class="siaf-table-th">Fecha</th>
                  <th class="siaf-table-th whitespace-nowrap">Nro Reg. Contable</th>
                  <th class="siaf-table-th whitespace-nowrap">Nro. Asiento</th>
                  <th class="siaf-table-th whitespace-nowrap">Tipo Registro</th>
                  <th class="siaf-table-th">Documento origen</th>
                  <th class="siaf-table-th">Nro doc origen</th>
                  <th class="siaf-table-th text-right">Debe</th>
                  <th class="siaf-table-th text-right">Haber</th>
                  <th class="siaf-table-th text-right">Saldo</th>
                </tr>
              </thead>
              <tbody>
                @for (group of mayorGroupsView(); track group.id) {
                  <tr class="siaf-table-row">
                    <td class="siaf-table-td">
                      <input class="size-4 border-border text-brand-primary focus:ring-brand-primary" type="checkbox" [attr.aria-label]="'Seleccionar ' + group.codCuenta" [checked]="isSelected(group.id)" (change)="toggleSelected(group.id)" />
                    </td>
                    <td class="siaf-table-td font-bold">{{ group.codCuenta }}</td>
                    <td class="siaf-table-td font-bold" colspan="10">{{ group.nombreCuenta }}</td>
                  </tr>
                  <tr class="siaf-table-row bg-[var(--sys-color-bg-surfaces-highlight)]">
                    <td class="siaf-table-td text-right font-medium" colspan="9">Saldo inicial</td>
                    <td class="siaf-table-td whitespace-nowrap text-right font-medium">{{ formatImporte(group.saldoInicial) }}</td>
                    <td class="siaf-table-td"></td>
                    <td class="siaf-table-td whitespace-nowrap text-right font-medium">{{ formatImporte(group.saldoInicial) }}</td>
                  </tr>
                  @for (mov of group.movimientos; track $index) {
                    <tr class="siaf-table-row">
                      <td class="siaf-table-td">
                        <input class="size-4 border-border text-brand-primary focus:ring-brand-primary" type="checkbox" [attr.aria-label]="'Seleccionar movimiento ' + mov.nroAsiento" [checked]="isMayorRowSelected(group.id + '-' + $index)" (change)="toggleMayorRow(group.id + '-' + $index)" />
                      </td>
                      <td class="siaf-table-td whitespace-nowrap">{{ reportEjercicio() }}</td>
                      <td class="siaf-table-td whitespace-nowrap">{{ reportEntidadCodigo }}</td>
                      <td class="siaf-table-td whitespace-nowrap">{{ mov.fecha }}</td>
                      <td class="siaf-table-td whitespace-nowrap">{{ mov.nroDocContable }}</td>
                      <td class="siaf-table-td whitespace-nowrap">{{ mov.nroAsiento }}</td>
                      <td class="siaf-table-td whitespace-nowrap">{{ mov.tipo }}</td>
                      <td class="siaf-table-td whitespace-nowrap">{{ mov.documento }}</td>
                      <td class="siaf-table-td whitespace-nowrap">{{ mov.nroDocumento }}</td>
                      <td class="siaf-table-td whitespace-nowrap text-right">{{ mov.debe ? formatImporte(mov.debe) : '' }}</td>
                      <td class="siaf-table-td whitespace-nowrap text-right">{{ mov.haber ? formatImporte(mov.haber) : '' }}</td>
                      <td class="siaf-table-td whitespace-nowrap text-right">{{ formatImporte(mov.saldo) }}</td>
                    </tr>
                  }
                  <tr class="siaf-table-row bg-[var(--sys-color-bg-surfaces-highlight)]">
                    <td class="siaf-table-td text-right font-medium" colspan="9">Saldo final</td>
                    <td class="siaf-table-td whitespace-nowrap text-right font-medium">{{ formatImporte(group.saldoFinal) }}</td>
                    <td class="siaf-table-td"></td>
                    <td class="siaf-table-td whitespace-nowrap text-right font-medium">{{ formatImporte(group.saldoFinal) }}</td>
                  </tr>
                }
                @empty {
                  <tr>
                    <td colspan="12" class="px-siaf-md py-siaf-xl text-center text-sm text-[var(--sys-color-text-neutral-medium)]">
                      No se encontraron operaciones para el criterio de búsqueda.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          } @else {
          <div class="siaf-table-shell max-h-[420px] [&_.siaf-table-td]:h-14">
            <table class="siaf-table min-w-[1440px]">
              <thead>
                <tr class="siaf-table-head-row">
                  <th class="siaf-table-th"></th>
                  <th class="siaf-table-th whitespace-nowrap">Ejercicio</th>
                  <th class="siaf-table-th whitespace-nowrap">Entidad</th>
                  <th class="siaf-table-th whitespace-nowrap">Tipo Registro</th>
                  <th class="siaf-table-th whitespace-nowrap">Nro Reg. Contable</th>
                  <th class="siaf-table-th whitespace-nowrap">Nro. Asiento Contable</th>
                  <th class="siaf-table-th">Fecha</th>
                  <th class="siaf-table-th whitespace-nowrap">Tipo doc origen</th>
                  <th class="siaf-table-th whitespace-nowrap">Nro doc origen</th>
                  <th class="siaf-table-th">Documento origen</th>
                  <th class="siaf-table-th text-right">Debe</th>
                  <th class="siaf-table-th text-right">Haber</th>
                </tr>
              </thead>
              <tbody>
                @if (displayRows().length > 0) {
                  <tr class="siaf-table-row bg-[var(--sys-color-bg-surfaces-surface-low)] text-[length:var(--sys-typography-size-caption-1)] font-bold">
                    <td class="siaf-table-td text-center" colspan="10">-Vienen-</td>
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
                      <td class="siaf-table-td whitespace-nowrap font-bold">{{ reportEjercicio() }}</td>
                      <td class="siaf-table-td whitespace-nowrap font-bold">{{ reportEntidadCodigo }}</td>
                      <td class="siaf-table-td whitespace-nowrap font-bold">{{ row.tipoRegistro }}</td>
                      <td class="siaf-table-td whitespace-nowrap font-bold">{{ row.nroDocContable }}</td>
                      <td class="siaf-table-td whitespace-nowrap font-bold">{{ row.codCuenta }}</td>
                      <td class="siaf-table-td whitespace-nowrap font-bold">{{ row.fecha }}</td>
                      <td class="siaf-table-td whitespace-nowrap font-bold">{{ row.tipoDocumento }}</td>
                      <td class="siaf-table-td whitespace-nowrap font-bold">{{ row.codDocOrigen }}</td>
                      <td class="siaf-table-td font-bold" colspan="3">{{ row.documento }}</td>
                    </tr>
                  } @else {
                    <tr class="siaf-table-row">
                      <td class="siaf-table-td"></td>
                      <td class="siaf-table-td"></td>
                      <td class="siaf-table-td"></td>
                      <td class="siaf-table-td" [style.paddingLeft.px]="(row.account.nivel - 1) * 24 + 16" colspan="5">
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
                    <td colspan="12" class="px-siaf-md py-siaf-xl text-center text-sm text-[var(--sys-color-text-neutral-medium)]">
                      No se encontraron operaciones para el criterio de búsqueda.
                    </td>
                  </tr>
                }
              </tbody>
              @if (displayRows().length > 0) {
                <tfoot>
                  <tr class="siaf-table-row bg-[var(--sys-color-bg-surfaces-surface-low)] text-[length:var(--sys-typography-size-caption-1)] font-bold">
                    <td class="siaf-table-td text-center" colspan="10">-Van-</td>
                    <td class="siaf-table-td text-right">{{ formatImporte(totalDebe) }}</td>
                    <td class="siaf-table-td text-right">{{ formatImporte(totalHaber) }}</td>
                  </tr>
                </tfoot>
              }
            </table>
          </div>
          }

          <siaf-pagination navigation="Activate" position="Bottom" [rowPage]="true" [page]="1" [pageSize]="rowsPerPage()" [rowsPerPage]="rowsPerPage()" [totalItems]="isPliegoDiario() ? pliegoDiarioUeTotalRows() : isMayorExtendidoUe() ? mayorExtendidoUeTotalRows() : isMayorExtendido() ? mayorDetalladoTotalRows() : isPliegoMayor() ? mayorConsolidadoTotalRows() : isMayor() ? mayorTotalRows() : displayRows().length" [totalPages]="1" (rowsPerPageChange)="rowsPerPage.set($event)" />
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LibrosContablesSearchResultsComponent {
  /** Fecha/hora real de generación del resultado; se refresca en cada búsqueda aplicada. */
  readonly reportFechaHora = signal(formatFechaHora(new Date()));

  private readonly _criteria = signal<LibrosContablesSearchCriteria>(null!);
  @Input({ required: true })
  get criteria(): LibrosContablesSearchCriteria {
    return this._criteria();
  }
  set criteria(value: LibrosContablesSearchCriteria) {
    this._criteria.set(value);
    this.reportFechaHora.set(formatFechaHora(new Date()));
  }

  @Output() quitarFiltros = new EventEmitter<void>();

  readonly entity = LIBROS_CONTABLES_RESULT_ENTITY;
  /** Periodo consultado (ejercicio y fechas) según los filtros aplicados. */
  private readonly periodo = computed(() => resolverPeriodo(this.criteria));

  /**
   * Filtros de cuenta del Libro Mayor, sobre el código sin puntos:
   *  - "Cuenta contable": la cuenta mayor y sus sub-cuentas/divisionarias (111 → 1113, 111311, …).
   *  - "Rango de cuenta desde/hasta": el código, recortado a los dígitos de cada límite, debe quedar
   *    entre ambos (inclusive). Así 115–213 incluye 11512 y 21311; un límite vacío deja el rango abierto.
   */
  private readonly filtroCuenta = computed(() => {
    if (!this.isMayor()) {
      return (_codigo: string) => true;
    }
    const cuenta = this.criteria.cuentaContable;
    let desde = normalizarCodigoCuenta(this.criteria.rangoCuentaDesde);
    let hasta = normalizarCodigoCuenta(this.criteria.rangoCuentaHasta);
    if (desde && hasta && desde.length === hasta.length && desde > hasta) {
      [desde, hasta] = [hasta, desde];
    }
    return (codigo: string) =>
      (!cuenta || codigo.startsWith(cuenta)) &&
      (!desde || codigo.slice(0, desde.length) >= desde) &&
      (!hasta || codigo.slice(0, hasta.length) <= hasta);
  });

  /** Ejercicio contable y código de entidad, mostrados como primeras columnas en cada libro. */
  readonly reportEjercicio = computed(() => this.periodo().ejercicio);

  /** Datos de los libros con las fechas ubicadas dentro del periodo filtrado. */
  private readonly librosEnPeriodo = computed(() => {
    const p = this.periodo();
    const deLaCuenta = this.filtroCuenta();
    return {
      resultGroups: operacionesEnPeriodo(LIBROS_CONTABLES_RESULT_GROUPS, p),
      pliegoDiarioUeGroups: pliegoDiarioUeEnPeriodo(LIBROS_CONTABLES_PLIEGO_DIARIO_UE_GROUPS, p),
      diarioMatrixRows: matrizDiarioEnPeriodo(LIBROS_CONTABLES_DIARIO_MATRIX_ROWS, p),
      mayorResultGroups: mayorEnPeriodo(LIBROS_CONTABLES_MAYOR_RESULT_GROUPS, p).filter((group) => deLaCuenta(group.codCuenta)),
      pliegoDiarioRows: pliegoDiarioRowsEnPeriodo(LIBROS_CONTABLES_PLIEGO_DIARIO_ROWS, p),
      pliegoMayorGroups: pliegoMayorEnPeriodo(LIBROS_CONTABLES_PLIEGO_MAYOR_GROUPS, p).filter((group) => deLaCuenta(group.codigo)),
      mayorExtendidoGroups: pliegoMayorEnPeriodo(LIBROS_CONTABLES_MAYOR_EXTENDIDO_GROUPS, p).filter((group) => deLaCuenta(group.codigo)),
      mayorExtendidoUeGroups: mayorExtendidoUeEnPeriodo(LIBROS_CONTABLES_MAYOR_EXTENDIDO_UE_GROUPS, p)
        .map((ue) => ({ ...ue, cuentas: ue.cuentas.filter((group) => deLaCuenta(group.codigo)) }))
        .filter((ue) => ue.cuentas.length > 0),
      mayorDetalladoRows: mayorDetalladoEnPeriodo(LIBROS_CONTABLES_MAYOR_DETALLADO_ROWS, p).filter((row) => deLaCuenta(row.codigo)),
    };
  });
  readonly reportEntidadCodigo = Number(LIBROS_CONTABLES_RESULT_ENTITY.entidad.match(/\d+/)?.[0] ?? 0);
  readonly vienenDebe = LIBROS_CONTABLES_RESULT_VIENEN_DEBE;
  readonly vienenHaber = LIBROS_CONTABLES_RESULT_VIENEN_HABER;
  readonly totalDebe = LIBROS_CONTABLES_RESULT_TOTAL_DEBE;
  readonly totalHaber = LIBROS_CONTABLES_RESULT_TOTAL_HABER;

  readonly pliegoDiarioVanDebe = LIBROS_CONTABLES_PLIEGO_DIARIO_UE_VAN_DEBE;
  readonly pliegoDiarioVanHaber = LIBROS_CONTABLES_PLIEGO_DIARIO_UE_VAN_HABER;
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
  // Acordeones de Unidad Ejecutora (Libro Diario integrado y Libro Mayor extendido): todos expandidos por defecto.
  readonly expandedUeGroups = signal<Set<string>>(
    new Set([
      ...LIBROS_CONTABLES_PLIEGO_DIARIO_UE_GROUPS.map((ue) => ue.id),
      ...LIBROS_CONTABLES_MAYOR_EXTENDIDO_UE_GROUPS.map((ue) => ue.id),
    ]),
  );
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
    const pliegoLabel = LIBROS_CONTABLES_PLIEGO_OPTIONS.find((option) => option.value === this.criteria.pliego)?.label;
    const cuentaLabel = this.isMayor()
      ? LIBROS_CONTABLES_CUENTA_OPTIONS.find((option) => option.value === this.criteria.cuentaContable)?.label
      : undefined;
    // El filtro Unidad Ejecutora solo existe para el visualizador ENTE RECTOR.
    const unidadEjecutoraLabel = this.esEnteRector()
      ? LIBROS_CONTABLES_UNIDAD_EJECUTORA_OPTIONS.find((option) => option.value === this.criteria.unidadEjecutora)?.label
      : undefined;

    if (scopeLabel) chips.push(scopeLabel);
    if (tipoLabel) chips.push(`Tipo de Libro: ${tipoLabel}`);
    if (entidadLabel) chips.push(`Entidad: ${entidadLabel}`);
    if (anioLabel) chips.push(`Ejercicio contable: ${anioLabel}`);
    if (mesLabel) chips.push(`Mes: ${mesLabel}`);
    if (pliegoLabel) chips.push(`Pliego: ${pliegoLabel}`);
    if (unidadEjecutoraLabel) chips.push(`Unidad ejecutora: ${unidadEjecutoraLabel}`);
    if (cuentaLabel) chips.push(`Cuenta contable: ${cuentaLabel}`);
    const rangoDesde = this.isMayor() ? normalizarCodigoCuenta(this.criteria.rangoCuentaDesde) : '';
    const rangoHasta = this.isMayor() ? normalizarCodigoCuenta(this.criteria.rangoCuentaHasta) : '';
    if (rangoDesde) chips.push(`Rango de cuenta desde: ${rangoDesde}`);
    if (rangoHasta) chips.push(`Rango de cuenta hasta: ${rangoHasta}`);
    if (this.criteria.fechaDesde) chips.push(`Desde: ${this.criteria.fechaDesde}`);
    if (this.criteria.fechaHasta) chips.push(`Hasta: ${this.criteria.fechaHasta}`);

    return chips;
  });

  /** Etiqueta del tipo de libro; añade "Detallado" en la variante de Libro Mayor detallado. */
  private readonly tipoLibroLabel = computed(() => {
    const base = LIBROS_CONTABLES_TIPO_OPTIONS.find((option) => option.value === this.criteria.tipoLibro)?.label ?? 'Libro Contable';
    return this.isMayorExtendido() ? `${base} Detallado` : base;
  });

  readonly bookTitle = computed(() => {
    const tipoLabel = this.tipoLibroLabel();
    const mesLabel = LIBROS_CONTABLES_MES_OPTIONS.find((option) => option.value === this.criteria.mes)?.label;
    const anioLabel = LIBROS_CONTABLES_ANIO_OPTIONS.find((option) => option.value === this.criteria.anioCuenta)?.label;
    // Muestra el mes cuando está seleccionado; el año solo si el filtro lo incluye (p. ej. Unidad Ejecutora).
    const periodo = mesLabel ? ` al mes de ${mesLabel}${anioLabel ? ` de ${anioLabel}` : ''}` : '';

    return `Datos del ${tipoLabel}${periodo}`;
  });

  /**
   * Título del buscador de contenido de la tabla; refleja el libro mostrado y añade
   * "Integrado" en las vistas consolidadas por unidad ejecutora (integrado a pliego / Ente Rector Todos).
   */
  readonly searchSectionTitle = computed(() => {
    const libro = this.isMayorExtendido()
      ? 'Libro Mayor Detallado'
      : this.isMayor()
        ? 'Libro Mayor'
        : 'Libro Diario';
    const integrado = this.isPliegoDiario() || this.isPliegoMayor() || this.isMayorExtendidoUe();
    return `Búsqueda ${libro}${integrado ? ' Integrado' : ''}`;
  });

  readonly reportTitle = computed(() => {
    const tipoLabel = this.tipoLibroLabel();
    const mesLabel = LIBROS_CONTABLES_MES_OPTIONS.find((option) => option.value === this.criteria.mes)?.label;
    const anioLabel = LIBROS_CONTABLES_ANIO_OPTIONS.find((option) => option.value === this.criteria.anioCuenta)?.label;
    const periodo = mesLabel ? ` al mes de ${mesLabel}${anioLabel ? ` del ${anioLabel}` : ''}` : '';

    return `${tipoLabel}${periodo}`;
  });

  readonly filteredGroups = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return this.librosEnPeriodo().resultGroups;
    }

    return this.librosEnPeriodo().resultGroups.filter((group) =>
      group.documento.toLowerCase().includes(term) || group.codCuenta.toLowerCase().includes(term)
    );
  });

  readonly displayRows = computed<DisplayRow[]>(() => {
    const rows: DisplayRow[] = [];

    for (const group of this.filteredGroups()) {
      rows.push({ type: 'group', groupId: group.id, tipoRegistro: group.tipoRegistro, nroDocContable: group.nroDocContable, codCuenta: group.codCuenta, fecha: group.fecha, tipoDocumento: group.tipoDocumento, codDocOrigen: group.codDocOrigen, documento: group.documento });

      if (this.isExpanded(group.id)) {
        for (const account of group.cuentas) {
          rows.push({ type: 'account', groupId: group.id, account });
        }
      }
    }

    return rows;
  });

  readonly allSelected = computed(() => this.filteredGroups().length > 0 && this.filteredGroups().every((group) => this.selectedGroups().has(group.id)));

  /** Grupos de Unidad Ejecutora del Libro Diario · Integrado a nivel pliego (filtrados por búsqueda). */
  readonly pliegoDiarioUeGroups = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return this.librosEnPeriodo().pliegoDiarioUeGroups;
    }
    return this.librosEnPeriodo().pliegoDiarioUeGroups.map((ue) => ({
      ...ue,
      operaciones: ue.operaciones.filter(
        (group) => group.documento.toLowerCase().includes(term) || group.codCuenta.toLowerCase().includes(term),
      ),
    })).filter((ue) => ue.unidadEjecutora.toLowerCase().includes(term) || ue.operaciones.length > 0);
  });

  /** Filas planas (UE / asiento / cuenta) para renderizar los acordeones de Unidad Ejecutora. */
  readonly pliegoDiarioUeRows = computed<PliegoDiarioUeDisplayRow[]>(() => {
    const rows: PliegoDiarioUeDisplayRow[] = [];
    for (const ue of this.pliegoDiarioUeGroups()) {
      rows.push({ type: 'ue', ueId: ue.id, unidadEjecutora: ue.unidadEjecutora });
      if (this.isUeExpanded(ue.id)) {
        for (const group of ue.operaciones) {
          rows.push({ type: 'group', ueId: ue.id, groupId: group.id, tipoRegistro: group.tipoRegistro, nroDocContable: group.nroDocContable, codCuenta: group.codCuenta, fecha: group.fecha, tipoDocumento: group.tipoDocumento, codDocOrigen: group.codDocOrigen, documento: group.documento });
          for (const account of group.cuentas) {
            rows.push({ type: 'account', ueId: ue.id, groupId: group.id, account });
          }
        }
      }
    }
    return rows;
  });

  readonly pliegoDiarioUeTotalRows = computed(() =>
    this.pliegoDiarioUeGroups().reduce((total, ue) => total + ue.operaciones.length, 0),
  );

  pliegoUeRowKey(row: PliegoDiarioUeDisplayRow): string {
    if (row.type === 'ue') return `ue:${row.ueId}`;
    if (row.type === 'group') return `grp:${row.groupId}`;
    return `acc:${row.groupId}:${row.account.codigo}`;
  }

  isUeExpanded(ueId: string): boolean {
    return this.expandedUeGroups().has(ueId);
  }

  toggleUeExpanded(ueId: string): void {
    this.expandedUeGroups.update((set) => {
      const next = new Set(set);
      next.has(ueId) ? next.delete(ueId) : next.add(ueId);
      return next;
    });
  }

  private readonly currentUserService = inject(CurrentUserService);

  readonly isMayor = computed(() => this.criteria.tipoLibro === 'mayor');

  /** El visualizador ENTE RECTOR muestra solo Entidad en los datos del reporte (el Pliego va en los filtros). */
  readonly esEnteRector = computed(() => this.currentUserService.visualizadorTipo() === 'ente_rector');

  // ENTE RECTOR replica el contenido de PLIEGO (mismas tablas, vistas consolidadas y reportes).
  readonly esPliego = computed(() => {
    const tipo = this.currentUserService.visualizadorTipo();
    return tipo === 'pliego' || tipo === 'ente_rector';
  });

  /**
   * Muestra Entidad · Pliego · Unidad Ejecutora (en vez de Entidad · Pliego) solo para el
   * visualizador Unidad Ejecutora. El visualizador Pliego muestra siempre Entidad · Pliego.
   */
  readonly muestraPliegoUnidad = computed(
    () => this.currentUserService.visualizadorTipo() === 'unidad_ejecutora',
  );

  /** Vista consolidada por unidad ejecutora del visualizador PLIEGO (Entidad = "Integrado a nivel pliego"). */
  private readonly esIntegradoPliego = computed(() => this.esPliego() && this.criteria.entidad === 'integrado-pliego');

  /** Ente Rector con Unidad Ejecutora = "Todos" (sin unidad concreta seleccionada). */
  private readonly esEnteRectorTodos = computed(
    () => this.esEnteRector() && (!this.criteria.unidadEjecutora || this.criteria.unidadEjecutora === 'todos'),
  );

  /**
   * Libro Diario consolidado (acordeón por unidad ejecutora):
   *  - PLIEGO con Entidad = "Integrado a nivel pliego";
   *  - ENTE RECTOR con Unidad Ejecutora = "Todos". Con una unidad concreta se muestra
   *    su libro diario individual (tabla estándar).
   */
  readonly isPliegoDiario = computed(
    () => !this.isMayor() && (this.esEnteRectorTodos() || this.esIntegradoPliego()),
  );

  /**
   * Libro Mayor consolidado por unidad ejecutora:
   *  - PLIEGO con Entidad = "Integrado a nivel pliego";
   *  - ENTE RECTOR con Unidad Ejecutora = "Todos".
   * Con una unidad ejecutora concreta, Ente Rector muestra la tabla estándar de movimientos
   * del Libro Mayor de esa unidad (rama isMayor).
   */
  readonly isPliegoMayor = computed(
    () => this.isMayor() && (this.esEnteRectorTodos() || this.esIntegradoPliego()),
  );

  readonly pliegoMayorGroups = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return this.librosEnPeriodo().pliegoMayorGroups;
    }

    return this.librosEnPeriodo().pliegoMayorGroups.map((group) => ({
      ...group,
      detalles: group.detalles.filter((det) =>
        det.nombre.toLowerCase().includes(term) || det.minen.toLowerCase().includes(term)
      ),
    })).filter((group) => group.detalles.length > 0 || group.cuenta.toLowerCase().includes(term) || group.codigo.toLowerCase().includes(term));
  });

  readonly pliegoMayorTotalRows = computed(() => this.pliegoMayorGroups().reduce((total, group) => total + group.detalles.length, 0));

  /**
   * Libro Mayor Extendido: cualquier visualizador que en los filtros elija la variante
   * "Libro mayor extendido". Reutiliza la tabla consolidada por unidad ejecutora del Libro
   * Mayor integrado a pliego (código a nivel sub-cuenta, p. ej. 1101.01). El encabezado de
   * datos varía por perfil: UE muestra Entidad · Pliego · Unidad Ejecutora, Pliego muestra
   * Entidad · Pliego, y Ente Rector solo Entidad.
   */
  readonly isMayorExtendido = computed(
    () => this.isMayor() && this.criteria.mayorVariante === 'extendido',
  );

  /** Pliego con Libro Mayor extendido: el encabezado de datos muestra solo Entidad · Pliego. */
  readonly isPliegoExtendido = computed(
    () => this.isMayorExtendido() && this.currentUserService.visualizadorTipo() === 'pliego',
  );

  readonly mayorExtendidoGroups = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return this.librosEnPeriodo().mayorExtendidoGroups;
    }

    return this.librosEnPeriodo().mayorExtendidoGroups.map((group) => ({
      ...group,
      detalles: group.detalles.filter((det) =>
        det.nombre.toLowerCase().includes(term) || det.minen.toLowerCase().includes(term)
      ),
    })).filter((group) => group.detalles.length > 0 || group.cuenta.toLowerCase().includes(term) || group.codigo.toLowerCase().includes(term));
  });

  /** Grupos de la tabla consolidada por unidad ejecutora (integrado a pliego o mayor extendido). */
  readonly mayorConsolidadoGroups = computed(() =>
    this.isMayorExtendido() ? this.mayorExtendidoGroups() : this.pliegoMayorGroups(),
  );

  readonly mayorConsolidadoTotalRows = computed(() =>
    this.mayorConsolidadoGroups().reduce((total, group) => total + group.detalles.length, 0),
  );

  /**
   * Libro Mayor Detallado (tabla plana): una fila por cuenta con saldo inicial, debe, haber y
   * saldo. Sustituye la vista anidada por USE cuando el detallado no consolida varias unidades
   * (Unidad Ejecutora, Pliego · Hospital Dos de Mayo, o Ente Rector con una UE concreta).
   */
  readonly mayorDetalladoRows = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return this.librosEnPeriodo().mayorDetalladoRows;
    }

    return this.librosEnPeriodo().mayorDetalladoRows.filter((row) =>
      row.codigo.toLowerCase().includes(term) || row.descripcion.toLowerCase().includes(term)
    );
  });

  readonly mayorDetalladoTotalRows = computed(() => this.mayorDetalladoRows().length);

  /**
   * Libro Mayor extendido con acordeones por unidad ejecutora (cada uno agrupa sus sub-cuentas
   * 1101.01, 1101.02, …). Aplica cuando la vista consolida varias unidades ejecutoras:
   *  - ENTE RECTOR con Unidad Ejecutora = "Todos";
   *  - PLIEGO con Entidad = "Integrado a nivel pliego".
   */
  readonly isMayorExtendidoUe = computed(
    () => this.isMayorExtendido() && (this.esEnteRectorTodos() || this.esIntegradoPliego()),
  );

  readonly mayorExtendidoUeGroups = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return this.librosEnPeriodo().mayorExtendidoUeGroups;
    }

    return this.librosEnPeriodo().mayorExtendidoUeGroups.map((ue) => ({
      ...ue,
      cuentas: ue.cuentas
        .map((group) => ({
          ...group,
          detalles: group.detalles.filter(
            (det) => det.nombre.toLowerCase().includes(term) || det.minen.toLowerCase().includes(term),
          ),
        }))
        .filter(
          (group) =>
            group.detalles.length > 0 ||
            group.cuenta.toLowerCase().includes(term) ||
            group.codigo.toLowerCase().includes(term),
        ),
    })).filter((ue) => ue.unidadEjecutora.toLowerCase().includes(term) || ue.cuentas.length > 0);
  });

  /** Filas planas (UE / sub-cuenta / detalle) para renderizar el acordeón del mayor extendido. */
  readonly mayorExtendidoUeRows = computed<MayorExtendidoUeDisplayRow[]>(() => {
    const rows: MayorExtendidoUeDisplayRow[] = [];
    for (const ue of this.mayorExtendidoUeGroups()) {
      rows.push({ type: 'ue', ueId: ue.id, unidadEjecutora: ue.unidadEjecutora });
      if (this.isUeExpanded(ue.id)) {
        for (const group of ue.cuentas) {
          rows.push({ type: 'group', ueId: ue.id, group });
          for (const det of group.detalles) {
            rows.push({ type: 'detalle', ueId: ue.id, groupId: group.id, det });
          }
        }
      }
    }
    return rows;
  });

  readonly mayorExtendidoUeTotalRows = computed(() =>
    this.mayorExtendidoUeGroups().reduce(
      (total, ue) => total + ue.cuentas.reduce((sum, group) => sum + group.detalles.length, 0),
      0,
    ),
  );

  mayorExtendidoUeRowKey(row: MayorExtendidoUeDisplayRow): string {
    if (row.type === 'ue') return `ue:${row.ueId}`;
    if (row.type === 'group') return `grp:${row.group.id}`;
    return `det:${row.groupId}:${row.det.minen}`;
  }

  readonly pliegoDiarioRows = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return this.librosEnPeriodo().pliegoDiarioRows;
    }

    return this.librosEnPeriodo().pliegoDiarioRows.filter((row) =>
      row.subCuenta.toLowerCase().includes(term) ||
      row.nombre.toLowerCase().includes(term) ||
      row.mnen.toLowerCase().includes(term) ||
      row.mayor.toLowerCase().includes(term)
    );
  });

  readonly mayorGroups = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return this.librosEnPeriodo().mayorResultGroups;
    }

    return this.librosEnPeriodo().mayorResultGroups.map((group) => ({
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

  /** Grupos del Libro Mayor con el saldo acumulado por movimiento, según la naturaleza de la cuenta. */
  readonly mayorGroupsView = computed(() =>
    this.mayorGroups().map((group) => {
      let saldo = group.saldoInicial;
      const movimientos = group.movimientos.map((mov) => {
        saldo = aplicarMovimiento(group.naturaleza, saldo, mov.debe, mov.haber);
        return { ...mov, saldo };
      });
      return { ...group, movimientos, saldoFinal: saldo };
    })
  );

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
    const meta: ReportMeta = {
      correlativo,
      title,
      entity: this.reportEntity(),
      condiciones: this.filterChips(),
      totalRegistros: this.exportRecordCount(),
    };

    if (format === 'excel') {
      downloadExcel(matrix, meta);
    } else {
      downloadCsv(matrix, meta);
    }
  }

  /** Cantidad de registros del resultado, según la combinación de filtros aplicada. */
  private exportRecordCount(): number {
    if (this.isMayorExtendidoUe()) {
      return this.mayorExtendidoUeTotalRows();
    }
    if (this.isPliegoMayor() || this.isMayorExtendido()) {
      return this.mayorConsolidadoTotalRows();
    }
    if (this.isPliegoDiario()) {
      return this.pliegoDiarioRows().length;
    }
    if (this.isMayor()) {
      return this.mayorTotalRows();
    }
    return this.librosEnPeriodo().diarioMatrixRows.length;
  }

  /**
   * Entidad para el reporte (PDF/Excel/CSV):
   *  - Entidad · Pliego · Unidad Ejecutora  (UE / Pliego + Hospital Dos de Mayo)
   *  - Entidad · Pliego                       (Pliego · Integrado a nivel pliego · Libro Diario)
   *  - Entidad · Sector                       (resto)
   */
  private reportEntity(): { entidad: string; sector?: string; pliego?: string; unidadEjecutora?: string; fecha?: string; ejercicio: number } {
    return { ...this.reportEntityBase(), ejercicio: this.reportEjercicio() };
  }

  private reportEntityBase(): { entidad: string; sector?: string; pliego?: string; unidadEjecutora?: string; fecha?: string } {
    const fecha = this.reportFechaHora();
    // Ente Rector: solo Entidad (el Pliego ya está en los filtros).
    if (this.esEnteRector()) {
      return { entidad: this.entity.entidad, fecha };
    }
    // Unidad Ejecutora: Entidad · Pliego · Unidad Ejecutora.
    if (this.muestraPliegoUnidad()) {
      return { entidad: this.entity.entidad, pliego: this.entity.pliego, unidadEjecutora: this.entity.unidadEjecutora, fecha };
    }
    // Pliego: en todos los resultados solo Entidad · Pliego (sin Unidad Ejecutora).
    if (this.esPliego()) {
      return { entidad: this.entity.entidad, pliego: this.entity.pliego, fecha };
    }
    return { entidad: this.entity.entidad, sector: this.entity.sector, fecha };
  }

  /**
   * Usuario mostrado en el encabezado del PDF: el tipo de visualizador (Unidad Ejecutora,
   * Pliego, Ente Rector) desde el que se descarga el reporte, ya que cambia según la vista.
   */
  private reportUsuario(): string {
    const tipo = this.currentUserService.visualizadorTipo();
    if (!tipo) {
      return this.currentUserService.name;
    }
    const label = VISUALIZADOR_TIPO_LABELS[tipo];
    return label.charAt(0) + label.slice(1).toLowerCase();
  }

  /** Construye la matriz de datos (Excel/CSV) equivalente al PDF según la combinación de filtros. */
  private buildExportMatrix(): ExportMatrix {
    const correlativo = this.reportCorrelativo;
    const title = this.reportTitle();

    if (this.isMayorExtendidoUe()) {
      return buildLibroMayorExtendidoUeMatrix({ correlativo, title, entity: this.reportEntity(), ueGroups: this.mayorExtendidoUeGroups() });
    }

    if (this.isMayorExtendido()) {
      return buildLibroMayorDetalladoMatrix({ correlativo, title, entity: this.reportEntity(), rows: this.mayorDetalladoRows() });
    }

    if (this.isPliegoMayor()) {
      return buildLibroPliegoMayorMatrix({ correlativo, title, entity: this.reportEntity(), groups: this.mayorConsolidadoGroups() });
    }

    if (this.isPliegoDiario()) {
      return buildLibroPliegoDiarioMatrix({ correlativo, title, entity: this.reportEntity(), ueGroups: this.pliegoDiarioUeGroups() });
    }

    if (this.isMayor()) {
      return buildLibroMayorMatrix({ correlativo, title, entity: this.reportEntity(), groups: this.mayorGroups() });
    }

    return buildLibroDiarioMatrix({
      correlativo, title, entity: this.reportEntity(), rows: this.librosEnPeriodo().diarioMatrixRows,
    });
  }

  private exportarPdf(): void {
    const correlativo = this.reportCorrelativo;
    const title = this.reportTitle();
    const usuario = this.reportUsuario();
    // En el PDF el encabezado de la sección va sin la palabra "Búsqueda" (solo el libro).
    const sectionTitle = this.searchSectionTitle().replace(/^Búsqueda\s+/i, '');

    if (this.isMayorExtendidoUe()) {
      generateLibrosContablesMayorExtendidoUePdfReport({ correlativo, title, sectionTitle, entity: this.reportEntity(), usuario, ueGroups: this.mayorExtendidoUeGroups() });
      return;
    }

    if (this.isMayorExtendido()) {
      generateLibrosContablesMayorDetalladoPdfReport({ correlativo, title, sectionTitle, entity: this.reportEntity(), usuario, rows: this.mayorDetalladoRows() });
      return;
    }

    if (this.isPliegoMayor()) {
      generateLibrosContablesPliegoMayorPdfReport({ correlativo, title, sectionTitle, entity: this.reportEntity(), usuario, groups: this.mayorConsolidadoGroups() });
      return;
    }

    if (this.isPliegoDiario()) {
      generateLibrosContablesPliegoDiarioPdfReport({
        correlativo, title, sectionTitle, entity: this.reportEntity(), usuario, ueGroups: this.pliegoDiarioUeGroups(),
        vienenDebe: this.vienenDebe, vienenHaber: this.vienenHaber,
        vanDebe: this.pliegoDiarioVanDebe, vanHaber: this.pliegoDiarioVanHaber,
      });
      return;
    }

    if (this.isMayor()) {
      generateLibrosContablesMayorPdfReport({ correlativo, title, sectionTitle, entity: this.reportEntity(), usuario, groups: this.mayorGroups() });
      return;
    }

    generateLibrosContablesPdfReport({
      correlativo, title, sectionTitle, entity: this.reportEntity(), usuario, groups: this.filteredGroups(),
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

  /** La fila de cabecera del asiento (con Mayor) muestra sus montos en las columnas Debe/Haber. */
  pliegoEsAsiento(row: LibroPliegoDiarioRow): boolean {
    return Boolean(row.mayor);
  }

  /** Importe del movimiento de detalle (débito o crédito) mostrado dentro de la columna Nombre. */
  pliegoMontoDetalle(row: LibroPliegoDiarioRow): string {
    const monto = row.debe || row.haber;
    return monto ? this.formatImporte(monto) : '';
  }

  /**
   * Sangría (px) del importe dentro de la columna Nombre para lograr el escalonado del Figma:
   * subcuenta al extremo derecho, y cada nivel más profundo un paso a la izquierda.
   */
  pliegoMontoOffset(row: LibroPliegoDiarioRow): number {
    const nivel = row.mnen ? 3 : row.subCuentaIndent;
    return Math.max(0, nivel - 1) * 128;
  }
}