import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { IconComponent } from '../icon/icon.component';

export type SnackbarVariant =
  | 'custom'
  | 'changes-done'
  | 'record-done'
  | 'record-deleted'
  | 'changes-saved'
  | 'changes-undone'
  | 'request-uploaded'
  | 'file-uploaded'
  | 'creation-elaborated'
  | 'creation-verified'
  | 'modification-verified'
  | 'creation-approved'
  | 'modification-approved'
  | 'creation-observed'
  | 'modification-observed'
  | 'creation-rejected'
  | 'modification-rejected'
  | 'creation-deleted'
  | 'modification-deleted'
  | 'bulk-approved'
  | 'bulk-verified';

type SnackbarPreset = {
  text?: string;
  beforeStrong?: string;
  strong?: string;
  afterStrong?: string;
  requestType?: string;
  requestAction?: string;
  bulkStatus?: string;
};

const SNACKBAR_PRESETS: Record<Exclude<SnackbarVariant, 'custom'>, SnackbarPreset> = {
  'changes-done': {
    text: 'Los cambios se han realizado con éxito.'
  },
  'record-done': {
    text: 'El registro se ha realizado con éxito.'
  },
  'record-deleted': {
    text: 'El registro se ha eliminado con éxito.'
  },
  'changes-saved': {
    text: 'Los cambios se han guardado con éxito.'
  },
  'changes-undone': {
    text: 'Los cambios se deshicieron con éxito.'
  },
  'request-uploaded': {
    beforeStrong: 'La solicitud ',
    strong: 'DocEntregado001.xls',
    afterStrong: ' se ha subido con éxito.'
  },
  'file-uploaded': {
    beforeStrong: 'El archivo ',
    strong: 'DocEntregado001.xls',
    afterStrong: ' se ha subido con éxito.'
  },
  'creation-elaborated': {
    requestType: 'creación',
    requestAction: 'elaborado'
  },
  'creation-verified': {
    requestType: 'creación',
    requestAction: 'verificado'
  },
  'modification-verified': {
    requestType: 'modificación',
    requestAction: 'verificado'
  },
  'creation-approved': {
    requestType: 'creación',
    requestAction: 'aprobado'
  },
  'modification-approved': {
    requestType: 'modificación',
    requestAction: 'aprobado'
  },
  'creation-observed': {
    requestType: 'creación',
    requestAction: 'observado'
  },
  'modification-observed': {
    requestType: 'modificación',
    requestAction: 'observado'
  },
  'creation-rejected': {
    requestType: 'creación',
    requestAction: 'rechazado'
  },
  'modification-rejected': {
    requestType: 'modificación',
    requestAction: 'rechazado'
  },
  'creation-deleted': {
    requestType: 'creación',
    requestAction: 'eliminado'
  },
  'modification-deleted': {
    requestType: 'modificación',
    requestAction: 'eliminado'
  },
  'bulk-approved': {
    bulkStatus: 'aprobado'
  },
  'bulk-verified': {
    bulkStatus: 'verificado'
  }
};

@Component({
  selector: 'siaf-snackbar',
  standalone: true,
  imports: [IconComponent],
  template: `
    @if (open) {
      <div
        class="flex min-h-16 w-full max-w-[430px] items-center gap-siaf-xs rounded-siaf-md bg-[rgb(32_32_32/0.92)] p-siaf-md text-sm font-normal leading-normal tracking-[0.025px] text-white shadow-siaf-elevation-2"
        role="status"
      >
        <div class="flex min-w-0 flex-1 items-center gap-siaf-xs">
          <siaf-icon class="shrink-0 text-[var(--sys-color-icon-snackbar-success,var(--sys-color-icon-feedback-dark-success))]" name="check_circle" [size]="24" />

          <div class="min-w-0 flex-1">
            @if (message) {
              <p class="m-0">{{ message }}</p>
            } @else if (resolvedPreset.text) {
              <p class="m-0">{{ resolvedPreset.text }}</p>
            } @else if (resolvedPreset.requestAction) {
              <p class="m-0">
                <span>La solicitud de tipo </span>
                <span>{{ requestType || resolvedPreset.requestType }}</span>
                <span> número </span>
                <strong class="font-bold">{{ requestNumber }}</strong>
                <span> se ha </span>
                <strong class="font-bold">{{ requestAction || resolvedPreset.requestAction }}</strong>
                <span> con éxito.</span>
              </p>
            } @else if (resolvedPreset.bulkStatus) {
              <p class="m-0">
                <span>El estado de las solicitudes se ha actualizado a </span>
                <strong class="font-bold">{{ bulkStatus || resolvedPreset.bulkStatus }}</strong>
                <span> con éxito.</span>
              </p>
            } @else if (resolvedPreset.strong) {
              <p class="m-0">
                <span>{{ resolvedPreset.beforeStrong }}</span>
                <strong class="font-bold">{{ fileName || resolvedPreset.strong }}</strong>
                <span>{{ resolvedPreset.afterStrong }}</span>
              </p>
            } @else {
              <ng-content />
            }
          </div>
        </div>

        @if (dismissible) {
          <button
            class="-mr-1 inline-flex size-8 shrink-0 items-center justify-center rounded-siaf-sm text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            type="button"
            aria-label="Cerrar mensaje"
            (click)="closed.emit()"
          >
            <siaf-icon name="close" [size]="24" />
          </button>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SnackbarComponent {
  @Input() open = true;
  @Input() variant: SnackbarVariant = 'custom';
  @Input() message = '';
  @Input() fileName = '';
  @Input() requestType = '';
  @Input() requestNumber = '0001';
  @Input() requestAction = '';
  @Input() bulkStatus = '';
  @Input() dismissible = true;

  @Output() closed = new EventEmitter<void>();

  get resolvedPreset(): SnackbarPreset {
    if (this.variant === 'custom') {
      return {};
    }

    return SNACKBAR_PRESETS[this.variant];
  }
}
