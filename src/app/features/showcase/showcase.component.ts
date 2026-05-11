import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AccordionComponent } from '../../shared/ui/accordion/accordion.component';
import { ActionTrackerComponent } from '../../shared/ui/action-tracker/action-tracker.component';
import { AlertComponent } from '../../shared/ui/alert/alert.component';
import { AnnulmentModalComponent } from '../../shared/ui/annulment-modal/annulment-modal.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { CheckboxComponent } from '../../shared/ui/checkbox/checkbox.component';
import { ColumnVisibilityPanelComponent } from '../../shared/ui/column-visibility-panel/column-visibility-panel.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { DateTimePickerComponent } from '../../shared/ui/date-time-picker/date-time-picker.component';
import { DividerComponent } from '../../shared/ui/divider/divider.component';
import { DocumentHistoryPanelComponent } from '../../shared/ui/document-history-panel/document-history-panel.component';
import { DocumentsRecordsTableComponent } from '../../shared/ui/documents-records-table/documents-records-table.component';
import { EmptySectionComponent } from '../../shared/ui/empty-section/empty-section.component';
import { FlowStatusTagComponent } from '../../shared/ui/flow-status-tag/flow-status-tag.component';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { ListComponent } from '../../shared/ui/list/list.component';
import { LoadingProgressComponent } from '../../shared/ui/loading-progress/loading-progress.component';
import { MenuComponent } from '../../shared/ui/menu/menu.component';
import { MessageBoxComponent } from '../../shared/ui/message-box/message-box.component';
import { MobileNavigationMenuComponent } from '../../layout/mobile-navigation-menu/mobile-navigation-menu.component';
import { ModalComponent } from '../../shared/ui/modal/modal.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { PopoverComponent } from '../../shared/ui/popover/popover.component';
import { ProcessMenuTreeComponent } from '../../layout/process-menu-tree/process-menu-tree.component';
import { RadioComponent } from '../../shared/ui/radio/radio.component';
import { ReadonlyComponent } from '../../shared/ui/readonly/readonly.component';
import { ReadonlyFieldComponent } from '../../shared/ui/readonly-field/readonly-field.component';
import { RecordStatusTagComponent } from '../../shared/ui/record-status-tag/record-status-tag.component';
import { SelectOptionsComponent } from '../../shared/ui/select-options/select-options.component';
import { SidePanelComponent } from '../../layout/side-panel/side-panel.component';
import { SnackbarComponent } from '../../shared/ui/snackbar/snackbar.component';
import { SolicitudeFormCardComponent } from '../../shared/components/solicitude-form-card/solicitude-form-card.component';
import { SolicitudeHeaderComponent } from '../../shared/components/solicitude-header/solicitude-header.component';
import { SolicitudeInfoCardComponent } from '../../shared/components/solicitude-info-card/solicitude-info-card.component';
import { SolicitudePageLayoutComponent } from '../../shared/components/solicitude-page-layout/solicitude-page-layout.component';
import { StepperCardComponent } from '../../shared/ui/stepper-card/stepper-card.component';
import { StepsComponent } from '../../shared/ui/steps/steps.component';
import { SummaryCardComponent } from '../../shared/ui/summary-card/summary-card.component';
import { SwitchComponent } from '../../shared/ui/switch/switch.component';
import { TabsComponent } from '../../shared/ui/tabs/tabs.component';
import { TagComponent } from '../../shared/ui/tag/tag.component';
import { TextAreaControlComponent } from '../../shared/ui/text-area-control/text-area-control.component';
import { TextFieldComponent } from '../../shared/ui/text-field/text-field.component';
import { TimelineComponent } from '../../shared/components/timeline/timeline.component';
import { TooltipComponent } from '../../shared/ui/tooltip/tooltip.component';
import { TrayDocumentsViewComponent } from '../../layout/tray-documents-view/tray-documents-view.component';
import { TrayMenuComponent } from '../../layout/tray-menu/tray-menu.component';
import { TreeViewComponent } from '../../shared/ui/tree-view/tree-view.component';
import { UploadSideNavComponent } from '../../shared/ui/upload-side-nav/upload-side-nav.component';
import { UploadedFileCardComponent } from '../../shared/ui/uploaded-file-card/uploaded-file-card.component';
import { UploaderComponent } from '../../shared/ui/uploader/uploader.component';
import { TableComponent } from '../../shared/ui/table/table.component';
import { CreateDocumentComponent } from '../../layout/create-document/create-document.component';

