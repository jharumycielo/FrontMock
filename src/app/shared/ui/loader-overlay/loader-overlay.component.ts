import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'siaf-loader-overlay',
  standalone: true,
  imports: [LoaderComponent],
  template: `
    @if (open) {
      <div
        class="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-siaf-md"
        role="status"
        aria-live="polite"
        [attr.aria-label]="label"
      >
        <div class="grid place-items-center gap-siaf-md text-white">
          <siaf-loader [size]="size" [dotSize]="dotSize" tone="light" [decorative]="true" />

          @if (message) {
            <p class="m-0 text-center text-sm font-medium text-white">
              {{ message }}
            </p>
          }
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderOverlayComponent {
  @Input() open = false;
  @Input() message = 'Procesando...';
  @Input() label = 'Procesando';
  @Input() size = 32;
  @Input() dotSize = 6;
}
