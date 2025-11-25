import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TitleService } from '../../services/title/title.service';
import { TutoradosService } from '../../services/tutorados/tutorados.service';
import { Tutorado } from '../../models/tutorado';
import { gsap } from 'gsap';

@Component({
  selector: 'app-tutorado-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tutorado-detail.component.html',
  styleUrls: ['./tutorado-detail.component.css']
})
export class TutoradoDetailComponent implements OnInit, AfterViewInit {
  student: Tutorado | null = null;
  isLoading: boolean = false;
  error: string = '';
  studentId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private titleService: TitleService,
    private tutoradosService: TutoradosService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.studentId = +params['id'];
      if (this.studentId) {
        this.loadStudentDetail();
      }
    });
  }

  ngAfterViewInit() {
    // Las animaciones se ejecutarán después de cargar los datos
  }

  loadStudentDetail() {
    this.isLoading = true;
    this.error = '';

    // Obtener todos los estudiantes y buscar el específico
    this.tutoradosService.getAllStudents().subscribe({
      next: (response) => {
        const foundStudent = response.students.find(s => s.studentId === this.studentId);
        
        if (foundStudent) {
          this.student = foundStudent;
          this.titleService.setTitle(`Tutorado: ${this.student.informacionPersonal.nombreCompleto}`);
          this.isLoading = false;
          setTimeout(() => this.animateContent(), 100);
        } else {
          this.error = 'No se encontró el estudiante';
          this.isLoading = false;
          setTimeout(() => this.animateError(), 100);
        }
      },
      error: (error) => {
        console.error('Error al cargar detalle del estudiante:', error);
        this.error = 'Error al cargar la información del estudiante';
        this.isLoading = false;
        setTimeout(() => this.animateError(), 100);
      }
    });
  }

  animateContent() {
    // Primero asegurar que todo sea visible
    gsap.set('.detail-header, .detail-card, .info-item', { opacity: 1 });
    
    gsap.from('.detail-header', {
      y: -30,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out'
    });

    gsap.from('.detail-card', {
      y: 30,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      delay: 0.2,
      ease: 'power2.out'
    });

    gsap.from('.info-item', {
      x: -20,
      opacity: 0,
      duration: 0.4,
      stagger: 0.05,
      delay: 0.4,
      ease: 'power2.out'
    });
  }

  animateError() {
    gsap.from('.error-container', {
      scale: 0.8,
      opacity: 0,
      duration: 0.5,
      ease: 'back.out(1.7)'
    });
  }

  goBack() {
    this.router.navigate(['/dashboard/tutorados']);
  }

  refreshStudent() {
    const button = event?.currentTarget as HTMLElement;
    if (button) {
      const icon = button.querySelector('i');
      if (icon) {
        gsap.to(icon, {
          rotation: 360,
          duration: 0.6,
          ease: 'power2.out'
        });
      }
    }
    this.loadStudentDetail();
  }

  onButtonHover(event: MouseEvent, isEntering: boolean) {
    const button = event.currentTarget as HTMLElement;
    
    if (isEntering) {
      gsap.to(button, {
        scale: 1.05,
        duration: 0.2,
        ease: 'power2.out'
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