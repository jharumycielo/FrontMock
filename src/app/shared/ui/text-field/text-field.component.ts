import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, forwardRef, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { IconComponent } from '../icon/icon.component';
import { SelectOption, SelectOptionsComponent } from '../select-options/select-options.component';

export interface TextFieldOption {
  label: string;
  value: string;
}

export type TextFieldType = 'text' | 'number' | 'email' | 'correo' | 'password' | 'select' | 'select-multiple';
export type TextFieldState = 'enabled' | 'error' | 'success';

@Component({
  selector: 'siaf-input',
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
            {{ labelText }}@if (required) { <span class="text-[var(--sys-color-text-feedback-danger)]">*</span> }
          </span>
        }

        @if (type === 'select') {
          <button
            class="flex h-10 w-full items-center rounded-siaf-md border bg-surface px-siaf-md text-left text-sm text-text outline-none transition disabled:cursor-not-allowed disabled:border-[var(--sys-color-border-states-disabled)] disabled:bg-[var(--sys-color-bg-surfaces-disabled)] disabled:text-[var(--sys-color-text-neutral-disabled)]"
            [class]="controlClass"
            type="button"
            [disabled]="disabled"
            [attr.aria-expanded]="selectOpen"
            [attr.aria-label]="labelText"
            aria-haspopup="listbox"
            (click)="toggleSelect()"
            (keydown.escape)="closeSelect()"
          >
            <span class="min-w-0 flex-1 truncate" [class.text-[var(--sys-color-text-neutral-low)]]="!hasValue">
              {{ selectDisplayText }}@if (!hasValue && required) { <span class="text-[var(--sys-color-text-feedback-danger)]">*</span> }
            </span>
            @if (clearable && hasValue && !required) {
              <span
                class="inline-flex size-6 shrink-0 items-center justify-center rounded-siaf-sm text-[var(--sys-color-text-neutral-medium)] transition hover:bg-[var(--sys-color-bg-states-light-enabled)]"
                role="button"
                tabindex="-1"
                [attr.aria-label]="'Limpiar ' + labelText"
                (click)="clearSelectValue($event)"
              >
                <siaf-icon name="close" [size]="18" />
              </span>
            }
            <siaf-icon class="shrink-0 text-text transition" [class.rotate-180]="selectOpen" name="expand_more" [size]="24" />
          </button>

          @if (selectOpen) {
            <button class="fixed inset-0 z-30 cursor-default bg-transparent" type="button" aria-label="Cerrar opciones" (click)="closeSelect()"></button>
            <div class="relative z-40 mt-siaf-xs sm:absolute sm:left-0 sm:right-0 sm:top-[calc(100%+4px)] sm:mt-0">
              <siaf-select-options
                [options]="selectOptions"
                [selectedValue]="selectValue"
                [selectedValues]="selectValues"
                (selected)="onOptionSelected($event)"
              />
            </div>
          }
        } @else if (type === 'select-multiple') {
          <button
            class="flex min-h-10 w-full flex-wrap items-center gap-siaf-xs rounded-siaf-md px-siaf-md py-siaf-xs text-left text-sm outline-none transition"
            [class]="controlClass"
            type="button"
            [disabled]="disabled"
            [attr.aria-expanded]="selectOpen"
            [attr.aria-label]="labelText"
            aria-haspopup="listbox"
            (click)="toggleSelect()"
            (keydown.escape)="closeSelect()"
          >
            @if (!hasValue) {
              <span class="flex-1 text-[var(--sys-color-text-neutral-low)]">{{ labelText }}@if (required) { <span class="text-[var(--sys-color-text-feedback-danger)]">*</span> }</span>
            }
            @for (val of selectValues; track val) {
              <span class="inline-flex items-center gap-siaf-xxs rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] px-siaf-xs py-0 text-text">
                <span class="text-sm leading-6">{{ labelForValue(val) }}</span>
                <span
                  class="inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full transition hover:bg-[rgba(32,32,32,0.08)]"
                  role="button"
                  tabindex="-1"
                  [attr.aria-label]="'Quitar ' + labelForValue(val)"
                  (click)="removeValue($event, val)"
                >
                  <siaf-icon name="close" [size]="16" />
                </span>
              </span>
            }
            @if (clearable && hasValue && !required) {
              <span
                class="inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-siaf-sm text-[var(--sys-color-text-neutral-medium)] transition hover:bg-[var(--sys-color-bg-states-light-enabled)]"
                role="button"
                tabindex="-1"
                [attr.aria-label]="'Limpiar ' + labelText"
                (click)="clearSelectValue($event)"
              >
                <siaf-icon name="close" [size]="18" />
              </span>
            }
            <siaf-icon class="ml-auto shrink-0 text-text transition" [class.rotate-180]="selectOpen" name="expand_more" [size]="24" />
          </button>

          @if (selectOpen) {
            <button class="fixed inset-0 z-30 cursor-default bg-transparent" type="button" aria-label="Cerrar opciones" (click)="closeSelect()"></button>
            <div class="relative z-40 mt-siaf-xs sm:absolute sm:left-0 sm:right-0 sm:top-[calc(100%+4px)] sm:mt-0">
              <siaf-select-options
                [options]="selectOptions"
                [selectedValues]="selectValues"
                [multiple]="true"
                (selected)="onOptionSelected($event)"
              />
            </div>
          }
        } @else {
          <span
            class="flex h-10 w-full items-center gap-siaf-xs rounded-siaf-md px-siaf-md text-sm text-text outline-none transition"
            [class]="controlClass"
          >
            @if (leadingIcon) {
              <siaf-icon class="shrink-0 text-[var(--sys-color-text-neutral-medium)]" [name]="leadingIcon" [size]="24" />
            }

            @if (!floatingLabel && required) {
              <span class="pointer-events-none shrink-0 text-[var(--sys-color-text-neutral-low)]">
                {{ labelText }}<span class="text-[var(--sys-color-text-feedback-danger)]">*</span>
              </span>
            }

            <input
              class="min-w-0 flex-1 bg-transparent text-sm leading-6 tracking-[0.0249px] text-[var(--sys-color-text-neutral-medium)] outline-none placeholder:text-[var(--sys-color-text-neutral-low)] disabled:cursor-not-allowed disabled:text-[var(--sys-color-text-neutral-disabled)]"
              [type]="inputType"
              [placeholder]="floatingLabel || required ? '' : labelText"
              [attr.aria-required]="required"
              [disabled]="disabled"
              [value]="internalValue"
              [attr.autocomplete]="autocomplete || null"
              (focus)="focused = true"
              (blur)="onBlur()"
              (input)="onInput($event)"
            />

            @if (error && !trailingIcon) {
              <siaf-icon class="shrink-0 text-[var(--sys-color-text-feedback-danger)]" name="error" [size]="20" aria-hidden="true" />
            }

            @if (trailingIcon) {
              <button
                class="inline-flex size-6 shrink-0 items-center justify-center rounded-siaf-sm text-[var(--sys-color-text-neutral-medium)] transition hover:bg-[rgba(32,32,32,0.08)] active:bg-[rgba(32,32,32,0.16)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:cursor-not-allowed disabled:text-[var(--sys-color-text-neutral-disabled)]"
                type="button"
                [disabled]="disabled"
                [attr.aria-label]="trailingButtonLabel || null"
                (click)="onTrailingAction($event)"
              >
                <siaf-icon [name]="trailingIcon" [size]="24" />
              </button>
            }
          </span>
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
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() label = '';
  @Input() placeholder = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() state: TextFieldState = 'enabled';
  @Input() value: string | number | string[] = '';
  @Input() type: TextFieldType = 'text';
  @Input() options: TextFieldOption[] = [];
  @Input() disabled = false;
  @Input() leadingIcon = '';
  @Input() trailingIcon = '';
  @Input() trailingButtonLabel = '';
  @Input() autocomplete = '';
  @Input() clearable = false;
  @Input() required = false;

  @Output() valueChange = new EventEmitter<string | number | string[]>();
  @Output() trailingAction = new EventEmitter<void>();

  focused = false;
  selectOpen = false;
  internalValue: string | number | string[] = '';

  private onChange: (value: string | number | string[]) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      this.internalValue = Array.isArray(this.value) ? this.value : this.inputValue;
    }
  }

  get labelText(): string {
    return this.label || this.placeholder;
  }

  get placeholderText(): string {
    return `${this.labelText}${this.required ? ' *' : ''}`;
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
      return 'cursor-not-allowed border border-[var(--sys-color-border-states-disabled)] bg-[var(--sys-color-bg-surfaces-disabled)] text-[var(--sys-color-text-neutral-disabled)]';
    }

    if (this.effectiveState === 'error') {
      return 'border-2 border-[var(--sys-color-border-feedback-danger)] bg-surface hover:border-[var(--sys-color-border-feedback-danger)] focus:border-[var(--sys-color-border-feedback-danger)] focus-within:border-[var(--sys-color-border-feedback-danger)] focus:ring-0';
    }

    if (this.effectiveState === 'success') {
      return 'border-2 border-[var(--sys-color-border-feedback-success)] bg-surface hover:border-[var(--sys-color-border-feedback-success)] focus:border-[var(--sys-color-border-feedback-success)] focus-within:border-[var(--sys-color-border-feedback-success)] focus:ring-0';
    }

    return 'border border-[var(--sys-color-border-states-enabled)] bg-surface hover:border-2 hover:border-[var(--sys-color-border-states-hover)] focus:border-2 focus:border-[var(--sys-color-border-states-focus)] focus-within:border-2 focus-within:border-[var(--sys-color-border-states-focus)] focus:ring-0';
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
    return this.type === 'select';
  }

  labelForValue(value: string): string {
    return this.options.find((o) => o.value === value)?.label ?? value;
  }

  removeValue(event: MouseEvent, value: string): void {
    event.preventDefault();
    event.stopPropagation();
    const next = this.selectValues.filter((v) => v !== value);
    this.internalValue = next;
    this.emitValue(next);
  }

  clearSelectValue(event: MouseEvent): void {
    if (this.required) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.internalValue = this.type === 'select-multiple' ? [] : '';
    this.emitValue(this.internalValue);
    this.closeSelect();
  }

  get inputType(): 'text' | 'number' | 'email' | 'password' {
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

  onTrailingAction(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.trailingAction.emit();
  }

  toggleSelect(): void {
    if (this.disabled) {
      return;
    }

    this.selectOpen = !this.selectOpen;
    this.focused = this.selectOpen;
    this.cdr.markForCheck();
  }

  closeSelect(): void {
    this.selectOpen = false;
    this.focused = false;
    this.onTouched();
    this.cdr.markForCheck();
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
