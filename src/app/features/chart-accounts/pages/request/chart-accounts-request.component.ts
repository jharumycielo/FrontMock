import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { BreadcrumbItem } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { TableControlsComponent } from '../../../../shared/components/table-controls/table-controls.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { findProcessPathById } from '../../../../layout/process-menu-tree/process-menu-tree.component';
import { SolicitudeFormCardComponent } from '../../../../shared/components/solicitude-form-card/solicitude-form-card.component';
import { SolicitudeInfoCardComponent, SolicitudeInfoField } from '../../../../shared/components/solicitude-info-card/solicitude-info-card.component';
import { SolicitudePageLayoutComponent } from '../../../../shared/components/solicitude-page-layout/solicitude-page-layout.component';
import { TextAreaControlComponent } from '../../../../shared/ui/text-area-control/text-area-control.component';
import { AlertComponent } from '../../../../shared/ui/alert/alert.component';
import { TextFieldComponent, TextFieldOption } from '../../../../shared/ui/text-field/text-field.component';
import { UploadedFileCardComponent } from '../../../../shared/ui/uploaded-file-card/uploaded-file-card.component';
import { UploadSidePanelComponent } from '../../../../shared/ui/upload-side-panel/upload-side-panel.component';

type TipoPlanContable = {
  id: string;
  nombre: string;
};

const TIPOS_PLAN_CONTABLE: TipoPlanContable[] = [
  { id: '1', nombre: 'Plan Contable Gubernamental Único' },
  { id: '2', nombre: 'Plan Contable General Empresarial' },
  { id: '3', nombre: 'Manual de Contabilidad para las Empresas del Sistema Financiero' }
];

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

interface ExternalEntityOption {
  code: string;
  name: string;
}

type CreatedAccountingAccount = {
  code: string;
  element: string;
  group: string;
  account: string;
  subAccount: string;
  subAccount1: string;
  subAccount2: string;
  subAccount3: string;
  name: string;
  imputable: string;
  previousCode: string;
  institutionalScopes: string;
  appliesExtraBudgetary: string;
  reciprocal: string;
  form: CreatedAccountingAccountForm;
};

type CreatedAccountingAccountForm = {
  code: string;
  name: string;
  imputable: 'si' | 'no' | '';
  previousAccountCode: string;
  accountNature: string;
  elementType: string;
  monetaryAccount: string;
  institutionalScope: string[];
  appliesExtraBudgetary: boolean;
  reciprocalAccount: boolean;
  activeCurrent: string;
  passiveCurrent: string;
  activeNonCurrent: string;
  passiveNonCurrent: string;
  hasAccountingDynamics: 'si' | 'no' | '';
  debitDescription: string;
  creditDescription: string;
  objectDescription: string;
  balanceDescription: string;
  accountForStateEntity: 'si' | 'no' | '';
};

const EXTERNAL_ENTITY_OPTIONS: ExternalEntityOption[] = [
  { code: '2.4', name: 'Municipalidad A' },
  { code: '2.5', name: 'Municipalidad B' },
  { code: '2.6', name: 'Municipalidad C' },
  { code: '2.7', name: 'Municipalidad D' },
  { code: '2.8', name: 'Municipalidad E' },
  { code: '2.9', name: 'Municipalidad F' },
  { code: '2.10', name: 'Municipalidad G' },
  { code: '2.11', name: 'Municipalidad H' },
  { code: '2.12', name: 'Municipalidad I' },
  { code: '2.13', name: 'Municipalidad J' }
];

