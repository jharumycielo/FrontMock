import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'siaf-empty-state',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center gap-siaf-md px-siaf-md py-siaf-xl text-center">
      <img [src]="image" [style.width.px]="imageSize" [style.height.px]="imageSize" alt="" aria-hidden="true" />
      <h2 class="m-0 text-base font-bold text-[var(--sys-color-text-neutral-high)]">{{ title }}</h2>
      @if (description) {
        <p class="m-0 max-w-[420px] text-sm text-[var(--sys-color-text-neutral-medium)]">{{ description }}</p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateComponent {
  @Input({ required: true }) title = '';
  @Input() description = '';
  @Input() image = '/assets/figma/illustrations/empty-state.svg';
  @Input() imageSize = 140;
}