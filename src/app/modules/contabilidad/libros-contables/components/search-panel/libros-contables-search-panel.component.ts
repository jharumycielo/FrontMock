import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';

import { CurrentUserService } from '../../../../../core/auth/current-user.service';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { DateTimePickerComponent } from '../../../../../shared/ui/date-time-picker/date-time-picker.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { TextFieldComponent } from '../../../../../shared/ui/text-field/text-field.component';
import {
  LIBROS_CONTABLES_ANIO_OPTIONS,
  LIBROS_CONTABLES_CUENTA_OPTIONS,
  LIBROS_CONTABLES_ENTIDAD_PLIEGO_OPTIONS,
  LIBROS_CONTABLES_MES_OPTIONS,
  LIBROS_CONTABLES_PLIEGO_OPTIONS,
  LIBROS_CONTABLES_SCOPE_OPTIONS,
  LIBROS_CONTABLES_TIPO_OPTIONS,
  LIBROS_CONTABLES_UNIDAD_EJECUTORA_OPTIONS,
} from '../../../config/accounting-books.mock';

export type LibrosContablesSearchCriteria = {
  scope: string;
  tipoLibro: string;
  entidad: string;
  mes: string;
  anioCuenta: string;
  fechaDesde: string;
  fechaHasta: string;
  /** Pliego seleccionado (solo visualizador ENTE RECTOR). */
  pliego: string;
  /** Unidad Ejecutora seleccionada (solo visualizador ENTE RECTOR); 'todos' por defecto. */
  unidadEjecutora: string;
  /** Variante del Libro Mayor: 'estandar' (Libro mayor) o 'extendido' (Libro mayor extendido). */
  mayorVariante: string;
  /** Filtros adicionales del Libro Mayor: cuenta contable y rango de cuentas. */
  cuentaContable: string;
  rangoCuentaDesde: string;
  rangoCuentaHasta: string;
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
                  <label
                    class="inline-flex items-center gap-2 text-sm text-text"
                    [class.cursor-not-allowed]="isScopeDisabled(option.value)"
                    [class.opacity-40]="isScopeDisabled(option.value)"
                  >
                    <input
                      class="size-4 border-border text-brand-primary focus:ring-brand-primary disabled:cursor-not-allowed"
                      type="radio"
                      name="libros-contables-scope"
                      [value]="option.value"
                      [checked]="scope() === option.value"
                      [disabled]="isScopeDisabled(option.value)"
                      (change)="scope.set(option.value)"
                    />
                    {{ option.label }}
                  </label>
                }
              </div>

              <siaf-input label="Tipo de Libro" type="select" [clearable]="true" [options]="tipoLibroOptions" [value]="tipoLibro()" (valueChange)="tipoLibro.set(asString($event))" />
              @if (esLibroMayor()) {
                <div class="grid grid-cols-2 items-start gap-siaf-sm">
                  @for (option of mayorVarianteOptions; track option.value) {
                    <label class="inline-flex items-start gap-2 text-sm text-text">
                      <input
                        class="mt-0.5 size-4 border-border text-brand-primary focus:ring-brand-primary"
                        type="radio"
                        name="libros-contables-mayor-variante"
                        [value]="option.value"
                        [checked]="mayorVariante() === option.value"
                        (change)="mayorVariante.set(option.value)"
                      />
                      {{ option.label }}
                    </label>
                  }
                </div>
              }
              @if (esEnteRector()) {
                <siaf-input label="Ejercicio contable" type="select" [clearable]="true" [options]="anioOptions" [value]="anioCuenta()" (valueChange)="anioCuenta.set(asString($event)); ajustarFechasAlPeriodo()" />
                <siaf-input label="Mes" type="select" [clearable]="true" [options]="mesOptions" [value]="mes()" (valueChange)="mes.set(asString($event)); ajustarFechasAlPeriodo()" />
                <siaf-input label="Pliego" type="select" [clearable]="true" [options]="pliegoOptions" [value]="pliego()" (valueChange)="pliego.set(asString($event))" />
                <siaf-input label="Unidad Ejecutora" type="select" [clearable]="true" [options]="unidadEjecutoraOptions" [value]="unidadEjecutora()" (valueChange)="unidadEjecutora.set(asString($event))" />
                <siaf-date-time-picker placeholder="Fecha desde" variant="date" [defaultToToday]="false" [fullWidth]="true" [minDate]="fechaMin()" [maxDate]="fechaHasta() || fechaMax()" [value]="fechaDesde()" (valueChange)="fechaDesde.set($event)" />
                <siaf-date-time-picker placeholder="Fecha hasta" variant="date" [defaultToToday]="false" [fullWidth]="true" [minDate]="fechaDesde() || fechaMin()" [maxDate]="fechaMax()" [value]="fechaHasta()" (valueChange)="fechaHasta.set($event)" />
              } @else if (usaFiltrosPliego()) {
                <siaf-input label="Entidad" type="select" [clearable]="true" [options]="entidadOptions" [value]="entidad()" (valueChange)="entidad.set(asString($event))" />
                <siaf-input label="Ejercicio contable" type="select" [clearable]="true" [options]="anioOptions" [value]="anioCuenta()" (valueChange)="anioCuenta.set(asString($event)); ajustarFechasAlPeriodo()" />
                <siaf-input label="Mes" type="select" [clearable]="true" [options]="mesOptions" [value]="mes()" (valueChange)="mes.set(asString($event)); ajustarFechasAlPeriodo()" />
                <siaf-date-time-picker placeholder="Fecha desde" variant="date" [defaultToToday]="false" [fullWidth]="true" [minDate]="fechaMin()" [maxDate]="fechaHasta() || fechaMax()" [value]="fechaDesde()" (valueChange)="fechaDesde.set($event)" />
                <siaf-date-time-picker placeholder="Fecha hasta" variant="date" [defaultToToday]="false" [fullWidth]="true" [minDate]="fechaDesde() || fechaMin()" [maxDate]="fechaMax()" [value]="fechaHasta()" (valueChange)="fechaHasta.set($event)" />
              } @else {
                <siaf-input label="Ejercicio contable" type="select" [clearable]="true" [options]="anioOptions" [value]="anioCuenta()" (valueChange)="anioCuenta.set(asString($event)); ajustarFechasAlPeriodo()" />
                <siaf-input label="Mes" type="select" [clearable]="true" [options]="mesOptions" [value]="mes()" (valueChange)="mes.set(asString($event)); ajustarFechasAlPeriodo()" />
                <siaf-date-time-picker placeholder="Fecha desde" variant="date" [defaultToToday]="false" [fullWidth]="true" [minDate]="fechaMin()" [maxDate]="fechaHasta() || fechaMax()" [value]="fechaDesde()" (valueChange)="fechaDesde.set($event)" />
                <siaf-date-time-picker placeholder="Fecha hasta" variant="date" [defaultToToday]="false" [fullWidth]="true" [minDate]="fechaDesde() || fechaMin()" [maxDate]="fechaMax()" [value]="fechaHasta()" (valueChange)="fechaHasta.set($event)" />
              }

              @if (esLibroMayor()) {
                <siaf-input label="Cuenta contable" type="select" [clearable]="true" [options]="cuentaContableOptions" [value]="cuentaContable()" (valueChange)="cuentaContable.set(asString($event))" />
                <siaf-input label="Rango de cuenta desde" type="text" [value]="rangoCuentaDesde()" (valueChange)="rangoCuentaDesde.set(asString($event))" />
                <siaf-input label="Rango de cuenta hasta" type="text" [value]="rangoCuentaHasta()" (valueChange)="rangoCuentaHasta.set(asString($event))" />
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
  readonly pliegoOptions = LIBROS_CONTABLES_PLIEGO_OPTIONS;
  readonly unidadEjecutoraOptions = LIBROS_CONTABLES_UNIDAD_EJECUTORA_OPTIONS;
  readonly cuentaContableOptions = LIBROS_CONTABLES_CUENTA_OPTIONS;

  /** Variantes disponibles cuando el Tipo de Libro es "Libro Mayor". */
  readonly mayorVarianteOptions = [
    { label: 'Libro mayor', value: 'estandar' },
    { label: 'Libro mayor detallado', value: 'extendido' },
  ];

  /** El visualizador ENTE RECTOR añade además el filtro de Pliego. */
  readonly esEnteRector = computed(() => this.currentUserService.visualizadorTipo() === 'ente_rector');

  /** Muestra las variantes (radio buttons) solo cuando se elige Libro Mayor. */
  readonly esLibroMayor = computed(() => this.tipoLibro() === 'mayor');

  /** PLIEGO y ENTE RECTOR filtran por Entidad + Mes (en lugar de Año cuenta / fechas). */
  readonly usaFiltrosPliego = computed(
    () => this.currentUserService.visualizadorTipo() === 'pliego' || this.esEnteRector(),
  );

  readonly scope = signal('');
  readonly tipoLibro = signal('');
  readonly entidad = signal('');
  readonly mes = signal('');
  readonly anioCuenta = signal('');
  readonly fechaDesde = signal('');
  readonly fechaHasta = signal('');
  readonly pliego = signal('');
  /** Unidad Ejecutora (ENTE RECTOR); por defecto "todos". */
  readonly unidadEjecutora = signal('todos');
  /** Variante del Libro Mayor; por defecto "estandar" (Libro mayor). */
  readonly mayorVariante = signal('estandar');
  /** Filtros adicionales del Libro Mayor. */
  readonly cuentaContable = signal('');
  readonly rangoCuentaDesde = signal('');
  readonly rangoCuentaHasta = signal('');

  /**
   * Periodo permitido para "Fecha desde" / "Fecha hasta" (YYYY-MM-DD). Con Mes elegido se limita a
   * ese mes del Ejercicio contable (o del año en curso si no se eligió ejercicio); solo con Ejercicio,
   * a ese año; sin ninguno, no hay límite.
   */
  private readonly periodo = computed(() => {
    const mes = this.mes();
    const anio = this.anioCuenta() || (mes ? String(new Date().getFullYear()) : '');
    if (!anio) {
      return { min: '', max: '' };
    }
    if (!mes) {
      return { min: `${anio}-01-01`, max: `${anio}-12-31` };
    }
    const ultimoDia = new Date(Number(anio), Number(mes), 0).getDate();
    return { min: `${anio}-${mes}-01`, max: `${anio}-${mes}-${String(ultimoDia).padStart(2, '0')}` };
  });

  readonly fechaMin = computed(() => this.periodo().min);
  readonly fechaMax = computed(() => this.periodo().max);

  /** Al cambiar Mes o Ejercicio, descarta las fechas que quedan fuera del nuevo periodo. */
  ajustarFechasAlPeriodo(): void {
    const { min, max } = this.periodo();
    const fueraDePeriodo = (fecha: string) => Boolean(fecha) && ((min && fecha < min) || (max && fecha > max));
    if (fueraDePeriodo(this.fechaDesde())) {
      this.fechaDesde.set('');
    }
    if (fueraDePeriodo(this.fechaHasta())) {
      this.fechaHasta.set('');
    }
  }

  readonly hasCriteria = computed(() =>
    Boolean(this.scope() || this.tipoLibro() || this.entidad() || this.mes() || this.anioCuenta() || this.fechaDesde() || this.fechaHasta() || this.pliego() || this.cuentaContable() || this.rangoCuentaDesde() || this.rangoCuentaHasta())
  );

  asString(value: string | number | string[]): string {
    return Array.isArray(value) ? value[0] ?? '' : String(value ?? '');
  }

  /** "Libros auxiliares" está deshabilitado para todos los perfiles. */
  isScopeDisabled(value: string): boolean {
    return value === 'auxiliares';
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
    this.pliego.set('');
    this.unidadEjecutora.set('todos');
    this.mayorVariante.set('estandar');
    this.cuentaContable.set('');
    this.rangoCuentaDesde.set('');
    this.rangoCuentaHasta.set('');
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
      pliego: this.pliego(),
      unidadEjecutora: this.unidadEjecutora(),
      mayorVariante: this.mayorVariante(),
      cuentaContable: this.cuentaContable(),
      rangoCuentaDesde: this.rangoCuentaDesde(),
      rangoCuentaHasta: this.rangoCuentaHasta(),
    });
  }
}