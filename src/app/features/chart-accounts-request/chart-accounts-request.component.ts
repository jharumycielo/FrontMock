import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Router } from '@angular/router';

import { BreadcrumbItem } from '../../shared/components/breadcrumb/breadcrumb.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { CreateDocumentAccepted, CreateDocumentComponent } from '../../shared/ui/create-document/create-document.component';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { MobileNavigationMenuComponent } from '../../shared/ui/mobile-navigation-menu/mobile-navigation-menu.component';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { findProcessPathById, ProcessMenuNode, ProcessMenuTreeComponent } from '../../shared/ui/process-menu-tree/process-menu-tree.component';
import { SidebarComponent, SidebarNavigation } from '../../layout/sidebar/sidebar.component';
import { SolicitudePageLayoutComponent } from '../../shared/ui/solicitude-page-layout/solicitude-page-layout.component';
import { TrayDocumentsViewComponent } from '../../shared/ui/tray-documents-view/tray-documents-view.component';
import { TrayMenuComponent } from '../../shared/ui/tray-menu/tray-menu.component';

type ReadonlyField = {
  label: string;
  value: string;
};

const CHART_ACCOUNTS_PROCESS_ID = 'plan-cuentas-contables';
const CHART_ACCOUNTS_PROCESS_ROUTE = '/procesos/plan-cuentas-contables';

const getChartAccountsPathHref = (nodeId: string): string => {
  if (nodeId === CHART_ACCOUNTS_PROCESS_ID) {
    return CHART_ACCOUNTS_PROCESS_ROUTE;
  }

  return '/panel';
};

const buildChartAccountsBreadcrumbs = (currentLabel: string): BreadcrumbItem[] => [
  ...findProcessPathById(CHART_ACCOUNTS_PROCESS_ID).map((node) => ({ label: node.label, href: getChartAccountsPathHref(node.id) })),
  { label: currentLabel }
];

