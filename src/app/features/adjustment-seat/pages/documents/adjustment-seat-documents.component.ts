import { ChangeDetectionStrategy, Component } from '@angular/core';

import { DocumentsRecordsPageComponent } from '../../../../shared/ui/documents-records-page/documents-records-page.component';
import { ADJUSTMENT_SEAT_DOCUMENTS_CONFIG } from '../../../process-configs/adjustment-seat-documents.config';

@Component({
  selector: 'siaf-adjustment-seat-documents',
  standalone: true,
  imports: [DocumentsRecordsPageComponent],
  template: `<siaf-documents-records-page [config]="config" />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdjustmentSeatDocumentsComponent {
  readonly config = ADJUSTMENT_SEAT_DOCUMENTS_CONFIG;
}

