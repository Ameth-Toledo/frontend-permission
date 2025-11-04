// historial.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TitleService } from '../../services/title/title.service';

interface History {
  historyId: number;
  permitId: number;
  studentId: number;
  fechaInicio: string;
  fechaFin: string;
  motivo: string;
  estado: string;
  fechaSolicitud: string;
  informacionPermiso: {
    permitId: number;
    descripcion: string;
    evidencia: string;
    cuatrimestre: number;
  };
  informacionEstudiante: {
    studentId: number;
    matricula: string;
    nombreCompleto: string;
    email: string;
  };
}

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.css']
})
export class HistorialComponent implements OnInit {
  histories: History[] = [];
  total: number = 0;

  constructor(private titleService: TitleService) {}

  ngOnInit() {
    this.titleService.setTitle('Historial');
    this.loadHistories();
  }

  loadHistories() {
    // Reemplaza esto con tu llamada al servicio
    const data = {
      histories: [
        {
          historyId: 1,
          permitId: 16,
          studentId: 1,
          fechaInicio: "2025-11-02",
          fechaFin: "2025-11-12",
          motivo: "Sports",
          estado: "approved",
          fechaSolicitud: "2025-11-03T23:27:20",
          informacionPermiso: {
            permitId: 16,
            descripcion: "El estudiante tiene un partido de futbol desconectate",
            evidencia: "https://mozilla.github.io/pdf.js/web/viewer.html?file=https%3A%2F%2Fres.cloudinary.com%2Fdbzllh3xf%2Fraw%2Fupload%2Fv1762224724%2Fpermits%2Fevidences%2Faifelsopvy0tm9rdxbs7",
            cuatrimestre: 7
          },
          informacionEstudiante: {
            studentId: 1,
            matricula: "233363",
            nombreCompleto: "Ameth de Jesus Mendez Toledo",
            email: "233363@ids.upchiapas.edu.mx"
          }
        }
      ],
      total: 1
    };

    this.histories = data.histories;
    this.total = data.total;
  }

  verDetalle(history: History) {
    console.log('Ver detalle del historial:', history);
    // Implementa aquí la lógica para ver el detalle completo
  }

  verEvidencia(evidenciaUrl: string) {
    // Abre la evidencia en una nueva pestaña
    window.open(evidenciaUrl, '_blank');
  }
}