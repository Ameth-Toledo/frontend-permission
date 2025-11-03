import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Docente {
  nombre: string;
  apellidoP: string;
  apellidoM: string;
  numero: string;
  correo: string;
  cuatrimestre: string;
  materia: string;
}

@Component({
  selector: 'app-modal-docente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-docente.component.html',
  styleUrls: ['./modal-docente.component.css']
})
export class ModalDocenteComponent {
  @Input() isVisible: boolean = false;
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<Docente>();

  nuevoDocente: Docente = {
    nombre: '',
    apellidoP: '',
    apellidoM: '',
    numero: '',
    correo: '',
    cuatrimestre: '',
    materia: ''
  };

  cerrarModal() {
    this.cerrar.emit();
    this.resetForm();
  }

  guardarDocente() {
    const { nombre, apellidoP, apellidoM, numero, correo, cuatrimestre, materia } = this.nuevoDocente;
    if (nombre && apellidoP && apellidoM && numero && correo && cuatrimestre && materia) {
      this.guardar.emit({ ...this.nuevoDocente });
      this.resetForm();
    }
  }

  private resetForm() {
    this.nuevoDocente = {
      nombre: '',
      apellidoP: '',
      apellidoM: '',
      numero: '',
      correo: '',
      cuatrimestre: '',
      materia: ''
    };
  }
}