import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';

export type DatePickerVariant = 'date' | 'datetime';
export type DatePickerState = 'enabled' | 'error' | 'success';

type CalendarDay = {
  label: string;
  value: string;
  disabled?: boolean;
};

@Component({
  selector: 'siaf-date-time-picker',
  standalone: true,
  imports: [ButtonComponent, IconComponent],
  template: `
    <label class="grid gap-1.5">
      <span class="relative block w-full max-w-[300px]">
        @if (floatingLabel) {
          <span class="absolute -top-2.5 left-3 z-[1] rounded-siaf-sm bg-surface px-siaf-xxs text-xs font-medium leading-normal" [class]="labelClass">
            {{ labelText }}
          </span>
        }

        <button
          class="flex h-10 w-full items-center rounded-siaf-md border bg-surface px-siaf-md text-left text-sm text-text outline-none transition disabled:cursor-not-allowed disabled:border-[var(--sys-color-border-states-disabled)] disabled:bg-[var(--sys-color-bg-surfaces-disabled)] disabled:text-[var(--sys-color-text-neutral-disabled)]"
          type="button"
          [class]="controlClass"
          [disabled]="disabled"
          [attr.aria-expanded]="pickerOpen"
          aria-haspopup="dialog"
          (click)="togglePicker()"
        >
          <span class="min-w-0 flex-1 truncate" [class.text-[var(--sys-color-text-neutral-low)]]="!hasValue">
            {{ displayValue || labelText }}
          </span>
          <siaf-icon class="shrink-0 text-text-muted" name="calendar_today" [size]="20" />
        </button>

        @if (pickerOpen) {
          <button class="fixed inset-0 z-30 cursor-default bg-transparent" type="button" aria-label="Cerrar calendario" (click)="closePicker()"></button>
          <section
            class="absolute left-0 top-[calc(100%+4px)] z-40 w-[268px] rounded-siaf-md bg-surface p-siaf-xs shadow-siaf-elevation-2"
            role="dialog"
            aria-label="Seleccionar fecha"
            (click)="$event.stopPropagation()"
          >
            <header class="flex w-full items-center justify-between py-siaf-xs">
              <div class="flex items-center gap-siaf-xxs">
                <button class="inline-flex size-5 items-center justify-center rounded-siaf-sm hover:bg-surface-muted" type="button" aria-label="Año anterior" (click)="moveYear(-1, $event)">
                  <siaf-icon name="keyboard_double_arrow_left" [size]="20" />
                </button>
                <button class="inline-flex size-5 items-center justify-center rounded-siaf-sm hover:bg-surface-muted" type="button" aria-label="Mes anterior" (click)="moveMonth(-1, $event)">
                  <siaf-icon name="keyboard_arrow_left" [size]="20" />
                </button>
              </div>

              <strong class="flex items-center gap-siaf-xs text-sm font-bold tracking-[-0.02px] text-[var(--sys-color-text-neutral-medium)]">
                <span>{{ monthName }}</span>
                <span>{{ viewYear }}</span>
              </strong>

              <div class="flex items-center gap-siaf-xxs">
                <button class="inline-flex size-5 items-center justify-center rounded-siaf-sm hover:bg-surface-muted" type="button" aria-label="Mes siguiente" (click)="moveMonth(1, $event)">
                  <siaf-icon name="keyboard_arrow_right" [size]="20" />
                </button>
                <button class="inline-flex size-5 items-center justify-center rounded-siaf-sm hover:bg-surface-muted" type="button" aria-label="Año siguiente" (click)="moveYear(1, $event)">
                  <siaf-icon name="keyboard_double_arrow_right" [size]="20" />
                </button>
              </div>
            </header>

            <div class="grid grid-cols-7">
              @for (weekday of weekdays; track weekday) {
                <span class="flex h-7 items-center justify-center text-sm font-bold tracking-[-0.02px] text-[var(--sys-color-text-neutral-medium)]">{{ weekday }}</span>
              }
            </div>

            <div class="grid grid-cols-7">
              @for (day of days; track day.value) {
                <button
                  class="flex size-9 items-center justify-center rounded-full px-siaf-xs py-siaf-xxs text-sm tracking-[0.0249px] transition hover:border hover:border-[var(--sys-color-border-states-hover)] disabled:cursor-not-allowed disabled:text-[var(--sys-color-text-neutral-disabled)]"
                  type="button"
                  [disabled]="day.disabled"
                  [class.bg-brand-primary]="day.value === selectedDate"
                  [class.text-white]="day.value === selectedDate"
                  [class.text-[var(--sys-color-text-neutral-medium)]]="day.value !== selectedDate && !day.disabled"
                  [class.border]="day.value === todayDate"
                  [class.border-[var(--sys-color-border-states-hover)]]="day.value === todayDate"
                  (click)="selectDate(day.value, $event)"
                >
                  {{ day.label }}
                </button>
              }
            </div>

            @if (variant === 'datetime') {
              <div class="mt-siaf-xs border-t border-[var(--sys-color-divider-default)] pt-siaf-xs">
                <div class="flex items-center gap-siaf-xs py-siaf-xs">
                  <span class="text-xs font-medium text-text">Hora</span>
                  <input class="h-8 w-[50px] rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface px-siaf-md text-center text-sm outline-none focus:border-2 focus:border-[var(--sys-color-border-states-focus)]" maxlength="2" value="00" />
                  <span class="text-xs font-medium text-text">:</span>
                  <input class="h-8 w-[50px] rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface px-siaf-md text-center text-sm outline-none focus:border-2 focus:border-[var(--sys-color-border-states-focus)]" maxlength="2" value="00" />
                  <span class="text-xs font-medium text-text">:</span>
                  <input class="h-8 w-[50px] rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface px-siaf-md text-center text-sm outline-none focus:border-2 focus:border-[var(--sys-color-border-states-focus)]" maxlength="2" value="00" />
                </div>

                <div class="flex justify-end gap-siaf-xs py-siaf-xs">
                  <siaf-button variant="secondary" size="sm" (click)="closePicker($event)">Cancelar</siaf-button>
                  <siaf-button variant="accent" size="sm" (click)="acceptDate($event)">Aceptar</siaf-button>
                </div>
              </div>
            }
          </section>
        }
      </span>

      @if (hint && !error) {
        <span class="text-xs" [class]="supportingClass">{{ hint }}</span>
      }

      @if (error) {
        <span class="text-xs text-[var(--sys-color-text-feedback-danger)]">{{ error }}</span>
      }
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateTimePickerComponent implements OnChanges, OnInit {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() state: DatePickerState = 'enabled';
  @Input() value = '';
  @Input() disabled = false;
  @Input() variant: DatePickerVariant = 'date';
  @Input() defaultToToday = true;

  @Output() valueChange = new EventEmitter<string>();

  pickerOpen = false;
  selectedDate = '';
  viewYear = this.currentDate.getFullYear();
  viewMonth = this.currentDate.getMonth();

  readonly weekdays = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
  readonly monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  ngOnInit(): void {
    this.setSelectedDate(this.value || (this.defaultToToday ? this.todayValue : ''));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      this.setSelectedDate(this.value || (this.defaultToToday ? this.todayValue : ''));
    }
  }

  get labelText(): string {
    return this.label || this.placeholder;
  }

  get hasValue(): boolean {
    return Boolean(this.selectedDate);
  }

  get floatingLabel(): boolean {
    return this.pickerOpen || this.hasValue;
  }

  get displayValue(): string {
    if (!this.selectedDate) {
      return '';
    }

    const [year, month, day] = this.selectedDate.split('-');
    return this.variant === 'datetime' ? `${day}/${month}/${year} 00:00:00` : `${day}/${month}/${year}`;
  }

  get monthName(): string {
    return this.monthNames[this.viewMonth];
  }

  get todayDate(): string {
    return this.todayValue;
  }

  get days(): CalendarDay[] {
    const firstDay = new Date(this.viewYear, this.viewMonth, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();
    const previousMonthDays = new Date(this.viewYear, this.viewMonth, 0).getDate();
    const calendarDays: CalendarDay[] = [];

    for (let index = startOffset - 1; index >= 0; index -= 1) {
      const day = previousMonthDays - index;
      calendarDays.push({
        label: this.pad(day),
        value: this.toDateValue(this.viewYear, this.viewMonth - 1, day),
        disabled: true
      });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      calendarDays.push({
        label: this.pad(day),
        value: this.toDateValue(this.viewYear, this.viewMonth, day)
      });
    }

    const nextMonthDays = 42 - calendarDays.length;
    for (let day = 1; day <= nextMonthDays; day += 1) {
      calendarDays.push({
        label: this.pad(day),
        value: this.toDateValue(this.viewYear, this.viewMonth + 1, day),
        disabled: true
      });
    }

    return calendarDays;
  }

  get effectiveState(): DatePickerState {
    if (this.error) {
      return 'error';
    }

    if (this.state === 'success' || (this.hasValue && !this.pickerOpen)) {
      return 'success';
    }

    return this.state;
  }

  get controlClass(): string {
    if (this.disabled) {
      return '';
    }

    if (this.effectiveState === 'error') {
      return 'border-2 border-[var(--sys-color-border-feedback-danger)] hover:border-[var(--sys-color-border-feedback-danger)]';
    }

    if (this.effectiveState === 'success') {
      return 'border-2 border-[var(--sys-color-border-feedback-success)] hover:border-[var(--sys-color-border-feedback-success)]';
    }

    return this.pickerOpen
      ? 'border-2 border-[var(--sys-color-border-states-focus)]'
      : 'border-[var(--sys-color-border-states-enabled)] hover:border-2 hover:border-[var(--sys-color-border-states-hover)]';
  }

  get labelClass(): string {
    if (this.disabled) {
      return 'text-[var(--sys-color-text-neutral-disabled)]';
    }

    if (this.effectiveState === 'error') {
      return 'text-[var(--sys-color-text-feedback-danger)]';
    }

    return this.pickerOpen ? 'text-[var(--sys-color-text-neutral-activated)]' : 'text-[var(--sys-color-text-neutral-low)]';
  }

  get supportingClass(): string {
    return this.effectiveState === 'success' ? 'text-[var(--sys-color-text-feedback-success)]' : 'text-text-muted';
  }

  togglePicker(): void {
    if (this.disabled) {
      return;
    }

    this.pickerOpen = !this.pickerOpen;
    if (this.pickerOpen) {
      this.syncViewToSelection();
    }
  }

  closePicker(event?: Event): void {
    event?.stopPropagation();
    this.pickerOpen = false;
  }

  selectDate(value: string, event?: Event): void {
    event?.stopPropagation();
    this.selectedDate = value;
    this.valueChange.emit(value);

    if (this.variant === 'date') {
      this.closePicker();
    }
  }

  acceptDate(event?: Event): void {
    event?.stopPropagation();
    if (!this.selectedDate) {
      this.selectedDate = this.toDateValue(this.viewYear, this.viewMonth, 1);
      this.valueChange.emit(this.selectedDate);
    }

    this.closePicker();
  }

  moveMonth(offset: number, event?: Event): void {
    event?.stopPropagation();
    const nextDate = new Date(this.viewYear, this.viewMonth + offset, 1);
    this.viewYear = nextDate.getFullYear();
    this.viewMonth = nextDate.getMonth();
  }

  moveYear(offset: number, event?: Event): void {
    event?.stopPropagation();
    this.viewYear += offset;
  }

  private setSelectedDate(value: string): void {
    this.selectedDate = value;
    this.syncViewToSelection();
  }

  private syncViewToSelection(): void {
    const selected = this.parseDateValue(this.selectedDate) || this.currentDate;
    this.viewYear = selected.getFullYear();
    this.viewMonth = selected.getMonth();
  }

  private get currentDate(): Date {
    return new Date();
  }

  private get todayValue(): string {
    const today = this.currentDate;
    return this.toDateValue(today.getFullYear(), today.getMonth(), today.getDate());
  }

  private parseDateValue(value: string): Date | null {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) {
      return null;
    }

    const [, year, month, day] = match;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private toDateValue(year: number, month: number, day: number): string {
    const date = new Date(year, month, day);
    return `${date.getFullYear()}-${this.pad(date.getMonth() + 1)}-${this.pad(date.getDate())}`;
  }

  private pad(value: number): string {
    return String(value).padStart(2, '0');
  }
}
