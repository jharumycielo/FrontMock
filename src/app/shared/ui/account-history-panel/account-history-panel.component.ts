import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { FormTableSearchComponent } from '../../components/form-table-search/form-table-search.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import type { DocumentsRecordsRow } from '../../types/documents-records.types';
import { ActionTrackerComponent, ActionTrackerSummary } from '../action-tracker/action-tracker.component';
import { IconComponent } from '../icon/icon.component';
import { RecordStatus, RecordStatusTagComponent } from '../record-status-tag/record-status-tag.component';

type EntityRow = {
  code: string;
  name: string;
};

type HistoryField = {
  label: string;
  value: string;
};

type SupportDocument = {
  name: string;
  size: string;
};

const DEMO_RECORD_DOCUMENT = 'Solicitud de Cuentas Contables';
const DEMO_RECORD_NUMBER = '0001';
const DEMO_ACTION_TYPE = 'Creacion';
const DEMO_RECORD_DATE = '19/08/25     08:00:59';
const DEMO_VALIDITY_START = '20/12/2024';
const DEMO_PLAN_NAME = 'Plan Contable Gubernamental Unico';
const DEMO_SUPPORT_DOCUMENT: SupportDocument = {
  name: 'DocEntregable001.pdf',
  size: '500kb'
};
const DEMO_ENTITIES: EntityRow[] = [
  { code: '3.5.4', name: 'Gobierno regional B' },
  { code: '3.5.5', name: 'Ministerios de C' },
  { code: '3.5.6', name: 'Municipalidad D' },
  { code: '3.5.7', name: 'Municipalidad E' },
  { code: '3.5.8', name: 'Municipalidad F' },
  { code: '3.5.9', name: 'Municipalidad G' },
  { code: '3.5.10', name: 'Municipalidad H' }
];

