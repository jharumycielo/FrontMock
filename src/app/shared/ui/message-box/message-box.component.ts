import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'message-box',
  standalone: true,
  template: `
    <div class="flex min-h-[49px] items-center rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-low)] px-siaf-md py-siaf-sm">
      <p class="m-0 text-sm leading-normal tracking-[0.0249px] text-[var(--sys-color-text-neutral-medium)]">{{ text }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageBoxComponent {
  @Input() text = '';
}

