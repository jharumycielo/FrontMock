import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ShellNavigationService {
  private readonly processMenuRequestedSubject = new Subject<void>();
  private readonly createDocumentRequestedSubject = new Subject<void>();

  readonly processMenuRequested$ = this.processMenuRequestedSubject.asObservable();
  readonly createDocumentRequested$ = this.createDocumentRequestedSubject.asObservable();

  openProcessMenu(): void {
    this.processMenuRequestedSubject.next();
  }

  openCreateDocument(): void {
    this.createDocumentRequestedSubject.next();
  }
}
