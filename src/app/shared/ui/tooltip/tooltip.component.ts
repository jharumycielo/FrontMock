import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'siaf-tooltip',
  standalone: true,
  template: `
    <span class="group relative inline-flex">
      <ng-content />
      <span
        class="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden max-w-64 -translate-x-1/2 rounded-siaf-md bg-[var(--sys-color-bg-feedback-dark-default)] px-2 py-1 text-xs font-medium text-[var(--sys-color-text-brand-white)] shadow-siaf-md group-hover:block"
        role="tooltip"
      >
        {{ text }}
      </span>
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipComponent {
  @Input() text = '';
}
