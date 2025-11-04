import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  constructor (
    private router: Router,
    private authService: AuthService
  ) {}

  sendToHome(event: Event) {
    event.preventDefault();
    this.router.navigate(['dashboard/welcome']);
  }

  sendToTutorados(event: Event) {
    event.preventDefault();
    this.router.navigate(['dashboard/tutorados']);
  }

  sendToEvidences(event: Event) {
    event.preventDefault();
    this.router.navigate(['dashboard/evidencias']);
  }

  sendToPermissions(event: Event) {
    event.preventDefault();
    this.router.navigate(['dashboard/permission']);
  }

  sendToDocentes(event: Event) { 
    event.preventDefault();
    this.router.navigate(['dashboard/docentes']);
  }

  sendToHistorial(event: Event) {
    event.preventDefault();
    this.router.navigate(['dashboard/historial']);
  }

  logout(event: Event) {
    event.preventDefault();

    if(confirm("¿Estas seguro de que deseas cerrar sesión?")) {
      this.authService.logout();
    }
  }
}
