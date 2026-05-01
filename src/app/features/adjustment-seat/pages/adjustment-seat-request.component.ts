import { ChangeDetectionStrategy, Component, forwardRef, Input } from '@angular/core';
import { Router } from '@angular/router';

import { BreadcrumbComponent, BreadcrumbItem } from '../../shared/components/breadcrumb/breadcrumb.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { CreateDocumentComponent } from '../../shared/ui/create-document/create-document.component';
import { DateTimePickerComponent } from '../../shared/ui/date-time-picker/date-time-picker.component';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { ProcessMenuNode, ProcessMenuTreeComponent } from '../../shared/ui/process-menu-tree/process-menu-tree.component';
import { SidebarComponent, SidebarNavigation } from '../../layout/sidebar/sidebar.component';
import { SolicitudeHeaderComponent } from '../../shared/ui/solicitude-header/solicitude-header.component';

type ReadonlyField = {
  label: string;
  value: string;
};

@Component({
  selector: 'siaf-adjustment-seat-request',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    CreateDocumentComponent,
    DateTimePickerComponent,
    forwardRef(() => EmptySectionComponent),
    IconComponent,
    forwardRef(() => MessageBoxComponent),
    NavbarComponent,
    ProcessMenuTreeComponent,
    SidebarComponent,
    SolicitudeHeaderComponent,
    forwardRef(() => TextAreaControlComponent)
  ],
  template: `
    <main class="min-h-screen bg-[var(--sys-color-bg-surfaces-surface-lowest)] text-text">
      <siaf-navbar class="sticky top-0 z-30 block" userName="Juan Doe Perez Perez" officeName="ENTIDAD ESTADO" />

      <aside class="fixed bottom-0 left-0 top-14 z-20 hidden lg:block">
        <siaf-sidebar
          [navigation]="activeNavigation"
          [buttonHelp]="true"
          (created)="openSidebarCreateDocument()"
          (navigationChanged)="onSidebarNavigationChange($event)"
        />
      </aside>

      @if (hasFloatingPanel) {
        <div class="fixed inset-0 top-14 z-10 bg-transparent" aria-hidden="true" (click)="closeFloatingPanels()"></div>
      }

      @if (processMenuOpen) {
        <div class="fixed bottom-0 left-0 top-14 z-20 lg:left-16" (click)="$event.stopPropagation()">
          <siaf-process-menu-tree (nodeSelected)="onProcessNodeSelected($event)" />
        </div>
      }

      @if (sidebarCreateDocumentOpen) {
        <div class="fixed bottom-0 left-0 top-14 z-20 lg:left-16" (click)="$event.stopPropagation()">
          <siaf-create-document (accepted)="goToRequest()" (canceled)="closeFloatingPanels()" />
        </div>
      }

      <section class="min-w-0 lg:pl-16">
        <section class="border-b border-[var(--sys-color-divider-default)] bg-surface">
          <siaf-breadcrumb class="block" [items]="breadcrumbs" />
          <siaf-solicitude-header
            type="actions"
            heading="Solicitud de registro de asiento de ajuste"
            secondaryText="Creación"
            tagLabel="Nuevo"
            [showReturn]="true"
            [saveDisabled]="true"
            [verifyDisabled]="true"
            (returned)="goToDocuments()"
            (canceled)="goToDocuments()"
          />
        </section>

        <section class="flex flex-col gap-siaf-md p-siaf-md sm:p-siaf-lg">
          <section class="rounded-siaf-md bg-surface px-siaf-lg py-siaf-md">
            <div class="grid gap-siaf-xs">
              @for (field of entityFields; track field.label) {
                <div class="grid min-h-6 gap-siaf-xs md:grid-cols-[140px_1fr]">
                  <span class="truncate text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">{{ field.label }}</span>
                  <strong class="min-w-0 text-sm font-bold leading-6 text-text">{{ field.value }}</strong>
                </div>
              }
            </div>
          </section>

          <section class="rounded-siaf-md bg-surface">
            <header class="flex min-h-14 items-center px-siaf-lg pt-siaf-md">
              <h2 class="m-0 text-base font-bold uppercase tracking-[0.02px] text-text">Registro de asiento de ajuste</h2>
            </header>

            <div class="flex flex-col gap-siaf-lg px-siaf-lg py-siaf-md">
              <section class="grid gap-siaf-lg">
                <h3 class="m-0 text-sm font-bold uppercase text-text">Ambito institucional</h3>
                <article class="relative rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface px-siaf-xl py-siaf-xs">
                  <span class="absolute left-[-1px] top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-siaf-sm bg-brand-primary"></span>
                  <div class="flex min-h-11 flex-col justify-center gap-siaf-xxs">
                    <span class="text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">Ambito institucional</span>
                    <strong class="text-sm font-bold">ID - Nombre del ambito</strong>
                  </div>
                </article>
              </section>

              <empty-section title="Periodo" actionIcon="search" />
              <section class="grid gap-siaf-md">
                <h3 class="m-0 text-sm font-bold uppercase text-text">Fecha de contabilización</h3>
                <siaf-date-time-picker placeholder="Fecha*" variant="date" />
              </section>
              <empty-section title="Buscar codigo de clase de ajuste" actionIcon="search" />
              <empty-section title="Buscar codigo de detalle de ajuste" actionIcon="search" />
              <text-area-control title="Glosa" placeholder="Glosa*" />

              <details class="group overflow-hidden rounded-siaf-sm border border-[var(--sys-color-divider-strong)] bg-surface" open>
                <summary class="flex min-h-14 w-full cursor-pointer list-none items-center gap-siaf-xs px-siaf-md py-siaf-xs text-left">
                  <span class="inline-flex size-10 shrink-0 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted">
                    <siaf-icon class="transition group-open:rotate-180" name="expand_more" [size]="24" />
                  </span>
                  <span class="flex min-h-10 min-w-0 flex-1 items-center text-sm font-medium uppercase text-text">Codigo de asiento: --</span>
                </summary>

                <div class="flex flex-col gap-siaf-md border-t border-[var(--sys-color-divider-strong)] p-siaf-lg">
                  <h3 class="m-0 min-h-10 text-sm font-bold uppercase leading-10 text-text">Cuentas contables</h3>
                  <message-box text="No se ha seleccionado ningún tipo. Haga clic en el botón para realizar una selección." />
                </div>
              </details>
            </div>
          </section>

          <section class="rounded-siaf-md bg-surface">
            <header class="flex min-h-14 items-center px-siaf-lg pt-siaf-md">
              <h2 class="m-0 text-base font-bold uppercase tracking-[0.02px] text-text">Justificación del sustento</h2>
            </header>

            <div class="flex flex-col gap-siaf-lg px-siaf-lg py-siaf-md">
              <text-area-control title="" placeholder="Justificación del requerimiento solicitado*" />

              <div class="flex flex-col gap-siaf-xs">
                <div class="flex min-h-10 items-center justify-between gap-siaf-md">
                  <h3 class="m-0 text-sm font-bold uppercase text-text">Documento de sustento</h3>
                  <button class="inline-flex size-10 items-center justify-center rounded-siaf-md bg-[var(--sys-color-bg-brand-accent)] text-white transition hover:bg-[var(--sys-color-bg-brand-accent)]" type="button" aria-label="Subir documento">
                    <siaf-icon name="upload_file" [size]="24" />
                  </button>
                </div>
                <message-box text="No se han adjuntado archivos. Por favor, haga clic en el botón para subir un archivo." />
              </div>
            </div>
          </section>
        </section>
      </section>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdjustmentSeatRequestComponent {
  activeNavigation: SidebarNavigation = 'Proceso';
  processMenuOpen = false;
  sidebarCreateDocumentOpen = false;

  constructor(private readonly router: Router) {}

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Inicio', href: '/panel' },
    { label: 'Nivel 0', href: '#' },
    { label: 'Nivel 1', href: '#' },
    { label: 'Nivel 2' }
  ];

  readonly entityFields: ReadonlyField[] = [
    { label: 'Fecha', value: '19/08/2025     08:00:59' },
    { label: 'Ente rector', value: 'DIRECCIÓN GENERAL DE CONTABILIDAD PÚBLICA' },
    { label: 'Entidad/ U.E/ ...', value: 'NOMBRE DE LA ENTIDAD/ U.E/ ...' }
  ];

  openSidebarCreateDocument(): void {
    this.processMenuOpen = false;
    this.sidebarCreateDocumentOpen = true;
  }

  onSidebarNavigationChange(navigation: SidebarNavigation): void {
    if (navigation === 'Panel') {
      this.activeNavigation = 'Panel';
      this.closeFloatingPanels();
      void this.router.navigate(['/panel']);
      return;
    }

    this.activeNavigation = navigation;
    this.sidebarCreateDocumentOpen = false;
    this.processMenuOpen = navigation === 'Proceso';
  }

  onProcessNodeSelected(node: ProcessMenuNode): void {
    if (node.id === 'registro-asiento-ajuste') {
      this.closeFloatingPanels();
      void this.router.navigate(['/procesos/registro-asiento-ajuste']);
      return;
    }

    if (node.id === 'plan-cuentas-contables') {
      this.closeFloatingPanels();
      void this.router.navigate(['/procesos/plan-cuentas-contables']);
      return;
    }

    if (!node.children?.length) {
      this.activeNavigation = 'Proceso';
    }
  }

  closeFloatingPanels(): void {
    this.processMenuOpen = false;
    this.sidebarCreateDocumentOpen = false;
  }

  goToDocuments(): void {
    void this.router.navigate(['/procesos/registro-asiento-ajuste']);
  }

  goToRequest(): void {
    this.closeFloatingPanels();
    void this.router.navigate(['/procesos/registro-asiento-ajuste/solicitud']);
  }

  get hasFloatingPanel(): boolean {
    return this.processMenuOpen || this.sidebarCreateDocumentOpen;
  }
}

@Component({
  selector: 'message-box',
  standalone: true,
  template: `
    <div class="flex min-h-[49px] items-center rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-low)] px-siaf-md py-siaf-sm">
      <p class="m-0 text-sm leading-normal tracking-[0.0249px] text-[var(--sys-color-text-neutral-medium)]">{{ text }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageBoxComponent {
  @Input()
  text = '';
}

@Component({
  selector: 'empty-section',
  standalone: true,
  imports: [ButtonComponent, MessageBoxComponent],
  template: `
    <section class="grid gap-siaf-md">
      <div class="flex min-h-10 items-center justify-between gap-siaf-md">
        <h3 class="m-0 text-sm font-bold uppercase text-text">{{ title }}</h3>
        <siaf-button variant="accent" size="md" [icon]="actionIcon" [ariaLabel]="title" [iconOnly]="true" />
      </div>
      <message-box text="No se ha seleccionado ningún tipo. Haga clic en el botón para realizar una selección." />
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptySectionComponent {
  @Input()
  title = '';
  @Input()
  actionIcon = 'search';
}

@Component({
  selector: 'text-area-control',
  standalone: true,
  template: `
    <section class="grid gap-siaf-md">
      @if (title) {
        <h3 class="m-0 text-sm font-bold uppercase text-text">{{ title }}</h3>
      }
      <label class="flex min-h-[60px] items-start rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface px-siaf-md py-siaf-xs">
        <textarea class="min-h-11 flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-text-muted" maxlength="500" [placeholder]="placeholder"></textarea>
      </label>
      <span class="-mt-siaf-md text-right text-xs text-text-muted">0/500</span>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextAreaControlComponent {
  @Input()
  title = '';
  @Input()
  placeholder = '';
}
