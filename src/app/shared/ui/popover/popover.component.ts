import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'siaf-popover',
  standalone: true,
  template: `
    <div class="relative inline-block">
      <ng-content select="[popover-trigger]" />
      @if (open) {
        <div class="absolute right-0 z-20 mt-2 min-w-64 rounded-siaf-lg border border-border bg-surface p-4 text-sm text-text-muted shadow-siaf-md">
          <ng-content />
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopoverComponent {
  @Input() open = true;
}
