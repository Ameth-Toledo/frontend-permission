import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TitleService } from '../../services/title/title.service';
import { TutoradosService } from '../../services/tutorados/tutorados.service';
import { AuthService } from '../../services/auth/auth.service';
import { Tutorado } from '../../models/tutorado';

@Component({
  selector: 'app-tutorados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tutorados.component.html',
  styleUrls: ['./tutorados.component.css']
})
export class TutoradosComponent implements OnInit {
  students: Tutorado[] = [];
  studentsFiltered: Tutorado[] = [];
  total: number = 0;
  isLoading: boolean = false;
  error: string = '';
  searchTerm: string = '';

  constructor(
    private titleService: TitleService,
    private tutoradosService: TutoradosService,
    private authService: AuthService,
    private router: Router
  ) { }
  
  ngOnInit() {
    this.titleService.setTitle('Mis Tutorados');
    this.loadStudents();
  }

  loadStudents() {
    this.isLoading = true;
    this.error = '';

    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      this.error = 'No hay usuario logueado';
      this.isLoading = false;
      return;
    }

    this.tutoradosService.getAllStudents().subscribe({
      next: (response) => {
        const tutorIdToFilter = currentUser.tutorId || currentUser.userId;
        
        this.students = response.students.filter(student => {
          return student.tutorId === tutorIdToFilter;
        });
        
        this.studentsFiltered = this.students;
        this.total = this.students.length;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar estudiantes:', error);
        this.error = 'Error al cargar los estudiantes. Por favor, intenta de nuevo.';
        this.isLoading = false;
      }
    });
  }

  searchStudents(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value.toLowerCase().trim();

    if (!this.searchTerm) {
      this.studentsFiltered = this.students;
      return;
    }

    this.studentsFiltered = this.students.filter(student => {
      const nombre = student.informacionPersonal.nombreCompleto.toLowerCase();
      const matricula = student.matricula?.toLowerCase() || '';
      const email = student.informacionPersonal.email.toLowerCase();
      
      return nombre.includes(this.searchTerm) || 
             matricula.includes(this.searchTerm) || 
             email.includes(this.searchTerm);
    });
  }

  clearSearch() {
    this.searchTerm = '';
    this.studentsFiltered = this.students;
  }

  verDetalle(student: Tutorado) {
    console.log('Ver detalle del estudiante:', student);
    // Implementa la navegación o modal aquí
    // this.router.navigate(['/tutorados', student.studentId]);
  }

  refreshStudents() {
    this.loadStudents();
  }
}