@Component({
  selector: 'siaf-showcase',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AccordionComponent, ActionTrackerComponent, AlertComponent, AnnulmentModalComponent,
    BadgeComponent, ButtonComponent, CardComponent, CheckboxComponent,
    ColumnVisibilityPanelComponent, DataTableComponent, DateTimePickerComponent,
    DividerComponent, DocumentHistoryPanelComponent, DocumentsRecordsTableComponent,
    EmptySectionComponent, FlowStatusTagComponent, IconComponent, ListComponent,
    LoadingProgressComponent, MenuComponent, MessageBoxComponent, MobileNavigationMenuComponent,
    ModalComponent, PaginationComponent, PopoverComponent, ProcessMenuTreeComponent,
    RadioComponent, ReadonlyComponent, ReadonlyFieldComponent, RecordStatusTagComponent, SelectOptionsComponent,
    SidePanelComponent, SnackbarComponent, SolicitudeFormCardComponent,
    SolicitudeHeaderComponent, SolicitudeInfoCardComponent, SolicitudePageLayoutComponent,
    StepperCardComponent, StepsComponent, SummaryCardComponent, SwitchComponent,
    TabsComponent, TagComponent, TextAreaControlComponent, TextFieldComponent,
    TimelineComponent, TooltipComponent, TrayDocumentsViewComponent, TrayMenuComponent,
    TreeViewComponent, UploadSideNavComponent, UploadedFileCardComponent,
    UploaderComponent, TableComponent, CreateDocumentComponent,
  ],
  template: `
    <div class="bg-gray-50 p-8 space-y-12 text-sm min-w-[1000px]">

      <!-- BUTTON -->
      <section id="sc-button">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Button</h2>
        <div class="flex flex-wrap gap-3 items-center bg-surface p-4 rounded-lg shadow-siaf-sm">
          <siaf-button variant="primary">Primary</siaf-button>
          <siaf-button variant="secondary">Secondary</siaf-button>
          <siaf-button variant="ghost">Ghost</siaf-button>
          <siaf-button variant="danger">Danger</siaf-button>
          <siaf-button variant="accent">Accent</siaf-button>
          <siaf-button variant="primary" size="sm">Small</siaf-button>
          <siaf-button variant="primary" size="lg">Large</siaf-button>
          <siaf-button variant="primary" icon="add">Con ícono</siaf-button>
          <siaf-button variant="accent" icon="search" [iconOnly]="true" ariaLabel="Buscar" />
          <siaf-button variant="primary" [disabled]="true">Disabled</siaf-button>
          <siaf-button variant="primary" [loading]="true">Loading</siaf-button>
        </div>
      </section>

      <!-- TEXT FIELD -->
      <section id="sc-text-field">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Text Field</h2>
        <div class="grid grid-cols-3 gap-4 bg-surface p-4 rounded-lg shadow-siaf-sm">
          <siaf-input label="Texto simple" />
          <siaf-input label="Con error" error="Campo requerido" />
          <siaf-input label="Con hint" hint="Texto de ayuda" />
          <siaf-input label="Con ícono izquierdo" leadingIcon="search" />
          <siaf-input label="Password" type="password" />
          <siaf-input label="Número" type="number" />
          <siaf-input label="Disabled" [disabled]="true" value="Valor deshabilitado" />
          <siaf-input label="Select" type="select" [options]="selectOptions" />
          <siaf-input label="Select Multiple" type="select-multiple" [options]="selectOptions" />
        </div>
      </section>

      <!-- DATE TIME PICKER -->
      <section id="sc-date-time-picker">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Date Time Picker</h2>
        <div class="grid grid-cols-3 gap-4 bg-surface p-4 rounded-lg shadow-siaf-sm">
          <siaf-date-time-picker label="Fecha" variant="date" />
          <siaf-date-time-picker label="Fecha y Hora" variant="datetime" />
          <siaf-date-time-picker label="Con error" variant="date" error="Fecha requerida" />
          <siaf-date-time-picker label="Disabled" variant="date" [disabled]="true" />
        </div>
      </section>

      <!-- BADGE -->
      <section id="sc-badge">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Badge</h2>
        <div class="flex flex-wrap gap-3 bg-surface p-4 rounded-lg shadow-siaf-sm">
          <siaf-badge tone="info" label="Info" />
          <siaf-badge tone="success" label="Success" />
          <siaf-badge tone="warning" label="Warning" />
          <siaf-badge tone="danger" label="Danger" />
          <siaf-badge tone="neutral" label="Neutral" />
        </div>
      </section>

      <!-- TAG -->
      <section id="sc-tag">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Tag</h2>
        <div class="flex flex-wrap gap-3 bg-surface p-4 rounded-lg shadow-siaf-sm">
          <siaf-tag tone="neutral" label="Neutral" />
          <siaf-tag tone="info" label="Info" />
          <siaf-tag tone="success" label="Success" />
          <siaf-tag tone="warning" label="Warning" />
          <siaf-tag tone="danger" label="Danger" />
          <siaf-tag tone="info" label="Con ícono" icon="star" />
          <siaf-tag tone="neutral" label="Removable" [removable]="true" />
        </div>
      </section>

      <!-- ALERT -->
      <section id="sc-alert">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Alert</h2>
        <div class="flex flex-col gap-3 bg-surface p-4 rounded-lg shadow-siaf-sm">
          <siaf-alert tone="neutral" title="Notificación" description="Esta es un mensaje de alerta neutral del sistema." />
          <siaf-alert tone="success" title="Operación exitosa" description="La cuenta contable fue registrada correctamente." />
          <siaf-alert tone="info" title="Información" description="Revisa los datos antes de continuar con el proceso." />
          <siaf-alert tone="warning" title="Advertencia" description="Algunos campos requieren revisión antes de guardar." />
          <siaf-alert tone="error" title="Error" description="Ocurrió un error crítico. Intente nuevamente." [showClose]="true" />
        </div>
      </section>

      <!-- FLOW STATUS TAG -->
      <section id="sc-flow-status">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Flow Status Tag</h2>
        <div class="flex flex-wrap gap-2 bg-surface p-4 rounded-lg shadow-siaf-sm">
          <siaf-flow-status-tag status="Elaborado" />
          <siaf-flow-status-tag status="Verificado" />
          <siaf-flow-status-tag status="Aprobado" />
          <siaf-flow-status-tag status="Observado" />
          <siaf-flow-status-tag status="Rechazado" />
          <siaf-flow-status-tag status="Anulado" />
          <siaf-flow-status-tag status="En proceso" />
          <siaf-flow-status-tag status="Pendiente" />
          <siaf-flow-status-tag status="Registrado" />
          <siaf-flow-status-tag status="Elaborado" size="small" />
          <siaf-flow-status-tag status="Aprobado" size="small" />
        </div>
      </section>

      <!-- RECORD STATUS TAG -->
      <section id="sc-record-status">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Record Status Tag</h2>
        <div class="flex flex-wrap gap-2 bg-surface p-4 rounded-lg shadow-siaf-sm">
          <siaf-record-status-tag status="Activo" size="small" />
          <siaf-record-status-tag status="Activo" size="standard" />
          <siaf-record-status-tag status="Inactivo" size="small" />
          <siaf-record-status-tag status="Inactivo" size="standard" />
          <siaf-record-status-tag status="Anulado" size="small" />
          <siaf-record-status-tag status="Anulado" size="standard" />
          <siaf-record-status-tag status="Eliminado" size="small" />
          <siaf-record-status-tag status="Eliminado" size="standard" />
          <siaf-record-status-tag status="En Proceso" size="small" />
          <siaf-record-status-tag status="En Proceso" size="standard" />
          <siaf-record-status-tag status="Validado" size="small" />
          <siaf-record-status-tag status="Validado" size="standard" />
        </div>
      </section>

      <!-- CHECKBOX · SWITCH · RADIO -->
      <section id="sc-controls">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Checkbox · Switch · Radio</h2>
        <div class="flex flex-wrap gap-8 bg-surface p-4 rounded-lg shadow-siaf-sm">
          <div class="flex flex-col gap-2">
            <span class="text-[10px] text-gray-400 uppercase font-bold mb-1">Checkbox</span>
            <siaf-checkbox label="Opción marcada" [checked]="true" />
            <siaf-checkbox label="Opción desmarcada" />
            <siaf-checkbox label="Deshabilitado" [disabled]="true" [checked]="true" />
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-[10px] text-gray-400 uppercase font-bold mb-1">Switch</span>
            <siaf-switch label="Activo" [checked]="true" />
            <siaf-switch label="Inactivo" [checked]="false" />
            <siaf-switch label="Deshabilitado" [disabled]="true" />
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-[10px] text-gray-400 uppercase font-bold mb-1">Radio</span>
            <siaf-radio-group [options]="radioOptions" value="op1" />
          </div>
        </div>
      </section>

      <!-- TABS -->
      <section id="sc-tabs">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Tabs</h2>
        <div class="bg-surface p-4 rounded-lg shadow-siaf-sm">
          <siaf-tabs [tabs]="tabItems" activeId="tab1" />
        </div>
      </section>

      <!-- STEPS -->
      <section id="sc-steps">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Steps</h2>
        <div class="bg-surface p-4 rounded-lg shadow-siaf-sm">
          <siaf-steps [steps]="stepItems" [activeStep]="1" />
        </div>
      </section>

      <!-- ACCORDION -->
      <section id="sc-accordion">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Accordion</h2>
        <div class="bg-surface p-4 rounded-lg shadow-siaf-sm">
          <siaf-accordion [items]="accordionItems" openId="ac1" />
        </div>
      </section>

      <!-- READONLY -->
      <section id="sc-readonly">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Readonly · Readonly Field</h2>
        <div class="grid grid-cols-2 gap-4 bg-surface p-4 rounded-lg shadow-siaf-sm">
          <siaf-readonly label="Nombre completo" value="Ricardo Bustamante" />
          <siaf-readonly label="Código" value="RPT-2024-001" />
          <readonly-field caption="Entidad" value="Ministerio de Economía y Finanzas" />
          <readonly-field caption="Órgano" value="Dirección General de Contabilidad" />
        </div>
      </section>

      <!-- DIVIDER -->
      <section id="sc-divider">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Divider</h2>
        <div class="bg-surface p-4 rounded-lg shadow-siaf-sm space-y-3">
          <span class="text-sm">Contenido arriba</span>
          <siaf-divider />
          <span class="text-sm">Contenido abajo</span>
          <div class="flex items-center gap-4 h-8">
            <span class="text-sm">Izquierda</span>
            <siaf-divider orientation="vertical" />
            <span class="text-sm">Derecha</span>
          </div>
        </div>
      </section>

      <!-- TEXT AREA CONTROL -->
      <section id="sc-textarea">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Text Area Control</h2>
        <div class="grid grid-cols-2 gap-4 bg-surface p-4 rounded-lg shadow-siaf-sm">
          <text-area-control placeholder="Escribe aquí..." [maxlength]="500" />
          <text-area-control title="Con título" placeholder="Con título flotante" [maxlength]="200" value="Texto de ejemplo" />
        </div>
      </section>

      <!-- ICON -->
      <section id="sc-icon">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Icon</h2>
        <div class="flex flex-wrap gap-4 items-center bg-surface p-4 rounded-lg shadow-siaf-sm">
          <siaf-icon name="home" [size]="24" />
          <siaf-icon name="search" [size]="24" />
          <siaf-icon name="add" [size]="24" />
          <siaf-icon name="close" [size]="24" />
          <siaf-icon name="check" [size]="24" />
          <siaf-icon name="edit" [size]="24" />
          <siaf-icon name="delete" [size]="24" />
          <siaf-icon name="filter_list" [size]="24" />
          <siaf-icon name="home" variant="outlined" [size]="32" />
          <siaf-icon name="star" variant="filled" [size]="32" />
          <siaf-icon name="favorite" variant="outlined" [size]="32" />
        </div>
      </section>

      <!-- LIST -->
      <section id="sc-list">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">List</h2>
        <div class="bg-surface p-4 rounded-lg shadow-siaf-sm max-w-sm">
          <siaf-list [items]="listItems" />
        </div>
      </section>

      <!-- MENU -->
      <section id="sc-menu">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Menu</h2>
        <div class="bg-surface p-4 rounded-lg shadow-siaf-sm max-w-xs">
          <siaf-menu [items]="menuItems" />
        </div>
      </section>

      <!-- LOADING -->
      <section id="sc-loading">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Loading Progress</h2>
        <div class="flex flex-wrap gap-8 items-center bg-surface p-4 rounded-lg shadow-siaf-sm">
          <siaf-loading-progress variant="spinner" [size]="32" />
          <siaf-loading-progress variant="spinner" [size]="48" />
          <div class="w-48"><siaf-loading-progress variant="bar" [value]="60" /></div>
          <div class="w-48"><siaf-loading-progress variant="bar" [value]="30" /></div>
        </div>
      </section>

      <!-- PAGINATION -->
      <section id="sc-pagination">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Pagination</h2>
        <div class="flex flex-col gap-4 bg-surface p-4 rounded-lg shadow-siaf-sm">
          <siaf-pagination navigation="Activate" position="Top" [page]="2" [pageSize]="25" [totalItems]="200" [totalPages]="8" />
          <siaf-pagination navigation="Activate" position="Bottom" [rowPage]="true" [page]="1" [pageSize]="25" [totalItems]="200" [totalPages]="8" />
        </div>
      </section>

      <!-- TOOLTIP -->
      <section id="sc-tooltip">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Tooltip</h2>
        <div class="flex gap-8 items-center bg-surface p-4 rounded-lg shadow-siaf-sm">
          <siaf-tooltip text="Tooltip arriba">
            <siaf-button variant="secondary">Hover top</siaf-button>
          </siaf-tooltip>
          <siaf-tooltip text="Tooltip abajo">
            <siaf-button variant="secondary">Hover bottom</siaf-button>
          </siaf-tooltip>
          <siaf-tooltip text="Tooltip derecha">
            <siaf-button variant="secondary">Hover right</siaf-button>
          </siaf-tooltip>
        </div>
      </section>

      <!-- POPOVER -->
      <section id="sc-popover">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Popover</h2>
        <div class="bg-surface p-4 rounded-lg shadow-siaf-sm">
          <siaf-popover [open]="true">
            <siaf-button variant="secondary" popover-trigger>Abrir popover</siaf-button>
            <div class="space-y-2">
              <p class="font-semibold text-sm">Título del popover</p>
              <p class="text-xs text-gray-500">Contenido adicional con información relevante para el usuario.</p>
            </div>
          </siaf-popover>
        </div>
      </section>

      <!-- MODAL -->
      <section id="sc-modal">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Modal</h2>
        <div class="bg-surface p-4 rounded-lg shadow-siaf-sm">
          <siaf-modal [open]="true" variant="delete-request" confirmLabel="Eliminar" />
        </div>
      </section>

      <!-- EMPTY SECTION -->
      <section id="sc-empty">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Empty Section</h2>
        <div class="bg-surface p-4 rounded-lg shadow-siaf-sm">
          <empty-section title="Sin documentos" />
        </div>
      </section>

      <!-- TIMELINE -->
      <section id="sc-timeline">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Timeline</h2>
        <div class="bg-surface p-4 rounded-lg shadow-siaf-sm">
          <siaf-timeline [items]="timelineItems" />
        </div>
      </section>

      <!-- SNACKBAR -->
      <section id="sc-snackbar">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Snackbar</h2>
        <div class="flex flex-col gap-3 bg-surface p-4 rounded-lg shadow-siaf-sm">
          <siaf-snackbar message="Cambios guardados correctamente" />
          <siaf-snackbar variant="creation-elaborated" />
          <siaf-snackbar variant="creation-verified" />
          <siaf-snackbar variant="creation-approved" />
        </div>
      </section>

      <!-- SUMMARY CARD -->
      <section id="sc-summary-card">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Summary Card</h2>
        <div class="bg-surface p-4 rounded-lg shadow-siaf-sm">
          <siaf-summary-card [fields]="summaryFields" [showClose]="true" />
        </div>
      </section>

      <!-- ACTION TRACKER -->
      <section id="sc-action-tracker">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Action Tracker</h2>
        <div class="bg-surface p-4 rounded-lg shadow-siaf-sm">
          <siaf-action-tracker [showSummaryCards]="true" [showTabs]="false" [summaryItems]="trackerItems" />
        </div>
      </section>

      <!-- UPLOADER -->
      <section id="sc-uploader">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Uploader</h2>
        <div class="grid grid-cols-2 gap-4 bg-surface p-4 rounded-lg shadow-siaf-sm">
          <siaf-uploader variant="extended" />
          <siaf-uploader variant="compact" />
        </div>
      </section>

      <!-- UPLOAD SIDE NAV -->
      <section id="sc-upload-side-nav">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Upload Side Nav</h2>
        <div class="relative h-[420px] overflow-hidden rounded-lg bg-surface shadow-siaf-sm">
          <siaf-upload-side-nav [open]="true" title="Cargar Documento de Sustento"
            description="Sube un archivo .PDF en el formato correcto."
            acceptedLabel="Solo admite archivos .pdf" hint="Archivos de hasta 10 MB" />
        </div>
      </section>

      <!-- UPLOADED FILE CARD -->
      <section id="sc-uploaded-file-card">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Uploaded File Card</h2>
        <div class="bg-surface p-4 rounded-lg shadow-siaf-sm max-w-md">
          <siaf-uploaded-file-card [file]="demoFile" />
        </div>
      </section>

      <!-- SELECT OPTIONS -->
      <section id="sc-select-options">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Select Options</h2>
        <div class="grid grid-cols-2 gap-4 bg-surface p-4 rounded-lg shadow-siaf-sm">
          <siaf-select-options [options]="selectOptions" selectedValue="op2" />
          <siaf-select-options [options]="selectOptions" [selectedValues]="['op1','op3']" [multiple]="true" />
        </div>
      </section>

      <!-- CARD -->
      <section id="sc-card">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Card</h2>
        <div class="bg-surface p-4 rounded-lg shadow-siaf-sm">
          <siaf-card title="Título del card" description="Descripción del contenido de la tarjeta">
            <p class="text-sm text-gray-500 mt-2">Contenido del slot interno</p>
          </siaf-card>
        </div>
      </section>

      <!-- MESSAGE BOX -->
      <section id="sc-message-box">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Message Box</h2>
        <div class="bg-surface p-4 rounded-lg shadow-siaf-sm">
          <message-box message="Este es un mensaje informativo del sistema para el usuario." />
        </div>
      </section>

      <!-- ANNULMENT MODAL -->
      <section id="sc-annulment-modal">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Annulment Modal</h2>
        <div class="relative min-h-[300px] rounded-lg bg-surface p-4 shadow-siaf-sm">
          <siaf-annulment-modal [open]="true" [step]="1" />
        </div>
      </section>

      <!-- SIDE PANEL -->
      <section id="sc-side-panel">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Side Panel</h2>
        <div class="relative h-[300px] overflow-hidden rounded-lg bg-surface shadow-siaf-sm">
          <siaf-side-panel [open]="true" title="Panel lateral">
            <p class="p-4 text-sm text-gray-500">Contenido del panel lateral.</p>
          </siaf-side-panel>
        </div>
      </section>

      <!-- COLUMN VISIBILITY PANEL -->
      <section id="sc-column-visibility-panel">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Column Visibility Panel</h2>
        <div class="relative h-[360px] overflow-hidden rounded-lg bg-surface shadow-siaf-sm">
          <siaf-column-visibility-panel [open]="true" [defaultColumns]="defaultColumns" />
        </div>
      </section>

      <!-- DOCUMENT HISTORY PANEL -->
      <section id="sc-document-history-panel">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Document History Panel</h2>
        <div class="relative h-[420px] overflow-hidden rounded-lg bg-surface shadow-siaf-sm">
          <siaf-document-history-panel [open]="true" />
        </div>
      </section>

      <!-- PROCESS MENU TREE -->
      <section id="sc-process-menu-tree">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Process Menu Tree</h2>
        <div class="max-w-[380px] overflow-hidden rounded-lg bg-surface shadow-siaf-sm">
          <siaf-process-menu-tree />
        </div>
      </section>

      <!-- TREE VIEW -->
      <section id="sc-tree-view">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Tree View</h2>
        <div class="bg-surface p-4 rounded-lg shadow-siaf-sm max-w-sm">
          <siaf-tree-view [nodes]="treeNodes" />
        </div>
      </section>

      <!-- STEPPER CARD -->
      <section id="sc-stepper-card">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Stepper Card</h2>
        <div class="grid grid-cols-2 gap-4 bg-surface p-4 rounded-lg shadow-siaf-sm">
          <siaf-stepper-card [fields]="stepperFields" />
          <siaf-stepper-card [fields]="stepperFields" [selected]="true" />
        </div>
      </section>

      <!-- SOLICITUDE INFO CARD -->
      <section id="sc-solicitude-info-card">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Solicitude Info Card</h2>
        <div class="bg-surface p-4 rounded-lg shadow-siaf-sm">
          <siaf-solicitude-info-card [fields]="solicitudeInfoFields" />
        </div>
      </section>

      <!-- SOLICITUDE FORM CARD -->
      <section id="sc-solicitude-form-card">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Solicitude Form Card</h2>
        <div class="bg-surface p-4 rounded-lg shadow-siaf-sm">
          <siaf-solicitude-form-card title="Datos del documento">
            <div class="grid grid-cols-2 gap-4 mt-2">
              <siaf-input label="Código" value="RPT-2024-001" />
              <siaf-input label="Tipo" value="Asiento de ajuste" />
            </div>
          </siaf-solicitude-form-card>
        </div>
      </section>

      <!-- SOLICITUDE HEADER -->
      <section id="sc-solicitude-header">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Solicitude Header</h2>
        <div class="bg-surface rounded-lg shadow-siaf-sm overflow-hidden">
          <siaf-solicitude-header role="creator" state="new" heading="Registro de Asiento de Ajuste" type="readonly" />
        </div>
      </section>

      <!-- SOLICITUDE PAGE LAYOUT -->
      <section id="sc-solicitude-page-layout">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Solicitude Page Layout</h2>
        <div class="min-h-[220px] overflow-hidden rounded-lg bg-surface shadow-siaf-sm">
          <siaf-solicitude-page-layout
            [breadcrumbs]="breadcrumbs"
            role="creator"
            state="new"
            heading="Registro de Asiento de Ajuste"
            secondaryText="Creación"
          />
        </div>
      </section>

      <!-- DATA TABLE -->
      <section id="sc-data-table">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Data Table</h2>
        <div class="bg-surface rounded-lg shadow-siaf-sm overflow-hidden">
          <siaf-data-table [columns]="dataTableColumns" [rows]="dataTableRows" />
        </div>
      </section>

      <!-- DOCUMENTS RECORDS TABLE -->
      <section id="sc-documents-records-table">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Documents Records Table</h2>
        <div class="bg-surface rounded-lg shadow-siaf-sm overflow-hidden">
          <siaf-documents-records-table
            activeTab="documents"
            [columns]="docRecordsColumns"
            [rows]="docRecordsRows"
          />
        </div>
      </section>

      <!-- MOBILE NAVIGATION MENU -->
      <section id="sc-mobile-navigation-menu">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Mobile Navigation Menu</h2>
        <div class="max-w-[360px] overflow-hidden rounded-lg bg-surface shadow-siaf-sm">
          <siaf-mobile-navigation-menu navigation="Bandeja" />
        </div>
      </section>

      <!-- TRAY MENU -->
      <section id="sc-tray-menu">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Tray Menu</h2>
        <div class="max-h-[420px] max-w-[320px] overflow-hidden rounded-lg bg-surface shadow-siaf-sm">
          <siaf-tray-menu selectedItem="Borradores" />
        </div>
      </section>

      <!-- TRAY DOCUMENTS VIEW -->
      <section id="sc-tray-documents-view">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Tray Documents View</h2>
        <div class="min-h-[300px] overflow-hidden rounded-lg bg-surface shadow-siaf-sm">
          <siaf-tray-documents-view title="Borradores" />
        </div>
      </section>

      <!-- TABLE -->
      <section id="sc-table">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Table</h2>
        <div class="bg-surface rounded-lg shadow-siaf-sm overflow-hidden">
          <siaf-table [columns]="dataTableColumns" [rows]="dataTableRows" />
        </div>
      </section>

      <!-- CREATE DOCUMENT -->
      <section id="sc-create-document">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Create Document</h2>
        <div class="max-w-[380px] overflow-hidden rounded-lg bg-surface shadow-siaf-sm">
          <siaf-create-document variant="dropdown" title="Nuevo documento" />
        </div>
      </section>

    </div>
  `
})
export class ShowcaseComponent {
  selectOptions = [
    { label: 'Opción 1', value: 'op1' },
    { label: 'Opción 2', value: 'op2' },
    { label: 'Opción 3', value: 'op3' },
    { label: 'Opción 4', value: 'op4' },
  ];

