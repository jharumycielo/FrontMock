import { findProcessPathById } from '../../shared/ui/process-menu-tree/process-menu-tree.component';
import type { DocumentsRecordsBreadcrumbItem, DocumentsRecordsColumn, DocumentsRecordsConfig, DocumentsRecordsCreateProcessOption, DocumentsRecordsRow } from '../../shared/types/documents-records.types';
import { BASE_DOCUMENT_COLUMNS, BASE_FILTER_VALUES, DOCUMENTS_RECORDS_FIELD_MENU_OPTIONS, DOCUMENTS_RECORDS_FILTER_CAMPO_OPTIONS } from './common-documents-records.config';

const PROCESS_ID = 'registro-asiento-ajuste';
const PROCESS_ROUTE = '/procesos/registro-asiento-ajuste';
const REQUEST_ROUTE = '/procesos/registro-asiento-ajuste/solicitud';
const FORM_ROUTE = '/procesos/registro-asiento-ajuste/formulario';
const REQUEST_LABEL = 'Solicitud de registro de asiento de ajuste';

const createDocumentOptions: DocumentsRecordsCreateProcessOption[] = [
  {
    id: PROCESS_ID,
    label: 'Proceso de registro de asiento de ajuste',
    route: REQUEST_ROUTE,
    documents: [REQUEST_LABEL],
    documentOptions: [{ label: REQUEST_LABEL, route: REQUEST_ROUTE, actionTypes: ['Creación', 'Reversión'] }],
    actionTypes: ['Creación', 'Reversión']
  }
];

const breadcrumbs: DocumentsRecordsBreadcrumbItem[] = [
  { label: 'Inicio', href: '/panel' },
  ...findProcessPathById(PROCESS_ID).map((node) => ({ label: node.label, href: node.id === PROCESS_ID ? PROCESS_ROUTE : '/panel' })),
  { label: 'Documentos y registros' }
];

const recordColumns: DocumentsRecordsColumn[] = [
  { key: 'status', label: 'Estado', visibility: 'visible', group: 'default', widthClass: 'w-[150px]', kind: 'record-status' },
  { key: 'accountingDocument', label: 'Doc contable', visibility: 'visible', group: 'default', widthClass: 'w-[210px]' },
  { key: 'institutionalScope', label: 'Ámbito institucional', visibility: 'visible', group: 'default', widthClass: 'w-[240px]' },
  { key: 'adjustmentClassCode', label: 'Código de clase de ajuste', visibility: 'visible', group: 'default', widthClass: 'w-[280px]' },
  { key: 'adjustmentDetailCode', label: 'Código de detalle de ajuste', visibility: 'visible', group: 'default', widthClass: 'w-[300px]' },
  { key: 'totalDebit', label: 'Total debe', visibility: 'visible', group: 'default', widthClass: 'w-[160px]', align: 'right' },
  { key: 'totalCredit', label: 'Total haber', visibility: 'visible', group: 'default', widthClass: 'w-[160px]', align: 'right' }
];

