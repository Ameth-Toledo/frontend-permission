import { Component, OnInit } from '@angular/core';
import { TitleService } from '../../services/title/title.service';
import { AuthService } from '../../services/auth/auth.service';
import { TutoradosService } from '../../services/tutorados/tutorados.service';
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
  
  totalTutorados: number = 0;
  permisosPendientes: number = 0;
  permisosAprobados: number = 0;
  docentesActivos: number = 0;
  
  isLoading: boolean = true;

  constructor(
    private titleService: TitleService, 
    private router: Router,
    private authService: AuthService,
    private tutoradosService: TutoradosService
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
    this.isLoading = true;
    
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser || !currentUser.userId) {
      console.error('No se encontró el userId del usuario logueado');
      this.isLoading = false;
      return;
    }

    // Cargar los tutorados del tutor logueado
    this.tutoradosService.getStudentsByTutorId(currentUser.userId).subscribe({
      next: (response) => {
        this.totalTutorados = response.total;
        this.isLoading = false;
        console.log('✅ Tutorados cargados:', response);
        console.log('📊 Total de tutorados:', this.totalTutorados);
      },
      error: (error) => {
        console.error('❌ Error al cargar tutorados:', error);
        this.totalTutorados = 0;
        this.isLoading = false;
      }
    });
    
    // Aquí puedes agregar más llamadas para cargar otros datos del dashboard
    // Por ejemplo: permisosPendientes, permisosAprobados, docentesActivos
  }

  sentTopermisos(event: Event) {
    event.preventDefault();
    this.router.navigate(['dashboard/generate-permission']);
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}