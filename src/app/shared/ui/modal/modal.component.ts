import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { DOCUMENT } from "@angular/common";

import { ButtonComponent } from "../button/button.component";
import { IconComponent } from "../icon/icon.component";

export type ModalVariant =
  | "custom"
  | "delete-request"
  | "delete-record"
  | "review"
  | "undo-changes"
  | "save"
  | "verify"
  | "verify-multiple"
  | "validate"
  | "approve"
  | "approve-multiple"
  | "cancel"
  | "settings"
  | "observe"
  | "reject";

interface ModalPreset {
  title: string;
  description: string;
  icon: string;
  illustration: string;
  confirmLabel: string;
  requiresReason?: boolean;
  confirmDisabled?: boolean;
}

const MODAL_PRESETS: Record<Exclude<ModalVariant, "custom">, ModalPreset> = {
  "delete-request": {
    title: "¿Eliminar solicitud?",
    description: "La solicitud será eliminada.",
    icon: "delete",
    illustration: "assets/figma/modals/delete.svg",
    confirmLabel: "Aceptar",
  },
  "delete-record": {
    title: "¿Borrar registro?",
    description: "Perderá todos los datos ingresados.",
    icon: "delete_forever",
    illustration: "assets/figma/modals/delete.svg",
    confirmLabel: "Aceptar",
  },
  review: {
    title: "¿Revisar solicitud?",
    description: "La solicitud será revisada.",
    icon: "fact_check",
    illustration: "assets/figma/modals/review.svg",
    confirmLabel: "Aceptar",
  },
  "undo-changes": {
    title: "¿Quieres deshacer los cambios?",
    description: "Esta acción no se puede revertir.",
    icon: "undo",
    illustration: "assets/figma/modals/undo.svg",
    confirmLabel: "Aceptar",
  },
  save: {
    title: "¿Grabar solicitud?",
    description: "Los registros se grabarán en esta solicitud.",
    icon: "save",
    illustration: "assets/figma/modals/save_1.svg",
    confirmLabel: "Aceptar",
  },
  verify: {
    title: "¿Verificar solicitud?",
    description: "La solicitud será verificada.",
    icon: "verified",
    illustration: "assets/figma/modals/verify.svg",
    confirmLabel: "Aceptar",
  },
  "verify-multiple": {
    title: "¿Verificar múltiples solicitudes?",
    description: "Las solicitudes serán verificadas.",
    icon: "domain_verification",
    illustration: "assets/figma/modals/verify.svg",
    confirmLabel: "Aceptar",
  },
  validate: {
    title: "¿Validar solicitud?",
    description: "La solicitud será validada.",
    icon: "task_alt",
    illustration: "assets/figma/modals/validate.svg",
    confirmLabel: "Aceptar",
  },
  approve: {
    title: "¿Aprobar solicitud?",
    description: "La solicitud será aprobada.",
    icon: "approval",
    illustration: "assets/figma/modals/approve.svg",
    confirmLabel: "Aceptar",
  },
  "approve-multiple": {
    title: "¿Aprobar múltiples solicitudes?",
    description: "Las solicitudes serán aprobadas.",
    icon: "done_all",
    illustration: "assets/figma/modals/approve.svg",
    confirmLabel: "Aceptar",
  },
  cancel: {
    title: "¿Cancelar solicitud?",
    description: "Se perderán los registros de solicitud.",
    icon: "cancel",
    illustration: "assets/figma/modals/cancel.svg",
    confirmLabel: "Aceptar",
  },
  settings: {
    title: "Modal Header",
    description: "This will restore all system settings to factory defaults.",
    icon: "settings",
    illustration: "assets/figma/modals/settings.svg",
    confirmLabel: "Aceptar",
  },
  observe: {
    title: "¿Observar solicitud?",
    description: "La solicitud será observada.",
    icon: "visibility",
    illustration: "assets/figma/modals/observe.svg",
    confirmLabel: "Aceptar",
    requiresReason: true,
    confirmDisabled: true,
  },
  reject: {
    title: "¿Rechazar solicitud?",
    description: "La solicitud será rechazada.",
    icon: "block",
    illustration: "assets/figma/modals/reject.svg",
    confirmLabel: "Aceptar",
    requiresReason: true,
    confirmDisabled: true,
  },
};

