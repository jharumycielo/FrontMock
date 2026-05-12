import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { BreadcrumbItem } from '../../../../../shared/components/breadcrumb/breadcrumb.component';
import { SolicitudeFormCardComponent } from '../../../../../shared/components/solicitude-form-card/solicitude-form-card.component';
import { SolicitudePageLayoutComponent } from '../../../../../shared/components/solicitude-page-layout/solicitude-page-layout.component';
import { TextFieldComponent } from '../../../../../shared/ui/text-field/text-field.component';
import { ENTIDADES_MOCK, TipoEntidad } from '../../config/entidades.mock';

interface EntidadFormData {
  nombre: string;
  codigo: string;
  ruc: string;
  tipoEntidad: TipoEntidad | '';
  entidadPadreId: string;
}

@Component({
  selector: 'siaf-admin-entidades-form',
  standalone: true,
  imports: [SolicitudePageLayoutComponent, SolicitudeFormCardComponent, TextFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <siaf-solicitude-page-layout
      [breadcrumbs]="breadcrumbs"
      role="creator"
      state="new"
      heading="Nueva entidad"
      secondaryText="Complete los datos de la nueva entidad"
      [showReturn]="true"
      (returned)="goBack()"
      (saved)="onSave()"
      (canceled)="goBack()"
    >
      <!-- Card: Datos de la entidad -->
      <siaf-solicitude-form-card title="DATOS DE LA ENTIDAD">
        <div class="grid grid-cols-1 gap-siaf-md sm:grid-cols-2">

          <!-- Nombre (full width) -->
          <div class="sm:col-span-2">
            <siaf-input
              label="Nombre completo de la entidad"
              [required]="true"
              [value]="formData().nombre"
              (valueChange)="updateField('nombre', $any($event))"
            />
          </div>

          <!-- Código -->
          <siaf-input
            label="Código"
            [required]="true"
            hint="Se guarda en mayúsculas. Ej: MEF, GORE-ICA"
            [value]="formData().codigo"
            (valueChange)="updateField('codigo', $any($event).toUpperCase())"
          />

          <!-- RUC -->
          <siaf-input
            label="RUC (opcional)"
            [value]="formData().ruc"
            (valueChange)="updateField('ruc', $any($event))"
          />

          <!-- Tipo de entidad -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-[var(--sys-color-text-neutral-low)]">
              Tipo de entidad <span class="text-[var(--sys-color-text-feedback-danger)]">*</span>
            </label>
            <select
              class="h-10 w-full rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface px-siaf-md text-sm text-text outline-none transition hover:border-2 hover:border-[var(--sys-color-border-states-hover)] focus:border-2 focus:border-[var(--sys-color-border-states-focus)]"
              [value]="formData().tipoEntidad"
              (change)="updateField('tipoEntidad', $any($event.target).value)"
            >
              <option value="">Seleccionar tipo...</option>
              <option value="ministerio">Ministerio</option>
              <option value="municipalidad">Municipalidad</option>
              <option value="gobierno_regional">Gobierno Regional</option>
              <option value="unidad_ejecutora">Unidad Ejecutora</option>
              <option value="organismo_publico">Organismo Público</option>
              <option value="empresa_publica">Empresa Pública</option>
              <option value="otra">Otra</option>
            </select>
          </div>

          <!-- Entidad padre -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-[var(--sys-color-text-neutral-low)]">Entidad padre (opcional)</label>
            <select
              class="h-10 w-full rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface px-siaf-md text-sm text-text outline-none transition hover:border-2 hover:border-[var(--sys-color-border-states-hover)] focus:border-2 focus:border-[var(--sys-color-border-states-focus)]"
              [value]="formData().entidadPadreId"
              (change)="updateField('entidadPadreId', $any($event.target).value)"
            >
              <option value="">Ninguna</option>
              @for (entidad of entidadesPadre; track entidad.id) {
                <option [value]="entidad.id">{{ entidad.nombre }}</option>
              }
            </select>
          </div>

        </div>
      </siaf-solicitude-form-card>
    </siaf-solicitude-page-layout>
  `,
})
export class AdminEntidadesFormComponent {
  private readonly router = inject(Router);

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Inicio', href: '/panel' },
    { label: 'Administración' },
    { label: 'Entidades', href: '/admin/entidades' },
    { label: 'Nueva entidad' },
  ];

  readonly entidadesPadre = ENTIDADES_MOCK.filter((e) => e.estadoEntidad === 'activa');

  readonly formData = signal<EntidadFormData>({
    nombre: '',
    codigo: '',
    ruc: '',
    tipoEntidad: '',
    entidadPadreId: '',
  });

  updateField<K extends keyof EntidadFormData>(field: K, value: EntidadFormData[K]): void {
    this.formData.update((prev) => ({ ...prev, [field]: value }));
  }

  goBack(): void {
    void this.router.navigate(['/admin/entidades']);
  }

  onSave(): void {
    console.log('Guardar entidad:', this.formData());
  }
}
