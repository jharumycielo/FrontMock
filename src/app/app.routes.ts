import { Routes } from '@angular/router';

import { AdjustmentSeatDocumentsComponent } from './features/adjustment-seat-documents/adjustment-seat-documents.component';
import { AdjustmentSeatFormComponent } from './features/adjustment-seat-form/adjustment-seat-form.component';
import { AdjustmentSeatRequestComponent } from './features/adjustment-seat-request/adjustment-seat-request.component';
import { LoginComponent } from './features/login/login.component';
import { OtpVerificationComponent } from './features/otp-verification/otp-verification.component';
import { VirtualDeskComponent } from './features/virtual-desk/virtual-desk.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'login/recuperar-contrasena', component: OtpVerificationComponent },
  { path: 'panel', component: VirtualDeskComponent },
  { path: 'procesos/registro-asiento-ajuste', component: AdjustmentSeatDocumentsComponent },
  { path: 'procesos/registro-asiento-ajuste/solicitud', component: AdjustmentSeatRequestComponent },
  { path: 'procesos/registro-asiento-ajuste/formulario', component: AdjustmentSeatFormComponent },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' }
];
