import type { DocumentsRecordsColumn, DocumentsRecordsFilterOption, DocumentsRecordsMenuOption } from '../../../shared/types/documents-records.types';

export const DOCUMENTS_RECORDS_FIELD_MENU_OPTIONS: DocumentsRecordsMenuOption[] = [
  { label: 'Documento' },
  { label: 'Tipo de acción' },
  { label: 'Estado' },
  { label: 'Sistema' },
  { label: 'Fecha de registro', hasChildren: true },
  { label: 'Entidad' }
];

export const DOCUMENTS_RECORDS_FILTER_CAMPO_OPTIONS: DocumentsRecordsFilterOption[] = [
  { label: 'Documento', value: 'document' },
  { label: 'Numero', value: 'number' },
  { label: 'Tipo de accion', value: 'actionType' },
  { label: 'Estado', value: 'status' },
  { label: 'Sistema', value: 'system' },
  { label: 'Fecha', value: 'date' },
  { label: 'Entidad', value: 'entity' }
];

export const BASE_DOCUMENT_COLUMNS: DocumentsRecordsColumn[] = [
  { key: 'document', label: 'Documento', visibility: 'visible', group: 'default', widthClass: 'w-[360px]', kind: 'document-link' },
  { key: 'number', label: 'Número', visibility: 'visible', group: 'default', widthClass: 'w-[140px]' },
  { key: 'actionType', label: 'Tipo de Operación', visibility: 'visible', group: 'default', widthClass: 'w-[210px]' },
  { key: 'status', label: 'Estado', visibility: 'visible', group: 'default', widthClass: 'w-[150px]', kind: 'flow-status' },
  { key: 'system', label: 'Sistemas Nacionales', visibility: 'visible', group: 'default', widthClass: 'w-[260px]' },
  { key: 'date', label: 'Fecha de registro', visibility: 'visible', group: 'default', widthClass: 'w-[190px]' },
  { key: 'creator', label: 'Creador', visibility: 'hidden', group: 'more', widthClass: 'w-[210px]' },
  { key: 'subject', label: 'Asunto/Motivo', visibility: 'hidden', group: 'more', widthClass: 'w-[280px]' },
  { key: 'catId', label: 'ID CAT CLAS Y CAT', visibility: 'visible', group: 'more', widthClass: 'w-[190px]' },
  { key: 'entityCode', label: 'Código Entidad', visibility: 'visible', group: 'more', widthClass: 'w-[180px]' },
  { key: 'requesterArea', label: 'Area Solicitante', visibility: 'visible', group: 'more', widthClass: 'w-[240px]' },
  { key: 'entity', label: 'Entidad', visibility: 'visible', group: 'more', widthClass: 'w-[360px]' },
  { key: 'fileNumber', label: 'Expediente', visibility: 'hidden', group: 'more', widthClass: 'w-[180px]' },
  { key: 'evaluationDate', label: 'Fecha de evaluación', visibility: 'hidden', group: 'more', widthClass: 'w-[210px]' },
  { key: 'evaluationUser', label: 'Usuario de evaluación', visibility: 'hidden', group: 'more', widthClass: 'w-[240px]' },
  { key: 'approvalDate', label: 'Fecha de aprobación', visibility: 'hidden', group: 'more', widthClass: 'w-[210px]' },
  { key: 'approvalUser', label: 'Usuario de aprobación', visibility: 'hidden', group: 'more', widthClass: 'w-[240px]' },
  { key: 'subdocumentCount', label: 'Cantidad de Subdocumentos', visibility: 'visible', group: 'more', widthClass: 'w-[240px]' },
  { key: 'accountingStatus', label: 'Estado de Contabilización', visibility: 'internal', group: 'internal' },
  { key: 'accountingDate', label: 'Fecha de contabilización', visibility: 'internal', group: 'internal' }
];

export const BASE_FILTER_VALUES: DocumentsRecordsFilterOption[] = [
  { label: 'Elaborado', value: 'Elaborado' },
  { label: 'Verificado', value: 'Verificado' },
  { label: 'Creación', value: 'Creación' },
  { label: 'Sistema Nacional de Contabilidad', value: 'Sistema Nacional de Contabilidad' }
];
