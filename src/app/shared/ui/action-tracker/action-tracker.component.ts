import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type ActionTrackerVariant = 'default' | 'detail';
export type ActionTrackerTab = 'detail' | 'history';
export type ActionTrackerDetailType =
  | 'default'
  | 'rejection-explanation'
  | 'rejection-reason'
  | 'evaluation-comment'
  | 'acceptance-comment'
  | 'observation-comment';

export type ActionTrackerSummary = {
  actionBy: string;
  date: string;
};

export type ActionTrackerHistoryRow = {
  iteration: string;
  process: string;
  reason: string;
  description: string;
  date: string;
  role: string;
  user: string;
};

const DETAIL_LABELS: Record<ActionTrackerDetailType, string> = {
  default: 'DESCRIPCION',
  'rejection-explanation': 'EXPLICACION RECHAZO',
  'rejection-reason': 'MOTIVO RECHAZO',
  'evaluation-comment': 'COMENTARIO EVALUACION',
  'acceptance-comment': 'COMENTARIO ACEPTACION',
  'observation-comment': 'COMENTARIO OBSERVACION'
};

@Component({
  selector: 'siaf-action-tracker',
  standalone: true,
  imports: [NgClass],
  template: `
    <section class="flex w-full max-w-[840px] flex-col items-start gap-siaf-md">
      @if (variant === 'detail' || showTabs) {
        <div class="w-full overflow-hidden rounded-siaf-md bg-[rgb(32_32_32/0.04)]">
          <div class="flex min-h-10 w-full items-start border-b-2 border-[rgb(32_32_32/0.24)]">
            <button
              class="flex min-h-10 items-center justify-center px-siaf-md py-siaf-xs text-sm"
              type="button"
              [ngClass]="tabClass('detail')"
            >
              Detalle
            </button>
            <button
              class="flex min-h-10 items-center justify-center px-siaf-md py-siaf-xs text-sm"
              type="button"
              [ngClass]="tabClass('history')"
            >
              Historial
            </button>
          </div>

          @if (activeTab === 'detail') {
            <div class="flex w-full flex-col gap-siaf-xxs rounded-b-siaf-md bg-surface px-siaf-xl py-siaf-md max-sm:px-siaf-md">
              <div class="flex min-h-[54px] w-full flex-col gap-siaf-xxs">
                <span class="truncate text-[11px] font-medium uppercase leading-none tracking-[0.66px] text-text-muted">
                  {{ detailLabel }}
                </span>
                <p class="m-0 text-sm font-normal leading-normal tracking-[0.025px] text-[var(--sys-color-text-neutral-medium)]">
                  {{ description }}
                </p>
              </div>
            </div>
          } @else {
            <div class="w-full rounded-b-siaf-md bg-surface">
              <div class="px-siaf-xl pt-siaf-md max-sm:px-siaf-md">
                <h3 class="m-0 text-base font-bold uppercase leading-none tracking-[0.02px] text-text">
                  Historial de comentarios y detalles
                </h3>
              </div>

              <div class="w-full overflow-x-auto px-siaf-xl py-siaf-md max-sm:px-siaf-md">
                <table class="min-w-[1040px] border-collapse text-left text-sm text-[var(--sys-color-text-neutral-medium)]">
                  <thead>
                    <tr class="bg-[rgb(32_32_32/0.12)] text-xs font-bold uppercase text-text">
                      <th class="w-[122px] rounded-l-siaf-sm border-b border-[rgb(32_32_32/0.24)] px-siaf-md py-siaf-sm">Iteracion</th>
                      <th class="w-[120px] border-b border-[rgb(32_32_32/0.24)] px-siaf-md py-siaf-sm">Proceso</th>
                      <th class="w-[198px] border-b border-[rgb(32_32_32/0.24)] px-siaf-md py-siaf-sm">Comentario / motivo</th>
                      <th class="min-w-[200px] border-b border-[rgb(32_32_32/0.24)] px-siaf-md py-siaf-sm">Descripcion</th>
                      <th class="w-[120px] border-b border-[rgb(32_32_32/0.24)] px-siaf-md py-siaf-sm">Fecha</th>
                      <th class="w-[110px] border-b border-[rgb(32_32_32/0.24)] px-siaf-md py-siaf-sm">Rol</th>
                      <th class="w-[140px] rounded-r-siaf-sm border-b border-[rgb(32_32_32/0.24)] px-siaf-md py-siaf-sm">Usuario</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of historyRows; track row.iteration + row.process + row.date) {
                      <tr>
                        <td class="border-b border-border px-siaf-md py-siaf-sm align-top">{{ row.iteration }}</td>
                        <td class="border-b border-border px-siaf-md py-siaf-sm align-top">{{ row.process }}</td>
                        <td class="border-b border-border px-siaf-md py-siaf-sm align-top">{{ row.reason }}</td>
                        <td class="border-b border-border px-siaf-md py-siaf-sm align-top">{{ row.description }}</td>
                        <td class="whitespace-pre-line border-b border-border px-siaf-md py-siaf-sm align-top">{{ row.date }}</td>
                        <td class="whitespace-pre-line border-b border-border px-siaf-md py-siaf-sm align-top">{{ row.role }}</td>
                        <td class="whitespace-pre-line border-b border-border px-siaf-md py-siaf-sm align-top">{{ row.user }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }
        </div>
      }

      @if (showSummaryCards) {
        <div class="w-full rounded-siaf-md bg-surface px-siaf-lg py-siaf-md">
          <div class="flex w-full flex-wrap items-start gap-siaf-lg">
            @for (item of summaryItems; track item.actionBy + item.date) {
              <div class="flex min-w-[164px] flex-1 flex-col gap-siaf-xs">
                <div class="flex flex-col gap-siaf-xxs">
                  <span class="truncate text-[11px] font-medium uppercase leading-none tracking-[0.66px] text-text-muted">
                    ACCION POR
                  </span>
                  <strong class="text-sm font-bold leading-normal tracking-[-0.02px] text-[var(--sys-color-text-neutral-medium)]">
                    {{ item.actionBy }}
                  </strong>
                </div>

                <div class="flex flex-col gap-siaf-xxs">
                  <span class="truncate text-[11px] font-medium uppercase leading-none tracking-[0.66px] text-text-muted">
                    FECHA
                  </span>
                  <strong class="whitespace-pre-line text-sm font-bold leading-normal tracking-[-0.02px] text-[var(--sys-color-text-neutral-medium)]">
                    {{ item.date }}
                  </strong>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionTrackerComponent {
  @Input() variant: ActionTrackerVariant = 'default';
  @Input() activeTab: ActionTrackerTab = 'detail';
  @Input() detailType: ActionTrackerDetailType = 'default';
  @Input() description =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';
  @Input() showTabs = false;
  @Input() showSummaryCards = true;
  @Input() summaryItems: ActionTrackerSummary[] = [
    { actionBy: 'RICARDO JOHN DOE BUSTAMANTE', date: '19/08/2025\n08:00:59' },
    { actionBy: 'RICARDO JOHN DOE BUSTAMANTE', date: '19/08/2025\n08:00:59' },
    { actionBy: 'RICARDO JOHN DOE BUSTAMANTE', date: '19/08/2025\n08:00:59' },
    { actionBy: 'RICARDO JOHN DOE BUSTAMANTE', date: '19/08/2025\n08:00:59' }
  ];
  @Input() historyRows: ActionTrackerHistoryRow[] = [
    {
      iteration: '1',
      process: 'Aceptar Solicitud',
      reason: 'Comentario de Determinacion de la Aceptacion',
      description: '',
      date: '30/08/2023\n08:00:59',
      role: 'Aprobador\nDPSP - MEF',
      user: 'Ricardo John\nDoe Bustamante'
    },
    {
      iteration: '2',
      process: 'Validar Solicitud',
      reason: 'Comentario de Evaluacion',
      description: 'Se valido la informacion registrada.',
      date: '18/08/2023\n08:00:59',
      role: 'Evaluador DPT',
      user: 'Karim Lucano Lara'
    },
    {
      iteration: '1',
      process: 'Observar Solicitud',
      reason: 'Comentario de la Observacion',
      description: 'La informacion registrada se encuentra incompleta.',
      date: '14/08/2023\n08:00:59',
      role: 'Evaluador DPT',
      user: 'Karim Lucano Lara'
    }
  ];

  get detailLabel(): string {
    return DETAIL_LABELS[this.detailType];
  }

  tabClass(tab: ActionTrackerTab): string {
    return this.activeTab === tab
      ? 'border-b-2 border-brand-primary font-bold tracking-[-0.02px] text-brand-primary'
      : 'font-medium tracking-[0.025px] text-text-muted';
  }
}
