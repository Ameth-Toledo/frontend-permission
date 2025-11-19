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
  isGeneratingPDF: boolean = false; 

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private permitionService: PermitionService
  ) { }

  ngOnInit() {
    this.matricula = this.route.snapshot.paramMap.get('matricule') || '';
    const permitIdParam = this.route.snapshot.paramMap.get('id');
    
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
          console.log('✅ Permiso aprobado, generando documento...');
          
          // 🎯 Llamar al backend para generar el PDF
          this.generatePermitDocument();
        },
        error: (error) => {
          console.error('Error al aprobar el permiso:', error);
          alert('Error al aprobar el permiso');
          this.isLoading = false;
        }
      });
    }
  }

  // 🎯 NUEVO: Generar documento desde el backend
  private generatePermitDocument() {
    this.isGeneratingPDF = true;
    
    this.permitionService.generatePermitDocument(this.permiso!.permitId).subscribe({
      next: (response: any) => {
        console.log('✅ Documento generado:', response);
        
        // Recargar los datos del permiso
        this.permitionService.getPermitById(this.permiso!.permitId).subscribe({
          next: (updatedResponse) => {
            this.permiso = updatedResponse.permit;
            this.isLoading = false;
            this.isGeneratingPDF = false;
            
            alert('✅ Permiso aprobado y documento generado exitosamente');
            
            // Abrir el documento generado
            if (this.permiso?.permitDocumentUrl) {
              window.open(this.permiso.permitDocumentUrl, '_blank');
            }
          },
          error: (error) => {
            console.error('Error al recargar el permiso:', error);
            this.isLoading = false;
            this.isGeneratingPDF = false;
          }
        });
      },
      error: (error) => {
        console.error('❌ Error al generar documento:', error);
        alert('Error al generar el documento PDF');
        this.isLoading = false;
        this.isGeneratingPDF = false;
      }
    });
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
  
  // Ver documento si ya existe
  viewPermitDocument() {
    if (this.permiso?.permitDocumentUrl) {
      window.open(this.permiso.permitDocumentUrl, '_blank');
    }
  }
}