import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'siaf-uploaded-file-card',
  standalone: true,
  imports: [IconComponent],
  template: `
    @if (file) {
      <div class="flex items-center gap-siaf-sm rounded-siaf-md border border-border bg-surface p-siaf-md">
        <siaf-icon name="description" [size]="32" class="shrink-0 text-text-muted" />
        <div class="flex min-w-0 flex-1 flex-col leading-normal text-text">
          <span class="truncate text-sm font-bold">{{ file.name }}</span>
          <span class="text-xs text-text-muted">{{ formattedSize }}</span>
        </div>
        @if (!readonly) {
          <div class="flex shrink-0 items-center gap-1">
            <button
              class="inline-flex size-6 items-center justify-center rounded-siaf-sm transition hover:bg-surface-muted"
              type="button"
              aria-label="Reemplazar archivo"
              (click)="replace.emit()"
            >
              <siaf-icon name="repeat" [size]="24" class="text-text-muted" />
            </button>
            <button
              class="inline-flex size-6 items-center justify-center rounded-siaf-sm transition hover:bg-surface-muted"
              type="button"
              aria-label="Quitar archivo"
              (click)="removed.emit()"
            >
              <siaf-icon name="cancel" [size]="24" class="text-text-muted" />
            </button>
          </div>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadedFileCardComponent {
  @Input() file: File | null = null;
  @Input() readonly = false;

  @Output() replace = new EventEmitter<void>();
  @Output() removed = new EventEmitter<void>();

  get formattedSize(): string {
    if (!this.file) {
      return '';
    }

    const bytes = this.file.size;

    if (bytes < 1024) {
      return `${bytes}B`;
    }

    if (bytes < 1048576) {
      return `${Math.round(bytes / 1024)}kb`;
    }

    return `${(bytes / 1048576).toFixed(1)}MB`;
  }
}
