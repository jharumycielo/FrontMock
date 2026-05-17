import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { SidebarNavigation } from '../sidebar/sidebar.component';
import { IconComponent } from '../../shared/ui/icon/icon.component';

type MobileNavigationItem = {
  id: SidebarNavigation | 'Ayuda';
  label: string;
  icon: string;
};

@Component({
  selector: 'siaf-mobile-navigation-menu',
  standalone: true,
  imports: [IconComponent],
  template: `
    <aside class="min-h-[calc(100vh-56px)] w-full border-r border-[var(--sys-color-divider-default)] bg-[var(--sys-color-bg-surfaces-field,var(--sys-color-bg-surfaces-surface-highest))]">
      <header class="sticky top-0 z-[2] bg-[var(--sys-color-bg-surfaces-field,var(--sys-color-bg-surfaces-surface))] p-siaf-md">
        <h2 class="m-0 min-h-6 text-base font-bold uppercase leading-normal tracking-[0.02px] text-text">Bandeja de documentos</h2>
      </header>

      <div class="flex flex-col gap-siaf-lg bg-[var(--sys-color-bg-surfaces-field,var(--sys-color-bg-surfaces-surface))] px-siaf-md py-siaf-xs">
        <button
          class="inline-flex min-h-10 w-full items-center justify-center gap-siaf-xs rounded-siaf-md px-siaf-md py-siaf-xs text-sm font-medium transition enabled:bg-[var(--sys-color-bg-brand-accent)] enabled:text-[var(--sys-color-text-brand-white)] enabled:hover:brightness-90 enabled:active:brightness-75 disabled:cursor-not-allowed disabled:bg-[var(--sys-color-bg-surfaces-disabled)] disabled:text-[var(--sys-color-text-neutral-disabled)]"
          type="button"
          [disabled]="!ctaAdd"
          (click)="created.emit()"
        >
          <siaf-icon name="add" [size]="24" />
          Crear documento
        </button>

        <nav class="flex w-full flex-col">
          @for (item of items; track item.id) {
            <button
              class="flex min-h-12 w-full items-center gap-siaf-md overflow-hidden rounded-siaf-sm px-siaf-md py-siaf-sm text-left transition hover:bg-[var(--sys-color-bg-states-light-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              type="button"
              [class.bg-[var(--sys-color-bg-states-light-selected)]]="isActive(item.id)"
              (click)="select(item)"
            >
              <siaf-icon
                class="shrink-0"
                [name]="item.icon"
                [size]="24"
                [class.text-[var(--sys-color-text-neutral-activated)]]="isActive(item.id)"
                [class.text-[var(--sys-color-text-neutral-medium)]]="!isActive(item.id)"
              />
              <span
                class="min-w-0 flex-1 text-sm leading-normal"
                [class.font-bold]="isActive(item.id)"
                [class.font-normal]="!isActive(item.id)"
                [class.tracking-[-0.02px]]="isActive(item.id)"
                [class.tracking-[0.025px]]="!isActive(item.id)"
                [class.text-[var(--sys-color-text-neutral-activated)]]="isActive(item.id)"
                [class.text-[var(--sys-color-text-neutral-medium)]]="!isActive(item.id)"
              >
                {{ item.label }}
              </span>
            </button>
          }
        </nav>
      </div>
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileNavigationMenuComponent {
  @Input() navigation: SidebarNavigation = 'Panel';
  @Input() ctaAdd = false;

  @Output() created = new EventEmitter<void>();
  @Output() navigationChanged = new EventEmitter<SidebarNavigation>();
  @Output() help = new EventEmitter<void>();

  readonly items: MobileNavigationItem[] = [
    { id: 'Panel', label: 'Panel', icon: 'space_dashboard' },
    { id: 'Bandeja', label: 'Bandeja', icon: 'send' },
    { id: 'Proceso', label: 'Procesos', icon: 'edit_note' },
    { id: 'Ayuda', label: 'Ayuda', icon: 'help_outline' },
    { id: 'Ajustes', label: 'Ajustes', icon: 'settings' }
  ];

  isActive(id: MobileNavigationItem['id']): boolean {
    return id !== 'Ayuda' && this.navigation === id;
  }

  select(item: MobileNavigationItem): void {
    if (item.id === 'Ayuda') {
      this.help.emit();
      return;
    }

    this.navigationChanged.emit(item.id);
  }
}
