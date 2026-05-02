import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { DocumentsRecordsColumn, DocumentsRecordsRow, DocumentsRecordsTab } from '../../types/documents-records.types';
import { IconComponent } from '../icon/icon.component';

export type DocumentsRecordsSelectionChange = {
  row: DocumentsRecordsRow;
  selected: boolean;
};

@Component({
  selector: 'siaf-documents-records-table',
  standalone: true,
  imports: [IconComponent, NgClass, RouterLink],
  template: `
    <div class="min-w-0 overflow-x-auto">
      <table class="w-full border-collapse text-left text-sm" [ngClass]="minWidthClass">
        <thead>
          <tr class="bg-surface-high text-[10px] font-bold uppercase text-text">
            <th class="w-10 rounded-l-siaf-sm px-siaf-sm py-siaf-sm"></th>
            @for (column of columns; track column.key) {
              <th class="px-siaf-md py-siaf-sm" [ngClass]="[column.widthClass || 'w-[180px]', column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left']">{{ column.label }}</th>
            }
            <th class="sticky right-0 w-14 rounded-r-siaf-sm border-l border-[var(--sys-color-divider-strong)] bg-surface-high px-siaf-sm py-siaf-sm shadow-[-4px_0_8px_rgba(0,0,0,0.08)]"></th>
          </tr>
        </thead>
        <tbody>
          @for (row of rows; track rowTrackValue(row, $index)) {
            <tr class="border-b border-[var(--sys-color-divider-default,rgba(32,32,32,0.12))] bg-surface hover:bg-[rgba(1,72,153,0.04)]" [class.h-12]="activeTab === 'records'">
              <td class="h-[58px] px-siaf-sm py-siaf-xs">
                <input class="size-4 accent-brand-primary" type="checkbox" [checked]="row.selected" (change)="onSelectionChange(row, $event)" />
              </td>
              @for (column of columns; track column.key) {
                <td class="px-siaf-md py-siaf-sm" [ngClass]="[column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left', column.kind === 'document-link' ? 'max-w-[360px]' : '']">
                  @if (column.kind === 'document-link') {
                    <a class="line-clamp-2 text-sm leading-normal text-text hover:text-brand-primary" [routerLink]="documentRoute(row)">{{ row[column.key] }}</a>
                  } @else if (column.kind === 'flow-status') {
                    <span class="inline-flex min-h-6 items-center rounded-siaf-sm px-siaf-xs text-xs text-white" [class.bg-[var(--sys-color-bg-status-flow-status-elaborado)]]="row[column.key] === 'Elaborado'" [class.bg-[var(--sys-color-bg-status-flow-status-verificado)]]="row[column.key] === 'Verificado'">{{ row[column.key] }}</span>
                  } @else if (column.kind === 'record-status') {
                    <span class="inline-flex min-h-6 items-center gap-siaf-xs rounded-siaf-sm border border-[var(--sys-color-border-feedback-info)] bg-[var(--sys-color-bg-status-record-status-activo)] px-siaf-xs text-[var(--sys-color-text-feedback-info)]">
                      <siaf-icon name="check_circle" [size]="16" />
                      {{ row[column.key] }}
                    </span>
                  } @else {
                    {{ row[column.key] }}
                  }
                </td>
              }
              <td class="sticky right-0 border-l border-[var(--sys-color-divider-strong)] bg-surface px-siaf-sm py-siaf-xs shadow-[-4px_0_8px_rgba(0,0,0,0.08)]">
                <button class="inline-flex size-8 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-dark-pressed)]" type="button" aria-label="Historial de documento" title="Historial de documento" (click)="historyOpened.emit(row)">
                  <siaf-icon name="history" [size]="20" />
                </button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentsRecordsTableComponent {
  @Input() activeTab: DocumentsRecordsTab = 'documents';
  @Input() columns: DocumentsRecordsColumn[] = [];
  @Input() rows: DocumentsRecordsRow[] = [];
  @Input() minWidthClass = '';
  @Input() recordTrackKey = '';
  @Input() documentRoute: (row: DocumentsRecordsRow) => string = () => '';

  @Output() selectionChanged = new EventEmitter<DocumentsRecordsSelectionChange>();
  @Output() historyOpened = new EventEmitter<DocumentsRecordsRow>();

  rowTrackValue(row: DocumentsRecordsRow, index: number): string | number {
    const key = this.activeTab === 'documents' ? 'number' : this.recordTrackKey;
    return String(row[key] ?? index);
  }

  onSelectionChange(row: DocumentsRecordsRow, event: Event): void {
    this.selectionChanged.emit({
      row,
      selected: (event.target as HTMLInputElement).checked
    });
  }
}

