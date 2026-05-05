import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { IconComponent } from '../icon/icon.component';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

@Component({
  selector: 'siaf-select-options',
  standalone: true,
  imports: [NgClass, IconComponent],
  template: `
    <div
      class="max-h-72 w-full overflow-y-auto rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-highest)] py-siaf-xs shadow-siaf-elevation-1"
      role="listbox"
      [attr.aria-multiselectable]="multiple"
    >
      @for (option of options; track option.value) {
        <button
          class="flex min-h-12 w-full items-center gap-siaf-md px-siaf-md py-siaf-sm text-left text-sm leading-normal transition hover:bg-[var(--sys-color-bg-states-light-hover)] active:bg-[var(--sys-color-bg-states-light-pressed)] disabled:cursor-not-allowed disabled:text-[var(--sys-color-text-neutral-disabled)]"
          type="button"
          role="option"
          [disabled]="option.disabled"
          [attr.aria-selected]="isSelected(option.value)"
          [attr.tabindex]="option.disabled ? -1 : 0"
          [ngClass]="optionClass(option.value)"
          (click)="selected.emit(option.value)"
          (keydown.arrowDown)="focusSibling($event, 1)"
          (keydown.arrowUp)="focusSibling($event, -1)"
          (keydown.home)="focusBoundary($event, 'first')"
          (keydown.end)="focusBoundary($event, 'last')"
        >
          <span class="min-w-0 flex-1 truncate" [ngClass]="optionLabelClass(option.value)">{{ option.label }}</span>
          @if (isSelected(option.value)) {
            <siaf-icon
              class="shrink-0 text-[var(--sys-color-text-neutral-activated)]"
              name="check"
              [size]="20"
              aria-hidden="true"
            />
          }
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

  optionClass(value: string): Record<string, boolean> {
    return {
      'bg-[var(--sys-color-bg-states-light-selected)]': this.isSelected(value)
    };
  }

  optionLabelClass(value: string): Record<string, boolean> {
    return {
      'font-bold': this.isSelected(value),
      'text-[var(--sys-color-text-neutral-activated)]': this.isSelected(value),
      'text-[var(--sys-color-text-neutral-medium)]': !this.isSelected(value)
    };
  }

  focusSibling(event: Event, direction: 1 | -1): void {
    event.preventDefault();
    const options = this.enabledOptionButtons(event);
    const currentIndex = options.indexOf(event.currentTarget as HTMLButtonElement);
    const nextIndex = (currentIndex + direction + options.length) % options.length;
    options[nextIndex]?.focus();
  }

  focusBoundary(event: Event, boundary: 'first' | 'last'): void {
    event.preventDefault();
    const options = this.enabledOptionButtons(event);
    const index = boundary === 'first' ? 0 : options.length - 1;
    options[index]?.focus();
  }

  private enabledOptionButtons(event: Event): HTMLButtonElement[] {
    const listbox = (event.currentTarget as HTMLElement).closest('[role="listbox"]');
    if (!listbox) {
      return [];
    }

    return Array.from(listbox.querySelectorAll<HTMLButtonElement>('button[role="option"]:not(:disabled)'));
  }
}
