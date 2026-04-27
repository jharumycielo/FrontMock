import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { IconComponent } from '../icon/icon.component';

export interface TreeViewNode {
  id: string;
  label: string;
  icon?: string;
  expanded?: boolean;
  children?: TreeViewNode[];
}

@Component({
  selector: 'siaf-tree-view',
  standalone: true,
  imports: [IconComponent],
  template: `
    <ul class="grid gap-1 text-sm">
      @for (node of nodes; track node.id) {
        <li>
          <div class="flex h-8 items-center gap-2 rounded-siaf-md px-2 text-text hover:bg-surface-muted">
            <siaf-icon class="text-text-muted" [name]="node.children?.length ? (node.expanded ? 'expand_more' : 'chevron_right') : 'fiber_manual_record'" [size]="18" />
            @if (node.icon) {
              <siaf-icon class="text-text-muted" [name]="node.icon" [size]="18" />
            }
            <span>{{ node.label }}</span>
          </div>
          @if (node.children?.length && node.expanded) {
            <div class="ml-5 border-l border-border pl-2">
              <siaf-tree-view [nodes]="node.children || []" />
            </div>
          }
        </li>
      }
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeViewComponent {
  @Input() nodes: TreeViewNode[] = [];
}
