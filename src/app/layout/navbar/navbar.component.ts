import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Inject, Input, Output, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { IconComponent } from '../../shared/ui/icon/icon.component';

type ViewTransitionDocument = Document & {
  startViewTransition?: (updateCallback: () => void) => { ready: Promise<void> };
};

@Component({
  selector: 'siaf-navbar',
  standalone: true,
  imports: [IconComponent, RouterLink],
  template: `
    <header class="flex h-14 w-full items-center justify-between bg-brand-primary px-siaf-md py-siaf-xxs text-[var(--sys-color-text-brand-white)]">
      <div class="flex min-w-0 shrink-0 items-center gap-siaf-lg">
        @if (showMenu) {
          <button
            class="inline-flex size-8 items-center justify-center rounded-siaf-md transition hover:bg-[var(--sys-color-bg-states-on-brand-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-text-brand-white)]"
            type="button"
            aria-label="Abrir menu"
            (click)="menuClicked.emit()"
          >
            <siaf-icon name="menu" [size]="20" />
          </button>
        }

        <a class="flex h-10 items-center text-[var(--sys-color-text-brand-white)]" [routerLink]="homeHref" aria-label="SIAF-RP">
          <img class="h-10 w-[128px] object-contain" src="assets/figma/logos/siaf-rp-default-white.svg" alt="SIAF-RP" />
        </a>
      </div>

      <div class="flex min-w-0 items-center justify-end gap-siaf-md">
        <ng-content />

        @if (showNotifications) {
          <button
            class="inline-flex size-8 shrink-0 items-center justify-center rounded-siaf-md transition hover:bg-[var(--sys-color-bg-states-on-brand-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-text-brand-white)]"
            type="button"
            aria-label="Notificaciones"
          >
            <siaf-icon name="notifications" [size]="24" />
          </button>
        }

        @if (showProfile) {
          <div class="relative">
            <button
              class="flex min-w-0 items-center gap-siaf-sm rounded-siaf-md py-siaf-xxs pl-siaf-sm pr-siaf-xs text-left transition hover:bg-[var(--sys-color-bg-states-on-brand-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-text-brand-white)]"
              type="button"
              aria-label="Perfil de usuario"
              [attr.aria-expanded]="userMenuOpen()"
              aria-haspopup="menu"
              (click)="toggleUserMenu(); $event.stopPropagation()"
            >
              <span class="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-[var(--sys-color-border-states-white)] bg-[var(--ref-color-solid-primary-50)] text-base font-medium text-brand-primary">
                {{ initials }}
              </span>
              <span class="hidden min-w-0 flex-col gap-1 text-[var(--sys-color-text-brand-white)] md:flex">
                <strong class="truncate text-sm font-bold leading-none">{{ userName }}</strong>
                <span class="max-w-[200px] truncate text-xs uppercase leading-none">{{ officeName }}</span>
              </span>
              <siaf-icon class="hidden shrink-0 md:block" name="keyboard_arrow_down" [size]="24" />
            </button>

            @if (userMenuOpen()) {
              <div
                class="absolute right-0 top-[calc(100%+8px)] z-50 w-[220px] overflow-hidden rounded-siaf-md bg-surface py-siaf-xs text-[var(--sys-color-text-neutral-medium)] shadow-siaf-elevation-2"
                role="menu"
                aria-label="Opciones de usuario"
                (click)="$event.stopPropagation()"
              >
                <button class="flex min-h-12 w-full items-center gap-siaf-md px-siaf-md py-siaf-sm text-left text-sm transition hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-brand-primary" type="button" role="menuitem">
                  <siaf-icon class="shrink-0" name="perm_identity" [size]="24" />
                  <span class="min-w-0 flex-1 truncate">Perfil</span>
                </button>

                <button class="flex min-h-12 w-full items-center gap-siaf-md px-siaf-md py-siaf-sm text-left text-sm transition hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-brand-primary" type="button" role="menuitem" (click)="toggleTheme()">
                  <siaf-icon class="shrink-0" name="color_lens" [size]="24" />
                  <span class="min-w-0 flex-1 truncate">{{ themeLabel }}</span>
                  <siaf-icon class="shrink-0" name="arrow_right" [size]="24" />
                </button>

                <button class="flex min-h-12 w-full items-center gap-siaf-md px-siaf-md py-siaf-sm text-left text-sm transition hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-brand-primary" type="button" role="menuitem">
                  <siaf-icon class="shrink-0" name="settings" [size]="24" />
                  <span class="min-w-0 flex-1 truncate">Configuración</span>
                </button>

                <div class="h-px bg-[var(--sys-color-divider-default)]"></div>

                <button class="flex min-h-12 w-full items-center gap-siaf-md px-siaf-md py-siaf-sm text-left text-sm transition hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-brand-primary" type="button" role="menuitem" (click)="logout()">
                  <siaf-icon class="shrink-0" name="exit_to_app" [size]="24" />
                  <span class="min-w-0 flex-1 truncate">Cerrar sesión</span>
                </button>
              </div>
            }
          </div>
        }
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  private readonly themeStorageKey = 'siaf-theme';

  @Input() homeHref = '/panel';
  @Input() initials = 'JP';
  @Input() userName = 'Juan Doe Perez Perez';
  @Input() officeName = 'Office name';
  @Input() showMenu = true;
  @Input() showNotifications = true;
  @Input() showProfile = true;

  @Output() menuClicked = new EventEmitter<void>();

  readonly userMenuOpen = signal(false);
  readonly currentTheme = signal<'light' | 'dark'>('light');

  constructor(
    private readonly router: Router,
    private readonly elementRef: ElementRef<HTMLElement>,
    @Inject(DOCUMENT) private readonly document: Document
  ) {
    const storedTheme = this.readStoredTheme();
    this.currentTheme.set(storedTheme);
    this.applyTheme(storedTheme);
  }

  @HostListener('document:click', ['$event'])
  closeUserMenuFromOutside(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.userMenuOpen.set(false);
    }
  }

  toggleUserMenu(): void {
    this.userMenuOpen.update((open) => !open);
  }

  toggleTheme(): void {
    const nextTheme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.userMenuOpen.set(false);
    this.applyThemeWithTransition(nextTheme);
  }

  logout(): void {
    this.userMenuOpen.set(false);
    void this.router.navigate(['/login']);
  }

  get themeLabel(): string {
    return this.currentTheme() === 'light' ? 'Aspecto: Claro' : 'Aspecto: Oscuro';
  }

  private readStoredTheme(): 'light' | 'dark' {
    if (typeof localStorage === 'undefined') {
      return 'light';
    }

    return localStorage.getItem(this.themeStorageKey) === 'dark' ? 'dark' : 'light';
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    this.document.documentElement.setAttribute('data-theme', theme);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.themeStorageKey, theme);
    }
  }

  private applyThemeWithTransition(theme: 'light' | 'dark'): void {
    const transitionDocument = this.document as ViewTransitionDocument;

    if (!transitionDocument.startViewTransition || typeof this.document.documentElement.animate !== 'function') {
      this.currentTheme.set(theme);
      this.applyTheme(theme);
      return;
    }

    const transition = transitionDocument.startViewTransition(() => {
      this.currentTheme.set(theme);
      this.applyTheme(theme);
    });

    void transition.ready.then(() => {
      this.document.documentElement.animate(
        {
          clipPath: ['inset(0 0 100% 0)', 'inset(0)']
        },
        {
          duration: 600,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: '::view-transition-new(root)'
        }
      );
    });
  }
}
