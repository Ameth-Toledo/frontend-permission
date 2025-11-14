import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TitleService } from '../../services/title/title.service';
import { TutoradosService } from '../../services/tutorados/tutorados.service';
import { AuthService } from '../../services/auth/auth.service';
import { Tutorado } from '../../models/tutorado';
import { gsap } from 'gsap';

@Component({
  selector: 'app-tutorados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tutorados.component.html',
  styleUrls: ['./tutorados.component.css']
})
export class TutoradosComponent implements OnInit, AfterViewInit {
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

  ngAfterViewInit() {
    this.animateOnLoad();
  }

  animateOnLoad() {
    gsap.from('.header-section', {
      y: -30,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out'
    });

    gsap.from('.search-bar', {
      y: 20,
      opacity: 0,
      duration: 0.5,
      delay: 0.2,
      ease: 'power2.out'
    });

    gsap.from('table thead', {
      y: -20,
      opacity: 0,
      duration: 0.5,
      delay: 0.3,
      ease: 'power2.out'
    });

    gsap.from('tbody tr', {
      x: -30,
      opacity: 0,
      duration: 0.4,
      stagger: 0.05,
      delay: 0.4,
      ease: 'power2.out'
    });
  }

  animateTableRows() {
    gsap.from('tbody tr', {
      x: -30,
      opacity: 0,
      duration: 0.4,
      stagger: 0.05,
      ease: 'power2.out'
    });
  }

  animateRefresh() {
    const button = document.querySelector('.refresh-btn i');
    if (button) {
      gsap.to(button, {
        rotation: 360,
        duration: 0.6,
        ease: 'power2.out'
      });
    }
  }

  animateError() {
    gsap.from('.error-container', {
      scale: 0.8,
      opacity: 0,
      duration: 0.5,
      ease: 'back.out(1.7)'
    });
  }

  animateEmptyState() {
    gsap.from('.empty-state', {
      scale: 0.9,
      opacity: 0,
      duration: 0.6,
      ease: 'back.out(1.4)'
    });
  }

  loadStudents() {
    this.isLoading = true;
    this.error = '';

    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      this.error = 'No hay usuario logueado';
      this.isLoading = false;
      setTimeout(() => this.animateError(), 100);
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
        
        setTimeout(() => {
          if (this.studentsFiltered.length > 0) {
            this.animateTableRows();
          } else {
            this.animateEmptyState();
          }
        }, 100);
      },
      error: (error) => {
        console.error('Error al cargar estudiantes:', error);
        this.error = 'Error al cargar los estudiantes. Por favor, intenta de nuevo.';
        this.isLoading = false;
        setTimeout(() => this.animateError(), 100);
      }
    });
  }

  searchStudents(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value.toLowerCase().trim();

    if (!this.searchTerm) {
      this.studentsFiltered = this.students;
      setTimeout(() => this.animateTableRows(), 50);
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

    setTimeout(() => {
      if (this.studentsFiltered.length > 0) {
        this.animateTableRows();
      } else {
        this.animateEmptyState();
      }
    }, 50);
  }

  clearSearch() {
    this.searchTerm = '';
    this.studentsFiltered = this.students;
    
    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (input) {
      input.value = '';
      gsap.to(input, {
        scale: 1.05,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
      });
    }
    
    setTimeout(() => this.animateTableRows(), 50);
  }

  verDetalle(student: Tutorado) {
    const row = event?.target as HTMLElement;
    const tableRow = row.closest('tr');
    
    if (tableRow) {
      gsap.to(tableRow, {
        backgroundColor: '#EFF6FF',
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
      });
    }
    
    console.log('Ver detalle del estudiante:', student);
  }

  refreshStudents() {
    this.animateRefresh();
    this.loadStudents();
  }

  onRowHover(event: MouseEvent, isEntering: boolean) {
    const row = event.currentTarget as HTMLElement;
    
    if (isEntering) {
      gsap.to(row, {
        x: 5,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        duration: 0.3,
        ease: 'power2.out'
      });
    } else {
      gsap.to(row, {
        x: 0,
        boxShadow: 'none',
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  }

  onButtonHover(event: MouseEvent, isEntering: boolean) {
    const button = event.currentTarget as HTMLElement;
    
    if (isEntering) {
      gsap.to(button, {
        scale: 1.1,
        duration: 0.2,
        ease: 'back.out(2)'
      });
    } else {
      gsap.to(button, {
        scale: 1,
        duration: 0.2,
        ease: 'power2.out'
      });
    }
  }
}