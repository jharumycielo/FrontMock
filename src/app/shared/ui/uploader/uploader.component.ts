import {
  ChangeDetectionStrategy, Component, EventEmitter,
  Input, OnDestroy, Output, signal
} from '@angular/core';

import { IconComponent } from '../icon/icon.component';

export type UploadState = 'uploading' | 'done' | 'failed';

export interface UploadItem {
  id: string;
  file: File;
  state: UploadState;
  progress: number;
  remainingSeconds: number;
  sizeLabel: string;
  timer: ReturnType<typeof setInterval> | null;
}

@Component({
  selector: 'siaf-uploader',
  standalone: true,
  imports: [IconComponent],
  template: `
    <!-- Zona de drop — siempre visible -->
    @if (variant === 'extended') {
      <div
        class="relative flex w-full flex-col items-center justify-center gap-siaf-sm rounded-siaf-md border p-siaf-lg transition"
        [class.border-dashed]="!isDragOver()"
        [class.border-border]="!isDragOver()"
        [class.bg-surface]="!isDragOver()"
        [class.border-solid]="isDragOver()"
        [class.border-[var(--sys-color-border-states-hover)]]="isDragOver()"
        [class.bg-[var(--sys-color-bg-states-light-enabled)]]="isDragOver()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave()"
        (drop)="onDrop($event)"
      >
        <siaf-icon name="backup" [size]="42" class="text-brand-primary" />
        <div class="flex flex-col items-center gap-siaf-xs">
          <p class="text-sm text-text">
            Arrastrar o
            <label class="cursor-pointer font-bold text-brand-primary">
              elige archivo
              <input class="sr-only" type="file" [accept]="accept" [multiple]="multiple" (change)="onFileInput($event)" />
            </label>
            del computador
          </p>
          <p class="text-center text-xs text-text-muted">{{ hint }}</p>
        </div>

        @if (isDragOver() && dragFileName()) {
          <div class="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-brand-primary px-siaf-xs py-1">
            <siaf-icon name="description" [size]="20" class="shrink-0 text-brand-contrast" />
            <span class="max-w-[160px] truncate text-xs font-bold text-brand-contrast">{{ dragFileName() }}</span>
          </div>
        }
      </div>
    } @else {
      <div
        class="relative flex w-full items-center justify-center gap-siaf-sm rounded-siaf-md border px-siaf-sm py-siaf-xs transition"
        [class.border-dashed]="!isDragOver()"
        [class.border-border]="!isDragOver()"
        [class.bg-surface]="!isDragOver()"
        [class.border-solid]="isDragOver()"
        [class.border-[var(--sys-color-border-states-hover)]]="isDragOver()"
        [class.bg-[var(--sys-color-bg-states-light-enabled)]]="isDragOver()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave()"
        (drop)="onDrop($event)"
      >
        <label class="inline-flex cursor-pointer items-center gap-siaf-xs rounded-siaf-md border border-border bg-surface px-siaf-md py-siaf-xxs text-sm font-medium text-text transition hover:bg-surface-muted focus-within:border-2 focus-within:border-[var(--sys-color-border-states-focused)] focus-within:shadow-siaf-elevation-1">
          <siaf-icon name="file_upload" [size]="20" />
          Elegir archivo
          <input class="sr-only" type="file" [accept]="accept" [multiple]="multiple" (change)="onFileInput($event)" />
        </label>
        <span class="text-sm text-text">o soltar archivo</span>

        @if (isDragOver() && dragFileName()) {
          <div class="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full bg-brand-primary px-siaf-xs py-1">
            <siaf-icon name="description" [size]="20" class="shrink-0 text-brand-contrast" />
            <span class="max-w-[160px] truncate text-xs font-bold text-brand-contrast">{{ dragFileName() }}</span>
          </div>
        }
      </div>
    }

    <!-- Tarjetas de progreso — debajo de la zona de drop -->
    @for (item of uploads(); track item.id) {
      <div
        class="flex w-full flex-col gap-siaf-xs rounded-siaf-md border bg-surface p-siaf-md"
        [class.border-border]="item.state !== 'failed'"
        [class.border-[var(--sys-color-border-feedback-danger)]]="item.state === 'failed'"
      >
        <!-- Fila principal -->
        <div class="flex items-center gap-siaf-sm">

          <!-- Ícono de archivo (done/failed) -->
          @if (item.state !== 'uploading') {
            <siaf-icon
              name="description"
              [size]="32"
              class="shrink-0"
              [class.text-[var(--sys-color-text-feedback-danger)]]="item.state === 'failed'"
              [class.text-text-muted]="item.state === 'done'"
            />
          }

          <!-- Texto -->
          <div
            class="flex min-w-0 flex-1 flex-col leading-normal"
            [class.text-[var(--sys-color-text-feedback-danger)]]="item.state === 'failed'"
            [class.text-text]="item.state !== 'failed'"
          >
            <span class="truncate text-sm font-bold">
              {{ item.state === 'uploading' ? 'Subiendo...' : item.file.name }}
            </span>
            <span
              class="text-xs"
              [class.text-text-muted]="item.state !== 'failed'"
              [class.text-[var(--sys-color-text-feedback-danger)]]="item.state === 'failed'"
            >
              @if (item.state === 'uploading') {
                {{ item.progress }}% &bull; Quedan {{ item.remainingSeconds }}s
              } @else if (item.state === 'done') {
                {{ item.sizeLabel }}
              } @else {
                Upload failed
              }
            </span>
          </div>

          <!-- Acciones -->
          <div class="flex shrink-0 items-center gap-1">
            @if (item.state === 'uploading') {
              <button class="inline-flex size-6 items-center justify-center rounded-siaf-sm transition hover:bg-surface-muted" type="button" aria-label="Pausar" (click)="pauseItem(item)">
                <siaf-icon name="pause_circle" [size]="24" class="text-text-muted" />
              </button>
            } @else {
              <button class="inline-flex size-6 items-center justify-center rounded-siaf-sm transition hover:bg-surface-muted" type="button" aria-label="Reintentar" (click)="retryItem(item)">
                <siaf-icon
                  name="repeat"
                  [size]="24"
                  [class.text-[var(--sys-color-text-feedback-danger)]]="item.state === 'failed'"
                  [class.text-text-muted]="item.state === 'done'"
                />
              </button>
            }
            <button class="inline-flex size-6 items-center justify-center rounded-siaf-sm transition hover:bg-surface-muted" type="button" aria-label="Cancelar" (click)="removeItem(item)">
              <siaf-icon
                name="cancel"
                [size]="24"
                [class.text-[var(--sys-color-text-feedback-danger)]]="item.state === 'failed'"
                [class.text-text-muted]="item.state !== 'failed'"
              />
            </button>
          </div>
        </div>

        <!-- Barra de progreso -->
        @if (item.state === 'uploading') {
          <div class="relative h-2 w-full overflow-hidden rounded-full bg-[var(--sys-color-bg-surfaces-surface-high)]">
            <div
              class="absolute inset-y-0 left-0 rounded-full bg-brand-primary transition-all duration-300"
              [style.width.%]="item.progress"
            ></div>
          </div>
        }
      </div>
    }
  `,
  styles: `:host { display: flex; flex-direction: column; gap: var(--spacing-siaf-md); width: 100%; }`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploaderComponent implements OnDestroy {
  @Input() variant: 'extended' | 'compact' = 'extended';
  @Input() accept = '.pdf';
  @Input() hint = 'Se permiten archivos de 10 MB como máximo';
  @Input() maxSizeMb = 10;
  @Input() multiple = false;

  @Output() fileSelected = new EventEmitter<File>();
  @Output() allDone = new EventEmitter<File[]>();

  readonly isDragOver = signal(false);
  readonly dragFileName = signal('');
  readonly uploads = signal<UploadItem[]>([]);

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
    const file = event.dataTransfer?.items?.[0]?.getAsFile()
      ?? event.dataTransfer?.files?.[0];
    this.dragFileName.set(file?.name ?? '');
  }

  onDragLeave(): void {
    this.isDragOver.set(false);
    this.dragFileName.set('');
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
    this.dragFileName.set('');
    const files = Array.from(event.dataTransfer?.files ?? []);
    files.forEach((f) => this.addUpload(f));
  }

  onFileInput(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    files.forEach((f) => this.addUpload(f));
    (event.target as HTMLInputElement).value = '';
  }

  pauseItem(item: UploadItem): void {
    if (item.timer) {
      clearInterval(item.timer);
      item.timer = null;
    }
  }

  retryItem(item: UploadItem): void {
    this.startTimer(item);
  }

  removeItem(item: UploadItem): void {
    if (item.timer) clearInterval(item.timer);
    this.uploads.update((list) => list.filter((u) => u.id !== item.id));
  }

  ngOnDestroy(): void {
    this.uploads().forEach((u) => { if (u.timer) clearInterval(u.timer); });
  }

  private addUpload(file: File): void {
    const item: UploadItem = {
      id: `${Date.now()}-${Math.random()}`,
      file,
      state: file.size > this.maxSizeMb * 1024 * 1024 ? 'failed' : 'uploading',
      progress: 0,
      remainingSeconds: 30,
      sizeLabel: this.formatSize(file.size),
      timer: null
    };
    this.uploads.update((list) => [...list, item]);
    if (item.state === 'uploading') this.startTimer(item);
  }

  private startTimer(item: UploadItem): void {
    if (item.timer) clearInterval(item.timer);
    item.state = 'uploading';
    item.timer = setInterval(() => {
      if (item.progress >= 100) {
        clearInterval(item.timer!);
        item.timer = null;
        item.state = 'done';
        this.uploads.update((l) => [...l]);
        this.fileSelected.emit(item.file);
        const done = this.uploads().filter((u) => u.state === 'done').map((u) => u.file);
        if (this.uploads().every((u) => u.state !== 'uploading')) this.allDone.emit(done);
        return;
      }
      item.progress = Math.min(Math.round(item.progress + Math.random() * 8 + 2), 100);
      item.remainingSeconds = Math.max(0, Math.round((100 - item.progress) / 4));
      this.uploads.update((l) => [...l]);
    }, 300);
  }

  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1048576) return `${Math.round(bytes / 1024)}kb`;
    return `${(bytes / 1048576).toFixed(1)}MB`;
  }
}
