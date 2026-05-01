import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { BreadcrumbComponent, BreadcrumbItem } from '../../shared/components/breadcrumb/breadcrumb.component';
import { CustomFilterApplyEvent, CustomFilterComponent, FilterRow } from '../../shared/components/custom-filter/custom-filter.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { CreateDocumentAccepted, CreateDocumentComponent, CreateDocumentField, CreateDocumentProcessOption, CreateDocumentSelection } from '../../shared/ui/create-document/create-document.component';
import { DocumentHistoryPanelComponent, DocumentHistorySummary } from '../../shared/ui/document-history-panel/document-history-panel.component';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { MobileNavigationMenuComponent } from '../../shared/ui/mobile-navigation-menu/mobile-navigation-menu.component';
import { ModalComponent } from '../../shared/ui/modal/modal.component';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { findProcessPathById, ProcessMenuNode, ProcessMenuTreeComponent } from '../../shared/ui/process-menu-tree/process-menu-tree.component';
import { SidebarComponent, SidebarNavigation } from '../../layout/sidebar/sidebar.component';
import { SnackbarComponent } from '../../shared/ui/snackbar/snackbar.component';
import { TrayDocumentsViewComponent } from '../../shared/ui/tray-documents-view/tray-documents-view.component';
import { TrayMenuComponent } from '../../shared/ui/tray-menu/tray-menu.component';

type ActiveTab = 'documents' | 'records';

type DocumentRow = {
  selected?: boolean;
  document: string;
  number: string;
  actionType: string;
  status: 'Elaborado' | 'Verificado';
  system: string;
  date: string;
  entity: string;
  creator?: string;
  subject?: string;
  catId?: string;
  entityCode?: string;
  requesterArea?: string;
  fileNumber?: string;
  evaluationDate?: string;
  evaluationUser?: string;
  approvalDate?: string;
  approvalUser?: string;
  subdocumentCount?: string;
  accountingStatus?: string;
  accountingDate?: string;
};

const ADJUSTMENT_SEAT_PROCESS_ID = 'registro-asiento-ajuste';
const ADJUSTMENT_SEAT_PROCESS_ROUTE = '/procesos/registro-asiento-ajuste';
const ADJUSTMENT_SEAT_REQUEST_ROUTE = '/procesos/registro-asiento-ajuste/solicitud';
const ADJUSTMENT_SEAT_REQUEST_LABEL = 'Solicitud de registro de asiento de ajuste';
const ADJUSTMENT_SEAT_ACTION_TYPES = ['Creación', 'Reversión'];
const ADJUSTMENT_SEAT_CREATE_DOCUMENT_OPTIONS: CreateDocumentProcessOption[] = [
  {
    id: ADJUSTMENT_SEAT_PROCESS_ID,
    label: 'Proceso de registro de asiento de ajuste',
    route: ADJUSTMENT_SEAT_REQUEST_ROUTE,
    documents: [ADJUSTMENT_SEAT_REQUEST_LABEL],
    actionTypes: ADJUSTMENT_SEAT_ACTION_TYPES
  }
];

const getAdjustmentSeatPathHref = (nodeId: string): string => {
  if (nodeId === ADJUSTMENT_SEAT_PROCESS_ID) {
    return ADJUSTMENT_SEAT_PROCESS_ROUTE;
  }

  return '/panel';
};

const buildAdjustmentSeatBreadcrumbs = (currentLabel: string): BreadcrumbItem[] => [
  ...findProcessPathById(ADJUSTMENT_SEAT_PROCESS_ID).map((node) => ({ label: node.label, href: getAdjustmentSeatPathHref(node.id) })),
  { label: currentLabel }
];

type RecordRow = {
  selected?: boolean;
  status: 'Activo';
  accountingDocument: string;
  institutionalScope: string;
  adjustmentClassCode: string;
  adjustmentDetailCode: string;
  totalDebit: string;
  totalCredit: string;
};

type AppliedCustomFilter = {
  id: string;
  campo: keyof DocumentRow;
  campoLabel: string;
  condicion: string;
  valor: string;
};

type ColumnOption = {
  key: string;
  label: string;
  visibility: 'visible' | 'hidden' | 'internal';
  group: 'default' | 'more' | 'internal';
};