@Component({
  selector: 'siaf-chart-accounts-request',
  standalone: true,
  imports: [
    AlertComponent,
    ButtonComponent,
    IconComponent,
    PaginationComponent,
    TableControlsComponent,
    SolicitudeFormCardComponent,
    SolicitudeInfoCardComponent,
    SolicitudePageLayoutComponent,
    TextAreaControlComponent,
    TextFieldComponent,
    UploadedFileCardComponent,
    UploadSidePanelComponent
  ],
  template: `
    <div class="min-h-[calc(100vh-56px)] bg-[var(--sys-color-bg-surfaces-surface-lowest)] text-text">
        <siaf-solicitude-page-layout
          [breadcrumbs]="breadcrumbs"
          role="creator"
          state="new"
          heading="Solicitud de Cuentas Contables"
          secondaryText="Creación"
          [showReturn]="true"
          [saveDisabled]="true"
          [verifyDisabled]="true"
          (returned)="goToDocuments()"
          (canceled)="goToDocuments()"
        >
          <siaf-solicitude-info-card [fields]="entityFields" [liveDate]="true" />

          @if (accountingAccountFormOpen()) {
            <section class="rounded-siaf-md bg-surface">
              <header class="flex min-h-14 flex-col gap-siaf-sm px-siaf-lg pt-siaf-md sm:flex-row sm:items-center sm:justify-between">
                <h2 class="m-0 text-base font-bold uppercase leading-10 tracking-[0.02px] text-text">Crear cuenta contable</h2>
                <div class="flex shrink-0 items-center gap-siaf-xs">
                  <siaf-button variant="secondary" size="md" (click)="cancelAccountingAccountForm()">Cancelar</siaf-button>
                  <siaf-button variant="primary" size="md" [disabled]="!accountingAccountFormValid()" (click)="acceptAccountingAccountForm()">Aceptar</siaf-button>
                </div>
              </header>

              <div class="flex flex-col gap-siaf-lg px-siaf-lg py-siaf-md">
                <section class="grid gap-siaf-md">
                  <div class="flex min-h-10 items-center justify-between gap-siaf-md">
                    <h3 class="m-0 text-sm font-bold uppercase text-text">Buscar tipo plan de cuentas contable</h3>
                    <siaf-button variant="accent" size="md" icon="search" [iconOnly]="true" ariaLabel="Buscar tipo plan de cuentas contable" (click)="openTipoPlanPanel()" />
                  </div>
                  @if (selectedTipoPlan()) {
                    <div class="relative flex min-h-[49px] items-center rounded-siaf-md border border-border px-siaf-xl py-siaf-xs">
                      <span class="absolute left-[-1px] top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-siaf-sm bg-brand-primary"></span>
                      <span class="flex-1 text-sm font-bold text-text">{{ selectedTipoPlan()!.nombre }}</span>
                      <button class="inline-flex size-8 shrink-0 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[rgba(32,32,32,0.12)]" type="button" aria-label="Quitar plan contable" (click)="selectedTipoPlan.set(null)">
                        <siaf-icon name="close" [size]="20" />
                      </button>
                    </div>
                  } @else {
                    <div class="flex min-h-[49px] items-center rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-low)] px-siaf-md py-siaf-sm">
                      <p class="m-0 text-sm leading-normal tracking-[0.0249px] text-[var(--sys-color-text-neutral-medium)]">No se ha seleccionado ningún tipo. Haga clic en el botón para realizar una selección.</p>
                    </div>
                  }
                </section>

                @if (selectedTipoPlan()) {
                  @if (codeValidationState() === 'idle') {
                    <siaf-alert
                      tone="info"
                      title="Código de cuenta contable"
                      description="Para crear la cuenta contable, ingrese un código único que no esté en uso."
                    />
                  } @else if (codeValidationState() === 'invalid') {
                    <siaf-alert
                      tone="error"
                      title="Formato de código inválido"
                      description="Use puntos como separadores cuando ingrese más de un nivel. Puede crear solo el elemento, por ejemplo 1, o niveles como 1.1.01 y 1.22.31.1."
                    />
                  } @else if (codeValidationState() === 'inUse') {
                    <siaf-alert
                      tone="error"
                      title="Código ya registrado"
                      description="El código ingresado ya se encuentra creado en el sistema. Debe crear y registrar otro código."
                    />
                  } @else if (codeValidationState() === 'valid') {
                    <siaf-alert
                      tone="success"
                      title="Validación exitosa"
                      description="El código ingresado no está en uso. Puede continuar con la creación de la cuenta contable."
                    />
                  }
                }

                <section class="grid gap-siaf-md">
                  <h3 class="m-0 min-h-10 text-sm font-bold uppercase leading-10 text-text">Nueva cuenta contable</h3>
                  <div class="grid gap-siaf-md lg:grid-cols-[320px_minmax(0,1fr)]">
                    <siaf-input
                      label="Código de la nueva cuenta"
                      [required]="true"
                      [value]="newAccountCode()"
                      [error]="newAccountCodeError()"
                      [state]="codeValidationState() === 'valid' ? 'success' : 'enabled'"
                      [disabled]="formDisabled"
                      (valueChange)="onNewAccountCodeChange($event)"
                    />
                    <siaf-input label="Nombre de la cuenta contable" [required]="true" [value]="newAccountName()" [disabled]="formDisabled" (valueChange)="newAccountName.set(textFieldValue($event))" />
                  </div>
                  <div class="flex flex-wrap items-center gap-siaf-md">
                    <h4 class="m-0 w-[280px] text-sm font-bold text-text">¿Es una cuenta imputable?</h4>
                    <label class="inline-flex h-10 items-center gap-siaf-xs text-sm text-text">
                      <input class="size-4 accent-brand-primary" type="radio" name="account-imputable" [checked]="newAccountImputable() === 'si'" [disabled]="formDisabled" (change)="setNewAccountImputable('si')" />
                      Si
                    </label>
                    <label class="inline-flex h-10 items-center gap-siaf-xs text-sm text-text">
                      <input class="size-4 accent-brand-primary" type="radio" name="account-imputable" [checked]="newAccountImputable() === 'no'" [disabled]="formDisabled" (change)="setNewAccountImputable('no')" />
                      No
                    </label>
                  </div>
                </section>

                <section class="grid gap-siaf-md">
                  <h3 class="m-0 min-h-10 text-sm font-bold uppercase leading-10 text-text">Asociar código de cuenta contable anterior</h3>
                  <div class="grid gap-siaf-md md:grid-cols-2">
                    <siaf-input label="Código de la cuenta contable" type="select" leadingIcon="search" [options]="previousAccountOptions" [value]="previousAccountCode()" [disabled]="formDisabled" [clearable]="true" (valueChange)="onPreviousAccountSelected($event)" />
                    <siaf-input label="Nombre de la cuenta contable seleccionada" [value]="previousAccountName" [disabled]="true" />
                  </div>
                </section>

                <section class="grid gap-siaf-md">
                  <h3 class="m-0 min-h-10 text-sm font-bold uppercase leading-10 text-text">Atributos de la cuenta contable</h3>
                  <div class="grid gap-siaf-md lg:grid-cols-3">
                    <siaf-input label="Naturaleza" type="select" [required]="true" [options]="natureOptions" [value]="accountNature()" [disabled]="formDisabled" (valueChange)="accountNature.set(textFieldValue($event))" />
                    <siaf-input label="Tipo de elemento" type="select" [required]="true" [options]="elementTypeOptions" [value]="elementType()" [disabled]="formDisabled" (valueChange)="elementType.set(textFieldValue($event))" />
                    <siaf-input label="¿Es monetaria?" type="select" [required]="true" [options]="yesNoOptions" [value]="monetaryAccount()" [disabled]="formDisabled" (valueChange)="monetaryAccount.set(textFieldValue($event))" />
                  </div>
                  <siaf-input label="Ámbito institucional de aplicación" type="select-multiple" [required]="true" [options]="institutionalScopeOptions" [value]="institutionalScope()" [disabled]="formDisabled" (valueChange)="institutionalScope.set(arrayFieldValue($event))" />
                  <label class="inline-flex min-h-10 items-center gap-siaf-xs text-sm text-text">
                    <input class="size-4 accent-[var(--sys-color-icon-states-enabled)]" type="checkbox" [checked]="appliesExtraBudgetary()" [disabled]="formDisabled" (change)="appliesExtraBudgetary.set(checkedValue($event))" />
                    ¿Aplica Extra Presupuestaria? (AEP)
                  </label>
                  <label class="inline-flex min-h-10 items-center gap-siaf-xs text-sm text-text">
                    <input class="size-4 accent-[var(--sys-color-icon-states-enabled)]" type="checkbox" [checked]="reciprocalAccount()" [disabled]="formDisabled || newAccountImputable() === 'no'" (change)="reciprocalAccount.set(checkedValue($event))" />
                    ¿Es Recíproca ? (RECI)
                  </label>
                  <div class="grid gap-siaf-md md:grid-cols-2 xl:grid-cols-4">
                    <siaf-input label="AC Activo" type="select" [options]="activeOptions" [value]="activeCurrent()" [disabled]="formDisabled" [clearable]="true" (valueChange)="activeCurrent.set(textFieldValue($event))" />
                    <siaf-input label="PC Pasivo" type="select" [options]="passiveOptions" [value]="passiveCurrent()" [disabled]="formDisabled" [clearable]="true" (valueChange)="passiveCurrent.set(textFieldValue($event))" />
                    <siaf-input label="ANC Activo" type="select" [options]="activeOptions" [value]="activeNonCurrent()" [disabled]="formDisabled" [clearable]="true" (valueChange)="activeNonCurrent.set(textFieldValue($event))" />
                    <siaf-input label="PNC Pasivo" type="select" [options]="passiveOptions" [value]="passiveNonCurrent()" [disabled]="formDisabled" [clearable]="true" (valueChange)="passiveNonCurrent.set(textFieldValue($event))" />
                  </div>
                </section>

                <section class="grid gap-siaf-md">
                  <h3 class="m-0 min-h-10 text-sm font-bold uppercase leading-10 text-text">Dinámica contable</h3>
                  <div class="flex flex-wrap items-center gap-siaf-md">
                    <h4 class="m-0 w-[280px] text-sm font-bold text-text">¿Tiene dinámica contable?</h4>
                    <label class="inline-flex h-10 items-center gap-siaf-xs text-sm text-text">
                      <input class="size-4 accent-brand-primary" type="radio" name="account-dynamics" [checked]="hasAccountingDynamics() === 'si'" [disabled]="accountingDynamicsDisabled" (change)="setAccountingDynamics('si')" />
                      Si
                    </label>
                    <label class="inline-flex h-10 items-center gap-siaf-xs text-sm text-text">
                      <input class="size-4 accent-brand-primary" type="radio" name="account-dynamics" [checked]="hasAccountingDynamics() === 'no'" [disabled]="accountingDynamicsDisabled" (change)="setAccountingDynamics('no')" />
                      No
                    </label>
                  </div>
                  <div class="grid gap-siaf-md md:grid-cols-2">
                    <text-area-control
                      placeholder="Se debita por"
                      [maxlength]="4000"
                      [value]="debitDescription()"
                      [disabled]="formDisabled || hasAccountingDynamics() !== 'si'"
                      (valueChange)="debitDescription.set($event)"
                    />
                    <text-area-control
                      placeholder="Se acredita por"
                      [maxlength]="4000"
                      [value]="creditDescription()"
                      [disabled]="formDisabled || hasAccountingDynamics() !== 'si'"
                      (valueChange)="creditDescription.set($event)"
                    />
                    <text-area-control
                      placeholder="Objeto"
                      [maxlength]="4000"
                      [value]="objectDescription()"
                      [disabled]="formDisabled || hasAccountingDynamics() !== 'si'"
                      (valueChange)="objectDescription.set($event)"
                    />
                    <text-area-control
                      placeholder="Saldos"
                      [maxlength]="4000"
                      [value]="balanceDescription()"
                      [disabled]="formDisabled || hasAccountingDynamics() !== 'si'"
                      (valueChange)="balanceDescription.set($event)"
                    />
                  </div>
                  <div class="flex flex-wrap items-center gap-siaf-md">
                    <h4 class="m-0 text-sm font-bold text-text">¿Cuenta contable para una entidad del estado?</h4>
                    <label class="inline-flex h-10 items-center gap-siaf-xs text-sm text-text">
                      <input class="size-4 accent-brand-primary" type="radio" name="state-entity-account" [checked]="accountForStateEntity() === 'si'" [disabled]="formDisabled" (change)="accountForStateEntity.set('si')" />
                      Si
                    </label>
                    <label class="inline-flex h-10 items-center gap-siaf-xs text-sm text-text">
                      <input class="size-4 accent-brand-primary" type="radio" name="state-entity-account" [checked]="accountForStateEntity() === 'no'" [disabled]="formDisabled" (change)="accountForStateEntity.set('no')" />
                      No
                    </label>
                  </div>
                  <div class="flex min-h-10 items-center justify-between gap-siaf-md">
                    <h3 class="m-0 text-sm font-bold uppercase text-text">Entidades del estado</h3>
                    <siaf-button
                      [variant]="accountForStateEntity() === 'si' ? 'accent' : 'secondary'"
                      size="md"
                      icon="search"
                      [iconOnly]="true"
                      ariaLabel="Agregar entidades del estado"
                      [disabled]="formDisabled || accountForStateEntity() !== 'si'"
                    />
                  </div>
                  <div class="flex min-h-[49px] items-center rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-low)] px-siaf-md py-siaf-sm">
                    <p class="m-0 text-sm leading-normal tracking-[0.0249px] text-[var(--sys-color-text-neutral-medium)]">Por favor, haga clic en el botón para agregar una o varias entidades del estado.</p>
                  </div>
                </section>

                <section class="grid gap-siaf-md">
                  <h3 class="m-0 min-h-10 text-sm font-bold uppercase leading-10 text-text">Vigencia y visible</h3>
                  <div class="grid gap-siaf-md lg:grid-cols-[280px_minmax(0,1fr)_minmax(0,1fr)]">
                    <div class="flex flex-wrap items-center gap-siaf-xs">
                      <h4 class="m-0 text-sm font-bold text-text">¿Está vigente?</h4>
                      <label class="inline-flex h-10 items-center gap-siaf-xs text-sm text-text">
                        <input class="size-4 accent-brand-primary" type="radio" name="account-current" [checked]="accountCurrent() === 'si'" [disabled]="true" />
                        Si
                      </label>
                      <label class="inline-flex h-10 items-center gap-siaf-xs text-sm text-text">
                        <input class="size-4 accent-brand-primary" type="radio" name="account-current" [checked]="accountCurrent() === 'no'" [disabled]="true" />
                        No
                      </label>
                    </div>
                    <siaf-input label="Fecha inicio desde" trailingIcon="calendar_today" [value]="validFrom()" [disabled]="true" />
                    <siaf-input label="Fecha fin hasta" trailingIcon="calendar_today" [value]="validUntil()" [disabled]="true" />
                  </div>
                  <label class="inline-flex min-h-10 items-center gap-siaf-xs text-sm text-text">
                    <input class="size-4 accent-[var(--sys-color-icon-states-enabled)]" type="checkbox" [checked]="accountVisible()" [disabled]="true" />
                    ¿Está visible?
                  </label>
                </section>
              </div>
            </section>
          } @else {
          <siaf-solicitude-form-card title="Lista de cuentas contables">
            <ng-container card-actions>
              <siaf-button variant="accent" size="md" icon="add" [iconOnly]="true" ariaLabel="Crear registro de cuenta contable" (click)="openAccountingAccountForm()" />
            </ng-container>
            @if (createdAccountingAccounts().length > 0) {
              <siaf-table-controls
                selectAllLabel="Seleccionar cuentas contables"
                editLabel="Editar cuenta contable seleccionada"
                deleteLabel="Eliminar cuentas contables seleccionadas"
                [checked]="allCreatedAccountsSelected()"
                [indeterminate]="someCreatedAccountsSelected()"
                [selectedCount]="selectedCreatedAccountCodes().length"
                [showEditAction]="true"
                [showDeleteAction]="true"
                [showMenuAction]="true"
                [editDisabled]="selectedCreatedAccountCodes().length !== 1"
                [page]="createdAccountsPage()"
                [pageSize]="createdAccountsRowsPerPage()"
                [totalItems]="createdAccountingAccounts().length"
                [totalPages]="createdAccountsTotalPages()"
                (selectionChange)="toggleAllCreatedAccounts($event)"
                (edit)="editSelectedCreatedAccount()"
                (delete)="deleteSelectedCreatedAccounts()"
                (previous)="onCreatedAccountsPreviousPage()"
                (next)="onCreatedAccountsNextPage()"
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
                    @for (account of pagedCreatedAccountingAccounts(); track account.code) {
                      <tr class="h-12 border-b border-[var(--sys-color-divider-default)] bg-surface text-[var(--sys-color-text-neutral-medium)]">
                        <td class="px-siaf-sm py-siaf-sm">
                          <input class="size-4 accent-[var(--sys-color-icon-states-enabled)]" type="checkbox" [checked]="isCreatedAccountSelected(account.code)" [attr.aria-label]="'Seleccionar ' + account.name" (change)="toggleCreatedAccount(account.code, checkedValue($event))" />
                        </td>
                        <td class="px-siaf-md py-siaf-sm">{{ account.element }}</td>
                        <td class="px-siaf-md py-siaf-sm">{{ account.group }}</td>
                        <td class="px-siaf-md py-siaf-sm">{{ account.account }}</td>
                        <td class="px-siaf-md py-siaf-sm">{{ account.subAccount }}</td>
                        <td class="px-siaf-md py-siaf-sm">{{ account.subAccount1 }}</td>
                        <td class="px-siaf-md py-siaf-sm">{{ account.subAccount2 }}</td>
                        <td class="px-siaf-md py-siaf-sm">{{ account.subAccount3 }}</td>
                        <td class="px-siaf-md py-siaf-sm text-text">{{ account.name }}</td>
                        <td class="px-siaf-md py-siaf-sm">{{ account.imputable }}</td>
                        <td class="px-siaf-md py-siaf-sm">{{ account.previousCode }}</td>
                        <td class="px-siaf-md py-siaf-sm">{{ account.institutionalScopes }}</td>
                        <td class="px-siaf-md py-siaf-sm">{{ account.appliesExtraBudgetary }}</td>
                        <td class="px-siaf-md py-siaf-sm">{{ account.reciprocal }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
              <siaf-pagination navigation="Activate" position="Bottom" [rowPage]="true" [page]="createdAccountsPage()" [pageSize]="createdAccountsRowsPerPage()" [totalItems]="createdAccountingAccounts().length" [totalPages]="createdAccountsTotalPages()" [rowsPerPage]="createdAccountsRowsPerPage()" [rowsPerPageOptions]="createdAccountsRowsPerPageOptions" (previous)="onCreatedAccountsPreviousPage()" (next)="onCreatedAccountsNextPage()" (rowsPerPageChange)="onCreatedAccountsRowsPerPageChange($event)" />
            } @else {
              <div class="flex min-h-[49px] items-center rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-low)] px-siaf-md py-siaf-sm">
                <p class="m-0 text-sm leading-normal tracking-[0.0249px] text-[var(--sys-color-text-neutral-medium)]">Por favor, haga clic en el boton (+) para crear una cuenta contable.</p>
              </div>
            }
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
                <siaf-button
                  variant="accent"
                  size="md"
                  icon="search"
                  [iconOnly]="true"
                  ariaLabel="Buscar nombre de la entidad proveniente"
                  [disabled]="externalOrigin() !== 'si'"
                  (click)="openExternalEntityPanel()"
                />
              </div>

              @if (acceptedExternalEntity()) {
                <div class="relative flex items-center gap-siaf-md rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface p-siaf-md">
                  <span class="absolute left-[-1px] top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-br-siaf-sm rounded-tr-siaf-sm bg-[var(--sys-color-icon-states-active,#014899)]"></span>
                  <div class="grid min-w-0 flex-1 gap-siaf-md sm:grid-cols-2">
                    <div class="flex min-w-0 flex-col gap-siaf-xxs">
                      <span class="truncate text-[11px] font-medium uppercase leading-none tracking-[0.66px] text-[var(--sys-color-text-neutral-low)]">Código</span>
                      <span class="truncate text-sm font-bold leading-6 tracking-[-0.02px] text-[var(--sys-color-text-neutral-medium)]">{{ acceptedExternalEntity()!.code }}</span>
                    </div>
                    <div class="flex min-w-0 flex-col gap-siaf-xxs">
                      <span class="truncate text-[11px] font-medium uppercase leading-none tracking-[0.66px] text-[var(--sys-color-text-neutral-low)]">Nombre de la entidad</span>
                      <span class="truncate text-sm font-bold leading-6 tracking-[-0.02px] text-[var(--sys-color-text-neutral-medium)]">{{ acceptedExternalEntity()!.name }}</span>
                    </div>
                  </div>
                  <button class="inline-flex size-6 shrink-0 items-center justify-center rounded-siaf-sm text-text transition hover:bg-surface-muted" type="button" aria-label="Quitar entidad proveniente" (click)="clearExternalEntitySelection()">
                    <siaf-icon name="close" [size]="24" />
                  </button>
                </div>
              } @else {
              <div class="flex min-h-[49px] items-center rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-low)] px-siaf-md py-siaf-sm">
                <p class="m-0 text-sm leading-normal tracking-[0.0249px] text-[var(--sys-color-text-neutral-medium)]">No se ha seleccionado ninguna Entidad. Haga clic en el botón para realizar una selección.</p>
              </div>
              }
            </section>
          </siaf-solicitude-form-card>

          <siaf-solicitude-form-card title="Justificación del sustento">
              <text-area-control
                placeholder="Justificación del requerimiento solicitado"
                [required]="true"
                [maxlength]="500"
                [value]="justification()"
                (valueChange)="justification.set($event)"
              />

              <div class="flex flex-col gap-siaf-xs">
                <div class="flex min-h-10 items-center justify-between gap-siaf-md">
                  <h3 class="m-0 text-sm font-bold uppercase text-text">Documento de sustento</h3>
                  <siaf-button variant="accent" size="md" icon="file_upload" [iconOnly]="true" ariaLabel="Subir documento de sustento" (click)="uploadPanelOpen.set(true)" />
                </div>

                @if (uploadedFile()) {
                  <siaf-uploaded-file-card [file]="uploadedFile()" (replace)="uploadPanelOpen.set(true)" (removed)="uploadedFile.set(null)" />
                } @else {
                  <div class="flex min-h-[49px] items-center rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-low)] px-siaf-md py-siaf-sm">
                    <p class="m-0 text-sm leading-normal tracking-[0.0249px] text-[var(--sys-color-text-neutral-medium)]">No se han adjuntado archivos. Por favor, haga clic en el botón para subir un archivo.</p>
                  </div>
                }
              </div>
          </siaf-solicitude-form-card>
          }
        </siaf-solicitude-page-layout>

      <siaf-upload-side-panel
        [open]="uploadPanelOpen()"
        (closed)="uploadPanelOpen.set(false)"
        (confirmed)="onUploadConfirmed($event)"
      />

      @if (externalEntityPanelOpen()) {
        <section class="fixed inset-y-0 left-0 right-0 z-50 bg-black/55 pl-0 lg:pl-[65px]" aria-modal="true" role="dialog" aria-labelledby="external-entity-panel-title" (click)="closeExternalEntityPanel()">
          <aside class="flex h-screen w-full flex-col overflow-hidden bg-surface shadow-siaf-lg lg:rounded-l-siaf-md" (click)="$event.stopPropagation()">
            <header class="flex h-14 shrink-0 items-center gap-siaf-xs border-b border-[var(--sys-color-divider-strong,rgba(32,32,32,0.24))] px-siaf-md">
              <h2 id="external-entity-panel-title" class="m-0 min-w-0 flex-1 text-base font-bold uppercase leading-normal tracking-[0.02px] text-text">Selecciona la entidad externa</h2>
              <button
                class="inline-flex size-10 items-center justify-center rounded-siaf-md text-text transition hover:bg-surface-muted active:bg-[rgba(32,32,32,0.12)]"
                type="button"
                aria-label="Cerrar selección de entidad externa"
                (click)="closeExternalEntityPanel()"
              >
                <siaf-icon name="close" [size]="24" />
              </button>
            </header>

            <div class="min-h-0 flex-1 overflow-y-auto border-b border-[var(--sys-color-divider-strong,rgba(32,32,32,0.24))] px-siaf-md py-siaf-md sm:px-siaf-xl">
              <div class="flex flex-col gap-siaf-lg">
              <div class="flex items-start gap-siaf-md">
                <label class="flex h-10 min-w-0 flex-1 items-center rounded-siaf-md border border-[rgba(32,32,32,0.4)] bg-surface px-siaf-md">
                  <span class="sr-only">Buscar</span>
                  <input class="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-text-muted" placeholder="Buscar" [value]="externalEntitySearch()" (input)="externalEntitySearch.set(inputValue($event))" />
                </label>
                <div class="flex shrink-0 items-center gap-siaf-xs">
                  <button class="inline-flex size-10 items-center justify-center rounded-siaf-md text-text transition hover:bg-surface-muted" type="button" aria-label="Filtros">
                    <siaf-icon name="filter_list" [size]="24" />
                  </button>
                  <button class="inline-flex size-10 items-center justify-center rounded-siaf-md text-text transition hover:bg-surface-muted" type="button" aria-label="Mas opciones">
                    <siaf-icon name="more_vert" [size]="24" />
                  </button>
                </div>
              </div>

              <siaf-pagination navigation="Activate" position="Top" [page]="externalEntityPage" [pageSize]="externalEntityRowsPerPage" [totalItems]="externalEntityTotalItems" [totalPages]="externalEntityTotalPages" (previous)="onExternalEntityPreviousPage()" (next)="onExternalEntityNextPage()" />

              <div class="min-h-0 flex-1 overflow-auto">
                <table class="w-full min-w-[520px] border-collapse text-left">
                  <thead class="sticky top-0 z-[1] bg-[var(--sys-color-bg-surfaces-surface-high)]">
                    <tr class="h-10 border-b border-[var(--sys-color-divider-strong)] text-xs font-bold uppercase text-text">
                      <th class="w-12 px-siaf-sm"></th>
                      <th class="w-[82px] px-siaf-md py-siaf-sm">Código</th>
                      <th class="px-siaf-md py-siaf-sm">Nombre de la entidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (entity of filteredExternalEntities(); track entity.code) {
                      <tr class="h-12 border-b border-[var(--sys-color-divider-default)] text-sm text-[var(--sys-color-text-neutral-medium)] hover:bg-surface-muted/60">
                        <td class="px-siaf-sm py-siaf-sm">
                          <input
                            class="size-5 accent-brand-primary"
                            type="radio"
                            name="external-entity"
                            [checked]="selectedExternalEntityCode() === entity.code"
                            [attr.aria-label]="'Seleccionar ' + entity.name"
                            (change)="selectedExternalEntityCode.set(entity.code)"
                          />
                        </td>
                        <td class="px-siaf-md py-siaf-sm">{{ entity.code }}</td>
                        <td class="px-siaf-md py-siaf-sm">{{ entity.name }}</td>
                      </tr>
                    } @empty {
                      <tr>
                        <td class="px-siaf-md py-siaf-lg text-sm text-text-muted" colspan="3">No se encontraron entidades.</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <siaf-pagination navigation="Activate" position="Bottom" [rowPage]="true" [page]="externalEntityPage" [pageSize]="externalEntityRowsPerPage" [totalItems]="externalEntityTotalItems" [totalPages]="externalEntityTotalPages" [rowsPerPage]="externalEntityRowsPerPage" [rowsPerPageOptions]="externalEntityRowsPerPageOptions" (previous)="onExternalEntityPreviousPage()" (next)="onExternalEntityNextPage()" (rowsPerPageChange)="onExternalEntityRowsPerPageChange($event)" />
              </div>
            </div>
            <footer class="flex shrink-0 items-center justify-end gap-siaf-xs px-siaf-md py-siaf-sm">
              <siaf-button variant="secondary" (click)="closeExternalEntityPanel()">Cancelar</siaf-button>
              <siaf-button variant="primary" [disabled]="!selectedExternalEntityCode()" (click)="acceptExternalEntitySelection()">Aceptar</siaf-button>
            </footer>
          </aside>
        </section>
      }

      @if (tipoPlanPanelOpen()) {
        <section class="fixed inset-y-0 left-0 right-0 z-50 bg-black/55 pl-0 lg:pl-[65px]" aria-modal="true" role="dialog" aria-labelledby="tipo-plan-panel-title" (click)="closeTipoPlanPanel()">
          <aside class="flex h-screen w-full flex-col overflow-hidden bg-surface shadow-siaf-lg lg:rounded-l-siaf-md" (click)="$event.stopPropagation()">
            <header class="flex h-14 shrink-0 items-center gap-siaf-xs border-b border-[var(--sys-color-divider-strong,rgba(32,32,32,0.24))] px-siaf-md">
              <h2 id="tipo-plan-panel-title" class="m-0 min-w-0 flex-1 text-base font-bold uppercase leading-normal tracking-[0.02px] text-text">Seleccionar plan de cuentas contable</h2>
              <button class="inline-flex size-10 items-center justify-center rounded-siaf-md text-text transition hover:bg-surface-muted active:bg-[rgba(32,32,32,0.12)]" type="button" aria-label="Cerrar selección de plan de cuentas contable" (click)="closeTipoPlanPanel()">
                <siaf-icon name="close" [size]="24" />
              </button>
            </header>

            <div class="min-h-0 flex-1 overflow-y-auto border-b border-[var(--sys-color-divider-strong,rgba(32,32,32,0.24))] px-siaf-md py-siaf-md sm:px-siaf-xl">
              <div class="flex flex-col gap-siaf-lg">
                <div class="flex items-start gap-siaf-md">
                  <label class="flex h-10 min-w-0 flex-1 items-center rounded-siaf-md border border-[rgba(32,32,32,0.4)] bg-surface px-siaf-md">
                    <span class="sr-only">Buscar</span>
                    <input class="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-text-muted" placeholder="Buscar" [value]="tipoPlanSearch()" (input)="tipoPlanSearch.set(inputValue($event))" />
                  </label>
                  <div class="flex shrink-0 items-center gap-siaf-xs">
                    <button class="inline-flex size-10 items-center justify-center rounded-siaf-md text-text transition hover:bg-surface-muted" type="button" aria-label="Filtros">
                      <siaf-icon name="filter_list" [size]="24" />
                    </button>
                    <button class="inline-flex size-10 items-center justify-center rounded-siaf-md text-text transition hover:bg-surface-muted" type="button" aria-label="Mas opciones">
                      <siaf-icon name="more_vert" [size]="24" />
                    </button>
                  </div>
                </div>

                <div class="min-h-0 flex-1 overflow-auto">
                  <table class="w-full border-collapse text-left">
                    <thead class="sticky top-0 z-[1] bg-[var(--sys-color-bg-surfaces-surface-high)]">
                      <tr class="h-10 border-b border-[var(--sys-color-divider-strong)] text-xs font-bold uppercase text-text">
                        <th class="w-12 px-siaf-sm"></th>
                        <th class="px-siaf-md py-siaf-sm">Tipo de plan contable</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (plan of filteredTiposPlan(); track plan.id) {
                        <tr class="h-12 border-b border-[var(--sys-color-divider-default)] text-sm text-[var(--sys-color-text-neutral-medium)] hover:bg-surface-muted/60 cursor-pointer" (click)="tempSelectedTipoPlan.set(plan)">
                          <td class="px-siaf-sm py-siaf-sm">
                            <input
                              class="size-5 accent-brand-primary"
                              type="radio"
                              name="tipo-plan"
                              [checked]="tempSelectedTipoPlan()?.id === plan.id"
                              [attr.aria-label]="'Seleccionar ' + plan.nombre"
                              (change)="tempSelectedTipoPlan.set(plan)"
                            />
                          </td>
                          <td class="px-siaf-md py-siaf-sm">{{ plan.nombre }}</td>
                        </tr>
                      } @empty {
                        <tr>
                          <td class="px-siaf-md py-siaf-lg text-sm text-text-muted" colspan="2">No se encontraron planes.</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <footer class="flex shrink-0 items-center justify-end gap-siaf-xs px-siaf-md py-siaf-sm">
              <siaf-button variant="secondary" (click)="closeTipoPlanPanel()">Cancelar</siaf-button>
              <siaf-button variant="primary" [disabled]="!tempSelectedTipoPlan()" (click)="confirmTipoPlanSelection()">Aceptar</siaf-button>
            </footer>
          </aside>
        </section>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartAccountsRequestComponent {
  private readonly router = inject(Router);

  // Códigos existentes (mock — reemplazar con llamada real a API)
  private readonly EXISTING_ACCOUNT_CODES = new Set(['1.1.01', '1.1.02', '1.1.03', '1.2.01', '2.1.01']);

  readonly externalOrigin = signal<'si' | 'no' | ''>('');
  readonly tipoPlanPanelOpen = signal(false);
  readonly selectedTipoPlan = signal<TipoPlanContable | null>(null);
  readonly tempSelectedTipoPlan = signal<TipoPlanContable | null>(null);
  readonly tipoPlanSearch = signal('');

  readonly filteredTiposPlan = computed(() => {
    const search = this.normalize(this.tipoPlanSearch());
    if (!search) return TIPOS_PLAN_CONTABLE;
    return TIPOS_PLAN_CONTABLE.filter(p => this.normalize(p.nombre).includes(search));
  });

  readonly justification = signal('');
  readonly createdAccountingAccounts = signal<CreatedAccountingAccount[]>([]);
  readonly selectedCreatedAccountCodes = signal<string[]>([]);
  readonly createdAccountsRowsPerPageOptions = [10, 25, 50, 100];
  readonly createdAccountsRowsPerPage = signal(25);
  readonly createdAccountsPage = signal(1);
  readonly uploadPanelOpen = signal(false);
  readonly uploadedFile = signal<File | null>(null);
  readonly accountingAccountFormOpen = signal(false);
  readonly editingCreatedAccountCode = signal('');
  readonly newAccountCode = signal('');
  readonly newAccountCodeInUse = signal(false);
  readonly codeValidationState = computed<'idle' | 'invalid' | 'inUse' | 'valid'>(() => {
    const code = this.newAccountCode().trim();
    if (!code) return 'idle';
    if (!this.isValidAccountingCode(code)) return 'invalid';
    if (
      this.EXISTING_ACCOUNT_CODES.has(code) ||
      this.createdAccountingAccounts().some((account) => account.code === code && account.code !== this.editingCreatedAccountCode())
    ) {
      return 'inUse';
    }
    return 'valid';
  });
  readonly newAccountCodeError = computed(() => {
    const state = this.codeValidationState();
    if (state === 'invalid') {
      return 'Use puntos como separadores. Ejemplo: 1 o 1.1.01';
    }
    if (state === 'inUse') {
      return 'El codigo ingresado esta en uso';
    }
    return '';
  });
  readonly newAccountName = signal('');
  readonly newAccountImputable = signal<'si' | 'no' | ''>('');
  readonly previousAccountCode = signal('');
  readonly accountNature = signal('');
  readonly elementType = signal('');
  readonly monetaryAccount = signal('');
  readonly institutionalScope = signal<string[]>([]);
  readonly appliesExtraBudgetary = signal(false);
  readonly reciprocalAccount = signal(false);
  readonly activeCurrent = signal('');
  readonly passiveCurrent = signal('');
  readonly activeNonCurrent = signal('');
  readonly passiveNonCurrent = signal('');
  readonly hasAccountingDynamics = signal<'si' | 'no' | ''>('');
  readonly debitDescription = signal('');
  readonly creditDescription = signal('');
  readonly objectDescription = signal('');
  readonly balanceDescription = signal('');
  readonly accountForStateEntity = signal<'si' | 'no' | ''>('');
  readonly accountCurrent = signal<'si' | 'no' | ''>('si');
  readonly validFrom = signal('');
  readonly validUntil = signal('');
  readonly accountVisible = signal(true);
  readonly externalEntityPanelOpen = signal(false);
  readonly externalEntitySearch = signal('');
  readonly selectedExternalEntityCode = signal('');
  readonly acceptedExternalEntity = signal<ExternalEntityOption | null>(null);
  externalEntityPage = 1;
  externalEntityRowsPerPage = 25;
  readonly externalEntityRowsPerPageOptions = [10, 25, 50, 100];
  readonly externalEntityTotalItems = 800;

  readonly filteredExternalEntities = computed(() => {
    const search = this.normalize(this.externalEntitySearch());

    if (!search) {
      return EXTERNAL_ENTITY_OPTIONS;
    }

    return EXTERNAL_ENTITY_OPTIONS.filter((entity) => this.normalize(`${entity.code} ${entity.name}`).includes(search));
  });

  readonly accountingAccountFormValid = computed(() => {
    if (!this.selectedTipoPlan() || this.codeValidationState() !== 'valid') {
      return false;
    }

    const requiredValues = [
      this.newAccountName(),
      this.newAccountImputable(),
      this.accountNature(),
      this.elementType(),
      this.monetaryAccount(),
    ];

    if (requiredValues.some((value) => !String(value).trim()) || this.institutionalScope().length === 0) {
      return false;
    }

    if (this.hasAccountingDynamics() === 'si') {
      return [
        this.debitDescription(),
        this.creditDescription(),
        this.objectDescription(),
        this.balanceDescription(),
      ].every((value) => value.trim().length > 0);
    }

    return this.hasAccountingDynamics() === 'no';
  });

  readonly createdAccountsTotalPages = computed(() =>
    Math.max(1, Math.ceil(this.createdAccountingAccounts().length / this.createdAccountsRowsPerPage()))
  );

  readonly pagedCreatedAccountingAccounts = computed(() => {
    const start = (this.createdAccountsPage() - 1) * this.createdAccountsRowsPerPage();
    return this.createdAccountingAccounts().slice(start, start + this.createdAccountsRowsPerPage());
  });

  readonly allCreatedAccountsSelected = computed(() => {
    const rows = this.pagedCreatedAccountingAccounts();
    return rows.length > 0 && rows.every((account) => this.selectedCreatedAccountCodes().includes(account.code));
  });

  readonly someCreatedAccountsSelected = computed(() => {
    const rows = this.pagedCreatedAccountingAccounts();
    return rows.some((account) => this.selectedCreatedAccountCodes().includes(account.code)) && !this.allCreatedAccountsSelected();
  });

  readonly previousAccountOptions: TextFieldOption[] = [
    { label: '1101 - Caja y bancos', value: '1101' },
    { label: '1201 - Cuentas por cobrar', value: '1201' },
    { label: '2101 - Cuentas por pagar', value: '2101' }
  ];

  readonly previousAccountNames: Record<string, string> = {
    '1101': 'Caja y bancos',
    '1201': 'Cuentas por cobrar',
    '2101': 'Cuentas por pagar'
  };

  readonly natureOptions: TextFieldOption[] = [
    { label: 'Debe', value: 'debe' },
    { label: 'Haber', value: 'haber' },
    { label: 'Ambos', value: 'ambos' },
  ];

  readonly elementTypeOptions: TextFieldOption[] = [
    { label: 'Activo', value: 'activo' },
    { label: 'Pasivo', value: 'pasivo' },
    { label: 'Patrimonio', value: 'patrimonio' },
    { label: 'Gasto', value: 'gasto' },
    { label: 'Ingreso', value: 'ingreso' },
  ];

  readonly yesNoOptions: TextFieldOption[] = [
    { label: 'Si', value: 'si' },
    { label: 'No', value: 'no' }
  ];

  readonly institutionalScopeOptions: TextFieldOption[] = [
    { label: 'Entidades del Poder Ejecutivo (EPE)', value: 'epe' },
    { label: 'Entidades del Poder Legislativo (EPL)', value: 'epl' },
    { label: 'Entidades del Poder Judicial (EPJ)', value: 'epj' },
    { label: 'Organismos Constitucionales Autónomos (OCA)', value: 'oca' },
    { label: 'Gobiernos Regionales (GR)', value: 'gr' },
    { label: 'Gobiernos Locales (GL)', value: 'gl' },
    { label: 'Entidades de Tratamiento Empresarial (ETE)', value: 'ete' },
    { label: 'Empresas Públicas del Estado (EPP)', value: 'epp' },
    { label: 'Empresas Públicas de Derecho Privado (EPD)', value: 'epd' },
    { label: 'Fondos y Fideicomisos (FF)', value: 'ff' },
    { label: 'Organismos Reguladores (OR)', value: 'or' },
    { label: 'Organismos Supervisores (OS)', value: 'os' }
  ];

  readonly activeOptions: TextFieldOption[] = [
    { label: 'Si', value: 'si' },
    { label: 'No', value: 'no' }
  ];

  readonly passiveOptions: TextFieldOption[] = [
    { label: 'Si', value: 'si' },
    { label: 'No', value: 'no' }
  ];

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Inicio', href: '/panel' },
    ...buildChartAccountsBreadcrumbs('Solicitud de Cuentas Contables')
  ];

  readonly entityFields: SolicitudeInfoField[] = [
    { label: 'Fecha', value: '' },
    { label: 'Órgano de línea', value: 'DIRECCIÓN GENERAL DE CONTABILIDAD PÚBLICA' },
    { label: 'Entidad', value: 'MINISTERIO DE ECONOMIA Y FINANZAS' }
  ];

  get externalEntityMessage(): string {
    const entity = this.acceptedExternalEntity();

    if (!entity) {
      return 'No se ha seleccionado ninguna Entidad. Haga clic en el botón para realizar una selección.';
    }

    return `${entity.code} - ${entity.name}`;
  }

  goToDocuments(): void {
    void this.router.navigate([CHART_ACCOUNTS_PROCESS_ROUTE]);
  }

  closeFloatingPanels(): void {
    this.externalEntityPanelOpen.set(false);
    this.tipoPlanPanelOpen.set(false);
  }

  get hasFloatingPanel(): boolean {
    return this.externalEntityPanelOpen();
  }

  inputValue(event: Event): string {
    return (event.target as HTMLInputElement | HTMLTextAreaElement).value;
  }

  textFieldValue(value: string | number | string[]): string {
    return Array.isArray(value) ? value.join(', ') : String(value);
  }

  arrayFieldValue(value: string | number | string[]): string[] {
    return Array.isArray(value) ? value : [String(value)];
  }

  checkedValue(event: Event): boolean {
    return (event.target as HTMLInputElement).checked;
  }

  openAccountingAccountForm(): void {
    this.editingCreatedAccountCode.set('');
    this.accountingAccountFormOpen.set(true);
  }

  cancelAccountingAccountForm(): void {
    this.accountingAccountFormOpen.set(false);
    this.editingCreatedAccountCode.set('');
    this.resetAccountingAccountForm();
  }

  private resetAccountingAccountForm(): void {
    this.newAccountCode.set('');
    this.newAccountCodeInUse.set(false);
    this.newAccountName.set('');
    this.newAccountImputable.set('');
    this.previousAccountCode.set('');
    this.accountNature.set('');
    this.elementType.set('');
    this.monetaryAccount.set('');
    this.institutionalScope.set([]);
    this.appliesExtraBudgetary.set(false);
    this.hasAccountingDynamics.set('');
    this.reciprocalAccount.set(false);
    this.activeCurrent.set('');
    this.passiveCurrent.set('');
    this.activeNonCurrent.set('');
    this.passiveNonCurrent.set('');
    this.accountForStateEntity.set('');
    this.clearAccountingDynamicsDescriptions();
  }

  openTipoPlanPanel(): void {
    this.tipoPlanSearch.set('');
    this.tempSelectedTipoPlan.set(this.selectedTipoPlan());
    this.tipoPlanPanelOpen.set(true);
  }

  closeTipoPlanPanel(): void {
    this.tipoPlanPanelOpen.set(false);
  }

  confirmTipoPlanSelection(): void {
    const selected = this.tempSelectedTipoPlan();
    if (!selected) return;
    this.selectedTipoPlan.set(selected);
    this.tipoPlanPanelOpen.set(false);
  }

  onNewAccountCodeChange(value: string | number | string[]): void {
    const code = this.textFieldValue(value).replace(/\s+/g, '').replace(/[^\d.]/g, '');
    this.newAccountCode.set(code);
    this.newAccountCodeInUse.set(this.codeValidationState() === 'inUse');
  }

  get formDisabled(): boolean {
    return !this.selectedTipoPlan();
  }

  get accountingDynamicsDisabled(): boolean {
    return true;
  }

  get previousAccountName(): string {
    return this.previousAccountNames[this.previousAccountCode()] ?? '';
  }

  onPreviousAccountSelected(value: string | number | string[]): void {
    this.previousAccountCode.set(this.textFieldValue(value));
  }

  setNewAccountImputable(value: 'si' | 'no'): void {
    this.newAccountImputable.set(value);
    this.hasAccountingDynamics.set(value);

    if (value === 'no') {
      this.reciprocalAccount.set(false);
      this.clearAccountingDynamicsDescriptions();
    }
  }

  setAccountingDynamics(value: 'si' | 'no'): void {
    if (this.accountingDynamicsDisabled) {
      return;
    }

    this.hasAccountingDynamics.set(value);

    if (value === 'no') {
      this.clearAccountingDynamicsDescriptions();
    }
  }

  acceptAccountingAccountForm(): void {
    if (!this.accountingAccountFormValid()) {
      return;
    }

    const nextAccount = this.buildCreatedAccountingAccount();
    const editingCode = this.editingCreatedAccountCode();

    this.createdAccountingAccounts.update((accounts) => {
      if (!editingCode) {
        return [...accounts, nextAccount];
      }

      return accounts.map((account) => account.code === editingCode ? nextAccount : account);
    });
    this.createdAccountsPage.set(this.createdAccountsTotalPages());
    this.accountingAccountFormOpen.set(false);
    this.editingCreatedAccountCode.set('');
    this.resetAccountingAccountForm();
  }

  isCreatedAccountSelected(code: string): boolean {
    return this.selectedCreatedAccountCodes().includes(code);
  }

  toggleCreatedAccount(code: string, selected: boolean): void {
    this.selectedCreatedAccountCodes.update((codes) => {
      if (selected) {
        return codes.includes(code) ? codes : [...codes, code];
      }

      return codes.filter((selectedCode) => selectedCode !== code);
    });
  }

  toggleAllCreatedAccounts(selected: boolean): void {
    const pageCodes = this.pagedCreatedAccountingAccounts().map((account) => account.code);
    this.selectedCreatedAccountCodes.update((codes) => {
      if (selected) {
        return Array.from(new Set([...codes, ...pageCodes]));
      }

      return codes.filter((code) => !pageCodes.includes(code));
    });
  }

  deleteSelectedCreatedAccounts(): void {
    const selectedCodes = new Set(this.selectedCreatedAccountCodes());
    this.createdAccountingAccounts.update((accounts) => accounts.filter((account) => !selectedCodes.has(account.code)));
    this.selectedCreatedAccountCodes.set([]);
    this.createdAccountsPage.set(Math.min(this.createdAccountsPage(), this.createdAccountsTotalPages()));
  }

  editSelectedCreatedAccount(): void {
    const selectedCode = this.selectedCreatedAccountCodes()[0];
    const account = this.createdAccountingAccounts().find((item) => item.code === selectedCode);

    if (!account) {
      return;
    }

    this.applyCreatedAccountForm(account.form);
    this.editingCreatedAccountCode.set(account.code);
    this.selectedCreatedAccountCodes.set([]);
    this.accountingAccountFormOpen.set(true);
  }

  onCreatedAccountsPreviousPage(): void {
    this.createdAccountsPage.update((page) => Math.max(1, page - 1));
  }

  onCreatedAccountsNextPage(): void {
    this.createdAccountsPage.update((page) => Math.min(this.createdAccountsTotalPages(), page + 1));
  }

  onCreatedAccountsRowsPerPageChange(value: number): void {
    this.createdAccountsRowsPerPage.set(value);
    this.createdAccountsPage.set(1);
  }

  private buildCreatedAccountingAccount(): CreatedAccountingAccount {
    const segments = this.newAccountCode()
      .split('.')
      .map((segment) => segment.trim())
      .filter(Boolean);
    const form = this.buildCreatedAccountingAccountForm();

    return {
      code: form.code,
      element: segments[0] || '-',
      group: segments[1] || '-',
      account: segments[2] || '-',
      subAccount: segments[3] || '-',
      subAccount1: segments[4] || '-',
      subAccount2: segments[5] || '-',
      subAccount3: segments[6] || '-',
      name: this.newAccountName().trim(),
      imputable: this.yesNoLabel(this.newAccountImputable()),
      previousCode: this.previousAccountCode() || '--',
      institutionalScopes: this.institutionalScopeLabels(),
      appliesExtraBudgetary: this.yesNoLabel(this.appliesExtraBudgetary() ? 'si' : 'no'),
      reciprocal: this.yesNoLabel(this.reciprocalAccount() ? 'si' : 'no'),
      form,
    };
  }

  private buildCreatedAccountingAccountForm(): CreatedAccountingAccountForm {
    return {
      code: this.newAccountCode().trim(),
      name: this.newAccountName().trim(),
      imputable: this.newAccountImputable(),
      previousAccountCode: this.previousAccountCode(),
      accountNature: this.accountNature(),
      elementType: this.elementType(),
      monetaryAccount: this.monetaryAccount(),
      institutionalScope: [...this.institutionalScope()],
      appliesExtraBudgetary: this.appliesExtraBudgetary(),
      reciprocalAccount: this.reciprocalAccount(),
      activeCurrent: this.activeCurrent(),
      passiveCurrent: this.passiveCurrent(),
      activeNonCurrent: this.activeNonCurrent(),
      passiveNonCurrent: this.passiveNonCurrent(),
      hasAccountingDynamics: this.hasAccountingDynamics(),
      debitDescription: this.debitDescription(),
      creditDescription: this.creditDescription(),
      objectDescription: this.objectDescription(),
      balanceDescription: this.balanceDescription(),
      accountForStateEntity: this.accountForStateEntity(),
    };
  }

  private applyCreatedAccountForm(form: CreatedAccountingAccountForm): void {
    this.newAccountCode.set(form.code);
    this.newAccountName.set(form.name);
    this.newAccountImputable.set(form.imputable);
    this.previousAccountCode.set(form.previousAccountCode);
    this.accountNature.set(form.accountNature);
    this.elementType.set(form.elementType);
    this.monetaryAccount.set(form.monetaryAccount);
    this.institutionalScope.set([...form.institutionalScope]);
    this.appliesExtraBudgetary.set(form.appliesExtraBudgetary);
    this.reciprocalAccount.set(form.reciprocalAccount);
    this.activeCurrent.set(form.activeCurrent);
    this.passiveCurrent.set(form.passiveCurrent);
    this.activeNonCurrent.set(form.activeNonCurrent);
    this.passiveNonCurrent.set(form.passiveNonCurrent);
    this.hasAccountingDynamics.set(form.hasAccountingDynamics);
    this.debitDescription.set(form.debitDescription);
    this.creditDescription.set(form.creditDescription);
    this.objectDescription.set(form.objectDescription);
    this.balanceDescription.set(form.balanceDescription);
    this.accountForStateEntity.set(form.accountForStateEntity);
  }

  private isValidAccountingCode(code: string): boolean {
    const segments = code.split('.');

    if (segments.length < 1 || segments.length > 7 || segments.some((segment) => segment.length === 0)) {
      return false;
    }

    const [element, ...levels] = segments;
    return /^\d$/.test(element) && levels.every((segment) => /^\d{1,2}$/.test(segment) && Number(segment) <= 99);
  }

  private institutionalScopeLabels(): string {
    const labels = this.institutionalScope()
      .map((value) => this.institutionalScopeOptions.find((option) => option.value === value)?.label || value)
      .map((label) => {
        const match = label.match(/\(([^)]+)\)/);
        return match?.[1] || label;
      });

    return labels.join(', ') || '--';
  }

  private yesNoLabel(value: 'si' | 'no' | ''): string {
    return value === 'si' ? 'Si' : 'No';
  }

  openExternalEntityPanel(): void {
    if (this.externalOrigin() !== 'si') {
      return;
    }

    this.closeFloatingPanels();
    this.selectedExternalEntityCode.set(this.acceptedExternalEntity()?.code ?? '');
    this.externalEntityPanelOpen.set(true);
  }

  closeExternalEntityPanel(): void {
    this.externalEntityPanelOpen.set(false);
  }

  acceptExternalEntitySelection(): void {
    const selectedEntity = EXTERNAL_ENTITY_OPTIONS.find((entity) => entity.code === this.selectedExternalEntityCode());

    if (!selectedEntity) {
      return;
    }

    this.acceptedExternalEntity.set(selectedEntity);
    this.closeExternalEntityPanel();
  }

  clearExternalEntitySelection(): void {
    this.acceptedExternalEntity.set(null);
    this.selectedExternalEntityCode.set('');
  }

  get externalEntityTotalPages(): number {
    return Math.ceil(this.externalEntityTotalItems / this.externalEntityRowsPerPage);
  }

  onExternalEntityPreviousPage(): void {
    if (this.externalEntityPage > 1) {
      this.externalEntityPage--;
    }
  }

  onExternalEntityNextPage(): void {
    if (this.externalEntityPage < this.externalEntityTotalPages) {
      this.externalEntityPage++;
    }
  }

  onExternalEntityRowsPerPageChange(value: number): void {
    this.externalEntityRowsPerPage = value;
    this.externalEntityPage = 1;
  }

  private clearAccountingDynamicsDescriptions(): void {
    this.debitDescription.set('');
    this.creditDescription.set('');
    this.objectDescription.set('');
    this.balanceDescription.set('');
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

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}
