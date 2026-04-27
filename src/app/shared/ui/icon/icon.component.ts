import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

type IconVariant = 'filled' | 'outlined' | 'round' | 'sharp' | 'two-tone';

@Component({
  selector: 'siaf-icon',
  standalone: true,
  template: `
    <span
      class="notranslate inline-block select-none align-middle leading-none"
      [class]="iconClass"
      [style.fontSize.px]="size"
      [style.width.px]="size"
      [style.height.px]="size"
      [attr.aria-hidden]="decorative"
      [attr.aria-label]="decorative ? null : label"
    >
      {{ resolvedName }}
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconComponent {
  @Input({ required: true }) name = '';
  @Input() size = 20;
  @Input() variant: IconVariant = 'outlined';
  @Input() label = '';
  @Input() decorative = true;

  get iconClass(): string {
    const classes: Record<IconVariant, string> = {
      filled: 'material-icons',
      outlined: 'material-icons-outlined',
      round: 'material-icons-round',
      sharp: 'material-icons-sharp',
      'two-tone': 'material-icons-two-tone'
    };

    return `${classes[this.variant]} notranslate inline-block select-none align-middle leading-none`;
  }

  get resolvedName(): string {
    const aliases: Record<string, string> = {
      right_panel_open: 'view_sidebar',
      dock_to_right: 'view_sidebar',
      left_panel_open: 'view_sidebar',
      picture_in_picture: 'picture_in_picture_alt',
      task_alt: 'check_circle'
    };

    return aliases[this.name] || this.name;
  }
}
