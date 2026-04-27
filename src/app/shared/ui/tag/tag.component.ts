import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { IconComponent } from '../icon/icon.component';

type TagTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

@Component({
  selector: 'siaf-tag',
  standalone: true,
  imports: [IconComponent, NgClass],
  template: `
    <span class="inline-flex h-8 items-center gap-2 rounded-siaf-md border px-3 text-sm font-medium" [ngClass]="toneClass">
      @if (icon) {
        <siaf-icon [name]="icon" [size]="16" />
      }
      <ng-content />
      @if (removable) {
        <button class="-mr-1 rounded p-0.5 hover:bg-black/5" type="button" (click)="removed.emit()">
          <siaf-icon name="close" [size]="16" label="Quitar" [decorative]="false" />
        </button>
      }
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagComponent {
  @Input() tone: TagTone = 'neutral';
  @Input() icon = '';
  @Input() removable = false;
  @Output() removed = new EventEmitter<void>();

  get toneClass(): string {
    const classes: Record<TagTone, string> = {
      neutral: 'border-border bg-surface text-text',
      info: 'border-brand-primary/20 bg-brand-primary/10 text-brand-primary',
      success: 'border-[#12a150]/20 bg-[#12a150]/10 text-[#0b7a3b]',
      warning: 'border-accent/20 bg-[#fff5ef] text-accent',
      danger: 'border-[#d92d20]/20 bg-[#d92d20]/10 text-[#b42318]'
    };

    return classes[this.tone];
  }
}
