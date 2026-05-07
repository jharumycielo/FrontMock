import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type LoaderTone = 'current' | 'light' | 'brand';

@Component({
  selector: 'siaf-loader',
  standalone: true,
  template: `
    <span
      class="siaf-loader"
      [class.siaf-loader--light]="tone === 'light'"
      [class.siaf-loader--brand]="tone === 'brand'"
      [style.--siaf-loader-size.px]="size"
      [style.--siaf-loader-dot-size.px]="dotSize"
      [attr.role]="decorative ? null : 'status'"
      [attr.aria-label]="decorative ? null : label"
      [attr.aria-hidden]="decorative ? 'true' : null"
    >
      @for (dot of dots; track dot) {
        <span class="siaf-loader__dot"></span>
      }
    </span>
  `,
  styles: `
    :host {
      display: inline-flex;
      line-height: 0;
    }

    .siaf-loader {
      --siaf-loader-size: 32px;
      --siaf-loader-dot-size: 6px;
      --siaf-loader-radius: calc((var(--siaf-loader-size) - var(--siaf-loader-dot-size)) / 2);

      position: relative;
      display: inline-block;
      width: var(--siaf-loader-size);
      height: var(--siaf-loader-size);
      color: currentColor;
    }

    .siaf-loader--light {
      color: var(--sys-color-bg-brand-white);
    }

    .siaf-loader--brand {
      color: var(--sys-color-bg-brand-accent);
    }

    .siaf-loader__dot {
      position: absolute;
      top: 50%;
      left: 50%;
      width: var(--siaf-loader-dot-size);
      height: var(--siaf-loader-dot-size);
      margin-top: calc(var(--siaf-loader-dot-size) / -2);
      margin-left: calc(var(--siaf-loader-dot-size) / -2);
      border-radius: 9999px;
      background: currentColor;
      animation: siaf-loader-fade 0.8s linear infinite;
      transform: rotate(calc((var(--siaf-loader-index) - 1) * 45deg)) translateY(calc(var(--siaf-loader-radius) * -1));
    }

    .siaf-loader__dot:nth-child(1) {
      --siaf-loader-index: 1;
      animation-delay: -0.7s;
    }

    .siaf-loader__dot:nth-child(2) {
      --siaf-loader-index: 2;
      animation-delay: -0.6s;
    }

    .siaf-loader__dot:nth-child(3) {
      --siaf-loader-index: 3;
      animation-delay: -0.5s;
    }

    .siaf-loader__dot:nth-child(4) {
      --siaf-loader-index: 4;
      animation-delay: -0.4s;
    }

    .siaf-loader__dot:nth-child(5) {
      --siaf-loader-index: 5;
      animation-delay: -0.3s;
    }

    .siaf-loader__dot:nth-child(6) {
      --siaf-loader-index: 6;
      animation-delay: -0.2s;
    }

    .siaf-loader__dot:nth-child(7) {
      --siaf-loader-index: 7;
      animation-delay: -0.1s;
    }

    .siaf-loader__dot:nth-child(8) {
      --siaf-loader-index: 8;
      animation-delay: 0s;
    }

    @keyframes siaf-loader-fade {
      0%,
      100% {
        opacity: 1;
      }

      50% {
        opacity: 0.28;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderComponent {
  @Input() size = 32;
  @Input() dotSize = 6;
  @Input() tone: LoaderTone = 'current';
  @Input() label = 'Cargando';
  @Input() decorative = false;

  protected readonly dots = Array.from({ length: 8 }, (_, index) => index);
}
