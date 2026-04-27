import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

@Component({
  selector: 'siaf-tabs',
  standalone: true,
  template: `
    <div class="flex flex-wrap gap-1 rounded-siaf-lg border border-border bg-surface-muted p-1">
      @for (tab of tabs; track tab.id) {
        <button
          class="inline-flex h-9 items-center gap-2 rounded-siaf-md px-3 text-sm font-medium transition"
          [class.bg-surface]="tab.id === activeId"
          [class.text-text]="tab.id === activeId"
          [class.shadow-siaf-sm]="tab.id === activeId"
          [class.text-text-muted]="tab.id !== activeId"
          type="button"
        >
          {{ tab.label }}
          @if (tab.count !== undefined) {
            <span class="rounded-full bg-brand-primary/10 px-2 py-0.5 text-xs text-brand-primary">{{ tab.count }}</span>
          }
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsComponent {
  @Input() tabs: TabItem[] = [];
  @Input() activeId = '';
}
