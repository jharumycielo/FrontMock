import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { ButtonComponent } from '../../ui/button/button.component';
import { IconComponent } from '../../ui/icon/icon.component';

export type SolicitudeHeaderType = 'readonly' | 'actions';
export type SolicitudeHeaderRole = 'creator' | 'reviewer' | 'approver';
export type SolicitudeHeaderState =
  | 'new'
  | 'edit'
  | 'readonly'
  | 'elaborated'
  | 'registered'
  | 'verified'
  | 'validated'
  | 'reviewed'
  | 'generated'
  | 'in_process'
  | 'authorized'
  | 'signed'
  | 'approved'
  | 'accepted'
  | 'published'
  | 'processed'
  | 'observed'
  | 'pending'
  | 'failed'
  | 'deleted'
  | 'rejected'
  | 'annulled';
export type SolicitudeHeaderTagTone = 'accent' | 'info';
export type SolicitudeHeaderButtonTone = 'primary' | 'secondary' | 'accent';

type SolicitudeHeaderConfig = {
  type: SolicitudeHeaderType;
  showTag: boolean;
  tagLabel: string;
  tagTone: SolicitudeHeaderTagTone;
  saveVariant: SolicitudeHeaderButtonTone;
  showDelete: boolean;
  showEdit: boolean;
  showVerify: boolean;
};

const CREATOR_HEADER_CONFIG: Partial<Record<SolicitudeHeaderState, SolicitudeHeaderConfig>> = {
  new: {
    type: 'actions',
    showTag: true,
    tagLabel: 'Nuevo',
    tagTone: 'accent',
    saveVariant: 'secondary',
    showDelete: false,
    showEdit: false,
    showVerify: true
  },
  edit: {
    type: 'actions',
    showTag: true,
    tagLabel: 'Edición',
    tagTone: 'info',
    saveVariant: 'accent',
    showDelete: false,
    showEdit: false,
    showVerify: false
  },
  elaborated: {
    type: 'readonly',
    showTag: false,
    tagLabel: '',
    tagTone: 'accent',
    saveVariant: 'secondary',
    showDelete: true,
    showEdit: true,
    showVerify: true
  },
  verified: {
    type: 'readonly',
    showTag: false,
    tagLabel: '',
    tagTone: 'accent',
    saveVariant: 'secondary',
    showDelete: false,
    showEdit: false,
    showVerify: false
  },
  deleted: {
    type: 'readonly',
    showTag: false,
    tagLabel: '',
    tagTone: 'accent',
    saveVariant: 'secondary',
    showDelete: false,
    showEdit: false,
    showVerify: false
  },
  readonly: {
    type: 'readonly',
    showTag: false,
    tagLabel: '',
    tagTone: 'accent',
    saveVariant: 'secondary',
    showDelete: true,
    showEdit: true,
    showVerify: true
  }
};

const HEADER_CONFIG_BY_ROLE: Partial<Record<SolicitudeHeaderRole, Partial<Record<SolicitudeHeaderState, SolicitudeHeaderConfig>>>> = {
  creator: CREATOR_HEADER_CONFIG
};

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

            @if (resolvedShowTag) {
              <span
                class="inline-flex h-6 shrink-0 items-center rounded-siaf-sm px-siaf-xs text-xs font-medium leading-none text-white"
                [ngClass]="tagClass"
              >
                {{ resolvedTagLabel }}
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

      @if (resolvedType === 'actions' && showButtonGroup) {
        <div class="flex w-full flex-wrap items-center justify-end gap-siaf-sm sm:w-auto sm:shrink-0">
          <siaf-button variant="secondary" size="md" icon="close" (click)="canceled.emit()">Cancelar</siaf-button>
          <siaf-button [variant]="resolvedSaveVariant" size="md" icon="save" [disabled]="saveDisabled" (click)="saved.emit()">Grabar</siaf-button>
          @if (resolvedShowVerify) {
            <siaf-button size="md" icon="task_alt" [disabled]="verifyDisabled" (click)="verified.emit()">{{ verifyLabel }}</siaf-button>
          }
        </div>
      }

      @if (resolvedType === 'readonly' && showButtonGroup) {
        <div class="flex w-full flex-wrap items-center justify-end gap-siaf-sm sm:w-auto sm:shrink-0">
          @if (resolvedShowDelete) {
            <siaf-button variant="secondary" size="md" icon="delete" (click)="deleted.emit()">{{ deleteLabel }}</siaf-button>
          }
          @if (resolvedShowEdit) {
            <siaf-button variant="secondary" size="md" icon="edit" (click)="edited.emit()">{{ editLabel }}</siaf-button>
          }
          @if (resolvedShowVerify) {
            <siaf-button size="md" icon="task_alt" [disabled]="verifyDisabled" (click)="verified.emit()">{{ verifyLabel }}</siaf-button>
          }
        </div>
      }
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SolicitudeHeaderComponent {
  // Matriz reusable: cada rol y estado define las acciones y etiquetas visibles del header.
  @Input() role: SolicitudeHeaderRole | '' = '';
  @Input() state: SolicitudeHeaderState | '' = '';
  @Input() type: SolicitudeHeaderType = 'readonly';
  @Input() heading = 'Heading name';
  @Input() secondaryText = 'Creacion';
  @Input() showSecondaryText = true;
  @Input() showButtonGroup = true;
  @Input() showReturn = false;
  @Input() showTag = true;
  @Input() tagLabel = 'Nuevo';
  @Input() tagTone: SolicitudeHeaderTagTone = 'accent';
  @Input() saveVariant: SolicitudeHeaderButtonTone = 'secondary';
  @Input() saveDisabled = false;
  @Input() verifyDisabled = false;
  @Input() showDelete = false;
  @Input() showEdit = false;
  @Input() showVerify = true;
  @Input() deleteLabel = 'Eliminar';
  @Input() editLabel = 'Editar';
  @Input() verifyLabel = 'Verificar';

  @Output() returned = new EventEmitter<void>();
  @Output() canceled = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();
  @Output() verified = new EventEmitter<void>();
  @Output() edited = new EventEmitter<void>();

  get containerClass(): string {
    return this.resolvedType === 'actions' ? 'min-h-[72px]' : 'min-h-[68px]';
  }

  get tagClass(): string {
    return this.resolvedTagTone === 'info' ? 'bg-brand-primary' : 'bg-[var(--sys-color-bg-brand-accent)]';
  }

  get resolvedType(): SolicitudeHeaderType {
    return this.roleStateConfig?.type ?? this.type;
  }

  get resolvedShowTag(): boolean {
    return this.roleStateConfig?.showTag ?? this.showTag;
  }

  get resolvedTagLabel(): string {
    return this.roleStateConfig?.tagLabel ?? this.tagLabel;
  }

  get resolvedTagTone(): SolicitudeHeaderTagTone {
    return this.roleStateConfig?.tagTone ?? this.tagTone;
  }

  get resolvedSaveVariant(): SolicitudeHeaderButtonTone {
    return this.roleStateConfig?.saveVariant ?? this.saveVariant;
  }

  get resolvedShowDelete(): boolean {
    return this.roleStateConfig?.showDelete ?? this.showDelete;
  }

  get resolvedShowEdit(): boolean {
    return this.roleStateConfig?.showEdit ?? this.showEdit;
  }

  get resolvedShowVerify(): boolean {
    return this.roleStateConfig?.showVerify ?? this.showVerify;
  }

  private get roleStateConfig(): SolicitudeHeaderConfig | undefined {
    if (!this.role || !this.state) {
      return undefined;
    }

    return HEADER_CONFIG_BY_ROLE[this.role]?.[this.state];
  }
}
