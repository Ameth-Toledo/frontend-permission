import { Component, OnInit } from '@angular/core';
import { HeaderStudentComponent } from "../../components/header-student/header-student.component";
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TitleService } from '../../services/title/title.service';
import { PermitionService } from '../../services/permition/permition.service';
import { AuthService } from '../../services/auth/auth.service';
import { Permition } from '../../models/permition';

@Component({
  selector: 'app-permits-student',
  standalone: true,
  imports: [HeaderStudentComponent, CommonModule],
  templateUrl: './permits-student.component.html',
  styleUrl: './permits-student.component.css'
})
export class PermitsStudentComponent implements OnInit {
  approvedPermits: Permition[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private titleService: TitleService,
    private permitionService: PermitionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.titleService.setTitle('Mis Permisos Aprobados');
    this.loadApprovedPermits();
  }

  loadApprovedPermits() {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      this.errorMessage = 'No hay usuario autenticado';
      this.isLoading = false;
      this.router.navigate(['/login']);
      return;
    }

    if (!currentUser.studentId) {
      this.errorMessage = 'El usuario no tiene un studentId asignado';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    this.permitionService.getPermitsByStudent(currentUser.studentId).subscribe({
      next: (response) => {
        // Filtrar solo los permisos aprobados
        this.approvedPermits = response.permits.filter(
          permit => permit.status.toLowerCase().trim() === 'approved'
        );
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar permisos:', error);
        this.errorMessage = 'Error al cargar los permisos. Por favor, intenta de nuevo.';
        this.isLoading = false;
      }
    });
  }

  verPermisoPDF(pdfUrl: string) {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  }

  descargarPermiso(pdfUrl: string, permitId: number) {
    if (!pdfUrl) return;

    // Extraer la URL real del PDF desde el visor de PDF.js
    const urlMatch = pdfUrl.match(/file=([^&]+)/);
    const realPdfUrl = urlMatch ? decodeURIComponent(urlMatch[1]) : pdfUrl;

    // Crear un enlace temporal para descargar
    const link = document.createElement('a');
    link.href = realPdfUrl;
    link.download = `Permiso_${permitId}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  verEvidencia(evidenciaUrl: string) {
    if (evidenciaUrl) {
      window.open(evidenciaUrl, '_blank');
    }
  }

  refreshPermits() {
    this.loadApprovedPermits();
  }

  irAHistorial() {
    this.router.navigate(['/student/history']);
  }
}