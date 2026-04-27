import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'siaf-card',
  standalone: true,
  template: `
    <section class="rounded-siaf-lg border border-border bg-surface shadow-siaf-sm">
      @if (title || description) {
        <header class="border-b border-border px-5 py-4">
          @if (title) {
            <h2 class="text-base font-semibold text-text">{{ title }}</h2>
          }
          @if (description) {
            <p class="mt-1 text-sm text-text-muted">{{ description }}</p>
          }
        </header>
      }
      <div class="p-5">
        <ng-content />
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent {
  @Input() title = '';
  @Input() description = '';
}
