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
  permitId: number = 0;
  permiso: Permition | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private permitionService: PermitionService
  ) { }

  ngOnInit() {
    // Capturar parámetros de la ruta (el parámetro en la ruta se llama 'id', no 'permitId')
    this.matricula = this.route.snapshot.paramMap.get('matricule') || '';
    const permitIdParam = this.route.snapshot.paramMap.get('id'); // CAMBIO: usar 'id' en lugar de 'permitId'
    
    if (permitIdParam) {
      this.permitId = parseInt(permitIdParam, 10);
    }

    if (this.permitId && this.matricula) {
      this.loadPermiso();
    } else {
      this.errorMessage = 'No se proporcionaron parámetros válidos';
      this.isLoading = false;
    }
  }

  loadPermiso() {
    this.isLoading = true;
    this.errorMessage = '';

    this.permitionService.getAllPermits().subscribe({
      next: (response) => {
        const permisoEncontrado = response.permits.find(
          p => p.permitId === this.permitId
        );

        if (permisoEncontrado) {
          if (permisoEncontrado.estudiante.numeroMatricula === this.matricula) {
            this.permiso = permisoEncontrado;
          } else {
            this.errorMessage = `El permiso ${this.permitId} no corresponde a la matrícula ${this.matricula}`;
          }
        } else {
          this.errorMessage = `No se encontró el permiso con ID ${this.permitId}`;
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
    switch (this.permiso?.status.toLowerCase()) {
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
    switch (this.permiso?.status.toLowerCase()) {
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

  approvePermission() {
    if (!this.permiso) return;

    if (confirm('¿Está seguro que desea aprobar este permiso?')) {
      this.isLoading = true;

      this.permitionService.updatePermitStatus(this.permiso.permitId, 'approved').subscribe({
        next: (response) => {
          this.permiso = response;
          this.isLoading = false;
          alert('Permiso aprobado exitosamente');
        },
        error: (error) => {
          console.error('Error al aprobar el permiso:', error);
          alert('Error al aprobar el permiso');
          this.isLoading = false;
        }
      });
    }
  }

  declinePermission() {
    if (!this.permiso) return;

    if (confirm('¿Está seguro que desea rechazar este permiso?')) {
      this.isLoading = true;

      this.permitionService.updatePermitStatus(this.permiso.permitId, 'rejected').subscribe({
        next: (response) => {
          this.permiso = response;
          this.isLoading = false;
          alert('Permiso rechazado exitosamente');
        },
        error: (error) => {
          console.error('Error al rechazar el permiso:', error);
          alert('Error al rechazar el permiso');
          this.isLoading = false;
        }
      });
    }
  }
}