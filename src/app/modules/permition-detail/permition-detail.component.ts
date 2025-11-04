import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Estudiante {
  studentId: number;
  userId: number;
  nombreCompleto: string;
  email: string;
  telefono: string;
  numeroMatricula: string;
}

interface Tutor {
  tutorId: number;
  userId: number;
  nombreCompleto: string;
  email: string;
  telefono: string;
}

interface Profesor {
  teacherId: number;
  userId: number;
  nombreCompleto: string;
  email: string;
  telefono: string;
}

interface Permiso {
  permitId: number;
  estudiante: Estudiante;
  tutor: Tutor;
  profesores: Profesor[];
  startDate: string;
  endDate: string;
  reason: string;
  description: string;
  cuatrimestre: number;
  evidence: string;
  status: string;
  requestDate: string;
}

@Component({
  selector: 'app-permition-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './permition-detail.component.html',
  styleUrl: './permition-detail.component.css'
})
export class PermitionDetailComponent implements OnInit {
  matricula: string = '';
  permiso: Permiso | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.matricula = this.route.snapshot.paramMap.get('matricule') || '';
    this.loadPermiso();
  }

  loadPermiso() {
    // Aquí llamarías a tu servicio para obtener el permiso
    // this.permisoService.getPermisoByMatricula(this.matricula).subscribe(...)
    
    // Datos de ejemplo
    this.permiso = {
      permitId: 10,
      estudiante: {
        studentId: 1,
        userId: 1,
        nombreCompleto: "Ameth de Jesus Mendez Toledo",
        email: "233363@ids.upchiapas.edu.mx",
        telefono: "9613037813",
        numeroMatricula: "233363"
      },
      tutor: {
        tutorId: 1,
        userId: 2,
        nombreCompleto: "Jared Tapia Torres Morga",
        email: "233310@ids.upchiapas.edu.mx",
        telefono: "9613037813"
      },
      profesores: [
        {
          teacherId: 1,
          userId: 3,
          nombreCompleto: "Sayuri Estefania Zuñiga Chacon",
          email: "233349@ids.upchiapas.edu.mx",
          telefono: "9613037813"
        },
        {
          teacherId: 2,
          userId: 5,
          nombreCompleto: "Sujey  Calderon Martinez",
          email: "233291@ids.upchiapas.edu.mx",
          telefono: "9613037813"
        },
        {
          teacherId: 3,
          userId: 6,
          nombreCompleto: "Karla Melissa Corral Zarate",
          email: "233313@ids.upchiapas.edu.mx",
          telefono: "9613037813"
        }
      ],
      startDate: "2025-11-02",
      endDate: "2025-11-08",
      reason: "Sports",
      description: "El estudiante tiene un partido de futbol desconectate",
      cuatrimestre: 7,
      evidence: "https://mozilla.github.io/pdf.js/web/viewer.html?file=https%3A%2F%2Fres.cloudinary.com%2Fdbzllh3xf%2Fraw%2Fupload%2Fv1762130035%2Fpermits%2Fevidences%2Fut1anuwazjmkog2mkjrn",
      status: "pending",
      requestDate: "2025-11-02T18:33:55"
    };
  }

  getStatusClass(): string {
    switch(this.permiso?.status) {
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
    switch(this.permiso?.status) {
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
}