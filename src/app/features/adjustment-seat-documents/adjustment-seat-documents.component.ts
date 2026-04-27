import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { BreadcrumbComponent, BreadcrumbItem } from '../../shared/components/breadcrumb/breadcrumb.component';
import { CustomFilterApplyEvent, CustomFilterComponent, FilterRow } from '../../shared/components/custom-filter/custom-filter.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { CreateDocumentComponent, CreateDocumentField, CreateDocumentSelection } from '../../shared/ui/create-document/create-document.component';
import { DocumentHistoryPanelComponent, DocumentHistorySummary } from '../../shared/ui/document-history-panel/document-history-panel.component';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { MobileNavigationMenuComponent } from '../../shared/ui/mobile-navigation-menu/mobile-navigation-menu.component';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { ProcessMenuNode, ProcessMenuTreeComponent } from '../../shared/ui/process-menu-tree/process-menu-tree.component';
import { SidebarComponent, SidebarNavigation } from '../../layout/sidebar/sidebar.component';
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
};

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

@Component({
  selector: 'siaf-adjustment-seat-documents',
  standalone: true,
  imports: [BreadcrumbComponent, ButtonComponent, CreateDocumentComponent, CustomFilterComponent, DocumentHistoryPanelComponent, IconComponent, MobileNavigationMenuComponent, NavbarComponent, PaginationComponent, ProcessMenuTreeComponent, RouterLink, SidebarComponent, TrayDocumentsViewComponent, TrayMenuComponent],
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
          <siaf-create-document (accepted)="onCreateDocumentAccepted()" (canceled)="closeFloatingPanels()" />
        </div>
      }

      <siaf-document-history-panel
        [open]="documentHistoryOpen"
        [summary]="selectedHistorySummary"
        (closed)="closeDocumentHistory()"
      />

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
                    [fields]="createDocumentFields"
                    [acceptDisabled]="createDocumentAcceptDisabled"
                    (fieldValueChange)="onCreateDocumentFieldChange($event)"
                    (canceled)="closeCreateDocumentPopover()"
                    (accepted)="onCreateDocumentAccepted()"
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
                <siaf-button variant="secondary" icon="task_alt" [disabled]="true">Verificar</siaf-button>
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
                      class="inline-flex size-10 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[rgba(32,32,32,0.12)]"
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
                          <button class="flex min-h-8 w-full items-center gap-siaf-md px-siaf-md py-siaf-xxs text-left text-sm font-normal leading-normal text-[var(--sys-color-text-neutral-medium,#353537)] transition hover:bg-[var(--sys-color-bg-states-light-hover,rgba(32,32,32,0.04))]" type="button" (click)="selectFieldsMenuOption(option.label)">
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
                      class="inline-flex size-10 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[rgba(32,32,32,0.12)]"
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
                        <button class="flex min-h-8 w-full items-center px-siaf-md py-siaf-xxs text-left text-sm font-normal leading-normal text-[var(--sys-color-text-neutral-medium,#353537)] transition hover:bg-[var(--sys-color-bg-states-light-hover,rgba(32,32,32,0.04))]" type="button" (click)="selectFavoriteOption('observed')">
                          Solicitudes observadas
                        </button>
                        <div class="h-px w-full bg-[var(--sys-color-divider-default,rgba(32,32,32,0.12))]"></div>
                        <button class="flex min-h-8 w-full items-center px-siaf-md py-siaf-xxs text-left text-sm font-normal leading-normal text-[var(--sys-color-text-neutral-medium,#353537)] transition hover:bg-[var(--sys-color-bg-states-light-hover,rgba(32,32,32,0.04))]" type="button" (click)="selectFavoriteOption('save-search')">
                          Guardar b&uacute;squeda actual
                        </button>
                      </div>
                    }
                  </div>
                  <button class="inline-flex size-10 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[rgba(32,32,32,0.12)]" type="button" aria-label="Mas opciones">
                    <siaf-icon name="more_vert" [size]="24" />
                  </button>
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-siaf-xs">
                <div class="relative">
                  @if (selectedStatusFilter) {
                    <button
                      class="inline-flex h-8 items-center gap-siaf-xs overflow-hidden rounded-siaf-md border border-[var(--sys-color-border-states-active,#014899)] bg-[var(--sys-color-bg-states-light-selected,rgba(1,72,153,0.08))] px-siaf-xs py-siaf-xxs text-sm font-normal leading-normal tracking-[0.025px] text-[var(--sys-color-text-neutral-activated,#014899)] transition hover:bg-[var(--sys-color-bg-states-light-hover,rgba(32,32,32,0.04))]"
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
                        <button class="flex min-h-8 w-full items-center px-siaf-md py-siaf-xxs text-left text-sm font-normal leading-normal text-[var(--sys-color-text-neutral-medium,#353537)] transition hover:bg-[var(--sys-color-bg-states-light-hover,rgba(32,32,32,0.04))]" type="button" (click)="selectStatusFilter(option)">
                          {{ option }}
                        </button>
                      }
                    </div>
                  }
                </div>
                <div class="relative">
                  @if (selectedActionTypeFilter) {
                    <button
                      class="inline-flex h-8 items-center gap-siaf-xs overflow-hidden rounded-siaf-md border border-[var(--sys-color-border-states-active,#014899)] bg-[var(--sys-color-bg-states-light-selected,rgba(1,72,153,0.08))] px-siaf-xs py-siaf-xxs text-sm font-normal leading-normal tracking-[0.025px] text-[var(--sys-color-text-neutral-activated,#014899)] transition hover:bg-[var(--sys-color-bg-states-light-hover,rgba(32,32,32,0.04))]"
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
                        <button class="flex min-h-8 w-full items-center px-siaf-md py-siaf-xxs text-left text-sm font-normal leading-normal text-[var(--sys-color-text-neutral-medium,#353537)] transition hover:bg-[var(--sys-color-bg-states-light-hover,rgba(32,32,32,0.04))]" type="button" (click)="selectActionTypeFilter(option)">
                          {{ option }}
                        </button>
                      }
                    </div>
                  }
                </div>
                @for (filter of appliedCustomFilters; track filter.id) {
                  <button
                    class="inline-flex h-8 items-center gap-siaf-xs overflow-hidden rounded-siaf-md border border-[var(--sys-color-border-states-active,#014899)] bg-[var(--sys-color-bg-states-light-selected,rgba(1,72,153,0.08))] px-siaf-xs py-siaf-xxs text-sm font-normal leading-normal tracking-[0.025px] text-[var(--sys-color-text-neutral-activated,#014899)] transition hover:bg-[var(--sys-color-bg-states-light-hover,rgba(32,32,32,0.04))]"
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
                  class="inline-flex size-8 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[rgba(32,32,32,0.12)]"
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
                <table class="w-full min-w-[1010px] border-collapse text-left text-sm">
                  <thead>
                    <tr class="bg-[rgba(32,32,32,0.12)] text-[10px] font-bold uppercase text-text">
                      <th class="w-10 rounded-l-siaf-sm px-siaf-sm py-siaf-sm"></th>
                      <th class="w-[260px] px-siaf-md py-siaf-sm">Documento</th>
                      <th class="w-[100px] px-siaf-md py-siaf-sm">Número</th>
                      <th class="w-[130px] px-siaf-md py-siaf-sm">Tipo de acción</th>
                      <th class="w-[110px] px-siaf-md py-siaf-sm">Estado</th>
                      <th class="w-[120px] px-siaf-md py-siaf-sm">Sistema</th>
                      <th class="w-[130px] px-siaf-md py-siaf-sm">Fecha de re...</th>
                      <th class="w-[280px] px-siaf-md py-siaf-sm">Entidad</th>
                      <th class="sticky right-0 w-14 rounded-r-siaf-sm bg-[rgba(32,32,32,0.12)] px-siaf-sm py-siaf-sm"></th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of filteredRows; track row.number) {
                      <tr class="border-b border-[var(--sys-color-divider-default,rgba(32,32,32,0.12))] bg-surface hover:bg-[rgba(1,72,153,0.04)]">
                        <td class="h-[58px] px-siaf-sm py-siaf-xs"><input class="size-4 accent-brand-primary" type="checkbox" [checked]="row.selected" /></td>
                        <td class="max-w-[260px] px-siaf-md py-siaf-sm">
                          <a class="line-clamp-2 text-sm leading-normal text-text hover:text-brand-primary" routerLink="/procesos/registro-asiento-ajuste/formulario">{{ row.document }}</a>
                        </td>
                        <td class="px-siaf-md py-siaf-sm">{{ row.number }}</td>
                        <td class="px-siaf-md py-siaf-sm">{{ row.actionType }}</td>
                        <td class="px-siaf-md py-siaf-sm">
                          <span class="inline-flex min-h-6 items-center rounded-siaf-sm px-siaf-xs text-xs text-white" [class.bg-[var(--sys-color-bg-status-flow-status-elaborado)]]="row.status === 'Elaborado'" [class.bg-[var(--sys-color-bg-status-flow-status-verificado)]]="row.status === 'Verificado'">{{ row.status }}</span>
                        </td>
                        <td class="px-siaf-md py-siaf-sm">{{ row.system }}</td>
                        <td class="px-siaf-md py-siaf-sm">{{ row.date }}</td>
                        <td class="px-siaf-md py-siaf-sm">{{ row.entity }}</td>
                        <td class="sticky right-0 bg-surface px-siaf-sm py-siaf-xs shadow-[-4px_0_8px_rgba(0,0,0,0.08)]">
                          <button class="inline-flex size-8 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[rgba(32,32,32,0.12)]" type="button" aria-label="Historial de documento" title="Historial de documento" (click)="openDocumentHistory(row)">
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
                <table class="w-full min-w-[1010px] border-collapse text-left text-sm">
                  <thead>
                    <tr class="bg-[rgba(32,32,32,0.12)] text-[10px] font-bold uppercase text-text">
                      <th class="w-10 rounded-l-siaf-sm px-siaf-sm py-siaf-sm"></th>
                      <th class="w-[110px] px-siaf-md py-siaf-sm">Estado</th>
                      <th class="w-[150px] px-siaf-md py-siaf-sm">Doc conta.</th>
                      <th class="w-[180px] px-siaf-md py-siaf-sm">Ámbito institucional</th>
                      <th class="w-[190px] px-siaf-md py-siaf-sm">Código de clase de ajuste</th>
                      <th class="w-[190px] px-siaf-md py-siaf-sm">Código de detalle de a...</th>
                      <th class="w-[110px] px-siaf-md py-siaf-sm text-right">Total d...</th>
                      <th class="w-[110px] px-siaf-md py-siaf-sm text-right">Total h...</th>
                      <th class="sticky right-0 w-14 rounded-r-siaf-sm bg-[rgba(32,32,32,0.12)] px-siaf-sm py-siaf-sm"></th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of recordRows; track row.accountingDocument) {
                      <tr class="h-12 border-b border-[var(--sys-color-divider-default,rgba(32,32,32,0.12))] bg-surface hover:bg-[rgba(1,72,153,0.04)]">
                        <td class="px-siaf-sm py-siaf-xs"><input class="size-4 accent-brand-primary" type="checkbox" [checked]="row.selected" /></td>
                        <td class="px-siaf-md py-siaf-sm">
                          <span class="inline-flex min-h-6 items-center gap-siaf-xs rounded-siaf-sm border border-[var(--sys-color-border-feedback-info)] bg-[var(--sys-color-bg-status-record-status-activo)] px-siaf-xs text-[var(--sys-color-text-feedback-info)]">
                            <siaf-icon name="check_circle" [size]="16" />
                            {{ row.status }}
                          </span>
                        </td>
                        <td class="px-siaf-md py-siaf-sm">{{ row.accountingDocument }}</td>
                        <td class="px-siaf-md py-siaf-sm">{{ row.institutionalScope }}</td>
                        <td class="px-siaf-md py-siaf-sm">{{ row.adjustmentClassCode }}</td>
                        <td class="px-siaf-md py-siaf-sm">{{ row.adjustmentDetailCode }}</td>
                        <td class="px-siaf-md py-siaf-sm text-right">{{ row.totalDebit }}</td>
                        <td class="px-siaf-md py-siaf-sm text-right">{{ row.totalCredit }}</td>
                        <td class="sticky right-0 bg-surface px-siaf-sm py-siaf-xs shadow-[-4px_0_8px_rgba(0,0,0,0.08)]">
                          <button class="inline-flex size-8 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[rgba(32,32,32,0.12)]" type="button" aria-label="Historial de documento" title="Historial de documento" (click)="openRecordHistory(row)">
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
  selectedHistorySummary: DocumentHistorySummary = {
    document: 'Solicitud de registro de asiento de ajuste',
    number: '0004',
    actionType: 'Creación'
  };
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
    { label: 'Tesoreria', value: 'Tesoreria' }
  ];

  readonly fieldsMenuOptions = [
    { label: 'Documento' },
    { label: 'Tipo de acción' },
    { label: 'Estado' },
    { label: 'Sistema' },
    { label: 'Fecha de registro', hasChildren: true },
    { label: 'Entidad' }
  ];

  constructor(private readonly router: Router) {}

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Inicio', href: '/panel' },
    { label: 'Apertura contable', href: '#' },
    { label: 'Proceso de registro de asiento de ajuste', href: '#' },
    { label: 'Documentos y registros' }
  ];

  readonly rows: DocumentRow[] = [
    { document: 'Solicitud de registro de asiento de ajuste', number: '0004', actionType: 'Creación', status: 'Elaborado', system: 'Tesorería', date: '15/06/2024', entity: '009 - Ministerio de Economía y Finanzas' },
    { document: 'Solicitud de registro de asiento de ajuste', number: '0003', actionType: 'Creación', status: 'Verificado', system: 'Tesorería', date: '20/01/2024', entity: '009 - Ministerio de Economía y Finanzas' },
    { document: 'Solicitud de registro de asiento de ajuste', number: '0002', actionType: 'Creación', status: 'Verificado', system: 'Tesorería', date: '15/12/2023', entity: '009 - Ministerio de Economía y Finanzas' },
    { document: 'Solicitud de registro de asiento de ajuste', number: '0001', actionType: 'Creación', status: 'Elaborado', system: 'Tesorería', date: '20/11/2023', entity: '009 - Ministerio de Economía y Finanzas' }
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

  get createDocumentFields(): CreateDocumentField[] {
    return [
      {
        placeholder: 'Documento',
        type: 'select',
        required: true,
        value: this.createDocumentDocument,
        options: ['Solicitud de registro de asiento de ajuste']
      },
      {
        placeholder: 'Tipo de acción',
        type: 'select',
        required: true,
        value: this.createDocumentActionType,
        options: ['Creación', 'Reversión']
      }
    ];
  }

  get createDocumentAcceptDisabled(): boolean {
    return !this.createDocumentDocument || !this.createDocumentActionType;
  }

  selectTab(tab: ActiveTab): void {
    this.activeTab = tab;
    this.page = 1;
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

  onCreateDocumentAccepted(): void {
    this.closeCreateDocumentPopover();
    this.closeFloatingPanels();
    void this.router.navigate(['/procesos/registro-asiento-ajuste/solicitud']);
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
      document: 'Solicitud de registro de asiento de ajuste',
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
