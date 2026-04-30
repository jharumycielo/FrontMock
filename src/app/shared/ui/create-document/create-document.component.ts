import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';

import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';
import { DEFAULT_PROCESS_TREE, ProcessMenuNode } from '../process-menu-tree/process-menu-tree.component';
import { SelectOption, SelectOptionsComponent } from '../select-options/select-options.component';

export type CreateDocumentVariant = 'sidenav' | 'dropdown';

export type CreateDocumentField = {
  placeholder: string;
  type?: 'search' | 'select';
  value?: string;
  required?: boolean;
  options?: string[];
  disabled?: boolean;
};

export type CreateDocumentSelection = {
  placeholder: string;
  value: string;
};

export type CreateDocumentAccepted = {
  processId?: string;
  processLabel?: string;
  document?: string;
  actionType?: string;
  route?: string;
};

type CreateDocumentProcessOption = {
  id: string;
  label: string;
  route?: string;
  documents: string[];
  actionTypes: string[];
};

// Las opciones del buscador salen del arbol de procesos para no duplicar catalogos a mano.
const CREATE_DOCUMENT_PROCESSES: CreateDocumentProcessOption[] = collectProcessOptions(DEFAULT_PROCESS_TREE);

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
                      [disabled]="field.disabled"
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
                  <div class="relative">
                    <input
                      class="min-h-10 w-full rounded-siaf-md bg-surface px-siaf-md py-siaf-xs text-sm font-normal tracking-[0.025px] text-[var(--sys-color-text-neutral-medium)] outline-none transition placeholder:text-[var(--sys-color-text-neutral-low)] disabled:cursor-not-allowed disabled:border disabled:border-[var(--sys-color-border-states-disabled)] disabled:bg-[var(--sys-color-bg-surfaces-disabled)] disabled:text-[var(--sys-color-text-neutral-disabled)]"
                      [ngClass]="fieldControlClass(field)"
                      type="search"
                      autocomplete="off"
                      [placeholder]="isFieldFloating(field) ? '' : field.placeholder"
                      [value]="field.value || ''"
                      [disabled]="field.disabled"
                      (focus)="onSearchFocus(field)"
                      (blur)="onSearchBlur()"
                      (input)="onSearchInput(field, $event)"
                      (keydown.escape)="closeProcessResults()"
                    />

                    @if (showProcessResults(field)) {
                      <div
                        class="absolute left-0 right-0 top-[calc(100%+4px)] z-50 max-h-72 overflow-y-auto rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-highest)] py-siaf-xs shadow-[0_8px_10px_rgba(0,0,0,0.14),0_3px_14px_rgba(0,0,0,0.12),0_5px_5px_rgba(0,0,0,0.2)]"
                        role="listbox"
                      >
                        @for (process of filteredProcessOptions; track process.id) {
                          <button
                            class="flex min-h-10 w-full items-center px-siaf-md py-siaf-xs text-left text-sm text-[var(--sys-color-text-neutral-medium)] transition hover:bg-[var(--sys-color-bg-states-light-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand-primary"
                            type="button"
                            role="option"
                            (mousedown)="$event.preventDefault()"
                            (click)="selectProcess(process)"
                          >
                            <span class="min-w-0 flex-1 truncate">{{ process.label }}</span>
                          </button>
                        } @empty {
                          <span class="block px-siaf-md py-siaf-xs text-sm text-[var(--sys-color-text-neutral-low)]">
                            No se encontraron procesos
                          </span>
                        }
                      </div>
                    }
                  </div>
                }
              </label>
            }

            <div class="flex h-10 w-full items-start justify-end gap-siaf-sm">
              <siaf-button variant="secondary" size="md" (click)="canceled.emit()">Cancelar</siaf-button>
              <siaf-button variant="accent" size="md" [disabled]="resolvedAcceptDisabled" (click)="accept()">Aceptar</siaf-button>
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
  processResultsOpen = false;
  private readonly internalValues = new Map<string, string>();

  @Output() canceled = new EventEmitter<void>();
  @Output() accepted = new EventEmitter<CreateDocumentAccepted>();
  @Output() fieldSelected = new EventEmitter<string>();
  @Output() fieldValueChange = new EventEmitter<CreateDocumentSelection>();

  constructor(private readonly cdr: ChangeDetectorRef) {}

  get resolvedFields(): CreateDocumentField[] {
    if (this.fields.length > 0) {
      return this.fields;
    }

    // Si no llegan campos externos, el componente arma el flujo base de Crear documento.
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
          {
            placeholder: 'Buscar proceso o procedimiento',
            type: 'search',
            required: true,
            value: this.internalValues.get('Buscar proceso o procedimiento') || ''
          },
          {
            placeholder: 'Documento',
            type: 'select',
            required: true,
            value: this.internalValues.get('Documento') || '',
            options: this.selectedProcess?.documents || [],
            disabled: !this.selectedProcess?.documents.length
          },
          {
            placeholder: 'Tipo de acci\u00f3n',
            type: 'select',
            required: true,
            value: this.internalValues.get('Tipo de acci\u00f3n') || '',
            options: this.selectedProcess?.actionTypes || [],
            disabled: !this.selectedProcess?.actionTypes.length
          }
        ];
  }

  get selectedProcess(): CreateDocumentProcessOption | null {
    const selectedProcessId = this.internalValues.get('processId');
    return CREATE_DOCUMENT_PROCESSES.find((process) => process.id === selectedProcessId) || null;
  }

  get filteredProcessOptions(): CreateDocumentProcessOption[] {
    const query = this.normalize(this.internalValues.get('Buscar proceso o procedimiento') || '');

    if (!query) {
      return CREATE_DOCUMENT_PROCESSES;
    }

    return CREATE_DOCUMENT_PROCESSES.filter((process) => this.normalize(process.label).includes(query));
  }

  get resolvedAcceptDisabled(): boolean {
    return this.acceptDisabled || this.resolvedFields.some((field) => field.required && !field.value);
  }

  get variantClass(): string {
    return this.variant === 'dropdown'
      ? 'w-full max-w-[360px] rounded-siaf-md py-siaf-xs'
      : 'h-[calc(100vh-56px)] w-screen rounded-siaf-md border-r border-[var(--sys-color-divider-default,rgba(32,32,32,0.12))] lg:max-w-[370px]';
  }

  toggleSelect(field: CreateDocumentField): void {
    if (field.disabled) {
      return;
    }

    this.fieldSelected.emit(field.placeholder);
    this.openedSelectField = this.openedSelectField === field.placeholder ? '' : field.placeholder;
    this.focusedField = this.openedSelectField;
    this.processResultsOpen = false;
  }

  closeSelect(): void {
    this.openedSelectField = '';
    this.focusedField = '';
    this.cdr.markForCheck();
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

  onSearchFocus(field: CreateDocumentField): void {
    this.focusedField = field.placeholder;
    this.openedSelectField = '';
    this.processResultsOpen = this.isProcessSearchField(field);
  }

  onSearchBlur(): void {
    this.focusedField = '';
    this.closeProcessResults();
  }

  onSearchInput(field: CreateDocumentField, event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    if (this.fields.length === 0) {
      this.internalValues.set(field.placeholder, value);
      // Cambiar de proceso invalida documento y tipo de accion seleccionados previamente.
      this.internalValues.delete('processId');
      this.internalValues.delete('Documento');
      this.internalValues.delete('Tipo de acci\u00f3n');
      this.processResultsOpen = true;
      this.cdr.markForCheck();
    }

    this.fieldValueChange.emit({
      placeholder: field.placeholder,
      value
    });
  }

  selectProcess(process: CreateDocumentProcessOption): void {
    this.internalValues.set('processId', process.id);
    this.internalValues.set('Buscar proceso o procedimiento', process.label);
    this.internalValues.delete('Documento');
    this.internalValues.delete('Tipo de acci\u00f3n');
    this.processResultsOpen = false;
    this.focusedField = '';
    this.cdr.markForCheck();

    this.fieldValueChange.emit({
      placeholder: 'Buscar proceso o procedimiento',
      value: process.label
    });
  }

  accept(): void {
    this.accepted.emit({
      processId: this.selectedProcess?.id,
      processLabel: this.internalValues.get('Buscar proceso o procedimiento') || this.selectedProcess?.label,
      document: this.internalValues.get('Documento') || this.externalFieldValue('Documento'),
      actionType: this.internalValues.get('Tipo de acci\u00f3n') || this.externalFieldValue('Tipo de acción'),
      route: this.selectedProcess?.route
    });
  }

  closeProcessResults(): void {
    this.processResultsOpen = false;
    this.cdr.markForCheck();
  }

  showProcessResults(field: CreateDocumentField): boolean {
    return this.processResultsOpen && this.isProcessSearchField(field);
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
    if (field.disabled) {
      return 'border border-[var(--sys-color-border-states-disabled)]';
    }

    if (this.focusedField === field.placeholder || this.openedSelectField === field.placeholder) {
      return 'border-2 border-[var(--sys-color-border-states-focus)]';
    }

    if (this.isFieldSuccess(field)) {
      return 'border-2 border-[var(--sys-color-border-feedback-success)]';
    }

    return 'border border-[var(--sys-color-border-states-enabled)] hover:border-2 hover:border-[var(--sys-color-border-states-hover)]';
  }

  private isProcessSearchField(field: CreateDocumentField): boolean {
    return this.fields.length === 0 && field.placeholder === 'Buscar proceso o procedimiento';
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  private externalFieldValue(placeholder: string): string {
    return this.fields.find((field) => field.placeholder === placeholder)?.value || '';
  }
}

function collectProcessOptions(nodes: ProcessMenuNode[]): CreateDocumentProcessOption[] {
  return nodes.flatMap((node) => {
    const children = node.children ? collectProcessOptions(node.children) : [];

    if (node.children?.length) {
      return children;
    }

    // Solo los nodos hoja aparecen como resultados; los que tienen metadata habilitan el flujo completo.
    return [
      ...children,
      {
        id: node.id,
        label: node.label,
        route: node.createRoute,
        documents: node.documentOptions || [],
        actionTypes: node.actionTypeOptions || []
      }
    ];
  });
}