@Component({
  selector: 'siaf-adjustment-seat-documents',
  standalone: true,
  imports: [BreadcrumbComponent, ButtonComponent, CreateDocumentComponent, CustomFilterComponent, DocumentHistoryPanelComponent, IconComponent, MobileNavigationMenuComponent, ModalComponent, NavbarComponent, PaginationComponent, ProcessMenuTreeComponent, RouterLink, SidebarComponent, SnackbarComponent, TrayDocumentsViewComponent, TrayMenuComponent],
  template: `
    <main class="min-h-screen bg-[var(--sys-color-bg-surfaces-surface-lowest)] text-text">
      <siaf-navbar class="sticky top-0 z-30 block" userName="Usuario rol creador" officeName="ENTIDAD ESTADO" (menuClicked)="onNavbarMenuClicked()" />

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
          <siaf-create-document [processOptions]="createDocumentProcessOptions" (accepted)="onCreateDocumentAccepted($event)" (canceled)="closeFloatingPanels()" />
        </div>
      }

      <siaf-document-history-panel
        [open]="documentHistoryOpen"
        [summary]="selectedHistorySummary"
        (closed)="closeDocumentHistory()"
      />

      <siaf-modal
        [open]="verifyModalOpen"
        variant="custom"
        title="¿Deseas aprobar múltiples solicitudes?"
        [description]="verifyModalDescription"
        illustrationSrc="assets/figma/modals/approve-multiple.svg"
        confirmVariant="primary"
        confirmLabel="Aceptar"
        [showIllustration]="true"
        (canceled)="closeVerifyModal()"
        (closed)="closeVerifyModal()"
        (confirmed)="confirmVerifyModal()"
      />

      <div class="fixed bottom-siaf-lg left-1/2 z-50 w-[min(430px,calc(100vw-32px))] -translate-x-1/2">
        <siaf-snackbar [open]="approvalSnackbarOpen" (closed)="closeApprovalSnackbar()">
          <span>Las solicitudes de tipo creaci&oacute;n n&uacute;mero </span>
          <strong class="font-bold">{{ approvalSnackbarNumbers }}</strong>
          <span> se han </span>
          <strong class="font-bold">aprobado</strong>
          <span> con &eacute;xito.</span>
        </siaf-snackbar>
      </div>

      @if (trayContentOpen) {
        <section class="min-w-0 transition-[padding] duration-200 lg:pl-16" [class.lg:pl-[364px]]="trayMenuOpen" [class.lg:pl-[434px]]="processMenuOpen || sidebarCreateDocumentOpen">
          <siaf-tray-documents-view [title]="selectedTrayItem" />
        </section>
      } @else {
      <section class="min-w-0 transition-[padding] duration-200 lg:pl-16" [class.lg:pl-[364px]]="trayMenuOpen" [class.lg:pl-[434px]]="processMenuOpen || sidebarCreateDocumentOpen">
        <section class="bg-surface">
          <siaf-breadcrumb class="block" [items]="breadcrumbs" />

          <header class="flex min-h-[72px] flex-col gap-siaf-sm px-siaf-md pb-siaf-xs pt-siaf-sm md:flex-row md:items-start md:justify-between">
            <div class="min-w-0">
              <h1 class="m-0 text-sm font-bold uppercase leading-normal text-text">Proceso de registro de asiento de ajuste</h1>
              <p class="m-0 text-[10px] font-medium uppercase leading-normal tracking-[0.66px] text-text-muted">Documentos y registros</p>
            </div>

            <div class="relative shrink-0">
              <siaf-button variant="accent" icon="add" (click)="toggleCreateDocumentPopover()">Crear documento</siaf-button>

              @if (createDocumentPopoverOpen) {
                <button class="fixed inset-0 z-20 cursor-default bg-transparent" type="button" aria-label="Cerrar crear documento" (click)="closeCreateDocumentPopover()"></button>
                <div class="absolute right-0 top-12 z-30 w-[min(360px,calc(100vw-32px))]" (click)="$event.stopPropagation()">
                  <siaf-create-document
                    variant="dropdown"
                    [processOptions]="createDocumentProcessOptions"
                    [fields]="createDocumentFields"
                    [acceptDisabled]="createDocumentAcceptDisabled"
                    (fieldValueChange)="onCreateDocumentFieldChange($event)"
                    (canceled)="closeCreateDocumentPopover()"
                    (accepted)="onCreateDocumentAccepted($event)"
                  />
                </div>
              }
            </div>
          </header>

          <nav class="flex h-10 items-end gap-siaf-md border-b border-[var(--sys-color-divider-default,rgba(32,32,32,0.12))] px-siaf-md">
            <button
              class="relative h-10 px-siaf-sm text-sm transition hover:text-brand-primary"
              type="button"
              [class.font-bold]="activeTab === 'documents'"
              [class.font-normal]="activeTab !== 'documents'"
              [class.text-brand-primary]="activeTab === 'documents'"
              [class.text-text-muted]="activeTab !== 'documents'"
              (click)="selectTab('documents')"
            >
              Documentos
              @if (activeTab === 'documents') {
                <span class="absolute bottom-0 left-0 right-0 h-0.5 rounded-t bg-brand-primary"></span>
              }
            </button>
            <button
              class="relative h-10 px-siaf-sm text-sm transition hover:text-brand-primary"
              type="button"
              [class.font-bold]="activeTab === 'records'"
              [class.font-normal]="activeTab !== 'records'"
              [class.text-brand-primary]="activeTab === 'records'"
              [class.text-text-muted]="activeTab !== 'records'"
              (click)="selectTab('records')"
            >
              Registros
              @if (activeTab === 'records') {
                <span class="absolute bottom-0 left-0 right-0 h-0.5 rounded-t bg-brand-primary"></span>
              }
            </button>
          </nav>
        </section>

        <section class="relative p-siaf-md">
          <article class="flex min-h-[458px] flex-col gap-siaf-md rounded-siaf-md bg-surface p-siaf-lg">
            <header class="flex flex-col gap-siaf-md md:flex-row md:items-center md:justify-between">
              <h2 class="m-0 text-sm font-bold uppercase leading-normal text-text">
                {{ activeTab === 'documents' ? 'Documentos existentes' : 'Registros existentes' }}
              </h2>
              @if (activeTab === 'documents') {
                <siaf-button variant="primary" icon="task_alt" [disabled]="!canVerifySelectedDocuments" (click)="openVerifyModal()">Verificar</siaf-button>
              }
            </header>

            <div class="flex flex-col gap-siaf-md">
              <div class="flex flex-col gap-siaf-sm lg:flex-row lg:items-start">
                <label class="flex h-10 min-w-0 flex-1 items-center rounded-siaf-md border border-[var(--sys-color-border-states-enabled,rgba(32,32,32,0.4))] bg-surface px-siaf-md">
                  <span class="sr-only">Buscar</span>
                  <input class="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-text-muted" placeholder="Buscar" />
                </label>

                <div class="flex shrink-0 items-center justify-end gap-siaf-xs">
                  <div class="relative">
                    <button
                      class="inline-flex size-10 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-dark-pressed)]"
                      type="button"
                      aria-label="Campos"
                      [class.bg-surface-muted]="fieldsMenuOpen"
                      (click)="toggleFieldsMenu()"
                    >
                      <siaf-icon name="layers" [size]="24" />
                    </button>

                    @if (fieldsMenuOpen) {
                      <button class="fixed inset-0 z-20 cursor-default bg-transparent" type="button" aria-label="Cerrar campos" (click)="closeFieldsMenu()"></button>
                      <div
                        class="absolute right-0 top-12 z-30 w-[248px] overflow-hidden rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-highest,white)] py-siaf-xs shadow-[0_8px_10px_rgba(0,0,0,0.14),0_3px_14px_rgba(0,0,0,0.12),0_5px_5px_rgba(0,0,0,0.2)]"
                        (click)="$event.stopPropagation()"
                      >
                        @for (option of fieldsMenuOptions; track option.label) {
                          <button class="flex min-h-8 w-full items-center gap-siaf-md px-siaf-md py-siaf-xxs text-left text-sm font-normal leading-normal text-[var(--sys-color-text-neutral-medium)] transition hover:bg-[var(--sys-color-bg-states-light-hover,rgba(32,32,32,0.04))]" type="button" (click)="selectFieldsMenuOption(option.label)">
                            <span class="min-w-0 flex-1">{{ option.label }}</span>
                            @if (option.hasChildren) {
                              <siaf-icon name="chevron_right" [size]="24" />
                            }
                          </button>
                        }
                      </div>
                    }
                  </div>
                  <div class="relative">
                    <button
                      class="inline-flex size-10 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-dark-pressed)]"
                      type="button"
                      aria-label="Favorito"
                      [class.bg-surface-muted]="favoriteMenuOpen"
                      (click)="toggleFavoriteMenu()"
                    >
                      <siaf-icon name="star_border" [size]="24" />
                    </button>

                    @if (favoriteMenuOpen) {
                      <button class="fixed inset-0 z-20 cursor-default bg-transparent" type="button" aria-label="Cerrar favoritos" (click)="closeFavoriteMenu()"></button>
                      <div
                        class="absolute right-0 top-12 z-30 w-[248px] overflow-hidden rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-highest,white)] py-siaf-xs shadow-[0_8px_10px_rgba(0,0,0,0.14),0_3px_14px_rgba(0,0,0,0.12),0_5px_5px_rgba(0,0,0,0.2)]"
                        (click)="$event.stopPropagation()"
                      >
                        <button class="flex min-h-8 w-full items-center px-siaf-md py-siaf-xxs text-left text-sm font-normal leading-normal text-[var(--sys-color-text-neutral-medium)] transition hover:bg-[var(--sys-color-bg-states-light-hover,rgba(32,32,32,0.04))]" type="button" (click)="selectFavoriteOption('observed')">
                          Solicitudes observadas
                        </button>
                        <div class="h-px w-full bg-[var(--sys-color-divider-default,rgba(32,32,32,0.12))]"></div>
                        <button class="flex min-h-8 w-full items-center px-siaf-md py-siaf-xxs text-left text-sm font-normal leading-normal text-[var(--sys-color-text-neutral-medium)] transition hover:bg-[var(--sys-color-bg-states-light-hover,rgba(32,32,32,0.04))]" type="button" (click)="selectFavoriteOption('save-search')">
                          Guardar b&uacute;squeda actual
                        </button>
                      </div>
                    }
                  </div>
                  <div class="relative">
                    <button
                      class="inline-flex size-10 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-dark-pressed)]"
                      type="button"
                      aria-label="Mas opciones"
                      [class.bg-surface-muted]="moreOptionsMenuOpen"
                      (click)="toggleMoreOptionsMenu()"
                    >
                      <siaf-icon name="more_vert" [size]="24" />
                    </button>

                    @if (moreOptionsMenuOpen) {
                      <button class="fixed inset-0 z-20 cursor-default bg-transparent" type="button" aria-label="Cerrar mas opciones" (click)="closeMoreOptionsMenu()"></button>
                      <div
                        class="absolute right-0 top-12 z-30 w-[280px] overflow-hidden rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-highest,white)] py-siaf-xs shadow-[0_8px_10px_rgba(0,0,0,0.14),0_3px_14px_rgba(0,0,0,0.12),0_5px_5px_rgba(0,0,0,0.2)]"
                        (click)="$event.stopPropagation()"
                      >
                        <button class="flex min-h-8 w-full items-center px-siaf-md py-siaf-xxs text-left text-sm font-normal leading-normal text-[var(--sys-color-text-neutral-medium)] transition hover:bg-[var(--sys-color-bg-states-light-hover,rgba(32,32,32,0.04))]" type="button" (click)="openColumnPanel()">
                          Ocultar o mostrar columnas
                        </button>
                      </div>
                    }
                  </div>
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-siaf-xs">
                <div class="relative">
                  @if (selectedStatusFilter) {
                    <button
                      class="inline-flex h-8 items-center gap-siaf-xs overflow-hidden rounded-siaf-md border border-[var(--sys-color-border-states-active)] bg-[var(--sys-color-bg-states-light-selected,rgba(1,72,153,0.08))] px-siaf-xs py-siaf-xxs text-sm font-normal leading-normal tracking-[0.025px] text-[var(--sys-color-text-neutral-activated)] transition hover:bg-[var(--sys-color-bg-states-light-hover,rgba(32,32,32,0.04))]"
                      type="button"
                      aria-label="Filtro de estado seleccionado"
                      (click)="toggleStatusFilterMenu()"
                    >
                      <siaf-icon name="check" [size]="20" />
                      Estado: {{ selectedStatusFilter }}
                      <span class="inline-flex size-5 items-center justify-center rounded-siaf-sm" role="button" tabindex="0" aria-label="Quitar filtro de estado" (click)="clearStatusFilter($event)" (keydown.enter)="clearStatusFilter($event)" (keydown.space)="clearStatusFilter($event)">
                        <siaf-icon name="close" [size]="20" />
                      </span>
                    </button>
                  } @else {
                    <button
                      class="inline-flex h-8 items-center gap-siaf-xs rounded-siaf-md border border-[var(--sys-color-border-states-enabled,rgba(32,32,32,0.4))] bg-surface px-siaf-sm text-sm font-normal leading-normal tracking-[0.025px] text-text transition hover:bg-surface-muted"
                      type="button"
                      aria-label="Seleccionar estado"
                      [class.bg-surface-muted]="statusFilterMenuOpen"
                      (click)="toggleStatusFilterMenu()"
                    >
                      Estado
                      <siaf-icon [name]="statusFilterMenuOpen ? 'expand_less' : 'expand_more'" [size]="20" />
                    </button>
                  }

                  @if (statusFilterMenuOpen) {
                    <button class="fixed inset-0 z-20 cursor-default bg-transparent" type="button" aria-label="Cerrar estados" (click)="closeStatusFilterMenu()"></button>
                    <div
                      class="absolute left-0 top-10 z-30 w-[220px] overflow-hidden rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-highest,white)] py-siaf-xs shadow-[0_8px_10px_rgba(0,0,0,0.14),0_3px_14px_rgba(0,0,0,0.12),0_5px_5px_rgba(0,0,0,0.2)]"
                      (click)="$event.stopPropagation()"
                    >
                      @for (option of statusFilterOptions; track option) {
                        <button class="flex min-h-8 w-full items-center px-siaf-md py-siaf-xxs text-left text-sm font-normal leading-normal text-[var(--sys-color-text-neutral-medium)] transition hover:bg-[var(--sys-color-bg-states-light-hover,rgba(32,32,32,0.04))]" type="button" (click)="selectStatusFilter(option)">
                          {{ option }}
                        </button>
                      }
                    </div>
                  }
                </div>
                <div class="relative">
                  @if (selectedActionTypeFilter) {
                    <button
                      class="inline-flex h-8 items-center gap-siaf-xs overflow-hidden rounded-siaf-md border border-[var(--sys-color-border-states-active)] bg-[var(--sys-color-bg-states-light-selected,rgba(1,72,153,0.08))] px-siaf-xs py-siaf-xxs text-sm font-normal leading-normal tracking-[0.025px] text-[var(--sys-color-text-neutral-activated)] transition hover:bg-[var(--sys-color-bg-states-light-hover,rgba(32,32,32,0.04))]"
                      type="button"
                      aria-label="Filtro de tipo de accion seleccionado"
                      (click)="toggleActionTypeFilterMenu()"
                    >
                      <siaf-icon name="check" [size]="20" />
                      Tipo de acci&oacute;n: {{ selectedActionTypeFilter }}
                      <span class="inline-flex size-5 items-center justify-center rounded-siaf-sm" role="button" tabindex="0" aria-label="Quitar filtro de tipo de accion" (click)="clearActionTypeFilter($event)" (keydown.enter)="clearActionTypeFilter($event)" (keydown.space)="clearActionTypeFilter($event)">
                        <siaf-icon name="close" [size]="20" />
                      </span>
                    </button>
                  } @else {
                    <button
                      class="inline-flex h-8 items-center gap-siaf-xs rounded-siaf-md border border-[var(--sys-color-border-states-enabled,rgba(32,32,32,0.4))] bg-surface px-siaf-sm text-sm font-normal leading-normal tracking-[0.025px] text-text transition hover:bg-surface-muted"
                      type="button"
                      aria-label="Seleccionar tipo de accion"
                      [class.bg-surface-muted]="actionTypeFilterMenuOpen"
                      (click)="toggleActionTypeFilterMenu()"
                    >
                      Tipo de acci&oacute;n
                      <siaf-icon [name]="actionTypeFilterMenuOpen ? 'expand_less' : 'expand_more'" [size]="20" />
                    </button>
                  }

                  @if (actionTypeFilterMenuOpen) {
                    <button class="fixed inset-0 z-20 cursor-default bg-transparent" type="button" aria-label="Cerrar tipos de accion" (click)="closeActionTypeFilterMenu()"></button>
                    <div
                      class="absolute left-0 top-10 z-30 w-[220px] overflow-hidden rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-highest,white)] py-siaf-xs shadow-[0_8px_10px_rgba(0,0,0,0.14),0_3px_14px_rgba(0,0,0,0.12),0_5px_5px_rgba(0,0,0,0.2)]"
                      (click)="$event.stopPropagation()"
                    >
                      @for (option of actionTypeFilterOptions; track option) {
                        <button class="flex min-h-8 w-full items-center px-siaf-md py-siaf-xxs text-left text-sm font-normal leading-normal text-[var(--sys-color-text-neutral-medium)] transition hover:bg-[var(--sys-color-bg-states-light-hover,rgba(32,32,32,0.04))]" type="button" (click)="selectActionTypeFilter(option)">
                          {{ option }}
                        </button>
                      }
                    </div>
                  }
                </div>
                @for (filter of appliedCustomFilters; track filter.id) {
                  <button
                    class="inline-flex h-8 items-center gap-siaf-xs overflow-hidden rounded-siaf-md border border-[var(--sys-color-border-states-active)] bg-[var(--sys-color-bg-states-light-selected,rgba(1,72,153,0.08))] px-siaf-xs py-siaf-xxs text-sm font-normal leading-normal tracking-[0.025px] text-[var(--sys-color-text-neutral-activated)] transition hover:bg-[var(--sys-color-bg-states-light-hover,rgba(32,32,32,0.04))]"
                    type="button"
                    aria-label="Filtro personalizado aplicado"
                    (click)="editCustomAppliedFilter(filter)"
                  >
                    <siaf-icon name="bolt" [size]="20" />
                    {{ filter.campoLabel }}: {{ filter.valor }}
                    <span class="inline-flex size-5 items-center justify-center rounded-siaf-sm" role="button" tabindex="0" aria-label="Quitar filtro personalizado" (click)="clearCustomAppliedFilter(filter.id, $event)" (keydown.enter)="clearCustomAppliedFilter(filter.id, $event)" (keydown.space)="clearCustomAppliedFilter(filter.id, $event)">
                      <siaf-icon name="close" [size]="20" />
                    </span>
                  </button>
                }
                <button
                  class="inline-flex size-8 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-dark-pressed)]"
                  type="button"
                  aria-label="Agregar filtro"
                  [class.bg-surface-muted]="customFilterOpen"
                  (click)="openCustomFilterForCreate()"
                >
                  <siaf-icon name="add" [size]="20" />
                </button>
              </div>
            </div>

            <div class="flex justify-between">
              <label class="inline-flex size-10 items-center justify-center">
                <input class="size-4 accent-brand-primary" type="checkbox" />
              </label>

              <div class="hidden w-full max-w-[220px] md:block">
                <siaf-pagination navigation="Activate" position="Top" [page]="page" [pageSize]="rowsPerPage" [totalItems]="activeTab === 'documents' ? filteredRows.length : recordRows.length" [totalPages]="totalPages" />
              </div>
            </div>

            @if (activeTab === 'documents') {
              <div class="min-w-0 overflow-x-auto">
                <table class="w-full min-w-[2360px] border-collapse text-left text-sm">
                  <thead>
                    <tr class="bg-surface-high text-[10px] font-bold uppercase text-text">
                      <th class="w-10 rounded-l-siaf-sm px-siaf-sm py-siaf-sm"></th>
                      @if (isColumnVisible('document')) { <th class="w-[360px] px-siaf-md py-siaf-sm">Documento</th> }
                      @if (isColumnVisible('number')) { <th class="w-[140px] px-siaf-md py-siaf-sm">Número</th> }
                      @if (isColumnVisible('actionType')) { <th class="w-[210px] px-siaf-md py-siaf-sm">Tipo de Operación</th> }
                      @if (isColumnVisible('status')) { <th class="w-[150px] px-siaf-md py-siaf-sm">Estado</th> }
                      @if (isColumnVisible('system')) { <th class="w-[260px] px-siaf-md py-siaf-sm">Sistemas Nacionales</th> }
                      @if (isColumnVisible('date')) { <th class="w-[190px] px-siaf-md py-siaf-sm">Fecha de registro</th> }
                      @if (isColumnVisible('creator')) { <th class="w-[210px] px-siaf-md py-siaf-sm">Creador</th> }
                      @if (isColumnVisible('subject')) { <th class="w-[280px] px-siaf-md py-siaf-sm">Asunto/Motivo</th> }
                      @if (isColumnVisible('catId')) { <th class="w-[190px] px-siaf-md py-siaf-sm">ID CAT CLAS Y CAT</th> }
                      @if (isColumnVisible('entityCode')) { <th class="w-[180px] px-siaf-md py-siaf-sm">Código Entidad</th> }
                      @if (isColumnVisible('requesterArea')) { <th class="w-[240px] px-siaf-md py-siaf-sm">Area Solicitante</th> }
                      @if (isColumnVisible('entity')) { <th class="w-[360px] px-siaf-md py-siaf-sm">Entidad</th> }
                      @if (isColumnVisible('fileNumber')) { <th class="w-[180px] px-siaf-md py-siaf-sm">Expediente</th> }
                      @if (isColumnVisible('evaluationDate')) { <th class="w-[210px] px-siaf-md py-siaf-sm">Fecha de evaluación</th> }
                      @if (isColumnVisible('evaluationUser')) { <th class="w-[240px] px-siaf-md py-siaf-sm">Usuario de evaluación</th> }
                      @if (isColumnVisible('approvalDate')) { <th class="w-[210px] px-siaf-md py-siaf-sm">Fecha de aprobación</th> }
                      @if (isColumnVisible('approvalUser')) { <th class="w-[240px] px-siaf-md py-siaf-sm">Usuario de aprobación</th> }
                      @if (isColumnVisible('subdocumentCount')) { <th class="w-[240px] px-siaf-md py-siaf-sm">Cantidad de Subdocumentos</th> }
                      <th class="sticky right-0 w-14 rounded-r-siaf-sm border-l border-[var(--sys-color-divider-strong)] bg-surface-high px-siaf-sm py-siaf-sm shadow-[-4px_0_8px_rgba(0,0,0,0.08)]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of filteredRows; track row.number) {
                      <tr class="border-b border-[var(--sys-color-divider-default,rgba(32,32,32,0.12))] bg-surface hover:bg-[rgba(1,72,153,0.04)]">
                        <td class="h-[58px] px-siaf-sm py-siaf-xs">
                          <input
                            class="size-4 accent-brand-primary"
                            type="checkbox"
                            [checked]="row.selected"
                            (change)="toggleDocumentSelection(row, $event)"
                          />
                        </td>
                        @if (isColumnVisible('document')) {
                          <td class="max-w-[360px] px-siaf-md py-siaf-sm">
                            <a class="line-clamp-2 text-sm leading-normal text-text hover:text-brand-primary" routerLink="/procesos/registro-asiento-ajuste/formulario">{{ row.document }}</a>
                          </td>
                        }
                        @if (isColumnVisible('number')) { <td class="px-siaf-md py-siaf-sm">{{ row.number }}</td> }
                        @if (isColumnVisible('actionType')) { <td class="px-siaf-md py-siaf-sm">{{ row.actionType }}</td> }
                        @if (isColumnVisible('status')) {
                          <td class="px-siaf-md py-siaf-sm">
                            <span class="inline-flex min-h-6 items-center rounded-siaf-sm px-siaf-xs text-xs text-white" [class.bg-[var(--sys-color-bg-status-flow-status-elaborado)]]="row.status === 'Elaborado'" [class.bg-[var(--sys-color-bg-status-flow-status-verificado)]]="row.status === 'Verificado'">{{ row.status }}</span>
                          </td>
                        }
                        @if (isColumnVisible('system')) { <td class="px-siaf-md py-siaf-sm">{{ row.system }}</td> }
                        @if (isColumnVisible('date')) { <td class="px-siaf-md py-siaf-sm">{{ row.date }}</td> }
                        @if (isColumnVisible('creator')) { <td class="px-siaf-md py-siaf-sm">{{ row.creator }}</td> }
                        @if (isColumnVisible('subject')) { <td class="px-siaf-md py-siaf-sm">{{ row.subject }}</td> }
                        @if (isColumnVisible('catId')) { <td class="px-siaf-md py-siaf-sm">{{ row.catId }}</td> }
                        @if (isColumnVisible('entityCode')) { <td class="px-siaf-md py-siaf-sm">{{ row.entityCode }}</td> }
                        @if (isColumnVisible('requesterArea')) { <td class="px-siaf-md py-siaf-sm">{{ row.requesterArea }}</td> }
                        @if (isColumnVisible('entity')) { <td class="px-siaf-md py-siaf-sm">{{ row.entity }}</td> }
                        @if (isColumnVisible('fileNumber')) { <td class="px-siaf-md py-siaf-sm">{{ row.fileNumber }}</td> }
                        @if (isColumnVisible('evaluationDate')) { <td class="px-siaf-md py-siaf-sm">{{ row.evaluationDate }}</td> }
                        @if (isColumnVisible('evaluationUser')) { <td class="px-siaf-md py-siaf-sm">{{ row.evaluationUser }}</td> }
                        @if (isColumnVisible('approvalDate')) { <td class="px-siaf-md py-siaf-sm">{{ row.approvalDate }}</td> }
                        @if (isColumnVisible('approvalUser')) { <td class="px-siaf-md py-siaf-sm">{{ row.approvalUser }}</td> }
                        @if (isColumnVisible('subdocumentCount')) { <td class="px-siaf-md py-siaf-sm">{{ row.subdocumentCount }}</td> }
                        <td class="sticky right-0 border-l border-[var(--sys-color-divider-strong)] bg-surface px-siaf-sm py-siaf-xs shadow-[-4px_0_8px_rgba(0,0,0,0.08)]">
                          <button class="inline-flex size-8 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-dark-pressed)]" type="button" aria-label="Historial de documento" title="Historial de documento" (click)="openDocumentHistory(row)">
                            <siaf-icon name="history" [size]="20" />
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <div class="min-w-0 overflow-x-auto">
                <table class="w-full min-w-[1480px] border-collapse text-left text-sm">
                  <thead>
                    <tr class="bg-surface-high text-[10px] font-bold uppercase text-text">
                      <th class="w-10 rounded-l-siaf-sm px-siaf-sm py-siaf-sm"></th>
                      @if (isColumnVisible('status')) { <th class="w-[150px] px-siaf-md py-siaf-sm">Estado</th> }
                      @if (isColumnVisible('accountingDocument')) { <th class="w-[210px] px-siaf-md py-siaf-sm">Doc contable</th> }
                      @if (isColumnVisible('institutionalScope')) { <th class="w-[240px] px-siaf-md py-siaf-sm">Ámbito institucional</th> }
                      @if (isColumnVisible('adjustmentClassCode')) { <th class="w-[280px] px-siaf-md py-siaf-sm">Código de clase de ajuste</th> }
                      @if (isColumnVisible('adjustmentDetailCode')) { <th class="w-[300px] px-siaf-md py-siaf-sm">Código de detalle de ajuste</th> }
                      @if (isColumnVisible('totalDebit')) { <th class="w-[160px] px-siaf-md py-siaf-sm text-right">Total debe</th> }
                      @if (isColumnVisible('totalCredit')) { <th class="w-[160px] px-siaf-md py-siaf-sm text-right">Total haber</th> }
                      <th class="sticky right-0 w-14 rounded-r-siaf-sm border-l border-[var(--sys-color-divider-strong)] bg-surface-high px-siaf-sm py-siaf-sm shadow-[-4px_0_8px_rgba(0,0,0,0.08)]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of recordRows; track row.accountingDocument) {
                      <tr class="h-12 border-b border-[var(--sys-color-divider-default,rgba(32,32,32,0.12))] bg-surface hover:bg-[rgba(1,72,153,0.04)]">
                        <td class="px-siaf-sm py-siaf-xs"><input class="size-4 accent-brand-primary" type="checkbox" [checked]="row.selected" /></td>
                        @if (isColumnVisible('status')) {
                          <td class="px-siaf-md py-siaf-sm">
                            <span class="inline-flex min-h-6 items-center gap-siaf-xs rounded-siaf-sm border border-[var(--sys-color-border-feedback-info)] bg-[var(--sys-color-bg-status-record-status-activo)] px-siaf-xs text-[var(--sys-color-text-feedback-info)]">
                              <siaf-icon name="check_circle" [size]="16" />
                              {{ row.status }}
                            </span>
                          </td>
                        }
                        @if (isColumnVisible('accountingDocument')) { <td class="px-siaf-md py-siaf-sm">{{ row.accountingDocument }}</td> }
                        @if (isColumnVisible('institutionalScope')) { <td class="px-siaf-md py-siaf-sm">{{ row.institutionalScope }}</td> }
                        @if (isColumnVisible('adjustmentClassCode')) { <td class="px-siaf-md py-siaf-sm">{{ row.adjustmentClassCode }}</td> }
                        @if (isColumnVisible('adjustmentDetailCode')) { <td class="px-siaf-md py-siaf-sm">{{ row.adjustmentDetailCode }}</td> }
                        @if (isColumnVisible('totalDebit')) { <td class="px-siaf-md py-siaf-sm text-right">{{ row.totalDebit }}</td> }
                        @if (isColumnVisible('totalCredit')) { <td class="px-siaf-md py-siaf-sm text-right">{{ row.totalCredit }}</td> }
                        <td class="sticky right-0 border-l border-[var(--sys-color-divider-strong)] bg-surface px-siaf-sm py-siaf-xs shadow-[-4px_0_8px_rgba(0,0,0,0.08)]">
                          <button class="inline-flex size-8 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-dark-pressed)]" type="button" aria-label="Historial de documento" title="Historial de documento" (click)="openRecordHistory(row)">
                            <siaf-icon name="history" [size]="20" />
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }

            <siaf-pagination
              navigation="Activate"
              position="Bottom"
              [rowPage]="true"
              [page]="page"
              [pageSize]="rowsPerPage"
              [totalItems]="activeTab === 'documents' ? filteredRows.length : recordRows.length"
              [totalPages]="1"
              [rowsPerPage]="rowsPerPage"
              [rowsPerPageOptions]="rowsPerPageOptions"
              (rowsPerPageChange)="onRowsPerPageChange($event)"
            />
          </article>

          @if (customFilterOpen) {
            <button class="fixed inset-0 z-20 cursor-default bg-transparent" type="button" aria-label="Cerrar filtros" (click)="closeCustomFilter()"></button>
            <div class="absolute left-[40px] top-[188px] z-30 w-[936px] max-w-[calc(100%-80px)]" (click)="$event.stopPropagation()">
              <siaf-custom-filter
                [campoOptions]="filterCampoOptions"
                [condicionOptions]="filterCondicionOptions"
                [valorOptions]="filterValorOptions"
                [initialRows]="customFilterInitialRows"
                [deleteEnabled]="!!editingCustomFilterId"
                (aplicar)="onCustomFilterApply($event)"
                (cancelar)="closeCustomFilter()"
                (eliminar)="deleteEditingCustomFilter()"
              />
            </div>
          }
        </section>
      </section>
      }

      @if (columnPanelOpen) {
        <section class="fixed inset-y-0 left-0 right-0 z-50 bg-black/55 pl-0 lg:pl-[65px]" aria-modal="true" role="dialog" aria-labelledby="columns-panel-title" (click)="closeColumnPanel()">
          <aside class="absolute bottom-0 right-0 top-0 flex w-full max-w-[420px] flex-col overflow-hidden bg-surface shadow-siaf-lg" (click)="$event.stopPropagation()">
            <header class="flex h-14 shrink-0 items-center gap-siaf-xs border-b border-[var(--sys-color-divider-default)] px-siaf-xl">
              <h2 id="columns-panel-title" class="m-0 flex-1 text-base font-bold uppercase tracking-[0.02px] text-text">Ocultar o mostrar columnas</h2>
              <button class="inline-flex size-10 items-center justify-center rounded-siaf-md text-text transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-dark-pressed)]" type="button" aria-label="Cerrar" (click)="closeColumnPanel()">
                <siaf-icon name="close" [size]="24" />
              </button>
            </header>

            <div class="min-h-0 flex-1 overflow-y-auto border-y border-[var(--sys-color-divider-strong)] bg-[var(--sys-color-bg-surfaces-surface-highest)] px-siaf-xl py-siaf-md">
              <div class="flex flex-col gap-siaf-lg">
                <label class="flex min-h-12 cursor-pointer items-center gap-siaf-md px-siaf-md py-siaf-sm text-sm uppercase text-[var(--sys-color-text-neutral-medium)]">
                  <input class="size-4 accent-brand-primary" type="checkbox" [checked]="allDraftColumnsSelected" (change)="toggleAllDraftColumns($event)" />
                  Seleccionar todo
                </label>
                <section class="grid gap-siaf-xs">
                  <h3 class="m-0 px-[18px] text-xs font-normal uppercase text-[var(--sys-color-text-neutral-medium)]">Predeterminado</h3>
                  @for (column of defaultColumnOptions; track column.key) {
                    <label class="flex min-h-12 cursor-pointer items-center gap-siaf-md px-siaf-md py-siaf-sm text-sm text-[var(--sys-color-text-neutral-medium)] transition hover:bg-surface-muted">
                      <input class="size-4 accent-brand-primary" type="checkbox" [checked]="isDraftColumnVisible(column.key)" (change)="toggleDraftColumnVisibility(column.key, $event)" />
                      {{ column.label }}
                    </label>
                  }
                </section>
                <section class="grid gap-siaf-xs">
                  <h3 class="m-0 px-[18px] text-xs font-normal uppercase text-[var(--sys-color-text-neutral-medium)]">Más columnas</h3>
                  @for (column of moreColumnOptions; track column.key) {
                    <label class="flex min-h-12 cursor-pointer items-center gap-siaf-md px-siaf-md py-siaf-sm text-sm text-[var(--sys-color-text-neutral-medium)] transition hover:bg-surface-muted">
                      <input class="size-4 accent-brand-primary" type="checkbox" [checked]="isDraftColumnVisible(column.key)" (change)="toggleDraftColumnVisibility(column.key, $event)" />
                      {{ column.label }}
                    </label>
                  }
                </section>
                @if (internalColumnOptions.length) {
                  <section class="grid gap-siaf-xs">
                    <h3 class="m-0 px-[18px] text-xs font-normal uppercase text-[var(--sys-color-text-neutral-medium)]">Interno</h3>
                    @for (column of internalColumnOptions; track column.key) {
                      <label class="flex min-h-12 items-center gap-siaf-md px-siaf-md py-siaf-sm text-sm text-text-muted">
                        <input class="size-4" type="checkbox" disabled />
                        {{ column.label }}
                      </label>
                    }
                  </section>
                }
              </div>
            </div>

            <footer class="flex shrink-0 items-center justify-end gap-siaf-xs px-siaf-md py-siaf-sm">
              <button class="inline-flex min-h-10 items-center justify-center rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] px-siaf-md py-siaf-xs text-sm font-medium text-text transition hover:bg-surface-muted" type="button" (click)="closeColumnPanel()">Cancelar</button>
              <siaf-button variant="primary" size="md" [disabled]="!columnsPanelDirty" (click)="applyColumnPanel()">Aplicar</siaf-button>
            </footer>
          </aside>
        </section>
      }
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdjustmentSeatDocumentsComponent {
  activeNavigation: SidebarNavigation = 'Proceso';
  activeTab: ActiveTab = 'documents';
  createDocumentPopoverOpen = false;
  customFilterOpen = false;
  fieldsMenuOpen = false;
  favoriteMenuOpen = false;
  moreOptionsMenuOpen = false;
  columnPanelOpen = false;
  statusFilterMenuOpen = false;
  selectedStatusFilter = '';
  actionTypeFilterMenuOpen = false;
  selectedActionTypeFilter = '';
  appliedCustomFilters: AppliedCustomFilter[] = [];
  customFilterInitialRows: FilterRow[] = [];
  editingCustomFilterId = '';
  private customFilterSequence = 0;
  processMenuOpen = false;
  trayMenuOpen = false;
  trayContentOpen = false;
  mobileNavigationOpen = false;
  selectedTrayItem = 'Borradores';
  sidebarCreateDocumentOpen = false;
  documentHistoryOpen = false;
  verifyModalOpen = false;
  approvalSnackbarOpen = false;
  approvalSnackbarNumbers = '';
  selectedHistorySummary: DocumentHistorySummary = {
    document: ADJUSTMENT_SEAT_REQUEST_LABEL,
    number: '0004',
    actionType: 'Creación'
  };
  readonly createDocumentProcessOptions = ADJUSTMENT_SEAT_CREATE_DOCUMENT_OPTIONS;
  createDocumentDocument = '';
  createDocumentActionType = '';

  readonly filterCampoOptions = [
    { label: 'Documento', value: 'document' },
    { label: 'Numero', value: 'number' },
    { label: 'Tipo de accion', value: 'actionType' },
    { label: 'Estado', value: 'status' },
    { label: 'Sistema', value: 'system' },
    { label: 'Fecha', value: 'date' },
    { label: 'Entidad', value: 'entity' }
  ];

  readonly filterCondicionOptions = [
    { label: 'Es igual a', value: 'eq' },
    { label: 'No es igual a', value: 'neq' },
    { label: 'Contiene', value: 'contains' },
    { label: 'No contiene', value: 'not_contains' },
    { label: 'Empieza con', value: 'starts_with' },
    { label: 'Termina con', value: 'ends_with' }
  ];

  readonly filterValorOptions = [
    { label: 'Elaborado', value: 'Elaborado' },
    { label: 'Verificado', value: 'Verificado' },
    { label: 'Creacion', value: 'Creacion' },
    { label: 'Reversion', value: 'Reversion' },
    { label: 'Sistema Nacional de Contabilidad', value: 'Sistema Nacional de Contabilidad' }
  ];

  readonly fieldsMenuOptions = [
    { label: 'Documento' },
    { label: 'Tipo de acción' },
    { label: 'Estado' },
    { label: 'Sistema' },
    { label: 'Fecha de registro', hasChildren: true },
    { label: 'Entidad' }
  ];

  readonly documentColumnOptions: ColumnOption[] = [
    { key: 'document', label: 'Documento', visibility: 'visible', group: 'default' },
    { key: 'number', label: 'Número', visibility: 'visible', group: 'default' },
    { key: 'actionType', label: 'Tipo de Operación', visibility: 'visible', group: 'default' },
    { key: 'status', label: 'Estado', visibility: 'visible', group: 'default' },
    { key: 'system', label: 'Sistemas Nacionales', visibility: 'visible', group: 'default' },
    { key: 'date', label: 'Fecha de registro', visibility: 'visible', group: 'default' },
    { key: 'creator', label: 'Creador', visibility: 'hidden', group: 'more' },
    { key: 'subject', label: 'Asunto/Motivo', visibility: 'hidden', group: 'more' },
    { key: 'catId', label: 'ID CAT CLAS Y CAT', visibility: 'visible', group: 'more' },
    { key: 'entityCode', label: 'Código Entidad', visibility: 'visible', group: 'more' },
    { key: 'requesterArea', label: 'Area Solicitante', visibility: 'visible', group: 'more' },
    { key: 'entity', label: 'Entidad', visibility: 'visible', group: 'more' },
    { key: 'fileNumber', label: 'Expediente', visibility: 'hidden', group: 'more' },
    { key: 'evaluationDate', label: 'Fecha de evaluación', visibility: 'hidden', group: 'more' },
    { key: 'evaluationUser', label: 'Usuario de evaluación', visibility: 'hidden', group: 'more' },
    { key: 'approvalDate', label: 'Fecha de aprobación', visibility: 'hidden', group: 'more' },
    { key: 'approvalUser', label: 'Usuario de aprobación', visibility: 'hidden', group: 'more' },
    { key: 'subdocumentCount', label: 'Cantidad de Subdocumentos', visibility: 'visible', group: 'more' },
    { key: 'accountingStatus', label: 'Estado de Contabilización', visibility: 'internal', group: 'internal' },
    { key: 'accountingDate', label: 'Fecha de contabilización', visibility: 'internal', group: 'internal' }
  ];

  readonly recordColumnOptions: ColumnOption[] = [
    { key: 'status', label: 'Estado', visibility: 'visible', group: 'default' },
    { key: 'accountingDocument', label: 'Doc conta.', visibility: 'visible', group: 'default' },
    { key: 'institutionalScope', label: 'Ámbito institucional', visibility: 'visible', group: 'default' },
    { key: 'adjustmentClassCode', label: 'Código de clase de ajuste', visibility: 'visible', group: 'default' },
    { key: 'adjustmentDetailCode', label: 'Código de detalle de ajuste', visibility: 'visible', group: 'default' },
    { key: 'totalDebit', label: 'Total debe', visibility: 'visible', group: 'default' },
    { key: 'totalCredit', label: 'Total haber', visibility: 'visible', group: 'default' }
  ];

  hiddenDocumentColumns = new Set(this.documentColumnOptions.filter((column) => column.visibility !== 'visible').map((column) => column.key));
  hiddenRecordColumns = new Set(this.recordColumnOptions.filter((column) => column.visibility !== 'visible').map((column) => column.key));
  draftHiddenColumns = new Set<string>();

  constructor(private readonly router: Router) {}

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Inicio', href: '/panel' },
    ...buildAdjustmentSeatBreadcrumbs('Documentos y registros')
  ];

  readonly rows: DocumentRow[] = [
    { document: 'Solicitud de registro de asiento de ajuste', number: '0004', actionType: 'Creación', status: 'Elaborado', system: 'Sistema Nacional de Contabilidad', date: '15/06/2024', entity: '009 - Ministerio de Economía y Finanzas', creator: 'Juan Doe', subject: 'Registro de ajuste contable', catId: 'CA', entityCode: '009', requesterArea: 'DGCP', fileNumber: 'EXP-0004', evaluationDate: '16/06/2024', evaluationUser: 'Evaluador 1', approvalDate: '17/06/2024', approvalUser: 'Aprobador 1', subdocumentCount: '2', accountingStatus: 'Pendiente', accountingDate: '18/06/2024' },
    { document: 'Solicitud de registro de asiento de ajuste', number: '0003', actionType: 'Creación', status: 'Verificado', system: 'Sistema Nacional de Contabilidad', date: '20/01/2024', entity: '009 - Ministerio de Economía y Finanzas', creator: 'Maria Doe', subject: 'Verificación de asiento', catId: 'CA', entityCode: '009', requesterArea: 'DGCP', fileNumber: 'EXP-0003', evaluationDate: '21/01/2024', evaluationUser: 'Evaluador 2', approvalDate: '22/01/2024', approvalUser: 'Aprobador 2', subdocumentCount: '1', accountingStatus: 'Procesado', accountingDate: '23/01/2024' },
    { document: 'Solicitud de registro de asiento de ajuste', number: '0002', actionType: 'Creación', status: 'Verificado', system: 'Sistema Nacional de Contabilidad', date: '15/12/2023', entity: '009 - Ministerio de Economía y Finanzas', creator: 'Juan Doe', subject: 'Ajuste de saldos iniciales', catId: 'CA', entityCode: '009', requesterArea: 'DGCP', fileNumber: 'EXP-0002', evaluationDate: '16/12/2023', evaluationUser: 'Evaluador 1', approvalDate: '17/12/2023', approvalUser: 'Aprobador 1', subdocumentCount: '3', accountingStatus: 'Procesado', accountingDate: '18/12/2023' },
    { document: 'Solicitud de registro de asiento de ajuste', number: '0001', actionType: 'Creación', status: 'Elaborado', system: 'Sistema Nacional de Contabilidad', date: '20/11/2023', entity: '009 - Ministerio de Economía y Finanzas', creator: 'Maria Doe', subject: 'Apertura de asiento de ajuste', catId: 'CA', entityCode: '009', requesterArea: 'DGCP', fileNumber: 'EXP-0001', evaluationDate: '21/11/2023', evaluationUser: 'Evaluador 2', approvalDate: '22/11/2023', approvalUser: 'Aprobador 2', subdocumentCount: '2', accountingStatus: 'Pendiente', accountingDate: '23/11/2023' }
  ];

  readonly statusFilterOptions: DocumentRow['status'][] = ['Elaborado', 'Verificado'];
  readonly actionTypeFilterOptions = ['Creación', 'Reversión'];

  readonly recordRows: RecordRow[] = [
    { status: 'Activo', accountingDocument: '093-2026-05', institutionalScope: 'EPP', adjustmentClassCode: 'CLASE DE AJUSTE', adjustmentDetailCode: 'DETALLE DE AJUSTE', totalDebit: '237,000', totalCredit: '237,000' },
    { status: 'Activo', accountingDocument: '093-2026-04', institutionalScope: 'EPP', adjustmentClassCode: 'CLASE DE AJUSTE', adjustmentDetailCode: 'DETALLE DE AJUSTE', totalDebit: '237,000', totalCredit: '237,000' },
    { status: 'Activo', accountingDocument: '093-2026-03', institutionalScope: 'EPP', adjustmentClassCode: 'CLASE DE AJUSTE', adjustmentDetailCode: 'DETALLE DE AJUSTE', totalDebit: '237,000', totalCredit: '237,000' },
    { status: 'Activo', accountingDocument: '093-2026-02', institutionalScope: 'EPP', adjustmentClassCode: 'CLASE DE AJUSTE', adjustmentDetailCode: 'DETALLE DE AJUSTE', totalDebit: '237,000', totalCredit: '237,000' },
    { status: 'Activo', accountingDocument: '093-2026-01', institutionalScope: 'EPP', adjustmentClassCode: 'CLASE DE AJUSTE', adjustmentDetailCode: 'DETALLE DE AJUSTE', totalDebit: '237,000', totalCredit: '237,000' }
  ];

  readonly rowsPerPageOptions = [10, 25, 50, 100];
  rowsPerPage = 25;
  page = 1;
  totalItems = 800;

  get filteredRows(): DocumentRow[] {
    return this.rows.filter((row) => {
      const matchesStatus = !this.selectedStatusFilter || row.status === this.selectedStatusFilter;
      const matchesActionType = !this.selectedActionTypeFilter || row.actionType === this.selectedActionTypeFilter;
      const matchesCustomFilters = this.appliedCustomFilters.every((filter) => this.matchesCustomFilter(row, filter));

      return matchesStatus && matchesActionType && matchesCustomFilters;
    });
  }

  get totalPages(): number {
    const itemCount = this.activeTab === 'documents' ? this.filteredRows.length : this.recordRows.length;
    return Math.max(1, Math.ceil(itemCount / this.rowsPerPage));
  }

  get canVerifySelectedDocuments(): boolean {
    return this.rows.some((row) => row.selected && row.status === 'Elaborado');
  }

  get activeColumnOptions(): ColumnOption[] {
    return this.activeTab === 'documents' ? this.documentColumnOptions : this.recordColumnOptions;
  }

  get selectableColumnOptions(): ColumnOption[] {
    return this.activeColumnOptions.filter((column) => column.visibility !== 'internal');
  }

  get defaultColumnOptions(): ColumnOption[] {
    return this.selectableColumnOptions.filter((column) => column.group === 'default');
  }

  get moreColumnOptions(): ColumnOption[] {
    return this.selectableColumnOptions.filter((column) => column.group === 'more');
  }

  get internalColumnOptions(): ColumnOption[] {
    return this.activeColumnOptions.filter((column) => column.visibility === 'internal');
  }

  get visibleColumnCount(): number {
    return this.activeColumnOptions.filter((column) => this.isColumnVisible(column.key)).length;
  }

  get allDraftColumnsSelected(): boolean {
    return this.selectableColumnOptions.every((column) => !this.draftHiddenColumns.has(column.key));
  }

  get columnsPanelDirty(): boolean {
    const hiddenColumns = this.currentHiddenColumns;
    return this.selectableColumnOptions.some((column) => hiddenColumns.has(column.key) !== this.draftHiddenColumns.has(column.key));
  }

  private get currentHiddenColumns(): Set<string> {
    return this.activeTab === 'documents' ? this.hiddenDocumentColumns : this.hiddenRecordColumns;
  }

  get selectedElaboradoDocumentsCount(): number {
    return this.selectedElaboradoDocuments.length;
  }

  get verifyModalDescription(): string {
    return `Estás a punto de aprobar ${this.selectedElaboradoDocumentsCount} solicitudes en simultáneo.`;
  }

  private get selectedElaboradoDocuments(): DocumentRow[] {
    return this.rows.filter((row) => row.selected && row.status === 'Elaborado');
  }

  get createDocumentFields(): CreateDocumentField[] {
    return [
      {
        placeholder: 'Documento',
        type: 'select',
        required: true,
        value: this.createDocumentDocument,
        options: this.createDocumentProcessOptions[0].documents
      },
      {
        placeholder: 'Tipo de acción',
        type: 'select',
        required: true,
        value: this.createDocumentActionType,
        options: this.createDocumentProcessOptions[0].actionTypes
      }
    ];
  }

  get createDocumentAcceptDisabled(): boolean {
    return !this.createDocumentDocument || !this.createDocumentActionType;
  }

  selectTab(tab: ActiveTab): void {
    this.activeTab = tab;
    this.page = 1;
    this.closeMoreOptionsMenu();
  }

  toggleDocumentSelection(row: DocumentRow, event: Event): void {
    row.selected = (event.target as HTMLInputElement).checked;
  }

  openVerifyModal(): void {
    if (!this.canVerifySelectedDocuments) {
      return;
    }

    this.closeFloatingPanels();
    this.createDocumentPopoverOpen = false;
    this.customFilterOpen = false;
    this.fieldsMenuOpen = false;
    this.favoriteMenuOpen = false;
    this.statusFilterMenuOpen = false;
    this.actionTypeFilterMenuOpen = false;
    this.verifyModalOpen = true;
  }

  closeVerifyModal(): void {
    this.verifyModalOpen = false;
  }

  confirmVerifyModal(): void {
    const selectedRows = this.selectedElaboradoDocuments;
    this.approvalSnackbarNumbers = this.formatDocumentNumbers(selectedRows.map((row) => row.number));

    selectedRows.forEach((row) => {
      row.status = 'Verificado';
      row.selected = false;
    });

    this.verifyModalOpen = false;
    this.approvalSnackbarOpen = selectedRows.length > 0;
  }

  closeApprovalSnackbar(): void {
    this.approvalSnackbarOpen = false;
  }

  toggleCreateDocumentPopover(): void {
    this.customFilterOpen = false;
    this.fieldsMenuOpen = false;
    this.favoriteMenuOpen = false;
    this.statusFilterMenuOpen = false;
    this.actionTypeFilterMenuOpen = false;
    this.createDocumentPopoverOpen = !this.createDocumentPopoverOpen;
  }

  closeCreateDocumentPopover(): void {
    this.createDocumentPopoverOpen = false;
  }

  openCustomFilterForCreate(): void {
    this.closeFloatingPanels();
    this.createDocumentPopoverOpen = false;
    this.fieldsMenuOpen = false;
    this.favoriteMenuOpen = false;
    this.statusFilterMenuOpen = false;
    this.actionTypeFilterMenuOpen = false;
    this.editingCustomFilterId = '';
    this.customFilterInitialRows = [];
    this.customFilterOpen = true;
  }

  editCustomAppliedFilter(filter: AppliedCustomFilter): void {
    this.closeFloatingPanels();
    this.createDocumentPopoverOpen = false;
    this.fieldsMenuOpen = false;
    this.favoriteMenuOpen = false;
    this.statusFilterMenuOpen = false;
    this.actionTypeFilterMenuOpen = false;
    this.editingCustomFilterId = filter.id;
    this.customFilterInitialRows = [
      {
        campo: filter.campo,
        condicion: filter.condicion,
        valor: filter.valor
      }
    ];
    this.customFilterOpen = true;
  }

  closeCustomFilter(): void {
    this.customFilterOpen = false;
    this.editingCustomFilterId = '';
    this.customFilterInitialRows = [];
  }

  toggleStatusFilterMenu(): void {
    this.closeFloatingPanels();
    this.createDocumentPopoverOpen = false;
    this.customFilterOpen = false;
    this.fieldsMenuOpen = false;
    this.favoriteMenuOpen = false;
    this.actionTypeFilterMenuOpen = false;
    this.statusFilterMenuOpen = !this.statusFilterMenuOpen;
  }

  closeStatusFilterMenu(): void {
    this.statusFilterMenuOpen = false;
  }

  selectStatusFilter(status: DocumentRow['status']): void {
    this.selectedStatusFilter = status;
    this.page = 1;
    this.closeStatusFilterMenu();
  }

  clearStatusFilter(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.selectedStatusFilter = '';
    this.page = 1;
    this.closeStatusFilterMenu();
  }

  toggleActionTypeFilterMenu(): void {
    this.closeFloatingPanels();
    this.createDocumentPopoverOpen = false;
    this.customFilterOpen = false;
    this.fieldsMenuOpen = false;
    this.favoriteMenuOpen = false;
    this.statusFilterMenuOpen = false;
    this.actionTypeFilterMenuOpen = !this.actionTypeFilterMenuOpen;
  }

  closeActionTypeFilterMenu(): void {
    this.actionTypeFilterMenuOpen = false;
  }

  selectActionTypeFilter(actionType: string): void {
    this.selectedActionTypeFilter = actionType;
    this.page = 1;
    this.closeActionTypeFilterMenu();
  }

  clearActionTypeFilter(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.selectedActionTypeFilter = '';
    this.page = 1;
    this.closeActionTypeFilterMenu();
  }

  toggleFavoriteMenu(): void {
    this.closeFloatingPanels();
    this.createDocumentPopoverOpen = false;
    this.customFilterOpen = false;
    this.fieldsMenuOpen = false;
    this.statusFilterMenuOpen = false;
    this.actionTypeFilterMenuOpen = false;
    this.favoriteMenuOpen = !this.favoriteMenuOpen;
  }

  toggleFieldsMenu(): void {
    this.closeFloatingPanels();
    this.createDocumentPopoverOpen = false;
    this.customFilterOpen = false;
    this.fieldsMenuOpen = false;
    this.favoriteMenuOpen = false;
    this.statusFilterMenuOpen = false;
    this.actionTypeFilterMenuOpen = false;
    this.fieldsMenuOpen = !this.fieldsMenuOpen;
  }

  toggleMoreOptionsMenu(): void {
    this.closeFloatingPanels();
    this.createDocumentPopoverOpen = false;
    this.customFilterOpen = false;
    this.fieldsMenuOpen = false;
    this.favoriteMenuOpen = false;
    this.statusFilterMenuOpen = false;
    this.actionTypeFilterMenuOpen = false;
    this.moreOptionsMenuOpen = !this.moreOptionsMenuOpen;
  }

  closeMoreOptionsMenu(): void {
    this.moreOptionsMenuOpen = false;
  }

  isColumnVisible(columnKey: string): boolean {
    const column = this.activeColumnOptions.find((option) => option.key === columnKey);
    return column?.visibility !== 'internal' && !this.currentHiddenColumns.has(columnKey);
  }

  openColumnPanel(): void {
    this.draftHiddenColumns = new Set(this.currentHiddenColumns);
    this.moreOptionsMenuOpen = false;
    this.columnPanelOpen = true;
  }

  closeColumnPanel(): void {
    this.columnPanelOpen = false;
  }

  isDraftColumnVisible(columnKey: string): boolean {
    return !this.draftHiddenColumns.has(columnKey);
  }

  toggleDraftColumnVisibility(columnKey: string, event: Event): void {
    event.stopPropagation();

    if (!this.draftHiddenColumns.has(columnKey) && this.selectableColumnOptions.filter((column) => !this.draftHiddenColumns.has(column.key)).length <= 1) {
      (event.target as HTMLInputElement).checked = true;
      return;
    }

    if (this.draftHiddenColumns.has(columnKey)) {
      this.draftHiddenColumns.delete(columnKey);
    } else {
      this.draftHiddenColumns.add(columnKey);
    }
  }

  toggleAllDraftColumns(event: Event): void {
    if ((event.target as HTMLInputElement).checked) {
      this.draftHiddenColumns = new Set<string>();
      return;
    }

    const [, ...remainingColumns] = this.selectableColumnOptions;
    this.draftHiddenColumns = new Set(remainingColumns.map((column) => column.key));
  }

  applyColumnPanel(): void {
    if (this.activeTab === 'documents') {
      this.hiddenDocumentColumns = new Set(this.draftHiddenColumns);
    } else {
      this.hiddenRecordColumns = new Set(this.draftHiddenColumns);
    }

    this.closeColumnPanel();
  }

  closeFieldsMenu(): void {
    this.fieldsMenuOpen = false;
  }

  selectFieldsMenuOption(option: string): void {
    console.log('Campo seleccionado:', option);
    this.closeFieldsMenu();
  }

  closeFavoriteMenu(): void {
    this.favoriteMenuOpen = false;
  }

  selectFavoriteOption(option: 'observed' | 'save-search'): void {
    console.log('Opcion de favoritos:', option);
    this.closeFavoriteMenu();
  }

  onCreateDocumentAccepted(selection?: CreateDocumentAccepted): void {
    this.closeCreateDocumentPopover();
    this.closeFloatingPanels();
    void this.router.navigate([selection?.route || ADJUSTMENT_SEAT_REQUEST_ROUTE]);
  }

  openDocumentHistory(row: DocumentRow): void {
    this.closeFloatingPanels();
    this.createDocumentPopoverOpen = false;
    this.customFilterOpen = false;
    this.fieldsMenuOpen = false;
    this.favoriteMenuOpen = false;
    this.statusFilterMenuOpen = false;
    this.actionTypeFilterMenuOpen = false;
    this.selectedHistorySummary = {
      document: row.document,
      number: row.number,
      actionType: row.actionType
    };
    this.documentHistoryOpen = true;
  }

  openRecordHistory(row: RecordRow): void {
    this.closeFloatingPanels();
    this.createDocumentPopoverOpen = false;
    this.customFilterOpen = false;
    this.favoriteMenuOpen = false;
    this.statusFilterMenuOpen = false;
    this.actionTypeFilterMenuOpen = false;
    this.selectedHistorySummary = {
      document: ADJUSTMENT_SEAT_REQUEST_LABEL,
      number: row.accountingDocument,
      actionType: 'Creación'
    };
    this.documentHistoryOpen = true;
  }

  closeDocumentHistory(): void {
    this.documentHistoryOpen = false;
  }

  openSidebarCreateDocument(): void {
    this.mobileNavigationOpen = false;
    this.createDocumentPopoverOpen = false;
    this.customFilterOpen = false;
    this.fieldsMenuOpen = false;
    this.favoriteMenuOpen = false;
    this.statusFilterMenuOpen = false;
    this.actionTypeFilterMenuOpen = false;
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
      this.createDocumentPopoverOpen = false;
      this.customFilterOpen = false;
      this.fieldsMenuOpen = false;
      this.favoriteMenuOpen = false;
      this.statusFilterMenuOpen = false;
      this.actionTypeFilterMenuOpen = false;
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
    this.sidebarCreateDocumentOpen = false;
  }

  get hasFloatingPanel(): boolean {
    return this.processMenuOpen || this.trayMenuOpen || this.sidebarCreateDocumentOpen;
  }

  onCreateDocumentFieldChange(selection: CreateDocumentSelection): void {
    if (selection.placeholder === 'Documento') {
      this.createDocumentDocument = selection.value;
      return;
    }

    if (selection.placeholder === 'Tipo de acción') {
      this.createDocumentActionType = selection.value;
    }
  }

  onRowsPerPageChange(value: number): void {
    this.rowsPerPage = value;
    this.page = 1;
  }

  onCustomFilterApply(event: CustomFilterApplyEvent): void {
    const nextFilters = event.filters.map((filter, index) => ({
      id: this.editingCustomFilterId && index === 0 ? this.editingCustomFilterId : this.createCustomFilterId(),
      campo: filter.campo as keyof DocumentRow,
      campoLabel: this.getFilterCampoLabel(filter.campo),
      condicion: filter.condicion,
      valor: filter.valor
    }));

    if (this.editingCustomFilterId) {
      const updatedFilters = this.appliedCustomFilters.map((filter) =>
        filter.id === this.editingCustomFilterId ? nextFilters[0] : filter
      );
      this.appliedCustomFilters = [...updatedFilters, ...nextFilters.slice(1)];
    } else {
      this.appliedCustomFilters = [...this.appliedCustomFilters, ...nextFilters];
    }

    this.page = 1;
    this.closeCustomFilter();
  }

  clearCustomAppliedFilter(id: string, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.appliedCustomFilters = this.appliedCustomFilters.filter((filter) => filter.id !== id);
    this.page = 1;
  }

  deleteEditingCustomFilter(): void {
    if (!this.editingCustomFilterId) {
      return;
    }

    this.appliedCustomFilters = this.appliedCustomFilters.filter((filter) => filter.id !== this.editingCustomFilterId);
    this.page = 1;
    this.closeCustomFilter();
  }

  private getFilterCampoLabel(campo: string): string {
    return this.filterCampoOptions.find((option) => option.value === campo)?.label ?? campo;
  }

  private createCustomFilterId(): string {
    this.customFilterSequence += 1;
    return `custom-filter-${this.customFilterSequence}`;
  }

  private formatDocumentNumbers(numbers: string[]): string {
    if (numbers.length <= 1) {
      return numbers[0] ?? '';
    }

    if (numbers.length === 2) {
      return `${numbers[0]} y ${numbers[1]}`;
    }

    return `${numbers.slice(0, -1).join(', ')} y ${numbers[numbers.length - 1]}`;
  }

  private matchesCustomFilter(row: DocumentRow, filter: AppliedCustomFilter): boolean {
    const rowValue = String(row[filter.campo] ?? '').toLocaleLowerCase();
    const filterValue = filter.valor.toLocaleLowerCase();

    if (filter.condicion === 'neq') {
      return rowValue !== filterValue;
    }

    if (filter.condicion === 'contains') {
      return rowValue.includes(filterValue);
    }

    if (filter.condicion === 'not_contains') {
      return !rowValue.includes(filterValue);
    }

    if (filter.condicion === 'starts_with') {
      return rowValue.startsWith(filterValue);
    }

    if (filter.condicion === 'ends_with') {
      return rowValue.endsWith(filterValue);
    }

    return rowValue === filterValue;
  }

  private isDesktopViewport(): boolean {
    return typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;
  }
}
