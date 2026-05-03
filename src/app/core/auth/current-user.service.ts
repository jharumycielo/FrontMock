import { Injectable, signal } from '@angular/core';

export type CurrentUser = {
  name: string;
  office: string;
};

@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  // Valores mock hasta que la autenticación real provea el perfil del usuario.
  private readonly _user = signal<CurrentUser>({
    name: 'Usuario rol creador',
    office: 'ENTIDAD ESTADO'
  });

  readonly user = this._user.asReadonly();

  setUser(user: CurrentUser): void {
    this._user.set(user);
  }

  get name(): string {
    return this._user().name;
  }

  get office(): string {
    return this._user().office;
  }
}
