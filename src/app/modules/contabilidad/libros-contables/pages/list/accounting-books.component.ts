import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import { BreadcrumbComponent } from '../../../../../shared/components/breadcrumb/breadcrumb.component';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { TabItem, TabsComponent } from '../../../../../shared/ui/tabs/tabs.component';
import { TextFieldComponent } from '../../../../../shared/ui/text-field/text-field.component';
import {
  ACCOUNTING_BOOKS_BREADCRUMBS,
  ACCOUNTING_BOOKS_CUENTAS,
  ACCOUNTING_BOOKS_PERIODOS,
  LIBRO_DIARIO_MOCK,
  LIBRO_MAYOR_MOCK,
  LibroMayorMovimiento,
} from '../../../config/accounting-books.mock';

type LibroTabId = 'diario' | 'mayor';

@Component({
  selector: 'siaf-accounting-books',
  standalone: true,
  imports: [BreadcrumbComponent, ButtonComponent, IconComponent, PaginationComponent, TabsComponent, TextFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="min-w-0">
      <div class="border-b border-[var(--sys-color-divider-default)] bg-surface">
        <siaf-breadcrumb class="block" [items]="breadcrumbs" />
        <div class="flex min-h-[56px] items-center justify-between gap-siaf-md px-siaf-md pb-siaf-md">
          <h1 class="m-0 text-sm font-bold uppercase leading-normal text-[var(--sys-color-text-brand-secondary)]">Libro diario y libro mayor</h1>
          <siaf-button variant="secondary" size="sm" icon="download" (click)="exportar()">Exportar</siaf-button>
        </div>
      </div>

      <section class="min-h-[calc(100vh-112px)] bg-[var(--sys-color-bg-surfaces-surface-lowest)] p-siaf-md">
        <div class="mb-siaf-md">
          <siaf-tabs [tabs]="tabs" [activeId]="activeTab()" (activeIdChange)="onTabChange($event)" />
        </div>

        <div class="mb-siaf-md flex flex-wrap items-end gap-siaf-md rounded-siaf-md bg-surface px-siaf-md py-siaf-sm shadow-siaf-elevation-1">
          <div class="min-w-[180px]">
            <siaf-input label="Periodo" type="select" [options]="periodoOptions" [value]="periodo()" (valueChange)="onPeriodoChange($event)" />
          </div>

          @if (activeTab() === 'mayor') {
            <div class="min-w-[280px]">
              <siaf-input label="Cuenta contable" type="select" [required]="true" [options]="cuentaOptions" [value]="cuenta()" (valueChange)="onCuentaChange($event)" />
            </div>
          }
        </div>

        @if (activeTab() === 'diario') {
          <div class="mb-siaf-sm px-siaf-sm">
            <siaf-pagination navigation="Activate" position="Top" [page]="page()" [pageSize]="pageSize()" [totalItems]="totalDiarioItems()" [totalPages]="totalDiarioPages()" (previous)="previousPage()" (next)="nextPage()" />
          </div>

          <div class="siaf-table-shell">
            <table class="siaf-table min-w-[900px]">
              <thead>
                <tr class="siaf-table-head-row">
                  <th class="siaf-table-th">Fecha</th>
                  <th class="siaf-table-th">N&deg; asiento</th>
                  <th class="siaf-table-th">Cuenta</th>
                  <th class="siaf-table-th">Denominaci&oacute;n</th>
                  <th class="siaf-table-th">Glosa</th>
                  <th class="siaf-table-th text-right">Debe</th>
                  <th class="siaf-table-th text-right">Haber</th>
                </tr>
              </thead>
              <tbody>
                @for (entry of paginatedDiario(); track entry.id) {
                  <tr class="siaf-table-row">
                    <td class="siaf-table-td text-[var(--sys-color-text-neutral-medium)]">{{ entry.fecha }}</td>
                    <td class="siaf-table-td font-mono">{{ entry.asiento }}</td>
                    <td class="siaf-table-td font-mono text-[var(--sys-color-text-neutral-medium)]">{{ entry.cuenta }}</td>
                    <td class="siaf-table-td">{{ entry.cuentaNombre }}</td>
                    <td class="siaf-table-td">{{ entry.glosa }}</td>
                    <td class="siaf-table-td text-right">{{ entry.debe ? formatImporte(entry.debe) : '—' }}</td>
                    <td class="siaf-table-td text-right">{{ entry.haber ? formatImporte(entry.haber) : '—' }}</td>
                  </tr>
                }
                @empty {
                  <tr>
                    <td colspan="7" class="px-siaf-md py-siaf-xl text-center text-sm text-[var(--sys-color-text-neutral-medium)]">
                      No se encontraron asientos para el periodo seleccionado.
                    </td>
                  </tr>
                }
              </tbody>
              @if (paginatedDiario().length > 0) {
                <tfoot>
                  <tr class="siaf-table-row font-bold">
                    <td class="siaf-table-td" colspan="5">Totales del periodo</td>
                    <td class="siaf-table-td text-right">{{ formatImporte(totalDebeDiario()) }}</td>
                    <td class="siaf-table-td text-right">{{ formatImporte(totalHaberDiario()) }}</td>
                  </tr>
                </tfoot>
              }
            </table>
          </div>

          <div class="mt-siaf-sm px-siaf-sm">
            <siaf-pagination navigation="Activate" position="Bottom" [rowPage]="true" [page]="page()" [pageSize]="pageSize()" [rowsPerPage]="pageSize()" [totalItems]="totalDiarioItems()" [totalPages]="totalDiarioPages()" (previous)="previousPage()" (next)="nextPage()" (rowsPerPageChange)="setPageSize($event)" />
          </div>
        } @else {
          @if (!cuenta()) {
            <div class="flex flex-col items-center justify-center gap-siaf-sm rounded-siaf-md bg-surface px-siaf-md py-siaf-xl text-center shadow-siaf-elevation-1">
              <siaf-icon class="text-[var(--sys-color-text-neutral-low)]" name="menu_book" [size]="32" />
              <p class="m-0 text-sm text-[var(--sys-color-text-neutral-medium)]">Seleccione una cuenta contable para visualizar el libro mayor.</p>
            </div>
          } @else {
            <div class="mb-siaf-sm flex flex-wrap items-center justify-between gap-siaf-sm rounded-siaf-md bg-surface px-siaf-md py-siaf-sm shadow-siaf-elevation-1">
              <span class="text-sm font-medium text-text">{{ cuenta() }} — {{ cuentaMayor()?.cuentaNombre }}</span>
              <span class="text-sm text-[var(--sys-color-text-neutral-medium)]">Saldo inicial: <strong class="text-text">{{ formatImporte(cuentaMayor()?.saldoInicial ?? 0) }}</strong></span>
            </div>

            <div class="siaf-table-shell">
              <table class="siaf-table min-w-[800px]">
                <thead>
                  <tr class="siaf-table-head-row">
                    <th class="siaf-table-th">Fecha</th>
                    <th class="siaf-table-th">N&deg; asiento</th>
                    <th class="siaf-table-th">Glosa</th>
                    <th class="siaf-table-th text-right">Debe</th>
                    <th class="siaf-table-th text-right">Haber</th>
                    <th class="siaf-table-th text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  @for (movimiento of movimientosMayor(); track $index; let i = $index) {
                    <tr class="siaf-table-row">
                      <td class="siaf-table-td text-[var(--sys-color-text-neutral-medium)]">{{ movimiento.fecha }}</td>
                      <td class="siaf-table-td font-mono">{{ movimiento.asiento }}</td>
                      <td class="siaf-table-td">{{ movimiento.glosa }}</td>
                      <td class="siaf-table-td text-right">{{ movimiento.debe ? formatImporte(movimiento.debe) : '—' }}</td>
                      <td class="siaf-table-td text-right">{{ movimiento.haber ? formatImporte(movimiento.haber) : '—' }}</td>
                      <td class="siaf-table-td text-right font-medium">{{ formatImporte(saldoEnFila(i)) }}</td>
                    </tr>
                  }
                  @empty {
                    <tr>
                      <td colspan="6" class="px-siaf-md py-siaf-xl text-center text-sm text-[var(--sys-color-text-neutral-medium)]">
                        La cuenta seleccionada no registra movimientos en el periodo.
                      </td>
                    </tr>
                  }
                </tbody>
                @if (movimientosMayor().length > 0) {
                  <tfoot>
                    <tr class="siaf-table-row font-bold">
                      <td class="siaf-table-td" colspan="5">Saldo final</td>
                      <td class="siaf-table-td text-right">{{ formatImporte(saldoFinalMayor()) }}</td>
                    </tr>
                  </tfoot>
                }
              </table>
            </div>
          }
        }
      </section>
    </section>
  `,
})
export class AccountingBooksComponent {
  readonly breadcrumbs = ACCOUNTING_BOOKS_BREADCRUMBS;
  readonly periodoOptions = ACCOUNTING_BOOKS_PERIODOS;
  readonly cuentaOptions = ACCOUNTING_BOOKS_CUENTAS;

  readonly tabs: TabItem[] = [
    { id: 'diario', label: 'Libro diario' },
    { id: 'mayor', label: 'Libro mayor' },
  ];

  readonly activeTab = signal<LibroTabId>('diario');
  readonly periodo = signal(ACCOUNTING_BOOKS_PERIODOS[0]?.value ?? '');
  readonly cuenta = signal('');
  readonly page = signal(1);
  readonly pageSize = signal(10);

  readonly totalDiarioItems = computed(() => LIBRO_DIARIO_MOCK.length);
  readonly totalDiarioPages = computed(() => Math.max(1, Math.ceil(this.totalDiarioItems() / this.pageSize())));

  readonly paginatedDiario = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return LIBRO_DIARIO_MOCK.slice(start, start + this.pageSize());
  });

  readonly totalDebeDiario = computed(() => this.paginatedDiario().reduce((sum, entry) => sum + entry.debe, 0));
  readonly totalHaberDiario = computed(() => this.paginatedDiario().reduce((sum, entry) => sum + entry.haber, 0));

  readonly cuentaMayor = computed(() => (this.cuenta() ? LIBRO_MAYOR_MOCK[this.cuenta()] : undefined));
  readonly movimientosMayor = computed<LibroMayorMovimiento[]>(() => this.cuentaMayor()?.movimientos ?? []);

  readonly saldoFinalMayor = computed(() => {
    const cuenta = this.cuentaMayor();
    if (!cuenta) {
      return 0;
    }

    return cuenta.movimientos.reduce((saldo, movimiento) => saldo + movimiento.debe - movimiento.haber, cuenta.saldoInicial);
  });

  onTabChange(tabId: string): void {
    this.activeTab.set(tabId as LibroTabId);
  }

  onPeriodoChange(value: string | number | string[]): void {
    this.periodo.set(String(value));
    this.page.set(1);
  }

  onCuentaChange(value: string | number | string[]): void {
    this.cuenta.set(String(value));
  }

  previousPage(): void {
    this.page.update((page) => Math.max(1, page - 1));
  }

  nextPage(): void {
    this.page.update((page) => Math.min(this.totalDiarioPages(), page + 1));
  }

  setPageSize(pageSize: number): void {
    this.pageSize.set(pageSize);
    this.page.set(1);
  }

  saldoEnFila(index: number): number {
    const cuenta = this.cuentaMayor();
    if (!cuenta) {
      return 0;
    }

    return cuenta.movimientos
      .slice(0, index + 1)
      .reduce((saldo, movimiento) => saldo + movimiento.debe - movimiento.haber, cuenta.saldoInicial);
  }

  formatImporte(value: number): string {
    return value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  exportar(): void {
    console.log('Exportar libro:', this.activeTab());
  }
}
