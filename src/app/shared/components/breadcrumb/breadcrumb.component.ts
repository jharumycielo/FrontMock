import { ChangeDetectionStrategy, Component, HostListener, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconComponent } from '../../ui/icon/icon.component';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

@Component({
  selector: 'siaf-breadcrumb',
  standalone: true,
  imports: [IconComponent, RouterLink],
  template: `
    <nav class="flex h-10 w-full items-center bg-surface px-siaf-md py-siaf-xxs" aria-label="Ruta de navegacion">
      <ol class="flex min-w-0 items-center gap-siaf-xxs overflow-visible text-xs leading-none">
        <li class="flex shrink-0 items-center gap-siaf-xxs">
          <a
            class="inline-flex size-8 items-center justify-center rounded-siaf-md text-text transition hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            [routerLink]="resolvedHomeHref"
            aria-label="Inicio"
          >
            <siaf-icon name="home" [size]="20" />
          </a>
          @if (displayItems.length > 0) {
            <siaf-icon class="text-text-muted" name="keyboard_arrow_right" [size]="12" />
          }
        </li>

        @if (hasCollapsedItems) {
          <li class="relative flex shrink-0 items-center gap-siaf-xxs">
            <button
              class="inline-flex size-8 items-center justify-center rounded-siaf-md text-text-muted transition hover:bg-surface-muted hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              type="button"
              aria-label="Niveles intermedios"
              [attr.aria-expanded]="collapsedMenuOpen"
              (click)="toggleCollapsedMenu($event)"
            >
              <siaf-icon name="more_horiz" [size]="20" />
            </button>
            <siaf-icon class="text-text-muted" name="keyboard_arrow_right" [size]="12" />

            @if (collapsedMenuOpen) {
              <div
                class="absolute left-0 top-9 z-30 min-w-64 max-w-80 rounded-siaf-md border border-border bg-surface py-siaf-xs shadow-lg"
                role="menu"
                (click)="$event.stopPropagation()"
              >
                @for (item of collapsedItems; track item.label) {
                  @if (item.href) {
                    <a
                      class="block truncate px-siaf-md py-siaf-sm text-xs font-medium text-text hover:bg-surface-muted"
                      [routerLink]="item.href"
                      role="menuitem"
                    >
                      {{ item.label }}
                    </a>
                  } @else {
                    <span class="block truncate px-siaf-md py-siaf-sm text-xs font-medium text-text-muted" role="menuitem">
                      {{ item.label }}
                    </span>
                  }
                }
              </div>
            }
          </li>
        }

        @for (item of visibleItems; track item.label; let last = $last) {
          <li class="flex min-w-0 shrink-0 items-center gap-siaf-xxs">
            @if (item.href && !last) {
              <a class="max-w-[180px] truncate font-medium text-text hover:underline" [routerLink]="item.href">
                {{ item.label }}
              </a>
            } @else {
              <span
                class="max-w-[220px] truncate"
                [class.font-medium]="!last"
                [class.font-normal]="last"
                [class.text-text]="!last"
                [class.text-text-muted]="last"
              >
                {{ item.label }}
              </span>
            }
            @if (!last) {
              <siaf-icon class="text-text-muted" name="keyboard_arrow_right" [size]="12" />
            }
          </li>
        }
      </ol>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];
  @Input() homeHref = '#';

  collapsedMenuOpen = false;

  @HostListener('document:click')
  closeCollapsedMenu(): void {
    this.collapsedMenuOpen = false;
  }

  get resolvedHomeHref(): string {
    return this.homeItem?.href || this.homeHref;
  }

  get displayItems(): BreadcrumbItem[] {
    if (this.homeItem) {
      return this.items.slice(1);
    }

    return this.items;
  }

  get visibleItems(): BreadcrumbItem[] {
    const displayItems = this.displayItems;

    if (displayItems.length > 3) {
      return displayItems.slice(-2);
    }

    return displayItems;
  }

  get hasCollapsedItems(): boolean {
    return this.displayItems.length > 3;
  }

  get collapsedItems(): BreadcrumbItem[] {
    if (!this.hasCollapsedItems) {
      return [];
    }

    return this.displayItems.slice(0, -2);
  }

  toggleCollapsedMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.collapsedMenuOpen = !this.collapsedMenuOpen;
  }

  private get homeItem(): BreadcrumbItem | undefined {
    const firstItem = this.items[0];

    if (firstItem?.label.trim().toLowerCase() === 'inicio') {
      return firstItem;
    }

    return undefined;
  }
}
