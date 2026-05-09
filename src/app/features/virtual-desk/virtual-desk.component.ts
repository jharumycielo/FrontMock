import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ShellNavigationService } from '../../layout/shell/shell-navigation.service';
import { IconComponent } from '../../shared/ui/icon/icon.component';

type DeskCard = {
  title: string;
  value?: string;
  icon: string;
  iconClass: string;
  size: 'large' | 'small' | 'wide';
};

@Component({
  selector: 'siaf-virtual-desk',
  standalone: true,
  imports: [IconComponent],
  template: `
      <section class="min-w-0">
        <header class="flex h-[56px] items-center bg-surface px-siaf-md">
          <h1 class="m-0 text-sm font-bold uppercase leading-normal text-[var(--sys-color-text-brand-secondary)]">Panel</h1>
        </header>

        <section class="min-h-[calc(100vh-112px)] bg-[var(--sys-color-bg-surfaces-surface-lowest)] p-siaf-md">
          <div class="grid gap-siaf-md xl:grid-cols-2">
            <article
              class="flex min-h-[204px] items-center gap-siaf-lg rounded-siaf-md bg-surface px-siaf-xl py-12"
              aria-label="Bandeja de Documentos"
            >
              <span class="inline-flex size-[74px] shrink-0 items-center justify-center rounded-[12px] border border-[var(--sys-color-divider-default,rgba(32,32,32,0.12))] text-[var(--sys-color-text-brand-accent)] sm:size-[98px]">
                <siaf-icon name="inbox" [size]="64" />
              </span>
              <div class="min-w-0">
                <p class="m-0 text-[30px] font-medium leading-normal tracking-[-0.63px] text-[var(--sys-color-text-brand-secondary)]">Bandeja de Documentos</p>
                <strong class="block text-[54px] font-bold leading-none tracking-[-0.62px] text-[var(--sys-color-text-brand-secondary)]">09</strong>
              </div>
            </article>

            <article
              class="flex min-h-[204px] cursor-pointer items-center gap-siaf-lg rounded-siaf-md bg-surface px-siaf-xl py-12 transition hover:bg-[rgba(1,72,153,0.04)] active:bg-[rgba(1,72,153,0.08)]"
              aria-label="Procesos"
              role="button"
              tabindex="0"
              (click)="openProcessMenu()"
              (keydown.enter)="openProcessMenu()"
              (keydown.space)="openProcessMenu()"
            >
              <span class="inline-flex size-[74px] shrink-0 items-center justify-center rounded-[12px] border border-[var(--sys-color-divider-default,rgba(32,32,32,0.12))] text-[var(--sys-color-text-brand-primary)] sm:size-[98px]">
                <siaf-icon name="picture_in_picture" [size]="64" />
              </span>
              <p class="m-0 text-[30px] font-medium leading-normal tracking-[-0.63px] text-[var(--sys-color-text-brand-secondary)]">Procesos</p>
            </article>
          </div>

          <div class="mt-siaf-md grid gap-siaf-md xl:grid-cols-2">
            <div class="grid gap-siaf-md sm:grid-cols-2">
              @for (card of smallCards; track card.title) {
                <article class="flex min-h-[120px] items-center justify-between rounded-siaf-md bg-surface p-siaf-xl">
                  <div>
                    <p class="m-0 text-[22px] font-medium leading-normal tracking-[-0.19px] text-[var(--sys-color-text-brand-secondary)]">{{ card.title }}</p>
                    <strong class="block text-[44px] font-bold leading-none tracking-[-0.62px] text-[var(--sys-color-text-brand-secondary)]">{{ card.value }}</strong>
                  </div>
                  <span class="inline-flex size-[74px] shrink-0 items-center justify-center text-[var(--card-color)]" [style.--card-color]="card.iconClass">
                    <siaf-icon [name]="card.icon" [size]="58" />
                  </span>
                </article>
              }
            </div>

            <div class="grid gap-siaf-md">
              @for (card of wideCards; track card.title) {
                <article class="flex min-h-[120px] items-center gap-[25px] rounded-[12px] bg-surface px-[31px] py-siaf-xl">
                  <span class="inline-flex size-[74px] shrink-0 items-center justify-center rounded-[12px] border border-[var(--sys-color-divider-default,rgba(32,32,32,0.12))]" [style.color]="card.iconClass">
                    <siaf-icon [name]="card.icon" [size]="58" />
                  </span>
                  <p class="m-0 text-[30px] font-medium leading-normal tracking-[-0.63px] text-[var(--sys-color-text-brand-secondary)]">{{ card.title }}</p>
                </article>
              }
            </div>
          </div>
        </section>
      </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VirtualDeskComponent {
  private readonly shellNavigation = inject(ShellNavigationService);

  readonly smallCards: DeskCard[] = [
    { title: 'Recibidos', value: '03', icon: 'description', iconClass: 'var(--sys-color-text-feedback-success)', size: 'small' },
    { title: 'Enviados', value: '02', icon: 'send', iconClass: 'var(--sys-color-text-brand-accent)', size: 'small' },
    { title: 'Borradores', value: '02', icon: 'edit_note', iconClass: 'var(--sys-color-text-feedback-warning)', size: 'small' },
    { title: 'Notificaciones', value: '02', icon: 'notifications', iconClass: 'var(--sys-color-text-feedback-default)', size: 'small' }
  ];

  readonly wideCards: DeskCard[] = [
    { title: 'Consulta y Reportes', icon: 'content_paste_search', iconClass: 'var(--sys-color-text-feedback-success)', size: 'wide' },
    { title: 'Crear documento', icon: 'add', iconClass: 'var(--sys-color-text-brand-accent)', size: 'wide' }
  ];

  openProcessMenu(): void {
    this.shellNavigation.openProcessMenu();
  }
}
