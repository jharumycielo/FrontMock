import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

type BadgeTone = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

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
      success: 'bg-[#12a150]/10 text-[#0b7a3b]',
      warning: 'bg-[#fff5ef] text-accent',
      danger: 'bg-[#d92d20]/10 text-[#b42318]',
      neutral: 'bg-surface-muted text-text-muted'
    };

    return classes[this.tone];
  }
}
