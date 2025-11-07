import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  constructor (
    private router: Router,
    private authService: AuthService
  ) {}

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

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