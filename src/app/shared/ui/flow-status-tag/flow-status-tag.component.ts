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

const FLOW_STATUS_CLASS: Record<FlowStatus, string> = {
  Elaborado: 'bg-[var(--sys-color-bg-status-flow-status-elaborado)]',
  Registrado: 'bg-[var(--sys-color-bg-status-flow-status-elaborado)]',
  Verificado: 'bg-[var(--sys-color-bg-status-flow-status-verificado)]',
  Validado: 'bg-[var(--sys-color-bg-status-flow-status-validado)]',
  Revisado: 'bg-[var(--sys-color-bg-status-flow-status-revisado)]',
  Generado: 'bg-[var(--sys-color-bg-status-flow-status-verificado)]',
  'En proceso': 'bg-[var(--sys-color-bg-status-flow-status-verificado)]',
  Autorizado: 'bg-[var(--sys-color-bg-status-flow-status-autorizado)]',
  Firmado: 'bg-[var(--sys-color-bg-status-flow-status-firmado)]',
  Aprobado: 'bg-[var(--sys-color-bg-status-flow-status-aprobado)]',
  Aceptado: 'bg-[var(--sys-color-bg-status-flow-status-aceptado)]',
  Publicado: 'bg-[var(--sys-color-bg-status-flow-status-aprobado)]',
  Procesado: 'bg-[var(--sys-color-bg-status-flow-status-aprobado)]',
  Observado: 'bg-[var(--sys-color-bg-status-flow-status-observado)]',
  Pendiente: 'bg-[var(--sys-color-bg-status-flow-status-observado)]',
  Fallido: 'bg-[var(--sys-color-bg-status-flow-status-observado)]',
  Eliminado: 'bg-[var(--sys-color-bg-status-flow-status-eliminado)]',
  Rechazado: 'bg-[var(--sys-color-bg-status-flow-status-rechazado)]',
  Anulado: 'bg-[var(--sys-color-bg-status-flow-status-anulado)]'
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
    return `${sizeClass} ${FLOW_STATUS_CLASS[this.status]}`;
  }
}
