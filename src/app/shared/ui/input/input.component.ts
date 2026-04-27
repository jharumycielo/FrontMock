import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'siaf-input',
  standalone: true,
  imports: [NgClass],
  template: `
    <label class="grid gap-1.5">
      @if (label) {
        <span class="text-sm font-medium text-text">{{ label }}</span>
      }

      <input
        class="h-10 w-full rounded-siaf-md border bg-surface px-3 text-sm text-text outline-none transition placeholder:text-text-muted focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted"
        [ngClass]="error ? 'border-[#d92d20] focus:border-[#d92d20] focus:ring-[#d92d20]/20' : 'border-border'"
        [type]="type"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [value]="value"
      />

      @if (hint && !error) {
        <span class="text-xs text-text-muted">{{ hint }}</span>
      }

      @if (error) {
        <span class="text-xs text-[#d92d20]">{{ error }}</span>
      }
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputComponent {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() value = '';
  @Input() type = 'text';
  @Input() disabled = false;
}
