import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export interface DataTableColumn {
  key: string;
  label: string;
}

export type DataTableRow = Record<string, string | number>;

@Component({
  selector: 'siaf-data-table',
  standalone: true,
  template: `
    <div class="siaf-table-shell">
      <table class="siaf-table">
        <thead>
          <tr class="siaf-table-head-row">
            @for (column of columns; track column.key) {
              <th class="siaf-table-th">{{ column.label }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of rows; track row[idKey]) {
            <tr class="siaf-table-row">
              @for (column of columns; track column.key) {
                <td class="siaf-table-td">{{ row[column.key] }}</td>
              }
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTableComponent {
  @Input({ required: true }) columns: DataTableColumn[] = [];
  @Input({ required: true }) rows: DataTableRow[] = [];
  @Input() idKey = 'id';
}
