import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'siaf-solicitude-form-card',
  standalone: true,
  template: `
    <section class="rounded-siaf-md bg-surface">
      @if (title) {
        <header class="flex min-h-14 items-center justify-between gap-siaf-md px-siaf-lg pt-siaf-md">
          <h2 class="m-0 text-base font-bold uppercase tracking-[0.02px] text-text">{{ title }}</h2>
          <ng-content select="[card-actions]" />
        </header>
      }

      <div class="flex flex-col gap-siaf-lg px-siaf-lg py-siaf-md">
        <ng-content />
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SolicitudeFormCardComponent {
  @Input() title = '';
}