@Component({
  selector: 'siaf-chart-accounts-request',
  standalone: true,
  imports: [
    ButtonComponent,
    CreateDocumentComponent,
    IconComponent,
    MobileNavigationMenuComponent,
    NavbarComponent,
    ProcessMenuTreeComponent,
    SidebarComponent,
    SolicitudePageLayoutComponent,
    TrayDocumentsViewComponent,
    TrayMenuComponent
  ],
  template: `
    <main class="min-h-screen bg-[var(--sys-color-bg-surfaces-surface-lowest)] text-text">
      <siaf-navbar class="sticky top-0 z-30 block" userName="Juan Doe Perez Perez" officeName="OFFICE NAME" (menuClicked)="onNavbarMenuClicked()" />

      <aside class="fixed bottom-0 left-0 top-14 z-20 hidden lg:block">
        <siaf-sidebar
          [navigation]="activeNavigation"
          [buttonHelp]="true"
          (created)="openSidebarCreateDocument()"
          (navigationChanged)="onSidebarNavigationChange($event)"
        />
      </aside>

      @if (mobileNavigationOpen) {
        <div class="fixed inset-x-0 bottom-0 top-14 z-20 lg:hidden">
          <siaf-mobile-navigation-menu
            [navigation]="activeNavigation"
            (created)="openSidebarCreateDocumentFromMobileMenu()"
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

      @if (sidebarCreateDocumentOpen) {
        <div class="fixed inset-x-0 bottom-0 top-14 z-20 lg:left-16 lg:right-auto" (click)="$event.stopPropagation()">
          <siaf-create-document (accepted)="onCreateDocumentAccepted($event)" (canceled)="closeFloatingPanels()" />
        </div>
      }

      @if (trayContentOpen) {
        <section class="min-w-0 transition-[padding] duration-200 lg:pl-16" [class.lg:pl-[364px]]="trayMenuOpen" [class.lg:pl-[434px]]="processMenuOpen || sidebarCreateDocumentOpen">
          <siaf-tray-documents-view [title]="selectedTrayItem" />
        </section>
      } @else {
        <siaf-solicitude-page-layout
          [breadcrumbs]="breadcrumbs"
          role="creator"
          state="new"
          heading="Solicitud de Cuentas Contables"
          secondaryText="Creación"
          [showReturn]="true"
          [saveDisabled]="true"
          [verifyDisabled]="true"
          [trayMenuOpen]="trayMenuOpen"
          [floatingPanelOpen]="processMenuOpen || sidebarCreateDocumentOpen"
          (returned)="goToDocuments()"
          (canceled)="goToDocuments()"
        >
          <section class="rounded-siaf-md bg-surface px-siaf-lg py-siaf-md">
            <div class="grid gap-siaf-xs">
              @for (field of entityFields; track field.label) {
                <div class="grid min-h-6 gap-siaf-xs md:grid-cols-[140px_1fr]">
                  <span class="truncate text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">{{ field.label }}</span>
                  <strong class="min-w-0 text-sm font-bold leading-6 text-text">{{ field.value }}</strong>
                </div>
              }
            </div>
          </section>

          <section class="rounded-siaf-md bg-surface">
            <header class="flex min-h-14 items-center justify-between gap-siaf-md px-siaf-lg pt-siaf-md">
              <h2 class="m-0 text-base font-bold uppercase tracking-[0.02px] text-text">Lista de cuentas contables</h2>
              <siaf-button variant="accent" size="md" icon="add" [iconOnly]="true" ariaLabel="Crear registro de cuenta contable" />
            </header>

            <div class="px-siaf-lg py-siaf-md">
              <div class="flex min-h-[49px] items-center rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-low)] px-siaf-md py-siaf-sm">
                <p class="m-0 text-sm leading-normal tracking-[0.0249px] text-[var(--sys-color-text-neutral-medium)]">Por favor, haga clic en el botón (+) para crear una cuenta contable.</p>
              </div>
            </div>
          </section>

          <section class="rounded-siaf-md bg-surface">
            <header class="flex min-h-14 items-center px-siaf-lg pt-siaf-md">
              <h2 class="m-0 text-base font-bold uppercase tracking-[0.02px] text-text">Solicitud proveniente de entidad externa</h2>
            </header>

            <div class="flex flex-col gap-siaf-md px-siaf-lg py-siaf-md">
              <div class="flex flex-wrap items-center gap-siaf-md">
                <h3 class="m-0 text-sm font-bold text-text">¿La solicitud proviene de una entidad externa?</h3>
                <label class="inline-flex h-10 items-center gap-siaf-xs text-sm text-text">
                  <input class="size-4 accent-brand-primary" type="radio" name="external-origin" [checked]="externalOrigin() === 'si'" (change)="externalOrigin.set('si')" />
                  Si
                </label>
                <label class="inline-flex h-10 items-center gap-siaf-xs text-sm text-text">
                  <input class="size-4 accent-brand-primary" type="radio" name="external-origin" [checked]="externalOrigin() === 'no'" (change)="externalOrigin.set('no')" />
                  No
                </label>
              </div>

              <section class="grid gap-siaf-md">
                <div class="flex min-h-10 items-center justify-between gap-siaf-md">
                  <h3 class="m-0 text-sm font-bold uppercase text-text">Buscar nombre de la entidad proveniente</h3>
                  <siaf-button variant="accent" size="md" icon="search" [iconOnly]="true" ariaLabel="Buscar nombre de la entidad proveniente" [disabled]="externalOrigin() !== 'si'" />
                </div>

                <div class="flex min-h-[49px] items-center rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-low)] px-siaf-md py-siaf-sm">
                  <p class="m-0 text-sm leading-normal tracking-[0.0249px] text-[var(--sys-color-text-neutral-medium)]">No se ha seleccionado ninguna Entidad. Haga clic en el botón para realizar una selección.</p>
                </div>
              </section>
            </div>
          </section>

          <section class="rounded-siaf-md bg-surface">
            <header class="flex min-h-14 items-center px-siaf-lg pt-siaf-md">
              <h2 class="m-0 text-base font-bold uppercase tracking-[0.02px] text-text">Justificación del sustento</h2>
            </header>

            <div class="flex flex-col gap-siaf-lg px-siaf-lg py-siaf-md">
              <label class="flex min-h-[76px] flex-col gap-siaf-xxs">
                <span class="sr-only">Justificación del requerimiento solicitado</span>
                <textarea
                  class="min-h-[60px] resize-none rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface px-siaf-md py-siaf-xs text-sm text-text outline-none transition placeholder:text-[var(--sys-color-text-neutral-low)] focus:border-2 focus:border-[var(--sys-color-border-states-focus)]"
                  maxlength="500"
                  placeholder="Justificación del requerimiento solicitado*"
                  [value]="justification()"
                  (input)="justification.set(inputValue($event))"
                ></textarea>
                <span class="self-end px-siaf-md text-xs text-text-muted">{{ justification().length }}/500</span>
              </label>

              <div class="flex flex-col gap-siaf-xs">
                <div class="flex min-h-10 items-center justify-between gap-siaf-md">
                  <h3 class="m-0 text-sm font-bold uppercase text-text">Documento de sustento</h3>
                  <siaf-button variant="accent" size="md" icon="file_upload" [iconOnly]="true" ariaLabel="Subir documento de sustento" />
                </div>

                <div class="flex min-h-[49px] items-center rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-low)] px-siaf-md py-siaf-sm">
                  <p class="m-0 text-sm leading-normal tracking-[0.0249px] text-[var(--sys-color-text-neutral-medium)]">No se han adjuntado archivos. Por favor, haga clic en el botón para subir un archivo.</p>
                </div>
              </div>
            </div>
          </section>
        </siaf-solicitude-page-layout>
      }
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartAccountsRequestComponent {
  activeNavigation: SidebarNavigation = 'Proceso';
  processMenuOpen = false;
  trayMenuOpen = false;
  trayContentOpen = false;
  mobileNavigationOpen = false;
  selectedTrayItem = 'Borradores';
  sidebarCreateDocumentOpen = false;
  readonly externalOrigin = signal<'si' | 'no' | ''>('');
  readonly justification = signal('');

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Inicio', href: '/panel' },
    ...buildChartAccountsBreadcrumbs('Solicitud de Cuentas Contables')
  ];

  readonly entityFields: ReadonlyField[] = [
    { label: 'Fecha', value: '19/08/2025    08:00:59' },
    { label: 'Órgano de línea', value: 'DIRECCIÓN GENERAL DE CONTABILIDAD PÚBLICA' },
    { label: 'Entidad', value: 'MINISTERIO DE ECONOMIA Y FINANZAS' }
  ];

  constructor(private readonly router: Router) {}

  goToDocuments(): void {
    void this.router.navigate([CHART_ACCOUNTS_PROCESS_ROUTE]);
  }

  openSidebarCreateDocument(): void {
    this.mobileNavigationOpen = false;
    this.processMenuOpen = false;
    this.trayMenuOpen = false;
    this.trayContentOpen = false;
    this.sidebarCreateDocumentOpen = true;
  }

  openSidebarCreateDocumentFromMobileMenu(): void {
    this.mobileNavigationOpen = false;
    this.openSidebarCreateDocument();
  }

  onCreateDocumentAccepted(selection: CreateDocumentAccepted): void {
    this.closeFloatingPanels();

    if (selection.route) {
      void this.router.navigate([selection.route]);
    }
  }

  onSidebarNavigationChange(navigation: SidebarNavigation): void {
    if (navigation === 'Panel') {
      this.activeNavigation = 'Panel';
      this.trayContentOpen = false;
      this.closeFloatingPanels();
      void this.router.navigate(['/panel']);
      return;
    }

    this.activeNavigation = navigation;
    this.sidebarCreateDocumentOpen = false;
    this.processMenuOpen = navigation === 'Proceso';
    this.trayMenuOpen = navigation === 'Bandeja';
  }

  onMobileNavigationChange(navigation: SidebarNavigation): void {
    this.mobileNavigationOpen = false;
    this.onSidebarNavigationChange(navigation);
  }

  onNavbarMenuClicked(): void {
    if (this.hasFloatingPanel) {
      this.closeFloatingPanels();
      return;
    }

    this.mobileNavigationOpen = !this.mobileNavigationOpen;
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

    if (node.id === CHART_ACCOUNTS_PROCESS_ID) {
      this.closeFloatingPanels();
      void this.router.navigate([CHART_ACCOUNTS_PROCESS_ROUTE]);
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
    this.sidebarCreateDocumentOpen = false;
  }

  get hasFloatingPanel(): boolean {
    return this.processMenuOpen || this.trayMenuOpen || this.sidebarCreateDocumentOpen;
  }

  inputValue(event: Event): string {
    return (event.target as HTMLTextAreaElement).value;
  }

  private isDesktopViewport(): boolean {
    return typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;
  }
}
