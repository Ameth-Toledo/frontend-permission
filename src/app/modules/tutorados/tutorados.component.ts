import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TitleService } from '../../services/title/title.service';

interface Student {
  studentId: number;
  matricula: string;
  telefonoTutorFamiliar: string | null;
  userId: number;
  tutorId: number | null;
  informacionPersonal: {
    nombreCompleto: string;
    email: string;
    telefono: string | null;
  };
  informacionRol: {
    nombreRol: string;
    descripcion: string;
  };
  fechaRegistro: string;
}

@Component({
  selector: 'app-tutorados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tutorados.component.html',
  styleUrls: ['./tutorados.component.css']
})
export class TutoradosComponent implements OnInit {
  students: Student[] = [];
  total: number = 0;

  constructor(private titleService: TitleService) { }
  
  ngOnInit() {
    this.titleService.setTitle('Tutorados');
    this.loadStudents();
  }

  loadStudents() {
    // Reemplaza esto con tu llamada al servicio
    const data = {
      students: [
        {
          studentId: 3,
          matricula: "",
          telefonoTutorFamiliar: null,
          userId: 8,
          tutorId: null,
          informacionPersonal: {
            nombreCompleto: "JORED666  GitHub",
            email: "243842@ids.upchiapas.edu.mx",
            telefono: null
          },
          informacionRol: {
            nombreRol: "Student",
            descripcion: "User who can request school absence permits"
          },
          fechaRegistro: "2025-11-03T15:27:06"
        },
        {
          studentId: 2,
          matricula: "",
          telefonoTutorFamiliar: null,
          userId: 4,
          tutorId: null,
          informacionPersonal: {
            nombreCompleto: "Victor Fabricio Perez Constantino",
            email: "233394@ids.upchiapas.edu.mx",
            telefono: "9613037813"
          },
          informacionRol: {
            nombreRol: "Student",
            descripcion: "User who can request school absence permits"
          },
          fechaRegistro: "2025-10-29T22:14:42"
        },
        {
          studentId: 1,
          matricula: "233363",
          telefonoTutorFamiliar: "9611234567",
          userId: 1,
          tutorId: 1,
          informacionPersonal: {
            nombreCompleto: "Ameth de Jesus Mendez Toledo",
            email: "233363@ids.upchiapas.edu.mx",
            telefono: "9613037813"
          },
          informacionRol: {
            nombreRol: "Student",
            descripcion: "User who can request school absence permits"
          },
          fechaRegistro: "2025-10-28T18:56:43"
        }
      ],
      total: 3
    };

    this.students = data.students;
    this.total = data.total;
  }

  verDetalle(student: Student) {
    console.log('Ver detalle del estudiante:', student);
    // Implementa aquí la lógica para ver el detalle o abrir el modal
  }
}