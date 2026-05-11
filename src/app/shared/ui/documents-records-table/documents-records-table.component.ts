import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { DocumentsRecordsColumn, DocumentsRecordsRow, DocumentsRecordsTab } from '../../types/documents-records.types';
import { FlowStatus, FlowStatusTagComponent } from '../flow-status-tag/flow-status-tag.component';
import { IconComponent } from '../icon/icon.component';
import { RecordStatus, RecordStatusTagComponent } from '../record-status-tag/record-status-tag.component';

export type DocumentsRecordsSelectionChange = {
  row: DocumentsRecordsRow;
  selected: boolean;
};

@Component({
  selector: 'siaf-documents-records-table',
  standalone: true,
  imports: [FlowStatusTagComponent, IconComponent, NgClass, RecordStatusTagComponent, RouterLink],
  template: `
    <div class="min-w-0 overflow-x-auto">
      <table class="w-full border-collapse text-left text-sm" [ngClass]="minWidthClass">
        <thead>
          <tr class="bg-surface-high text-[10px] font-bold uppercase text-text">
            <th class="w-10 rounded-l-siaf-sm px-siaf-sm py-siaf-sm"></th>
            @for (column of columns; track column.key) {
              <th class="px-siaf-md py-siaf-sm" [ngClass]="[column.widthClass || 'w-[180px]', column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left']">{{ column.label }}</th>
            }
            <th class="sticky right-0 w-14 rounded-r-siaf-sm border-l border-[var(--sys-color-divider-strong)] bg-surface-high px-siaf-sm py-siaf-sm"></th>
          </tr>
        </thead>
        <tbody>
          @for (row of rows; track rowTrackValue(row, $index)) {
            <tr class="border-b border-[var(--sys-color-divider-default)] bg-surface hover:bg-[var(--sys-color-bg-states-light-hover)]" [class.h-12]="activeTab === 'records'">
              <td class="h-[58px] px-siaf-sm py-siaf-xs">
                <input
                  class="size-4 disabled:cursor-not-allowed"
                  type="checkbox"
                  [checked]="row.selected"
                  [disabled]="selectionDisabled(row)"
                  (change)="onSelectionChange(row, $event)"
                />
              </td>
              @for (column of columns; track column.key) {
                <td class="px-siaf-md py-siaf-sm" [ngClass]="[column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left', column.kind === 'document-link' ? 'max-w-[360px]' : '']">
                  @if (column.kind === 'document-link') {
                    <a class="line-clamp-2 text-sm leading-normal text-text hover:text-brand-primary" [routerLink]="documentRoute(row)">{{ row[column.key] }}</a>
                  } @else if (column.kind === 'flow-status') {
                    <siaf-flow-status-tag [status]="flowStatus(row[column.key])" size="standard" />
                  } @else if (column.kind === 'record-status') {
                    <siaf-record-status-tag [status]="recordStatus(row[column.key])" size="standard" />
                  } @else {
                    {{ row[column.key] }}
                  }
                </td>
              }
              <td class="sticky right-0 border-l border-[var(--sys-color-divider-strong)] bg-surface px-siaf-sm py-siaf-xs">
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
  @Input() selectionDisabled: (row: DocumentsRecordsRow) => boolean = () => false;

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

  recordStatus(value: unknown): RecordStatus {
    const statuses: RecordStatus[] = ['Activo', 'Inactivo', 'Anulado', 'En Proceso', 'Validado', 'Eliminado'];
    return statuses.includes(value as RecordStatus) ? (value as RecordStatus) : 'Activo';
  }

  flowStatus(value: unknown): FlowStatus {
    const statuses: FlowStatus[] = [
      'Elaborado',
      'Registrado',
      'Verificado',
      'Validado',
      'Revisado',
      'Generado',
      'En proceso',
      'Autorizado',
      'Firmado',
      'Aprobado',
      'Aceptado',
      'Publicado',
      'Procesado',
      'Observado',
      'Pendiente',
      'Fallido',
      'Eliminado',
      'Rechazado',
      'Anulado'
    ];

    return statuses.includes(value as FlowStatus) ? (value as FlowStatus) : 'Elaborado';
  }
}

