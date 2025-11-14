import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderStudentComponent } from "../../components/header-student/header-student.component";
import { DocentesService } from '../../services/docentes/docentes.service';
import { PermitionService } from '../../services/permition/permition.service';
import { AuthService } from '../../services/auth/auth.service';
import { StudentsService, Student } from '../../services/students/students.service';
import { Docente } from '../../models/docente';
import { CompleteProfileModalComponent } from "../../components/complete-profile-modal/complete-profile-modal.component";

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [
    HeaderStudentComponent,
    CommonModule,
    FormsModule,
    CompleteProfileModalComponent
  ],
  templateUrl: './student.component.html',
  styleUrl: './student.component.css'
})
export class StudentComponent implements OnInit {
  studentId: number = 0;
  userId: number = 0;
  studentData: Student | null = null;

  showCompleteProfileModal: boolean = false;
  missingFields: string[] = [];
  isProfileComplete: boolean = false;

  selectedTeachers: Docente[] = [];
  startDate: string = '';
  endDate: string = '';
  reason: string = '';
  description: string = '';
  cuatrimestre: string = '';
  selectedFile: File | null = null;
  fileName: string = '';

  teachers: Docente[] = [];
  filteredTeachers: Docente[] = [];
  searchTeacher: string = '';
  showTeacherDropdown: boolean = false;

  reasonOptions = [
    { value: 'Family', label: 'Familiar' },
    { value: 'Health', label: 'Salud' },
    { value: 'Economic', label: 'Económico' },
    { value: 'Academic Events', label: 'Eventos Académicos' },
    { value: 'Sports', label: 'Deportes' },
    { value: 'Pregnancy', label: 'Embarazo' },
    { value: 'Accidents', label: 'Accidentes' },
    { value: 'Addictions', label: 'Adicciones' },
    { value: 'Personal Procedures', label: 'Trámites Personales' },
    { value: 'Other', label: 'Otro' }
  ];

  isSubmitting: boolean = false;
  showSuccessMessage: boolean = false;
  errorMessage: string = '';

