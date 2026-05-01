import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type SolicitudeInfoField = {
  label: string;
  value: string;
};

@Component({
  selector: 'siaf-solicitude-info-card',
  standalone: true,
  template: `
    <section class="rounded-siaf-md bg-surface px-siaf-lg py-siaf-md">
      <div class="grid gap-siaf-xs">
        @for (field of fields; track field.label) {
          <div class="grid min-h-6 gap-siaf-xs md:grid-cols-[140px_1fr]">
            <span class="truncate text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">{{ field.label }}</span>
            <strong class="min-w-0 text-sm font-bold leading-6 text-text">{{ field.value }}</strong>
          </div>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SolicitudeInfoCardComponent {
  @Input() fields: SolicitudeInfoField[] = [];
}