@Component({
  selector: 'siaf-account-history-panel',
  standalone: true,
  imports: [ActionTrackerComponent, FormTableSearchComponent, IconComponent, NgTemplateOutlet, PaginationComponent, RecordStatusTagComponent],
  template: `
    @if (open) {
      <section class="fixed inset-y-0 left-0 right-0 z-50 bg-black/55 pl-0 lg:pl-[65px]" aria-modal="true" role="dialog" aria-labelledby="account-history-title" (click)="closed.emit()">
        <aside class="flex h-screen w-full flex-col overflow-hidden bg-surface text-text shadow-siaf-lg lg:rounded-l-siaf-md" (click)="$event.stopPropagation()">
          <header class="flex h-14 shrink-0 items-center gap-siaf-xs border-b border-[var(--sys-color-divider-strong)] px-siaf-md">
            <h2 id="account-history-title" class="m-0 min-w-0 flex-1 text-base font-bold uppercase leading-normal tracking-[0.02px] text-text">Historial del registro</h2>
            <button class="inline-flex size-10 items-center justify-center rounded-siaf-md text-text transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-light-pressed)]" type="button" aria-label="Cerrar historial de cuenta contable" (click)="closed.emit()">
              <siaf-icon name="close" [size]="24" />
            </button>
          </header>

          <div class="min-h-0 flex-1 overflow-y-auto border-b border-[var(--sys-color-divider-strong)] bg-surface">
            <div class="mx-auto grid min-h-full w-full max-w-[1160px] grid-cols-1 gap-[64px] px-siaf-md py-siaf-md sm:px-siaf-xl lg:grid-cols-[210px_minmax(0,890px)] lg:px-0">
              <aside class="hidden lg:block">
                <div class="sticky top-siaf-md flex items-start gap-[22px]">
                  <section class="relative min-h-[186px] w-[200px] shrink-0 overflow-hidden rounded-siaf-md border border-[var(--sys-color-divider-default)] bg-surface py-siaf-md shadow-siaf-elevation-2">
                    <span class="absolute left-0 top-5 h-[80px] w-[3px] rounded-r-siaf-sm bg-brand-primary" aria-hidden="true"></span>
                    <div class="flex flex-col gap-siaf-md px-siaf-xl">
                      @for (item of stepperSummary; track item.label) {
                        <div class="flex flex-col gap-siaf-xxs">
                          <span class="truncate text-[11px] font-medium uppercase leading-none tracking-[0.66px] text-text-muted">{{ item.label }}</span>
                          <strong class="truncate text-sm font-bold leading-normal tracking-[-0.02px] text-[var(--sys-color-text-neutral-medium)]">{{ item.value }}</strong>
                        </div>
                      }
                    </div>
                  </section>

                  <div class="flex min-h-[186px] w-6 shrink-0 flex-col items-center" aria-hidden="true">
                    <span class="h-[64px] w-px"></span>
                    <span class="size-6 rounded-full bg-brand-primary"></span>
                  </div>
                </div>
              </aside>

              <section class="flex min-w-0 flex-col gap-siaf-sm">
                <section class="rounded-siaf-md border border-[var(--sys-color-divider-strong)] bg-surface px-siaf-lg py-siaf-md">
                  <ng-container [ngTemplateOutlet]="plainField" [ngTemplateOutletContext]="{ field: documentSummaryField }" />
                  <div class="mt-siaf-lg grid gap-siaf-md md:grid-cols-3">
                    <ng-container [ngTemplateOutlet]="plainField" [ngTemplateOutletContext]="{ field: numberSummaryField }" />
                    <ng-container [ngTemplateOutlet]="plainField" [ngTemplateOutletContext]="{ field: actionSummaryField }" />
                    <div class="flex min-w-0 flex-col gap-siaf-xxs">
                      <span class="truncate text-[11px] font-medium uppercase leading-none tracking-[0.66px] text-text-muted">Estado del registro</span>
                      <siaf-record-status-tag [status]="recordStatus" size="small" />
                    </div>
                  </div>
                </section>

                <section class="rounded-siaf-md border border-[var(--sys-color-divider-strong)] bg-surface px-siaf-xl py-siaf-xl">
                  <header class="mb-siaf-xl">
                    <h2 class="m-0 text-base font-bold uppercase leading-normal tracking-[0.02px] text-text">Registro de cuenta contable</h2>
                  </header>

                  <div class="flex flex-col gap-siaf-xl">
                    <section class="flex flex-col gap-siaf-md">
                      <ng-container [ngTemplateOutlet]="sectionTitle" [ngTemplateOutletContext]="{ title: 'Plan de cuentas contable' }" />
                      <ng-container [ngTemplateOutlet]="readonlyCard" [ngTemplateOutletContext]="{ field: generalFields[0] }" />
                    </section>

                    <section class="flex flex-col gap-siaf-md">
                      <ng-container [ngTemplateOutlet]="sectionTitle" [ngTemplateOutletContext]="{ title: 'Cuenta contable' }" />
                      <section class="relative rounded-siaf-md border border-[var(--sys-color-divider-strong)] px-siaf-md py-siaf-sm">
                        <span class="absolute left-0 top-5 h-6 w-[3px] rounded-r bg-brand-primary" aria-hidden="true"></span>
                        <div class="grid gap-siaf-md md:grid-cols-2">
                          <ng-container [ngTemplateOutlet]="plainField" [ngTemplateOutletContext]="{ field: accountHeaderFields[0] }" />
                          <ng-container [ngTemplateOutlet]="plainField" [ngTemplateOutletContext]="{ field: accountHeaderFields[2] }" />
                        </div>
                      </section>
                      <ng-container [ngTemplateOutlet]="plainField" [ngTemplateOutletContext]="{ field: imputableField }" />
                    </section>

                    <section class="flex flex-col gap-siaf-md">
                      <ng-container [ngTemplateOutlet]="sectionTitle" [ngTemplateOutletContext]="{ title: 'Codigo asociado de cuenta contable anterior' }" />
                      <div class="grid gap-siaf-xl md:grid-cols-2">
                        <ng-container [ngTemplateOutlet]="plainField" [ngTemplateOutletContext]="{ field: previousCodeField }" />
                        <ng-container [ngTemplateOutlet]="plainField" [ngTemplateOutletContext]="{ field: previousNameField }" />
                      </div>
                    </section>

                    <section class="flex flex-col gap-siaf-md">
                      <ng-container [ngTemplateOutlet]="sectionTitle" [ngTemplateOutletContext]="{ title: 'Atributos de la cuenta contable' }" />
                      <div class="grid gap-x-siaf-xl gap-y-siaf-md md:grid-cols-3">
                        @for (field of attributeFields; track field.label) {
                          <ng-container [ngTemplateOutlet]="plainField" [ngTemplateOutletContext]="{ field: field }" />
                        }
                      </div>
                    </section>

                    <section class="flex flex-col gap-siaf-md">
                      <ng-container [ngTemplateOutlet]="sectionTitle" [ngTemplateOutletContext]="{ title: 'Dinamica contable' }" />
                      <div class="grid gap-x-siaf-xl gap-y-siaf-md md:grid-cols-2">
                        @for (field of dynamicFields; track field.label) {
                          <ng-container [ngTemplateOutlet]="plainField" [ngTemplateOutletContext]="{ field: field }" />
                        }
                      </div>
                    </section>

                    <ng-container [ngTemplateOutlet]="plainField" [ngTemplateOutletContext]="{ field: classifierEnabledField }" />

                    <section class="flex flex-col gap-siaf-md">
                      <ng-container [ngTemplateOutlet]="sectionTitle" [ngTemplateOutletContext]="{ title: 'Entidades del estado' }" />
                      <div class="flex items-center gap-siaf-sm">
                        <siaf-form-table-search class="min-w-0 flex-1" placeholder="Buscar" ariaLabel="Buscar entidades del estado" />
                      </div>
                      <siaf-pagination navigation="Activate" position="Top" [page]="1" [pageSize]="10" [totalItems]="800" [totalPages]="80" />
                      <div class="siaf-table-scroll min-w-0">
                        <table class="w-full min-w-[720px] border-collapse text-left text-sm">
                          <thead>
                            <tr class="h-10 bg-[var(--sys-color-bg-surfaces-surface-high)] text-xs font-bold uppercase text-text">
                              <th class="w-[120px] px-siaf-md py-siaf-sm">Codigo</th>
                              <th class="px-siaf-md py-siaf-sm">Nombre de la entidad</th>
                            </tr>
                          </thead>
                          <tbody>
                            @for (row of entityRows; track row.code) {
                              <tr class="h-12 border-b border-[var(--sys-color-divider-default)] bg-surface text-[var(--sys-color-text-neutral-medium)]">
                                <td class="px-siaf-md py-siaf-sm">{{ row.code }}</td>
                                <td class="px-siaf-md py-siaf-sm">{{ row.name }}</td>
                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>
                      <siaf-pagination navigation="Activate" position="Bottom" [rowPage]="true" [page]="1" [pageSize]="10" [totalItems]="800" [totalPages]="80" [rowsPerPage]="10" />
                    </section>

                    <section class="flex flex-col gap-siaf-md">
                      <ng-container [ngTemplateOutlet]="sectionTitle" [ngTemplateOutletContext]="{ title: 'Inicio de vigencia' }" />
                      <ng-container [ngTemplateOutlet]="plainField" [ngTemplateOutletContext]="{ field: validityStartField }" />
                      <label class="flex min-h-10 items-center gap-siaf-sm text-sm font-medium text-[var(--sys-color-text-neutral-medium)]">
                        <input class="size-4 accent-[var(--sys-color-icon-states-enabled)]" type="checkbox" checked disabled />
                        ¿Está visible?
                      </label>
                    </section>
                  </div>
                </section>

                <section class="rounded-siaf-md border border-[var(--sys-color-divider-strong)] bg-surface px-siaf-xl py-siaf-lg">
                  <header class="mb-siaf-md">
                    <h2 class="m-0 text-base font-bold uppercase leading-normal tracking-[0.02px] text-text">Justificación del sustento</h2>
                  </header>
                  <div class="flex flex-col gap-siaf-xl">
                    <ng-container [ngTemplateOutlet]="plainField" [ngTemplateOutletContext]="{ field: justificationField, multiline: true }" />
                    <section class="flex flex-col gap-siaf-md">
                      <ng-container [ngTemplateOutlet]="sectionTitle" [ngTemplateOutletContext]="{ title: 'Documento de sustento' }" />
                      <div class="flex min-h-16 items-center gap-siaf-md rounded-siaf-md border border-[var(--sys-color-divider-strong)] bg-surface px-siaf-md">
                        <siaf-icon name="description" [size]="24" />
                        <div class="min-w-0 flex-1">
                          <strong class="block truncate text-sm font-bold text-text">{{ supportDocument.name }}</strong>
                          <span class="block text-xs text-text-muted">{{ supportDocument.size }}</span>
                        </div>
                        <siaf-icon name="download" [size]="24" />
                      </div>
                    </section>
                  </div>
                </section>

                <section class="rounded-siaf-md border border-[var(--sys-color-divider-strong)] bg-surface">
                  <siaf-action-tracker [summaryItems]="actionSummary" />
                </section>
              </section>
            </div>
          </div>

          <ng-template #readonlyCard let-field="field">
            <div class="relative flex min-h-[72px] min-w-0 flex-col justify-center gap-siaf-xxs rounded-siaf-md border border-[var(--sys-color-divider-strong)] bg-surface px-siaf-md py-siaf-xs">
              <span class="absolute left-0 top-5 h-6 w-[3px] rounded-r bg-brand-primary" aria-hidden="true"></span>
              <span class="truncate text-[11px] font-medium uppercase leading-none tracking-[0.66px] text-text-muted">{{ field.label }}</span>
              <span class="truncate text-sm font-bold leading-normal text-text">{{ field.value }}</span>
            </div>
          </ng-template>

          <ng-template #plainField let-field="field" let-multiline="multiline">
            <div class="min-w-0">
              <span class="block text-[11px] font-medium uppercase leading-none tracking-[0.66px] text-text-muted">{{ field.label }}</span>
              @if (multiline) {
                <p class="m-0 mt-siaf-xs text-sm font-normal leading-normal text-text">{{ field.value }}</p>
              } @else {
                <strong class="mt-siaf-xs block truncate text-sm font-bold leading-normal text-text">{{ field.value }}</strong>
              }
            </div>
          </ng-template>

          <ng-template #sectionTitle let-title="title">
            <div class="flex min-h-10 items-center">
              <h3 class="m-0 text-sm font-bold uppercase leading-normal tracking-[0.02px] text-text">{{ title }}</h3>
            </div>
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
    { label: 'Nro Documento', value: DEMO_RECORD_NUMBER.padStart(5, '0') },
    { label: 'Tipo de accion', value: DEMO_ACTION_TYPE },
    { label: 'Fecha', value: DEMO_RECORD_DATE }
  ];

  readonly generalFields: HistoryField[] = [
    { label: 'Nombre del plan de cuentas contable', value: DEMO_PLAN_NAME }
  ];

  readonly entityRows: EntityRow[] = DEMO_ENTITIES;
  readonly supportDocument = DEMO_SUPPORT_DOCUMENT;

  readonly actionSummary: ActionTrackerSummary[] = [
    { label: 'Elaborado por', actionBy: 'Ricardo John Doe Bustamante', date: '19/08/2025\n08:00:59' },
    { label: 'Verificado por', actionBy: 'Ricardo John Doe Bustamante', date: '19/08/2025\n08:00:59' },
    { label: 'Aprobado por', actionBy: 'Ricardo John Doe Bustamante', date: '19/08/2025\n08:00:59' }
  ];

  get documentSummaryField(): HistoryField {
    return { label: 'Documento', value: DEMO_RECORD_DOCUMENT };
  }

  get numberSummaryField(): HistoryField {
    return { label: 'Nro de documento', value: DEMO_RECORD_NUMBER };
  }

  get actionSummaryField(): HistoryField {
    return { label: 'Tipo de accion', value: DEMO_ACTION_TYPE };
  }

  get recordStatus(): RecordStatus {
    const status = this.value('status');
    return this.isRecordStatus(status) ? status : 'Activo';
  }

  get accountHeaderFields(): HistoryField[] {
    return [
      { label: 'Codigo de cuenta contable', value: this.accountCode },
      { label: 'Elemento', value: this.value('element') },
      { label: 'Nombre de la cuenta contable', value: this.value('accountName') }
    ];
  }

  get imputableField(): HistoryField {
    return { label: '¿Es una cuenta imputable?', value: this.value('imputable').toUpperCase() };
  }

  get previousCodeField(): HistoryField {
    return { label: 'Codigo de la cuenta contable', value: this.value('previousCode') };
  }

  get previousNameField(): HistoryField {
    return { label: 'Nombre de la cuenta contable', value: '--' };
  }

  get attributeFields(): HistoryField[] {
    return [
      { label: 'Naturaleza', value: 'Deudora' },
      { label: 'Tipo de elemento', value: this.elementType },
      { label: '¿Es monetaria?', value: 'Si' },
      { label: 'Ambito institucional de aplicacion', value: this.value('institutionalScopes') },
      { label: '¿Aplica Extra Presupuestaria? (AEP)', value: this.value('aep') },
      { label: '¿Es Reciproca ? (RECI)', value: this.value('reciprocal') },
      { label: 'AC Activo', value: 'Si' },
      { label: 'PC Pasivo', value: 'Si' },
      { label: 'ANC Activo', value: 'Si' },
      { label: 'PNC Pasivo', value: 'Si' }
    ];
  }

  get dynamicFields(): HistoryField[] {
    return [
      { label: '¿Tiene dinamica contable?', value: 'No' },
      { label: 'Se debita por', value: '--' },
      { label: 'Se acredita por', value: '--' },
      { label: 'Objeto', value: '--' },
      { label: 'Saldos', value: '--' }
    ];
  }

  get validityStartField(): HistoryField {
    return { label: 'Fecha inicio desde', value: DEMO_VALIDITY_START };
  }

  get classifierEnabledField(): HistoryField {
    return { label: 'Cuenta contable para una entidad del estado', value: 'Si' };
  }

  get justificationField(): HistoryField {
    return {
      label: 'Justificacion del requerimiento solicitado',
      value: 'Solicito la creacion de este evento, con afectacion presupuestal o sin afectacion presupuestal, segun corresponda, por tratarse de una operacion vinculada a la gestion financiera de la entidad, necesaria para el cumplimiento de las disposiciones contables, presupuestales y fiscales aplicables.'
    };
  }

  get elementType(): string {
    return this.value('element') === '1' ? 'Activo' : '--';
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

  private isRecordStatus(value: string): value is RecordStatus {
    return ['Activo', 'Inactivo', 'Anulado', 'En Proceso', 'Validado', 'Eliminado'].includes(value);
  }
}