  radioOptions = [
    { label: 'Opción A', value: 'op1' },
    { label: 'Opción B', value: 'op2' },
    { label: 'Opción C', value: 'op3' },
  ];

  tabItems = [
    { id: 'tab1', label: 'Detalle' },
    { id: 'tab2', label: 'Historial' },
    { id: 'tab3', label: 'Adjuntos' },
  ];

  stepItems = [
    { label: 'Información' },
    { label: 'Revisión' },
    { label: 'Confirmación' },
  ];

  accordionItems = [
    { id: 'ac1', title: 'Primer ítem del accordion', content: 'Contenido del primer ítem expandible.' },
    { id: 'ac2', title: 'Segundo ítem del accordion', content: 'Contenido del segundo ítem expandible.' },
    { id: 'ac3', title: 'Tercer ítem del accordion', content: 'Contenido del tercer ítem expandible.' },
  ];

  timelineItems = [
    { title: 'Elaborado', description: 'Juan Pérez · 01/01/2024 08:00', status: 'done' as const },
    { title: 'Verificado', description: 'María García · 02/01/2024 10:30', status: 'done' as const },
    { title: 'Aprobado', description: 'En espera de aprobación', status: 'current' as const },
    { title: 'Publicado', description: 'Pendiente', status: 'pending' as const },
  ];

