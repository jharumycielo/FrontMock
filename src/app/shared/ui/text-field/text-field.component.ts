import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, forwardRef, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { IconComponent } from '../icon/icon.component';
import { SelectOption, SelectOptionsComponent } from '../select-options/select-options.component';

export interface TextFieldOption {
  label: string;
  value: string;
}

type TextFieldType = 'text' | 'number' | 'email' | 'correo' | 'select' | 'select-multiple';
type TextFieldState = 'enabled' | 'error' | 'success';

@Component({
  selector: 'siaf-text-field',
  standalone: true,
  imports: [IconComponent, SelectOptionsComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextFieldComponent),
      multi: true
    }
  ],
  template: `
    <label class="grid gap-1.5">
      <span class="relative block w-full">
        @if (floatingLabel) {
          <span class="absolute -top-2.5 left-3 z-[1] rounded-siaf-sm bg-surface px-siaf-xxs text-xs font-medium leading-normal" [class]="labelClass">
            {{ labelText }}
          </span>
        }

        @if (isSelect) {
          <button
            class="flex w-full items-center rounded-siaf-md border bg-surface px-siaf-md text-left text-sm text-text outline-none transition disabled:cursor-not-allowed disabled:border-[var(--sys-color-border-states-disabled)] disabled:bg-[var(--sys-color-bg-surfaces-disabled)] disabled:text-[var(--sys-color-text-neutral-disabled)]"
            [class]="controlClass"
            [class.h-10]="type === 'select'"
            [class.min-h-28]="type === 'select-multiple'"
            type="button"
            [disabled]="disabled"
            [attr.aria-expanded]="selectOpen"
            [attr.aria-label]="labelText"
            aria-haspopup="listbox"
            (click)="toggleSelect()"
            (keydown.escape)="closeSelect()"
          >
            <span class="min-w-0 flex-1 truncate" [class.text-[var(--sys-color-text-neutral-low)]]="!hasValue">
              {{ selectDisplayText }}
            </span>
            <siaf-icon class="shrink-0 text-text transition" [class.rotate-180]="selectOpen" name="expand_more" [size]="24" />
          </button>

          @if (selectOpen) {
            <button class="fixed inset-0 z-30 cursor-default bg-transparent" type="button" aria-label="Cerrar opciones" (click)="closeSelect()"></button>
            <div class="absolute left-0 right-0 top-[calc(100%+4px)] z-40">
              <siaf-select-options
                [options]="selectOptions"
                [selectedValue]="selectValue"
                [selectedValues]="selectValues"
                [multiple]="type === 'select-multiple'"
                (selected)="onOptionSelected($event)"
              />
            </div>
          }
        } @else {
          <input
            class="h-10 w-full rounded-siaf-md border bg-surface px-siaf-md text-sm text-text outline-none transition placeholder:text-[var(--sys-color-text-neutral-low)] disabled:cursor-not-allowed disabled:border-[var(--sys-color-border-states-disabled)] disabled:bg-[var(--sys-color-bg-surfaces-disabled)] disabled:text-[var(--sys-color-text-neutral-disabled)]"
            [class]="controlClass"
            [type]="inputType"
            [placeholder]="floatingLabel ? '' : labelText"
            [disabled]="disabled"
            [value]="internalValue"
            (focus)="focused = true"
            (blur)="onBlur()"
            (input)="onInput($event)"
          />
        }
      </span>

      @if (hint && !error) {
        <span class="text-xs" [class]="supportingClass">{{ hint }}</span>
      }

      @if (error) {
        <span class="text-xs text-[var(--sys-color-text-feedback-danger)]">{{ error }}</span>
      }
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextFieldComponent implements OnChanges, ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() state: TextFieldState = 'enabled';
  @Input() value: string | number | string[] = '';
  @Input() type: TextFieldType = 'text';
  @Input() options: TextFieldOption[] = [];
  @Input() disabled = false;

  @Output() valueChange = new EventEmitter<string | number | string[]>();

  focused = false;
  selectOpen = false;
  internalValue: string | number | string[] = '';

  private onChange: (value: string | number | string[]) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      this.internalValue = this.inputValue;
    }
  }

  get labelText(): string {
    return this.label || this.placeholder;
  }

  get floatingLabel(): boolean {
    return this.focused || this.hasValue;
  }

  get effectiveState(): TextFieldState {
    if (this.error) {
      return 'error';
    }

    if (this.state === 'success' || (this.hasValue && !this.focused)) {
      return 'success';
    }

    return this.state;
  }

  get controlClass(): string {
    if (this.disabled) {
      return '';
    }

    if (this.effectiveState === 'error') {
      return 'border-2 border-[var(--sys-color-border-feedback-danger)] hover:border-[var(--sys-color-border-feedback-danger)] focus:border-[var(--sys-color-border-feedback-danger)] focus:ring-0';
    }

    if (this.effectiveState === 'success') {
      return 'border-2 border-[var(--sys-color-border-feedback-success)] hover:border-[var(--sys-color-border-feedback-success)] focus:border-[var(--sys-color-border-feedback-success)] focus:ring-0';
    }

    return 'border-[var(--sys-color-border-states-enabled)] hover:border-2 hover:border-[var(--sys-color-border-states-hover)] focus:border-2 focus:border-[var(--sys-color-border-states-focus)] focus:ring-0';
  }

  get labelClass(): string {
    if (this.disabled) {
      return 'text-[var(--sys-color-text-neutral-disabled)]';
    }

    if (this.effectiveState === 'error') {
      return 'text-[var(--sys-color-text-feedback-danger)]';
    }

    if (this.effectiveState === 'success') {
      return 'text-[var(--sys-color-text-neutral-low)]';
    }

    return this.focused ? 'text-[var(--sys-color-text-neutral-activated)]' : 'text-[var(--sys-color-text-neutral-low)]';
  }

  get supportingClass(): string {
    if (this.effectiveState === 'success') {
      return 'text-[var(--sys-color-text-feedback-success)]';
    }

    return 'text-text-muted';
  }

  get hasValue(): boolean {
    return Array.isArray(this.internalValue) ? this.internalValue.length > 0 : String(this.internalValue || '').length > 0;
  }

  get isSelect(): boolean {
    return this.type === 'select' || this.type === 'select-multiple';
  }

  get inputType(): 'text' | 'number' | 'email' {
    if (this.type === 'correo') {
      return 'email';
    }

    if (this.type === 'select' || this.type === 'select-multiple') {
      return 'text';
    }

    return this.type;
  }

  get inputValue(): string | number {
    return Array.isArray(this.value) ? this.value.join(', ') : this.value;
  }

  get selectValue(): string {
    if (Array.isArray(this.internalValue)) {
      return '';
    }

    return String(this.internalValue || '');
  }

  get selectValues(): string[] {
    return Array.isArray(this.internalValue) ? this.internalValue : [];
  }

  get selectOptions(): SelectOption[] {
    return this.options;
  }

  get selectDisplayText(): string {
    if (!this.hasValue) {
      return this.labelText;
    }

    if (Array.isArray(this.internalValue)) {
      const selectedValues = this.internalValue;
      const selectedLabels = this.options
        .filter((option) => selectedValues.includes(option.value))
        .map((option) => option.label);

      return selectedLabels.join(', ');
    }

    return this.options.find((option) => option.value === this.selectValue)?.label || this.selectValue;
  }

  isSelected(value: string): boolean {
    return Array.isArray(this.internalValue) ? this.internalValue.includes(value) : this.internalValue === value;
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.internalValue = value;
    this.emitValue(value);
  }

  toggleSelect(): void {
    if (this.disabled) {
      return;
    }

    this.selectOpen = !this.selectOpen;
    this.focused = this.selectOpen;
  }

  closeSelect(): void {
    this.selectOpen = false;
    this.focused = false;
    this.onTouched();
  }

  onOptionSelected(value: string): void {
    if (this.type === 'select-multiple') {
      const currentValues = new Set(this.selectValues);
      if (currentValues.has(value)) {
        currentValues.delete(value);
      } else {
        currentValues.add(value);
      }

      const nextValue = Array.from(currentValues);
      this.internalValue = nextValue;
      this.emitValue(nextValue);
      return;
    }

    this.internalValue = value;
    this.emitValue(value);
    this.closeSelect();
  }

  writeValue(value: string | number | string[] | null): void {
    this.internalValue = value ?? '';
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: string | number | string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  onBlur(): void {
    this.focused = false;
    this.onTouched();
  }

  private emitValue(value: string | number | string[]): void {
    this.valueChange.emit(value);
    this.onChange(value);
  }
}
