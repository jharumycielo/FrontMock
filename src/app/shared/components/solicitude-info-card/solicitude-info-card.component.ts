import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input, OnDestroy, OnInit } from '@angular/core';

export type SolicitudeInfoField = {
  label: string;
  value: string;
};

@Component({
  selector: 'siaf-solicitude-info-card',
  standalone: true,
  template: `
    <section class="rounded-siaf-md bg-surface px-siaf-lg py-siaf-md">
      <div class="grid gap-siaf-xs">
        @for (field of fields; track field.label) {
          <div class="grid min-h-6 gap-siaf-xs md:grid-cols-[140px_1fr]">
            <span class="truncate text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">{{ field.label }}</span>
            <strong class="min-w-0 text-sm font-bold leading-6 text-text">{{ fieldValue(field) }}</strong>
          </div>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SolicitudeInfoCardComponent implements OnInit, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() fields: SolicitudeInfoField[] = [];
  /** Cuando es true, el campo con label "Fecha" muestra la fecha/hora actual actualizándose cada segundo. */
  @Input() liveDate = false;

  currentDateTime = '';
  private intervalId: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    if (this.liveDate) {
      this.tick();
      this.intervalId = setInterval(() => {
        this.tick();
        this.cdr.markForCheck();
      }, 1000);
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
    }
  }

  fieldValue(field: SolicitudeInfoField): string {
    if (this.liveDate && field.label.toLowerCase() === 'fecha') {
      return this.currentDateTime;
    }
    return field.value;
  }

  private tick(): void {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    this.currentDateTime = `${dd}/${mm}/${yyyy}    ${hh}:${min}:${ss}`;
  }
}