  summaryFields = [
    { label: 'Código', value: 'RPT-2024-001' },
    { label: 'Tipo', value: 'Solicitud de ajuste' },
    { label: 'Estado', value: 'Elaborado' },
    { label: 'Fecha', value: '03/05/2026' },
  ];

  trackerItems = [
    { label: 'Elaborado por', actionBy: 'USUARIO ROL CREADOR', date: '03/05/2026 08:00' },
    { label: 'Verificado por', actionBy: '', date: '' },
    { label: 'Aprobado por', actionBy: '', date: '' },
  ];

  listItems = [
    { title: 'Elemento 1', description: 'Descripción del primer elemento', icon: 'description' },
    { title: 'Elemento 2', description: 'Descripción del segundo elemento', icon: 'folder' },
    { title: 'Elemento 3', description: 'Sin ícono' },
  ];

  menuItems = [
    { label: 'Editar', icon: 'edit' },
    { label: 'Duplicar', icon: 'content_copy' },
    { label: 'Eliminar', icon: 'delete', disabled: false },
  ];

  treeNodes = [
    {
      id: 'n1', label: 'Contabilidad', icon: 'folder', expanded: true,
      children: [
        { id: 'n1-1', label: 'Asientos de ajuste', icon: 'description' },
        { id: 'n1-2', label: 'Plan de cuentas', icon: 'description' },
      ]
    },
    {
      id: 'n2', label: 'Presupuesto', icon: 'folder',
      children: [
        { id: 'n2-1', label: 'Ejecución', icon: 'description' },
      ]
    },
  ];

