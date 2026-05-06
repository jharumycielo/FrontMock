import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { IconComponent } from '../icon/icon.component';

export type RecordStatus = 'Activo' | 'Inactivo' | 'Anulado' | 'En Proceso' | 'Validado' | 'Eliminado';
export type RecordStatusTagSize = 'standard' | 'small';

type RecordStatusTone = 'info' | 'default' | 'danger';

const RECORD_STATUS_TONE: Record<RecordStatus, RecordStatusTone> = {
  Activo: 'info',
  Inactivo: 'default',
  Anulado: 'danger',
  'En Proceso': 'default',
  Validado: 'info',
  Eliminado: 'danger',
};

const RECORD_STATUS_ICON: Record<RecordStatus, string> = {
  Activo: 'check_circle',
  Inactivo: 'info',
  Anulado: 'assignment_late',
  'En Proceso': 'change_circle',
  Validado: 'check_circle',
  Eliminado: 'assignment_late',
};

@Component({
  selector: 'siaf-record-status-tag',
  standalone: true,
  imports: [IconComponent, NgClass],
  template: `
    <span
      class="inline-flex w-fit shrink-0 items-center justify-center gap-siaf-xs overflow-hidden rounded-siaf-sm border px-siaf-xs text-center text-xs font-normal leading-none"
      [ngClass]="tagClass"
    >
      <siaf-icon [name]="iconName" [size]="20" variant="filled" />
      <span class="inline-flex min-h-6 items-center justify-center py-siaf-xxs">
        {{ status }}
      </span>
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecordStatusTagComponent {
  @Input() status: RecordStatus = 'Activo';
  @Input() size: RecordStatusTagSize = 'small';

  get iconName(): string {
    return RECORD_STATUS_ICON[this.status];
  }

  get tagClass(): string {
    const sizeClass = this.size === 'standard' ? 'min-h-6 py-siaf-xxs' : 'min-h-4 py-0';
    const toneClass: Record<RecordStatusTone, string> = {
      info: 'border-[var(--sys-color-border-feedback-info)] bg-[var(--sys-color-bg-feedback-light-info)] text-[var(--sys-color-text-feedback-info)]',
      default: 'border-[var(--sys-color-border-feedback-default)] bg-[var(--sys-color-bg-feedback-light-default)] text-[var(--sys-color-text-feedback-default)]',
      danger: 'border-[var(--sys-color-border-feedback-danger)] bg-[var(--sys-color-bg-feedback-light-danger)] text-[var(--sys-color-text-feedback-danger)]',
    };

    return `${sizeClass} ${toneClass[RECORD_STATUS_TONE[this.status]]}`;
  }
}
