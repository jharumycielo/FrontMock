import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { ButtonComponent } from '../button/button.component';
import { MessageBoxComponent } from '../message-box/message-box.component';

@Component({
  selector: 'empty-section',
  standalone: true,
  imports: [ButtonComponent, MessageBoxComponent],
  template: `
    <section class="grid gap-siaf-md">
      <div class="flex min-h-10 items-center justify-between gap-siaf-md">
        <h3 class="m-0 text-sm font-bold uppercase text-text">{{ title }}</h3>
        <siaf-button
          variant="accent"
          size="md"
          [icon]="actionIcon"
          [ariaLabel]="title"
          [iconOnly]="true"
          [disabled]="disabled"
          (click)="actionClicked.emit()"
        />
      </div>
      <message-box text="No se ha seleccionado ningún tipo. Haga clic en el botón para realizar una selección." />
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptySectionComponent {
  @Input() title = '';
  @Input() actionIcon = 'search';
  @Input() disabled = false;
  @Output() actionClicked = new EventEmitter<void>();
}

