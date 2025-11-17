import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-template',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './template.component.html',
  styleUrl: './template.component.css'
})
export class TemplateComponent {
  fechaActual: string;
  name: string = '';
  matricula: string = '';
  startDate: string = '';
  endDate: string = '';
  month: string = '';
  reason: string = '';
  nombreCompletoTutor: string = '';
  
  constructor() {
    this.fechaActual = this.formatearFecha(new Date());
  }

  formatearFecha(fecha: Date): string {
    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const año = fecha.getFullYear();
    
    return `${dia} de ${mes} de ${año}`;
  }
}