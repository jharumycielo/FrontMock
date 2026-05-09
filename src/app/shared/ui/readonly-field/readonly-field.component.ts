import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'readonly-field',
  standalone: true,
  template: `
    <div class="relative flex min-h-10 items-center rounded-siaf-md bg-surface px-siaf-md py-siaf-xs">
      <span class="absolute -top-2.5 left-3 z-[1] rounded-siaf-sm bg-surface px-siaf-xxs text-xs font-medium text-text-muted">
        {{ captionText }}@if (required) { <span class="text-[var(--sys-color-text-feedback-danger)]">*</span> }
      </span>
      <span class="min-w-0 text-sm leading-normal tracking-[0.0249px] text-text">{{ displayValue }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReadonlyFieldComponent {
  @Input() caption = '';
  @Input() value = '';
  @Input() required = false;

  get captionText(): string {
    return this.caption.replace(/\s*\*$/, '');
  }

  get displayValue(): string {
    return this.value?.trim() ? this.value : '--';
  }
}

