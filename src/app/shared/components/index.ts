/**
 * Componentes Transversales
 * Componentes reutilizables que combinan múltiples componentes base
 * Usables en diferentes features sin lógica específica de negocio
 */

export { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
export { CustomFilterComponent } from './custom-filter/custom-filter.component';
export type { FilterRow, CustomFilterApplyEvent } from './custom-filter/custom-filter.component';
export { FormTableSearchComponent } from './form-table-search/form-table-search.component';
export { SolicitudeHeaderComponent } from './solicitude-header/solicitude-header.component';
export type { SolicitudeHeaderRole, SolicitudeHeaderState, SolicitudeHeaderType } from './solicitude-header/solicitude-header.component';
export { SolicitudeFormCardComponent } from './solicitude-form-card/solicitude-form-card.component';
export { SolicitudePageLayoutComponent } from './solicitude-page-layout/solicitude-page-layout.component';
export { SolicitudeInfoCardComponent } from './solicitude-info-card/solicitude-info-card.component';
export type { SolicitudeInfoField } from './solicitude-info-card/solicitude-info-card.component';
export { PaginationComponent } from './pagination/pagination.component';
export type { PaginationNavigation, PaginationPosition } from './pagination/pagination.component';
export { DataTableComponent } from './data-table/data-table.component';
export type { DataTableColumn, DataTableRow } from './data-table/data-table.component';
export { TimelineComponent } from './timeline/timeline.component';
export type { TimelineItem } from './timeline/timeline.component';
