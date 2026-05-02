import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import type { DocumentsRecordsColumn } from '../../types/documents-records.types';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'siaf-column-visibility-panel',
  standalone: true,
  imports: [ButtonComponent, IconComponent],
  template: `
    @if (open) {
      <section class="fixed inset-y-0 left-0 right-0 z-50 bg-black/55 pl-0 lg:pl-[65px]" aria-modal="true" role="dialog" aria-labelledby="columns-panel-title" (click)="closed.emit()">
        <aside class="absolute bottom-0 right-0 top-0 flex w-full max-w-[420px] flex-col overflow-hidden bg-surface shadow-siaf-lg" (click)="$event.stopPropagation()">
          <header class="flex h-14 shrink-0 items-center gap-siaf-xs border-b border-[var(--sys-color-divider-default)] px-siaf-xl">
            <h2 id="columns-panel-title" class="m-0 flex-1 text-base font-bold uppercase tracking-[0.02px] text-text">Ocultar o mostrar columnas</h2>
            <button class="inline-flex size-10 items-center justify-center rounded-siaf-md text-text transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-dark-pressed)]" type="button" aria-label="Cerrar" (click)="closed.emit()">
              <siaf-icon name="close" [size]="24" />
            </button>
          </header>

          <div class="min-h-0 flex-1 overflow-y-auto border-y border-[var(--sys-color-divider-strong)] bg-[var(--sys-color-bg-surfaces-surface-highest)] px-siaf-xl py-siaf-md">
            <div class="flex flex-col gap-siaf-lg">
              <label class="flex min-h-12 cursor-pointer items-center gap-siaf-md px-siaf-md py-siaf-sm text-sm uppercase text-[var(--sys-color-text-neutral-medium)]">
                <input class="size-4 accent-brand-primary" type="checkbox" [checked]="allSelected" (change)="toggleAll.emit($event)" />
                Seleccionar todo
              </label>
              <section class="grid gap-siaf-xs">
                <h3 class="m-0 px-[18px] text-xs font-normal uppercase text-[var(--sys-color-text-neutral-medium)]">Predeterminado</h3>
                @for (column of defaultColumns; track column.key) {
                  <label class="flex min-h-12 cursor-pointer items-center gap-siaf-md px-siaf-md py-siaf-sm text-sm text-[var(--sys-color-text-neutral-medium)] transition hover:bg-surface-muted">
                    <input class="size-4 accent-brand-primary" type="checkbox" [checked]="isColumnVisible(column.key)" (change)="toggleColumn.emit({ key: column.key, event: $event })" />
                    {{ column.label }}
                  </label>
                }
              </section>
              <section class="grid gap-siaf-xs">
                <h3 class="m-0 px-[18px] text-xs font-normal uppercase text-[var(--sys-color-text-neutral-medium)]">Más columnas</h3>
                @for (column of moreColumns; track column.key) {
                  <label class="flex min-h-12 cursor-pointer items-center gap-siaf-md px-siaf-md py-siaf-sm text-sm text-[var(--sys-color-text-neutral-medium)] transition hover:bg-surface-muted">
                    <input class="size-4 accent-brand-primary" type="checkbox" [checked]="isColumnVisible(column.key)" (change)="toggleColumn.emit({ key: column.key, event: $event })" />
                    {{ column.label }}
                  </label>
                }
              </section>
              @if (internalColumns.length) {
                <section class="grid gap-siaf-xs">
                  <h3 class="m-0 px-[18px] text-xs font-normal uppercase text-[var(--sys-color-text-neutral-medium)]">Interno</h3>
                  @for (column of internalColumns; track column.key) {
                    <label class="flex min-h-12 items-center gap-siaf-md px-siaf-md py-siaf-sm text-sm text-text-muted">
                      <input class="size-4" type="checkbox" disabled />
                      {{ column.label }}
                    </label>
                  }
                </section>
              }
            </div>
          </div>

          <footer class="flex shrink-0 items-center justify-end gap-siaf-xs px-siaf-md py-siaf-sm">
            <button class="inline-flex min-h-10 items-center justify-center rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] px-siaf-md py-siaf-xs text-sm font-medium text-text transition hover:bg-surface-muted" type="button" (click)="closed.emit()">Cancelar</button>
            <siaf-button variant="primary" size="md" [disabled]="!dirty" (click)="applied.emit()">Aplicar</siaf-button>
          </footer>
        </aside>
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColumnVisibilityPanelComponent {
  @Input() open = false;
  @Input() allSelected = false;
  @Input() dirty = false;
  @Input() defaultColumns: DocumentsRecordsColumn[] = [];
  @Input() moreColumns: DocumentsRecordsColumn[] = [];
  @Input() internalColumns: DocumentsRecordsColumn[] = [];
  @Input() isColumnVisible: (columnKey: string) => boolean = () => false;

  @Output() closed = new EventEmitter<void>();
  @Output() applied = new EventEmitter<void>();
  @Output() toggleAll = new EventEmitter<Event>();
  @Output() toggleColumn = new EventEmitter<{ key: string; event: Event }>();
}

