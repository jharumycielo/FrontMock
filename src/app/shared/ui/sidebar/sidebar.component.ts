import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { IconComponent } from '../icon/icon.component';

export interface SidebarItem {
  label: string;
  href?: string;
  active?: boolean;
  icon?: string;
  id?: SidebarNavigation;
}

export type SidebarNavigation = 'Default' | 'Panel' | 'Bandeja' | 'Proceso' | 'Ajustes';
export type SidebarVariant = 'rail' | 'expanded';

type RailItem = {
  id: Exclude<SidebarNavigation, 'Default'>;
  label: string;
  icon: string;
};

const RAIL_ITEMS: RailItem[] = [
  { id: 'Panel', label: 'Panel', icon: 'space_dashboard' },
  { id: 'Bandeja', label: 'Bandeja', icon: 'inbox' },
  { id: 'Proceso', label: 'Procesos', icon: 'picture_in_picture' }
];

@Component({
  selector: 'siaf-sidebar',
  standalone: true,
  imports: [IconComponent, NgClass],
  template: `
    @if (variant === 'rail') {
      <aside class="flex h-full min-h-[745px] w-16 flex-col items-center gap-0 border-r border-[var(--sys-color-divider-default,rgba(32,32,32,0.12))] bg-[var(--sys-color-bg-surfaces-surface,#fff)] px-siaf-xxs py-siaf-xs">
        <div class="z-[1] flex min-h-0 w-full flex-1 flex-col items-center gap-siaf-xxs">
          <button
            class="group flex w-full flex-col items-center gap-siaf-xxs px-0 py-siaf-xs text-center font-['Inter'] text-[10px] font-medium leading-normal text-[var(--sys-color-text-neutral-medium,#29292A)] transition duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary active:scale-[0.98] disabled:cursor-not-allowed"
            type="button"
            [disabled]="!ctaAdd"
            [ngClass]="ctaAdd ? 'text-[var(--sys-color-text-neutral-medium)]' : 'text-[var(--sys-color-text-neutral-disabled)]'"
            (click)="created.emit()"
          >
            <span
              class="relative inline-flex size-10 items-center justify-center rounded-siaf-md transition duration-150"
              [ngClass]="ctaAdd ? 'bg-[var(--sys-color-bg-brand-accent)] text-white group-hover:bg-[#bd294b] group-active:bg-[#a82342]' : 'bg-white text-[var(--sys-color-text-neutral-disabled)]'"
            >
              @if (!ctaAdd) {
                <span class="absolute inset-0 rounded-siaf-md bg-[var(--sys-color-bg-states-dark-disabled)]"></span>
              }
              <siaf-icon class="relative" name="add" [size]="24" />
            </span>
            <span class="font-['Inter'] text-[10px] font-medium leading-normal text-[var(--sys-color-text-neutral-medium,#29292A)]">Crear</span>
          </button>

          <nav class="flex min-h-0 w-full flex-1 flex-col items-center gap-siaf-xxs">
            @for (item of railItems; track item.id) {
              <button
                class="group flex w-full flex-col items-center gap-siaf-xxs px-0 py-siaf-xs text-center font-['Inter'] text-[10px] font-medium leading-normal text-[var(--sys-color-text-neutral-medium,#29292A)] transition duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary active:scale-[0.98]"
                type="button"
                (click)="navigationChanged.emit(item.id)"
              >
                <span class="relative inline-flex size-8 items-center justify-center rounded-siaf-md" [ngClass]="iconShellClass(item.id)">
                  @if (isActive(item.id)) {
                    <span class="absolute inset-0 rounded-siaf-md bg-brand-primary/10"></span>
                  }
                  <siaf-icon class="relative" [name]="item.icon" [size]="24" />
                </span>
                <span class="font-['Inter'] text-[10px] font-medium leading-normal text-[var(--sys-color-text-neutral-medium,#29292A)]">{{ item.label }}</span>
              </button>
            }
          </nav>

          @if (buttonHelp) {
            <button
              class="group flex w-full flex-col items-center gap-siaf-xxs px-0 py-siaf-xs text-center font-['Inter'] text-[10px] font-medium leading-normal text-[var(--sys-color-text-neutral-medium,#29292A)] transition duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary active:scale-[0.98]"
              type="button"
              (click)="help.emit()"
            >
              <span class="inline-flex size-8 items-center justify-center rounded-siaf-md transition duration-150 group-hover:bg-[rgba(32,32,32,0.08)] group-active:bg-[rgba(32,32,32,0.16)]">
                <siaf-icon name="help_outline" [size]="24" />
              </span>
              <span class="font-['Inter'] text-[10px] font-medium leading-normal text-[var(--sys-color-text-neutral-medium,#29292A)]">Ayuda</span>
            </button>
          }

          <button
            class="group flex w-full flex-col items-center gap-siaf-xxs px-0 py-siaf-xs text-center font-['Inter'] text-[10px] font-medium leading-normal text-[var(--sys-color-text-neutral-medium,#29292A)] transition duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary active:scale-[0.98]"
            type="button"
            (click)="navigationChanged.emit('Ajustes')"
          >
            <span class="relative inline-flex size-8 items-center justify-center rounded-siaf-md" [ngClass]="iconShellClass('Ajustes')">
              @if (isActive('Ajustes')) {
                <span class="absolute inset-0 rounded-siaf-md bg-brand-primary/10"></span>
              }
              <siaf-icon class="relative" name="settings" [size]="24" />
            </span>
            <span class="font-['Inter'] text-[10px] font-medium leading-normal text-[var(--sys-color-text-neutral-medium,#29292A)]">Ajustes</span>
          </button>
        </div>
      </aside>
    } @else {
      <aside class="h-full w-64 border-r border-border bg-brand-secondary text-white">
        <div class="flex h-16 items-center border-b border-white/10 px-6">
          <span class="text-lg font-bold tracking-normal">{{ title }}</span>
        </div>
        <nav class="grid gap-1 p-3 text-sm">
          @for (item of items; track item.label) {
            <a
              class="flex items-center gap-2 rounded-siaf-md px-3 py-2 transition hover:bg-white/10 hover:text-white"
              [class.bg-white\/10]="item.active"
              [class.font-medium]="item.active"
              [class.text-white\/75]="!item.active"
              [href]="item.href || '#'"
            >
              @if (item.icon) {
                <siaf-icon [name]="item.icon" [size]="18" />
              }
              {{ item.label }}
            </a>
          }
        </nav>
      </aside>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  @Input() variant: SidebarVariant = 'rail';
  @Input() title = 'SIAF RP';
  @Input() items: SidebarItem[] = [];
  @Input() navigation: SidebarNavigation = 'Default';
  @Input() ctaAdd = true;
  @Input() buttonHelp = false;

  @Output() created = new EventEmitter<void>();
  @Output() navigationChanged = new EventEmitter<SidebarNavigation>();
  @Output() help = new EventEmitter<void>();

  readonly railItems = RAIL_ITEMS;

  isActive(item: SidebarNavigation): boolean {
    return this.navigation === item;
  }

  iconShellClass(item: SidebarNavigation): string {
    return this.isActive(item)
      ? 'bg-brand-primary/10 text-brand-primary group-hover:bg-brand-primary/15 group-active:bg-brand-primary/25'
      : 'bg-transparent text-[var(--sys-color-text-neutral-medium)] group-hover:bg-[rgba(32,32,32,0.08)] group-active:bg-[rgba(32,32,32,0.16)]';
  }
}
