import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'siaf-checkbox',
  standalone: true,
  template: `
    <label class="inline-flex items-start gap-3 text-sm text-text">
      <input
        class="mt-0.5 size-4 rounded border-border text-brand-primary focus:ring-brand-primary"
        type="checkbox"
        [checked]="checked"
        [disabled]="disabled"
      />
      <span>
        <span class="block font-medium">{{ label }}</span>
        @if (description) {
          <span class="block text-text-muted">{{ description }}</span>
        }
      </span>
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxComponent {
  @Input() label = '';
  @Input() description = '';
  @Input() checked = false;
  @Input() disabled = false;
}
