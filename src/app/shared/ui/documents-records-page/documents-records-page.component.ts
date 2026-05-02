import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { SidebarComponent, SidebarNavigation } from '../../../layout/sidebar/sidebar.component';
import { BreadcrumbComponent } from '../../components/breadcrumb/breadcrumb.component';
import { CustomFilterApplyEvent, CustomFilterComponent, FilterRow } from '../../components/custom-filter/custom-filter.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import type { DocumentsRecordsColumn, DocumentsRecordsConfig, DocumentsRecordsRow, DocumentsRecordsTab } from '../../types/documents-records.types';
import { ButtonComponent } from '../button/button.component';
import { CreateDocumentAccepted, CreateDocumentComponent, CreateDocumentField, CreateDocumentSelection } from '../create-document/create-document.component';
import { DocumentHistoryPanelComponent, DocumentHistorySummary } from '../document-history-panel/document-history-panel.component';
import { IconComponent } from '../icon/icon.component';
import { MobileNavigationMenuComponent } from '../mobile-navigation-menu/mobile-navigation-menu.component';
import { ModalComponent } from '../modal/modal.component';
import { ProcessMenuNode, ProcessMenuTreeComponent } from '../process-menu-tree/process-menu-tree.component';
import { SnackbarComponent } from '../snackbar/snackbar.component';
import { TrayDocumentsViewComponent } from '../tray-documents-view/tray-documents-view.component';
import { TrayMenuComponent } from '../tray-menu/tray-menu.component';

type AppliedCustomFilter = {
  id: string;
  campo: string;
  campoLabel: string;
  condicion: string;
  valor: string;
};

