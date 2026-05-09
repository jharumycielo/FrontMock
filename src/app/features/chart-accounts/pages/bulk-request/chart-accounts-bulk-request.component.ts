import { ChangeDetectionStrategy, Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';

import { BreadcrumbItem } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { FormTableSearchComponent } from '../../../../shared/components/form-table-search/form-table-search.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { SolicitudeFormCardComponent } from '../../../../shared/components/solicitude-form-card/solicitude-form-card.component';
import { SolicitudeInfoCardComponent, SolicitudeInfoField } from '../../../../shared/components/solicitude-info-card/solicitude-info-card.component';
import { SolicitudePageLayoutComponent } from '../../../../shared/components/solicitude-page-layout/solicitude-page-layout.component';
import { TableControlsComponent } from '../../../../shared/components/table-controls/table-controls.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { DateTimePickerComponent } from '../../../../shared/ui/date-time-picker/date-time-picker.component';
import { LoaderComponent } from '../../../../shared/ui/loader/loader.component';
import { MessageBoxComponent } from '../../../../shared/ui/message-box/message-box.component';
import { SnackbarComponent } from '../../../../shared/ui/snackbar/snackbar.component';
import { TextAreaControlComponent } from '../../../../shared/ui/text-area-control/text-area-control.component';
import { TextFieldComponent, TextFieldOption } from '../../../../shared/ui/text-field/text-field.component';
import { TooltipComponent } from '../../../../shared/ui/tooltip/tooltip.component';
import { UploadedFileCardComponent } from '../../../../shared/ui/uploaded-file-card/uploaded-file-card.component';
import { UploadSideNavComponent } from '../../../../shared/ui/upload-side-nav/upload-side-nav.component';
import { findProcessPathById } from '../../../../layout/process-menu-tree/process-menu-tree.component';

const PROCESS_ID = 'plan-cuentas-contables';
const PROCESS_ROUTE = '/procesos/plan-cuentas-contables';
const BULK_REQUEST_LABEL = 'Solicitud de carga masiva de plan de cuentas contables';
const BULK_TEMPLATE_HREF = 'assets/templates/plantilla-carga-masiva-plan-cuentas-contables-creacion.xlsx';

const getProcessHref = (nodeId: string): string => nodeId === PROCESS_ID ? PROCESS_ROUTE : '/panel';

const buildBreadcrumbs = (): BreadcrumbItem[] => [
  ...findProcessPathById(PROCESS_ID).map((node) => ({ label: node.label, href: getProcessHref(node.id) })),
  { label: BULK_REQUEST_LABEL }
];

type LoadedAccountRow = {
  selected: boolean;
  element: string;
  group: string;
  account: string;
  subAccount1: string;
  subAccount2: string;
  subAccount3: string;
  name: string;
  imputable: string;
  previousCode: string;
  institutionalScopes: string;
  appliesExtraBudgetary: string;
  reciprocal: string;
};

type BulkExcelData = {
  planName: string;
  planDescription: string;
  accounts: LoadedAccountRow[];
};

@Component({
  selector: 'siaf-chart-accounts-bulk-request',
  standalone: true,
  imports: [
    ButtonComponent,
    DateTimePickerComponent,
    FormTableSearchComponent,
    LoaderComponent,
    MessageBoxComponent,
    PaginationComponent,
    SnackbarComponent,
    SolicitudeFormCardComponent,
    SolicitudeInfoCardComponent,
    SolicitudePageLayoutComponent,
    TableControlsComponent,
    TextAreaControlComponent,
    TextFieldComponent,
    TooltipComponent,
    UploadedFileCardComponent,
    UploadSideNavComponent
  ],
  template: `
    <div class="min-h-[calc(100vh-56px)] bg-[var(--sys-color-bg-surfaces-surface-lowest)] text-text">
      <siaf-solicitude-page-layout
        [breadcrumbs]="breadcrumbs"
        role="creator"
        state="new"
        heading="Solicitud de carga masiva de plan de cuentas contables"
        secondaryText="Creación"
        [showReturn]="true"
        [saveDisabled]="true"
        [verifyDisabled]="true"
        (returned)="goBack()"
        (canceled)="goBack()"
      >
        <siaf-solicitude-info-card [fields]="infoFields" [liveDate]="true" />

        <siaf-solicitude-form-card title="Lista de cuentas contables">
          <siaf-tooltip card-actions text="Carga masiva">
            <siaf-button
              variant="accent"
              size="md"
              icon="file_upload"
              [iconOnly]="true"
              ariaLabel="Cargar archivo Excel de cuentas contables"
              (click)="bulkUploadSideNavOpen.set(true)"
            />
          </siaf-tooltip>

          @if (bulkProcessing()) {
            <div class="flex min-h-[331px] flex-col items-center justify-center gap-5 px-siaf-xl py-siaf-lg">
              <siaf-loader class="text-[var(--sys-color-text-neutral-low)]" [size]="32" [dotSize]="6" />
              <p class="m-0 text-center text-lg font-bold leading-normal tracking-[-0.11px] text-[var(--sys-color-text-neutral-low)]">
                {{ processingMessage() }}
              </p>
            </div>
          } @else if (bulkProcessed()) {
            <section class="flex flex-col gap-siaf-lg">
              <div class="flex flex-col gap-siaf-md">
                <h3 class="m-0 text-sm font-bold uppercase leading-5 text-text">Datos generales del plan de cuentas contables</h3>
                <siaf-input
                  label="Nombre del plan de cuentas contables"
                  [required]="true"
                  [value]="loadedPlanName()"
                  [disabled]="true"
                />
                <text-area-control
                  placeholder="Descripción del plan de cuentas contables"
                  [required]="true"
                  [maxlength]="200"
                  [value]="loadedPlanDescription()"
                  [disabled]="true"
                />
                <div class="grid gap-siaf-md lg:grid-cols-2">
                  <siaf-input
                    label="Tipo de plan contable"
                    type="select"
                    [required]="true"
                    [options]="planTypeOptions"
                    [value]="bulkPlanType()"
                    [disabled]="true"
                  />
                  <siaf-input
                    label="Plan contable actual por reemplazar"
                    type="select"
                    [required]="replacementPlanRequired()"
                    [options]="replacementPlanOptions"
                    [value]="replacementPlan()"
                    [disabled]="true"
                  />
                </div>
                <siaf-date-time-picker
                  label="Fecha inicio desde"
                  [required]="true"
                  [value]="loadedStartDate()"
                  [disabled]="false"
                  (valueChange)="loadedStartDate.set($event)"
                />
              </div>

              <div class="flex flex-col gap-siaf-md">
                <h3 class="m-0 text-sm font-bold uppercase leading-5 text-text">Cuentas contables</h3>
                <siaf-form-table-search
                  [value]="accountsSearch()"
                  placeholder="Buscar"
                  ariaLabel="Buscar cuentas contables"
                  (valueChange)="onAccountsSearch($event)"
                />

                <siaf-table-controls
                  selectAllLabel="Seleccionar cuentas contables"
                  editLabel="Editar cuenta contable seleccionada"
                  deleteLabel="Eliminar cuentas contables seleccionadas"
                  [checked]="false"
                  [indeterminate]="false"
                  [selectedCount]="0"
                  [showEditAction]="true"
                  [showDeleteAction]="true"
                  [showMenuAction]="true"
                  [editDisabled]="true"
                  [page]="accountsPage()"
                  [pageSize]="accountsRowsPerPage()"
                  [totalItems]="filteredAccounts().length"
                  [totalPages]="accountsTotalPages()"
                  (previous)="onAccountsPreviousPage()"
                  (next)="onAccountsNextPage()"
                />

                <div class="min-w-0 overflow-x-auto">
                  <table class="w-full min-w-[1880px] border-collapse text-left text-sm">
                    <thead>
                      <tr class="h-10 bg-[var(--sys-color-bg-surfaces-surface-high)] text-xs font-bold uppercase text-text">
                        <th class="w-10 rounded-l-siaf-sm px-siaf-sm py-siaf-sm"></th>
                        <th class="w-[110px] px-siaf-md py-siaf-sm">Elemento</th>
                        <th class="w-[110px] px-siaf-md py-siaf-sm">Grupo</th>
                        <th class="w-[110px] px-siaf-md py-siaf-sm">Cuenta</th>
                        <th class="w-[140px] px-siaf-md py-siaf-sm">Sub cuenta</th>
                        <th class="w-[140px] px-siaf-md py-siaf-sm">Sub cuenta 1</th>
                        <th class="w-[140px] px-siaf-md py-siaf-sm">Sub cuenta 2</th>
                        <th class="w-[140px] px-siaf-md py-siaf-sm">Sub cuenta 3</th>
                        <th class="w-[320px] px-siaf-md py-siaf-sm">Nombre de la cuenta contable</th>
                        <th class="w-[120px] px-siaf-md py-siaf-sm">¿Imputable?</th>
                        <th class="w-[150px] px-siaf-md py-siaf-sm">Código anterior</th>
                        <th class="w-[220px] px-siaf-md py-siaf-sm">Ámbitos institucionales</th>
                        <th class="w-[90px] px-siaf-md py-siaf-sm">AEP</th>
                        <th class="w-[120px] rounded-r-siaf-sm px-siaf-md py-siaf-sm">¿Recíproca?</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (row of pagedAccounts(); track row.name) {
                        <tr class="h-12 border-b border-[var(--sys-color-divider-default)] bg-surface text-[var(--sys-color-text-neutral-medium)]">
                          <td class="px-siaf-md py-siaf-sm">
                            <input class="size-4 accent-brand-primary" type="checkbox" [checked]="row.selected" />
                          </td>
                          <td class="px-siaf-md py-siaf-sm">{{ row.element }}</td>
                          <td class="px-siaf-md py-siaf-sm">{{ row.group }}</td>
                          <td class="px-siaf-md py-siaf-sm">{{ row.account }}</td>
                          <td class="px-siaf-md py-siaf-sm">-</td>
                          <td class="px-siaf-md py-siaf-sm">{{ row.subAccount1 }}</td>
                          <td class="px-siaf-md py-siaf-sm">{{ row.subAccount2 }}</td>
                          <td class="px-siaf-md py-siaf-sm">{{ row.subAccount3 }}</td>
                          <td class="px-siaf-md py-siaf-sm text-text">{{ row.name }}</td>
                          <td class="px-siaf-md py-siaf-sm">{{ row.imputable }}</td>
                          <td class="px-siaf-md py-siaf-sm">{{ row.previousCode }}</td>
                          <td class="px-siaf-md py-siaf-sm">{{ row.institutionalScopes }}</td>
                          <td class="px-siaf-md py-siaf-sm">{{ row.appliesExtraBudgetary }}</td>
                          <td class="px-siaf-md py-siaf-sm">{{ row.reciprocal }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>

                <siaf-pagination
                  navigation="Activate"
                  position="Bottom"
                  [rowPage]="true"
                  [page]="accountsPage()"
                  [pageSize]="accountsRowsPerPage()"
                  [totalItems]="filteredAccounts().length"
                  [totalPages]="accountsTotalPages()"
                  [rowsPerPage]="accountsRowsPerPage()"
                  [rowsPerPageOptions]="accountsRowsPerPageOptions"
                  (previous)="onAccountsPreviousPage()"
                  (next)="onAccountsNextPage()"
                  (rowsPerPageChange)="onAccountsRowsPerPageChange($event)"
                />
              </div>
            </section>
          } @else {
            <div class="flex min-h-[49px] items-center rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-low)] px-siaf-md py-siaf-sm">
              <p class="m-0 text-sm leading-normal tracking-[0.0249px] text-[var(--sys-color-text-neutral-medium)]">
                Sube un archivo Excel en el formato correcto. Si no lo tienes,
                <a
                  class="font-bold text-brand-primary underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                  [href]="bulkTemplateHref"
                  download="plantilla-carga-masiva-plan-cuentas-contables-creacion.xlsx"
                >
                  descárgalo aquí.
                </a>
              </p>
            </div>
          }

        </siaf-solicitude-form-card>

        <siaf-solicitude-form-card title="Justificación del sustento">
          <text-area-control
            placeholder="Justificación del requerimiento solicitado"
            [required]="true"
            [maxlength]="500"
            [value]="justification()"
            (valueChange)="justification.set($event)"
          />

          <section class="flex flex-col gap-siaf-md">
            <div class="flex min-h-10 items-center justify-between gap-siaf-md">
              <h3 class="m-0 text-sm font-bold uppercase leading-5 text-text">Documento de sustento</h3>
              <siaf-button
                variant="accent"
                size="md"
                icon="file_upload"
                [iconOnly]="true"
                ariaLabel="Subir documento de sustento"
                (click)="supportUploadSideNavOpen.set(true)"
              />
            </div>

            @if (supportFile()) {
              <siaf-uploaded-file-card
                [file]="supportFile()"
                (replace)="supportUploadSideNavOpen.set(true)"
                (removed)="supportFile.set(null)"
              />
            } @else {
              <message-box text="No se han adjuntado archivos. Por favor, haga clic en el botón para subir un archivo." />
            }
          </section>
        </siaf-solicitude-form-card>
      </siaf-solicitude-page-layout>

      <siaf-upload-side-nav
        variant="bulk-chart-accounts"
        [open]="bulkUploadSideNavOpen()"
        title="Cargar cuentas contables"
        accept=".xlsx"
        acceptedLabel="Solo admite archivos .xlsx"
        hint="Se permiten archivos de 10 MB como máximo"
        [maxSizeMb]="10"
        [templateHref]="bulkTemplateHref"
        templateDownloadName="plantilla-carga-masiva-plan-cuentas-contables-creacion.xlsx"
        [planTypeOptions]="planTypeOptions"
        [replacementPlanOptions]="replacementPlanOptions"
        [planTypeValue]="bulkPlanType()"
        [replacementPlanValue]="replacementPlan()"
        [replacementPlanRequired]="replacementPlanRequired()"
        (planTypeValueChange)="bulkPlanType.set($event)"
        (replacementPlanValueChange)="replacementPlan.set($event)"
        (closed)="bulkUploadSideNavOpen.set(false)"
        (confirmed)="onBulkUploadConfirmed($event)"
      />

      <siaf-upload-side-nav
        [open]="supportUploadSideNavOpen()"
        title="Cargar documento de sustento"
        description="Sube un archivo .PDF en el formato correcto."
        accept=".pdf"
        acceptedLabel="Solo admite archivos .pdf"
        hint="Se permiten archivos de 10 MB como máximo"
        [maxSizeMb]="10"
        (closed)="supportUploadSideNavOpen.set(false)"
        (confirmed)="onSupportUploadConfirmed($event)"
      />

      <div class="fixed bottom-siaf-lg left-1/2 z-[70] w-[min(430px,calc(100vw-32px))] -translate-x-1/2">
        <siaf-snackbar [open]="successSnackbarOpen()" variant="custom" (closed)="successSnackbarOpen.set(false)">
          <span><strong class="font-bold">La carga masiva</strong> del Plan de Cuentas Contables se procesó <strong class="font-bold">exitosamente</strong>.</span>
        </siaf-snackbar>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartAccountsBulkRequestComponent implements OnDestroy {
  private readonly router = inject(Router);
  private processingTimers: ReturnType<typeof setTimeout>[] = [];

  readonly breadcrumbs = buildBreadcrumbs();
  readonly bulkTemplateHref = BULK_TEMPLATE_HREF;
  readonly justification = signal('');
  readonly bulkUploadSideNavOpen = signal(false);
  readonly bulkFile = signal<File | null>(null);
  readonly bulkProcessing = signal(false);
  readonly bulkProcessed = signal(false);
  readonly bulkPlanType = signal('');
  readonly replacementPlan = signal('');
  readonly replacementPlanRequired = signal(false);
  readonly processingMessage = signal('Validando estructura de la plantilla...');
  readonly successSnackbarOpen = signal(false);
  readonly loadedPlanName = signal('');
  readonly loadedPlanDescription = signal('');
  readonly loadedStartDate = signal('2025-08-19');
  readonly accountsSearch = signal('');
  readonly accountsPage = signal(1);
  readonly accountsRowsPerPage = signal(10);
  readonly accountsRowsPerPageOptions = [10, 25, 50, 100];
  readonly supportUploadSideNavOpen = signal(false);
  readonly supportFile = signal<File | null>(null);
  readonly planTypeOptions: TextFieldOption[] = [
    { label: 'Plan Contable Gubernamental Único', value: 'pcgu' },
    { label: 'Plan Contable General Empresarial', value: 'pcge' },
    { label: 'Manual de Contabilidad para las Empresas del Sistema Financiero', value: 'mc_esf' }
  ];
  readonly replacementPlanOptions: TextFieldOption[] = [
    { label: 'Plan Contable Gubernamental Único vigente', value: 'pcgu_vigente' },
    { label: 'Plan Contable General Empresarial vigente', value: 'pcge_vigente' },
    { label: 'Manual de Contabilidad para las Empresas del Sistema Financiero vigente', value: 'mc_esf_vigente' }
  ];
  readonly infoFields: SolicitudeInfoField[] = [
    { label: 'Fecha', value: '' },
    { label: 'Órgano de linea', value: 'DIRECCIÓN GENERAL DE CONTABILIDAD PÚBLICA' },
    { label: 'Entidad', value: 'MINISTERIO DE ECONOMIA Y FINANZAS' }
  ];
  readonly processedExcelAccounts = signal<LoadedAccountRow[]>([]);
  readonly filteredAccounts = computed(() => {
    const term = this.accountsSearch().trim().toLowerCase();
    const accounts = this.processedExcelAccounts();

    if (!term) {
      return accounts;
    }

    return accounts.filter((row) => [
      row.element,
      row.group,
      row.account,
      row.subAccount1,
      row.subAccount2,
      row.subAccount3,
      row.name,
      row.imputable,
      row.previousCode,
      row.institutionalScopes,
      row.appliesExtraBudgetary,
      row.reciprocal
    ].some((value) => value.toLowerCase().includes(term)));
  });
  readonly accountsTotalPages = computed(() => Math.max(1, Math.ceil(this.filteredAccounts().length / this.accountsRowsPerPage())));
  readonly pagedAccounts = computed(() => {
    const start = (this.accountsPage() - 1) * this.accountsRowsPerPage();
    return this.filteredAccounts().slice(start, start + this.accountsRowsPerPage());
  });

  goBack(): void {
    void this.router.navigate([PROCESS_ROUTE]);
  }

  onBulkUploadConfirmed(file: File): void {
    this.bulkFile.set(file);
    this.bulkUploadSideNavOpen.set(false);
    void this.startBulkProcessing(file);
  }

  onSupportUploadConfirmed(file: File): void {
    this.supportFile.set(file);
    this.supportUploadSideNavOpen.set(false);
  }

  inputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  onAccountsSearch(value: string): void {
    this.accountsSearch.set(value);
    this.accountsPage.set(1);
  }

  onAccountsPreviousPage(): void {
    this.accountsPage.update((page) => Math.max(1, page - 1));
  }

  onAccountsNextPage(): void {
    this.accountsPage.update((page) => Math.min(this.accountsTotalPages(), page + 1));
  }

  onAccountsRowsPerPageChange(value: number): void {
    this.accountsRowsPerPage.set(value);
    this.accountsPage.set(1);
  }

  ngOnDestroy(): void {
    this.processingTimers.forEach((timer) => clearTimeout(timer));
  }

  private async startBulkProcessing(file: File): Promise<void> {
    this.processingTimers.forEach((timer) => clearTimeout(timer));
    this.processingTimers = [];
    this.bulkProcessing.set(true);
    this.bulkProcessed.set(false);
    this.successSnackbarOpen.set(false);
    this.processedExcelAccounts.set([]);
    this.accountsSearch.set('');
    this.accountsPage.set(1);
    this.processingMessage.set('Validando estructura de la plantilla...');

    this.processingTimers.push(setTimeout(() => {
      this.processingMessage.set('Validando datos generales del plan contable...');
    }, 900));

    this.processingTimers.push(setTimeout(() => {
      this.processingMessage.set('Procesando cuentas contables cargadas...');
    }, 1800));

    let excelData: BulkExcelData;

    try {
      excelData = await this.readBulkExcel(file);
    } catch {
      this.processingTimers.forEach((timer) => clearTimeout(timer));
      this.processingTimers = [];
      this.processingMessage.set('No se pudo validar la plantilla cargada.');
      this.bulkProcessing.set(false);
      return;
    }

    this.processingTimers.push(setTimeout(() => {
      this.loadedPlanName.set(excelData.planName);
      this.loadedPlanDescription.set(excelData.planDescription);
      this.processedExcelAccounts.set(excelData.accounts);
      this.bulkProcessing.set(false);
      this.bulkProcessed.set(true);
      this.successSnackbarOpen.set(true);
    }, 2800));
  }

  private async readBulkExcel(file: File): Promise<BulkExcelData> {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames.includes('Carga masiva') ? 'Carga masiva' : workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
      throw new Error('No se encontro una hoja valida.');
    }

    const planName = this.cellText(sheet, 'B2');
    const planDescription = this.cellText(sheet, 'B3');
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      blankrows: false,
      defval: ''
    });

    const accounts = rows
      .slice(5)
      .map((row) => this.mapExcelAccountRow(row))
      .filter((row) => row.element || row.group || row.account || row.name);

    if (!planName || !accounts.length) {
      throw new Error('La plantilla no tiene los datos obligatorios.');
    }

    return {
      planName,
      planDescription,
      accounts
    };
  }

  private mapExcelAccountRow(row: unknown[]): LoadedAccountRow {
    return {
      selected: false,
      element: this.excelText(row[0]),
      group: this.excelText(row[1]),
      account: this.excelText(row[2]),
      subAccount1: this.excelText(row[3], '-'),
      subAccount2: this.excelText(row[4], '-'),
      subAccount3: this.excelText(row[5], '-'),
      name: this.excelText(row[6]),
      imputable: this.excelText(row[7], 'No'),
      previousCode: this.excelText(row[8], '--'),
      institutionalScopes: this.excelText(row[12], '-'),
      appliesExtraBudgetary: this.excelText(row[13], 'No'),
      reciprocal: this.excelText(row[14], 'No')
    };
  }

  private cellText(sheet: XLSX.WorkSheet, address: string): string {
    return this.excelText(sheet[address]?.v);
  }

  private excelText(value: unknown, fallback = ''): string {
    if (value === null || value === undefined) {
      return fallback;
    }

    const normalized = String(value).trim();
    return normalized || fallback;
  }
}
