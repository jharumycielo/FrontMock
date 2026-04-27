import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { IconComponent } from '../icon/icon.component';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'siaf-button',
  standalone: true,
  imports: [IconComponent, NgClass],
  template: `
    <button
      class="siaf-button inline-flex items-center justify-center gap-2 rounded-siaf-md border font-medium transition duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-transparent disabled:active:scale-100"
      [type]="type"
      [disabled]="disabled || loading"
      [ngClass]="[variantClass, sizeClass]"
    >
      @if (loading) {
        <span class="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true"></span>
      }
      @if (icon && iconPosition === 'start') {
        <siaf-icon [name]="icon" [size]="18" />
      }
      <ng-content />
      @if (icon && iconPosition === 'end') {
        <siaf-icon [name]="icon" [size]="18" />
      }
    </button>
  `,
  styles: `
    :host {
      display: inline-block;
    }

    :host(.block),
    :host(.w-full) {
      width: 100%;
    }

    :host(.block) button,
    :host(.w-full) button {
      width: 100%;
    }

    .siaf-button:disabled {
      background:
        linear-gradient(var(--sys-color-bg-states-light-disabled), var(--sys-color-bg-states-light-disabled)),
        var(--sys-color-bg-brand-white);
      color: var(--sys-color-text-neutral-disabled);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() icon = '';
  @Input() iconPosition: 'start' | 'end' = 'start';

  get variantClass(): string {
    const classes: Record<ButtonVariant, string> = {
      primary: 'border-[var(--sys-color-bg-brand-accent)] bg-[var(--sys-color-bg-brand-accent)] text-brand-contrast hover:brightness-90 active:brightness-75 focus-visible:outline-[var(--sys-color-bg-brand-accent)]',
      secondary: 'border-[var(--sys-color-border-states-enabled)] bg-[var(--sys-color-bg-states-light-enabled)] text-[var(--sys-color-text-neutral-medium)] hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-dark-pressed)] focus-visible:outline-brand-primary',
      ghost: 'border-transparent bg-transparent text-text hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-dark-pressed)] focus-visible:outline-brand-primary',
      danger: 'border-[var(--sys-color-border-feedback-danger)] bg-[var(--sys-color-bg-feedback-dark-danger)] text-white hover:bg-[var(--sys-color-bg-feedback-dark-danger)] active:bg-[var(--sys-color-bg-feedback-dark-danger)] focus-visible:outline-[var(--sys-color-border-feedback-danger)]',
      accent: 'border-[var(--sys-color-bg-brand-accent)] bg-[var(--sys-color-bg-brand-accent)] text-white hover:bg-[var(--sys-color-bg-brand-accent)] active:bg-[var(--sys-color-bg-brand-accent)] focus-visible:outline-[var(--sys-color-bg-brand-accent)]'
    };

    return classes[this.variant];
  }

  get sizeClass(): string {
    const classes: Record<ButtonSize, string> = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-5 text-base'
    };

    return classes[this.size];
  }
}
