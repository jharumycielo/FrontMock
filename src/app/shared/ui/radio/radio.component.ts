import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export interface RadioOption {
  label: string;
  value: string;
}

@Component({
  selector: 'siaf-radio-group',
  standalone: true,
  template: `
    <fieldset class="grid gap-2">
      @if (label) {
        <legend class="text-sm font-medium text-text">{{ label }}</legend>
      }
      @for (option of options; track option.value) {
        <label class="inline-flex items-center gap-3 text-sm text-text">
          <input class="size-4 border-border text-brand-primary focus:ring-brand-primary" type="radio" [name]="name" [value]="option.value" [checked]="option.value === value" />
          <span>{{ option.label }}</span>
        </label>
      }
    </fieldset>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadioComponent {
  @Input() label = '';
  @Input() name = 'radio-group';
  @Input() value = '';
  @Input() options: RadioOption[] = [];
}
