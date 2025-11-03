import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { GeneratePermissionComponent } from './modules/generate-permission/generate-permission.component';
import { TutoradosComponent } from './modules/tutorados/tutorados.component';
import { Login } from './modules/login/login';
import { Evidencias } from './modules/evidencias/evidencias';
import { WelcomeComponent } from './modules/welcome/welcome.component';
import { DocentesComponent } from './modules/docentes/docentes.component';
import { RegistroComponent } from './modules/registro/registro.component';
import { HistorialComponent } from './modules/historial/historial.component';
import { PermitionDetailComponent } from './modules/permition-detail/permition-detail.component';
import { AuthCallbackComponent } from './modules/auth-callback/auth-callback.component';


export const routes: Routes = [
    { path: '', redirectTo: '', pathMatch: 'full' },
    { path: '', component: Login },
    { path: 'registro', component: RegistroComponent },
    { path: 'auth/callback', component: AuthCallbackComponent },
    { path: 'dashboard', component: DashboardComponent, /*canActivate: [authGuard],*/ children: [
        { path: 'generate-permission', component: GeneratePermissionComponent },
        { path: 'tutorados', component: TutoradosComponent },
        { path: 'evidencias', component: Evidencias },
        { path: 'welcome', component: WelcomeComponent },
        { path: 'docentes', component: DocentesComponent },
        { path: 'historial', component: HistorialComponent },
        { path: 'permition/detail/:matricule', component: PermitionDetailComponent }
    ]}
];
