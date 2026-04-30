import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

@Component({
  selector: 'siaf-tabs',
  standalone: true,
  template: `
    <div class="flex flex-wrap gap-1 rounded-siaf-lg border border-border bg-surface-muted p-1" role="tablist">
      @for (tab of tabs; track tab.id) {
        <button
          class="inline-flex h-9 items-center gap-2 rounded-siaf-md px-3 text-sm font-medium transition"
          role="tab"
          [id]="tabId(tab.id)"
          [class.bg-surface]="tab.id === activeId"
          [class.text-text]="tab.id === activeId"
          [class.shadow-siaf-sm]="tab.id === activeId"
          [class.text-text-muted]="tab.id !== activeId"
          [attr.aria-selected]="tab.id === activeId"
          [attr.tabindex]="tab.id === activeId ? 0 : -1"
          type="button"
          (click)="selectTab(tab.id)"
          (keydown.arrowRight)="focusNext($index)"
          (keydown.arrowLeft)="focusPrevious($index)"
          (keydown.home)="focusAt(0)"
          (keydown.end)="focusAt(tabs.length - 1)"
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

  @Output() activeIdChange = new EventEmitter<string>();
  @Output() selected = new EventEmitter<TabItem>();

  selectTab(id: string): void {
    this.activeId = id;
    this.activeIdChange.emit(id);

    const tab = this.tabs.find((item) => item.id === id);
    if (tab) {
      this.selected.emit(tab);
    }
  }

  tabId(id: string): string {
    return `siaf-tab-${id}`;
  }

  focusNext(index: number): void {
    this.focusAt((index + 1) % this.tabs.length);
  }

  focusPrevious(index: number): void {
    this.focusAt((index - 1 + this.tabs.length) % this.tabs.length);
  }

  focusAt(index: number): void {
    const tab = this.tabs[index];
    if (!tab) {
      return;
    }

    this.selectTab(tab.id);
    document.getElementById(this.tabId(tab.id))?.focus();
  }
}
