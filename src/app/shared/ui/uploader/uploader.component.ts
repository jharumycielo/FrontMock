import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'siaf-uploader',
  standalone: true,
  imports: [IconComponent],
  template: `
    <label class="grid cursor-pointer place-items-center rounded-siaf-lg border border-dashed border-border bg-surface px-6 py-8 text-center transition hover:border-brand-primary hover:bg-brand-primary/5">
      <input class="sr-only" type="file" [accept]="accept" [multiple]="multiple" [disabled]="disabled" />
      <siaf-icon class="text-brand-primary" name="upload_file" [size]="32" />
      <span class="mt-3 text-sm font-semibold text-text">{{ title }}</span>
      <span class="mt-1 text-sm text-text-muted">{{ description }}</span>
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploaderComponent {
  @Input() title = 'Subir archivo';
  @Input() description = 'Arrastra un archivo o selecciona desde tu equipo';
  @Input() accept = '';
  @Input() multiple = false;
  @Input() disabled = false;
}
