import { Component, OnInit } from '@angular/core';
import { TitleService } from '../../services/title/title.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // 👈 IMPORTANTE

interface Registro {
  matricula: string;
  nombre: string;
  correo: string;
  motivo: string;
}

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, FormsModule], // 👈 AGREGA CommonModule AQUÍ
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.css']
})
export class HistorialComponent implements OnInit {
  filtro: string = '';
  registros: Registro[] = [];
  registrosFiltrados: Registro[] = [];

  constructor(private titleService: TitleService) {}

  ngOnInit() {
    this.titleService.setTitle('Historial');

    this.registros = [
      { matricula: '243000', nombre: 'Carlos Henoel Rincon Alvarez', correo: '243000@ids.upchiapas.edu.mx', motivo: 'Deportivo' },
      { matricula: '243100', nombre: 'Adriana Madrigal Camacho', correo: '243100@ids.upchiapas.edu.mx', motivo: 'Salud' },
      { matricula: '243200', nombre: 'Rosa Elena Lazaro Pacheco', correo: '243200@ids.upchiapas.edu.mx', motivo: 'Deportivo' }
    ];

    this.registrosFiltrados = [...this.registros];
  }

  filtrarDatos() {
    const texto = this.filtro.toLowerCase().trim();
    this.registrosFiltrados = this.registros.filter(
      (item) =>
        item.matricula.toLowerCase().includes(texto) ||
        item.nombre.toLowerCase().includes(texto) ||
        item.correo.toLowerCase().includes(texto) ||
        item.motivo.toLowerCase().includes(texto)
    );
  }
}