@Component({
  selector: "siaf-modal",
  standalone: true,
  imports: [ButtonComponent, IconComponent],
  template: `
    @if (open) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-siaf-md"
        role="presentation"
      >
        <section
          #dialog
          class="relative flex max-h-[calc(100vh-32px)] w-full max-w-[500px] flex-col gap-siaf-lg overflow-y-auto rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-highest)] px-siaf-lg pb-siaf-lg pt-12 shadow-siaf-lg"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          [attr.aria-labelledby]="titleId"
          [attr.aria-describedby]="resolvedDescription ? descriptionId : null"
          (keydown)="onDialogKeydown($event)"
        >
          @if (showClose) {
            <button
              class="absolute right-siaf-lg top-siaf-lg grid size-6 place-items-center rounded-siaf-sm text-[var(--sys-color-text-neutral-medium)] hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              type="button"
              (click)="handleCancel()"
            >
              <siaf-icon
                name="close"
                [size]="20"
                label="Cerrar"
                [decorative]="false"
              />
            </button>
          }

          @if (showIllustration) {
            <div class="flex justify-center">
              @if (resolvedIllustrationSrc) {
                <img
                  class="h-32 w-[188px] object-contain"
                  [src]="resolvedIllustrationSrc"
                  alt=""
                />
              } @else {
                <div
                  class="flex size-32 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary"
                >
                  <siaf-icon [name]="resolvedIcon" [size]="64" />
                </div>
              }
            </div>
          }

          <div
            class="flex flex-col items-center gap-siaf-md px-0 text-center sm:px-siaf-lg"
          >
            @if (resolvedTitle) {
              <h2
                [id]="titleId"
                class="w-full text-base font-medium text-[var(--sys-color-text-neutral-high)]"
              >
                {{ resolvedTitle }}
              </h2>
            }

            @if (resolvedDescription) {
              <p
                [id]="descriptionId"
                class="w-full whitespace-pre-line text-sm font-normal tracking-[0.024px] text-[var(--sys-color-text-neutral-medium)]"
              >
                {{ resolvedDescription }}
              </p>
            }
          </div>

          @if (requiresReason) {
            <div class="flex flex-col px-0 sm:px-siaf-lg">
              <label
                class="flex min-h-10 items-center rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface px-siaf-md py-siaf-xs"
              >
                <input
                  class="w-full bg-transparent text-sm text-text outline-none placeholder:text-[var(--sys-color-text-neutral-low)]"
                  [placeholder]="reasonPlaceholder"
                  [disabled]="reasonDisabled"
                />
              </label>
            </div>
          }

          <div class="text-sm text-text-muted">
            <ng-content />
          </div>

          @if (showFooter) {
            <footer
              class="flex flex-row flex-wrap justify-end gap-siaf-xs"
            >
              @if (hasProjectedActions) {
                <ng-content select="[modal-actions]" />
              } @else {
                <siaf-button variant="secondary" (click)="handleCancel()">{{
                  cancelLabel
                }}</siaf-button>
                <siaf-button
                  [variant]="confirmVariant"
                  [disabled]="resolvedConfirmDisabled"
                  (click)="confirmed.emit()"
                >
                  {{ resolvedConfirmLabel }}
                </siaf-button>
              }
            </footer>
          }
        </section>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent implements OnChanges {
  @ViewChild("dialog") private dialog?: ElementRef<HTMLElement>;

  @Input() open = false;
  @Input() variant: ModalVariant = "custom";
  @Input() title = "";
  @Input() description = "";
  @Input() icon = "";
  @Input() illustrationSrc = "";
  @Input() cancelLabel = "Cancelar";
  @Input() confirmLabel = "";
  @Input() confirmDisabled: boolean | null = null;
  @Input() confirmVariant: "primary" | "secondary" | "ghost" | "danger" =
    "danger";
  @Input() reasonPlaceholder = "Motivo";
  @Input() reasonDisabled = false;
  @Input() showClose = true;
  @Input() showFooter = true;
  @Input() showIllustration = false;
  @Input() hasProjectedActions = false;
  @Output() closed = new EventEmitter<void>();
  @Output() canceled = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();

  readonly titleId = `siaf-modal-title-${Math.random().toString(36).slice(2)}`;
  readonly descriptionId = `siaf-modal-description-${Math.random().toString(36).slice(2)}`;
  private previouslyFocusedElement: HTMLElement | null = null;

  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes["open"]) {
      return;
    }

    if (this.open) {
      this.previouslyFocusedElement =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      setTimeout(() => this.focusInitialElement());
    } else {
      this.restoreFocus();
    }
  }

  get preset(): ModalPreset | null {
    return this.variant === "custom" ? null : MODAL_PRESETS[this.variant];
  }

  get resolvedTitle(): string {
    return this.title || this.preset?.title || "Detalle";
  }

  get resolvedDescription(): string {
    return this.description || this.preset?.description || "";
  }

  get resolvedIcon(): string {
    return this.icon || this.preset?.icon || "info";
  }

  get resolvedIllustrationSrc(): string {
    const illustration = this.illustrationSrc || this.preset?.illustration || "";
    return this.resolveThemeIllustration(illustration);
  }

  get resolvedConfirmLabel(): string {
    return this.confirmLabel || this.preset?.confirmLabel || "Aceptar";
  }

  get requiresReason(): boolean {
    return !!this.preset?.requiresReason;
  }

  get resolvedConfirmDisabled(): boolean {
    return this.confirmDisabled ?? !!this.preset?.confirmDisabled;
  }

  handleCancel(): void {
    this.canceled.emit();
    this.closed.emit();
    this.restoreFocus();
  }

  onDialogKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      event.preventDefault();
      this.handleCancel();
      return;
    }

    if (event.key === "Tab") {
      this.trapFocus(event);
    }
  }

  private focusInitialElement(): void {
    const dialog = this.dialog?.nativeElement;
    if (!dialog) {
      return;
    }

    const focusable = this.getFocusableElements(dialog);
    (focusable[0] ?? dialog).focus();
  }

  private trapFocus(event: KeyboardEvent): void {
    const dialog = this.dialog?.nativeElement;
    if (!dialog) {
      return;
    }

    const focusable = this.getFocusableElements(dialog);
    if (focusable.length === 0) {
      event.preventDefault();
      dialog.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private getFocusableElements(root: HTMLElement): HTMLElement[] {
    const selector = [
      "a[href]",
      "button:not([disabled])",
      "textarea:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
    ].join(",");

    return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
      (element) => !element.hasAttribute("disabled"),
    );
  }

  private restoreFocus(): void {
    this.previouslyFocusedElement?.focus();
    this.previouslyFocusedElement = null;
  }

  private resolveThemeIllustration(src: string): string {
    if (!src || !this.isDarkTheme()) {
      return src;
    }

    return src.startsWith("assets/figma/modals/")
      ? src.replace("assets/figma/modals/", "assets/figma/modals-dark/")
      : src;
  }

  private isDarkTheme(): boolean {
    return this.document.documentElement.getAttribute("data-theme") === "dark";
  }
}
