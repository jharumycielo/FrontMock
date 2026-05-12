import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonComponent } from '../../shared/ui/button/button.component';
import { IconComponent } from '../../shared/ui/icon/icon.component';

@Component({
  selector: 'siaf-otp-verification',
  standalone: true,
  imports: [ButtonComponent, IconComponent, NgClass, RouterLink],
  template: `
    <main class="flex min-h-screen items-center justify-center bg-[var(--sys-color-bg-surfaces-surface-lowest)] px-siaf-md py-siaf-lg sm:p-siaf-xxl">
      <div class="w-full max-w-[1077px] rounded-siaf-lg bg-surface px-siaf-md py-siaf-xl shadow-siaf-sm sm:p-siaf-xxl">
        <div class="flex min-h-[420px] flex-col items-center justify-between gap-8 sm:min-h-[440px] sm:gap-10">

          <!-- Contenido principal -->
          <div class="flex w-full flex-col items-center gap-5">

            <!-- Título y descripción -->
            <div class="flex w-full max-w-[360px] flex-col items-center gap-5">
              <h1 class="m-0 text-center text-[24px] font-bold leading-[32px] tracking-[-0.31px] text-[var(--sys-color-text-brand-primary)] sm:text-[27px] sm:leading-[36px]">
                Verificación de código OTP
              </h1>
              <p class="m-0 w-full text-center text-sm font-medium leading-5 text-[var(--sys-color-text-neutral-medium)]">
                Hemos enviado el código OTP a su correo electrónico. Por favor, ingrese el código en el campo a continuación.
              </p>
            </div>

            <!-- Inputs OTP -->
            <div class="flex w-full max-w-[248px] items-center justify-center gap-siaf-sm sm:max-w-none sm:gap-5">
              @for (digit of otp; track $index; let i = $index) {
                <input
                  #otpInput
                  class="h-10 w-10 rounded-siaf-md border bg-surface text-center text-sm text-text outline-none transition focus:border-2 sm:w-[42px]"
                  [ngClass]="otpInputStateClass(digit)"
                  type="text"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  autocomplete="one-time-code"
                  maxlength="1"
                  [value]="digit"
                  (beforeinput)="onBeforeInput($event)"
                  (input)="onDigitInput($event, i)"
                  (keydown)="onKeyDown($event, i)"
                  (paste)="onPaste($event)"
                />
              }
            </div>

            <!-- Botón Iniciar sesión -->
            <div class="w-full max-w-[336px]">
              <siaf-button class="block w-full" variant="primary" size="md" [disabled]="!isComplete()" routerLink="/panel">
                Iniciar sesión
              </siaf-button>
            </div>

            <!-- Sección de ayuda -->
            <div class="w-full max-w-[336px]">
              <p class="m-0 text-sm font-bold leading-5 text-[var(--sys-color-text-neutral-medium)]">¿Necesitas ayuda?</p>
              <p class="m-0 text-xs leading-5 text-[var(--sys-color-text-neutral-medium)]">
                Si no puedes recibir el código o si cambiaste tu correo electrónico o número de teléfono,
                <a class="text-[var(--sys-color-text-brand-primary)] hover:underline" href="#">Prueba de otra manera</a>
              </p>
            </div>
          </div>

          <!-- Ir a inicio -->
          <div class="flex w-full justify-center sm:justify-end">
            <a
              class="inline-flex min-h-10 items-center gap-siaf-xs rounded-siaf-md px-siaf-md py-siaf-xs text-sm font-medium text-[var(--sys-color-text-neutral-medium)] transition hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
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

  otpInputStateClass(digit: string): string {
    return digit
      ? 'border-2 border-[var(--sys-color-border-feedback-success)] focus:border-[var(--sys-color-border-feedback-success)]'
      : 'border-[var(--sys-color-border-states-enabled)] focus:border-[var(--sys-color-border-states-focus)]';
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

  onBeforeInput(event: Event): void {
    const inputEvent = event as InputEvent;
    if (inputEvent.inputType.includes('Paste')) {
      return;
    }

    if (inputEvent.data && /\D/.test(inputEvent.data)) {
      event.preventDefault();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    if (event.key.length === 1 && /\D/.test(event.key)) {
      event.preventDefault();
      return;
    }

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