  constructor(
    private docentesService: DocentesService,
    private permitionService: PermitionService,
    private authService: AuthService,
    private studentsService: StudentsService
  ) { }

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.userId) {
      this.userId = currentUser.userId;
      console.log('👤 User ID:', this.userId);

      this.loadStudentData();
    }
    this.loadTeachers();
    const today = new Date().toISOString().split('T')[0];
    this.startDate = today;
  }

  loadStudentData() {
    this.studentsService.getStudentByUserId(this.userId).subscribe({
      next: (response) => {
        this.studentData = response.student;
        this.studentId = response.student.studentId;
        console.log('📚 Datos del estudiante:', this.studentData);

        const profileCheck = this.studentsService.isProfileComplete(this.studentData);
        this.isProfileComplete = profileCheck.complete;
        this.missingFields = profileCheck.missingFields;

        console.log('✅ Perfil completo:', this.isProfileComplete);
        console.log('📋 Campos faltantes:', this.missingFields);

        if (!this.isProfileComplete) {
          setTimeout(() => {
            this.showCompleteProfileModal = true;
          }, 500);
        }
      },
      error: (err) => {
        console.error('❌ Error al cargar datos del estudiante:', err);
        this.errorMessage = 'No se pudo cargar tu información de estudiante';
      }
    });
  }

  onProfileCompleted() {
    console.log('✅ Perfil completado exitosamente');
    this.showCompleteProfileModal = false;
    this.isProfileComplete = true;
    this.missingFields = [];
    this.loadStudentData();
  }

  loadTeachers() {
    this.docentesService.getAllTeachers().subscribe({
      next: (response) => {
        this.teachers = response.teachers;
        this.filteredTeachers = this.teachers;
        console.log('👨‍🏫 Profesores cargados:', this.teachers.length);
      },
      error: (err) => console.error('❌ Error al cargar profesores:', err)
    });
  }

  filterTeachers() {
    const search = this.searchTeacher.toLowerCase();
    this.filteredTeachers = this.teachers.filter(teacher => {
      const isAlreadySelected = this.selectedTeachers.some(t => t.teacherId === teacher.teacherId);
      return !isAlreadySelected && teacher.informacionPersonal.nombreCompleto.toLowerCase().includes(search);
    });
    this.showTeacherDropdown = true;
  }

  selectTeacher(teacher: Docente) {
    if (!this.selectedTeachers.some(t => t.teacherId === teacher.teacherId)) {
      this.selectedTeachers.push(teacher);
      this.searchTeacher = '';
      this.showTeacherDropdown = false;
      console.log('✅ Profesor agregado:', teacher.informacionPersonal.nombreCompleto);
      console.log('📋 Total profesores seleccionados:', this.selectedTeachers.length);
    }
  }

  removeTeacher(teacherId: number) {
    this.selectedTeachers = this.selectedTeachers.filter(t => t.teacherId !== teacherId);
    console.log('❌ Profesor removido');
    console.log('📋 Total profesores seleccionados:', this.selectedTeachers.length);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.fileName = this.selectedFile.name;
      console.log('📎 Archivo seleccionado:', this.fileName);
      console.log('📦 Tamaño:', this.selectedFile.size, 'bytes');
      console.log('📄 Tipo:', this.selectedFile.type);
    }
  }

  isFormValid(): boolean {
    if (!this.isProfileComplete) {
      return false;
    }

    const hasAllFields = !!(
      this.selectedTeachers.length > 0 &&
      this.startDate &&
      this.endDate &&
      this.reason &&
      this.description.trim() &&
      this.cuatrimestre.trim() &&
      this.selectedFile
    );

    if (hasAllFields && this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      return end >= start;
    }

    return hasAllFields;
  }

  onSubmit() {
    if (!this.isProfileComplete) {
      this.errorMessage = 'Debes completar tu perfil antes de solicitar permisos';
      this.showCompleteProfileModal = true;
      return;
    }

    if (!this.isFormValid()) {
      this.errorMessage = 'Por favor, completa todos los campos requeridos';
      return;
    }

    if (!this.selectedFile) {
      this.errorMessage = 'Debes seleccionar un archivo PDF como evidencia';
      return;
    }

    if (this.selectedFile.type !== 'application/pdf') {
      this.errorMessage = 'El archivo debe ser un PDF';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    console.log('🚀 Iniciando envío de permiso...');
    console.log('📊 Cantidad de profesores:', this.selectedTeachers.length);

    const formData = new FormData();

    const teacherIds = this.selectedTeachers.map(t => t.teacherId).join(',');

    formData.append('studentId', this.studentId.toString());
    formData.append('teacherIds', teacherIds); 
    formData.append('startDate', this.startDate);
    formData.append('endDate', this.endDate);
    formData.append('reason', this.reason);
    formData.append('description', this.description.trim());
    formData.append('cuatrimestre', this.cuatrimestre.trim());

    if (this.selectedFile) {
      formData.append('evidence', this.selectedFile, this.selectedFile.name);
    }

    console.log('📋 Contenido del FormData:');
    formData.forEach((value, key) => {
      if (value instanceof File) {
        console.log(`  ✓ ${key}: [FILE] ${value.name} (${value.size} bytes)`);
      } else {
        console.log(`  ✓ ${key}: ${value}`);
      }
    });

    this.permitionService.createPermit(formData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.showSuccessMessage = true;
        console.log('✅ Permiso creado exitosamente para todos los profesores');
        console.log('Respuesta:', response);

        setTimeout(() => {
          this.resetForm();
        }, 3000);
      },
      error: (err) => {
        this.isSubmitting = false;

        console.error('❌ Error al crear el permiso');
        console.error('Status:', err.status);
        console.error('Error:', err.error);

        let errorMsg = 'Error al crear el permiso';
        if (err.error) {
          if (typeof err.error === 'string') {
            errorMsg = err.error;
          } else if (err.error.message) {
            errorMsg = err.error.message;
          } else if (err.error.error) {
            errorMsg = err.error.error;
          }
        }

        this.errorMessage = errorMsg;
      }
    });
  }

  resetForm() {
    this.selectedTeachers = [];
    this.searchTeacher = '';
    this.startDate = new Date().toISOString().split('T')[0];
    this.endDate = '';
    this.reason = '';
    this.description = '';
    this.cuatrimestre = '';
    this.selectedFile = null;
    this.fileName = '';
    this.showSuccessMessage = false;
    this.errorMessage = '';

    console.log('🔄 Formulario reseteado');
  }
}