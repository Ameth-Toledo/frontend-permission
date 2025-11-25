import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TitleService } from '../../services/title/title.service';
import { TeachersService } from '../../services/teachers/teachers.service';
import { PermitionService } from '../../services/permition/permition.service';
import { AuthService } from '../../services/auth/auth.service';
import { Tutorado } from '../../models/tutorado';
import { Teacher } from '../../models/teacher';

@Component({
  selector: 'app-generate-permission',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './generate-permission.component.html',
  styleUrl: './generate-permission.component.css'
})
export class GeneratePermissionComponent implements OnInit {
  selectedStudent: Tutorado | null = null;

  // Datos del formulario
  fechaInicial: string = '';
  fechaFinal: string = '';
  motivo: string = 'tramites-personales';
  descripcion: string = '';
  cuatrimestre: number = 1;
  docentesSeleccionados: number[] = [];

  // Archivos
  selectedFile: File | null = null;
  isDragging: boolean = false;

  // Lista de docentes
  docentes: Teacher[] = [];
  isLoadingDocentes: boolean = false;
  errorDocentes: string = '';

  // Estado del envío
  isSubmitting: boolean = false;

  constructor(
    private titleService: TitleService,
    private router: Router,
    private teachersService: TeachersService,
    private permitionService: PermitionService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.titleService.setTitle('Generar Permiso');

    const studentData = sessionStorage.getItem('selectedStudent');

    if (studentData) {
      this.selectedStudent = JSON.parse(studentData);
    }

    this.loadDocentes();
  }

  loadDocentes() {
    this.isLoadingDocentes = true;
    this.errorDocentes = '';

    this.teachersService.getAllTeachers().subscribe({
      next: (response) => {
        this.docentes = response.teachers;
        this.isLoadingDocentes = false;
      },
      error: (error) => {
        this.errorDocentes = 'Error al cargar la lista de docentes';
        this.isLoadingDocentes = false;
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.selectedFile = event.dataTransfer.files[0];
    }
  }

  toggleDocente(docenteId: number) {
    const index = this.docentesSeleccionados.indexOf(docenteId);
    if (index > -1) {
      this.docentesSeleccionados.splice(index, 1);
    } else {
      this.docentesSeleccionados.push(docenteId);
    }
  }

  isDocenteSelected(docenteId: number): boolean {
    return this.docentesSeleccionados.includes(docenteId);
  }

  cancelar() {
    sessionStorage.removeItem('selectedStudent');
    this.router.navigate(['/dashboard/welcome']);
  }

  generarPermiso() {
    if (!this.selectedStudent) {
      alert('No hay alumno seleccionado');
      return;
    }

    if (!this.fechaInicial || !this.fechaFinal) {
      alert('Por favor selecciona las fechas inicial y final');
      return;
    }

    if (!this.cuatrimestre || this.cuatrimestre < 1 || this.cuatrimestre > 12) {
      alert('Por favor ingresa un cuatrimestre válido (1-12)');
      return;
    }

    if (!this.descripcion || this.descripcion.trim() === '') {
      alert('Por favor proporciona una descripción del permiso');
      return;
    }

    if (this.docentesSeleccionados.length === 0) {
      alert('Por favor selecciona al menos un docente a notificar');
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.tutorId) {
      alert('Error: No se pudo identificar al tutor');
      return;
    }

    const formData = new FormData();

    formData.append('studentId', this.selectedStudent.studentId.toString());
    formData.append('tutorId', currentUser.tutorId.toString());
    formData.append('startDate', this.fechaInicial);
    formData.append('endDate', this.fechaFinal);
    formData.append('reason', this.motivo);
    formData.append('description', this.descripcion.trim());
    formData.append('status', 'approved');
    formData.append('cuatrimestre', this.cuatrimestre.toString());

    this.docentesSeleccionados.forEach(teacherId => {
      formData.append('teacherIds', teacherId.toString());
    });

    if (this.selectedFile) {
      formData.append('evidence', this.selectedFile);
    }

    this.isSubmitting = true;

    this.permitionService.createPermit(formData).subscribe({
      next: (response) => {
        const permitId = response.permit?.permitId || response.permitId;

        if (permitId) {
          this.permitionService.updatePermitStatus(permitId, 'approved').subscribe({
            next: (approvalResponse) => {
              this.permitionService.generatePermitDocument(permitId).subscribe({
                next: (pdfResponse) => {
                  alert('✅ Permiso generado, aprobado y PDF creado exitosamente.');

                  sessionStorage.removeItem('selectedStudent');
                  this.isSubmitting = false;
                  this.router.navigate(['/dashboard/welcome']);
                },
                error: (pdfError) => {
                  let pdfErrorMessage = 'Permiso creado y aprobado exitosamente, pero hubo un error al generar el PDF.';
                  
                  if (pdfError.error?.error) {
                    pdfErrorMessage += `\n\nDetalle: ${pdfError.error.error}`;
                  }
                  
                  alert(pdfErrorMessage + '\n\nPuedes generar el PDF manualmente desde el historial de permisos.');

                  sessionStorage.removeItem('selectedStudent');
                  this.isSubmitting = false;
                  this.router.navigate(['/dashboard/welcome']);
                }
              });
            },
            error: (approvalError) => {
              let approvalErrorMessage = 'El permiso fue creado, pero hubo un error al aprobarlo automáticamente.';
              
              if (approvalError.error?.error) {
                approvalErrorMessage += `\n\nDetalle: ${approvalError.error.error}`;
              }
              
              alert(approvalErrorMessage + '\n\nPuedes aprobar el permiso manualmente desde el historial.');

              sessionStorage.removeItem('selectedStudent');
              this.isSubmitting = false;
              this.router.navigate(['/dashboard/welcome']);
            }
          });
        } else {
          alert('Permiso creado exitosamente, pero no se pudo obtener el ID del permiso.');
          
          sessionStorage.removeItem('selectedStudent');
          this.isSubmitting = false;
          this.router.navigate(['/dashboard/welcome']);
        }
      },
      error: (error) => {
        this.isSubmitting = false;

        let errorMessage = 'Error al generar el permiso. Por favor, intenta de nuevo.';

        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.message) {
          errorMessage = error.message;
        }

        alert(errorMessage);
      }
    });
  }
}