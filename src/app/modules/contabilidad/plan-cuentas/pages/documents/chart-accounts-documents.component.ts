import { ChangeDetectionStrategy, Component } from '@angular/core';

import { DocumentsRecordsPageComponent } from '../../../../../shared/ui/documents-records-page/documents-records-page.component';
import { CHART_ACCOUNTS_DOCUMENTS_CONFIG } from '../../../config/chart-accounts-documents.config';

@Component({
  selector: 'siaf-chart-accounts-documents',
  standalone: true,
  imports: [DocumentsRecordsPageComponent],
  template: `<siaf-documents-records-page [config]="config" />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartAccountsDocumentsComponent {
  readonly config = CHART_ACCOUNTS_DOCUMENTS_CONFIG;
}
