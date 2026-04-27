import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonComponent } from '../../shared/ui/button/button.component';
import { IconComponent } from '../../shared/ui/icon/icon.component';

type LoginField = 'user' | 'password';

@Component({
  selector: 'siaf-login',
  standalone: true,
  imports: [ButtonComponent, IconComponent, RouterLink],
  template: `
    <main class="flex min-h-screen bg-[var(--sys-color-bg-surfaces-surface,#fff)] text-text lg:h-screen lg:overflow-hidden">
      <section class="hidden h-screen flex-[0_0_50%] overflow-hidden lg:block" aria-hidden="true">
        <img class="h-full w-full object-cover" src="assets/figma/login/login-hero.png" alt="" />
      </section>

      <section class="flex min-h-screen flex-1 items-center justify-center overflow-y-auto px-siaf-lg py-siaf-xxl lg:h-screen lg:min-h-0 lg:flex-[0_0_50%]">
        <div class="flex w-full max-w-[360px] flex-col items-center gap-12">
          <header class="flex w-full flex-col items-center gap-siaf-lg">
            <img class="h-[53px] w-[250px] object-contain" src="assets/figma/login/mef-logo.png" alt="Ministerio de Economia y Finanzas" />
            <img class="h-[54px] w-[174px] object-contain" src="assets/figma/login/siaf-logo-vector.svg" alt="SIAF-RP" />
          </header>

          <section class="flex w-full flex-col items-center gap-siaf-lg">
            <div class="flex flex-col items-center gap-siaf-xs whitespace-nowrap">
              <h1 class="m-0 text-[30px] font-bold leading-none tracking-[-0.63px] text-[#004899]">Bienvenido</h1>
              <p class="m-0 text-sm font-medium leading-normal text-[var(--sys-color-text-neutral-high,#202020)]">
                Ingresa tus datos para continuar
              </p>
            </div>

            <form class="flex w-full flex-col items-center gap-5" aria-label="Inicio de sesión">
              <label class="relative block w-full">
                @if (isFieldFloating('user')) {
                  <span class="absolute left-3 top-[-10px] z-[1] rounded-siaf-sm bg-surface px-siaf-xxs text-xs font-medium leading-normal text-[var(--sys-color-text-neutral-low,#6f6f71)]">
                    Usuario
                  </span>
                }
                <span
                  class="flex min-h-10 items-center gap-siaf-xs rounded-siaf-md border bg-surface px-siaf-md py-siaf-xs transition hover:border-2 hover:border-[rgba(1,72,153,0.56)] focus-within:border-2 focus-within:border-[rgba(1,72,153,0.8)]"
                  [class.border-[#20635e]]="isFieldSuccess('user')"
                  [class.border-2]="isFieldSuccess('user')"
                  [class.border-[rgba(32,32,32,0.4)]]="!isFieldSuccess('user')"
                >
                  <siaf-icon class="shrink-0 text-[var(--sys-color-text-neutral-medium,#29292a)]" name="mail" [size]="24" />
                  <input
                    class="min-w-0 flex-1 bg-transparent text-sm leading-6 tracking-[0.0249px] text-[var(--sys-color-text-neutral-medium,#29292a)] outline-none placeholder:text-[var(--sys-color-text-neutral-low,#6f6f71)]"
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

              <div class="flex w-full flex-col gap-siaf-xs">
                <label class="relative block w-full">
                  @if (isFieldFloating('password')) {
                    <span class="absolute left-3 top-[-10px] z-[1] rounded-siaf-sm bg-surface px-siaf-xxs text-xs font-medium leading-normal text-[var(--sys-color-text-neutral-low,#6f6f71)]">
                      Contraseña
                    </span>
                  }
                  <span
                    class="flex min-h-10 items-center gap-siaf-xs rounded-siaf-md border bg-surface px-siaf-md py-siaf-xs transition hover:border-2 hover:border-[rgba(1,72,153,0.56)] focus-within:border-2 focus-within:border-[rgba(1,72,153,0.8)]"
                    [class.border-[#20635e]]="isFieldSuccess('password')"
                    [class.border-2]="isFieldSuccess('password')"
                    [class.border-[rgba(32,32,32,0.4)]]="!isFieldSuccess('password')"
                  >
                    <siaf-icon class="shrink-0 text-[var(--sys-color-text-neutral-medium,#29292a)]" name="lock" [size]="24" />
                    <input
                      class="min-w-0 flex-1 bg-transparent text-sm leading-6 tracking-[0.0249px] text-[var(--sys-color-text-neutral-medium,#29292a)] outline-none placeholder:text-[var(--sys-color-text-neutral-low,#6f6f71)]"
                      type="password"
                      [placeholder]="isFieldFloating('password') ? '' : 'Contraseña'"
                      [value]="passwordValue"
                      autocomplete="current-password"
                      (focus)="focusedField = 'password'"
                      (blur)="focusedField = ''"
                      (input)="passwordValue = inputValue($event)"
                    />
                    <button
                      class="inline-flex size-6 shrink-0 items-center justify-center rounded-siaf-sm text-[var(--sys-color-text-neutral-medium,#29292a)] transition hover:bg-[rgba(32,32,32,0.08)] active:bg-[rgba(32,32,32,0.16)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                      type="button"
                      aria-label="Mostrar contraseña"
                    >
                      <siaf-icon name="visibility" [size]="24" />
                    </button>
                  </span>
                </label>

                <div class="flex justify-end">
                  <a class="text-xs leading-5 text-brand-primary hover:underline active:text-[#00366f]" href="#">
                    Olvidé mi contraseña
                  </a>
                </div>
              </div>

              <a class="block w-full" routerLink="/panel">
                <siaf-button class="block w-full" variant="accent" type="button">Iniciar sesión</siaf-button>
              </a>

              <div class="flex w-full justify-center sm:justify-end">
                <a
                  class="inline-flex min-h-10 items-center justify-center gap-siaf-xs rounded-siaf-md px-siaf-md py-siaf-xs text-sm font-medium text-[var(--sys-color-text-neutral-medium,#29292a)] transition hover:bg-surface-muted active:bg-[rgba(32,32,32,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                  href="#"
                >
                  <siaf-icon name="home" [size]="24" />
                  Ir a inicio
                </a>
              </div>
            </form>
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

  isFieldFloating(field: LoginField): boolean {
    return this.focusedField === field || Boolean(field === 'user' ? this.userValue : this.passwordValue);
  }

  isFieldSuccess(field: LoginField): boolean {
    const value = field === 'user' ? this.userValue : this.passwordValue;
    return this.focusedField !== field && Boolean(value);
  }

  inputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}
