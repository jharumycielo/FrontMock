import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { IconComponent } from '../icon/icon.component';

export interface TimelineItem {
  title: string;
  description?: string;
  time?: string;
  icon?: string;
  status?: 'done' | 'current' | 'pending' | 'error';
}

@Component({
  selector: 'siaf-timeline',
  standalone: true,
  imports: [IconComponent, NgClass],
  template: `
    <ol class="grid gap-0">
      @for (item of items; track item.title; let last = $last) {
        <li class="grid grid-cols-[32px_1fr] gap-3">
          <div class="grid justify-items-center">
            <span class="flex size-8 items-center justify-center rounded-full border bg-surface" [ngClass]="markerClass(item.status)">
              <siaf-icon [name]="item.icon || defaultIcon(item.status)" [size]="18" />
            </span>
            @if (!last) {
              <span class="h-full w-px bg-border"></span>
            }
          </div>
          <div class="pb-5">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <p class="text-sm font-semibold text-text">{{ item.title }}</p>
              @if (item.time) {
                <span class="text-xs text-text-muted">{{ item.time }}</span>
              }
            </div>
            @if (item.description) {
              <p class="mt-1 text-sm text-text-muted">{{ item.description }}</p>
            }
          </div>
        </li>
      }
    </ol>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineComponent {
  @Input() items: TimelineItem[] = [];

  markerClass(status: TimelineItem['status'] = 'pending'): string {
    const classes: Record<NonNullable<TimelineItem['status']>, string> = {
      done: 'border-[var(--sys-color-border-feedback-success)] text-[var(--sys-color-text-feedback-success)]',
      current: 'border-brand-primary/20 text-brand-primary',
      pending: 'border-border text-text-muted',
      error: 'border-[var(--sys-color-border-feedback-danger)] text-[var(--sys-color-text-feedback-danger)]'
    };

    return classes[status];
  }

  defaultIcon(status: TimelineItem['status'] = 'pending'): string {
    const icons: Record<NonNullable<TimelineItem['status']>, string> = {
      done: 'check_circle',
      current: 'pending',
      pending: 'radio_button_unchecked',
      error: 'error'
    };

    return icons[status];
  }
}
