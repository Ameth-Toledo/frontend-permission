import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TutoradosService } from '../../services/tutorados/tutorados.service';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { HeaderStudentComponent } from "../../components/header-student/header-student.component";

@Component({
  selector: 'app-profile-student',
  standalone: true,
  imports: [FormsModule, CommonModule, HeaderStudentComponent],
  templateUrl: './profile-student.component.html',
  styleUrl: './profile-student.component.css'
})
export class ProfileStudentComponent implements OnInit {
  // Información básica del estudiante
  name: string = '';
  email: string = '';
  telefono: string = '';
  role: string = '';
  fecha_registro: string = '';
  
  // IDs
  userId: number = 0;
  studentId: number = 0;
  roleId: number = 0;
  tutorId: number | null = null;
  
  // Información adicional del estudiante
  matricula: string = '';
  telefonoTutorFamiliar: string = '';
  
  // Control de edición
  editingField: { [key: string]: boolean } = {};
  tempValues: { [key: string]: string } = {};
  
  // Estados
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private tutoradosService: TutoradosService,
    private authService: AuthService,
    private router: Router
  ) {
    console.log('🏗️ Constructor ProfileStudentComponent ejecutado');
  }

  ngOnInit(): void {
    console.log('🚀 ngOnInit ejecutado');
    
    const currentUser = this.authService.getCurrentUser();
    console.log('👤 Usuario completo desde AuthService:', currentUser);
    
    if (!currentUser) {
      console.error('❌ No hay usuario logueado');
      this.errorMessage = 'Debes iniciar sesión para ver tu perfil';
      this.isLoading = false;
      this.router.navigate(['']);
      return;
    }

    if (!currentUser.studentId) {
      console.error('❌ studentId no disponible:', currentUser);
      this.errorMessage = 'No se encontró información de estudiante';
      this.isLoading = false;
      return;
    }
    
    this.userId = currentUser.userId ?? 0;
    this.studentId = currentUser.studentId ?? 0;
    this.roleId = currentUser.roleId ?? 0;

    console.log('📋 IDs asignados - userId:', this.userId, 'studentId:', this.studentId);

    this.loadStudentProfile(this.studentId);
  }

  loadStudentProfile(studentId: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    console.log('📡 Llamando API - getStudentById:', studentId);

    this.tutoradosService.getStudentById(studentId).subscribe({
      next: (response: any) => {
        console.log('✅ RESPUESTA COMPLETA DE LA API:', JSON.stringify(response, null, 2));
        
        // La respuesta viene con un wrapper "student"
        const studentData = response.student;
        console.log('📦 Student Data extraído:', studentData);
        
        if (!studentData) {
          console.error('❌ No se encontró studentData en la respuesta');
          this.errorMessage = 'Estructura de datos inválida';
          this.isLoading = false;
          return;
        }
        
        // Asignar información personal
        console.log('👤 Información Personal:', studentData.informacionPersonal);
        this.name = studentData.informacionPersonal?.nombreCompleto || 'Sin nombre';
        this.email = studentData.informacionPersonal?.email || 'Sin email';
        this.telefono = studentData.informacionPersonal?.telefono || 'No registrado';
        
        // Asignar información del rol
        console.log('🎭 Información Rol:', studentData.informacionRol);
        this.role = studentData.informacionRol?.nombreRol || 'Estudiante';
        
        // Asignar información adicional del estudiante
        this.matricula = studentData.matricula || 'No asignada';
        this.telefonoTutorFamiliar = studentData.telefonoTutorFamiliar || 'No registrado';
        this.tutorId = studentData.tutorId;
        
        // Formatear fecha de registro
        if (studentData.fechaRegistro) {
          this.fecha_registro = this.formatDate(studentData.fechaRegistro);
        } else {
          this.fecha_registro = 'No disponible';
        }

        console.log('✅ DATOS FINALES ASIGNADOS:', {
          name: this.name,
          email: this.email,
          telefono: this.telefono,
          role: this.role,
          matricula: this.matricula,
          telefonoTutorFamiliar: this.telefonoTutorFamiliar,
          tutorId: this.tutorId,
          fecha_registro: this.fecha_registro
        });

        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ ERROR COMPLETO:', error);
        console.error('❌ Status:', error.status);
        console.error('❌ Message:', error.message);
        console.error('❌ Error Body:', error.error);
        this.errorMessage = 'No se pudo cargar la información del perfil: ' + (error.error?.message || error.message);
        this.isLoading = false;
      }
    });
  }

  private formatDate(dateString: string): string {
    if (!dateString) return 'No disponible';
    
    try {
      const fecha = new Date(dateString);
      return fecha.toLocaleString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return dateString;
    }
  }

  startEdit(field: string): void {
    // Solo permitir editar ciertos campos
    const editableFields = ['telefono', 'telefonoTutorFamiliar'];
    if (!editableFields.includes(field)) {
      console.log('⚠️ Campo no editable:', field);
      return;
    }
    
    this.editingField[field] = true;
    this.tempValues[field] = field === 'telefono' ? this.telefono : 
                             field === 'telefonoTutorFamiliar' ? this.telefonoTutorFamiliar : '';
  }

  cancelEdit(field: string): void {
    this.editingField[field] = false;
    delete this.tempValues[field];
  }

  saveEdit(field: string): void {
    const newValue = this.tempValues[field]?.trim();
    
    if (!newValue || newValue === '') {
      alert('El campo no puede estar vacío');
      return;
    }

    const currentValue = field === 'telefono' ? this.telefono : 
                        field === 'telefonoTutorFamiliar' ? this.telefonoTutorFamiliar : '';

    if (newValue === currentValue) {
      this.cancelEdit(field);
      return;
    }

    console.log('📝 Actualizando campo:', field, 'con valor:', newValue);
    
    // Por ahora, solo actualiza localmente
    if (field === 'telefono') {
      this.telefono = newValue;
    } else if (field === 'telefonoTutorFamiliar') {
      this.telefonoTutorFamiliar = newValue;
    }
    
    this.cancelEdit(field);
    alert('Información actualizada correctamente');
  }

  deleteAccount(): void {
    const confirmation = confirm(
      '¿Estás seguro de que deseas eliminar tu cuenta?\n\n' +
      'Esta acción eliminará toda tu información como estudiante:\n' +
      '• Matrícula: ' + this.matricula + '\n' +
      '• Permisos solicitados\n' +
      '• Historial académico\n\n' +
      'Esta acción NO se puede deshacer.'
    );
    
    if (confirmation) {
      const secondConfirmation = confirm('¿Realmente deseas continuar? Esta es tu última advertencia.');
      
      if (secondConfirmation) {
        console.log('🗑️ Eliminando cuenta del estudiante:', this.studentId);
        alert('Funcionalidad de eliminación no implementada aún');
      }
    }
  }

  get tieneTutor(): boolean {
    return this.tutorId !== null && this.tutorId > 0;
  }

  navigateToHome(): void {
    this.router.navigate(['']);
  }
}