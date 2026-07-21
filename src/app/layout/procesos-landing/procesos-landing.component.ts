import { ChangeDetectionStrategy, Component } from '@angular/core';

import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'siaf-procesos-landing',
  standalone: true,
  imports: [EmptyStateComponent],
  template: `
    <section class="flex min-h-[calc(100vh-56px)] items-center justify-center bg-[var(--sys-color-bg-surfaces-surface-lowest)]">
      <siaf-empty-state
        title="Procesos"
        description="Para gestionar solicitudes, interactúe con la sección izquierda denominada &quot;navegador de procesos&quot;."
      />
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcesosLandingComponent {}