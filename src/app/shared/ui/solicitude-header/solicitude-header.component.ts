import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';

export type SolicitudeHeaderType = 'readonly' | 'actions';

@Component({
  selector: 'siaf-solicitude-header',
  standalone: true,
  imports: [ButtonComponent, IconComponent, NgClass],
  template: `
    <header
      class="flex w-full flex-col gap-siaf-lg bg-surface px-siaf-lg py-siaf-md sm:flex-row sm:items-start sm:justify-between"
      [ngClass]="containerClass"
    >
      <div class="flex min-w-0 flex-1 items-start gap-siaf-xs">
        @if (showReturn) {
          <button
            class="inline-flex size-10 shrink-0 items-center justify-center rounded-siaf-md text-text-muted transition hover:bg-surface-muted hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            type="button"
            aria-label="Regresar"
            (click)="returned.emit()"
          >
            <siaf-icon name="arrow_back" [size]="24" />
          </button>
        }

        <div class="flex min-w-0 flex-1 flex-col gap-1">
          <div class="flex min-w-0 flex-wrap items-center gap-siaf-xs">
            <h1 class="m-0 min-w-0 truncate text-base font-bold uppercase leading-5 text-text">
              {{ heading }}
            </h1>

            @if (showTag) {
              <span
                class="inline-flex h-6 shrink-0 items-center rounded-siaf-sm bg-[var(--sys-color-bg-brand-accent)] px-siaf-xs text-xs font-medium leading-none text-white"
              >
                {{ tagLabel }}
              </span>
            }
          </div>

          @if (showSecondaryText && secondaryText) {
            <p class="m-0 text-[11px] font-medium uppercase leading-4 tracking-[0.66px] text-text-muted">
              {{ secondaryText }}
            </p>
          }
        </div>
      </div>

      @if (type === 'actions' && showButtonGroup) {
        <div class="flex w-full flex-wrap items-center justify-end gap-siaf-sm sm:w-auto sm:shrink-0">
          <siaf-button variant="secondary" size="md" icon="close" (click)="canceled.emit()">Cancelar</siaf-button>
          <siaf-button variant="secondary" size="md" icon="save" [disabled]="saveDisabled" (click)="saved.emit()">Grabar</siaf-button>
          <siaf-button size="md" icon="task_alt" [disabled]="verifyDisabled" (click)="verified.emit()">Verificar</siaf-button>
        </div>
      }
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SolicitudeHeaderComponent {
  @Input() type: SolicitudeHeaderType = 'readonly';
  @Input() heading = 'Heading name';
  @Input() secondaryText = 'Creacion';
  @Input() showSecondaryText = true;
  @Input() showButtonGroup = true;
  @Input() showReturn = false;
  @Input() showTag = true;
  @Input() tagLabel = 'Nuevo';
  @Input() saveDisabled = false;
  @Input() verifyDisabled = false;

  @Output() returned = new EventEmitter<void>();
  @Output() canceled = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();
  @Output() verified = new EventEmitter<void>();

  get containerClass(): string {
    return this.type === 'actions' ? 'min-h-[72px]' : 'min-h-[68px]';
  }
}
