import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface Docente {
  nombre: string;
  apellidoP: string;
  apellidoM: string;
  correo: string;
  numero: string;
  cuatrimestre: string;
  materia: string;
}

@Component({
  selector: 'app-modal-aviso',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './modal-aviso.component.html'
})
export class ModalAvisoComponent {
  @Input() isVisible: boolean = false;           // Controla visibilidad de la modal
  @Input() docente: Docente = {                 // Docente a editar
    nombre: '',
    apellidoP: '',
    apellidoM: '',
    correo: '',
    numero: '',
    cuatrimestre: '',
    materia: ''
  };
  @Output() cerrar = new EventEmitter<void>();   // Para cerrar modal
  @Output() guardar = new EventEmitter<Docente>(); // Para enviar docente actualizado

  guardarDocente() {
    this.guardar.emit(this.docente);
  }
}
