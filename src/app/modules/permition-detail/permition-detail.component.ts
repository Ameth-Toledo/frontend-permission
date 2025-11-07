import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PermitionService } from '../../services/permition/permition.service';
import { Permition } from '../../models/permition';

@Component({
  selector: 'app-permition-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './permition-detail.component.html',
  styleUrl: './permition-detail.component.css'
})
export class PermitionDetailComponent implements OnInit {
  matricula: string = '';
  permiso: Permition | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private permitionService: PermitionService
  ) {}

  ngOnInit() {
    this.matricula = this.route.snapshot.paramMap.get('matricule') || '';
    if (this.matricula) {
      this.loadPermiso();
    } else {
      this.errorMessage = 'No se proporcionó una matrícula válida';
      this.isLoading = false;
    }
  }

  loadPermiso() {
    this.isLoading = true;
    this.errorMessage = '';

    // Obtener todos los permisos y filtrar por matrícula
    this.permitionService.getAllPermits().subscribe({
      next: (response) => {
        const permisoEncontrado = response.permits.find(
          p => p.estudiante.numeroMatricula === this.matricula
        );

        if (permisoEncontrado) {
          this.permiso = permisoEncontrado;
        } else {
          this.errorMessage = `No se encontró un permiso para la matrícula ${this.matricula}`;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar el permiso:', error);
        this.errorMessage = 'Error al cargar los datos del permiso';
        this.isLoading = false;
      }
    });
  }

  getStatusClass(): string {
    switch(this.permiso?.status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusText(): string {
    switch(this.permiso?.status.toLowerCase()) {
      case 'approved':
        return 'Aprobado';
      case 'pending':
        return 'Pendiente';
      case 'rejected':
        return 'Rechazado';
      default:
        return this.permiso?.status || '';
    }
  }

  openEvidence() {
    if (this.permiso?.evidence) {
      window.open(this.permiso.evidence, '_blank');
    }
  }

  goBack() {
    this.router.navigate(['dashboard/permission']);
  }
}