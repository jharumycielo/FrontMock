import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, forwardRef, inject, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { TextFieldComponent } from '../text-field/text-field.component';

@Component({
  selector: 'siaf-input',
  standalone: true,
  imports: [TextFieldComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <siaf-text-field
      [label]="label"
      [placeholder]="placeholder"
      [hint]="hint"
      [error]="error"
      [value]="value"
      [type]="normalizedType"
      [disabled]="disabled"
      (valueChange)="onValueChange($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputComponent implements ControlValueAccessor {
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() label = '';
  @Input() placeholder = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() value = '';
  @Input() type = 'text';
  @Input() disabled = false;

  @Output() valueChange = new EventEmitter<string>();

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  get normalizedType(): 'text' | 'number' | 'email' | 'correo' | 'password' {
    return this.type === 'number' || this.type === 'email' || this.type === 'correo' || this.type === 'password' ? this.type : 'text';
  }

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

  onValueChange(value: string | number | string[]): void {
    const nextValue = Array.isArray(value) ? value.join(', ') : String(value);
    this.value = nextValue;
    this.valueChange.emit(nextValue);
    this.onChange(nextValue);
    this.onTouched();
  }
}
