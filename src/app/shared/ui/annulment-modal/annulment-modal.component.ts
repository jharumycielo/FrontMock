import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';

export type AnnulmentModalStep = 1 | 2 | 3;

@Component({
  selector: 'siaf-annulment-modal',
  standalone: true,
  imports: [ButtonComponent, IconComponent],
  template: `
    @if (open) {
      <div class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-siaf-md" role="presentation">
        <section
          class="relative flex max-h-[calc(100vh-32px)] w-full max-w-[500px] flex-col gap-siaf-lg overflow-y-auto rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-highest)] px-siaf-lg pb-siaf-lg pt-12 shadow-siaf-lg"
          role="dialog"
          aria-modal="true"
          aria-label="Confirmacion de solicitud de anulacion"
        >
          <button class="absolute right-siaf-lg top-siaf-lg grid size-6 place-items-center rounded-siaf-sm text-[var(--sys-color-text-neutral-medium)] hover:bg-surface-muted" type="button" (click)="closed.emit()">
            <siaf-icon name="close" [size]="20" label="Cerrar" [decorative]="false" />
          </button>

          <div class="flex flex-col items-center gap-siaf-md px-0 text-center sm:px-siaf-lg">
            <h2 class="w-full text-base font-medium text-[var(--sys-color-text-neutral-high)]">Confirmacion de solicitud de anulacion</h2>
            <p class="w-full text-sm font-normal tracking-[0.024px] text-[var(--sys-color-text-neutral-medium)]">
              Esta a punto de solicitar la anulacion de este documento. Una vez enviada la solicitud, no podra revertir este proceso. Desea continuar?
            </p>
          </div>

          <div class="flex flex-col gap-siaf-lg px-0 sm:px-siaf-lg">
            <label class="relative flex min-h-[60px] flex-col rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface px-siaf-md py-siaf-xs">
              @if (step > 1) {
                <span class="absolute -top-2.5 left-3 bg-surface px-1 text-xs font-medium text-[var(--sys-color-text-neutral-low)]">
                  Detalle de anulacion<span class="font-bold text-[var(--figma-color-palette-red-800)]">*</span>
                </span>
              }
              <textarea
                class="min-h-11 resize-none bg-transparent text-sm text-[var(--sys-color-text-neutral-medium)] outline-none placeholder:text-[var(--sys-color-text-neutral-low)]"
                [placeholder]="step === 1 ? 'Detalle de anulacion*' : ''"
                [value]="step > 1 ? detailValue : ''"
              ></textarea>
            </label>
            <div class="flex justify-end px-siaf-md text-xs text-[var(--sys-color-text-neutral-medium)]">0/1000</div>

            <section class="flex flex-col gap-siaf-md">
              <div class="flex flex-col gap-0.5 text-sm">
                <h3 class="font-bold tracking-[-0.02px] text-[var(--sys-color-text-neutral-high)]">{{ uploadTitle }}</h3>
                <p class="font-normal tracking-[0.024px] text-[var(--sys-color-text-neutral-medium)]">{{ uploadDescription }}</p>
              </div>

              <div
                class="relative flex flex-col items-center justify-center gap-siaf-sm rounded-siaf-md border border-dashed border-[var(--sys-color-border-states-enabled)] px-siaf-sm py-siaf-xs sm:flex-row"
                [class.border-brand-primary]="step === 2"
                [class.bg-surface-muted]="step === 2"
              >
                <button
                  class="relative inline-flex min-h-8 items-center justify-center gap-siaf-xs rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] px-siaf-md py-siaf-xxs text-sm font-medium disabled:border-0 disabled:bg-[var(--sys-color-bg-states-dark-disabled)] disabled:text-[var(--sys-color-text-neutral-disabled)]"
                  type="button"
                  [disabled]="step === 3"
                >
                  @if (step !== 3) {
                    <img class="size-5" src="assets/figma/modal-annulment/file-upload.svg" alt="" />
                  }
                  {{ step === 3 ? 'Button' : 'Elegir archivo' }}
                </button>
                <span class="text-sm text-[var(--sys-color-text-neutral-medium)]">o soltar archivo</span>

                @if (step === 2) {
                  <div class="pointer-events-none absolute right-4 top-0 hidden sm:block">
                    <div class="flex items-center gap-1 rounded-full bg-brand-primary px-siaf-xs py-siaf-xxs text-xs font-bold text-white shadow-siaf-md">
                      <img class="size-6" src="assets/figma/modal-annulment/xls-file.svg" alt="" />
                      Sustento.pdf
                    </div>
                    <img class="ml-20 mt-1 h-4 w-[15px] drop-shadow" src="assets/figma/modal-annulment/cursor-pointinghand.svg" alt="" />
                  </div>
                }
              </div>

              <p class="truncate text-sm tracking-[0.024px] text-[var(--sys-color-text-neutral-medium)]">
                {{ step === 3 ? 'Solo admite archivos .pdf' : 'Solo admite archivos .jpg, .png, .svg y zip' }}
              </p>

              @if (step === 3) {
                <div class="flex items-center gap-siaf-sm rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface p-siaf-md">
                  <img class="size-8" src="assets/figma/modal-annulment/xls-file.svg" alt="" />
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-bold tracking-[-0.02px] text-[var(--sys-color-text-neutral-medium)]">Sustento.pdf</p>
                    <p class="text-xs text-[var(--sys-color-text-neutral-medium)]">500kb</p>
                  </div>
                  <button class="grid size-6 place-items-center rounded-full hover:bg-surface-muted" type="button">
                    <img class="size-5" src="assets/figma/modal-annulment/cancel.svg" alt="Quitar archivo" />
                  </button>
                </div>
              }
            </section>
          </div>

          <footer class="flex flex-col-reverse justify-end gap-siaf-xs sm:flex-row">
            <siaf-button variant="secondary" (click)="closed.emit()">Cancelar</siaf-button>
            <siaf-button [variant]="step === 3 ? 'danger' : 'secondary'" [disabled]="step !== 3" (click)="accepted.emit()">Aceptar</siaf-button>
          </footer>
        </section>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnnulmentModalComponent {
  @Input() open = false;
  @Input() step: AnnulmentModalStep = 1;
  @Input() detailValue = 'Por cambio en los alcances de la Ley 1440';
  @Input() uploadTitle = 'Title Section';
  @Input() uploadDescription = 'The quick brown fox jumps over the lazy dog';
  @Output() closed = new EventEmitter<void>();
  @Output() accepted = new EventEmitter<void>();
}
