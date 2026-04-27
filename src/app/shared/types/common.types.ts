/**
 * Tipos comunes reutilizables en toda la aplicación
 */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonType = 'button' | 'submit' | 'reset';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'time' | 'datetime-local';

export type AlertType = 'success' | 'warning' | 'danger' | 'info';
export type AlertSize = 'sm' | 'md' | 'lg';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export type DialogConfig = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: AlertType;
};

export type SelectOption = {
  label: string;
  value: string | number;
  disabled?: boolean;
};
