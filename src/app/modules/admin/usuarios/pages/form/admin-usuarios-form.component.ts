import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { BreadcrumbItem } from '../../../../../shared/components/breadcrumb/breadcrumb.component';
import { SolicitudeFormCardComponent } from '../../../../../shared/components/solicitude-form-card/solicitude-form-card.component';
import { SolicitudePageLayoutComponent } from '../../../../../shared/components/solicitude-page-layout/solicitude-page-layout.component';
import { TextFieldComponent } from '../../../../../shared/ui/text-field/text-field.component';
import { ENTIDADES_SELECT_MOCK, ROLES_MOCK } from '../../config/usuarios.mock';

interface FormData {
  dni: string;
  nombres: string;
  apellidos: string;
  email: string;
  entidadId: string;
  unidad: string;
  rolId: string;
  ambito: 'entidad' | 'nacional' | 'unidad';
}

@Component({
  selector: 'siaf-admin-usuarios-form',
  standalone: true,
  imports: [SolicitudePageLayoutComponent, SolicitudeFormCardComponent, TextFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <siaf-solicitude-page-layout
      [breadcrumbs]="breadcrumbs"
      role="creator"
      state="new"
      heading="Nuevo usuario"
      secondaryText="Complete los datos del nuevo usuario"
      [showReturn]="true"
      (returned)="goBack()"
      (saved)="onSave()"
      (canceled)="goBack()"
    >
      <!-- Card 1: Datos personales -->
      <siaf-solicitude-form-card title="DATOS PERSONALES">
        <div class="grid grid-cols-1 gap-siaf-md sm:grid-cols-3">
          <siaf-input
            label="DNI"
            [required]="true"
            [value]="formData().dni"
            (valueChange)="updateField('dni', $any($event))"
          />
          <siaf-input
            label="Nombres"
            [required]="true"
            [value]="formData().nombres"
            (valueChange)="updateField('nombres', $any($event))"
          />
          <siaf-input
            label="Apellidos"
            [required]="true"
            [value]="formData().apellidos"
            (valueChange)="updateField('apellidos', $any($event))"
          />
          <siaf-input
            label="Email institucional"
            type="email"
            [required]="true"
            [value]="formData().email"
            (valueChange)="updateField('email', $any($event))"
          />
        </div>
      </siaf-solicitude-form-card>

      <!-- Card 2: Perfil de acceso -->
      <siaf-solicitude-form-card title="PERFIL DE ACCESO">
        <div class="grid grid-cols-1 gap-siaf-md sm:grid-cols-2">

          <!-- Entidad -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-[var(--sys-color-text-neutral-low)]">
              Entidad <span class="text-[var(--sys-color-text-feedback-danger)]">*</span>
            </label>
            <select
              class="h-10 w-full rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface px-siaf-md text-sm text-text outline-none transition hover:border-2 hover:border-[var(--sys-color-border-states-hover)] focus:border-2 focus:border-[var(--sys-color-border-states-focus)]"
              [value]="formData().entidadId"
              (change)="updateField('entidadId', $any($event.target).value)"
            >
              <option value="">Seleccionar entidad...</option>
              @for (entidad of entidades; track entidad.id) {
                <option [value]="entidad.id">{{ entidad.nombre }}</option>
              }
            </select>
          </div>

          <!-- Unidad -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-[var(--sys-color-text-neutral-low)]">Unidad orgánica</label>
            <select
              class="h-10 w-full rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface px-siaf-md text-sm text-text outline-none transition hover:border-2 hover:border-[var(--sys-color-border-states-hover)] focus:border-2 focus:border-[var(--sys-color-border-states-focus)]"
              [value]="formData().unidad"
              (change)="updateField('unidad', $any($event.target).value)"
            >
              <option value="">Seleccionar unidad...</option>
              <option value="OGTI">OGTI</option>
              <option value="DGCP">DGCP</option>
              <option value="Gerencia de Administración">Gerencia de Administración</option>
              <option value="Oficina de Contabilidad">Oficina de Contabilidad</option>
            </select>
          </div>

          <!-- Rol -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-[var(--sys-color-text-neutral-low)]">
              Rol <span class="text-[var(--sys-color-text-feedback-danger)]">*</span>
            </label>
            <select
              class="h-10 w-full rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface px-siaf-md text-sm text-text outline-none transition hover:border-2 hover:border-[var(--sys-color-border-states-hover)] focus:border-2 focus:border-[var(--sys-color-border-states-focus)]"
              [value]="formData().rolId"
              (change)="updateField('rolId', $any($event.target).value)"
            >
              <option value="">Seleccionar rol...</option>
              @for (rol of roles; track rol.id) {
                <option [value]="rol.id">{{ rol.nombre }}</option>
              }
            </select>
          </div>

          <!-- Ámbito -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-[var(--sys-color-text-neutral-low)]">
              Ámbito <span class="text-[var(--sys-color-text-feedback-danger)]">*</span>
            </label>
            <select
              class="h-10 w-full rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface px-siaf-md text-sm text-text outline-none transition hover:border-2 hover:border-[var(--sys-color-border-states-hover)] focus:border-2 focus:border-[var(--sys-color-border-states-focus)]"
              [value]="formData().ambito"
              (change)="updateField('ambito', $any($event.target).value)"
            >
              <option value="entidad">Entidad</option>
              <option value="nacional">Nacional</option>
              <option value="unidad">Unidad</option>
            </select>
          </div>

        </div>
      </siaf-solicitude-form-card>
    </siaf-solicitude-page-layout>
  `,
})
export class AdminUsuariosFormComponent {
  private readonly router = inject(Router);

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Inicio', href: '/panel' },
    { label: 'Administración' },
    { label: 'Usuarios', href: '/admin/usuarios' },
    { label: 'Nuevo usuario' },
  ];

  readonly entidades = ENTIDADES_SELECT_MOCK;
  readonly roles = ROLES_MOCK;

  readonly formData = signal<FormData>({
    dni: '',
    nombres: '',
    apellidos: '',
    email: '',
    entidadId: '',
    unidad: '',
    rolId: '',
    ambito: 'entidad',
  });

  updateField<K extends keyof FormData>(field: K, value: FormData[K]): void {
    this.formData.update((prev) => ({ ...prev, [field]: value }));
  }

  goBack(): void {
    void this.router.navigate(['/admin/usuarios']);
  }

  onSave(): void {
    console.log('Guardar usuario:', this.formData());
  }
}
