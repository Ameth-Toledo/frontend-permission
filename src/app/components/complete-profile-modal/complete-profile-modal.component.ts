import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentsService, UpdateStudentData } from '../../services/students/students.service';
import { UsersService } from '../../services/users/users.service';
import { TutorsService } from '../../services/tutors/tutors.service';
import { Tutor } from '../../models/tutors';

@Component({
  selector: 'app-complete-profile-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './complete-profile-modal.component.html',
  styleUrl: './complete-profile-modal.component.css'
})
export class CompleteProfileModalComponent implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() studentId: number = 0;
  @Input() userId: number = 0;
  @Input() missingFields: string[] = [];
  @Input() required: boolean = true;
  
  @Output() closed = new EventEmitter<void>();
  @Output() completed = new EventEmitter<void>();

  formData: UpdateStudentData = {
    enrollmentNumber: '',
    familyTutorPhone: '',
    phone: '',
    tutorId: undefined
  };

  tutors: Tutor[] = [];
  isLoadingTutors: boolean = false;
  isSubmitting: boolean = false;
  errorMessage: string = '';

  constructor(
    private studentsService: StudentsService,
    private usersService: UsersService,
    private tutorsService: TutorsService
  ) {
    console.log('🏗️ CompleteProfileModalComponent constructor ejecutado');
  }

  ngOnInit() {
    console.log('🎯 ngOnInit - Modal inicializada');
    console.log('📋 missingFields:', this.missingFields);
    console.log('🚪 isOpen:', this.isOpen);
    this.checkAndLoadTutors();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('🔄 ngOnChanges detectado:', changes);
    
    // Si cambian los missingFields o isOpen
    if (changes['missingFields'] || changes['isOpen']) {
      console.log('🔄 Cambió missingFields o isOpen');
      console.log('📋 Nuevos missingFields:', this.missingFields);
      console.log('🚪 Nuevo isOpen:', this.isOpen);
      
      if (this.isOpen) {
        this.checkAndLoadTutors();
      }
    }
  }

  checkAndLoadTutors() {
    console.log('🔍 checkAndLoadTutors() ejecutado');
    console.log('📋 missingFields actuales:', this.missingFields);
    console.log('🔍 Incluye tutorId?:', this.missingFields.includes('tutorId'));
    
    if (this.missingFields.includes('tutorId')) {
      console.log('✅ tutorId está en missingFields - Cargando tutores...');
      this.loadTutors();
    } else {
      console.log('❌ tutorId NO está en missingFields');
    }
  }

  loadTutors() {
    console.log('🔄 loadTutors() iniciado');
    
    // Evitar cargas duplicadas
    if (this.isLoadingTutors) {
      console.log('⏸️ Ya se están cargando tutores, cancelando...');
      return;
    }

    // Si ya hay tutores cargados, no recargar
    if (this.tutors.length > 0) {
      console.log('✅ Tutores ya cargados previamente:', this.tutors.length);
      return;
    }

    this.isLoadingTutors = true;
    console.log('⏳ isLoadingTutors = true');
    
    this.tutorsService.getAllTutors().subscribe({
      next: (response) => {
        console.log('📦 Respuesta completa del servidor:', response);
        console.log('📦 response.tutors:', response.tutors);
        console.log('📦 Tipo de response.tutors:', typeof response.tutors);
        console.log('📦 Es array?:', Array.isArray(response.tutors));
        
        if (response && response.tutors && Array.isArray(response.tutors)) {
          this.tutors = response.tutors;
          console.log('✅ Tutores asignados correctamente');
          console.log('📊 Total tutores en array:', this.tutors.length);
          console.log('👥 Primer tutor:', this.tutors[0]);
        } else {
          console.error('❌ response.tutors no es válido');
          this.errorMessage = 'Error al procesar la lista de tutores';
        }
      },
      error: (error) => {
        console.error('❌ Error HTTP al cargar tutores:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        this.errorMessage = 'No se pudieron cargar los tutores';
        this.isLoadingTutors = false;
      },
      complete: () => {
        console.log('✅ Observable completado');
        this.isLoadingTutors = false;
        console.log('⏹️ isLoadingTutors = false');
        console.log('📊 Estado final - tutors.length:', this.tutors.length);
      }
    });
  }

  isFormValid(): boolean {
    let valid = true;

    if (this.missingFields.includes('enrollmentNumber')) {
      valid = valid && !!this.formData.enrollmentNumber?.trim();
    }

    if (this.missingFields.includes('phone')) {
      valid = valid && !!this.formData.phone?.trim() && this.formData.phone.length === 10;
    }

    if (this.missingFields.includes('familyTutorPhone')) {
      valid = valid && !!this.formData.familyTutorPhone?.trim() && this.formData.familyTutorPhone.length === 10;
    }

    if (this.missingFields.includes('tutorId')) {
      valid = valid && !!this.formData.tutorId;
    }

    return valid;
  }

  async onSubmit() {
    if (!this.isFormValid()) {
      this.errorMessage = 'Por favor, completa todos los campos correctamente';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    try {
      console.log('📤 Iniciando actualización de perfil...');
      
      // 1. Actualizar teléfono en users si es necesario
      if (this.missingFields.includes('phone') && this.formData.phone) {
        console.log('📞 Actualizando teléfono personal...');
        await this.usersService.updateUser(this.userId, { 
          phone: this.formData.phone 
        }).toPromise();
        console.log('✅ Teléfono personal actualizado');
      }

      // 2. Actualizar datos del estudiante
      const studentData: UpdateStudentData = {};
      
      if (this.missingFields.includes('enrollmentNumber') && this.formData.enrollmentNumber) {
        studentData.enrollmentNumber = this.formData.enrollmentNumber;
      }
      
      if (this.missingFields.includes('familyTutorPhone') && this.formData.familyTutorPhone) {
        studentData.familyTutorPhone = this.formData.familyTutorPhone;
      }

      if (this.missingFields.includes('tutorId') && this.formData.tutorId) {
        studentData.tutorId = this.formData.tutorId;
      }

      console.log('📤 Datos a enviar al estudiante:', studentData);

      if (Object.keys(studentData).length > 0) {
        await this.studentsService.updateStudent(this.studentId, studentData).toPromise();
        console.log('✅ Datos del estudiante actualizados');
      }

      console.log('🎉 Perfil completado exitosamente');
      this.completed.emit();
      this.onClose();

    } catch (error: any) {
      console.error('❌ Error al actualizar perfil:', error);
      this.errorMessage = error.error?.error || error.error?.message || 'Error al guardar los datos. Intenta nuevamente.';
    } finally {
      this.isSubmitting = false;
    }
  }

  onClose() {
    if (!this.required || this.isFormValid()) {
      this.isOpen = false;
      this.closed.emit();
      this.resetForm();
    }
  }

  onBackdropClick(event: Event) {
    if (!this.required) {
      this.onClose();
    }
  }

  resetForm() {
    this.formData = {
      enrollmentNumber: '',
      familyTutorPhone: '',
      phone: '',
      tutorId: undefined
    };
    this.errorMessage = '';
  }
}