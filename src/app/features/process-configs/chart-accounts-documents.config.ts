import { findProcessPathById } from '../../shared/ui/process-menu-tree/process-menu-tree.component';
import type { DocumentsRecordsBreadcrumbItem, DocumentsRecordsConfig, DocumentsRecordsColumn, DocumentsRecordsCreateProcessOption, DocumentsRecordsRow } from '../../shared/types/documents-records.types';
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
  { key: 'status', label: 'Estado', visibility: 'visible', group: 'default', widthClass: 'w-[150px]', kind: 'record-status' },
  { key: 'accountCode', label: 'Código de cuenta', visibility: 'visible', group: 'default', widthClass: 'w-[220px]' },
  { key: 'accountName', label: 'Nombre de cuenta', visibility: 'visible', group: 'default', widthClass: 'w-[420px]' },
  { key: 'level', label: 'Nivel', visibility: 'visible', group: 'default', widthClass: 'w-[150px]' },
  { key: 'nature', label: 'Naturaleza', visibility: 'visible', group: 'default', widthClass: 'w-[210px]' }
];

const documentRows: DocumentsRecordsRow[] = [
  { document: REQUEST_LABEL, number: '0004', actionType: 'Modificación', status: 'Elaborado', system: 'Sistema Nacional de Contabilidad', date: '15/06/2024', entity: '009 - Ministerio de Economía y Finanzas', creator: 'Juan Doe', subject: 'Actualización de cuenta', catId: 'CAT-001', entityCode: '009', requesterArea: 'DGCP', fileNumber: 'EXP-0004', evaluationDate: '16/06/2024', evaluationUser: 'Evaluador 1', approvalDate: '17/06/2024', approvalUser: 'Aprobador 1', subdocumentCount: '2', accountingStatus: 'Pendiente', accountingDate: '18/06/2024' },
  { document: BULK_REQUEST_LABEL, number: '0003', actionType: 'Creación', status: 'Verificado', system: 'Sistema Nacional de Contabilidad', date: '20/01/2024', entity: '009 - Ministerio de Economía y Finanzas', creator: 'Maria Doe', subject: 'Carga masiva', catId: 'CAT-002', entityCode: '009', requesterArea: 'DGCP', fileNumber: 'EXP-0003', evaluationDate: '21/01/2024', evaluationUser: 'Evaluador 2', approvalDate: '22/01/2024', approvalUser: 'Aprobador 2', subdocumentCount: '1', accountingStatus: 'Procesado', accountingDate: '23/01/2024' },
  { document: REQUEST_LABEL, number: '0002', actionType: 'Creación', status: 'Verificado', system: 'Sistema Nacional de Contabilidad', date: '15/12/2023', entity: '009 - Ministerio de Economía y Finanzas', creator: 'Juan Doe', subject: 'Registro inicial', catId: 'CAT-003', entityCode: '009', requesterArea: 'DGCP', fileNumber: 'EXP-0002', evaluationDate: '16/12/2023', evaluationUser: 'Evaluador 1', approvalDate: '17/12/2023', approvalUser: 'Aprobador 1', subdocumentCount: '3', accountingStatus: 'Procesado', accountingDate: '18/12/2023' },
  { document: REQUEST_LABEL, number: '0001', actionType: 'Creación', status: 'Elaborado', system: 'Sistema Nacional de Contabilidad', date: '20/11/2023', entity: '009 - Ministerio de Economía y Finanzas', creator: 'Maria Doe', subject: 'Apertura de cuenta', catId: 'CAT-004', entityCode: '009', requesterArea: 'DGCP', fileNumber: 'EXP-0001', evaluationDate: '21/11/2023', evaluationUser: 'Evaluador 2', approvalDate: '22/11/2023', approvalUser: 'Aprobador 2', subdocumentCount: '2', accountingStatus: 'Pendiente', accountingDate: '23/11/2023' }
];

const recordRows: DocumentsRecordsRow[] = [
  { status: 'Activo', accountCode: '1101', accountName: 'Caja y bancos', level: '2', nature: 'Deudora' },
  { status: 'Activo', accountCode: '110101', accountName: 'Caja', level: '3', nature: 'Deudora' },
  { status: 'Activo', accountCode: '110102', accountName: 'Bancos', level: '3', nature: 'Deudora' },
  { status: 'Activo', accountCode: '2101', accountName: 'Cuentas por pagar', level: '2', nature: 'Acreedora' },
  { status: 'Activo', accountCode: '3101', accountName: 'Patrimonio institucional', level: '2', nature: 'Acreedora' }
];

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
  recordTableMinWidthClass: 'min-w-[1240px]',
  recordTrackKey: 'accountCode',
  recordHistoryDocumentLabel: REQUEST_LABEL,
  statusFilterOptions: ['Elaborado', 'Verificado'],
  actionTypeFilterOptions: ['Creación', 'Modificación'],
  filterCampoOptions: DOCUMENTS_RECORDS_FILTER_CAMPO_OPTIONS,
  filterValorOptions: [...BASE_FILTER_VALUES, { label: 'Modificación', value: 'Modificación' }],
  fieldsMenuOptions: DOCUMENTS_RECORDS_FIELD_MENU_OPTIONS
};
