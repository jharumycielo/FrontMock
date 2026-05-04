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
    <div class="overflow-hidden rounded-siaf-lg border border-border bg-surface">
      <table class="w-full border-collapse text-left text-sm">
        <thead class="bg-surface-muted text-xs font-semibold uppercase text-text-muted">
          <tr>
            @for (column of columns; track column.key) {
              <th class="border-b border-border px-4 py-3">{{ column.label }}</th>
            }
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          @for (row of rows; track row[idKey]) {
            <tr class="hover:bg-surface-muted/70">
              @for (column of columns; track column.key) {
                <td class="px-4 py-3 text-text">{{ row[column.key] }}</td>
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
