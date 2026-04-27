import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'siaf-side-panel',
  standalone: true,
  imports: [IconComponent],
  template: `
    @if (open) {
      <div class="fixed inset-0 z-40 bg-black/30">
        <aside class="ml-auto h-full w-full max-w-md border-l border-border bg-surface shadow-siaf-md">
          <header class="flex h-16 items-center justify-between border-b border-border px-5">
            <h2 class="text-base font-semibold text-text">{{ title }}</h2>
            <button class="rounded-siaf-sm p-1 text-text-muted hover:bg-surface-muted" type="button" (click)="closed.emit()">
              <siaf-icon name="close" [size]="20" />
            </button>
          </header>
          <div class="p-5">
            <ng-content />
          </div>
        </aside>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidePanelComponent {
  @Input() open = true;
  @Input() title = 'Panel';
  @Output() closed = new EventEmitter<void>();
}
