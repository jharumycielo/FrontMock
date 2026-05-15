import { findProcessPathById } from '../../../layout/process-menu-tree/process-menu-tree.component';
import type { DocumentsRecordsBreadcrumbItem, DocumentsRecordsConfig, DocumentsRecordsColumn, DocumentsRecordsCreateProcessOption, DocumentsRecordsRow } from '../../../shared/types/documents-records.types';
import { CHART_ACCOUNTS_RECORD_ROWS } from './chart-accounts-records.mock';
import { BASE_DOCUMENT_COLUMNS, BASE_FILTER_VALUES, DOCUMENTS_RECORDS_FIELD_MENU_OPTIONS, DOCUMENTS_RECORDS_FILTER_CAMPO_OPTIONS } from './common-documents-records.config';

const PROCESS_ID = 'plan-cuentas-contables';
const PROCESS_ROUTE = '/procesos/plan-cuentas-contables';
const REQUEST_ROUTE = '/procesos/plan-cuentas-contables/solicitud';
const BULK_REQUEST_ROUTE = '/procesos/plan-cuentas-contables/carga-masiva/solicitud';
const REQUEST_LABEL = 'Solicitud de Cuentas Contables';
const BULK_REQUEST_LABEL = 'Solicitud de carga masiva de plan de cuentas contables';

const createDocumentOptions: DocumentsRecordsCreateProcessOption[] = [
  {
    id: PROCESS_ID,
    label: 'Plan de Cuentas Contables',
    route: REQUEST_ROUTE,
    documents: [REQUEST_LABEL, BULK_REQUEST_LABEL],
    documentOptions: [
      { label: REQUEST_LABEL, route: REQUEST_ROUTE, actionTypes: ['Creación', 'Modificación'] },
      { label: BULK_REQUEST_LABEL, route: BULK_REQUEST_ROUTE, actionTypes: ['Creación'] }
    ],
    actionTypes: ['Creación', 'Modificación']
  }
];

const breadcrumbs: DocumentsRecordsBreadcrumbItem[] = [
  { label: 'Inicio', href: '/panel' },
  ...findProcessPathById(PROCESS_ID).map((node) => ({ label: node.label, href: node.id === PROCESS_ID ? PROCESS_ROUTE : '/panel' })),
  { label: 'Documentos y registros' }
];

const recordColumns: DocumentsRecordsColumn[] = [
  { key: 'status', label: 'Estado', visibility: 'visible', group: 'default', widthClass: 'w-[112px]', kind: 'record-status' },
  { key: 'element', label: 'Elemento', visibility: 'visible', group: 'default', widthClass: 'w-[116px]' },
  { key: 'group', label: 'Grupo', visibility: 'visible', group: 'default', widthClass: 'w-[116px]' },
  { key: 'account', label: 'Cuenta', visibility: 'visible', group: 'default', widthClass: 'w-[116px]' },
  { key: 'subAccount1', label: 'Sub cuenta 1', visibility: 'visible', group: 'default', widthClass: 'w-[155px]' },
  { key: 'subAccount2', label: 'Sub cuenta 2', visibility: 'visible', group: 'default', widthClass: 'w-[155px]' },
  { key: 'subAccount3', label: 'Sub cuenta 3', visibility: 'visible', group: 'default', widthClass: 'w-[155px]' },
  { key: 'accountName', label: 'Nombre de la cuenta contable', visibility: 'visible', group: 'default', widthClass: 'w-[490px]' },
  { key: 'imputable', label: '¿Imputable?', visibility: 'visible', group: 'default', widthClass: 'w-[116px]' },
  { key: 'previousCode', label: 'Código anterior', visibility: 'visible', group: 'default', widthClass: 'w-[146px]' },
  { key: 'institutionalScopes', label: 'Ámbitos institucionales', visibility: 'visible', group: 'default', widthClass: 'w-[201px]' },
  { key: 'aep', label: 'AEP', visibility: 'visible', group: 'default', widthClass: 'w-[116px]' },
  { key: 'reciprocal', label: '¿Recíproca?', visibility: 'visible', group: 'default', widthClass: 'w-[116px]' }
];

