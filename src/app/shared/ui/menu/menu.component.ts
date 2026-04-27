import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { IconComponent } from '../icon/icon.component';

export interface MenuItem {
  label: string;
  icon?: string;
  disabled?: boolean;
}

@Component({
  selector: 'siaf-menu',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="w-56 rounded-siaf-lg border border-border bg-surface p-1 shadow-siaf-md">
      @for (item of items; track item.label) {
        <button
          class="flex h-9 w-full items-center gap-2 rounded-siaf-md px-3 text-left text-sm text-text transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          [disabled]="item.disabled"
        >
          @if (item.icon) {
            <siaf-icon class="text-text-muted" [name]="item.icon" [size]="18" />
          }
          {{ item.label }}
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent {
  @Input() items: MenuItem[] = [];
}
