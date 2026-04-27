import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import { ButtonComponent } from '../../ui/button/button.component';
import { IconComponent } from '../../ui/icon/icon.component';
import { TextFieldComponent, TextFieldOption } from '../../ui/text-field/text-field.component';

export interface FilterRow {
  campo: string;
  condicion: string;
  valor: string;
}

export interface CustomFilterApplyEvent {
  filters: FilterRow[];
}

@Component({
  selector: 'siaf-custom-filter',
  standalone: true,
  imports: [ButtonComponent, IconComponent, TextFieldComponent],
  template: `
    <div class="flex flex-col gap-siaf-md rounded-siaf-md bg-surface p-siaf-md shadow-[0_4px_5px_rgba(0,0,0,0.14),0_4px_5px_rgba(0,0,0,0.14),0_2px_4px_rgba(0,0,0,0.2)]">
      <div class="flex flex-col gap-siaf-md">
        <span class="text-sm font-bold text-[var(--sys-color-text-neutral-medium)]">Agregar filtros personalizados</span>

        @for (row of rows; track $index; let i = $index) {
          <div class="flex items-center gap-siaf-sm">
            <div class="flex w-[860px] max-w-[calc(100%-44px)] items-center gap-siaf-xs min-w-0">
              <div class="w-[268px] shrink-0">
                <siaf-text-field
                  label="Campo"
                  type="select"
                  [options]="campoOptions"
                  [value]="row.campo"
                  (valueChange)="onCampoChange(i, $event)"
                />
              </div>
              <div class="w-[288px] flex-none min-w-0">
                <siaf-text-field
                  label="Condici&oacute;n"
                  type="select"
                  [options]="condicionOptions"
                  [value]="row.condicion"
                  (valueChange)="onCondicionChange(i, $event)"
                />
              </div>
              <div class="w-[288px] flex-none min-w-0">
                <siaf-text-field
                  label="Valor"
                  type="select"
                  [options]="valorOptions"
                  [value]="row.valor"
                  (valueChange)="onValorChange(i, $event)"
                />
              </div>
            </div>
            <button
              class="inline-flex size-8 items-center justify-center rounded-siaf-md p-siaf-xxs text-text-muted transition hover:bg-surface-muted hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40"
              type="button"
              aria-label="Eliminar condicion"
              (click)="removeRow(i)"
            >
              <siaf-icon name="delete_outline" [size]="20" />
            </button>
          </div>
        }

        <div>
          <button
            class="inline-flex items-center gap-siaf-xs rounded-siaf-md px-siaf-md py-siaf-xxs text-sm font-medium text-text transition hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            type="button"
            (click)="addRow()"
          >
            <siaf-icon name="add" [size]="20" />
            Agregar condici&oacute;n
          </button>
        </div>

        <div class="flex items-center gap-siaf-sm">
          <siaf-button
            variant="primary"
            size="sm"
            [disabled]="!canApply"
            (click)="onAplicar()"
          >
            Aplicar
          </siaf-button>
          <siaf-button
            variant="secondary"
            size="sm"
            (click)="onCancelar()"
          >
            Cancelar
          </siaf-button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomFilterComponent implements OnChanges {
  @Input() campoOptions: TextFieldOption[] = [];
  @Input() condicionOptions: TextFieldOption[] = [];
  @Input() valorOptions: TextFieldOption[] = [];
  @Input() initialRows: FilterRow[] = [];
  @Input() deleteEnabled = false;

  @Output() aplicar = new EventEmitter<CustomFilterApplyEvent>();
  @Output() cancelar = new EventEmitter<void>();
  @Output() eliminar = new EventEmitter<void>();

  rows: FilterRow[] = [{ campo: '', condicion: '', valor: '' }];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialRows']) {
      this.rows = this.initialRows.length > 0
        ? this.initialRows.map((row) => ({ ...row }))
        : [{ campo: '', condicion: '', valor: '' }];
    }
  }

  get canApply(): boolean {
    return this.rows.some((r) => r.campo && r.condicion && r.valor);
  }

  addRow(): void {
    this.rows = [...this.rows, { campo: '', condicion: '', valor: '' }];
  }

  removeRow(index: number): void {
    if (this.deleteEnabled && this.rows.length === 1) {
      this.eliminar.emit();
      return;
    }

    const updated = this.rows.filter((_, i) => i !== index);
    this.rows = updated.length > 0 ? updated : [{ campo: '', condicion: '', valor: '' }];
  }

  onCampoChange(index: number, value: string | number | string[]): void {
    this.rows = this.rows.map((r, i) => (i === index ? { ...r, campo: String(value), condicion: '', valor: '' } : r));
  }

  onCondicionChange(index: number, value: string | number | string[]): void {
    this.rows = this.rows.map((r, i) => (i === index ? { ...r, condicion: String(value) } : r));
  }

  onValorChange(index: number, value: string | number | string[]): void {
    this.rows = this.rows.map((r, i) => (i === index ? { ...r, valor: String(value) } : r));
  }

  onAplicar(): void {
    this.aplicar.emit({ filters: this.rows.filter((r) => r.campo && r.condicion && r.valor) });
  }

  onCancelar(): void {
    this.rows = [{ campo: '', condicion: '', valor: '' }];
    this.cancelar.emit();
  }

}
