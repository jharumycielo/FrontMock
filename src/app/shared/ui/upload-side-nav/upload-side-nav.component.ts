import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';
import { TextFieldComponent, TextFieldOption } from '../text-field/text-field.component';
import { UploaderComponent } from '../uploader/uploader.component';

export type UploadSideNavVariant = 'default' | 'bulk-chart-accounts';

@Component({
  selector: 'siaf-upload-side-nav',
  standalone: true,
  imports: [ButtonComponent, IconComponent, TextFieldComponent, UploaderComponent],
  template: `
    @if (open) {
      <section class="fixed inset-y-0 left-0 right-0 z-50 bg-black/55 pl-0 lg:pl-[65px]" aria-modal="true" role="dialog" aria-labelledby="upload-side-nav-title" (click)="closePanel()">
        <aside class="absolute bottom-0 right-0 top-0 flex w-full max-w-[420px] flex-col overflow-hidden rounded-siaf-md bg-surface shadow-siaf-lg" (click)="$event.stopPropagation()">
          <header class="flex h-14 shrink-0 items-center gap-siaf-xs border-b border-[var(--sys-color-divider-strong,rgba(32,32,32,0.24))] px-siaf-md">
            <h2 id="upload-side-nav-title" class="m-0 flex-1 text-base font-bold uppercase leading-normal tracking-[0.02px] text-text">{{ title }}</h2>
            <button class="inline-flex size-10 items-center justify-center rounded-siaf-md text-text transition hover:bg-surface-muted active:bg-[rgba(32,32,32,0.12)]" type="button" aria-label="Cerrar" (click)="closePanel()">
              <siaf-icon name="close" [size]="24" />
            </button>
          </header>

          <div class="min-h-0 flex-1 overflow-y-auto bg-surface px-siaf-xl py-siaf-md">
            <div class="flex flex-col gap-siaf-lg">
              @if (variant === 'bulk-chart-accounts') {
                <section class="flex flex-col gap-siaf-md">
                  <h3 class="m-0 min-h-10 text-sm font-bold uppercase leading-10 text-text">Dato general de aplicacion</h3>
                  <div class="flex flex-col gap-2.5">
                    <siaf-input
                      label="Tipo de plan contable"
                      type="select"
                      [required]="true"
                      [options]="planTypeOptions"
                      [value]="planTypeValue"
                      (valueChange)="onPlanTypeChanged($event)"
                    />
                    <siaf-input
                      label="Plan contable actual por reemplazar"
                      type="select"
                      [required]="replacementPlanRequired"
                      [options]="replacementPlanOptions"
                      [value]="replacementPlanValue"
                      [disabled]="!replacementPlanRequired"
                      (valueChange)="onReplacementPlanChanged($event)"
                    />
                  </div>
                </section>
              }

              @if (variant === 'bulk-chart-accounts' && templateHref) {
                <p class="m-0 text-sm leading-normal tracking-[0.0249px] text-[var(--sys-color-text-neutral-medium)]">
                  Sube un archivo Excel en el formato correcto.<br />
                  Si no lo tienes,
                  <a
                    class="font-bold text-brand-primary underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                    [href]="templateHref"
                    [attr.download]="templateDownloadName || null"
                  >
                    descárgalo aquí.
                  </a>
                </p>
              } @else {
                <p class="m-0 text-sm leading-normal text-text">{{ description }}</p>
              }

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
            <siaf-button variant="primary" size="md" [disabled]="confirmDisabled" (click)="confirmUpload()">
              Aceptar
            </siaf-button>
          </div>
        </aside>
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadSideNavComponent {
  @Input() open = false;
  @Input() variant: UploadSideNavVariant = 'default';
  @Input() title = 'Cargar Documento de Sustento';
  @Input() description = 'Sube un archivo .PDF en el formato correcto.';
  @Input() accept = '.pdf';
  @Input() acceptedLabel = 'Solo admite archivos .pdf';
  @Input() hint = 'Se permiten archivos de 10 MB como máximo';
  @Input() maxSizeMb = 10;
  @Input() templateHref = '';
  @Input() templateDownloadName = '';
  @Input() planTypeOptions: TextFieldOption[] = [];
  @Input() replacementPlanOptions: TextFieldOption[] = [];
  @Input() planTypeValue = '';
  @Input() replacementPlanValue = '';
  @Input() replacementPlanRequired = false;

  @Output() closed = new EventEmitter<void>();
  @Output() fileSelected = new EventEmitter<File>();
  @Output() confirmed = new EventEmitter<File>();
  @Output() planTypeValueChange = new EventEmitter<string>();
  @Output() replacementPlanValueChange = new EventEmitter<string>();

  selectedFile: File | null = null;

  get confirmDisabled(): boolean {
    if (!this.selectedFile) {
      return true;
    }

    if (this.variant !== 'bulk-chart-accounts') {
      return false;
    }

    if (!this.planTypeValue) {
      return true;
    }

    return this.replacementPlanRequired && !this.replacementPlanValue;
  }

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

  onPlanTypeChanged(value: string | number | string[]): void {
    this.planTypeValueChange.emit(this.textValue(value));
  }

  onReplacementPlanChanged(value: string | number | string[]): void {
    this.replacementPlanValueChange.emit(this.textValue(value));
  }

  confirmUpload(): void {
    if (this.confirmDisabled || !this.selectedFile) {
      return;
    }

    this.confirmed.emit(this.selectedFile);
  }

  private textValue(value: string | number | string[]): string {
    return Array.isArray(value) ? value[0] ?? '' : String(value ?? '');
  }
}
