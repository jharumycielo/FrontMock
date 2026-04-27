import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

@Component({
  selector: 'siaf-select-options',
  standalone: true,
  imports: [NgClass],
  template: `
    <div
      class="max-h-72 w-full overflow-y-auto rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-highest)] py-siaf-xs shadow-[0_8px_10px_rgba(0,0,0,0.14),0_3px_14px_rgba(0,0,0,0.12),0_5px_5px_rgba(0,0,0,0.2)]"
      role="listbox"
      [attr.aria-multiselectable]="multiple"
    >
      @for (option of options; track option.value) {
        <button
          class="flex min-h-12 w-full items-center gap-siaf-md px-siaf-md py-siaf-sm text-left text-sm font-normal leading-normal text-[var(--sys-color-text-neutral-medium)] transition hover:bg-[var(--sys-color-bg-states-light-hover)] active:bg-[var(--sys-color-bg-states-light-pressed)] disabled:cursor-not-allowed disabled:text-[var(--sys-color-text-neutral-disabled)]"
          type="button"
          role="option"
          [disabled]="option.disabled"
          [attr.aria-selected]="isSelected(option.value)"
          [ngClass]="{ 'bg-[var(--sys-color-bg-states-light-selected)]': isSelected(option.value) }"
          (click)="selected.emit(option.value)"
        >
          <span class="min-w-0 flex-1 truncate">{{ option.label }}</span>
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectOptionsComponent {
  @Input() options: SelectOption[] = [];
  @Input() selectedValue = '';
  @Input() selectedValues: string[] = [];
  @Input() multiple = false;

  @Output() selected = new EventEmitter<string>();

  isSelected(value: string): boolean {
    return this.multiple ? this.selectedValues.includes(value) : this.selectedValue === value;
  }
}
