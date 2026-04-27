import { ChangeDetectionStrategy, Component, ElementRef, QueryList, ViewChildren, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonComponent } from '../../shared/ui/button/button.component';
import { IconComponent } from '../../shared/ui/icon/icon.component';

@Component({
  selector: 'siaf-otp-verification',
  standalone: true,
  imports: [ButtonComponent, IconComponent, RouterLink],
  template: `
    <main class="flex min-h-screen items-center justify-center bg-[var(--sys-color-bg-surfaces-surface-lowest,rgba(32,32,32,0.04))] p-siaf-xxl">
      <div class="w-full max-w-[1077px] rounded-siaf-lg bg-surface p-siaf-xxl shadow-[0px_3px_12px_-4px_rgba(0,0,0,0.2)]">
        <div class="flex flex-col items-center justify-between gap-10 min-h-[440px]">

          <!-- Contenido principal -->
          <div class="flex flex-col items-center gap-5 w-full">

            <!-- Título y descripción -->
            <div class="flex flex-col items-center gap-5">
              <h1 class="m-0 text-[27px] font-bold leading-[36px] tracking-[-0.31px] text-[#004899]">
                Verificación de código OTP
              </h1>
              <p class="m-0 w-[302px] text-center text-sm font-medium leading-5 text-[#3c3c3c]">
                Hemos enviado el código OTP a su correo electrónico. Por favor, ingrese el código en el campo a continuación.
              </p>
            </div>

            <!-- Inputs OTP -->
            <div class="flex items-center gap-5">
              @for (digit of otp; track $index; let i = $index) {
                <input
                  #otpInput
                  class="h-10 w-[42px] rounded-siaf-md border border-[rgba(32,32,32,0.4)] bg-surface text-center text-sm text-text outline-none transition focus:border-2 focus:border-[rgba(1,72,153,0.8)]"
                  type="text"
                  inputmode="numeric"
                  maxlength="1"
                  [value]="digit"
                  (input)="onDigitInput($event, i)"
                  (keydown)="onKeyDown($event, i)"
                  (paste)="onPaste($event)"
                />
              }
            </div>

            <!-- Botón Iniciar sesión -->
            <div class="w-[336px]">
              <siaf-button class="block w-full" variant="primary" [disabled]="!isComplete()" routerLink="/panel">
                Iniciar sesión
              </siaf-button>
            </div>

            <!-- Sección de ayuda -->
            <div class="w-[320px]">
              <p class="m-0 text-sm font-bold leading-5 text-[#3c3c3c]">¿Necesitas ayuda?</p>
              <p class="m-0 text-xs leading-5 text-[#3c3c3c]">
                Si no puedes recibir el código o si cambiaste tu correo electrónico o número de teléfono,
                <a class="text-[#014899] hover:underline" href="#">Prueba de otra manera</a>
              </p>
            </div>
          </div>

          <!-- Ir a inicio -->
          <div class="flex w-full justify-end">
            <a
              class="inline-flex min-h-10 items-center gap-siaf-xs rounded-siaf-md px-siaf-md py-siaf-xs text-sm font-medium text-[var(--sys-color-text-neutral-medium,#29292a)] transition hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              routerLink="/login"
            >
              <siaf-icon name="home" [size]="24" />
              Ir a inicio
            </a>
          </div>

        </div>
      </div>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OtpVerificationComponent {
  @ViewChildren('otpInput') inputs!: QueryList<ElementRef<HTMLInputElement>>;

  otp = ['', '', '', ''];

  isComplete(): boolean {
    return this.otp.every((d) => d.length === 1);
  }

  onDigitInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '').slice(-1);
    this.otp[index] = value;
    input.value = value;

    if (value && index < 3) {
      this.inputs.get(index + 1)?.nativeElement.focus();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.otp[index] && index > 0) {
      this.inputs.get(index - 1)?.nativeElement.focus();
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const text = event.clipboardData?.getData('text') ?? '';
    const digits = text.replace(/\D/g, '').slice(0, 4).split('');
    digits.forEach((d, i) => {
      if (i < 4) {
        this.otp[i] = d;
        const el = this.inputs.get(i)?.nativeElement;
        if (el) el.value = d;
      }
    });
    const nextIndex = Math.min(digits.length, 3);
    this.inputs.get(nextIndex)?.nativeElement.focus();
  }
}
