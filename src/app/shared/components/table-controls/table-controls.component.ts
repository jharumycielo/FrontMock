import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { IconComponent } from '../../ui/icon/icon.component';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'siaf-table-controls',
  standalone: true,
  imports: [IconComponent, PaginationComponent],
  template: `
    <div class="flex min-h-10 items-center gap-siaf-md">
      <label class="inline-flex h-10 w-10 shrink-0 items-center px-siaf-sm">
        <input
          class="size-4 accent-[var(--sys-color-icon-states-enabled)]"
          type="checkbox"
          [attr.aria-label]="selectAllLabel"
          [checked]="checked"
          [indeterminate]="indeterminate"
          [disabled]="disabled"
          (change)="selectionChange.emit(checkedValue($event))"
        />
      </label>

      @if (selectedCount > 0 && showEditAction) {
        <button
          class="inline-flex size-10 items-center justify-center rounded-siaf-md text-text-muted transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
          type="button"
          [attr.aria-label]="editLabel"
          [disabled]="editDisabled"
          (click)="edit.emit()"
        >
          <siaf-icon name="edit" [size]="24" />
        </button>
      }

      @if (selectedCount > 0 && showDeleteAction) {
        <button
          class="inline-flex size-10 items-center justify-center rounded-siaf-md text-text-muted transition hover:bg-surface-muted"
          type="button"
          [attr.aria-label]="deleteLabel"
          (click)="delete.emit()"
        >
          <siaf-icon name="delete" [size]="24" />
        </button>
      }

      @if (selectedCount > 0 && showMenuAction) {
        <button class="inline-flex size-10 items-center justify-center rounded-siaf-md text-text-muted transition hover:bg-surface-muted" type="button" [attr.aria-label]="menuLabel" (click)="menu.emit()">
          <siaf-icon name="more_vert" [size]="24" />
        </button>
      }

      <div class="ml-auto min-w-[220px]" [class.hidden]="hideTopPaginationOnMobile" [class.md:block]="hideTopPaginationOnMobile">
        <siaf-pagination navigation="Activate" position="Top" [page]="page" [pageSize]="pageSize" [totalItems]="totalItems" [totalPages]="totalPages" (previous)="previous.emit()" (next)="next.emit()" />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableControlsComponent {
  @Input() checked = false;
  @Input() indeterminate = false;
  @Input() selectedCount = 0;
  @Input() disabled = false;
  @Input() page = 1;
  @Input() pageSize = 25;
  @Input() totalItems = 0;
  @Input() totalPages = 1;
  @Input() showEditAction = false;
  @Input() showDeleteAction = false;
  @Input() showMenuAction = false;
  @Input() editDisabled = false;
  @Input() hideTopPaginationOnMobile = false;
  @Input() selectAllLabel = 'Seleccionar filas';
  @Input() editLabel = 'Editar fila seleccionada';
  @Input() deleteLabel = 'Eliminar filas seleccionadas';
  @Input() menuLabel = 'Mas opciones';

  @Output() selectionChange = new EventEmitter<boolean>();
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() menu = new EventEmitter<void>();
  @Output() previous = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  checkedValue(event: Event): boolean {
    return (event.target as HTMLInputElement).checked;
  }
}
