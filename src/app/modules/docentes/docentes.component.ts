import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TitleService } from '../../services/title/title.service';

interface Teacher {
  teacherId: number;
  userId: number;
  informacionPersonal: {
    nombreCompleto: string;
    email: string;
    telefono: string;
  };
  informacionRol: {
    nombreRol: string;
    descripcion: string;
  };
  fechaRegistro: string;
}

@Component({
  selector: 'app-docentes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './docentes.component.html',
})
export class DocentesComponent implements OnInit {
  constructor(private titleService: TitleService) { }

  teachers: Teacher[] = [];
  total: number = 0;

  ngOnInit() {
    this.loadTeachers();
    this.titleService.setTitle('Docentes');
  }

  loadTeachers() {
    // Reemplaza esto con tu llamada al servicio
    const data = {
      teachers: [
        {
          teacherId: 4,
          userId: 9,
          informacionPersonal: {
            nombreCompleto: "Carlos Alberto Diaz Hernandez",
            email: "cvdiaz@ids.upchiapas.edu.mx",
            telefono: "9611234567"
          },
          informacionRol: {
            nombreRol: "Tutor",
            descripcion: "User in charge of approving or rejecting student permits"
          },
          fechaRegistro: "2025-11-03T16:47:58"
        },
        {
          teacherId: 3,
          userId: 6,
          informacionPersonal: {
            nombreCompleto: "Karla Melissa Corral Zarate",
            email: "233313@ids.upchiapas.edu.mx",
            telefono: "9613037813"
          },
          informacionRol: {
            nombreRol: "Teacher",
            descripcion: "Professor in charge of registering or validating student attendance"
          },
          fechaRegistro: "2025-10-31T00:25:12"
        },
        {
          teacherId: 2,
          userId: 5,
          informacionPersonal: {
            nombreCompleto: "Sujey  Calderon Martinez",
            email: "233291@ids.upchiapas.edu.mx",
            telefono: "9613037813"
          },
          informacionRol: {
            nombreRol: "Teacher",
            descripcion: "Professor in charge of registering or validating student attendance"
          },
          fechaRegistro: "2025-10-31T00:20:21"
        },
        {
          teacherId: 1,
          userId: 3,
          informacionPersonal: {
            nombreCompleto: "Sayuri Estefania Zuñiga Chacon",
            email: "233349@ids.upchiapas.edu.mx",
            telefono: "9613037813"
          },
          informacionRol: {
            nombreRol: "Teacher",
            descripcion: "Professor in charge of registering or validating student attendance"
          },
          fechaRegistro: "2025-10-29T20:17:10"
        }
      ],
      total: 4
    };

    this.teachers = data.teachers;
    this.total = data.total;
  }

  verDetalle(teacher: Teacher) {
    console.log('Ver detalle del docente:', teacher);
    // Implementa aquí la lógica para ver el detalle
  }
}