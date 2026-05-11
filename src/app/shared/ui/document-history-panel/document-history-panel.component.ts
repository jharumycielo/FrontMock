import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { FlowStatusTagComponent } from '../flow-status-tag/flow-status-tag.component';
import { IconComponent } from '../icon/icon.component';

export type DocumentHistoryStatus = 'Elaborado' | 'Verificado';

export type DocumentHistorySummary = {
  document: string;
  number: string;
  actionType: string;
};

type DocumentHistoryRow = {
  user: string;
  unit: string;
  date: string;
  time: string;
  status: DocumentHistoryStatus;
};

type ReadonlyField = {
  label: string;
  value: string;
};

@Component({
  selector: 'siaf-document-history-panel',
  standalone: true,
  imports: [FlowStatusTagComponent, IconComponent],
  template: `
    @if (open) {
      <section class="fixed inset-y-0 left-0 right-0 z-50 bg-black/55 pl-0 lg:pl-[65px]" aria-modal="true" role="dialog" aria-labelledby="document-history-title" (click)="closed.emit()">
        <aside
          class="flex h-screen w-full flex-col overflow-hidden bg-surface shadow-siaf-lg lg:rounded-l-siaf-md"
          (click)="$event.stopPropagation()"
        >
          <header class="flex h-14 shrink-0 items-center gap-siaf-xs border-b border-[var(--sys-color-divider-strong)] px-siaf-md">
            <h2 id="document-history-title" class="m-0 flex-1 text-base font-bold uppercase leading-normal tracking-[0.02px] text-text">Historial del documento</h2>
            <button class="inline-flex size-10 items-center justify-center rounded-siaf-md text-text transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-light-pressed)]" type="button" aria-label="Cerrar historial del documento" (click)="closed.emit()">
              <siaf-icon name="close" [size]="24" />
            </button>
          </header>

          <div class="min-h-0 flex-1 overflow-y-auto border-b border-[var(--sys-color-divider-strong)] px-siaf-md py-siaf-md sm:px-siaf-xl">
            <div class="flex flex-col gap-siaf-lg">
              <section class="rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] p-siaf-md">
                <div class="grid gap-siaf-lg md:grid-cols-3">
                  @for (field of summaryFields; track field.label) {
                    <div class="flex min-h-11 min-w-0 flex-col gap-siaf-xxs">
                      <span class="truncate text-[11px] font-medium uppercase leading-none tracking-[0.66px] text-text-muted">{{ field.label }}</span>
                      <span class="truncate text-sm font-medium leading-normal text-text">{{ field.value }}</span>
                    </div>
                  }
                </div>
              </section>

              <section class="overflow-hidden rounded-siaf-sm border border-[var(--sys-color-divider-strong)] bg-surface">
                <button class="flex min-h-12 w-full items-center gap-siaf-xs px-siaf-md py-siaf-xxs text-left transition hover:bg-surface-muted" type="button" (click)="attributesOpen = !attributesOpen">
                  <span class="inline-flex size-10 items-center justify-center rounded-siaf-md">
                    <siaf-icon class="transition" [class.rotate-180]="!attributesOpen" name="expand_less" [size]="24" />
                  </span>
                  <span class="min-w-0 flex-1 text-sm font-medium leading-normal text-text">Atributos de la solicitud de registro de asiento de ajuste</span>
                </button>

                @if (attributesOpen) {
                  <div class="border-t border-[var(--sys-color-divider-default)] p-siaf-md">
                    <div class="grid gap-x-siaf-md gap-y-siaf-lg md:grid-cols-3">
                      @for (field of attributeFields; track field.label) {
                        <div class="flex min-h-11 min-w-0 flex-col gap-siaf-xxs">
                          <span class="truncate text-[11px] font-medium uppercase leading-none tracking-[0.66px] text-text-muted">{{ field.label }}</span>
                          <span class="truncate text-sm font-medium leading-normal text-text">{{ field.value }}</span>
                        </div>
                      }
                    </div>
                  </div>
                }
              </section>

              <section class="min-w-0 overflow-x-auto">
                <table class="w-full min-w-[760px] border-collapse text-left">
                  <thead>
                    <tr class="bg-[var(--sys-color-bg-surfaces-surface-high)]">
                      <th class="h-10 px-siaf-md py-siaf-sm text-xs font-bold uppercase leading-none text-text">Usuario</th>
                      <th class="h-10 px-siaf-md py-siaf-sm text-center text-xs font-bold uppercase leading-none text-text">Unidad organizacional</th>
                      <th class="h-10 w-[220px] px-siaf-md py-siaf-sm text-center text-xs font-bold uppercase leading-none text-text">Fecha</th>
                      <th class="h-10 w-[200px] px-siaf-md py-siaf-sm text-center text-xs font-bold uppercase leading-none text-text">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of historyRows; track row.status + row.date + row.time) {
                      <tr class="border-b border-[var(--sys-color-divider-default)]">
                        <td class="min-h-12 px-siaf-md py-siaf-sm text-sm leading-normal text-text">{{ row.user }}</td>
                        <td class="min-h-12 px-siaf-md py-siaf-sm text-sm leading-normal text-text">{{ row.unit }}</td>
                        <td class="min-h-12 px-siaf-md py-siaf-sm text-sm leading-normal text-text">{{ row.date }} <span class="ml-siaf-md">{{ row.time }}</span></td>
                        <td class="min-h-12 px-siaf-md py-siaf-sm">
                          <siaf-flow-status-tag [status]="row.status" size="standard" />
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </section>
            </div>
          </div>
        </aside>
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentHistoryPanelComponent {
  @Input() open = false;
  @Input() summary: DocumentHistorySummary = {
    document: 'Solicitud de registro de asiento de ajuste',
    number: '0004',
    actionType: 'Creación'
  };

  @Output() closed = new EventEmitter<void>();

  attributesOpen = true;

  readonly attributeFields: ReadonlyField[] = [
    { label: 'Ambito institucional', value: 'EPP' },
    { label: 'Clase de ajuste', value: 'Clase de ajuste' },
    { label: 'Detalle de ajuste', value: 'Detalle de ajuste' }
  ];

  readonly historyRows: DocumentHistoryRow[] = [
    { user: 'RICARDO JOHN DOE BUSTAMANTE', unit: 'DGCP', date: '19/08/2025', time: '08:00:59', status: 'Elaborado' },
    { user: 'RICARDO JOHN DOE BUSTAMANTE', unit: 'DGCP', date: '19/08/2025', time: '08:00:59', status: 'Verificado' }
  ];

  get summaryFields(): ReadonlyField[] {
    return [
      { label: 'Documento', value: this.summary.document },
      { label: 'Nro de documento', value: this.summary.number },
      { label: 'Tipo de acción', value: this.summary.actionType }
    ];
  }
}
