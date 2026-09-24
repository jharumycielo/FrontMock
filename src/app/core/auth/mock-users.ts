import { VisualizadorTipo } from './current-user.service';

/** Usuarios mock del login (Entidades del Estado) hasta integrar la autenticación real. */
export type MockUser = {
  email: string;
  password: string;
  name: string;
  visualizadorTipo: VisualizadorTipo;
};

/** Contraseña común a todos los usuarios mock; cada uno se distingue por su correo. */
const MOCK_PASSWORD = '0000001';

export const MOCK_USERS: MockUser[] = [
  { email: '01@mail.com.pe', password: MOCK_PASSWORD, name: 'Usuario rol Visualizador', visualizadorTipo: 'unidad_ejecutora' },
  { email: '02@mail.com.pe', password: MOCK_PASSWORD, name: 'Usuario rol Visualizador', visualizadorTipo: 'pliego' },
  { email: '03@mail.com.pe', password: MOCK_PASSWORD, name: 'Usuario rol Visualizador', visualizadorTipo: 'ente_rector' },
];

export function findMockUser(email: string, password: string): MockUser | undefined {
  const normalized = email.trim().toLowerCase();
  return MOCK_USERS.find((user) => user.email === normalized && user.password === password);
}
