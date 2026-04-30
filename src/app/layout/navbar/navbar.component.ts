import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconComponent } from '../../shared/ui/icon/icon.component';

@Component({
  selector: 'siaf-navbar',
  standalone: true,
  imports: [IconComponent, RouterLink],
  template: `
    <header class="flex h-14 w-full items-center justify-between bg-brand-primary px-siaf-md py-siaf-xxs text-white">
      <div class="flex min-w-0 shrink-0 items-center gap-siaf-lg">
        @if (showMenu) {
          <button
            class="inline-flex size-8 items-center justify-center rounded-siaf-md transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            type="button"
            aria-label="Abrir menu"
            (click)="menuClicked.emit()"
          >
            <siaf-icon name="menu" [size]="20" />
          </button>
        }

        <a class="flex h-10 items-center text-white" [routerLink]="homeHref" aria-label="SIAF-RP">
          <img class="h-10 w-[128px] object-contain" src="assets/figma/logos/siaf-rp-default-white.svg" alt="SIAF-RP" />
        </a>
      </div>

      <div class="flex min-w-0 items-center justify-end gap-siaf-md">
        <ng-content />

        @if (showNotifications) {
          <button
            class="inline-flex size-8 shrink-0 items-center justify-center rounded-siaf-md transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            type="button"
            aria-label="Notificaciones"
          >
            <siaf-icon name="notifications" [size]="24" />
          </button>
        }

        @if (showProfile) {
          <button
            class="flex min-w-0 items-center gap-siaf-sm rounded-siaf-md py-siaf-xxs pl-siaf-sm pr-siaf-xs text-left transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            type="button"
            aria-label="Perfil de usuario"
          >
            <span class="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-white bg-[var(--sys-color-bg-states-light-selected)] text-base font-medium text-brand-primary">
              {{ initials }}
            </span>
            <span class="hidden min-w-0 flex-col gap-1 text-white md:flex">
              <strong class="truncate text-sm font-bold leading-none">{{ userName }}</strong>
              <span class="max-w-[200px] truncate text-xs uppercase leading-none">{{ officeName }}</span>
            </span>
            <siaf-icon class="hidden shrink-0 md:block" name="keyboard_arrow_down" [size]="24" />
          </button>
        }
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  @Input() homeHref = '/panel';
  @Input() initials = 'JP';
  @Input() userName = 'Juan Doe Perez Perez';
  @Input() officeName = 'Office name';
  @Input() showMenu = true;
  @Input() showNotifications = true;
  @Input() showProfile = true;

  @Output() menuClicked = new EventEmitter<void>();
}
