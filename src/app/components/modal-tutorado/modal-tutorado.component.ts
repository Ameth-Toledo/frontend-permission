import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Alumno {
  nombre: string;
  segundoNombre?: string;
  apellidoP: string;
  apellidoM: string;
  matricula: string;
  correo: string;
  telefono: string;
  tutor: string;
}

@Component({
  selector: 'app-modal-tutorado',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-tutorado.component.html',
  styleUrls: ['./modal-tutorado.component.css']
})
export class ModalTutoradoComponent {
  @Input() isVisible: boolean = false;
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<Alumno>();

  nuevoAlumno: Alumno = {
    nombre: '',
    segundoNombre: '',
    apellidoP: '',
    apellidoM: '',
    matricula: '',
    correo: '',
    telefono: '',
    tutor: ''
  };

  cerrarModal() {
    this.cerrar.emit();
    this.resetForm();
  }

  guardarAlumno() {
    const { nombre, apellidoP, apellidoM, matricula, correo, telefono, tutor } = this.nuevoAlumno;
    if (nombre && apellidoP && apellidoM && matricula && correo && telefono && tutor) {
      this.guardar.emit({ ...this.nuevoAlumno });
      this.resetForm();
    }
  }

  private resetForm() {
    this.nuevoAlumno = {
      nombre: '',
      segundoNombre: '',
      apellidoP: '',
      apellidoM: '',
      matricula: '',
      correo: '',
      telefono: '',
      tutor: ''
    };
  }
}