  stepperFields = [
    { label: 'Código', value: 'RPT-2024-001' },
    { label: 'Monto', value: '12,500.00', weight: 'bold' as const },
    { label: 'Fecha', value: '03/05/2026' },
  ];

  solicitudeInfoFields = [
    { label: 'ENTIDAD', value: 'Ministerio de Economía y Finanzas' },
    { label: 'ÓRGANO', value: 'Dirección General de Contabilidad' },
    { label: 'PROCESO', value: 'Registro de Asiento de Ajuste' },
    { label: 'PERÍODO', value: 'Enero 2024' },
  ];

  breadcrumbs = [
    { label: 'Inicio', href: '/' },
    { label: 'Procesos' },
    { label: 'Registro de Asiento de Ajuste' },
  ];

  dataTableColumns = [
    { key: 'codigo', label: 'Código' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'monto', label: 'Monto' },
    { key: 'estado', label: 'Estado' },
  ];

  dataTableRows = [
    { id: '1', codigo: 'RPT-001', descripcion: 'Asiento de ajuste', monto: '1,500.00', estado: 'Elaborado' },
    { id: '2', codigo: 'RPT-002', descripcion: 'Corrección contable', monto: '3,200.00', estado: 'Verificado' },
    { id: '3', codigo: 'RPT-003', descripcion: 'Ajuste mensual', monto: '800.00', estado: 'Aprobado' },
  ];

