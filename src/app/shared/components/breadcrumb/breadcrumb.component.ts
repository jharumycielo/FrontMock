import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { IconComponent } from '../../ui/icon/icon.component';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

@Component({
  selector: 'siaf-breadcrumb',
  standalone: true,
  imports: [IconComponent],
  template: `
    <nav class="flex h-10 w-full items-center bg-surface px-siaf-md py-siaf-xxs" aria-label="Ruta de navegacion">
      <ol class="flex min-w-0 items-center gap-siaf-xxs overflow-hidden text-xs leading-none">
        <li class="flex shrink-0 items-center gap-siaf-xxs">
          <a
            class="inline-flex size-8 items-center justify-center rounded-siaf-md text-text transition hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            [href]="homeHref"
            aria-label="Inicio"
          >
            <siaf-icon name="home" [size]="20" />
          </a>
          @if (items.length > 0) {
            <siaf-icon class="text-text-muted" name="keyboard_arrow_right" [size]="12" />
          }
        </li>

        @for (item of items; track item.label; let last = $last) {
          <li class="flex min-w-0 shrink-0 items-center gap-siaf-xxs">
            @if (item.href && !last) {
              <a class="max-w-[180px] truncate font-medium text-text hover:underline" [href]="item.href">
                {{ item.label }}
              </a>
            } @else {
              <span
                class="max-w-[220px] truncate"
                [class.font-medium]="!last"
                [class.font-normal]="last"
                [class.text-text]="!last"
                [class.text-text-muted]="last"
              >
                {{ item.label }}
              </span>
            }
            @if (!last) {
              <siaf-icon class="text-text-muted" name="keyboard_arrow_right" [size]="12" />
            }
          </li>
        }
      </ol>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];
  @Input() homeHref = '#';
}
