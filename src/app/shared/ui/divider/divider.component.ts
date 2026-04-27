import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'siaf-divider',
  standalone: true,
  template: `
    <div
      class="bg-border"
      [class.h-px]="orientation === 'horizontal'"
      [class.w-full]="orientation === 'horizontal'"
      [class.w-px]="orientation === 'vertical'"
      [class.self-stretch]="orientation === 'vertical'"
      role="separator"
      [attr.aria-orientation]="orientation"
    ></div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DividerComponent {
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
}
