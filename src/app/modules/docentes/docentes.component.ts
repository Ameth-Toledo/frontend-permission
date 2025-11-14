import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TitleService } from '../../services/title/title.service';
import { DocentesService } from '../../services/docentes/docentes.service';
import { UsersService } from '../../services/users/users.service';
import { RegisterRequest, RegisterResponse } from '../../models/user';

interface CreateTeacherForm {
  firstName: string;
  middleName: string;
  lastName: string;
  secondLastName: string;
  email: string;
  phone: string;
  password: string;
}

@Component({
  selector: 'app-docentes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './docentes.component.html',
  styleUrls: ['./docentes.component.css']
})
export class DocentesComponent implements OnInit {
  teachers: any[] = [];
  teachersFiltered: any[] = [];
  total: number = 0;
  isLoading: boolean = false;
  error: string = '';
  searchTerm: string = '';
  currentFilter: string = 'all';

  // Modal state
  showModal: boolean = false;
  isSubmitting: boolean = false;
  formError: string = '';
  formSuccess: string = '';

  // Form data
  teacherForm: CreateTeacherForm = {
    firstName: '',
    middleName: '',
    lastName: '',
    secondLastName: '',
    email: '',
    phone: '',
    password: ''
  };

  roleFilters = [
    { label: 'Todos', value: 'all' },
    { label: 'Tutores', value: 'Tutor' },
    { label: 'Profesores', value: 'Teacher' }
  ];

  constructor(
    private titleService: TitleService,
    private docentesService: DocentesService,
    private usersService: UsersService,
    private router: Router
  ) { }

  ngOnInit() {
    this.titleService.setTitle('Docentes');
    this.loadTeachers();
  }

  loadTeachers() {
    this.isLoading = true;
    this.error = '';

    this.docentesService.getAllTeachers().subscribe({
      next: (response) => {
        this.teachers = response.teachers;
        this.teachersFiltered = this.teachers;
        this.total = response.total;
        this.isLoading = false;
        this.applyFilter();
      },
      error: (error) => {
        console.error('Error al cargar docentes:', error);
        this.error = 'Error al cargar los docentes. Por favor, intenta de nuevo.';
        this.isLoading = false;
      }
    });
  }

  filterByRole(role: string) {
    this.currentFilter = role;
    this.applyFilter();
  }

  applyFilter() {
    let filtered = this.teachers;

    if (this.currentFilter !== 'all') {
      filtered = filtered.filter(teacher => 
        teacher.informacionRol.nombreRol === this.currentFilter
      );
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(teacher => {
        const nombre = teacher.informacionPersonal.nombreCompleto.toLowerCase();
        const email = teacher.informacionPersonal.email.toLowerCase();
        const telefono = teacher.informacionPersonal.telefono.toLowerCase();
        const rol = teacher.informacionRol.nombreRol.toLowerCase();
        
        return nombre.includes(term) || 
               email.includes(term) || 
               telefono.includes(term) ||
               rol.includes(term);
      });
    }

    this.teachersFiltered = filtered;
  }

  searchTeachers(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.applyFilter();
  }

  clearSearch() {
    this.searchTerm = '';
    this.applyFilter();
  }

  getCountByRole(role: string): number {
    if (role === 'all') {
      return this.teachers.length;
    }
    return this.teachers.filter(teacher => 
      teacher.informacionRol.nombreRol === role
    ).length;
  }

  getFilterButtonClass(role: string): string {
    const baseClasses = 'px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200';
    
    if (this.currentFilter === role) {
      return `${baseClasses} bg-blue-600 text-white shadow-lg transform scale-105`;
    }
    return `${baseClasses} bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-blue-300`;
  }

  getRoleBadgeClass(role: string): string {
    switch(role) {
      case 'Tutor':
        return 'bg-blue-100 text-blue-800';
      case 'Teacher':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getRoleIcon(role: string): string {
    switch(role) {
      case 'Tutor':
        return 'bx-user-check';
      case 'Teacher':
        return 'bx-chalkboard';
      default:
        return 'bx-user';
    }
  }

  getCurrentFilterLabel(): string {
    const filter = this.roleFilters.find(f => f.value === this.currentFilter);
    return filter ? filter.label : 'Todos';
  }

  verDetalle(teacher: any) {
    console.log('Ver detalle del docente:', teacher);
    // this.router.navigate(['/docentes', teacher.teacherId]);
  }

  refreshTeachers() {
    this.loadTeachers();
  }

  // Modal methods
  openModal() {
    this.showModal = true;
    this.resetForm();
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  resetForm() {
    this.teacherForm = {
      firstName: '',
      middleName: '',
      lastName: '',
      secondLastName: '',
      email: '',
      phone: '',
      password: ''
    };
    this.formError = '';
    this.formSuccess = '';
  }

  isFormValid(): boolean {
    return !!(
      this.teacherForm.firstName.trim() &&
      this.teacherForm.lastName.trim() &&
      this.teacherForm.secondLastName.trim() &&
      this.teacherForm.email.trim() &&
      this.teacherForm.phone.trim() &&
      this.teacherForm.password.trim()
    );
  }

  submitTeacher() {
    if (!this.isFormValid()) {
      this.formError = 'Por favor, completa todos los campos obligatorios';
      return;
    }

    this.isSubmitting = true;
    this.formError = '';
    this.formSuccess = '';

    const registerData: RegisterRequest = {
      firstName: this.teacherForm.firstName,
      middleName: this.teacherForm.middleName || undefined,
      lastName: this.teacherForm.lastName,
      secondLastName: this.teacherForm.secondLastName,
      email: this.teacherForm.email,
      phone: this.teacherForm.phone,
      password: this.teacherForm.password,
      roleId: 2 // Teacher role
    };

    this.usersService.register(registerData).subscribe({
      next: (response: RegisterResponse) => {
        this.formSuccess = `Docente creado exitosamente: ${response.data.name}`;
        this.isSubmitting = false;
        
        setTimeout(() => {
          this.closeModal();
          this.loadTeachers();
        }, 1500);
      },
      error: (error: any) => {
        console.error('Error al crear docente:', error);
        this.formError = error.error?.message || 'Error al crear el docente. Por favor, intenta de nuevo.';
        this.isSubmitting = false;
      }
    });
  }
}