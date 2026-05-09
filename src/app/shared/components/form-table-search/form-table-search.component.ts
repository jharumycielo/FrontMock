import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { IconComponent } from '../../ui/icon/icon.component';

@Component({
  selector: 'siaf-form-table-search',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="flex w-full items-start gap-siaf-md">
      <label class="flex h-10 min-w-0 flex-1 items-center rounded-siaf-md border border-[var(--sys-color-border-states-enabled,rgba(32,32,32,0.4))] bg-surface px-siaf-md py-siaf-xs">
        <span class="sr-only">{{ ariaLabel }}</span>
        <input
          class="min-w-0 flex-1 bg-transparent text-sm leading-6 tracking-[0.0249px] text-[var(--sys-color-text-neutral-medium)] outline-none placeholder:text-[var(--sys-color-text-neutral-low)]"
          [placeholder]="placeholder"
          [value]="value"
          [disabled]="disabled"
          (input)="onInput($event)"
        />
      </label>

      <div class="flex shrink-0 items-start gap-siaf-xs">
        <button
          class="inline-flex size-10 items-center justify-center rounded-siaf-md text-text transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-dark-pressed)] disabled:cursor-not-allowed disabled:text-[var(--sys-color-text-neutral-disabled)] disabled:hover:bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          type="button"
          [attr.aria-label]="filterLabel"
          [disabled]="disabled"
          (click)="filter.emit()"
        >
          <siaf-icon name="filter_list" [size]="24" />
        </button>
        <button
          class="inline-flex size-10 items-center justify-center rounded-siaf-md text-text transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-dark-pressed)] disabled:cursor-not-allowed disabled:text-[var(--sys-color-text-neutral-disabled)] disabled:hover:bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          type="button"
          [attr.aria-label]="moreLabel"
          [disabled]="disabled"
          (click)="more.emit()"
        >
          <siaf-icon name="more_vert" [size]="24" />
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormTableSearchComponent {
  @Input() value = '';
  @Input() placeholder = 'Buscar';
  @Input() ariaLabel = 'Buscar';
  @Input() filterLabel = 'Filtrar';
  @Input() moreLabel = 'Mas opciones';
  @Input() disabled = false;

  @Output() valueChange = new EventEmitter<string>();
  @Output() filter = new EventEmitter<void>();
  @Output() more = new EventEmitter<void>();

  onInput(event: Event): void {
    this.valueChange.emit((event.target as HTMLInputElement).value);
  }
}