const documentRows: DocumentsRecordsRow[] = [
  { document: REQUEST_LABEL, number: '0008', actionType: 'Creación', status: 'Elaborado', system: 'Sistema Nacional de Contabilidad', date: '10/05/2026', entity: '009 - Ministerio de Economía y Finanzas', creator: 'Juan Pérez García', subject: 'Nueva cuenta activo corriente', catId: 'CAT-008', entityCode: '009', requesterArea: 'DGCP', fileNumber: 'EXP-0008', evaluationDate: '—', evaluationUser: '—', approvalDate: '—', approvalUser: '—', subdocumentCount: '1', accountingStatus: 'Pendiente', accountingDate: '—' },
  { document: REQUEST_LABEL, number: '0007', actionType: 'Modificación', status: 'Elaborado', system: 'Sistema Nacional de Contabilidad', date: '08/05/2026', entity: '009 - Ministerio de Economía y Finanzas', creator: 'Juan Pérez García', subject: 'Modificación de vigencia', catId: 'CAT-007', entityCode: '009', requesterArea: 'DGCP', fileNumber: 'EXP-0007', evaluationDate: '—', evaluationUser: '—', approvalDate: '—', approvalUser: '—', subdocumentCount: '2', accountingStatus: 'Pendiente', accountingDate: '—' },
  { document: REQUEST_LABEL, number: '0006', actionType: 'Creación', status: 'Verificado', system: 'Sistema Nacional de Contabilidad', date: '05/05/2026', entity: '009 - Ministerio de Economía y Finanzas', creator: 'Juan Pérez García', subject: 'Cuenta pasivo largo plazo', catId: 'CAT-006', entityCode: '009', requesterArea: 'DGCP', fileNumber: 'EXP-0006', evaluationDate: '06/05/2026', evaluationUser: 'Juan Pérez García', approvalDate: '—', approvalUser: '—', subdocumentCount: '3', accountingStatus: 'Pendiente', accountingDate: '—' },
  { document: BULK_REQUEST_LABEL, number: '0005', actionType: 'Creación', status: 'Verificado', system: 'Sistema Nacional de Contabilidad', date: '02/05/2026', entity: '009 - Ministerio de Economía y Finanzas', creator: 'Juan Pérez García', subject: 'Carga masiva PCGU 2026', catId: 'CAT-005', entityCode: '009', requesterArea: 'DGCP', fileNumber: 'EXP-0005', evaluationDate: '03/05/2026', evaluationUser: 'Juan Pérez García', approvalDate: '—', approvalUser: '—', subdocumentCount: '45', accountingStatus: 'Pendiente', accountingDate: '—' },
  { document: REQUEST_LABEL, number: '0004', actionType: 'Modificación', status: 'Aprobado', system: 'Sistema Nacional de Contabilidad', date: '15/04/2026', entity: '009 - Ministerio de Economía y Finanzas', creator: 'Juan Pérez García', subject: 'Actualización dinámica contable', catId: 'CAT-004', entityCode: '009', requesterArea: 'DGCP', fileNumber: 'EXP-0004', evaluationDate: '16/04/2026', evaluationUser: 'Juan Pérez García', approvalDate: '17/04/2026', approvalUser: 'María López Torres', subdocumentCount: '2', accountingStatus: 'Procesado', accountingDate: '17/04/2026' },
  { document: REQUEST_LABEL, number: '0003', actionType: 'Creación', status: 'Observado', system: 'Sistema Nacional de Contabilidad', date: '10/04/2026', entity: '009 - Ministerio de Economía y Finanzas', creator: 'Juan Pérez García', subject: 'Cuenta patrimonio institucional', catId: 'CAT-003', entityCode: '009', requesterArea: 'DGCP', fileNumber: 'EXP-0003', evaluationDate: '11/04/2026', evaluationUser: 'Juan Pérez García', approvalDate: '—', approvalUser: '—', subdocumentCount: '1', accountingStatus: 'Pendiente', accountingDate: '—' },
  { document: BULK_REQUEST_LABEL, number: '0002', actionType: 'Creación', status: 'Rechazado', system: 'Sistema Nacional de Contabilidad', date: '01/04/2026', entity: '009 - Ministerio de Economía y Finanzas', creator: 'Juan Pérez García', subject: 'Carga masiva PCGE 2026', catId: 'CAT-002', entityCode: '009', requesterArea: 'DGCP', fileNumber: 'EXP-0002', evaluationDate: '02/04/2026', evaluationUser: 'Juan Pérez García', approvalDate: '03/04/2026', approvalUser: 'María López Torres', subdocumentCount: '12', accountingStatus: 'Pendiente', accountingDate: '—' },
  { document: REQUEST_LABEL, number: '0001', actionType: 'Creación', status: 'Aprobado', system: 'Sistema Nacional de Contabilidad', date: '15/03/2026', entity: '009 - Ministerio de Economía y Finanzas', creator: 'Juan Pérez García', subject: 'Apertura de cuentas iniciales', catId: 'CAT-001', entityCode: '009', requesterArea: 'DGCP', fileNumber: 'EXP-0001', evaluationDate: '16/03/2026', evaluationUser: 'Juan Pérez García', approvalDate: '17/03/2026', approvalUser: 'María López Torres', subdocumentCount: '5', accountingStatus: 'Procesado', accountingDate: '17/03/2026' },
];

const recordRows: DocumentsRecordsRow[] = CHART_ACCOUNTS_RECORD_ROWS;

export const CHART_ACCOUNTS_DOCUMENTS_CONFIG: DocumentsRecordsConfig = {
  title: 'Plan de Cuentas Contables',
  processId: PROCESS_ID,
  defaultRequestRoute: REQUEST_ROUTE,
  createDocumentOptions,
  breadcrumbs,
  documentRows,
  recordRows,
  documentColumns: BASE_DOCUMENT_COLUMNS,
  recordColumns,
  documentTableMinWidthClass: 'min-w-[2360px]',
  recordTableMinWidthClass: 'min-w-[2320px]',
  recordTrackKey: 'recordId',
  recordHistoryDocumentLabel: REQUEST_LABEL,
  statusFilterOptions: ['Elaborado', 'Verificado'],
  actionTypeFilterOptions: ['Creación', 'Modificación'],
  filterCampoOptions: DOCUMENTS_RECORDS_FILTER_CAMPO_OPTIONS,
  filterValorOptions: [...BASE_FILTER_VALUES, { label: 'Modificación', value: 'Modificación' }],
  fieldsMenuOptions: DOCUMENTS_RECORDS_FIELD_MENU_OPTIONS
};
