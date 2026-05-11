import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { ButtonComponent } from '../../shared/ui/button/button.component';
import { TextFieldComponent } from '../../shared/ui/text-field/text-field.component';

type LoginTab = 'entidades' | 'proveedores';

@Component({
  selector: 'siaf-login',
  standalone: true,
  imports: [ButtonComponent, TextFieldComponent, RouterLink],
  template: `
    <main class="flex min-h-screen bg-[var(--sys-color-bg-surfaces-surface)] text-text lg:h-screen lg:overflow-hidden">
      <section class="hidden h-screen flex-[0_0_50%] overflow-hidden lg:block" aria-hidden="true">
        <img class="h-full w-full object-cover" src="assets/figma/login/login-hero.png" alt="" />
      </section>

      <section class="flex min-h-screen flex-1 items-center justify-center overflow-y-auto px-siaf-lg py-siaf-xxl lg:h-screen lg:min-h-0 lg:flex-[0_0_50%]">
        <div class="flex w-full max-w-[360px] flex-col items-center gap-12">

          <!-- Logos -->
          <header class="flex w-full flex-col items-center gap-siaf-lg">
            <img class="h-[53px] w-[250px] object-contain" src="assets/figma/login/mef-logo.png" alt="Ministerio de Economia y Finanzas" />
            <img class="h-[54px] w-[174px] object-contain" src="assets/figma/login/siaf-logo-vector.svg" alt="SIAF-RP" />
          </header>

          <section class="flex w-full flex-col items-center gap-siaf-lg">

            <!-- Título + Tabs -->
            <div class="flex w-full flex-col items-center gap-siaf-xs">
              <h1 class="m-0 text-[30px] font-bold leading-none tracking-[-0.63px] text-[var(--sys-color-text-brand-primary)]">Bienvenido</h1>
              <p class="m-0 text-sm font-medium leading-normal text-[var(--sys-color-text-neutral-medium)]">
                Ingresa tus datos para Iniciar sesión
              </p>

              <!-- Tabs -->
              <div class="mt-siaf-xs flex w-full border-b-2 border-[var(--sys-color-divider-strong)]" role="tablist">
                <button
                  class="flex flex-1 items-center justify-center min-h-10 px-siaf-md py-siaf-xs text-sm transition relative whitespace-nowrap"
                  role="tab"
                  [attr.aria-selected]="activeTab() === 'entidades'"
                  [class.font-bold]="activeTab() === 'entidades'"
                  [class.text-[var(--sys-color-text-brand-primary)]]="activeTab() === 'entidades'"
                  [class.font-medium]="activeTab() !== 'entidades'"
                  [class.text-[var(--sys-color-text-neutral-low)]]="activeTab() !== 'entidades'"
                  type="button"
                  (click)="activeTab.set('entidades')"
                >
                  Entidades del Estado
                  @if (activeTab() === 'entidades') {
                    <span class="absolute bottom-[-2px] left-0 right-0 h-0.5 rounded-t bg-[var(--sys-color-bg-brand-primary)]"></span>
                  }
                </button>
                <button
                  class="flex flex-1 items-center justify-center min-h-10 px-siaf-md py-siaf-xs text-sm transition relative whitespace-nowrap"
                  role="tab"
                  [attr.aria-selected]="activeTab() === 'proveedores'"
                  [class.font-bold]="activeTab() === 'proveedores'"
                  [class.text-[var(--sys-color-text-brand-primary)]]="activeTab() === 'proveedores'"
                  [class.font-medium]="activeTab() !== 'proveedores'"
                  [class.text-[var(--sys-color-text-neutral-low)]]="activeTab() !== 'proveedores'"
                  type="button"
                  (click)="activeTab.set('proveedores')"
                >
                  Proveedores y Externos
                  @if (activeTab() === 'proveedores') {
                    <span class="absolute bottom-[-2px] left-0 right-0 h-0.5 rounded-t bg-[var(--sys-color-bg-brand-primary)]"></span>
                  }
                </button>
              </div>
            </div>

            <!-- Formulario: Entidades del Estado -->
            @if (activeTab() === 'entidades') {
            <form class="flex w-full flex-col items-center gap-5" aria-label="Inicio de sesión">

              <!-- Input Usuario -->
              <siaf-input
                class="block w-full"
                label="Usuario"
                type="email"
                leadingIcon="mail"
                autocomplete="username"
                [value]="userValue"
                (valueChange)="userValue = textFieldValue($event)"
              />

              <!-- Input Contraseña -->
              <siaf-input
                class="block w-full"
                label="Contraseña"
                [type]="showPassword() ? 'text' : 'password'"
                leadingIcon="lock"
                [trailingIcon]="showPassword() ? 'visibility_off' : 'visibility'"
                [trailingButtonLabel]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                autocomplete="current-password"
                [value]="passwordValue"
                (valueChange)="passwordValue = textFieldValue($event)"
                (trailingAction)="togglePassword()"
              />

              <!-- Botón Iniciar sesión -->
              <a class="block w-full" routerLink="/panel">
                <siaf-button class="block w-full" variant="primary" type="button">Iniciar sesión</siaf-button>
              </a>

              <!-- Links inferiores -->
              <div class="flex w-full items-center justify-between">
                <a
                  class="inline-flex min-h-10 items-center justify-center rounded-siaf-md px-siaf-md py-siaf-xs text-sm font-medium text-[var(--sys-color-text-brand-primary)] transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-light-pressed)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                  href="#"
                >
                  Ir a inicio
                </a>
                <button
                  class="inline-flex min-h-10 items-center justify-center rounded-siaf-md px-siaf-md py-siaf-xs text-sm font-medium text-[var(--sys-color-text-brand-primary)] transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-light-pressed)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                  type="button"
                  (click)="goToRecuperarContrasena()"
                >
                  Olvidé mi contraseña
                </button>
              </div>
            </form>
            } <!-- fin @if entidades -->

            <!-- Formulario: Proveedores y Externos -->
            @if (activeTab() === 'proveedores') {
            <div class="flex w-full flex-col gap-5">

              <!-- ID Peru -->
              <button
                class="flex w-full items-center justify-center gap-siaf-xs rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface px-siaf-md py-siaf-xs text-sm font-medium text-[var(--sys-color-text-neutral-medium)] transition hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                type="button"
              >
                <!-- ID Peru: fondo rojo, dos vectores posicionados (24×24px base) -->
                <span class="relative inline-block size-6 shrink-0 overflow-hidden rounded-siaf-sm bg-[var(--sys-color-bg-feedback-dark-danger)]">
                  <img class="absolute left-[7.74px] top-[4.65px] h-[14.7px] w-[12.36px]" src="assets/figma/login/id-peru-v1.svg" alt="" />
                  <img class="absolute left-[4.05px] top-[9.35px] h-[7.45px] w-[6.87px]" src="assets/figma/login/id-peru-v2.svg" alt="" />
                </span>
                ID Peru
              </button>

              <!-- Sunat -->
              <button
                class="flex w-full items-center justify-center gap-siaf-xs rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface px-siaf-md py-siaf-xs text-sm font-medium text-[var(--sys-color-text-neutral-medium)] transition hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                type="button"
              >
                <!-- Sunat: fondo blanco, dos vectores posicionados -->
                <span class="relative inline-block size-6 shrink-0 overflow-hidden rounded-siaf-sm border border-[var(--sys-color-divider-default)] bg-surface">
                  <img class="absolute left-[8.1px] top-[3.6px] h-[11.25px] w-[11.55px]" src="assets/figma/login/sunat-v1.svg" alt="" />
                  <img class="absolute left-[4.35px] top-[9.3px] h-[11.1px] w-[11.55px]" src="assets/figma/login/sunat-v2.svg" alt="" />
                </span>
                Sunat
              </button>

              <!-- JNE -->
              <div class="relative w-full">
                <button
                  class="flex w-full items-center justify-center gap-siaf-xs rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface px-siaf-md py-siaf-xs text-sm font-medium text-[var(--sys-color-text-neutral-medium)] transition hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                  type="button"
                  (mouseenter)="jnePopover.set(true)"
                  (mouseleave)="jnePopover.set(false)"
                >
                  <!-- JNE: fondo blanco, dos vectores posicionados -->
                  <span class="relative inline-block size-6 shrink-0 overflow-hidden rounded-siaf-sm border border-[var(--sys-color-divider-default)] bg-surface">
                    <img class="absolute left-[3.9px] top-[3.9px] h-[10.95px] w-[16.35px]" src="assets/figma/login/jne-v1.svg" alt="" />
                    <img class="absolute left-[3.9px] top-[8.4px] h-[11.7px] w-[16.35px]" src="assets/figma/login/jne-v2.svg" alt="" />
                  </span>
                  JNE
                </button>

                @if (jnePopover()) {
                  <div class="absolute bottom-[calc(100%+8px)] left-0 right-0 z-50 rounded-[4px] bg-surface px-siaf-md py-siaf-sm shadow-siaf-elevation-1">
                    <p class="m-0 text-sm leading-normal text-[var(--sys-color-text-neutral-medium)]">
                      Exclusivo para autoridades electas.<br />
                      Se registra automáticamente al ingresar por primera vez.
                    </p>
                  </div>
                }
              </div>

              <!-- Ir a inicio -->
              <div class="flex w-full items-center">
                <a
                  class="inline-flex min-h-10 items-center justify-center rounded-siaf-md px-siaf-md py-siaf-xs text-sm font-medium text-[var(--sys-color-text-brand-primary)] transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-light-pressed)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                  href="#"
                >
                  Ir a inicio
                </a>
              </div>
            </div>
            } <!-- fin @if proveedores -->
          </section>
        </div>
      </section>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private readonly router = inject(Router);

  userValue = '';
  passwordValue = '';
  readonly activeTab = signal<LoginTab>('entidades');
  readonly showPassword = signal(false);
  readonly jnePopover = signal(false);

  goToRecuperarContrasena(): void {
    void this.router.navigate(['/login/recuperar-contrasena']);
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  textFieldValue(value: string | number | string[]): string {
    return Array.isArray(value) ? value.join(', ') : String(value);
  }
}
