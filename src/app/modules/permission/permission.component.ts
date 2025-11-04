import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TitleService } from '../../services/title/title.service';
import { Permition } from '../../models/permition';

@Component({
  selector: 'app-permission',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './permission.component.html',
  styleUrl: './permission.component.css'
})
export class PermissionComponent {
  permisos: Permition[] = [
    {
      permitId: 1,
      estudiante: {
        studentId: 1,
        userId: 101,
        nombreCompleto: 'Juan Pérez',
        email: 'juan.perez@example.com',
        telefono: '555-123-4567',
        numeroMatricula: 'A12345'
      },
      tutor: {
        tutorId: 1,
        userId: 201,
        nombreCompleto: 'María García',
        email: 'maria.garcia@example.com',
        telefono: '555-765-4321'
      },
      profesores: [
        {
          teacherId: 1,
          userId: 301,
          nombreCompleto: 'Dr. López',
          email: 'dr.lopez@example.com',
          telefono: '555-000-1111'
        },
        {
          teacherId: 2,
          userId: 302,
          nombreCompleto: 'Ing. Martínez',
          email: 'ing.martinez@example.com',
          telefono: '555-222-3333'
        }
      ],
      startDate: '2025-11-05T08:00:00',
      endDate: '2025-11-07T18:00:00',
      reason: 'Enfermedad',
      description: 'Gripe estacional',
      cuatrimestre: 5,
      evidence: 'certificado_medico.pdf',
      status: 'Pendiente',
      requestDate: '2025-11-03T10:30:00'
    },
    {
      permitId: 2,
      estudiante: {
        studentId: 2,
        userId: 102,
        nombreCompleto: 'Ana Torres',
        email: 'ana.torres@example.com',
        telefono: '555-999-8888',
        numeroMatricula: 'B67890'
      },
      tutor: {
        tutorId: 2,
        userId: 202,
        nombreCompleto: 'Carlos Ruiz',
        email: 'carlos.ruiz@example.com',
        telefono: '555-444-5555'
      },
      profesores: [
        {
          teacherId: 3,
          userId: 303,
          nombreCompleto: 'Lic. Hernández',
          email: 'lic.hernandez@example.com',
          telefono: '555-666-7777'
        }
      ],
      startDate: '2025-11-10T08:00:00',
      endDate: '2025-11-10T18:00:00',
      reason: 'Trámite personal',
      description: 'Renovación de documentos oficiales',
      cuatrimestre: 3,
      evidence: 'cita.pdf',
      status: 'Aprobado',
      requestDate: '2025-11-01T14:15:00'
    }
  ];

  constructor(private titleService: TitleService) { }

  ngOnInit() {
    this.titleService.setTitle('Nuevo permiso');
  }
}
