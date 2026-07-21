import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';

import { CurrentUserService } from '../../../../../core/auth/current-user.service';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { DateTimePickerComponent } from '../../../../../shared/ui/date-time-picker/date-time-picker.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { TextFieldComponent } from '../../../../../shared/ui/text-field/text-field.component';
import {
  LIBROS_CONTABLES_ANIO_OPTIONS,
  LIBROS_CONTABLES_ENTIDAD_PLIEGO_OPTIONS,
  LIBROS_CONTABLES_MES_OPTIONS,
  LIBROS_CONTABLES_SCOPE_OPTIONS,
  LIBROS_CONTABLES_TIPO_OPTIONS,
} from '../../../config/accounting-books.mock';

export type LibrosContablesSearchCriteria = {
  scope: string;
  tipoLibro: string;
  entidad: string;
  mes: string;
  anioCuenta: string;
  fechaDesde: string;
  fechaHasta: string;
};

@Component({
  selector: 'siaf-libros-contables-search-panel',
  standalone: true,
  imports: [ButtonComponent, DateTimePickerComponent, IconComponent, TextFieldComponent],
  template: `
    @if (open) {
      <section class="fixed inset-y-0 left-0 right-0 z-50 bg-black/55 pl-0 lg:pl-16" aria-modal="true" role="dialog" aria-labelledby="libros-contables-search-title" (click)="closePanel()">
        <aside class="absolute bottom-0 right-0 top-0 flex w-full max-w-[370px] flex-col overflow-hidden bg-surface shadow-siaf-lg" (click)="$event.stopPropagation()">
          <header class="flex h-14 shrink-0 items-center gap-siaf-xs border-b border-[var(--sys-color-divider-strong)] px-siaf-md">
            <h2 id="libros-contables-search-title" class="m-0 flex-1 text-base font-bold uppercase leading-normal tracking-[0.02px] text-text">Búsqueda</h2>
            <button class="inline-flex size-10 items-center justify-center rounded-siaf-md text-text transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-light-pressed)]" type="button" aria-label="Cerrar" (click)="closePanel()">
              <siaf-icon name="close" [size]="24" />
            </button>
          </header>

          <div class="min-h-0 flex-1 overflow-y-auto px-siaf-md py-siaf-md">
            <div class="flex flex-col gap-siaf-md">
              <div class="flex flex-wrap items-center gap-siaf-lg">
                @for (option of scopeOptions; track option.value) {
                  <label class="inline-flex items-center gap-2 text-sm text-text">
                    <input
                      class="size-4 border-border text-brand-primary focus:ring-brand-primary"
                      type="radio"
                      name="libros-contables-scope"
                      [value]="option.value"
                      [checked]="scope() === option.value"
                      (change)="scope.set(option.value)"
                    />
                    {{ option.label }}
                  </label>
                }
              </div>

              <siaf-input label="Tipo de Libro" type="select" [clearable]="true" [options]="tipoLibroOptions" [value]="tipoLibro()" (valueChange)="tipoLibro.set(asString($event))" />
              @if (isPliego()) {
                <siaf-input label="Entidad" type="select" [clearable]="true" [options]="entidadOptions" [value]="entidad()" (valueChange)="entidad.set(asString($event))" />
                <siaf-input label="Mes" type="select" [clearable]="true" [options]="mesOptions" [value]="mes()" (valueChange)="mes.set(asString($event))" />
              } @else {
                <siaf-input label="Mes" type="select" [clearable]="true" [options]="mesOptions" [value]="mes()" (valueChange)="mes.set(asString($event))" />
                <siaf-input label="Año cuenta" type="select" [clearable]="true" [options]="anioOptions" [value]="anioCuenta()" (valueChange)="anioCuenta.set(asString($event))" />
                <siaf-date-time-picker placeholder="Fecha desde" variant="date" [defaultToToday]="false" [fullWidth]="true" [value]="fechaDesde()" (valueChange)="fechaDesde.set($event)" />
                <siaf-date-time-picker placeholder="Fecha hasta" variant="date" [defaultToToday]="false" [fullWidth]="true" [value]="fechaHasta()" (valueChange)="fechaHasta.set($event)" />
              }
            </div>
          </div>

          <div class="flex shrink-0 items-center justify-end gap-siaf-xs border-t border-[var(--sys-color-divider-strong)] px-siaf-md py-siaf-sm">
            <siaf-button variant="secondary" size="md" [disabled]="!hasCriteria()" (click)="limpiar()">Limpiar</siaf-button>
            <siaf-button variant="accent" size="md" [disabled]="!hasCriteria()" (click)="aplicarCriteria()">Aplicar</siaf-button>
          </div>
        </aside>
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LibrosContablesSearchPanelComponent {
  @Input() open = false;

  @Output() closed = new EventEmitter<void>();
  @Output() aplicar = new EventEmitter<LibrosContablesSearchCriteria>();

  private readonly currentUserService = inject(CurrentUserService);

  readonly scopeOptions = LIBROS_CONTABLES_SCOPE_OPTIONS;
  readonly tipoLibroOptions = LIBROS_CONTABLES_TIPO_OPTIONS;
  readonly entidadOptions = LIBROS_CONTABLES_ENTIDAD_PLIEGO_OPTIONS;
  readonly mesOptions = LIBROS_CONTABLES_MES_OPTIONS;
  readonly anioOptions = LIBROS_CONTABLES_ANIO_OPTIONS;

  /** El usuario visualizador de tipo PLIEGO filtra por Entidad en lugar de Año cuenta / fechas. */
  readonly isPliego = computed(() => this.currentUserService.visualizadorTipo() === 'pliego');

  readonly scope = signal('');
  readonly tipoLibro = signal('');
  readonly entidad = signal('');
  readonly mes = signal('');
  readonly anioCuenta = signal('');
  readonly fechaDesde = signal('');
  readonly fechaHasta = signal('');

  readonly hasCriteria = computed(() =>
    Boolean(this.scope() || this.tipoLibro() || this.entidad() || this.mes() || this.anioCuenta() || this.fechaDesde() || this.fechaHasta())
  );

  asString(value: string | number | string[]): string {
    return Array.isArray(value) ? value[0] ?? '' : String(value ?? '');
  }

  closePanel(): void {
    this.closed.emit();
  }

  limpiar(): void {
    this.scope.set('');
    this.tipoLibro.set('');
    this.entidad.set('');
    this.mes.set('');
    this.anioCuenta.set('');
    this.fechaDesde.set('');
    this.fechaHasta.set('');
  }

  aplicarCriteria(): void {
    if (!this.hasCriteria()) {
      return;
    }

    this.aplicar.emit({
      scope: this.scope(),
      tipoLibro: this.tipoLibro(),
      entidad: this.entidad(),
      mes: this.mes(),
      anioCuenta: this.anioCuenta(),
      fechaDesde: this.fechaDesde(),
      fechaHasta: this.fechaHasta(),
    });
  }
}