import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export interface StepItem {
  label: string;
  description?: string;
}

@Component({
  selector: 'siaf-steps',
  standalone: true,
  template: `
    <ol class="grid gap-3 md:grid-cols-3">
      @for (step of steps; track step.label; let index = $index) {
        <li class="rounded-siaf-lg border border-border bg-surface p-4" [class.border-brand-primary]="index + 1 === activeStep">
          <span class="flex size-7 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-[var(--sys-color-text-brand-white)]">{{ index + 1 }}</span>
          <h3 class="mt-3 text-sm font-semibold text-text">{{ step.label }}</h3>
          @if (step.description) {
            <p class="mt-1 text-sm text-text-muted">{{ step.description }}</p>
          }
        </li>
      }
    </ol>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepsComponent {
  @Input() steps: StepItem[] = [];
  @Input() activeStep = 1;
}
