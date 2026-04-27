import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

export interface StepperCardField {
  label: string;
  value: string | number;
  weight?: 'regular' | 'bold';
}

@Component({
  selector: 'siaf-stepper-card',
  standalone: true,
  imports: [NgClass],
  template: `
    <button
      class="relative flex w-full min-w-[180px] flex-col items-stretch rounded-siaf-md bg-surface text-left shadow-siaf-elevation-1 transition hover:shadow-siaf-elevation-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary sm:max-w-[210px]"
      [class.ring-1]="selected"
      [class.ring-brand-primary]="selected"
      type="button"
      [attr.aria-pressed]="selected"
      (click)="selectedChange.emit(!selected)"
    >
      <div class="relative flex w-full flex-col gap-siaf-md px-siaf-xl py-siaf-md">
        @for (field of fields; track field.label) {
          <div class="flex w-full min-w-0 flex-col gap-siaf-xxs">
            <span class="min-h-4 truncate text-[11px] font-medium uppercase tracking-[0.66px] text-[var(--sys-color-text-neutral-low)]">
              {{ field.label }}
            </span>
            <span
              class="h-6 truncate text-sm tracking-[-0.02px] text-[var(--sys-color-text-neutral-medium)]"
              [ngClass]="field.weight === 'regular' ? 'font-normal tracking-[0.024px]' : 'font-bold'"
            >
              {{ field.value }}
            </span>
          </div>
        }

        @if (selected) {
          <span class="absolute left-0 top-1/2 h-[86px] max-h-[calc(100%-32px)] w-[3px] -translate-y-1/2 rounded-r bg-brand-primary" aria-hidden="true"></span>
        }
      </div>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepperCardComponent {
  @Input() fields: StepperCardField[] = [];
  @Input() selected = false;
  @Output() selectedChange = new EventEmitter<boolean>();
}
