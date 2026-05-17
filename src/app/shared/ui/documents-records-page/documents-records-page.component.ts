import { ChangeDetectionStrategy, Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { PermissionService } from '../../../core/auth/permission.service';
import type { UserRole } from '../../../core/auth/role.model';

import { BreadcrumbComponent } from '../../components/breadcrumb/breadcrumb.component';
import { CustomFilterApplyEvent, CustomFilterComponent, FilterRow } from '../../components/custom-filter/custom-filter.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { TableControlsComponent } from '../../components/table-controls/table-controls.component';
import type { DocumentsRecordsColumn, DocumentsRecordsConfig, DocumentsRecordsRow, DocumentsRecordsTab } from '../../types/documents-records.types';
import { AccountHistoryPanelComponent } from '../account-history-panel/account-history-panel.component';
import { ButtonComponent } from '../button/button.component';
import { ColumnVisibilityPanelComponent } from '../column-visibility-panel/column-visibility-panel.component';
import { CreateDocumentAccepted, CreateDocumentComponent, CreateDocumentField, CreateDocumentSelection } from '../../../layout/create-document/create-document.component';
import { DocumentHistoryPanelComponent, DocumentHistorySummary } from '../document-history-panel/document-history-panel.component';
import { DocumentsRecordsSelectionChange, DocumentsRecordsTableComponent } from '../documents-records-table/documents-records-table.component';
import { IconComponent } from '../icon/icon.component';
import { ModalComponent } from '../modal/modal.component';
import { SnackbarComponent } from '../snackbar/snackbar.component';

type AppliedCustomFilter = {
  id: string;
  campo: string;
  campoLabel: string;
  condicion: string;
  valor: string;
};

// Estados visibles para el APROBADOR (filtra Elaborado y Eliminado)
const ESTADOS_APROBADOR = ['Verificado', 'Aprobado', 'Observado', 'Rechazado'];
const ESTADOS_CREADOR = ['Elaborado', 'Verificado', 'Observado', 'Rechazado'];

type DocumentsRecordsRoleMode = 'creator' | 'approver' | 'readOnly';

@Component({
  selector: 'siaf-documents-records-page',
  standalone: true,
  imports: [AccountHistoryPanelComponent, BreadcrumbComponent, ButtonComponent, ColumnVisibilityPanelComponent, CreateDocumentComponent, CustomFilterComponent, DocumentHistoryPanelComponent, DocumentsRecordsTableComponent, IconComponent, ModalComponent, PaginationComponent, SnackbarComponent, TableControlsComponent],
  template: `
    <div class="min-h-[calc(100vh-56px)] bg-[var(--sys-color-bg-surfaces-surface-lowest)] text-text">
      <siaf-account-history-panel
        [open]="accountHistoryOpen"
        [record]="selectedAccountHistoryRecord"
        (closed)="closeAccountHistory()"
      />

      <siaf-document-history-panel
        [open]="documentHistoryOpen"
        [summary]="selectedHistorySummary"
        (closed)="closeDocumentHistory()"
      />

      <siaf-modal
        [open]="verifyModalOpen"
        variant="custom"
        title="¿Deseas verificar múltiples solicitudes?"
        [description]="verifyModalDescription"
        illustrationSrc="assets/figma/modals/approve-multiple.svg"
        confirmVariant="primary"
        confirmLabel="Aceptar"
        [showIllustration]="true"
        (canceled)="closeVerifyModal()"
        (closed)="closeVerifyModal()"
        (confirmed)="confirmVerifyModal()"
      />

      <siaf-modal
        [open]="approveModalOpen"
        variant="custom"
        title="¿Deseas aprobar múltiples solicitudes?"
        [description]="approveModalDescription"
        illustrationSrc="assets/figma/modals/approve-multiple.svg"
        confirmVariant="primary"
        confirmLabel="Aceptar"
        [showIllustration]="true"
        (canceled)="closeApproveModal()"
        (closed)="closeApproveModal()"
        (confirmed)="confirmApproveModal()"
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

        <section class="min-w-0">
          <section class="bg-surface">
            <siaf-breadcrumb class="block" [items]="effectiveConfig.breadcrumbs" />

            <header class="flex min-h-[72px] flex-col gap-siaf-sm px-siaf-md pb-siaf-xs pt-siaf-sm md:flex-row md:items-start md:justify-between">
              <div class="min-w-0">
                <h1 class="m-0 text-sm font-bold uppercase leading-normal text-text">{{ effectiveConfig.title }}</h1>
                <p class="m-0 text-[10px] font-medium uppercase leading-normal tracking-[0.66px] text-text-muted">Documentos y registros</p>
              </div>

              <div class="relative shrink-0">
                @if (effectiveConfig.createDocumentOptions.length) {
                <siaf-button variant="accent" icon="add" (click)="toggleCreateDocumentPopover()">Crear documento</siaf-button>

                @if (createDocumentPopoverOpen) {
                  <button class="fixed inset-0 z-20 cursor-default bg-transparent" type="button" aria-label="Cerrar crear documento" (click)="closeCreateDocumentPopover()"></button>
                  <div class="absolute right-0 top-12 z-30 w-[min(360px,calc(100vw-32px))] rounded-siaf-md shadow-siaf-elevation-1" (click)="$event.stopPropagation()">
                    <siaf-create-document
                      variant="dropdown"
                      [processOptions]="effectiveConfig.createDocumentOptions"
                      [fields]="createDocumentFields"
                      [acceptDisabled]="createDocumentAcceptDisabled"
                      (fieldValueChange)="onCreateDocumentFieldChange($event)"
                      (canceled)="closeCreateDocumentPopover()"
                      (accepted)="onCreateDocumentAccepted($event)"
                    />
                  </div>
                }
                }
              </div>
            </header>

            <nav class="flex h-10 items-end gap-siaf-md border-b border-[var(--sys-color-divider-default)] px-siaf-md">
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
                @if (activeTab === 'documents' && effectiveConfig.accionPrincipal) {
                  @if (effectiveConfig.accionPrincipal === 'aprobar') {
                    <siaf-button variant="primary" icon="check_circle" [disabled]="!canApproveSelectedDocuments" (click)="openApproveModal()">
                      Aprobar
                    </siaf-button>
                  } @else {
                    <siaf-button variant="primary" icon="task_alt" [disabled]="!canVerifySelectedDocuments" (click)="openVerifyModal()">Verificar</siaf-button>
                  }
                }
              </header>

              <div class="flex flex-col gap-siaf-md">
                <div class="flex flex-col gap-siaf-sm lg:flex-row lg:items-start">
                  <label class="flex h-10 min-w-0 flex-1 items-center rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface px-siaf-md">
                    <span class="sr-only">Buscar</span>
                    <input class="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-text-muted" placeholder="Buscar" [value]="searchTerm" (input)="onSearchChange(inputValue($event))" />
                  </label>

                  <div class="flex shrink-0 items-center justify-end gap-siaf-xs">
                    <div class="relative">
                      <button class="inline-flex size-10 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-dark-pressed)]" type="button" aria-label="Campos" [class.bg-surface-muted]="fieldsMenuOpen" (click)="toggleFieldsMenu()">
                        <siaf-icon name="layers" [size]="24" />
                      </button>
                      @if (fieldsMenuOpen) {
                        <button class="fixed inset-0 z-20 cursor-default bg-transparent" type="button" aria-label="Cerrar campos" (click)="closeFieldsMenu()"></button>
                        <div class="absolute right-0 top-12 z-30 w-[248px] overflow-hidden rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-highest,white)] py-siaf-xs shadow-siaf-elevation-1" (click)="$event.stopPropagation()">
                          @for (option of effectiveConfig.fieldsMenuOptions; track option.label) {
                            <button class="flex min-h-8 w-full items-center gap-siaf-md px-siaf-md py-siaf-xxs text-left text-sm font-normal leading-normal text-[var(--sys-color-text-neutral-medium)] transition hover:bg-[var(--sys-color-bg-states-light-hover)]" type="button" (click)="selectFieldsMenuOption(option.label)">
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
                        <div class="absolute right-0 top-12 z-30 w-[248px] overflow-hidden rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-highest,white)] py-siaf-xs shadow-siaf-elevation-1" (click)="$event.stopPropagation()">
                          <button class="flex min-h-8 w-full items-center px-siaf-md py-siaf-xxs text-left text-sm font-normal leading-normal text-[var(--sys-color-text-neutral-medium)] transition hover:bg-[var(--sys-color-bg-states-light-hover)]" type="button" (click)="selectFavoriteOption('observed')">Solicitudes observadas</button>
                          <div class="h-px w-full bg-[var(--sys-color-divider-default)]"></div>
                          <button class="flex min-h-8 w-full items-center px-siaf-md py-siaf-xxs text-left text-sm font-normal leading-normal text-[var(--sys-color-text-neutral-medium)] transition hover:bg-[var(--sys-color-bg-states-light-hover)]" type="button" (click)="selectFavoriteOption('save-search')">Guardar búsqueda actual</button>
                        </div>
                      }
                    </div>

                    <div class="relative">
                      <button class="inline-flex size-10 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-dark-pressed)]" type="button" aria-label="Mas opciones" [class.bg-surface-muted]="moreOptionsMenuOpen" (click)="toggleMoreOptionsMenu()">
                        <siaf-icon name="more_vert" [size]="24" />
                      </button>
                      @if (moreOptionsMenuOpen) {
                        <button class="fixed inset-0 z-20 cursor-default bg-transparent" type="button" aria-label="Cerrar mas opciones" (click)="closeMoreOptionsMenu()"></button>
                        <div class="absolute right-0 top-12 z-30 w-[280px] overflow-hidden rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-highest,white)] py-siaf-xs shadow-siaf-elevation-1" (click)="$event.stopPropagation()">
                          <button class="flex min-h-8 w-full items-center px-siaf-md py-siaf-xxs text-left text-sm font-normal leading-normal text-[var(--sys-color-text-neutral-medium)] transition hover:bg-[var(--sys-color-bg-states-light-hover)]" type="button" (click)="openColumnPanel()">Ocultar o mostrar columnas</button>
                        </div>
                      }
                    </div>
                  </div>
                </div>

                <div class="flex flex-wrap items-center gap-siaf-xs">
                  <div class="relative">
                    @if (selectedStatusFilter) {
                      <button class="inline-flex h-8 items-center gap-siaf-xs overflow-hidden rounded-siaf-md border border-[var(--sys-color-border-states-active)] bg-[var(--sys-color-bg-states-light-selected)] px-siaf-xs py-siaf-xxs text-sm font-normal leading-normal tracking-[0.025px] text-[var(--sys-color-text-neutral-activated)] transition hover:bg-[var(--sys-color-bg-states-light-hover)]" type="button" aria-label="Filtro de estado seleccionado" (click)="toggleStatusFilterMenu()">
                        <siaf-icon name="check" [size]="20" />
                        Estado: {{ selectedStatusFilter }}
                        <span class="inline-flex size-5 items-center justify-center rounded-siaf-sm" role="button" tabindex="0" aria-label="Quitar filtro de estado" (click)="clearStatusFilter($event)" (keydown.enter)="clearStatusFilter($event)" (keydown.space)="clearStatusFilter($event)">
                          <siaf-icon name="close" [size]="20" />
                        </span>
                      </button>
                    } @else {
                      <button class="inline-flex h-8 items-center gap-siaf-xs rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface px-siaf-sm text-sm font-normal leading-normal tracking-[0.025px] text-text transition hover:bg-surface-muted" type="button" aria-label="Seleccionar estado" [class.bg-surface-muted]="statusFilterMenuOpen" (click)="toggleStatusFilterMenu()">
                        Estado
                        <siaf-icon [name]="statusFilterMenuOpen ? 'expand_less' : 'expand_more'" [size]="20" />
                      </button>
                    }
                    @if (statusFilterMenuOpen) {
                      <button class="fixed inset-0 z-20 cursor-default bg-transparent" type="button" aria-label="Cerrar estados" (click)="closeStatusFilterMenu()"></button>
                      <div class="absolute left-0 top-10 z-30 w-[220px] overflow-hidden rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-highest,white)] py-siaf-xs shadow-siaf-elevation-1" (click)="$event.stopPropagation()">
                        @for (option of effectiveConfig.statusFilterOptions; track option) {
                          <button class="flex min-h-8 w-full items-center px-siaf-md py-siaf-xxs text-left text-sm font-normal leading-normal text-[var(--sys-color-text-neutral-medium)] transition hover:bg-[var(--sys-color-bg-states-light-hover)]" type="button" (click)="selectStatusFilter(option)">{{ option }}</button>
                        }
                      </div>
                    }
                  </div>

                  <div class="relative">
                    @if (selectedActionTypeFilter) {
                      <button class="inline-flex h-8 items-center gap-siaf-xs overflow-hidden rounded-siaf-md border border-[var(--sys-color-border-states-active)] bg-[var(--sys-color-bg-states-light-selected)] px-siaf-xs py-siaf-xxs text-sm font-normal leading-normal tracking-[0.025px] text-[var(--sys-color-text-neutral-activated)] transition hover:bg-[var(--sys-color-bg-states-light-hover)]" type="button" aria-label="Filtro de tipo de accion seleccionado" (click)="toggleActionTypeFilterMenu()">
                        <siaf-icon name="check" [size]="20" />
                        Tipo de acción: {{ selectedActionTypeFilter }}
                        <span class="inline-flex size-5 items-center justify-center rounded-siaf-sm" role="button" tabindex="0" aria-label="Quitar filtro de tipo de accion" (click)="clearActionTypeFilter($event)" (keydown.enter)="clearActionTypeFilter($event)" (keydown.space)="clearActionTypeFilter($event)">
                          <siaf-icon name="close" [size]="20" />
                        </span>
                      </button>
                    } @else {
                      <button class="inline-flex h-8 items-center gap-siaf-xs rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface px-siaf-sm text-sm font-normal leading-normal tracking-[0.025px] text-text transition hover:bg-surface-muted" type="button" aria-label="Seleccionar tipo de accion" [class.bg-surface-muted]="actionTypeFilterMenuOpen" (click)="toggleActionTypeFilterMenu()">
                        Tipo de acción
                        <siaf-icon [name]="actionTypeFilterMenuOpen ? 'expand_less' : 'expand_more'" [size]="20" />
                      </button>
                    }
                    @if (actionTypeFilterMenuOpen) {
                      <button class="fixed inset-0 z-20 cursor-default bg-transparent" type="button" aria-label="Cerrar tipos de accion" (click)="closeActionTypeFilterMenu()"></button>
                      <div class="absolute left-0 top-10 z-30 w-[220px] overflow-hidden rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-highest,white)] py-siaf-xs shadow-siaf-elevation-1" (click)="$event.stopPropagation()">
                        @for (option of effectiveConfig.actionTypeFilterOptions; track option) {
                          <button class="flex min-h-8 w-full items-center px-siaf-md py-siaf-xxs text-left text-sm font-normal leading-normal text-[var(--sys-color-text-neutral-medium)] transition hover:bg-[var(--sys-color-bg-states-light-hover)]" type="button" (click)="selectActionTypeFilter(option)">{{ option }}</button>
                        }
                      </div>
                    }
                  </div>

                  @for (filter of appliedCustomFilters; track filter.id) {
                    <button class="inline-flex h-8 items-center gap-siaf-xs overflow-hidden rounded-siaf-md border border-[var(--sys-color-border-states-active)] bg-[var(--sys-color-bg-states-light-selected)] px-siaf-xs py-siaf-xxs text-sm font-normal leading-normal tracking-[0.025px] text-[var(--sys-color-text-neutral-activated)] transition hover:bg-[var(--sys-color-bg-states-light-hover)]" type="button" aria-label="Filtro personalizado aplicado" (click)="editCustomAppliedFilter(filter)">
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

              @if (activeTab === 'documents') {
                <siaf-table-controls
                  selectAllLabel="Seleccionar documentos o registros"
                  [hideTopPaginationOnMobile]="true"
                  [checked]="allVisibleElaboradoDocumentsSelected"
                  [indeterminate]="someVisibleElaboradoDocumentsSelected"
                  [disabled]="visibleSelectableElaboradoDocuments.length === 0"
                  [page]="page"
                  [pageSize]="rowsPerPage"
                  [totalItems]="filteredRows.length"
                  [totalPages]="totalPages"
                  (selectionChange)="toggleVisibleElaboradoDocuments($event)"
                  (previous)="onPreviousPage()"
                  (next)="onNextPage()"
                />
              } @else {
                <siaf-pagination
                  navigation="Activate"
                  position="Top"
                  [page]="page"
                  [pageSize]="rowsPerPage"
                  [totalItems]="visibleRows.length"
                  [totalPages]="totalPages"
                  (previous)="onPreviousPage()"
                  (next)="onNextPage()"
                />
              }

              <siaf-documents-records-table
                [activeTab]="activeTab"
                [columns]="visibleColumns"
                [rows]="paginatedRows"
                [minWidthClass]="activeTab === 'documents' ? effectiveConfig.documentTableMinWidthClass : effectiveConfig.recordTableMinWidthClass"
                [recordTrackKey]="effectiveConfig.recordTrackKey"
                [documentRoute]="documentRoute"
                [selectionDisabled]="selectionDisabled"
                (selectionChanged)="toggleRowSelection($event)"
                (historyOpened)="openHistory($event)"
              />

              <siaf-pagination
                navigation="Activate"
                position="Bottom"
                [rowPage]="true"
                [page]="page"
                [pageSize]="rowsPerPage"
                [totalItems]="visibleRows.length"
                [totalPages]="totalPages"
                [rowsPerPage]="rowsPerPage"
                [rowsPerPageOptions]="rowsPerPageOptions"
                (previous)="onPreviousPage()"
                (next)="onNextPage()"
                (rowsPerPageChange)="onRowsPerPageChange($event)"
              />
            </article>

            @if (customFilterOpen) {
              <button class="fixed inset-0 z-20 cursor-default bg-transparent" type="button" aria-label="Cerrar filtros" (click)="closeCustomFilter()"></button>
              <div class="fixed inset-x-siaf-md top-24 z-30 sm:absolute sm:left-[40px] sm:top-[188px] sm:w-[936px] sm:max-w-[calc(100%-80px)]" (click)="$event.stopPropagation()">
                <siaf-custom-filter
                  [campoOptions]="effectiveConfig.filterCampoOptions"
                  [condicionOptions]="filterCondicionOptions"
                  [valorOptions]="effectiveConfig.filterValorOptions"
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
      <siaf-column-visibility-panel
        [open]="columnPanelOpen"
        [allSelected]="allDraftColumnsSelected"
        [dirty]="columnsPanelDirty"
        [defaultColumns]="defaultColumnOptions"
        [moreColumns]="moreColumnOptions"
        [internalColumns]="internalColumnOptions"
        [isColumnVisible]="isDraftColumnVisible"
        (closed)="closeColumnPanel()"
        (applied)="applyColumnPanel()"
        (toggleAll)="toggleAllDraftColumns($event)"
        (toggleColumn)="toggleDraftColumnVisibility($event.key, $event.event)"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentsRecordsPageComponent implements OnChanges {
  private readonly router = inject(Router);
  private readonly permissionService = inject(PermissionService);

  @Input({ required: true }) config!: DocumentsRecordsConfig;

  // Config efectivo con reglas de rol aplicadas automáticamente
  get effectiveConfig(): DocumentsRecordsConfig {
    const roleMode = this.documentsRecordsRoleMode;

    if (roleMode === 'creator') {
      return {
        ...this.config,
        statusFilterOptions: ESTADOS_CREADOR,
        accionPrincipal: 'verificar',
        documentRows: this.config.documentRows.filter(r =>
          ESTADOS_CREADOR.includes(String(r['status'] ?? ''))
        ),
      };
    }

    if (roleMode === 'readOnly') {
      return {
        ...this.config,
        createDocumentOptions: [],
        accionPrincipal: undefined,
      };
    }

    return {
      ...this.config,
      // Sin botón crear
      createDocumentOptions: [],
      // Solo estados del APROBADOR
      statusFilterOptions: ESTADOS_APROBADOR,
      // Acción principal: Aprobar
      accionPrincipal: 'aprobar',
      // Filtrar documentRows para no mostrar Elaborado/Eliminado
      documentRows: this.config.documentRows.filter(r =>
        ESTADOS_APROBADOR.includes(String(r['status'] ?? ''))
      ),
    };
  }

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
  searchTerm = '';
  appliedCustomFilters: AppliedCustomFilter[] = [];
  customFilterInitialRows: FilterRow[] = [];
  editingCustomFilterId = '';
  accountHistoryOpen = false;
  documentHistoryOpen = false;
  verifyModalOpen = false;
  approveModalOpen = false;
  approvalSnackbarOpen = false;
  approvalSnackbarNumbers = '';
  createDocumentDocument = '';
  createDocumentActionType = '';
  documentRows: DocumentsRecordsRow[] = [];
  recordRows: DocumentsRecordsRow[] = [];
  hiddenDocumentColumns = new Set<string>();
  hiddenRecordColumns = new Set<string>();
  draftHiddenColumns = new Set<string>();
  selectedAccountHistoryRecord: DocumentsRecordsRow | null = null;
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
  rowsPerPage = 10;
  page = 1;

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['config'] || !this.config) {
      return;
    }

    const cfg = this.effectiveConfig;
    this.documentRows = cfg.documentRows.map((row) => ({ ...row }));
    this.recordRows = cfg.recordRows.map((row) => ({ ...row }));
    this.hiddenDocumentColumns = new Set(cfg.documentColumns.filter((column) => column.visibility !== 'visible').map((column) => column.key));
    this.hiddenRecordColumns = new Set(cfg.recordColumns.filter((column) => column.visibility !== 'visible').map((column) => column.key));
    this.selectedHistorySummary = {
      document: String(this.documentRows[0]?.['document'] ?? cfg.recordHistoryDocumentLabel),
      number: String(this.documentRows[0]?.['number'] ?? ''),
      actionType: String(this.documentRows[0]?.['actionType'] ?? '')
    };
  }

  get filteredRows(): DocumentsRecordsRow[] {
    return this.documentRows.filter((row) => {
      const normalizedSearch = this.normalize(this.searchTerm);
      const matchesSearch = !normalizedSearch || this.normalize(Object.values(row).join(' ')).includes(normalizedSearch);
      const matchesStatus = !this.selectedStatusFilter || row['status'] === this.selectedStatusFilter;
      const matchesActionType = !this.selectedActionTypeFilter || row['actionType'] === this.selectedActionTypeFilter;
      const matchesCustomFilters = this.appliedCustomFilters.every((filter) => this.matchesCustomFilter(row, filter));
      return matchesSearch && matchesStatus && matchesActionType && matchesCustomFilters;
    });
  }

  get visibleRows(): DocumentsRecordsRow[] {
    if (this.activeTab === 'documents') {
      return this.filteredRows;
    }

    const normalizedSearch = this.normalize(this.searchTerm);
    return this.recordRows.filter((row) => !normalizedSearch || this.normalize(Object.values(row).join(' ')).includes(normalizedSearch));
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.visibleRows.length / this.rowsPerPage));
  }

  get paginatedRows(): DocumentsRecordsRow[] {
    const start = (this.page - 1) * this.rowsPerPage;
    return this.visibleRows.slice(start, start + this.rowsPerPage);
  }

  get canVerifySelectedDocuments(): boolean {
    return this.documentRows.some((row) => row.selected && row['status'] === 'Elaborado');
  }

  get canApproveSelectedDocuments(): boolean {
    return this.documentRows.some((row) => row.selected && row['status'] === 'Verificado');
  }

  get selectedVerificadoCount(): number {
    return this.documentRows.filter((row) => row.selected && row['status'] === 'Verificado').length;
  }

  get visibleSelectableElaboradoDocuments(): DocumentsRecordsRow[] {
    if (this.activeTab !== 'documents') {
      return [];
    }

    // APROBADOR selecciona Verificados — CREADOR selecciona Elaborados
    const selectableStatus = this.selectableDocumentStatus;
    if (!selectableStatus) {
      return [];
    }
    return this.paginatedRows.filter((row) => row['status'] === selectableStatus);
  }

  get allVisibleElaboradoDocumentsSelected(): boolean {
    const rows = this.visibleSelectableElaboradoDocuments;
    return rows.length > 0 && rows.every((row) => row.selected);
  }

  get someVisibleElaboradoDocumentsSelected(): boolean {
    const rows = this.visibleSelectableElaboradoDocuments;
    return rows.some((row) => row.selected) && !this.allVisibleElaboradoDocumentsSelected;
  }

  get activeColumnOptions(): DocumentsRecordsColumn[] {
    return this.activeTab === 'documents' ? this.effectiveConfig.documentColumns : this.effectiveConfig.recordColumns;
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
    return `Estás a punto de verificar ${this.selectedElaboradoDocuments.length} solicitudes en simultáneo.`;
  }

  get approveModalDescription(): string {
    const count = this.selectedVerificadoCount;
    return `Estás a punto de aprobar ${count} solicitud${count !== 1 ? 'es' : ''} en simultáneo.`;
  }

  get createDocumentFields(): CreateDocumentField[] {
    return [
      {
        placeholder: 'Documento',
        type: 'select',
        required: true,
        value: this.createDocumentDocument,
        options: this.effectiveConfig.createDocumentOptions[0]?.documents ?? []
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
    return this.effectiveConfig.createDocumentOptions[0]?.documentOptions?.find((document) => document.label === this.createDocumentDocument)?.actionTypes || this.effectiveConfig.createDocumentOptions[0]?.actionTypes || [];
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

  private get documentsRecordsRoleMode(): DocumentsRecordsRoleMode {
    const role = this.permissionService.currentRole() as UserRole;

    if (role === 'approver') {
      return 'approver';
    }

    if (role === 'creator') {
      return 'creator';
    }

    return 'readOnly';
  }

  private get selectableDocumentStatus(): 'Elaborado' | 'Verificado' | '' {
    if (this.effectiveConfig.accionPrincipal === 'verificar') {
      return 'Elaborado';
    }

    if (this.effectiveConfig.accionPrincipal === 'aprobar') {
      return 'Verificado';
    }

    return '';
  }

  inputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.page = 1;
  }

  selectTab(tab: DocumentsRecordsTab): void {
    this.activeTab = tab;
    this.page = 1;
    this.closeMoreOptionsMenu();
  }

  toggleRowSelection(change: DocumentsRecordsSelectionChange): void {
    if (this.selectionDisabled(change.row)) {
      change.row.selected = false;
      return;
    }

    change.row.selected = change.selected;
  }

  toggleVisibleElaboradoDocuments(selected: boolean): void {
    const selectableStatus = this.selectableDocumentStatus;

    this.paginatedRows.forEach((row) => {
      if (selectableStatus && row['status'] === selectableStatus) {
        row.selected = selected;
        return;
      }

      row.selected = false;
    });
  }

  selectionDisabled = (row: DocumentsRecordsRow): boolean => {
    if (this.activeTab !== 'documents') return false;
    const selectableStatus = this.selectableDocumentStatus;
    if (!selectableStatus) return true;

    // APROBADOR solo puede seleccionar Verificados
    // CREADOR solo puede seleccionar Elaborados
    return row['status'] !== selectableStatus;
  };

  documentRoute = (row: DocumentsRecordsRow): string => {
    if (typeof row['linkRoute'] === 'string') {
      return row['linkRoute'];
    }

    const documentOption = this.effectiveConfig.createDocumentOptions[0]?.documentOptions?.find((document) => document.label === row['document']);
    return documentOption?.route || this.config.defaultRequestRoute;
  };

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

  openApproveModal(): void {
    if (!this.canApproveSelectedDocuments) return;
    this.closeToolbarMenus();
    this.approveModalOpen = true;
  }

  closeApproveModal(): void {
    this.approveModalOpen = false;
  }

  confirmApproveModal(): void {
    const selectedRows = this.documentRows.filter(row => row.selected && row['status'] === 'Verificado');
    this.approvalSnackbarNumbers = this.formatDocumentNumbers(selectedRows.map(row => String(row['number'] ?? '')));
    selectedRows.forEach(row => {
      row['status'] = 'Aprobado';
      row.selected = false;
    });
    this.approveModalOpen = false;
    this.approvalSnackbarOpen = selectedRows.length > 0;
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

  isDraftColumnVisible = (columnKey: string): boolean => {
    return !this.draftHiddenColumns.has(columnKey);
  };

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

  selectFieldsMenuOption(_option: string): void {
    this.closeFieldsMenu();
  }

  closeFavoriteMenu(): void {
    this.favoriteMenuOpen = false;
  }

  selectFavoriteOption(_option: 'observed' | 'save-search'): void {
    this.closeFavoriteMenu();
  }

  openHistory(row: DocumentsRecordsRow): void {
    this.closeToolbarMenus();

    if (this.activeTab === 'records') {
      this.selectedAccountHistoryRecord = row;
      this.accountHistoryOpen = true;
      return;
    }

    this.selectedHistorySummary = {
      document: String(row['document'] ?? ''),
      number: String(row['number'] ?? ''),
      actionType: String(row['actionType'] ?? 'Creación')
    };
    this.documentHistoryOpen = true;
  }

  closeAccountHistory(): void {
    this.accountHistoryOpen = false;
  }

  closeDocumentHistory(): void {
    this.documentHistoryOpen = false;
  }

  onRowsPerPageChange(value: number): void {
    this.rowsPerPage = value;
    this.page = 1;
  }

  onPreviousPage(): void {
    this.page = Math.max(1, this.page - 1);
  }

  onNextPage(): void {
    this.page = Math.min(this.totalPages, this.page + 1);
  }

  private closeToolbarMenus(except: 'status' | 'actionType' | 'favorite' | 'fields' | 'more' | '' = ''): void {
    this.createDocumentPopoverOpen = false;
    this.customFilterOpen = false;
    this.fieldsMenuOpen = except === 'fields' ? this.fieldsMenuOpen : false;
    this.favoriteMenuOpen = except === 'favorite' ? this.favoriteMenuOpen : false;
    this.statusFilterMenuOpen = except === 'status' ? this.statusFilterMenuOpen : false;
    this.actionTypeFilterMenuOpen = except === 'actionType' ? this.actionTypeFilterMenuOpen : false;
    this.moreOptionsMenuOpen = except === 'more' ? this.moreOptionsMenuOpen : false;
  }

  private getFilterCampoLabel(campo: string): string {
    return this.effectiveConfig.filterCampoOptions.find((option) => option.value === campo)?.label ?? campo;
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
    const rowValue = this.normalize(String(row[filter.campo] ?? ''));
    const filterValue = this.normalize(filter.valor);

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

  private normalize(value: string): string {
    return value.toLocaleLowerCase();
  }

}
