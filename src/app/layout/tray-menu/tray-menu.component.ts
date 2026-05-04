import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { IconComponent } from '../../shared/ui/icon/icon.component';

type TrayItem = {
  label: string;
  icon: string;
  count: string;
  active?: boolean;
};

@Component({
  selector: 'siaf-tray-menu',
  standalone: true,
  imports: [IconComponent],
  template: `
    <aside class="flex h-[calc(100vh-56px)] w-full flex-col items-center border-r border-[var(--sys-color-divider-default,rgba(32,32,32,0.12))] bg-[var(--sys-color-bg-surfaces-surface-highest,white)] py-siaf-xs lg:w-[300px]">
      <header class="flex w-full items-center px-siaf-lg py-siaf-md">
        <h2 class="m-0 text-sm font-bold leading-normal text-[var(--sys-color-tipography-neutral-high)]">BANDEJA</h2>
      </header>

      <nav class="flex w-full flex-col">
        @for (item of items; track item.label) {
          <button
            class="flex min-h-12 w-full items-center gap-siaf-md overflow-hidden rounded-siaf-sm px-siaf-md py-siaf-sm text-left transition hover:bg-[var(--sys-color-bg-states-light-hover,rgba(32,32,32,0.04))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            type="button"
            [class.bg-[var(--sys-color-bg-states-light-selected,rgba(1,72,153,0.08))]]="isSelected(item)"
            (click)="selected.emit(item.label)"
          >
            <siaf-icon
              class="shrink-0"
              [name]="item.icon"
              [size]="24"
              [class.text-[var(--sys-color-text-neutral-activated)]]="isSelected(item)"
              [class.text-[var(--sys-color-text-neutral-medium)]]="!isSelected(item)"
            />
            <span
              class="min-w-0 flex-1 text-sm leading-normal tracking-[0.025px]"
              [class.font-bold]="isSelected(item)"
              [class.font-normal]="!isSelected(item)"
              [class.text-[var(--sys-color-text-neutral-activated)]]="isSelected(item)"
              [class.text-[var(--sys-color-text-neutral-medium)]]="!isSelected(item)"
            >
              {{ item.label }}
            </span>
            <span class="inline-flex h-5 min-w-8 max-w-9 items-center justify-center rounded-full bg-[var(--sys-color-bg-brand-accent)] px-siaf-xxs text-center text-xs font-medium leading-normal text-white">
              {{ item.count }}
            </span>
          </button>
        }
      </nav>
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrayMenuComponent {
  @Input() selectedItem = 'Borradores';
  @Output() selected = new EventEmitter<string>();

  readonly items: TrayItem[] = [
    { label: 'Recibidos', icon: 'description', count: '03' },
    { label: 'Enviados', icon: 'send', count: '02' },
    { label: 'Borradores', icon: 'edit_note', count: '02', active: true },
    { label: 'Notificaciones', icon: 'notifications', count: '02' },
    { label: 'Papelera', icon: 'delete', count: '02' }
  ];

  isSelected(item: TrayItem): boolean {
    return item.label === this.selectedItem;
  }
}
