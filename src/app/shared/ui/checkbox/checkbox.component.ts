import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, forwardRef, inject, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'siaf-checkbox',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true
    }
  ],
  template: `
    <label class="inline-flex items-start gap-3 text-sm text-text">
      <input
        class="mt-0.5 size-4 rounded border-border text-brand-primary focus:ring-brand-primary"
        type="checkbox"
        [checked]="checked"
        [disabled]="disabled"
        (change)="onInputChange($event)"
        (blur)="markTouched()"
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
export class CheckboxComponent implements ControlValueAccessor {
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() label = '';
  @Input() description = '';
  @Input() checked = false;
  @Input() disabled = false;

  @Output() checkedChange = new EventEmitter<boolean>();

  private onChange: (value: boolean) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: boolean | null): void {
    this.checked = !!value;
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  onInputChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.checked = checked;
    this.checkedChange.emit(checked);
    this.onChange(checked);
  }

  markTouched(): void {
    this.onTouched();
  }
}
