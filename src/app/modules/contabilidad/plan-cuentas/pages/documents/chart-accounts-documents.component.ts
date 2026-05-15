import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { DocumentsRecordsPageComponent } from '../../../../../shared/ui/documents-records-page/documents-records-page.component';
import { CHART_ACCOUNTS_DOCUMENTS_CONFIG } from '../../../config/chart-accounts-documents.config';
import { SolicitudesStateService } from '../../../../../core/state/solicitudes-state.service';
import { PermissionService } from '../../../../../core/auth/permission.service';
import type { DocumentsRecordsRow, DocumentsRecordsConfig } from '../../../../../shared/types/documents-records.types';

@Component({
  selector: 'siaf-chart-accounts-documents',
  standalone: true,
  imports: [DocumentsRecordsPageComponent],
  template: `<siaf-documents-records-page [config]="config()" />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartAccountsDocumentsComponent {
  private readonly solicitudesState = inject(SolicitudesStateService);
  private readonly permissionService = inject(PermissionService);

  readonly config = computed((): DocumentsRecordsConfig => {
    const esAprobador = this.permissionService.currentRole() === 'approver';

    const solicitudes = esAprobador
      ? this.solicitudesState.bandejaAprobador()
      : this.solicitudesState.bandejaCreador();

    // Si hay solicitudes reales usar esas, si no usar el mock base
    // El DocumentsRecordsPageComponent aplica automáticamente las reglas de rol
    const documentRows: DocumentsRecordsRow[] = solicitudes.length > 0
      ? solicitudes.map(s => ({
          document: s.tipoDocumento,
          number: s.numero,
          actionType: s.tipoAccion,
          status: s.estado,
          system: 'Sistema Nacional de Contabilidad',
          date: s.fecha,
          entity: `MEF - ${s.entidad}`,
          creator: s.creador,
          subject: s.justificacion,
          catId: '—',
          entityCode: '001',
          requesterArea: s.unidad,
          fileNumber: s.numero,
          evaluationDate: s.historial.find(h => h.estado === 'Verificado')?.fecha ?? '—',
          evaluationUser: s.historial.find(h => h.estado === 'Verificado')?.usuario ?? '—',
          approvalDate: s.historial.find(h => h.estado === 'Aprobado')?.fecha ?? '—',
          approvalUser: s.historial.find(h => h.estado === 'Aprobado')?.usuario ?? '—',
          subdocumentCount: String(s.cuentas.length),
          accountingStatus: '—',
          accountingDate: '—',
          linkRoute: `/procesos/plan-cuentas-contables/detalle/${s.id}`,
        }))
      : CHART_ACCOUNTS_DOCUMENTS_CONFIG.documentRows;

    return {
      ...CHART_ACCOUNTS_DOCUMENTS_CONFIG,
      documentRows,
    };
  });
}
