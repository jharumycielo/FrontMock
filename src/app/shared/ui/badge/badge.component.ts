import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type BadgeTone = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

@Component({
  selector: 'siaf-badge',
  standalone: true,
  imports: [NgClass],
  template: `
    <span
      class="inline-flex h-7 items-center gap-2 rounded-full px-3 text-xs font-semibold uppercase"
      [ngClass]="toneClass"
    >
      <span class="size-2 rounded-full bg-current" aria-hidden="true"></span>
      <ng-content />
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BadgeComponent {
  @Input() tone: BadgeTone = 'neutral';

  get toneClass(): string {
    const classes: Record<BadgeTone, string> = {
      info: 'bg-brand-primary/10 text-brand-primary',
      success: 'bg-[var(--sys-color-bg-feedback-light-success)] text-[var(--sys-color-text-feedback-success)]',
      warning: 'bg-[var(--sys-color-bg-feedback-light-warning)] text-accent',
      danger: 'bg-[var(--sys-color-bg-feedback-light-danger)] text-[var(--sys-color-text-feedback-danger)]',
      neutral: 'bg-surface-muted text-text-muted'
    };

    return classes[this.tone];
  }
}
