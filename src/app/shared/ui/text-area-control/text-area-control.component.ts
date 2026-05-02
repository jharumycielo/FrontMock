import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'text-area-control',
  standalone: true,
  template: `
    <section class="grid gap-siaf-md">
      @if (title) {
        <h3 class="m-0 text-sm font-bold uppercase text-text">{{ title }}</h3>
      }
      <label class="flex min-h-[60px] items-start rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface px-siaf-md py-siaf-xs">
        <textarea
          class="min-h-11 flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-text-muted disabled:text-text-muted"
          maxlength="500"
          [placeholder]="placeholder"
          [value]="value"
          [disabled]="disabled"
          (input)="onInput($event)"
        ></textarea>
      </label>
      <span class="-mt-siaf-md text-right text-xs text-text-muted">{{ charCount }}/500</span>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextAreaControlComponent {
  @Input() title = '';
  @Input() placeholder = '';
  @Input() value = '';
  @Input() disabled = false;
  @Output() valueChange = new EventEmitter<string>();
  charCount = 0;

  onInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.charCount = value.length;
    this.valueChange.emit(value);
  }
}

