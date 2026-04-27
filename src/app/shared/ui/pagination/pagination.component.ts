import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { IconComponent } from '../icon/icon.component';

export type PaginationNavigation = 'Inactive' | 'Activate';
export type PaginationPosition = 'Top' | 'Bottom';

@Component({
  selector: 'siaf-pagination',
  standalone: true,
  imports: [IconComponent],
  template: `
    <nav
      class="flex w-full min-w-0 items-center gap-siaf-md text-xs text-text-muted"
      [class.justify-between]="position === 'Bottom' && rowPage"
      [class.justify-end]="!(position === 'Bottom' && rowPage)"
      aria-label="Paginacion"
    >
      @if (position === 'Bottom' && rowPage) {
        <div class="flex min-w-0 flex-1 items-center gap-siaf-xs">
          <span class="whitespace-nowrap">Filas por pagina:</span>
          <label class="relative block h-8 w-[82px]">
            <select
              class="h-8 w-full appearance-none rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface py-siaf-xxs pl-siaf-md pr-9 text-sm text-text outline-none transition hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              [value]="rowsPerPage"
              aria-label="Filas por pagina"
              (change)="onRowsPerPageChange($event)"
              (click)="rowsPerPageOpened.emit()"
              (keydown.enter)="rowsPerPageOpened.emit()"
              (keydown.space)="rowsPerPageOpened.emit()"
            >
              @for (option of rowsPerPageOptions; track option) {
                <option [value]="option">{{ option }}</option>
              }
            </select>
            <siaf-icon class="pointer-events-none absolute right-siaf-xs top-1/2 -translate-y-1/2 text-text" name="expand_more" [size]="24" />
          </label>
        </div>
      }

      <div class="flex h-10 shrink-0 items-center justify-end gap-siaf-md">
        <span class="whitespace-nowrap">{{ counterText }}</span>
        <div class="flex h-full items-center gap-siaf-xs">
          <button
            class="inline-flex size-10 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:cursor-not-allowed disabled:text-text-muted/60"
            type="button"
            [disabled]="previousDisabled"
            aria-label="Pagina anterior"
            (click)="previous.emit()"
          >
            <siaf-icon name="chevron_left" [size]="24" />
          </button>
          <button
            class="inline-flex size-10 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:cursor-not-allowed disabled:text-text-muted/60"
            type="button"
            [disabled]="nextDisabled"
            aria-label="Pagina siguiente"
            (click)="next.emit()"
          >
            <siaf-icon name="chevron_right" [size]="24" />
          </button>
        </div>
      </div>
    </nav>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginationComponent {
  @Input() page = 1;
  @Input() totalPages = 1;
  @Input() pageSize = 25;
  @Input() totalItems = 800;
  @Input() counterPage = '';
  @Input() navigation: PaginationNavigation = 'Inactive';
  @Input() position: PaginationPosition = 'Top';
  @Input() rowPage = false;
  @Input() rowsPerPage = 25;
  @Input() rowsPerPageOptions: number[] = [10, 25, 50, 100];

  @Output() previous = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() rowsPerPageOpened = new EventEmitter<void>();
  @Output() rowsPerPageChange = new EventEmitter<number>();

  get counterText(): string {
    if (this.counterPage) {
      return this.counterPage;
    }

    const start = this.totalItems === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
    const end = Math.min(this.page * this.pageSize, this.totalItems);

    return `${start}-${end} de ${this.totalItems}`;
  }

  get previousDisabled(): boolean {
    return this.page <= 1 || this.navigation === 'Inactive';
  }

  get nextDisabled(): boolean {
    return this.page >= this.totalPages || this.navigation === 'Inactive';
  }

  onRowsPerPageChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    this.rowsPerPageChange.emit(value);
  }
}
