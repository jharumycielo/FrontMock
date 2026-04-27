import { ChangeDetectionStrategy, Component, forwardRef, Input } from '@angular/core';
import { Router } from '@angular/router';

import { BreadcrumbComponent, BreadcrumbItem } from '../../shared/components/breadcrumb/breadcrumb.component';
import { CreateDocumentComponent } from '../../shared/ui/create-document/create-document.component';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { MobileNavigationMenuComponent } from '../../shared/ui/mobile-navigation-menu/mobile-navigation-menu.component';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { ProcessMenuNode, ProcessMenuTreeComponent } from '../../shared/ui/process-menu-tree/process-menu-tree.component';
import { SidebarComponent, SidebarNavigation } from '../../layout/sidebar/sidebar.component';
import { SolicitudeHeaderComponent } from '../../shared/ui/solicitude-header/solicitude-header.component';
import { TrayDocumentsViewComponent } from '../../shared/ui/tray-documents-view/tray-documents-view.component';
import { TrayMenuComponent } from '../../shared/ui/tray-menu/tray-menu.component';

type ReadonlyField = {
  label: string;
  value: string;
};

type AccountingRow = {
  code: string;
  account: string;
  movement: string;
  amount: string;
};

@Component({
  selector: 'siaf-adjustment-seat-form',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    CreateDocumentComponent,
    IconComponent,
    MobileNavigationMenuComponent,
    NavbarComponent,
    PaginationComponent,
    ProcessMenuTreeComponent,
    forwardRef(() => ReadonlyCardComponent),
    forwardRef(() => ReadonlyLineComponent),
    SidebarComponent,
    SolicitudeHeaderComponent,
    TrayDocumentsViewComponent,
    TrayMenuComponent
  ],
  template: `
    <main class="min-h-screen bg-[var(--sys-color-bg-surfaces-surface-lowest)] text-text">
      <siaf-navbar class="sticky top-0 z-30 block" (menuClicked)="onNavbarMenuClicked()" />

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
          <siaf-create-document (accepted)="closeFloatingPanels()" (canceled)="closeFloatingPanels()" />
        </div>
      }

      @if (trayContentOpen) {
        <section class="min-w-0 transition-[padding] duration-200 lg:pl-16" [class.lg:pl-[364px]]="trayMenuOpen" [class.lg:pl-[434px]]="processMenuOpen || sidebarCreateDocumentOpen">
          <siaf-tray-documents-view [title]="selectedTrayItem" />
        </section>
      } @else {
      <section class="min-w-0 transition-[padding] duration-200 lg:pl-16" [class.lg:pl-[364px]]="trayMenuOpen" [class.lg:pl-[434px]]="processMenuOpen || sidebarCreateDocumentOpen">
        <div class="flex min-w-0 flex-col">
          <section class="bg-surface">
            <siaf-breadcrumb class="block" [items]="breadcrumbs" />
            <siaf-solicitude-header
              type="actions"
              heading="Solicitud de registro de asiento de ajuste"
              secondaryText="Creación"
              [showReturn]="true"
            />
          </section>

          <section class="flex flex-col gap-siaf-md p-siaf-md sm:p-siaf-lg">
            <div class="flex flex-col gap-siaf-md xl:flex-row">
              <section class="flex min-w-0 flex-1 flex-col gap-siaf-xs rounded-siaf-md bg-surface px-siaf-lg py-siaf-md">
                @for (field of entityFields; track field.label) {
                  <div class="flex min-w-0 flex-col gap-siaf-xxs sm:flex-row sm:gap-siaf-md">
                    <span class="w-[140px] shrink-0 truncate text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">
                      {{ field.label }}
                    </span>
                    <strong class="min-w-0 flex-1 text-sm font-bold leading-6 text-text">
                      {{ field.value }}
                    </strong>
                  </div>
                }
              </section>

              <section class="flex w-full flex-col gap-siaf-xs rounded-siaf-md bg-surface px-siaf-lg py-siaf-md xl:w-[360px]">
                @for (field of documentFields; track field.label) {
                  <div class="flex min-w-0 flex-col gap-siaf-xxs sm:flex-row sm:gap-siaf-md xl:flex-row">
                    <span class="w-[140px] shrink-0 truncate text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">
                      {{ field.label }}
                    </span>

                    @if (field.label === 'Estado') {
                      <span class="inline-flex h-6 w-fit items-center rounded-siaf-sm bg-[#298079] px-siaf-xs text-xs text-white">
                        {{ field.value }}
                      </span>
                    } @else {
                      <strong class="min-w-0 flex-1 text-sm font-bold leading-6 text-text">
                        {{ field.value }}
                      </strong>
                    }
                  </div>
                }
              </section>
            </div>

            <section class="rounded-siaf-md bg-surface">
              <header class="flex min-h-14 items-center px-siaf-lg pt-siaf-md">
                <h2 class="text-base font-bold uppercase tracking-[0.02px] text-text">Registro de asiento de ajuste</h2>
              </header>

              <div class="flex flex-col gap-siaf-lg px-siaf-lg py-siaf-md">
                <section class="flex flex-col gap-siaf-lg">
                  <h3 class="text-sm font-bold uppercase text-text">Ambito institucional</h3>
                  <article class="relative rounded-siaf-md border border-border px-siaf-xl py-siaf-xs">
                    <span class="absolute left-[-1px] top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-siaf-sm bg-brand-primary"></span>
                    <div class="flex min-h-11 flex-col justify-center gap-siaf-xxs">
                      <span class="text-[11px] font-bold uppercase tracking-[0.66px] text-text-muted">Ambito institucional</span>
                      <strong class="text-sm font-bold">ID - Nombre del ambito</strong>
                    </div>
                  </article>
                </section>

                <section class="flex flex-col gap-siaf-lg">
                  <h3 class="text-sm font-bold uppercase text-text">Periodo</h3>
                  <article class="relative rounded-siaf-md border border-border px-siaf-xl py-siaf-xs">
                    <span class="absolute left-[-1px] top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-siaf-sm bg-brand-primary"></span>
                    <div class="grid min-h-11 gap-siaf-md sm:grid-cols-2 lg:grid-cols-4">
                      @for (field of periodFields; track field.label) {
                        <div class="flex flex-col justify-center gap-siaf-xxs">
                          <span class="truncate text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">{{ field.label }}</span>
                          <strong class="text-sm font-bold">{{ field.value }}</strong>
                        </div>
                      }
                    </div>
                  </article>
                </section>

                <section class="grid gap-siaf-lg">
                  <readonly-line label="Fecha de contabilizacion" caption="Fecha *" value="19/08/2026" />
                  <readonly-card label="Buscar codigo de clase de ajuste" caption="Codigo de clase de ajuste" value="1. - Provisiones" />
                  <readonly-card label="Buscar codigo de detalle de ajuste" caption="Detalle de ajuste" value="1.1. - Provision de cuentas por cobrar" />
                  <readonly-line label="Glosa" caption="Glosa *" value="Glosa que nosotros ingresamos el texto" />
                </section>

                <details class="group overflow-hidden rounded-siaf-sm border border-[rgba(32,32,32,0.24)] bg-surface" open>
                  <summary class="flex min-h-14 w-full cursor-pointer list-none items-center gap-siaf-xs px-siaf-md py-siaf-xs text-left">
                    <span class="inline-flex size-10 shrink-0 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted">
                      <siaf-icon class="transition group-open:rotate-180" name="expand_more" [size]="24" />
                    </span>
                    <span class="flex min-h-10 min-w-0 flex-1 items-center text-sm font-medium uppercase text-text">
                      Codigo de asiento:
                      <strong class="ml-siaf-xxs font-bold normal-case">AA0015</strong>
                    </span>
                  </summary>

                  <div class="flex flex-col gap-siaf-md border-t border-[rgba(32,32,32,0.24)] p-siaf-lg">
                    <div class="flex min-h-10 items-center">
                      <h3 class="text-sm font-bold uppercase text-text">Cuentas contables</h3>
                    </div>

                    <div class="flex flex-col gap-siaf-md md:flex-row md:items-center">
                      <label class="flex h-10 min-w-0 flex-1 items-center rounded-siaf-md border border-border bg-surface px-siaf-md">
                        <input class="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-text-muted" placeholder="Buscar" />
                      </label>

                      <div class="flex shrink-0 items-center justify-end gap-siaf-xs">
                        <button class="inline-flex size-10 items-center justify-center rounded-siaf-md hover:bg-surface-muted" type="button" aria-label="Filtrar">
                          <siaf-icon name="filter_list" [size]="24" />
                        </button>
                        <button class="inline-flex size-10 items-center justify-center rounded-siaf-md hover:bg-surface-muted" type="button" aria-label="Mas opciones">
                          <siaf-icon name="more_vert" [size]="24" />
                        </button>
                      </div>
                    </div>

                    <div class="flex justify-end">
                      <siaf-pagination
                        navigation="Activate"
                        position="Top"
                        [page]="page"
                        [pageSize]="rowsPerPage"
                        [totalItems]="totalItems"
                        [totalPages]="totalPages"
                      />
                    </div>

                    <div class="overflow-x-auto">
                      <table class="min-w-[760px] w-full border-collapse text-sm">
                        <thead class="bg-[#dddddd] text-xs font-bold uppercase text-text">
                          <tr>
                            <th class="w-[190px] px-siaf-md py-siaf-sm text-left">Cod. cuentas contables</th>
                            <th class="px-siaf-md py-siaf-sm text-left">Nombre de la cuenta contable</th>
                            <th class="w-[180px] px-siaf-md py-siaf-sm text-left">Tipo de movimiento</th>
                            <th class="w-[130px] px-siaf-md py-siaf-sm text-right">Importe</th>
                          </tr>
                        </thead>
                        <tbody>
                          @for (row of rows; track row.code) {
                            <tr class="border-b border-divider">
                              <td class="px-siaf-md py-siaf-sm">{{ row.code }}</td>
                              <td class="px-siaf-md py-siaf-sm">{{ row.account }}</td>
                              <td class="px-siaf-md py-siaf-sm">{{ row.movement }}</td>
                              <td class="px-siaf-md py-siaf-sm text-right">{{ row.amount }}</td>
                            </tr>
                          }
                          <tr class="border-b border-divider">
                            <td class="px-siaf-md py-siaf-sm" colspan="2"></td>
                            <td class="px-siaf-md py-siaf-sm">Total Debe</td>
                            <td class="px-siaf-md py-siaf-sm text-right">50,000</td>
                          </tr>
                          <tr class="border-b border-divider">
                            <td class="px-siaf-md py-siaf-sm" colspan="2"></td>
                            <td class="px-siaf-md py-siaf-sm">Total Haber</td>
                            <td class="px-siaf-md py-siaf-sm text-right">50,000</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div class="flex flex-col gap-siaf-md lg:flex-row lg:items-center lg:justify-between">
                      <siaf-pagination
                        navigation="Activate"
                        position="Bottom"
                        [rowPage]="true"
                        [page]="page"
                        [pageSize]="rowsPerPage"
                        [totalItems]="totalItems"
                        [totalPages]="totalPages"
                        [rowsPerPage]="rowsPerPage"
                        [rowsPerPageOptions]="rowsPerPageOptions"
                        (rowsPerPageChange)="onRowsPerPageChange($event)"
                      />
                    </div>
                  </div>
                </details>
              </div>
            </section>

            <section class="rounded-siaf-md bg-surface">
              <header class="flex min-h-14 items-center px-siaf-lg pt-siaf-md">
                <h2 class="text-base font-bold uppercase tracking-[0.02px] text-text">Justificacion del sustento</h2>
              </header>

              <div class="flex flex-col gap-siaf-lg px-siaf-lg py-siaf-md">
                <readonly-line
                  label=""
                  caption="Justificacion del requerimiento solicitado *"
                  value="Registro del asiento de ajuste para las cuentas contables"
                />

                <div class="flex flex-col gap-siaf-xs">
                  <h3 class="min-h-10 text-sm font-bold uppercase leading-10 text-text">Documento de sustento</h3>
                  <div class="flex items-center gap-siaf-sm rounded-siaf-md border border-border bg-surface p-siaf-md">
                    <img class="size-8 shrink-0" src="assets/figma/modal-annulment/xls-file.svg" alt="" />
                    <div class="min-w-0 flex-1">
                      <p class="truncate text-sm font-bold text-text">DocEntregable001.pdf</p>
                      <p class="text-xs text-text-muted">500kb</p>
                    </div>
                    <button class="inline-flex size-8 shrink-0 items-center justify-center rounded-siaf-md hover:bg-surface-muted" type="button" aria-label="Descargar documento">
                      <siaf-icon name="file_download" [size]="24" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section class="rounded-siaf-md bg-surface px-siaf-lg py-siaf-md">
              <div class="grid gap-siaf-lg md:grid-cols-3">
                @for (item of actionTracker; track item.label) {
                  <div class="flex min-w-0 flex-col gap-siaf-xs">
                    <span class="text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">{{ item.label }}</span>
                    <strong class="truncate text-sm font-bold text-text">{{ item.user }}</strong>
                    <span class="text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">Fecha</span>
                    <strong class="text-sm font-bold text-text">{{ item.date }} <span class="ml-siaf-md">{{ item.time }}</span></strong>
                  </div>
                }
              </div>
            </section>
          </section>
        </div>
      </section>
      }
    </main>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdjustmentSeatFormComponent {
  activeNavigation: SidebarNavigation = 'Proceso';
  processMenuOpen = false;
  trayMenuOpen = false;
  trayContentOpen = false;
  mobileNavigationOpen = false;
  selectedTrayItem = 'Borradores';
  sidebarCreateDocumentOpen = false;

  constructor(private readonly router: Router) {}

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Inicio', href: '#' },
    { label: 'Proceso de registro', href: '#' },
    { label: 'Asiento de ajuste' }
  ];

  readonly entityFields: ReadonlyField[] = [
    { label: 'Fecha', value: '19/08/2025     08:00:59' },
    { label: 'Ente rector', value: 'DIRECCION GENERAL DE CONTABILIDAD PUBLICA' },
    { label: 'Entidad/ U.E/ ...', value: 'NOMBRE DE LA ENTIDAD/ U.E/ ...' }
  ];

  readonly documentFields: ReadonlyField[] = [
    { label: 'N documento', value: '0001' },
    { label: 'N doc. contable', value: 'AA-093-2026-01' },
    { label: 'Estado', value: 'Aprobado' }
  ];

  readonly periodFields: ReadonlyField[] = [
    { label: 'Periodo', value: '2026 - 01' },
    { label: 'Fecha de inicio', value: '01/01/2026' },
    { label: 'Fecha fin', value: '31/01/2026' },
    { label: 'Fecha vigencia adicional', value: '10/02/2026' }
  ];

  readonly rows: AccountingRow[] = [
    {
      code: '5.8.0.1.0.5',
      account: 'Estimaciones de cobranza dudosa - cuentas por cobrar',
      movement: 'Debe',
      amount: '50,000'
    },
    {
      code: '1.1.3.1.1.1',
      account: 'Venta de bienes por cobrar',
      movement: 'Haber',
      amount: '50,000'
    }
  ];

  readonly actionTracker = [
    {
      label: 'Elaborado por',
      user: 'RICARDO JOHN DOE BUSTAMANTE',
      date: '19/08/2025',
      time: '08:00:59'
    },
    {
      label: 'Verificado por',
      user: 'RICARDO JOHN DOE BUSTAMANTE',
      date: '19/08/2025',
      time: '08:00:59'
    },
    {
      label: 'Aprobado por',
      user: 'RICARDO JOHN DOE BUSTAMANTE',
      date: '19/08/2025',
      time: '08:00:59'
    }
  ];

  readonly rowsPerPageOptions = [10, 25, 50, 100];
  rowsPerPage = 10;
  page = 1;
  totalItems = 800;

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.rowsPerPage);
  }

  onRowsPerPageChange(value: number): void {
    this.rowsPerPage = value;
    this.page = 1;
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

  private isDesktopViewport(): boolean {
    return typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;
  }
}

@Component({
  selector: 'readonly-card',
  standalone: true,
  template: `
    <section class="flex flex-col gap-siaf-lg">
      <h3 class="text-sm font-bold uppercase text-text">{{ label }}</h3>
      <article class="relative rounded-siaf-md border border-border px-siaf-xl py-siaf-xs">
        <span class="absolute left-[-1px] top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-siaf-sm bg-brand-primary"></span>
        <div class="flex min-h-11 flex-col justify-center gap-siaf-xxs">
          <span class="text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">{{ caption }}</span>
          <strong class="text-sm font-bold text-text">{{ value }}</strong>
        </div>
      </article>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReadonlyCardComponent {
  @Input()
  label = '';

  @Input()
  caption = '';

  @Input()
  value = '';
}

@Component({
  selector: 'readonly-line',
  standalone: true,
  template: `
    <section class="flex flex-col gap-siaf-xs">
      @if (label) {
        <h3 class="text-sm font-bold uppercase text-text">{{ label }}</h3>
      }
      <div class="px-siaf-md py-siaf-xs">
        <span class="text-xs font-medium text-text-muted">{{ caption }}</span>
        <p class="mt-siaf-xxs text-sm text-text">{{ value }}</p>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReadonlyLineComponent {
  @Input()
  label = '';

  @Input()
  caption = '';

  @Input()
  value = '';
}
