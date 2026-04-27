import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'siaf-loading-progress',
  standalone: true,
  template: `
    @if (variant === 'spinner') {
      <span class="inline-block animate-spin rounded-full border-2 border-brand-primary border-r-transparent" [style.width.px]="size" [style.height.px]="size"></span>
    } @else {
      <div class="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
        <div class="h-full rounded-full bg-brand-primary transition-all" [style.width.%]="value"></div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingProgressComponent {
  @Input() variant: 'spinner' | 'bar' = 'spinner';
  @Input() value = 50;
  @Input() size = 24;
}
