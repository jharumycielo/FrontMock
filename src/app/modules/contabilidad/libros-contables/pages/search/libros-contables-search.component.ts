import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { BreadcrumbComponent } from '../../../../../shared/components/breadcrumb/breadcrumb.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { EmptyStateComponent } from '../../../../../shared/ui/empty-state/empty-state.component';
import { ACCOUNTING_BOOKS_BREADCRUMBS } from '../../../config/accounting-books.mock';
import {
  LibrosContablesSearchCriteria,
  LibrosContablesSearchPanelComponent,
} from '../../components/search-panel/libros-contables-search-panel.component';
import { LibrosContablesSearchResultsComponent } from '../../components/search-results/libros-contables-search-results.component';

@Component({
  selector: 'siaf-libros-contables-search',
  standalone: true,
  imports: [BreadcrumbComponent, ButtonComponent, EmptyStateComponent, LibrosContablesSearchPanelComponent, LibrosContablesSearchResultsComponent],
  template: `
    <section class="min-w-0">
      <div class="border-b border-[var(--sys-color-divider-default)] bg-surface">
        <siaf-breadcrumb class="block" [items]="breadcrumbs" />
        <div class="flex min-h-[56px] items-center justify-between gap-siaf-md px-siaf-md pb-siaf-md">
          <h1 class="m-0 text-sm font-bold uppercase leading-normal text-[var(--sys-color-text-brand-secondary)]">Generar Libros Contables Oficiales</h1>
          <siaf-button variant="accent" size="md" icon="manage_search" (click)="openSearchPanel()">Búsqueda</siaf-button>
        </div>
      </div>

      <section class="flex min-h-[calc(100vh-112px)] flex-col bg-[var(--sys-color-bg-surfaces-surface-lowest)] p-siaf-md">
        @if (appliedCriteria(); as criteria) {
          <siaf-libros-contables-search-results [criteria]="criteria" (quitarFiltros)="onQuitarFiltros()" />
        } @else {
          <div class="flex flex-1 items-center justify-center rounded-siaf-md bg-surface">
            <siaf-empty-state
              title="Aún no se encontraron resultados"
              description="Ingrese los criterios de búsqueda para visualizar la información disponible."
            />
          </div>
        }
      </section>
    </section>

    <siaf-libros-contables-search-panel [open]="searchPanelOpen()" (closed)="closeSearchPanel()" (aplicar)="onAplicarCriteria($event)" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LibrosContablesSearchComponent {
  readonly breadcrumbs = ACCOUNTING_BOOKS_BREADCRUMBS;
  readonly searchPanelOpen = signal(false);
  readonly appliedCriteria = signal<LibrosContablesSearchCriteria | null>(null);

  openSearchPanel(): void {
    this.searchPanelOpen.set(true);
  }

  closeSearchPanel(): void {
    this.searchPanelOpen.set(false);
  }

  onAplicarCriteria(criteria: LibrosContablesSearchCriteria): void {
    this.appliedCriteria.set(criteria);
    this.closeSearchPanel();
  }

  onQuitarFiltros(): void {
    this.appliedCriteria.set(null);
  }
}