@Component({
  selector: 'siaf-documents-records-page',
  standalone: true,
  imports: [BreadcrumbComponent, ButtonComponent, CreateDocumentComponent, CustomFilterComponent, DocumentHistoryPanelComponent, IconComponent, MobileNavigationMenuComponent, ModalComponent, NavbarComponent, NgClass, PaginationComponent, ProcessMenuTreeComponent, RouterLink, SidebarComponent, SnackbarComponent, TrayDocumentsViewComponent, TrayMenuComponent],
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
          <siaf-create-document [processOptions]="config.createDocumentOptions" (accepted)="onCreateDocumentAccepted($event)" (canceled)="closeFloatingPanels()" />
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
          <span>Las solicitudes de tipo creación número </span>
          <strong class="font-bold">{{ approvalSnackbarNumbers }}</strong>
          <span> se han </span>
          <strong class="font-bold">aprobado</strong>
          <span> con éxito.</span>
        </siaf-snackbar>
      </div>

      @if (trayContentOpen) {
        <section class="min-w-0 transition-[padding] duration-200 lg:pl-16" [class.lg:pl-[364px]]="trayMenuOpen" [class.lg:pl-[434px]]="processMenuOpen || sidebarCreateDocumentOpen">
          <siaf-tray-documents-view [title]="selectedTrayItem" />
        </section>
      } @else {
        <section class="min-w-0 transition-[padding] duration-200 lg:pl-16" [class.lg:pl-[364px]]="trayMenuOpen" [class.lg:pl-[434px]]="processMenuOpen || sidebarCreateDocumentOpen">
          <section class="bg-surface">
            <siaf-breadcrumb class="block" [items]="config.breadcrumbs" />

            <header class="flex min-h-[72px] flex-col gap-siaf-sm px-siaf-md pb-siaf-xs pt-siaf-sm md:flex-row md:items-start md:justify-between">
              <div class="min-w-0">
                <h1 class="m-0 text-sm font-bold uppercase leading-normal text-text">{{ config.title }}</h1>
                <p class="m-0 text-[10px] font-medium uppercase leading-normal tracking-[0.66px] text-text-muted">Documentos y registros</p>
              </div>

              <div class="relative shrink-0">
                <siaf-button variant="accent" icon="add" (click)="toggleCreateDocumentPopover()">Crear documento</siaf-button>

                @if (createDocumentPopoverOpen) {
                  <button class="fixed inset-0 z-20 cursor-default bg-transparent" type="button" aria-label="Cerrar crear documento" (click)="closeCreateDocumentPopover()"></button>
                  <div class="absolute right-0 top-12 z-30 w-[min(360px,calc(100vw-32px))]" (click)="$event.stopPropagation()">
                    <siaf-create-document
                      variant="dropdown"
                      [processOptions]="config.createDocumentOptions"
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
              <button class="relative h-10 px-siaf-sm text-sm transition hover:text-brand-primary" type="button" [class.font-bold]="activeTab === 'documents'" [class.font-normal]="activeTab !== 'documents'" [class.text-brand-primary]="activeTab === 'documents'" [class.text-text-muted]="activeTab !== 'documents'" (click)="selectTab('documents')">
                Documentos
                @if (activeTab === 'documents') { <span class="absolute bottom-0 left-0 right-0 h-0.5 rounded-t bg-brand-primary"></span> }
              </button>
              <button class="relative h-10 px-siaf-sm text-sm transition hover:text-brand-primary" type="button" [class.font-bold]="activeTab === 'records'" [class.font-normal]="activeTab !== 'records'" [class.text-brand-primary]="activeTab === 'records'" [class.text-text-muted]="activeTab !== 'records'" (click)="selectTab('records')">
                Registros
                @if (activeTab === 'records') { <span class="absolute bottom-0 left-0 right-0 h-0.5 rounded-t bg-brand-primary"></span> }
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
                      <button class="inline-flex size-10 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-dark-pressed)]" type="button" aria-label="Campos" [class.bg-surface-muted]="fieldsMenuOpen" (click)="toggleFieldsMenu()">
                        <siaf-icon name="layers" [size]="24" />
                      </button>
                      @if (fieldsMenuOpen) {
                        <button class="fixed inset-0 z-20 cursor-default bg-transparent" type="button" aria-label="Cerrar campos" (click)="closeFieldsMenu()"></button>
                        <div class="absolute right-0 top-12 z-30 w-[248px] overflow-hidden rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-highest,white)] py-siaf-xs shadow-[0_8px_10px_rgba(0,0,0,0.14),0_3px_14px_rgba(0,0,0,0.12),0_5px_5px_rgba(0,0,0,0.2)]" (click)="$event.stopPropagation()">
                          @for (option of config.fieldsMenuOptions; track option.label) {
                            <button class="flex min-h-8 w-full items-center gap-siaf-md px-siaf-md py-siaf-xxs text-left text-sm font-normal leading-normal text-[var(--sys-color-text-neutral-medium)] transition hover:bg-[var(--sys-color-bg-states-light-hover,rgba(32,32,32,0.04))]" type="button" (click)="selectFieldsMenuOption(option.label)">
                              <span class="min-w-0 flex-1">{{ option.label }}</span>
                              @if (option.hasChildren) { <siaf-icon name="chevron_right" [size]="24" /> }
                            </button>
                          }
                        </div>
                      }
                    </div>

                    <div class="relative">
                      <button class="inline-flex size-10 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-dark-pressed)]" type="button" aria-label="Favorito" [class.bg-surface-muted]="favoriteMenuOpen" (click)="toggleFavoriteMenu()">
                        <siaf-icon name="star_border" [size]="24" />
                      </button>
                      @if (favoriteMenuOpen) {
                        <button class="fixed inset-0 z-20 cursor-default bg-transparent" type="button" aria-label="Cerrar favoritos" (click)="closeFavoriteMenu()"></button>
                        <div class="absolute right-0 top-12 z-30 w-[248px] overflow-hidden rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-highest,white)] py-siaf-xs shadow-[0_8px_10px_rgba(0,0,0,0.14),0_3px_14px_rgba(0,0,0,0.12),0_5px_5px_rgba(0,0,0,0.2)]" (click)="$event.stopPropagation()">
                          <button class="flex min-h-8 w-full items-center px-siaf-md py-siaf-xxs text-left text-sm font-normal leading-normal text-[var(--sys-color-text-neutral-medium)] transition hover:bg-[var(--sys-color-bg-states-light-hover,rgba(32,32,32,0.04))]" type="button" (click)="selectFavoriteOption('observed')">Solicitudes observadas</button>
                          <div class="h-px w-full bg-[var(--sys-color-divider-default,rgba(32,32,32,0.12))]"></div>
                          <button class="flex min-h-8 w-full items-center px-siaf-md py-siaf-xxs text-left text-sm font-normal leading-normal text-[var(--sys-color-text-neutral-medium)] transition hover:bg-[var(--sys-color-bg-states-light-hover,rgba(32,32,32,0.04))]" type="button" (click)="selectFavoriteOption('save-search')">Guardar búsqueda actual</button>
                        </div>
                      }
                    </div>

                    <div class="relative">
                      <button class="inline-flex size-10 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-dark-pressed)]" type="button" aria-label="Mas opciones" [class.bg-surface-muted]="moreOptionsMenuOpen" (click)="toggleMoreOptionsMenu()">
                        <siaf-icon name="more_vert" [size]="24" />
                      </button>
                      @if (moreOptionsMenuOpen) {
                        <button class="fixed inset-0 z-20 cursor-default bg-transparent" type="button" aria-label="Cerrar mas opciones" (click)="closeMoreOptionsMenu()"></button>
                        <div class="absolute right-0 top-12 z-30 w-[280px] overflow-hidden rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-highest,white)] py-siaf-xs shadow-[0_8px_10px_rgba(0,0,0,0.14),0_3px_14px_rgba(0,0,0,0.12),0_5px_5px_rgba(0,0,0,0.2)]" (click)="$event.stopPropagation()">
                          <button class="flex min-h-8 w-full items-center px-siaf-md py-siaf-xxs text-left text-sm font-normal leading-normal text-[var(--sys-color-text-neutral-medium)] transition hover:bg-[var(--sys-color-bg-states-light-hover,rgba(32,32,32,0.04))]" type="button" (click)="openColumnPanel()">Ocultar o mostrar columnas</button>
                        </div>
                      }
                    </div>
                  </div>
                </div>

                <div class="flex flex-wrap items-center gap-siaf-xs">
                  <div class="relative">
                    @if (selectedStatusFilter) {
                      <button class="inline-flex h-8 items-center gap-siaf-xs overflow-hidden rounded-siaf-md border border-[var(--sys-color-border-states-active)] bg-[var(--sys-color-bg-states-light-selected,rgba(1,72,153,0.08))] px-siaf-xs py-siaf-xxs text-sm font-normal leading-normal tracking-[0.025px] text-[var(--sys-color-text-neutral-activated)] transition hover:bg-[var(--sys-color-bg-states-light-hover,rgba(32,32,32,0.04))]" type="button" aria-label="Filtro de estado seleccionado" (click)="toggleStatusFilterMenu()">
                        <siaf-icon name="check" [size]="20" />
                        Estado: {{ selectedStatusFilter }}
                        <span class="inline-flex size-5 items-center justify-center rounded-siaf-sm" role="button" tabindex="0" aria-label="Quitar filtro de estado" (click)="clearStatusFilter($event)" (keydown.enter)="clearStatusFilter($event)" (keydown.space)="clearStatusFilter($event)">
                          <siaf-icon name="close" [size]="20" />
                        </span>
                      </button>
                    } @else {
                      <button class="inline-flex h-8 items-center gap-siaf-xs rounded-siaf-md border border-[var(--sys-color-border-states-enabled,rgba(32,32,32,0.4))] bg-surface px-siaf-sm text-sm font-normal leading-normal tracking-[0.025px] text-text transition hover:bg-surface-muted" type="button" aria-label="Seleccionar estado" [class.bg-surface-muted]="statusFilterMenuOpen" (click)="toggleStatusFilterMenu()">
                        Estado
                        <siaf-icon [name]="statusFilterMenuOpen ? 'expand_less' : 'expand_more'" [size]="20" />
                      </button>
                    }
                    @if (statusFilterMenuOpen) {
                      <button class="fixed inset-0 z-20 cursor-default bg-transparent" type="button" aria-label="Cerrar estados" (click)="closeStatusFilterMenu()"></button>
                      <div class="absolute left-0 top-10 z-30 w-[220px] overflow-hidden rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-highest,white)] py-siaf-xs shadow-[0_8px_10px_rgba(0,0,0,0.14),0_3px_14px_rgba(0,0,0,0.12),0_5px_5px_rgba(0,0,0,0.2)]" (click)="$event.stopPropagation()">
                        @for (option of config.statusFilterOptions; track option) {
                          <button class="flex min-h-8 w-full items-center px-siaf-md py-siaf-xxs text-left text-sm font-normal leading-normal text-[var(--sys-color-text-neutral-medium)] transition hover:bg-[var(--sys-color-bg-states-light-hover,rgba(32,32,32,0.04))]" type="button" (click)="selectStatusFilter(option)">{{ option }}</button>
                        }
                      </div>
                    }
                  </div>

                  <div class="relative">
                    @if (selectedActionTypeFilter) {
                      <button class="inline-flex h-8 items-center gap-siaf-xs overflow-hidden rounded-siaf-md border border-[var(--sys-color-border-states-active)] bg-[var(--sys-color-bg-states-light-selected,rgba(1,72,153,0.08))] px-siaf-xs py-siaf-xxs text-sm font-normal leading-normal tracking-[0.025px] text-[var(--sys-color-text-neutral-activated)] transition hover:bg-[var(--sys-color-bg-states-light-hover,rgba(32,32,32,0.04))]" type="button" aria-label="Filtro de tipo de accion seleccionado" (click)="toggleActionTypeFilterMenu()">
                        <siaf-icon name="check" [size]="20" />
                        Tipo de acción: {{ selectedActionTypeFilter }}
                        <span class="inline-flex size-5 items-center justify-center rounded-siaf-sm" role="button" tabindex="0" aria-label="Quitar filtro de tipo de accion" (click)="clearActionTypeFilter($event)" (keydown.enter)="clearActionTypeFilter($event)" (keydown.space)="clearActionTypeFilter($event)">
                          <siaf-icon name="close" [size]="20" />
                        </span>
                      </button>
                    } @else {
                      <button class="inline-flex h-8 items-center gap-siaf-xs rounded-siaf-md border border-[var(--sys-color-border-states-enabled,rgba(32,32,32,0.4))] bg-surface px-siaf-sm text-sm font-normal leading-normal tracking-[0.025px] text-text transition hover:bg-surface-muted" type="button" aria-label="Seleccionar tipo de accion" [class.bg-surface-muted]="actionTypeFilterMenuOpen" (click)="toggleActionTypeFilterMenu()">
                        Tipo de acción
                        <siaf-icon [name]="actionTypeFilterMenuOpen ? 'expand_less' : 'expand_more'" [size]="20" />
                      </button>
                    }
                    @if (actionTypeFilterMenuOpen) {
                      <button class="fixed inset-0 z-20 cursor-default bg-transparent" type="button" aria-label="Cerrar tipos de accion" (click)="closeActionTypeFilterMenu()"></button>
                      <div class="absolute left-0 top-10 z-30 w-[220px] overflow-hidden rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-highest,white)] py-siaf-xs shadow-[0_8px_10px_rgba(0,0,0,0.14),0_3px_14px_rgba(0,0,0,0.12),0_5px_5px_rgba(0,0,0,0.2)]" (click)="$event.stopPropagation()">
                        @for (option of config.actionTypeFilterOptions; track option) {
                          <button class="flex min-h-8 w-full items-center px-siaf-md py-siaf-xxs text-left text-sm font-normal leading-normal text-[var(--sys-color-text-neutral-medium)] transition hover:bg-[var(--sys-color-bg-states-light-hover,rgba(32,32,32,0.04))]" type="button" (click)="selectActionTypeFilter(option)">{{ option }}</button>
                        }
                      </div>
                    }
                  </div>

                  @for (filter of appliedCustomFilters; track filter.id) {
                    <button class="inline-flex h-8 items-center gap-siaf-xs overflow-hidden rounded-siaf-md border border-[var(--sys-color-border-states-active)] bg-[var(--sys-color-bg-states-light-selected,rgba(1,72,153,0.08))] px-siaf-xs py-siaf-xxs text-sm font-normal leading-normal tracking-[0.025px] text-[var(--sys-color-text-neutral-activated)] transition hover:bg-[var(--sys-color-bg-states-light-hover,rgba(32,32,32,0.04))]" type="button" aria-label="Filtro personalizado aplicado" (click)="editCustomAppliedFilter(filter)">
                      <siaf-icon name="bolt" [size]="20" />
                      {{ filter.campoLabel }}: {{ filter.valor }}
                      <span class="inline-flex size-5 items-center justify-center rounded-siaf-sm" role="button" tabindex="0" aria-label="Quitar filtro personalizado" (click)="clearCustomAppliedFilter(filter.id, $event)" (keydown.enter)="clearCustomAppliedFilter(filter.id, $event)" (keydown.space)="clearCustomAppliedFilter(filter.id, $event)">
                        <siaf-icon name="close" [size]="20" />
                      </span>
                    </button>
                  }

                  <button class="inline-flex size-8 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-dark-pressed)]" type="button" aria-label="Agregar filtro" [class.bg-surface-muted]="customFilterOpen" (click)="openCustomFilterForCreate()">
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

              <div class="min-w-0 overflow-x-auto">
                <table class="w-full border-collapse text-left text-sm" [ngClass]="activeTab === 'documents' ? config.documentTableMinWidthClass : config.recordTableMinWidthClass">
                  <thead>
                    <tr class="bg-surface-high text-[10px] font-bold uppercase text-text">
                      <th class="w-10 rounded-l-siaf-sm px-siaf-sm py-siaf-sm"></th>
                      @for (column of visibleColumns; track column.key) {
                        <th class="px-siaf-md py-siaf-sm" [ngClass]="[column.widthClass || 'w-[180px]', column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left']">{{ column.label }}</th>
                      }
                      <th class="sticky right-0 w-14 rounded-r-siaf-sm border-l border-[var(--sys-color-divider-strong)] bg-surface-high px-siaf-sm py-siaf-sm shadow-[-4px_0_8px_rgba(0,0,0,0.08)]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of visibleRows; track rowTrackValue(row, $index)) {
                      <tr class="border-b border-[var(--sys-color-divider-default,rgba(32,32,32,0.12))] bg-surface hover:bg-[rgba(1,72,153,0.04)]" [class.h-12]="activeTab === 'records'">
                        <td class="h-[58px] px-siaf-sm py-siaf-xs">
                          <input class="size-4 accent-brand-primary" type="checkbox" [checked]="row.selected" (change)="toggleRowSelection(row, $event)" />
                        </td>
                        @for (column of visibleColumns; track column.key) {
                          <td class="px-siaf-md py-siaf-sm" [ngClass]="[column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left', column.kind === 'document-link' ? 'max-w-[360px]' : '']">
                            @if (column.kind === 'document-link') {
                              <a class="line-clamp-2 text-sm leading-normal text-text hover:text-brand-primary" [routerLink]="documentRoute(row)">{{ row[column.key] }}</a>
                            } @else if (column.kind === 'flow-status') {
                              <span class="inline-flex min-h-6 items-center rounded-siaf-sm px-siaf-xs text-xs text-white" [class.bg-[var(--sys-color-bg-status-flow-status-elaborado)]]="row[column.key] === 'Elaborado'" [class.bg-[var(--sys-color-bg-status-flow-status-verificado)]]="row[column.key] === 'Verificado'">{{ row[column.key] }}</span>
                            } @else if (column.kind === 'record-status') {
                              <span class="inline-flex min-h-6 items-center gap-siaf-xs rounded-siaf-sm border border-[var(--sys-color-border-feedback-info)] bg-[var(--sys-color-bg-status-record-status-activo)] px-siaf-xs text-[var(--sys-color-text-feedback-info)]">
                                <siaf-icon name="check_circle" [size]="16" />
                                {{ row[column.key] }}
                              </span>
                            } @else {
                              {{ row[column.key] }}
                            }
                          </td>
                        }
                        <td class="sticky right-0 border-l border-[var(--sys-color-divider-strong)] bg-surface px-siaf-sm py-siaf-xs shadow-[-4px_0_8px_rgba(0,0,0,0.08)]">
                          <button class="inline-flex size-8 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-dark-pressed)]" type="button" aria-label="Historial de documento" title="Historial de documento" (click)="openHistory(row)">
                            <siaf-icon name="history" [size]="20" />
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

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
                  [campoOptions]="config.filterCampoOptions"
                  [condicionOptions]="filterCondicionOptions"
                  [valorOptions]="config.filterValorOptions"
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
export class DocumentsRecordsPageComponent implements OnChanges {
  @Input({ required: true }) config!: DocumentsRecordsConfig;

  activeNavigation: SidebarNavigation = 'Proceso';
  activeTab: DocumentsRecordsTab = 'documents';
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
  createDocumentDocument = '';
  createDocumentActionType = '';
  documentRows: DocumentsRecordsRow[] = [];
  recordRows: DocumentsRecordsRow[] = [];
  hiddenDocumentColumns = new Set<string>();
  hiddenRecordColumns = new Set<string>();
  draftHiddenColumns = new Set<string>();
  selectedHistorySummary: DocumentHistorySummary = { document: '', number: '', actionType: '' };
  readonly rowsPerPageOptions = [10, 25, 50, 100];
  readonly filterCondicionOptions = [
    { label: 'Es igual a', value: 'eq' },
    { label: 'No es igual a', value: 'neq' },
    { label: 'Contiene', value: 'contains' },
    { label: 'No contiene', value: 'not_contains' },
    { label: 'Empieza con', value: 'starts_with' },
    { label: 'Termina con', value: 'ends_with' }
  ];
  private customFilterSequence = 0;
  rowsPerPage = 25;
  page = 1;

  constructor(private readonly router: Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['config'] || !this.config) {
      return;
    }

    this.documentRows = this.config.documentRows.map((row) => ({ ...row }));
    this.recordRows = this.config.recordRows.map((row) => ({ ...row }));
    this.hiddenDocumentColumns = new Set(this.config.documentColumns.filter((column) => column.visibility !== 'visible').map((column) => column.key));
    this.hiddenRecordColumns = new Set(this.config.recordColumns.filter((column) => column.visibility !== 'visible').map((column) => column.key));
    this.selectedHistorySummary = {
      document: String(this.documentRows[0]?.['document'] ?? this.config.recordHistoryDocumentLabel),
      number: String(this.documentRows[0]?.['number'] ?? ''),
      actionType: String(this.documentRows[0]?.['actionType'] ?? '')
    };
  }

  get filteredRows(): DocumentsRecordsRow[] {
    return this.documentRows.filter((row) => {
      const matchesStatus = !this.selectedStatusFilter || row['status'] === this.selectedStatusFilter;
      const matchesActionType = !this.selectedActionTypeFilter || row['actionType'] === this.selectedActionTypeFilter;
      const matchesCustomFilters = this.appliedCustomFilters.every((filter) => this.matchesCustomFilter(row, filter));
      return matchesStatus && matchesActionType && matchesCustomFilters;
    });
  }

  get visibleRows(): DocumentsRecordsRow[] {
    return this.activeTab === 'documents' ? this.filteredRows : this.recordRows;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.visibleRows.length / this.rowsPerPage));
  }

  get canVerifySelectedDocuments(): boolean {
    return this.documentRows.some((row) => row.selected && row['status'] === 'Elaborado');
  }

  get activeColumnOptions(): DocumentsRecordsColumn[] {
    return this.activeTab === 'documents' ? this.config.documentColumns : this.config.recordColumns;
  }

  get visibleColumns(): DocumentsRecordsColumn[] {
    return this.activeColumnOptions.filter((column) => this.isColumnVisible(column.key));
  }

  get selectableColumnOptions(): DocumentsRecordsColumn[] {
    return this.activeColumnOptions.filter((column) => column.visibility !== 'internal');
  }

  get defaultColumnOptions(): DocumentsRecordsColumn[] {
    return this.selectableColumnOptions.filter((column) => column.group === 'default');
  }

  get moreColumnOptions(): DocumentsRecordsColumn[] {
    return this.selectableColumnOptions.filter((column) => column.group === 'more');
  }

  get internalColumnOptions(): DocumentsRecordsColumn[] {
    return this.activeColumnOptions.filter((column) => column.visibility === 'internal');
  }

  get allDraftColumnsSelected(): boolean {
    return this.selectableColumnOptions.every((column) => !this.draftHiddenColumns.has(column.key));
  }

  get columnsPanelDirty(): boolean {
    const hiddenColumns = this.currentHiddenColumns;
    return this.selectableColumnOptions.some((column) => hiddenColumns.has(column.key) !== this.draftHiddenColumns.has(column.key));
  }

  get verifyModalDescription(): string {
    return `Estás a punto de aprobar ${this.selectedElaboradoDocuments.length} solicitudes en simultáneo.`;
  }

  get createDocumentFields(): CreateDocumentField[] {
    return [
      {
        placeholder: 'Documento',
        type: 'select',
        required: true,
        value: this.createDocumentDocument,
        options: this.config.createDocumentOptions[0]?.documents ?? []
      },
      {
        placeholder: 'Tipo de acción',
        type: 'select',
        required: true,
        value: this.createDocumentActionType,
        options: this.createDocumentActionTypeOptions,
        disabled: !this.createDocumentDocument
      }
    ];
  }

  get createDocumentActionTypeOptions(): string[] {
    return this.config.createDocumentOptions[0]?.documentOptions?.find((document) => document.label === this.createDocumentDocument)?.actionTypes || this.config.createDocumentOptions[0]?.actionTypes || [];
  }

  get createDocumentAcceptDisabled(): boolean {
    return !this.createDocumentDocument || !this.createDocumentActionType;
  }

  private get currentHiddenColumns(): Set<string> {
    return this.activeTab === 'documents' ? this.hiddenDocumentColumns : this.hiddenRecordColumns;
  }

  private get selectedElaboradoDocuments(): DocumentsRecordsRow[] {
    return this.documentRows.filter((row) => row.selected && row['status'] === 'Elaborado');
  }

  selectTab(tab: DocumentsRecordsTab): void {
    this.activeTab = tab;
    this.page = 1;
    this.closeMoreOptionsMenu();
  }

  toggleRowSelection(row: DocumentsRecordsRow, event: Event): void {
    row.selected = (event.target as HTMLInputElement).checked;
  }

  rowTrackValue(row: DocumentsRecordsRow, index: number): string | number {
    const key = this.activeTab === 'documents' ? 'number' : this.config.recordTrackKey;
    return String(row[key] ?? index);
  }

  documentRoute(row: DocumentsRecordsRow): string {
    if (typeof row['linkRoute'] === 'string') {
      return row['linkRoute'];
    }

    const documentOption = this.config.createDocumentOptions[0]?.documentOptions?.find((document) => document.label === row['document']);
    return documentOption?.route || this.config.defaultRequestRoute;
  }

  openVerifyModal(): void {
    if (!this.canVerifySelectedDocuments) {
      return;
    }

    this.closeToolbarMenus();
    this.verifyModalOpen = true;
  }

  closeVerifyModal(): void {
    this.verifyModalOpen = false;
  }

  confirmVerifyModal(): void {
    const selectedRows = this.selectedElaboradoDocuments;
    this.approvalSnackbarNumbers = this.formatDocumentNumbers(selectedRows.map((row) => String(row['number'] ?? '')));
    selectedRows.forEach((row) => {
      row['status'] = 'Verificado';
      row.selected = false;
    });
    this.verifyModalOpen = false;
    this.approvalSnackbarOpen = selectedRows.length > 0;
  }

  closeApprovalSnackbar(): void {
    this.approvalSnackbarOpen = false;
  }

  toggleCreateDocumentPopover(): void {
    this.closeToolbarMenus();
    this.createDocumentPopoverOpen = !this.createDocumentPopoverOpen;
  }

  closeCreateDocumentPopover(): void {
    this.createDocumentPopoverOpen = false;
  }

  onCreateDocumentAccepted(selection?: CreateDocumentAccepted): void {
    this.closeCreateDocumentPopover();
    this.closeFloatingPanels();
    void this.router.navigate([selection?.route || this.config.defaultRequestRoute]);
  }

  onCreateDocumentFieldChange(selection: CreateDocumentSelection): void {
    if (selection.placeholder === 'Documento') {
      this.createDocumentDocument = selection.value;
      this.createDocumentActionType = '';
      return;
    }

    if (selection.placeholder === 'Tipo de acción') {
      this.createDocumentActionType = selection.value;
    }
  }

  openCustomFilterForCreate(): void {
    this.closeToolbarMenus();
    this.editingCustomFilterId = '';
    this.customFilterInitialRows = [];
    this.customFilterOpen = true;
  }

  editCustomAppliedFilter(filter: AppliedCustomFilter): void {
    this.closeToolbarMenus();
    this.editingCustomFilterId = filter.id;
    this.customFilterInitialRows = [{ campo: filter.campo, condicion: filter.condicion, valor: filter.valor }];
    this.customFilterOpen = true;
  }

  closeCustomFilter(): void {
    this.customFilterOpen = false;
    this.editingCustomFilterId = '';
    this.customFilterInitialRows = [];
  }

  onCustomFilterApply(event: CustomFilterApplyEvent): void {
    const nextFilters = event.filters.map((filter, index) => ({
      id: this.editingCustomFilterId && index === 0 ? this.editingCustomFilterId : this.createCustomFilterId(),
      campo: filter.campo,
      campoLabel: this.getFilterCampoLabel(filter.campo),
      condicion: filter.condicion,
      valor: filter.valor
    }));

    if (this.editingCustomFilterId) {
      const updatedFilters = this.appliedCustomFilters.map((filter) => filter.id === this.editingCustomFilterId ? nextFilters[0] : filter);
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

  toggleStatusFilterMenu(): void {
    this.closeToolbarMenus('status');
    this.statusFilterMenuOpen = !this.statusFilterMenuOpen;
  }

  closeStatusFilterMenu(): void {
    this.statusFilterMenuOpen = false;
  }

  selectStatusFilter(status: string): void {
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
    this.closeToolbarMenus('actionType');
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
    this.closeToolbarMenus('favorite');
    this.favoriteMenuOpen = !this.favoriteMenuOpen;
  }

  toggleFieldsMenu(): void {
    this.closeToolbarMenus('fields');
    this.fieldsMenuOpen = !this.fieldsMenuOpen;
  }

  toggleMoreOptionsMenu(): void {
    this.closeToolbarMenus('more');
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

  openHistory(row: DocumentsRecordsRow): void {
    this.closeToolbarMenus();
    this.selectedHistorySummary = {
      document: this.activeTab === 'documents' ? String(row['document'] ?? '') : this.config.recordHistoryDocumentLabel,
      number: String(row[this.activeTab === 'documents' ? 'number' : this.config.recordTrackKey] ?? ''),
      actionType: String(row['actionType'] ?? 'Creación')
    };
    this.documentHistoryOpen = true;
  }

  closeDocumentHistory(): void {
    this.documentHistoryOpen = false;
  }

  openSidebarCreateDocument(): void {
    this.mobileNavigationOpen = false;
    this.closeToolbarMenus();
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
      this.closeToolbarMenus();
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

  onRowsPerPageChange(value: number): void {
    this.rowsPerPage = value;
    this.page = 1;
  }

  private closeToolbarMenus(except: 'status' | 'actionType' | 'favorite' | 'fields' | 'more' | '' = ''): void {
    this.closeFloatingPanels();
    this.createDocumentPopoverOpen = false;
    this.customFilterOpen = false;
    this.fieldsMenuOpen = except === 'fields' ? this.fieldsMenuOpen : false;
    this.favoriteMenuOpen = except === 'favorite' ? this.favoriteMenuOpen : false;
    this.statusFilterMenuOpen = except === 'status' ? this.statusFilterMenuOpen : false;
    this.actionTypeFilterMenuOpen = except === 'actionType' ? this.actionTypeFilterMenuOpen : false;
    this.moreOptionsMenuOpen = except === 'more' ? this.moreOptionsMenuOpen : false;
  }

  private getFilterCampoLabel(campo: string): string {
    return this.config.filterCampoOptions.find((option) => option.value === campo)?.label ?? campo;
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

  private matchesCustomFilter(row: DocumentsRecordsRow, filter: AppliedCustomFilter): boolean {
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
