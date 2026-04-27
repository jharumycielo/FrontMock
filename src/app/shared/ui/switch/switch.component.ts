import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'siaf-switch',
  standalone: true,
  template: `
    <label class="inline-flex items-center gap-3 text-sm text-text">
      <span class="relative inline-flex h-6 w-11 items-center rounded-full transition" [class.bg-brand-primary]="checked" [class.bg-border]="!checked">
        <input class="sr-only" type="checkbox" [checked]="checked" [disabled]="disabled" />
        <span class="inline-block size-5 translate-x-0.5 rounded-full bg-white shadow-siaf-sm transition" [class.translate-x-5]="checked"></span>
      </span>
      <span class="font-medium">{{ label }}</span>
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwitchComponent {
  @Input() label = '';
  @Input() checked = false;
  @Input() disabled = false;
}
