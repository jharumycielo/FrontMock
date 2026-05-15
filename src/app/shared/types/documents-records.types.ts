export type DocumentsRecordsTab = 'documents' | 'records';
export type DocumentFlowStatus = 'Elaborado' | 'Verificado';
export type RecordStatus = 'Activo';
export type ColumnVisibility = 'visible' | 'hidden' | 'internal';
export type ColumnGroup = 'default' | 'more' | 'internal';

export type DocumentsRecordsBreadcrumbItem = {
  label: string;
  href?: string;
};

export type DocumentsRecordsCreateDocumentOption = {
  label: string;
  route?: string;
  actionTypes?: string[];
};

export type DocumentsRecordsCreateProcessOption = {
  id: string;
  label: string;
  route?: string;
  documents: string[];
  documentOptions?: DocumentsRecordsCreateDocumentOption[];
  actionTypes: string[];
};

export type DocumentsRecordsRow = {
  selected?: boolean;
  [key: string]: string | boolean | undefined;
};

export type DocumentsRecordsColumn = {
  key: string;
  label: string;
  visibility: ColumnVisibility;
  group: ColumnGroup;
  widthClass?: string;
  align?: 'left' | 'right' | 'center';
  kind?: 'text' | 'document-link' | 'flow-status' | 'record-status';
};

export type DocumentsRecordsFilterOption = {
  label: string;
  value: string;
};

export type DocumentsRecordsMenuOption = {
  label: string;
  hasChildren?: boolean;
};

export type DocumentsRecordsConfig = {
  title: string;
  processId: string;
  defaultRequestRoute: string;
  createDocumentOptions: DocumentsRecordsCreateProcessOption[];
  breadcrumbs: DocumentsRecordsBreadcrumbItem[];
  documentRows: DocumentsRecordsRow[];
  recordRows: DocumentsRecordsRow[];
  documentColumns: DocumentsRecordsColumn[];
  recordColumns: DocumentsRecordsColumn[];
  documentTableMinWidthClass: string;
  recordTableMinWidthClass: string;
  recordTrackKey: string;
  recordHistoryDocumentLabel: string;
  statusFilterOptions: string[];
  actionTypeFilterOptions: string[];
  filterCampoOptions: DocumentsRecordsFilterOption[];
  filterValorOptions: DocumentsRecordsFilterOption[];
  fieldsMenuOptions: DocumentsRecordsMenuOption[];
  // Controla el botón de acción principal en la sección de documentos
  // 'verificar' = rol CREADOR (selecciona Elaborados y verifica)
  // 'aprobar'   = rol APROBADOR (selecciona Verificados y aprueba)
  accionPrincipal?: 'verificar' | 'aprobar';
};
