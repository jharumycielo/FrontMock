import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { IconComponent } from '../icon/icon.component';

export interface SummaryCardField {
  label: string;
  value: string | number;
  icon?: string;
  iconLabel?: string;
}

@Component({
  selector: 'siaf-summary-card',
  standalone: true,
  imports: [IconComponent],
  template: `
    <section
      class="relative flex w-full flex-col gap-siaf-md rounded-siaf-md bg-surface p-siaf-md shadow-siaf-elevation-2 sm:flex-row sm:items-center"
      [class.pl-siaf-md]="showIndicator"
    >
      @if (showIndicator) {
        <span class="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r bg-brand-primary" aria-hidden="true"></span>
      }

      <div class="flex min-w-0 flex-1 flex-wrap items-center gap-siaf-md px-siaf-md">
        @for (field of fields; track field.label) {
          <div class="flex min-w-[160px] flex-1 basis-full flex-col gap-siaf-xxs sm:basis-[calc(50%-var(--sys-gap-base-md))] lg:basis-0">
            <span class="min-h-4 truncate text-[11px] font-medium uppercase tracking-[0.66px] text-[var(--sys-color-text-neutral-low)]">
              {{ field.label }}
            </span>

            <div class="flex h-6 min-w-0 items-center gap-siaf-xs overflow-hidden">
              <span class="truncate text-sm font-bold tracking-[-0.02px] text-[var(--sys-color-text-neutral-medium)]">
                {{ field.value }}
              </span>

              @if (field.icon) {
                <siaf-icon
                  class="shrink-0 text-[var(--sys-color-text-neutral-low)]"
                  [name]="field.icon"
                  [size]="24"
                  [label]="field.iconLabel || field.icon"
                  [decorative]="!field.iconLabel"
                />
              }
            </div>
          </div>
        }
      </div>

      @if (showClose) {
        <button
          class="grid size-10 shrink-0 place-items-center self-end rounded-siaf-md text-[var(--sys-color-text-neutral-medium)] transition hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary sm:self-center"
          type="button"
          [attr.aria-label]="closeLabel"
          (click)="closed.emit()"
        >
          <siaf-icon name="close" [size]="20" />
        </button>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryCardComponent {
  @Input() fields: SummaryCardField[] = [];
  @Input() showClose = true;
  @Input() showIndicator = true;
  @Input() closeLabel = 'Cerrar';
  @Output() closed = new EventEmitter<void>();
}
