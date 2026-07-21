import { LibroContableAccountRow } from '../../config/accounting-books.mock';

/**
 * El diseño de Figma desplaza el monto una columna a la izquierda por cada
 * nivel de indentación de la cuenta, dejando "Debe"/"Haber" (índices 2 y 3)
 * reservados para las cuentas de nivel 1.
 */
export function computeAmountSlots(account: LibroContableAccountRow, formatImporte: (value: number) => string): [string, string, string, string] {
  const slots: [string, string, string, string] = ['', '', '', ''];
  const shift = account.nivel - 1;

  if (account.debe) {
    slots[Math.max(0, 2 - shift)] = formatImporte(account.debe);
  }

  if (account.haber) {
    slots[Math.max(0, 3 - shift)] = formatImporte(account.haber);
  }

  return slots;
}