import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';

import { CreateDocumentAccepted, CreateDocumentComponent } from '../../shared/ui/create-document/create-document.component';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { MobileNavigationMenuComponent } from '../../shared/ui/mobile-navigation-menu/mobile-navigation-menu.component';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { ProcessMenuNode, ProcessMenuTreeComponent } from '../../shared/ui/process-menu-tree/process-menu-tree.component';
import { SidebarComponent, SidebarNavigation } from '../../layout/sidebar/sidebar.component';
import { TrayDocumentsViewComponent } from '../../shared/ui/tray-documents-view/tray-documents-view.component';
import { TrayMenuComponent } from '../../shared/ui/tray-menu/tray-menu.component';

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
  imports: [CreateDocumentComponent, IconComponent, MobileNavigationMenuComponent, NavbarComponent, ProcessMenuTreeComponent, SidebarComponent, TrayDocumentsViewComponent, TrayMenuComponent],
  template: `
    <main class="min-h-screen bg-[var(--sys-color-bg-surfaces-surface)] text-text">
      <siaf-navbar class="sticky top-0 z-30 block" userName="Usuario rol creador" officeName="Entidad del estado" (menuClicked)="onNavbarMenuClicked()" />

      <aside class="fixed bottom-0 left-0 top-14 z-20 hidden lg:block">
        <siaf-sidebar
          [navigation]="activeNavigation"
          [buttonHelp]="true"
          (created)="openCreateDocument()"
          (navigationChanged)="onNavigationChange($event)"
        />
      </aside>

      @if (mobileNavigationOpen) {
        <div class="fixed inset-x-0 bottom-0 top-14 z-20 lg:hidden">
          <siaf-mobile-navigation-menu
            [navigation]="activeNavigation"
            (created)="openCreateDocumentFromMobileMenu()"
            (navigationChanged)="onMobileNavigationChange($event)"
          />
        </div>
      }

      @if (processMenuOpen) {
        <div class="fixed inset-x-0 bottom-0 top-14 z-20 lg:left-16 lg:right-auto" (click)="$event.stopPropagation()">
          <siaf-process-menu-tree (nodeSelected)="onProcessNodeSelected($event)" />
        </div>
      }

      @if (trayMenuOpen) {
        <div class="fixed inset-x-0 bottom-0 top-14 z-20 lg:left-16 lg:right-auto" (click)="$event.stopPropagation()">
          <siaf-tray-menu [selectedItem]="selectedTrayItem" (selected)="onTrayItemSelected($event)" />
        </div>
      }

      @if (createDocumentOpen) {
        <div class="fixed inset-x-0 bottom-0 top-14 z-20 lg:left-16 lg:right-auto" (click)="$event.stopPropagation()">
          <siaf-create-document (accepted)="onCreateDocumentAccepted($event)" (canceled)="closeFloatingPanels()" />
        </div>
      }

      @if (trayContentOpen) {
        <section class="min-w-0 transition-[padding] duration-200 lg:pl-16" [class.lg:pl-[364px]]="trayMenuOpen" [class.lg:pl-[434px]]="processMenuOpen || createDocumentOpen">
          <siaf-tray-documents-view [title]="selectedTrayItem" />
        </section>
      } @else {
      <section class="min-w-0 transition-[padding] duration-200 lg:pl-16" [class.lg:pl-[364px]]="trayMenuOpen" [class.lg:pl-[434px]]="processMenuOpen || createDocumentOpen">
        <header class="flex h-[56px] items-center bg-surface px-siaf-md">
          <h1 class="m-0 text-sm font-bold uppercase leading-normal text-text">Panel</h1>
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
                <p class="m-0 text-[30px] font-medium leading-normal tracking-[-0.63px] text-brand-secondary">Bandeja de Documentos</p>
                <strong class="block text-[54px] font-bold leading-none tracking-[-0.62px] text-brand-secondary">09</strong>
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
              <p class="m-0 text-[30px] font-medium leading-normal tracking-[-0.63px] text-brand-secondary">Procesos</p>
            </article>
          </div>

          <div class="mt-siaf-md grid gap-siaf-md xl:grid-cols-2">
            <div class="grid gap-siaf-md sm:grid-cols-2">
              @for (card of smallCards; track card.title) {
                <article class="flex min-h-[120px] items-center justify-between rounded-siaf-md bg-surface p-siaf-xl">
                  <div>
                    <p class="m-0 text-[22px] font-medium leading-normal tracking-[-0.19px] text-brand-secondary">{{ card.title }}</p>
                    <strong class="block text-[44px] font-bold leading-none tracking-[-0.62px] text-brand-secondary">{{ card.value }}</strong>
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
                  <p class="m-0 text-[30px] font-medium leading-normal tracking-[-0.63px] text-brand-secondary">{{ card.title }}</p>
                </article>
              }
            </div>
          </div>
        </section>
      </section>
      }
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VirtualDeskComponent {
  activeNavigation: SidebarNavigation = 'Panel';
  processMenuOpen = false;
  trayMenuOpen = false;
  trayContentOpen = false;
  mobileNavigationOpen = false;
  selectedTrayItem = 'Borradores';
  createDocumentOpen = false;

  constructor(private readonly router: Router) {}

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

  onNavigationChange(navigation: SidebarNavigation): void {
    if (navigation === 'Panel') {
      this.activeNavigation = 'Panel';
      this.trayContentOpen = false;
      this.closeFloatingPanels();
      void this.router.navigate(['/panel']);
      return;
    }

    this.activeNavigation = navigation;
    this.processMenuOpen = navigation === 'Proceso';
    this.trayMenuOpen = navigation === 'Bandeja';
    this.createDocumentOpen = false;
  }

  onMobileNavigationChange(navigation: SidebarNavigation): void {
    this.mobileNavigationOpen = false;
    this.onNavigationChange(navigation);
  }

  onNavbarMenuClicked(): void {
    if (this.hasFloatingPanel) {
      this.closeFloatingPanels();
      return;
    }

    this.mobileNavigationOpen = !this.mobileNavigationOpen;
  }

  openProcessMenu(): void {
    this.activeNavigation = 'Proceso';
    this.processMenuOpen = true;
    this.trayMenuOpen = false;
    this.trayContentOpen = false;
    this.createDocumentOpen = false;
  }

  openCreateDocument(): void {
    this.mobileNavigationOpen = false;
    this.processMenuOpen = false;
    this.trayMenuOpen = false;
    this.trayContentOpen = false;
    this.createDocumentOpen = true;
  }

  openCreateDocumentFromMobileMenu(): void {
    this.mobileNavigationOpen = false;
    this.openCreateDocument();
  }

  onCreateDocumentAccepted(selection: CreateDocumentAccepted): void {
    this.closeFloatingPanels();

    if (selection.route) {
      void this.router.navigate([selection.route]);
    }
  }

  onTrayItemSelected(item: string): void {
    this.selectedTrayItem = item;
    this.activeNavigation = 'Bandeja';
    this.trayMenuOpen = this.isDesktopViewport();
    this.trayContentOpen = true;
  }

  onProcessNodeSelected(node: ProcessMenuNode): void {
    if (node.id === 'registro-asiento-ajuste') {
      this.closeFloatingPanels();
      void this.router.navigate(['/procesos/registro-asiento-ajuste']);
      return;
    }

    if (!node.children?.length) {
      this.activeNavigation = 'Proceso';
    }
  }

  closeFloatingPanels(): void {
    this.mobileNavigationOpen = false;
    this.processMenuOpen = false;
    this.trayMenuOpen = false;
    this.createDocumentOpen = false;

    if (this.activeNavigation === 'Proceso') {
      this.activeNavigation = this.trayContentOpen ? 'Bandeja' : 'Panel';
      return;
    }

    if (this.activeNavigation === 'Bandeja' && !this.trayContentOpen) {
      this.activeNavigation = 'Panel';
    }
  }

  get hasFloatingPanel(): boolean {
    return this.processMenuOpen || this.trayMenuOpen || this.createDocumentOpen;
  }

  private isDesktopViewport(): boolean {
    return typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;
  }
}
