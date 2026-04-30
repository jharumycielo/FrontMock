import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type FlowStatus =
  | 'Elaborado'
  | 'Registrado'
  | 'Verificado'
  | 'Validado'
  | 'Revisado'
  | 'Generado'
  | 'En proceso'
  | 'Autorizado'
  | 'Firmado'
  | 'Aprobado'
  | 'Aceptado'
  | 'Publicado'
  | 'Procesado'
  | 'Observado'
  | 'Pendiente'
  | 'Fallido'
  | 'Eliminado'
  | 'Rechazado'
  | 'Anulado';

export type FlowStatusTagSize = 'standard' | 'small';
type FlowStatusTone = 'default' | 'info' | 'success' | 'warning' | 'danger';

const FLOW_STATUS_TONE: Record<FlowStatus, FlowStatusTone> = {
  Elaborado: 'default',
  Registrado: 'default',
  Verificado: 'info',
  Validado: 'info',
  Revisado: 'info',
  Generado: 'info',
  'En proceso': 'info',
  Autorizado: 'success',
  Firmado: 'success',
  Aprobado: 'success',
  Aceptado: 'success',
  Publicado: 'success',
  Procesado: 'success',
  Observado: 'warning',
  Pendiente: 'warning',
  Fallido: 'warning',
  Eliminado: 'danger',
  Rechazado: 'danger',
  Anulado: 'danger'
};

@Component({
  selector: 'siaf-flow-status-tag',
  standalone: true,
  imports: [NgClass],
  template: `
    <span
      class="inline-flex w-fit shrink-0 items-center justify-center rounded-siaf-sm border border-[var(--sys-color-border-states-enabled)] px-siaf-xs text-xs font-normal leading-none text-[var(--sys-color-text-brand-white)]"
      [ngClass]="statusClass"
    >
      {{ status }}
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlowStatusTagComponent {
  @Input() status: FlowStatus = 'Elaborado';
  @Input() size: FlowStatusTagSize = 'small';

  get statusClass(): string {
    const sizeClass = this.size === 'standard' ? 'min-h-6 py-siaf-xxs' : 'min-h-4';
    const toneClass: Record<FlowStatusTone, string> = {
      default: 'bg-[var(--sys-color-bg-feedback-dark-default)]',
      info: 'bg-[var(--sys-color-bg-feedback-dark-info)]',
      success: 'bg-[var(--sys-color-bg-feedback-dark-success)]',
      warning: 'bg-[var(--sys-color-bg-feedback-dark-warning)]',
      danger: 'bg-[var(--sys-color-bg-feedback-dark-danger)]'
    };

    return `${sizeClass} ${toneClass[FLOW_STATUS_TONE[this.status]]}`;
  }
}
