import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface RadioOption {
  label: string;
  value: string;
}

@Component({
  selector: 'siaf-radio-group',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioComponent),
      multi: true
    }
  ],
  template: `
    <fieldset class="grid gap-2">
      @if (label) {
        <legend class="text-sm font-medium text-text">{{ label }}</legend>
      }
      @for (option of options; track option.value) {
        <label class="inline-flex items-center gap-3 text-sm text-text">
          <input
            class="size-4 border-border text-brand-primary focus:ring-brand-primary"
            type="radio"
            [name]="name"
            [value]="option.value"
            [checked]="option.value === value"
            [disabled]="disabled"
            (change)="selectValue(option.value)"
            (blur)="markTouched()"
          />
          <span>{{ option.label }}</span>
        </label>
      }
    </fieldset>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadioComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() name = 'radio-group';
  @Input() value = '';
  @Input() options: RadioOption[] = [];
  @Input() disabled = false;

  @Output() valueChange = new EventEmitter<string>();

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  writeValue(value: string | null): void {
    this.value = value ?? '';
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  selectValue(value: string): void {
    if (this.disabled) {
      return;
    }

    this.value = value;
    this.valueChange.emit(value);
    this.onChange(value);
  }

  markTouched(): void {
    this.onTouched();
  }
}
