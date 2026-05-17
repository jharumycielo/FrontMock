import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { FlowStatus, FlowStatusTagComponent } from '../flow-status-tag/flow-status-tag.component';

@Component({
  selector: 'siaf-document-summary-card',
  standalone: true,
  imports: [FlowStatusTagComponent],
  template: `
    <article class="h-full rounded-siaf-md bg-surface px-siaf-lg py-siaf-md">
      <div class="flex items-start gap-siaf-xs lg:hidden">
        <div class="flex min-w-0 flex-1 flex-col gap-siaf-xxs">
          <span class="truncate text-[11px] font-medium uppercase leading-4 tracking-[0.66px] text-text-muted">{{ documentNumberLabel }}</span>
          <strong class="min-w-0 truncate text-sm font-bold leading-6 text-text">{{ documentNumber }}</strong>
        </div>
        <div class="flex min-w-0 flex-1 flex-col gap-siaf-xxs">
          <span class="truncate text-[11px] font-medium uppercase leading-4 tracking-[0.66px] text-text-muted">{{ statusLabel }}</span>
          <siaf-flow-status-tag [status]="status" size="standard" />
        </div>
      </div>

      <div class="hidden gap-siaf-xs lg:grid">
        <div class="grid min-h-6 gap-siaf-xs lg:grid-cols-[140px_1fr]">
          <span class="truncate text-[11px] font-medium uppercase leading-4 tracking-[0.66px] text-text-muted">{{ documentNumberLabel }}</span>
          <strong class="min-w-0 truncate text-sm font-bold leading-6 text-text">{{ documentNumber }}</strong>
        </div>
        <div class="grid min-h-6 gap-siaf-xs lg:grid-cols-[140px_1fr]">
          <span class="truncate text-[11px] font-medium uppercase leading-4 tracking-[0.66px] text-text-muted">{{ statusLabel }}</span>
          <siaf-flow-status-tag [status]="status" size="standard" />
        </div>
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentSummaryCardComponent {
  @Input() documentNumber = '';
  @Input() status: FlowStatus = 'Elaborado';
  @Input() documentNumberLabel = 'N° documento';
  @Input() statusLabel = 'Estado';
}
