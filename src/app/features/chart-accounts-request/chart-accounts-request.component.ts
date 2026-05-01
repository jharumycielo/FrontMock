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
import { SolicitudeFormCardComponent } from '../../shared/ui/solicitude-form-card/solicitude-form-card.component';
import { SolicitudeInfoCardComponent, SolicitudeInfoField } from '../../shared/ui/solicitude-info-card/solicitude-info-card.component';
import { SolicitudePageLayoutComponent } from '../../shared/ui/solicitude-page-layout/solicitude-page-layout.component';
import { TrayDocumentsViewComponent } from '../../shared/ui/tray-documents-view/tray-documents-view.component';
import { TrayMenuComponent } from '../../shared/ui/tray-menu/tray-menu.component';
import { UploadSidePanelComponent } from '../../shared/ui/upload-side-panel/upload-side-panel.component';

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
    SolicitudeFormCardComponent,
    SolicitudeInfoCardComponent,
    SolicitudePageLayoutComponent,
    TrayDocumentsViewComponent,
    TrayMenuComponent,
    UploadSidePanelComponent
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
          <siaf-solicitude-info-card [fields]="entityFields" />

          <siaf-solicitude-form-card title="Lista de cuentas contables">
            <ng-container card-actions>
              <siaf-button variant="accent" size="md" icon="add" [iconOnly]="true" ariaLabel="Crear registro de cuenta contable" />
            </ng-container>

            <div class="flex min-h-[49px] items-center rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-low)] px-siaf-md py-siaf-sm">
              <p class="m-0 text-sm leading-normal tracking-[0.0249px] text-[var(--sys-color-text-neutral-medium)]">Por favor, haga clic en el botón (+) para crear una cuenta contable.</p>
            </div>
          </siaf-solicitude-form-card>

          <siaf-solicitude-form-card title="Solicitud proveniente de entidad externa">
            <section class="grid gap-siaf-md">
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

              <div class="flex min-h-10 items-center justify-between gap-siaf-md">
                <h3 class="m-0 text-sm font-bold uppercase text-text">Buscar nombre de la entidad proveniente</h3>
                <siaf-button variant="accent" size="md" icon="search" [iconOnly]="true" ariaLabel="Buscar nombre de la entidad proveniente" [disabled]="externalOrigin() !== 'si'" />
              </div>

              <div class="flex min-h-[49px] items-center rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-low)] px-siaf-md py-siaf-sm">
                <p class="m-0 text-sm leading-normal tracking-[0.0249px] text-[var(--sys-color-text-neutral-medium)]">No se ha seleccionado ninguna Entidad. Haga clic en el botón para realizar una selección.</p>
              </div>
            </section>
          </siaf-solicitude-form-card>

          <siaf-solicitude-form-card title="Justificación del sustento">
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
                  <siaf-button variant="accent" size="md" icon="file_upload" [iconOnly]="true" ariaLabel="Subir documento de sustento" (click)="uploadPanelOpen.set(true)" />
                </div>

                @if (uploadedFile()) {
                  <div class="flex items-center gap-siaf-sm rounded-siaf-md border border-border bg-surface p-siaf-md">
                    <siaf-icon name="description" [size]="32" class="shrink-0 text-text-muted" />
                    <span class="min-w-0 flex-1 truncate text-sm font-bold text-text">{{ uploadedFile()!.name }}</span>
                    <span class="shrink-0 text-xs text-text-muted">{{ formatFileSize(uploadedFile()!.size) }}</span>
                    <button class="inline-flex size-6 items-center justify-center rounded-siaf-sm transition hover:bg-surface-muted" type="button" aria-label="Reemplazar archivo" (click)="uploadPanelOpen.set(true)">
                      <siaf-icon name="repeat" [size]="24" class="text-text-muted" />
                    </button>
                    <button class="inline-flex size-6 items-center justify-center rounded-siaf-sm transition hover:bg-surface-muted" type="button" aria-label="Quitar archivo" (click)="uploadedFile.set(null)">
                      <siaf-icon name="cancel" [size]="24" class="text-text-muted" />
                    </button>
                  </div>
                } @else {
                  <div class="flex min-h-[49px] items-center rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-low)] px-siaf-md py-siaf-sm">
                    <p class="m-0 text-sm leading-normal tracking-[0.0249px] text-[var(--sys-color-text-neutral-medium)]">No se han adjuntado archivos. Por favor, haga clic en el botón para subir un archivo.</p>
                  </div>
                }
              </div>
          </siaf-solicitude-form-card>
        </siaf-solicitude-page-layout>
      }

      <siaf-upload-side-panel
        [open]="uploadPanelOpen()"
        (closed)="uploadPanelOpen.set(false)"
        (confirmed)="onUploadConfirmed($event)"
      />

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
  readonly uploadPanelOpen = signal(false);
  readonly uploadedFile = signal<File | null>(null);

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Inicio', href: '/panel' },
    ...buildChartAccountsBreadcrumbs('Solicitud de Cuentas Contables')
  ];

  readonly entityFields: SolicitudeInfoField[] = [
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

  onUploadConfirmed(file: File): void {
    this.uploadedFile.set(file);
    this.uploadPanelOpen.set(false);
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1048576) return `${Math.round(bytes / 1024)}kb`;
    return `${(bytes / 1048576).toFixed(1)}MB`;
  }

  private isDesktopViewport(): boolean {
    return typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;
  }
}
