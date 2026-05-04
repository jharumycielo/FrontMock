import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { DataTableColumn, DataTableComponent, DataTableRow } from '../../components/data-table/data-table.component';

@Component({
  selector: 'siaf-table',
  standalone: true,
  imports: [DataTableComponent],
  template: `<siaf-data-table [columns]="columns" [rows]="rows" [idKey]="idKey" />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent {
  @Input({ required: true }) columns: DataTableColumn[] = [];
  @Input({ required: true }) rows: DataTableRow[] = [];
  @Input() idKey = 'id';
}
