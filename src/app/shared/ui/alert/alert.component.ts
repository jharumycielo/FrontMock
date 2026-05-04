import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { IconComponent } from '../icon/icon.component';

export type AlertTone = 'neutral' | 'info' | 'success' | 'warning' | 'error';

@Component({
  selector: 'siaf-alert',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div
      class="flex w-full min-w-[360px] items-center gap-siaf-xs rounded-siaf-md p-siaf-md"
      [class]="containerClass"
      role="alert"
    >
      <!-- Icon -->
      @if (leadingIcon) {
        <siaf-icon
          class="shrink-0"
          [class]="iconClass"
          [name]="iconName"
          [size]="24"
          variant="filled"
          aria-hidden="true"
        />
      }

      <!-- Content -->
      <div class="flex min-w-0 flex-1 flex-col gap-[4px]" [class]="textClass">
        @if (title) {
          <span class="text-sm font-bold leading-normal tracking-[-0.02px]">{{ title }}</span>
        }
        @if (description) {
          <span class="text-xs font-normal leading-normal">{{ description }}</span>
        }
        <ng-content />
      </div>

      <!-- Close button -->
      @if (showClose) {
        <button
          class="inline-flex size-8 shrink-0 items-center justify-center rounded-siaf-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          [class]="closeButtonClass"
          type="button"
          aria-label="Cerrar alerta"
          (click)="closed.emit()"
        >
          <siaf-icon name="close" [size]="20" />
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertComponent {
  @Input() tone: AlertTone = 'neutral';
  @Input() title = '';
  @Input() description = '';
  @Input() showClose = false;
  @Input() leadingIcon = true;

  @Output() closed = new EventEmitter<void>();

  get iconName(): string {
    const icons: Record<AlertTone, string> = {
      neutral: 'check_circle',
      info: 'info',
      success: 'check_circle',
      warning: 'warning',
      error: 'error'
    };

    return icons[this.tone];
  }

  get containerClass(): string {
    const classes: Record<AlertTone, string> = {
      neutral: 'bg-[var(--sys-color-bg-feedback-light-default)]',
      info: 'bg-[var(--sys-color-bg-feedback-light-info)]',
      success: 'bg-[var(--sys-color-bg-feedback-light-success)]',
      warning: 'bg-[var(--sys-color-bg-feedback-light-warning)]',
      error: 'bg-[var(--sys-color-bg-feedback-light-danger)]'
    };

    return classes[this.tone];
  }

  get iconClass(): string {
    const classes: Record<AlertTone, string> = {
      neutral: 'text-[var(--sys-color-icon-feedback-light-default)]',
      info: 'text-[var(--sys-color-icon-feedback-light-info)]',
      success: 'text-[var(--sys-color-icon-feedback-light-success)]',
      warning: 'text-[var(--sys-color-icon-feedback-light-warning)]',
      error: 'text-[var(--sys-color-icon-feedback-light-danger)]'
    };

    return classes[this.tone];
  }

  get textClass(): string {
    const classes: Record<AlertTone, string> = {
      neutral: 'text-[var(--sys-color-text-feedback-default)]',
      info: 'text-[var(--sys-color-text-feedback-info)]',
      success: 'text-[var(--sys-color-text-feedback-success)]',
      warning: 'text-[var(--sys-color-text-feedback-warning)]',
      error: 'text-[var(--sys-color-text-feedback-danger)]'
    };

    return classes[this.tone];
  }

  get closeButtonClass(): string {
    const classes: Record<AlertTone, string> = {
      neutral: 'text-[var(--sys-color-icon-feedback-light-default)] hover:bg-[rgba(32,32,32,0.08)] focus-visible:outline-[var(--sys-color-text-feedback-default)]',
      info: 'text-[var(--sys-color-icon-feedback-light-info)] hover:bg-[rgba(0,81,136,0.12)] focus-visible:outline-[var(--sys-color-text-feedback-info)]',
      success: 'text-[var(--sys-color-icon-feedback-light-success)] hover:bg-[rgba(32,99,94,0.12)] focus-visible:outline-[var(--sys-color-text-feedback-success)]',
      warning: 'text-[var(--sys-color-icon-feedback-light-warning)] hover:bg-[rgba(135,103,39,0.12)] focus-visible:outline-[var(--sys-color-text-feedback-warning)]',
      error: 'text-[var(--sys-color-icon-feedback-light-danger)] hover:bg-[rgba(130,28,30,0.12)] focus-visible:outline-[var(--sys-color-text-feedback-danger)]'
    };

    return classes[this.tone];
  }
}
