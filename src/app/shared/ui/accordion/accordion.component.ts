import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { IconComponent } from '../icon/icon.component';

export interface AccordionItem {
  id: string;
  title: string;
  content: string;
  disabled?: boolean;
}

@Component({
  selector: 'siaf-accordion',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="divide-y divide-border overflow-hidden rounded-siaf-lg border border-border bg-surface">
      @for (item of items; track item.id) {
        <details class="group" [open]="item.id === openId && !item.disabled">
          <summary
            class="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-sm font-semibold text-text transition hover:bg-surface-muted group-open:bg-surface-muted"
            [class.cursor-not-allowed]="item.disabled"
            [class.opacity-50]="item.disabled"
          >
            <span>{{ item.title }}</span>
            <siaf-icon class="text-text-muted transition group-open:rotate-180" name="expand_more" [size]="20" />
          </summary>
          @if (!item.disabled) {
            <div class="px-4 pb-4 text-sm leading-6 text-text-muted">
              {{ item.content }}
            </div>
          }
        </details>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccordionComponent {
  @Input() items: AccordionItem[] = [];
  @Input() openId = '';
}
