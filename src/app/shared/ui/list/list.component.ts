import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { IconComponent } from '../icon/icon.component';

export interface ListItem {
  title: string;
  description?: string;
  icon?: string;
}

@Component({
  selector: 'siaf-list',
  standalone: true,
  imports: [IconComponent],
  template: `
    <ul class="divide-y divide-border overflow-hidden rounded-siaf-lg border border-border bg-surface">
      @for (item of items; track item.title) {
        <li class="flex gap-3 px-4 py-3">
          @if (item.icon) {
            <siaf-icon class="mt-0.5 text-text-muted" [name]="item.icon" [size]="20" />
          }
          <div>
            <p class="text-sm font-medium text-text">{{ item.title }}</p>
            @if (item.description) {
              <p class="mt-0.5 text-sm text-text-muted">{{ item.description }}</p>
            }
          </div>
        </li>
      }
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent {
  @Input() items: ListItem[] = [];
}
