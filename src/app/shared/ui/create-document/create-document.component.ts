import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';
import { SelectOption, SelectOptionsComponent } from '../select-options/select-options.component';

export type CreateDocumentVariant = 'sidenav' | 'dropdown';

export type CreateDocumentField = {
  placeholder: string;
  type?: 'search' | 'select';
  value?: string;
  required?: boolean;
  options?: string[];
};

export type CreateDocumentSelection = {
  placeholder: string;
  value: string;
};

@Component({
  selector: 'siaf-create-document',
  standalone: true,
  imports: [ButtonComponent, IconComponent, NgClass, SelectOptionsComponent],
  template: `
    <section
      class="flex flex-col items-start bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.20),0_2px_1px_rgba(0,0,0,0.12),0_1px_1px_rgba(0,0,0,0.14)]"
      [ngClass]="variantClass"
      aria-label="Crear documento"
    >
      <header class="flex w-full items-center gap-siaf-xs p-siaf-md">
        <h2 class="m-0 min-h-6 text-base font-bold uppercase leading-none tracking-[0.02px] text-text">
          {{ title }}
        </h2>
      </header>

      <div
        class="flex w-full items-start"
        [ngClass]="variant === 'sidenav' ? 'min-h-0 flex-1' : 'bg-[var(--sys-color-bg-surfaces-surface-highest)]'"
      >
        <div
          class="flex min-w-0 flex-1 flex-col px-siaf-md"
          [ngClass]="variant === 'sidenav' ? 'h-full py-siaf-xs' : 'pb-siaf-xs'"
        >
          <div class="flex w-full flex-col gap-siaf-lg">
            @for (field of resolvedFields; track field.placeholder) {
              <label class="relative block h-10 w-full">
                @if (isFieldFloating(field)) {
                  <span
                    class="absolute -top-2.5 left-3 z-[1] rounded-siaf-sm bg-surface px-siaf-xxs text-xs font-medium leading-normal"
                    [class.text-[var(--sys-color-text-neutral-activated)]]="focusedField === field.placeholder"
                    [class.text-[var(--sys-color-text-neutral-low)]]="focusedField !== field.placeholder"
                  >
                    {{ optionPlaceholder(field) }}
                  </span>
                }

                @if (field.type === 'select') {
                  <div class="relative">
                    <button
                      class="flex min-h-10 w-full items-center rounded-siaf-md bg-surface py-siaf-xs pl-siaf-md pr-siaf-sm text-left text-sm font-normal tracking-[0.025px] text-[var(--sys-color-text-neutral-medium)] outline-none transition disabled:cursor-not-allowed disabled:border disabled:border-[var(--sys-color-border-states-disabled)] disabled:bg-[var(--sys-color-bg-surfaces-disabled)] disabled:text-[var(--sys-color-text-neutral-disabled)]"
                      [ngClass]="fieldControlClass(field)"
                      type="button"
                      [attr.aria-expanded]="openedSelectField === field.placeholder"
                      aria-haspopup="listbox"
                      (click)="toggleSelect(field)"
                    >
                      <span class="min-w-0 flex-1 truncate" [class.text-[var(--sys-color-text-neutral-low)]]="!field.value">
                        {{ field.value || optionPlaceholder(field) }}
                      </span>
                      <siaf-icon class="shrink-0 text-text transition" [class.rotate-180]="openedSelectField === field.placeholder" name="expand_more" [size]="24" />
                    </button>

                    @if (openedSelectField === field.placeholder) {
                      <button class="fixed inset-0 z-40 cursor-default bg-transparent" type="button" aria-label="Cerrar opciones" (click)="closeSelect()"></button>
                      <div class="absolute left-0 right-0 top-[calc(100%+4px)] z-50">
                        <siaf-select-options
                          [options]="fieldOptions(field)"
                          [selectedValue]="field.value || ''"
                          (selected)="onOptionSelected(field, $event)"
                        />
                      </div>
                    }
                  </div>
                } @else {
                  <input
                    class="min-h-10 w-full rounded-siaf-md bg-surface px-siaf-md py-siaf-xs text-sm font-normal tracking-[0.025px] text-[var(--sys-color-text-neutral-medium)] outline-none transition placeholder:text-[var(--sys-color-text-neutral-low)] disabled:cursor-not-allowed disabled:border disabled:border-[var(--sys-color-border-states-disabled)] disabled:bg-[var(--sys-color-bg-surfaces-disabled)] disabled:text-[var(--sys-color-text-neutral-disabled)]"
                    [ngClass]="fieldControlClass(field)"
                    type="search"
                    [placeholder]="isFieldFloating(field) ? '' : field.placeholder"
                    [value]="field.value || ''"
                    (focus)="focusedField = field.placeholder"
                    (blur)="focusedField = ''"
                  />
                }
              </label>
            }

            <div class="flex h-10 w-full items-start justify-end gap-siaf-sm">
              <siaf-button variant="secondary" size="md" (click)="canceled.emit()">Cancelar</siaf-button>
              <siaf-button variant="accent" size="md" [disabled]="acceptDisabled" (click)="accepted.emit()">Aceptar</siaf-button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateDocumentComponent {
  @Input() variant: CreateDocumentVariant = 'sidenav';
  @Input() title = 'Crear documento';
  @Input() acceptDisabled = false;
  @Input() fields: CreateDocumentField[] = [];
  focusedField = '';
  openedSelectField = '';
  private readonly internalValues = new Map<string, string>();

  @Output() canceled = new EventEmitter<void>();
  @Output() accepted = new EventEmitter<void>();
  @Output() fieldSelected = new EventEmitter<string>();
  @Output() fieldValueChange = new EventEmitter<CreateDocumentSelection>();

  get resolvedFields(): CreateDocumentField[] {
    if (this.fields.length > 0) {
      return this.fields;
    }

    return this.variant === 'dropdown'
      ? [
          {
            placeholder: 'Documento',
            type: 'select',
            required: true,
            value: this.internalValues.get('Documento') || '',
            options: ['Solicitud de registro de asiento de ajuste']
          },
          {
            placeholder: 'Tipo de acci\u00f3n',
            type: 'select',
            required: true,
            value: this.internalValues.get('Tipo de acci\u00f3n') || '',
            options: ['Creaci\u00f3n', 'Reversi\u00f3n']
          }
        ]
      : [
          { placeholder: 'Buscar proceso o procedimiento', type: 'search', value: 'Proceso de registro de asiento de ajuste' },
          {
            placeholder: 'Documento',
            type: 'select',
            value: this.internalValues.get('Documento') || 'Solicitud de registro de asiento de ajuste',
            options: ['Solicitud de registro de asiento de ajuste']
          },
          {
            placeholder: 'Tipo de acci\u00f3n',
            type: 'select',
            value: this.internalValues.get('Tipo de acci\u00f3n') || 'Creaci\u00f3n',
            options: ['Creaci\u00f3n', 'Reversi\u00f3n']
          }
        ];
  }

  get variantClass(): string {
    return this.variant === 'dropdown'
      ? 'w-full max-w-[360px] rounded-siaf-md py-siaf-xs'
      : 'h-[calc(100vh-56px)] w-screen max-w-[370px] rounded-siaf-md border-r border-[var(--sys-color-divider-default,rgba(32,32,32,0.12))]';
  }

  toggleSelect(field: CreateDocumentField): void {
    this.fieldSelected.emit(field.placeholder);
    this.openedSelectField = this.openedSelectField === field.placeholder ? '' : field.placeholder;
    this.focusedField = this.openedSelectField;
  }

  closeSelect(): void {
    this.openedSelectField = '';
    this.focusedField = '';
  }

  onOptionSelected(field: CreateDocumentField, value: string): void {
    this.openedSelectField = '';
    this.focusedField = '';

    if (this.fields.length === 0) {
      this.internalValues.set(field.placeholder, value);
    }

    this.fieldValueChange.emit({
      placeholder: field.placeholder,
      value
    });
  }

  fieldOptions(field: CreateDocumentField): SelectOption[] {
    const options = field.options || [];
    const normalizedOptions = field.value && !options.includes(field.value) ? [...options, field.value] : options;

    return normalizedOptions.map((option) => ({
      label: option,
      value: option
    }));
  }

  optionPlaceholder(field: CreateDocumentField): string {
    return `${field.placeholder}${field.required ? '*' : ''}`;
  }

  isFieldFloating(field: CreateDocumentField): boolean {
    return this.focusedField === field.placeholder || this.openedSelectField === field.placeholder || Boolean(field.value);
  }

  isFieldSuccess(field: CreateDocumentField): boolean {
    return Boolean(field.value) && this.focusedField !== field.placeholder;
  }

  fieldControlClass(field: CreateDocumentField): string {
    if (this.focusedField === field.placeholder || this.openedSelectField === field.placeholder) {
      return 'border-2 border-[var(--sys-color-border-states-focus)]';
    }

    if (this.isFieldSuccess(field)) {
      return 'border-2 border-[var(--sys-color-border-feedback-success)]';
    }

    return 'border border-[var(--sys-color-border-states-enabled)] hover:border-2 hover:border-[var(--sys-color-border-states-hover)]';
  }
}
