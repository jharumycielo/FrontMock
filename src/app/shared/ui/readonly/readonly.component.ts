import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'siaf-readonly',
  standalone: true,
  template: `
    <div class="grid gap-1 rounded-siaf-md border border-border bg-surface-muted px-3 py-2">
      <span class="text-xs font-semibold uppercase text-text-muted">{{ label }}</span>
      <span class="text-sm font-medium text-text">{{ value }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReadonlyComponent {
  @Input() label = '';
  @Input() value = '';
}
