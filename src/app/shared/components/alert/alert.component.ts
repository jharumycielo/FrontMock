import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { IconComponent } from '../icon/icon.component';

export type AlertTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'error';

@Component({
  selector: 'siaf-alert',
  standalone: true,
  imports: [IconComponent, NgClass],
  template: `
    <section
      class="flex min-h-16 w-full min-w-0 max-w-[800px] items-center gap-siaf-xs rounded-siaf-md bg-[rgb(32_32_32/0.92)] p-siaf-md text-sm font-normal leading-normal tracking-[0.025px] text-white shadow-siaf-elevation-2 sm:min-w-[430px] sm:w-[430px]"
      role="alert"
    >
      <div class="flex min-w-0 flex-1 items-center gap-siaf-xs">
        @if (tone !== 'neutral') {
          <siaf-icon class="shrink-0" [ngClass]="iconClass" [name]="iconName" [size]="24" />
        }

        <div class="min-w-0 flex-1">
          @if (title) {
            <span class="font-bold">{{ title }} </span>
          }
          <ng-content />
        </div>
      </div>

      @if (showActions) {
        <button
          class="inline-flex h-8 shrink-0 items-center justify-center rounded-siaf-md px-siaf-md text-sm font-medium text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          type="button"
          (click)="action.emit()"
        >
          {{ actionLabel }}
        </button>
      }

      @if (showClose) {
        <button
          class="-mr-1 inline-flex size-8 shrink-0 items-center justify-center rounded-siaf-sm text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          type="button"
          aria-label="Cerrar alerta"
          (click)="closed.emit()"
        >
          <siaf-icon name="close" [size]="24" />
        </button>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertComponent {
  @Input() tone: AlertTone = 'neutral';
  @Input() title = '';
  @Input() showActions = false;
  @Input() showClose = true;
  @Input() actionLabel = 'Button';

  @Output() closed = new EventEmitter<void>();
  @Output() action = new EventEmitter<void>();

  get iconClass(): string {
    const classes: Record<Exclude<AlertTone, 'neutral'>, string> = {
      info: 'text-[var(--sys-color-icon-feedback-dark-info)]',
      success: 'text-[var(--sys-color-icon-feedback-dark-success)]',
      warning: 'text-[var(--sys-color-icon-feedback-dark-warning)]',
      danger: 'text-[var(--sys-color-icon-feedback-dark-danger)]',
      error: 'text-[var(--sys-color-icon-feedback-dark-danger)]'
    };

    return this.tone === 'neutral' ? '' : classes[this.tone];
  }

  get iconName(): string {
    const icons: Record<Exclude<AlertTone, 'neutral'>, string> = {
      info: 'info',
      success: 'check_circle',
      warning: 'warning',
      danger: 'error',
      error: 'error'
    };

    return this.tone === 'neutral' ? '' : icons[this.tone];
  }
}