  docRecordsColumns = [
    { key: 'codigo', label: 'Código', visibility: 'visible' as const, group: 'default' as const, kind: 'document-link' as const },
    { key: 'tipo', label: 'Tipo', visibility: 'visible' as const, group: 'default' as const },
    { key: 'estado', label: 'Estado', visibility: 'visible' as const, group: 'default' as const, kind: 'flow-status' as const },
    { key: 'fecha', label: 'Fecha', visibility: 'visible' as const, group: 'default' as const },
  ];

  docRecordsRows = [
    { codigo: 'ASA-0001', tipo: 'Asiento de Ajuste', estado: 'Elaborado', fecha: '03/05/2026' },
    { codigo: 'ASA-0002', tipo: 'Asiento de Ajuste', estado: 'Verificado', fecha: '02/05/2026' },
  ];

  defaultColumns = [
    { key: 'codigo', label: 'Código', visibility: 'visible' as const, group: 'default' as const },
    { key: 'tipo', label: 'Tipo', visibility: 'visible' as const, group: 'default' as const },
    { key: 'estado', label: 'Estado', visibility: 'hidden' as const, group: 'more' as const },
  ];

  trayItems = [
    { label: 'Recibidos', icon: 'inbox', count: '12' },
    { label: 'Enviados', icon: 'send', count: '4' },
    { label: 'Borradores', icon: 'draft', count: '7', active: true },
    { label: 'Papelera', icon: 'delete', count: '0' },
  ];

  demoFile = new File(['contenido de prueba'], 'documento-sustento.pdf', { type: 'application/pdf' });
}
