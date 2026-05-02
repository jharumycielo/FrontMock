import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { CHART_ACCOUNTS_DOCUMENTS_CONFIG } from '../../features/process-configs/chart-accounts-documents.config';
import { ADJUSTMENT_SEAT_DOCUMENTS_CONFIG } from '../../features/process-configs/adjustment-seat-documents.config';
import { CreateDocumentAccepted, CreateDocumentComponent } from '../../shared/ui/create-document/create-document.component';
import { MobileNavigationMenuComponent } from '../../shared/ui/mobile-navigation-menu/mobile-navigation-menu.component';
import { ProcessMenuNode, ProcessMenuTreeComponent } from '../../shared/ui/process-menu-tree/process-menu-tree.component';
import { TrayDocumentsViewComponent } from '../../shared/ui/tray-documents-view/tray-documents-view.component';
import { TrayMenuComponent } from '../../shared/ui/tray-menu/tray-menu.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent, SidebarNavigation } from '../sidebar/sidebar.component';
import { ShellNavigationService } from './shell-navigation.service';

@Component({
  selector: 'siaf-app-shell',
  standalone: true,
  imports: [
    CreateDocumentComponent,
    MobileNavigationMenuComponent,
    NavbarComponent,
    ProcessMenuTreeComponent,
    RouterOutlet,
    SidebarComponent,
    TrayDocumentsViewComponent,
    TrayMenuComponent
  ],
  template: `
    <main class="min-h-screen bg-[var(--sys-color-bg-surfaces-surface-lowest)] text-text">
      <siaf-navbar class="sticky top-0 z-30 block" userName="Usuario rol creador" officeName="ENTIDAD ESTADO" (menuClicked)="onNavbarMenuClicked()" />

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
          <siaf-create-document
            [processOptions]="createDocumentOptions"
            (accepted)="onCreateDocumentAccepted($event)"
            (canceled)="closeFloatingPanels()"
          />
        </div>
      }

      <section
        class="min-w-0 transition-[padding] duration-200 lg:pl-16"
        [class.lg:pl-[364px]]="trayMenuOpen"
        [class.lg:pl-[434px]]="processMenuOpen || createDocumentOpen"
      >
        @if (trayContentOpen) {
          <siaf-tray-documents-view [title]="selectedTrayItem" />
        } @else {
          <router-outlet />
        }
      </section>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppShellComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly shellNavigation = inject(ShellNavigationService);

  activeNavigation: SidebarNavigation = 'Panel';
  processMenuOpen = false;
  trayMenuOpen = false;
  trayContentOpen = false;
  mobileNavigationOpen = false;
  selectedTrayItem = 'Borradores';
  createDocumentOpen = false;

  readonly createDocumentOptions = [
    ...ADJUSTMENT_SEAT_DOCUMENTS_CONFIG.createDocumentOptions,
    ...CHART_ACCOUNTS_DOCUMENTS_CONFIG.createDocumentOptions
  ];

  constructor() {
    this.syncNavigationWithUrl(this.router.url);

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => {
        this.trayContentOpen = false;
        this.closeFloatingPanels();
        this.syncNavigationWithUrl(event.urlAfterRedirects);
      });

    this.shellNavigation.processMenuRequested$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.openProcessMenu());

    this.shellNavigation.createDocumentRequested$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.openCreateDocument());
  }

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

    if (node.id === 'plan-cuentas-contables') {
      this.closeFloatingPanels();
      void this.router.navigate(['/procesos/plan-cuentas-contables']);
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
  }

  get hasFloatingPanel(): boolean {
    return this.mobileNavigationOpen || this.processMenuOpen || this.trayMenuOpen || this.createDocumentOpen;
  }

  private syncNavigationWithUrl(url: string): void {
    this.activeNavigation = url.startsWith('/procesos') ? 'Proceso' : 'Panel';
  }

  private isDesktopViewport(): boolean {
    return typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;
  }
}