const documentRows: DocumentsRecordsRow[] = [
  { document: REQUEST_LABEL, number: '0004', actionType: 'Creación', status: 'Elaborado', system: 'Sistema Nacional de Contabilidad', date: '15/06/2024', entity: '009 - Ministerio de Economía y Finanzas', linkRoute: FORM_ROUTE, creator: 'Juan Doe', subject: 'Registro de ajuste contable', catId: 'CA', entityCode: '009', requesterArea: 'DGCP', fileNumber: 'EXP-0004', evaluationDate: '16/06/2024', evaluationUser: 'Evaluador 1', approvalDate: '17/06/2024', approvalUser: 'Aprobador 1', subdocumentCount: '2', accountingStatus: 'Pendiente', accountingDate: '18/06/2024' },
  { document: REQUEST_LABEL, number: '0003', actionType: 'Creación', status: 'Verificado', system: 'Sistema Nacional de Contabilidad', date: '20/01/2024', entity: '009 - Ministerio de Economía y Finanzas', linkRoute: FORM_ROUTE, creator: 'Maria Doe', subject: 'Verificación de asiento', catId: 'CA', entityCode: '009', requesterArea: 'DGCP', fileNumber: 'EXP-0003', evaluationDate: '21/01/2024', evaluationUser: 'Evaluador 2', approvalDate: '22/01/2024', approvalUser: 'Aprobador 2', subdocumentCount: '1', accountingStatus: 'Procesado', accountingDate: '23/01/2024' },
  { document: REQUEST_LABEL, number: '0002', actionType: 'Creación', status: 'Verificado', system: 'Sistema Nacional de Contabilidad', date: '15/12/2023', entity: '009 - Ministerio de Economía y Finanzas', linkRoute: FORM_ROUTE, creator: 'Juan Doe', subject: 'Ajuste de saldos iniciales', catId: 'CA', entityCode: '009', requesterArea: 'DGCP', fileNumber: 'EXP-0002', evaluationDate: '16/12/2023', evaluationUser: 'Evaluador 1', approvalDate: '17/12/2023', approvalUser: 'Aprobador 1', subdocumentCount: '3', accountingStatus: 'Procesado', accountingDate: '18/12/2023' },
  { document: REQUEST_LABEL, number: '0001', actionType: 'Creación', status: 'Elaborado', system: 'Sistema Nacional de Contabilidad', date: '20/11/2023', entity: '009 - Ministerio de Economía y Finanzas', linkRoute: FORM_ROUTE, creator: 'Maria Doe', subject: 'Apertura de asiento de ajuste', catId: 'CA', entityCode: '009', requesterArea: 'DGCP', fileNumber: 'EXP-0001', evaluationDate: '21/11/2023', evaluationUser: 'Evaluador 2', approvalDate: '22/11/2023', approvalUser: 'Aprobador 2', subdocumentCount: '2', accountingStatus: 'Pendiente', accountingDate: '23/11/2023' }
];

const recordRows: DocumentsRecordsRow[] = [
  { status: 'Activo', accountingDocument: '093-2026-05', institutionalScope: 'EPP', adjustmentClassCode: 'CLASE DE AJUSTE', adjustmentDetailCode: 'DETALLE DE AJUSTE', totalDebit: '237,000', totalCredit: '237,000' },
  { status: 'Activo', accountingDocument: '093-2026-04', institutionalScope: 'EPP', adjustmentClassCode: 'CLASE DE AJUSTE', adjustmentDetailCode: 'DETALLE DE AJUSTE', totalDebit: '237,000', totalCredit: '237,000' },
  { status: 'Activo', accountingDocument: '093-2026-03', institutionalScope: 'EPP', adjustmentClassCode: 'CLASE DE AJUSTE', adjustmentDetailCode: 'DETALLE DE AJUSTE', totalDebit: '237,000', totalCredit: '237,000' },
  { status: 'Activo', accountingDocument: '093-2026-02', institutionalScope: 'EPP', adjustmentClassCode: 'CLASE DE AJUSTE', adjustmentDetailCode: 'DETALLE DE AJUSTE', totalDebit: '237,000', totalCredit: '237,000' },
  { status: 'Activo', accountingDocument: '093-2026-01', institutionalScope: 'EPP', adjustmentClassCode: 'CLASE DE AJUSTE', adjustmentDetailCode: 'DETALLE DE AJUSTE', totalDebit: '237,000', totalCredit: '237,000' }
];

export const ADJUSTMENT_SEAT_DOCUMENTS_CONFIG: DocumentsRecordsConfig = {
  title: 'Proceso de registro de asiento de ajuste',
  processId: PROCESS_ID,
  defaultRequestRoute: REQUEST_ROUTE,
  createDocumentOptions,
  breadcrumbs,
  documentRows,
  recordRows,
  documentColumns: BASE_DOCUMENT_COLUMNS,
  recordColumns,
  documentTableMinWidthClass: 'min-w-[2360px]',
  recordTableMinWidthClass: 'min-w-[1480px]',
  recordTrackKey: 'accountingDocument',
  recordHistoryDocumentLabel: REQUEST_LABEL,
  statusFilterOptions: ['Elaborado', 'Verificado'],
  actionTypeFilterOptions: ['Creación', 'Reversión'],
  filterCampoOptions: DOCUMENTS_RECORDS_FILTER_CAMPO_OPTIONS,
  filterValorOptions: [...BASE_FILTER_VALUES, { label: 'Reversión', value: 'Reversión' }],
  fieldsMenuOptions: DOCUMENTS_RECORDS_FIELD_MENU_OPTIONS
};
