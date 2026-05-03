import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'text-area-control',
  standalone: true,
  template: `
    <label class="grid gap-siaf-md">
      @if (title) {
        <span class="text-sm font-bold uppercase text-text">{{ title }}</span>
      }
      <span class="relative block w-full">
        @if (floatingLabel) {
          <span
            class="absolute -top-2.5 left-3 z-[1] rounded-siaf-sm bg-surface px-siaf-xxs text-xs font-medium leading-normal"
            [class]="labelClass"
          >
            {{ placeholder }}
          </span>
        }
        <span
          class="flex min-h-[60px] items-start rounded-siaf-md border px-siaf-md py-siaf-xs transition"
          [class]="containerClass"
        >
          <textarea
            class="min-h-11 flex-1 resize-none bg-transparent text-sm leading-6 tracking-[0.0249px] text-[var(--sys-color-text-neutral-medium)] outline-none placeholder:text-[var(--sys-color-text-neutral-low)] disabled:cursor-not-allowed disabled:text-[var(--sys-color-text-neutral-disabled)]"
            [attr.maxlength]="maxlength"
            [placeholder]="floatingLabel ? '' : placeholder"
            [value]="value"
            [disabled]="disabled"
            (focus)="onFocus()"
            (blur)="onBlur()"
            (input)="onInput($event)"
          ></textarea>
        </span>
      </span>
      <span class="-mt-1 text-right text-xs text-text-muted">{{ charCount }}/{{ maxlength }}</span>
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextAreaControlComponent implements OnChanges {
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() title = '';
  @Input() placeholder = '';
  @Input() value = '';
  @Input() disabled = false;
  @Input() maxlength = 500;

  @Output() valueChange = new EventEmitter<string>();

  focused = false;
  charCount = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      this.charCount = (this.value ?? '').length;
    }
  }

  get hasValue(): boolean {
    return (this.value ?? '').length > 0;
  }

  get floatingLabel(): boolean {
    return this.focused || this.hasValue;
  }

  get labelClass(): string {
    if (this.disabled) {
      return 'text-[var(--sys-color-text-neutral-disabled)]';
    }

    return this.focused
      ? 'text-[var(--sys-color-text-neutral-activated)]'
      : 'text-[var(--sys-color-text-neutral-low)]';
  }

  get containerClass(): string {
    if (this.disabled) {
      return 'border-[var(--sys-color-border-states-disabled)] bg-[var(--sys-color-bg-surfaces-disabled)] cursor-not-allowed';
    }

    if (this.focused) {
      return 'border-2 border-[var(--sys-color-border-states-focus)] bg-surface';
    }

    return 'border-[var(--sys-color-border-states-enabled)] bg-surface hover:border-2 hover:border-[var(--sys-color-border-states-hover)]';
  }

  onFocus(): void {
    this.focused = true;
    this.cdr.markForCheck();
  }

  onBlur(): void {
    this.focused = false;
    this.cdr.markForCheck();
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.charCount = value.length;
    this.valueChange.emit(value);
    this.cdr.markForCheck();
  }
}
