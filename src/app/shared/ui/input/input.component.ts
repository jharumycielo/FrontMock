import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'siaf-input',
  standalone: true,
  imports: [NgClass],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <label class="grid gap-1.5">
      @if (label) {
        <span class="text-sm font-medium text-text">{{ label }}</span>
      }

      <input
        class="h-10 w-full rounded-siaf-md border bg-surface px-3 text-sm text-text outline-none transition placeholder:text-text-muted focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted"
        [ngClass]="error ? 'border-[var(--sys-color-border-feedback-danger)] focus:border-[var(--sys-color-border-feedback-danger)] focus:ring-[var(--sys-color-border-feedback-danger)]' : 'border-border'"
        [type]="type"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [value]="value"
        (input)="onInput($event)"
        (blur)="markTouched()"
      />

      @if (hint && !error) {
        <span class="text-xs text-text-muted">{{ hint }}</span>
      }

      @if (error) {
        <span class="text-xs text-[var(--sys-color-text-feedback-danger)]">{{ error }}</span>
      }
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputComponent implements ControlValueAccessor {
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

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this.valueChange.emit(value);
    this.onChange(value);
  }

  markTouched(): void {
    this.onTouched();
  }
}
