import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { FormTableSearchComponent } from '../../components/form-table-search/form-table-search.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import type { DocumentsRecordsRow } from '../../types/documents-records.types';
import { ActionTrackerComponent, ActionTrackerSummary } from '../action-tracker/action-tracker.component';
import { IconComponent } from '../icon/icon.component';

type ClassifierRow = {
  classifier: string;
  description: string;
  account: string;
  status: string;
};

type HistoryField = {
  label: string;
  value: string;
};

@Component({
  selector: 'siaf-account-history-panel',
  standalone: true,
  imports: [ActionTrackerComponent, FormTableSearchComponent, IconComponent, NgTemplateOutlet, PaginationComponent],
  template: `
    @if (open) {
      <section class="fixed inset-y-0 left-0 right-0 z-50 bg-black/55 pl-0 lg:pl-[65px]" aria-modal="true" role="dialog" aria-labelledby="account-history-title" (click)="closed.emit()">
        <aside class="flex h-screen w-full flex-col overflow-hidden bg-surface text-text shadow-siaf-lg lg:rounded-l-siaf-md" (click)="$event.stopPropagation()">
          <header class="flex h-14 shrink-0 items-center gap-siaf-xs border-b border-[var(--sys-color-divider-strong)] px-siaf-md">
            <h2 id="account-history-title" class="m-0 min-w-0 flex-1 text-base font-bold uppercase leading-normal tracking-[0.02px] text-text">Historial de cuenta contable</h2>
            <button class="inline-flex size-10 items-center justify-center rounded-siaf-md text-text transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-light-pressed)]" type="button" aria-label="Cerrar historial de cuenta contable" (click)="closed.emit()">
              <siaf-icon name="close" [size]="24" />
            </button>
          </header>

          <div class="min-h-0 flex-1 overflow-y-auto border-b border-[var(--sys-color-divider-strong)] bg-surface">
            <div class="grid min-h-full grid-cols-1 gap-siaf-xl px-siaf-md py-siaf-md sm:px-siaf-xl lg:grid-cols-[258px_minmax(0,941px)]">
              <aside class="hidden lg:block">
                <div class="sticky top-siaf-md flex items-start gap-siaf-lg">
                  <section class="relative w-[210px] shrink-0 overflow-hidden rounded-siaf-md bg-surface py-siaf-md shadow-siaf-elevation-2">
                    <span class="absolute left-0 top-[19px] h-[86px] w-[3px] rounded-r-siaf-sm bg-brand-primary" aria-hidden="true"></span>
                    <div class="flex flex-col gap-siaf-md px-siaf-xl">
                      @for (item of stepperSummary; track item.label) {
                        <div class="flex flex-col gap-siaf-xxs">
                          <span class="truncate text-[11px] font-medium uppercase leading-none tracking-[0.66px] text-text-muted">{{ item.label }}</span>
                          <strong class="truncate text-sm font-bold leading-normal tracking-[-0.02px] text-[var(--sys-color-text-neutral-medium)]">{{ item.value }}</strong>
                        </div>
                      }
                    </div>
                  </section>

                  <div class="flex min-h-[228px] w-6 shrink-0 flex-col items-center" aria-hidden="true">
                    <span class="h-[72px] w-px"></span>
                    <span class="size-6 rounded-full bg-brand-primary"></span>
                    <span class="min-h-[132px] w-px bg-[var(--sys-color-divider-default)]"></span>
                  </div>
                </div>
              </aside>

              <section class="flex min-w-0 flex-col gap-siaf-md">
                <section class="rounded-siaf-md bg-surface px-siaf-md py-siaf-md">
                  <div class="grid gap-y-siaf-lg">
                    <ng-container [ngTemplateOutlet]="readonlyCard" [ngTemplateOutletContext]="{ field: summaryFields[0] }" />
                    <div class="grid gap-siaf-md md:grid-cols-3">
                      @for (field of summaryFields.slice(1); track field.label) {
                        <ng-container [ngTemplateOutlet]="readonlyCard" [ngTemplateOutletContext]="{ field: field }" />
                      }
                    </div>
                  </div>
                </section>

                <section class="rounded-siaf-md bg-surface">
                  <header class="flex min-h-14 items-center border-b border-[var(--sys-color-divider-default)] px-siaf-lg">
                    <h2 class="m-0 text-base font-bold uppercase leading-normal tracking-[0.02px] text-text">Informacion de la solicitud</h2>
                  </header>
                  <div class="flex flex-col gap-siaf-xl px-siaf-xl py-siaf-md">
                    <section class="flex flex-col gap-siaf-md">
                      <h3 class="m-0 text-sm font-bold uppercase leading-normal tracking-[0.02px] text-text">Datos generales</h3>
                      <ng-container [ngTemplateOutlet]="infoCard" [ngTemplateOutletContext]="{ fields: generalFields }" />
                      <ng-container [ngTemplateOutlet]="infoCard" [ngTemplateOutletContext]="{ fields: planFields }" />
                    </section>

                    <section class="flex flex-col gap-siaf-md">
                      <h3 class="m-0 text-sm font-bold uppercase leading-normal tracking-[0.02px] text-text">Tipo de modificacion</h3>
                      <ng-container [ngTemplateOutlet]="infoCard" [ngTemplateOutletContext]="{ fields: modificationFields }" />
                      <div class="grid gap-siaf-md md:grid-cols-[250px_1fr]">
                        @for (field of selectedAccountFields; track field.label) {
                          <ng-container [ngTemplateOutlet]="readonlyCard" [ngTemplateOutletContext]="{ field: field }" />
                        }
                      </div>
                    </section>

                    <section class="flex flex-col gap-siaf-md">
                      <h3 class="m-0 text-sm font-bold uppercase leading-normal tracking-[0.02px] text-text">Cuenta contable</h3>
                      <div class="grid gap-siaf-md md:grid-cols-[248px_133px_1fr]">
                        @for (field of accountHeaderFields; track field.label) {
                          <ng-container [ngTemplateOutlet]="readonlyCard" [ngTemplateOutletContext]="{ field: field }" />
                        }
                      </div>
                      @for (field of accountWideFields; track field.label) {
                        <ng-container [ngTemplateOutlet]="readonlyCard" [ngTemplateOutletContext]="{ field: field }" />
                      }
                      <div class="grid gap-siaf-md md:grid-cols-4">
                        @for (field of accountPartFields; track field.label) {
                          <ng-container [ngTemplateOutlet]="readonlyCard" [ngTemplateOutletContext]="{ field: field }" />
                        }
                      </div>
                    </section>

                    <section class="flex flex-col gap-siaf-md">
                      <h3 class="m-0 text-sm font-bold uppercase leading-normal tracking-[0.02px] text-text">Atributos de la cuenta contable</h3>
                      <ng-container [ngTemplateOutlet]="readonlyCard" [ngTemplateOutletContext]="{ field: scopeField }" />
                      <div class="grid gap-siaf-md md:grid-cols-2">
                        @for (field of attributeFields; track field.label) {
                          <ng-container [ngTemplateOutlet]="readonlyCard" [ngTemplateOutletContext]="{ field: field }" />
                        }
                      </div>
                    </section>

                    <section class="flex flex-col gap-siaf-md">
                      <h3 class="m-0 text-sm font-bold uppercase leading-normal tracking-[0.02px] text-text">Clasificador institucional asociado</h3>
                      <ng-container [ngTemplateOutlet]="readonlyCard" [ngTemplateOutletContext]="{ field: classifierEnabledField }" />
                      <h4 class="m-0 text-sm font-bold uppercase leading-normal tracking-[0.02px] text-text">Selector clasificador institucional</h4>
                      <siaf-form-table-search placeholder="Buscar clasificador institucional" ariaLabel="Buscar clasificador institucional" />
                      <siaf-pagination navigation="Activate" position="Top" [page]="1" [pageSize]="10" [totalItems]="classifierRows.length" [totalPages]="1" />
                      <div class="siaf-table-scroll min-w-0">
                      <table class="w-full min-w-[860px] border-collapse text-left text-sm">
                        <thead>
                          <tr class="text-xs font-bold uppercase text-text">
                            <th class="px-siaf-md py-siaf-sm">Clasificador</th>
                            <th class="px-siaf-md py-siaf-sm">Descripcion</th>
                            <th class="px-siaf-md py-siaf-sm">Cuenta contable</th>
                            <th class="px-siaf-md py-siaf-sm">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          @for (row of classifierRows; track row.classifier) {
                            <tr class="h-12 border-b border-[var(--sys-color-divider-default)] bg-surface text-[var(--sys-color-text-neutral-medium)]">
                              <td class="px-siaf-md py-siaf-sm">{{ row.classifier }}</td>
                              <td class="px-siaf-md py-siaf-sm">{{ row.description }}</td>
                              <td class="px-siaf-md py-siaf-sm">{{ row.account }}</td>
                              <td class="px-siaf-md py-siaf-sm">{{ row.status }}</td>
                            </tr>
                          }
                        </tbody>
                      </table>
                      </div>
                      <siaf-pagination navigation="Activate" position="Bottom" [rowPage]="true" [page]="1" [pageSize]="10" [totalItems]="classifierRows.length" [totalPages]="1" [rowsPerPage]="10" />
                    </section>

                    <section class="flex flex-col gap-siaf-md">
                      <h3 class="m-0 text-sm font-bold uppercase leading-normal tracking-[0.02px] text-text">Vigencia</h3>
                      <ng-container [ngTemplateOutlet]="readonlyCard" [ngTemplateOutletContext]="{ field: validityReasonField }" />
                      <label class="flex min-h-10 items-center gap-siaf-sm text-sm font-medium text-[var(--sys-color-text-neutral-medium)]">
                        <input class="size-4 accent-[var(--sys-color-icon-states-enabled)]" type="checkbox" checked disabled />
                        Esta visible
                      </label>
                    </section>
                  </div>
                </section>

                <section class="rounded-siaf-md bg-surface">
                  <header class="flex min-h-14 items-center border-b border-[var(--sys-color-divider-default)] px-siaf-lg">
                    <h2 class="m-0 text-base font-bold uppercase leading-normal tracking-[0.02px] text-text">Justificacion y documentos de sustento</h2>
                  </header>
                  <div class="flex flex-col gap-siaf-md px-siaf-xl py-siaf-md">
                    <section class="rounded-siaf-md border border-[var(--sys-color-divider-default)] bg-surface px-siaf-md py-siaf-sm">
                      <span class="text-[11px] font-medium uppercase leading-none tracking-[0.66px] text-text-muted">{{ justificationField.label }}</span>
                      <p class="m-0 pt-siaf-xs text-sm font-medium leading-normal text-text">{{ justificationField.value }}</p>
                    </section>
                    <section class="flex flex-col gap-siaf-md">
                      <h3 class="m-0 text-sm font-bold uppercase leading-normal tracking-[0.02px] text-text">Documento de sustento</h3>
                    <div class="flex min-h-16 items-center gap-siaf-md rounded-siaf-md border border-[var(--sys-color-divider-default)] bg-surface px-siaf-md">
                      <siaf-icon name="description" [size]="24" />
                      <span class="min-w-0 text-sm text-text">Informe tecnico de modificacion de cuenta contable.pdf</span>
                    </div>
                    </section>
                  </div>
                </section>

                <siaf-action-tracker [summaryItems]="actionSummary" />
              </section>
            </div>
          </div>

          <ng-template #readonlyCard let-field="field">
            <div class="flex min-h-11 min-w-0 flex-col gap-siaf-xxs rounded-siaf-md border border-[var(--sys-color-divider-default)] bg-surface px-siaf-md py-siaf-xs">
              <span class="truncate text-[11px] font-medium uppercase leading-none tracking-[0.66px] text-text-muted">{{ field.label }}</span>
              <span class="truncate text-sm font-medium leading-normal text-text">{{ field.value }}</span>
            </div>
          </ng-template>

          <ng-template #infoCard let-fields="fields">
            <section class="relative rounded-siaf-md bg-surface p-siaf-md shadow-siaf-elevation-2">
              <span class="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r bg-brand-primary" aria-hidden="true"></span>
              <div class="grid gap-siaf-md md:grid-cols-2">
                @for (field of fields; track field.label) {
                  <ng-container [ngTemplateOutlet]="readonlyCard" [ngTemplateOutletContext]="{ field: field }" />
                }
              </div>
            </section>
          </ng-template>
        </aside>
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountHistoryPanelComponent {
  @Input() open = false;
  @Input() record: DocumentsRecordsRow | null = null;

  @Output() closed = new EventEmitter<void>();

  readonly stepperSummary: HistoryField[] = [
    { label: 'Nro Documento', value: '00001' },
    { label: 'Tipo de accion', value: 'Creacion' },
    { label: 'Fecha', value: '19/08/25     08:00:59' }
  ];

  readonly summaryFields: HistoryField[] = [
    { label: 'Documento', value: 'Solicitud de plan de cuentas contables' },
    { label: 'Nro documento', value: '0001' },
    { label: 'Tipo de accion', value: 'Modificacion' },
    { label: 'Estado', value: 'Activo' }
  ];

  readonly generalFields: HistoryField[] = [
    { label: 'Nombre del plan de cuentas contables', value: 'Plan Contable Gubernamental Unico 2026' }
  ];

  readonly planFields: HistoryField[] = [
    { label: 'Tipo de plan contable', value: 'Plan Contable Gubernamental Unico' },
    { label: 'Plan contable actual por reemplazar', value: 'PCGU 2025' }
  ];

  readonly selectedAccountFields: HistoryField[] = [
    { label: 'Tipo de modificacion', value: 'Atributos' },
    { label: 'Cuenta contable seleccionada', value: '1.1.1 - Activos financieros' }
  ];

  readonly scopeField: HistoryField = {
    label: 'Ambito institucional de aplicacion',
    value: 'Gobierno nacional, gobiernos regionales y gobiernos locales'
  };

  readonly classifierEnabledField: HistoryField = {
    label: 'Cuenta contable para una entidad del estado',
    value: 'Si'
  };

  readonly validityReasonField: HistoryField = {
    label: 'Motivo de vigencia',
    value: 'Actualizacion de la vigencia por adecuacion normativa.'
  };

  readonly justificationField: HistoryField = {
    label: 'Justificacion del requerimiento solicitado',
    value: 'Actualizacion de atributos de la cuenta contable por adecuacion normativa.'
  };

  readonly classifierRows: ClassifierRow[] = [
    { classifier: '1.1.1', description: 'Activos financieros', account: '1.1.1', status: 'Activo' },
    { classifier: '1.1.2', description: 'Cuentas por cobrar', account: '1.1.2', status: 'Activo' },
    { classifier: '1.1.3', description: 'Inventarios', account: '1.1.3', status: 'Activo' },
    { classifier: '1.2.1', description: 'Propiedad, planta y equipo', account: '1.2.1', status: 'Activo' },
    { classifier: '1.2.2', description: 'Activos intangibles', account: '1.2.2', status: 'Activo' },
    { classifier: '2.1.1', description: 'Cuentas por pagar', account: '2.1.1', status: 'Activo' },
    { classifier: '3.1.1', description: 'Patrimonio institucional', account: '3.1.1', status: 'Activo' }
  ];

  readonly actionSummary: ActionTrackerSummary[] = [
    { label: 'Elaborado por', actionBy: 'Ricardo John Doe Bustamante', date: '19/08/2025\n08:00:59' },
    { label: 'Verificado por', actionBy: 'Karim Lucano Lara', date: '20/08/2025\n09:14:22' },
    { label: 'Aprobado por', actionBy: '', date: '' }
  ];

  get modificationFields(): HistoryField[] {
    return [
      { label: 'Tipo de modificacion', value: 'Atributos' }
    ];
  }

  get accountHeaderFields(): HistoryField[] {
    return [
      { label: 'Codigo de cuenta contable', value: this.accountCode },
      { label: 'Elemento', value: this.value('element') },
      { label: 'Nombre de la cuenta contable', value: this.value('accountName') }
    ];
  }

  get accountWideFields(): HistoryField[] {
    return [
      { label: 'Descripcion de la cuenta contable', value: this.value('accountName') },
      { label: 'Descripcion modificada', value: 'Cuenta contable actualizada para el registro de activos financieros.' }
    ];
  }

  get accountPartFields(): HistoryField[] {
    return [
      { label: 'Grupo', value: this.value('group') },
      { label: 'Cuenta', value: this.value('account') },
      { label: 'Sub cuenta 1', value: this.value('subAccount1') },
      { label: 'Sub cuenta 2', value: this.value('subAccount2') }
    ];
  }

  get attributeFields(): HistoryField[] {
    return [
      { label: 'Es una cuenta imputable', value: this.value('imputable') },
      { label: 'Codigo anterior', value: this.value('previousCode') },
      { label: 'Aplica Extra Presupuestaria (AEP)', value: this.value('aep') },
      { label: 'Es Reciproca (RECI)', value: this.value('reciprocal') }
    ];
  }

  get accountCode(): string {
    const parts = ['element', 'group', 'account', 'subAccount1', 'subAccount2', 'subAccount3']
      .map((key) => this.value(key))
      .filter((value) => value && value !== '-');

    return parts.join('.') || '--';
  }

  value(key: string): string {
    return String(this.record?.[key] ?? '--');
  }
}
