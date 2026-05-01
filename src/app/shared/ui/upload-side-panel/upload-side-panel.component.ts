import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';
import { UploaderComponent } from '../uploader/uploader.component';

@Component({
  selector: 'siaf-upload-side-panel',
  standalone: true,
  imports: [ButtonComponent, IconComponent, UploaderComponent],
  template: `
    @if (open) {
      <section class="fixed inset-y-0 left-0 right-0 z-50 bg-black/55 pl-0 lg:pl-[65px]" aria-modal="true" role="dialog" aria-labelledby="upload-panel-title" (click)="closePanel()">
        <aside class="absolute bottom-0 right-0 top-0 flex w-full max-w-[420px] flex-col overflow-hidden rounded-siaf-md bg-surface shadow-[0_16px_22px_rgba(0,0,0,0.14),0_6px_30px_rgba(0,0,0,0.12),0_8px_10px_rgba(0,0,0,0.2)]" (click)="$event.stopPropagation()">
          <header class="flex h-14 shrink-0 items-center gap-siaf-xs border-b border-[var(--sys-color-divider-strong,rgba(32,32,32,0.24))] px-siaf-md">
            <h2 id="upload-panel-title" class="m-0 flex-1 text-base font-bold uppercase leading-normal tracking-[0.02px] text-text">{{ title }}</h2>
            <button class="inline-flex size-10 items-center justify-center rounded-siaf-md text-text transition hover:bg-surface-muted active:bg-[rgba(32,32,32,0.12)]" type="button" aria-label="Cerrar" (click)="closePanel()">
              <siaf-icon name="close" [size]="24" />
            </button>
          </header>

          <div class="min-h-0 flex-1 overflow-y-auto bg-surface px-siaf-xl py-siaf-md">
            <div class="flex flex-col gap-siaf-md">
              <p class="m-0 text-sm leading-normal text-text">{{ description }}</p>

              <siaf-uploader
                [accept]="accept"
                [hint]="hint"
                [maxSizeMb]="maxSizeMb"
                (fileSelected)="onFileSelected($event)"
                (allDone)="onAllDone($event)"
              />

              <p class="m-0 truncate text-sm text-text">{{ acceptedLabel }}</p>
            </div>
          </div>

          <div class="flex shrink-0 items-center justify-end gap-siaf-xs border-t border-[var(--sys-color-divider-strong,rgba(32,32,32,0.24))] px-siaf-md py-siaf-sm">
            <button class="inline-flex min-h-10 items-center justify-center rounded-siaf-md border border-[rgba(32,32,32,0.4)] px-siaf-md py-siaf-xs text-sm font-medium text-text transition hover:bg-surface-muted active:bg-[rgba(32,32,32,0.12)]" type="button" (click)="closePanel()">
              Cancelar
            </button>
            <siaf-button variant="primary" size="md" [disabled]="!selectedFile" (click)="confirmUpload()">
              Aceptar
            </siaf-button>
          </div>
        </aside>
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadSidePanelComponent {
  @Input() open = false;
  @Input() title = 'Cargar Documento de Sustento';
  @Input() description = 'Sube un archivo .PDF en el formato correcto.';
  @Input() accept = '.pdf';
  @Input() acceptedLabel = 'Solo admite archivos .pdf';
  @Input() hint = 'Se permiten archivos de 10 MB como máximo';
  @Input() maxSizeMb = 10;

  @Output() closed = new EventEmitter<void>();
  @Output() fileSelected = new EventEmitter<File>();
  @Output() confirmed = new EventEmitter<File>();

  selectedFile: File | null = null;

  closePanel(): void {
    this.closed.emit();
  }

  onFileSelected(file: File): void {
    this.selectedFile = file;
    this.fileSelected.emit(file);
  }

  onAllDone(files: File[]): void {
    const file = files[0];

    if (file) {
      this.onFileSelected(file);
    }
  }

  confirmUpload(): void {
    if (!this.selectedFile) {
      return;
    }

    this.confirmed.emit(this.selectedFile);
  }
}
