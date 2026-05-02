import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { BreadcrumbComponent, BreadcrumbItem } from '../../components/breadcrumb/breadcrumb.component';
import { SolicitudeHeaderComponent, SolicitudeHeaderRole, SolicitudeHeaderState } from '../solicitude-header/solicitude-header.component';

@Component({
  selector: 'siaf-solicitude-page-layout',
  standalone: true,
  imports: [BreadcrumbComponent, SolicitudeHeaderComponent],
  template: `
    <section
      class="min-w-0"
      [class.lg:pl-[364px]]="trayMenuOpen"
      [class.lg:pl-[434px]]="floatingPanelOpen"
    >
      <section class="border-b border-[var(--sys-color-divider-default)] bg-surface">
        <siaf-breadcrumb class="block" [items]="breadcrumbs" />
        <siaf-solicitude-header
          [role]="role"
          [state]="state"
          [heading]="heading"
          [secondaryText]="secondaryText"
          [showReturn]="showReturn"
          [saveDisabled]="saveDisabled"
          [verifyDisabled]="verifyDisabled"
          (returned)="returned.emit()"
          (canceled)="canceled.emit()"
          (saved)="saved.emit()"
          (edited)="edited.emit()"
          (verified)="verified.emit()"
          (deleted)="deleted.emit()"
        />
      </section>

      <section class="flex flex-col gap-siaf-md p-siaf-md">
        <ng-content />
      </section>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SolicitudePageLayoutComponent {
  @Input() breadcrumbs: BreadcrumbItem[] = [];
  @Input() role: SolicitudeHeaderRole = 'creator';
  @Input() state: SolicitudeHeaderState = 'new';
  @Input() heading = '';
  @Input() secondaryText = '';
  @Input() showReturn = true;
  @Input() saveDisabled = false;
  @Input() verifyDisabled = false;
  @Input() trayMenuOpen = false;
  @Input() floatingPanelOpen = false;

  @Output() returned = new EventEmitter<void>();
  @Output() canceled = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();
  @Output() edited = new EventEmitter<void>();
  @Output() verified = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();
}
