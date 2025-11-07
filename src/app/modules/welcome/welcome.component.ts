import { Component, OnInit } from '@angular/core';
import { TitleService } from '../../services/title/title.service';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css'
})
export class WelcomeComponent implements OnInit {
  username: string = '';
  
  totalTutorados: number = 48;
  permisosPendientes: number = 5;
  permisosAprobados: number = 23;
  docentesActivos: number = 12;

  constructor(
    private titleService: TitleService, 
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.titleService.setTitle('Dashboard');
    this.loadUserData();
    this.loadDashboardData();
  }

  loadUserData() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.username = currentUser.name;
    }
  }

  loadDashboardData() {
    // Aquí puedes cargar los datos del dashboard desde tu API
  }

  sentTopermisos(event: Event) {
    event.preventDefault();
    this.router.navigate(['dashboard/generate-permission']);
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}