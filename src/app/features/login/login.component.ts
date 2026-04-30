import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { ButtonComponent } from '../../shared/ui/button/button.component';
import { IconComponent } from '../../shared/ui/icon/icon.component';

type LoginField = 'user' | 'password';
type LoginTab = 'entidades' | 'proveedores';

@Component({
  selector: 'siaf-login',
  standalone: true,
  imports: [ButtonComponent, IconComponent, RouterLink],
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
              <p class="m-0 text-sm font-medium leading-normal text-[var(--sys-color-bg-on-surfaces-medium,rgba(32,32,32,0.8))]">
                Ingresa tus datos para Iniciar sesión
              </p>

              <!-- Tabs -->
              <div class="mt-siaf-xs flex w-full border-b-2 border-[rgba(32,32,32,0.24)]" role="tablist">
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
              <label class="relative block w-full">
                @if (isFieldFloating('user')) {
                  <span class="absolute left-3 top-[-10px] z-[1] rounded-siaf-sm bg-surface px-siaf-xxs text-xs font-medium leading-normal text-[var(--sys-color-text-neutral-low)]">
                    Usuario
                  </span>
                }
                <span
                  class="flex min-h-10 items-center gap-siaf-xs rounded-siaf-md border bg-surface px-siaf-md py-siaf-xs transition focus-within:border-2 focus-within:border-[rgba(1,72,153,0.8)]"
                  [class.border-[var(--sys-color-border-states-enabled)]]="!isFieldSuccess('user')"
                  [class.border-[var(--sys-color-border-feedback-success)]]="isFieldSuccess('user')"
                  [class.border-2]="isFieldSuccess('user')"
                >
                  <siaf-icon class="shrink-0 text-[var(--sys-color-text-neutral-medium)]" name="mail" [size]="24" />
                  <input
                    class="min-w-0 flex-1 bg-transparent text-sm leading-6 tracking-[0.0249px] text-[var(--sys-color-text-neutral-medium)] outline-none placeholder:text-[var(--sys-color-text-neutral-low)]"
                    type="email"
                    [placeholder]="isFieldFloating('user') ? '' : 'Usuario'"
                    [value]="userValue"
                    autocomplete="username"
                    (focus)="focusedField = 'user'"
                    (blur)="focusedField = ''"
                    (input)="userValue = inputValue($event)"
                  />
                </span>
              </label>

              <!-- Input Contraseña -->
              <label class="relative block w-full">
                @if (isFieldFloating('password')) {
                  <span class="absolute left-3 top-[-10px] z-[1] rounded-siaf-sm bg-surface px-siaf-xxs text-xs font-medium leading-normal text-[var(--sys-color-text-neutral-low)]">
                    Contraseña
                  </span>
                }
                <span
                  class="flex min-h-10 items-center gap-siaf-xs rounded-siaf-md border bg-surface px-siaf-md py-siaf-xs transition focus-within:border-2 focus-within:border-[rgba(1,72,153,0.8)]"
                  [class.border-[rgba(32,32,32,0.4)]]="!isFieldSuccess('password')"
                  [class.border-[var(--sys-color-border-feedback-success)]]="isFieldSuccess('password')"
                  [class.border-2]="isFieldSuccess('password')"
                >
                  <siaf-icon class="shrink-0 text-[var(--sys-color-text-neutral-medium)]" name="lock" [size]="24" />
                  <input
                    class="min-w-0 flex-1 bg-transparent text-sm leading-6 tracking-[0.0249px] text-[var(--sys-color-text-neutral-medium)] outline-none placeholder:text-[var(--sys-color-text-neutral-low)]"
                    [type]="showPassword() ? 'text' : 'password'"
                    [placeholder]="isFieldFloating('password') ? '' : 'Contraseña'"
                    [value]="passwordValue"
                    autocomplete="current-password"
                    (focus)="focusedField = 'password'"
                    (blur)="focusedField = ''"
                    (input)="passwordValue = inputValue($event)"
                  />
                  <button
                    class="inline-flex size-6 shrink-0 items-center justify-center rounded-siaf-sm text-[var(--sys-color-text-neutral-medium)] transition hover:bg-[rgba(32,32,32,0.08)] active:bg-[rgba(32,32,32,0.16)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                    type="button"
                    [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                    (click)="togglePassword()"
                  >
                    <siaf-icon [name]="showPassword() ? 'visibility_off' : 'visibility'" [size]="24" />
                  </button>
                </span>
              </label>

              <!-- Botón Iniciar sesión -->
              <a class="block w-full" routerLink="/panel">
                <siaf-button class="block w-full" variant="primary" type="button">Iniciar sesión</siaf-button>
              </a>

              <!-- Links inferiores -->
              <div class="flex w-full items-center justify-between">
                <a
                  class="inline-flex min-h-10 items-center justify-center rounded-siaf-md px-siaf-md py-siaf-xs text-sm font-medium text-[var(--sys-color-text-brand-primary)] transition hover:bg-surface-muted active:bg-[rgba(32,32,32,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                  href="#"
                >
                  Ir a inicio
                </a>
                <button
                  class="inline-flex min-h-10 items-center justify-center rounded-siaf-md px-siaf-md py-siaf-xs text-sm font-medium text-[var(--sys-color-text-brand-primary)] transition hover:bg-surface-muted active:bg-[rgba(32,32,32,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
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
                class="flex w-full items-center justify-center gap-siaf-xs rounded-siaf-md border border-[rgba(32,32,32,0.4)] bg-surface px-siaf-md py-siaf-xs text-sm font-medium text-[var(--sys-color-text-neutral-medium)] transition hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                type="button"
              >
                <!-- ID Peru: fondo rojo, dos vectores posicionados (24×24px base) -->
                <span style="position:relative;display:inline-block;width:24px;height:24px;flex-shrink:0;overflow:hidden;border-radius:4px;background:var(--sys-color-bg-feedback-dark-danger);">
                  <img src="assets/figma/login/id-peru-v1.svg" style="position:absolute;left:7.74px;top:4.65px;width:12.36px;height:14.7px;" alt="" />
                  <img src="assets/figma/login/id-peru-v2.svg" style="position:absolute;left:4.05px;top:9.35px;width:6.87px;height:7.45px;" alt="" />
                </span>
                ID Peru
              </button>

              <!-- Sunat -->
              <button
                class="flex w-full items-center justify-center gap-siaf-xs rounded-siaf-md border border-[rgba(32,32,32,0.4)] bg-surface px-siaf-md py-siaf-xs text-sm font-medium text-[var(--sys-color-text-neutral-medium)] transition hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                type="button"
              >
                <!-- Sunat: fondo blanco, dos vectores posicionados -->
                <span style="position:relative;display:inline-block;width:24px;height:24px;flex-shrink:0;overflow:hidden;border-radius:4px;background:var(--sys-color-bg-surfaces-surface);border:1px solid rgba(32,32,32,0.08);">
                  <img src="assets/figma/login/sunat-v1.svg" style="position:absolute;left:8.1px;top:3.6px;width:11.55px;height:11.25px;" alt="" />
                  <img src="assets/figma/login/sunat-v2.svg" style="position:absolute;left:4.35px;top:9.3px;width:11.55px;height:11.1px;" alt="" />
                </span>
                Sunat
              </button>

              <!-- JNE -->
              <div class="relative w-full">
                <button
                  class="flex w-full items-center justify-center gap-siaf-xs rounded-siaf-md border border-[rgba(32,32,32,0.4)] bg-surface px-siaf-md py-siaf-xs text-sm font-medium text-[var(--sys-color-text-neutral-medium)] transition hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                  type="button"
                  (mouseenter)="jnePopover.set(true)"
                  (mouseleave)="jnePopover.set(false)"
                >
                  <!-- JNE: fondo blanco, dos vectores posicionados -->
                  <span style="position:relative;display:inline-block;width:24px;height:24px;flex-shrink:0;overflow:hidden;border-radius:4px;background:var(--sys-color-bg-surfaces-surface);border:1px solid rgba(32,32,32,0.08);">
                    <img src="assets/figma/login/jne-v1.svg" style="position:absolute;left:3.9px;top:3.9px;width:16.35px;height:10.95px;" alt="" />
                    <img src="assets/figma/login/jne-v2.svg" style="position:absolute;left:3.9px;top:8.4px;width:16.35px;height:11.7px;" alt="" />
                  </span>
                  JNE
                </button>

                @if (jnePopover()) {
                  <div class="absolute bottom-[calc(100%+8px)] left-0 right-0 z-50 rounded-[4px] bg-surface px-siaf-md py-siaf-sm shadow-[0px_6px_5px_rgba(0,0,0,0.14),0px_1px_9px_rgba(0,0,0,0.12),0px_3px_3px_rgba(0,0,0,0.2)]">
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
                  class="inline-flex min-h-10 items-center justify-center rounded-siaf-md px-siaf-md py-siaf-xs text-sm font-medium text-[var(--sys-color-text-brand-primary)] transition hover:bg-surface-muted active:bg-[rgba(32,32,32,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
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
  focusedField: LoginField | '' = '';
  userValue = '';
  passwordValue = '';
  readonly activeTab = signal<LoginTab>('entidades');
  readonly showPassword = signal(false);
  readonly jnePopover = signal(false);

  constructor(private readonly router: Router) {}

  goToRecuperarContrasena(): void {
    void this.router.navigate(['/login/recuperar-contrasena']);
  }

  isFieldFloating(field: LoginField): boolean {
    return this.focusedField === field || Boolean(field === 'user' ? this.userValue : this.passwordValue);
  }

  isFieldSuccess(field: LoginField): boolean {
    const value = field === 'user' ? this.userValue : this.passwordValue;
    return this.focusedField !== field && Boolean(value);
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  inputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}
