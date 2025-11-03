import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalDocenteComponent } from '../../components/modal-docente/modal-docente.component';
import { ModalAlertComponent } from '../../components/modal-alert/modal-alert.component';
import { ModalAvisoComponent } from '../../components/modal-aviso/modal-aviso.component';
import { TitleService } from '../../services/title/title.service';

interface Docente {
  nombre: string;
  apellidoP: string;
  apellidoM: string;
  correo: string;
  numero: string;
  cuatrimestre: string;
  materia: string;
}

@Component({
  selector: 'app-docentes',
  standalone: true,
  imports: [CommonModule, ModalDocenteComponent, ModalAlertComponent, ModalAvisoComponent],
  templateUrl: './docentes.component.html',
})
export class DocentesComponent implements OnInit {
  isModalVisible = false;          // Modal para agregar
  isAlertVisible = false;          // Modal de alerta/eliminar
  isEditModalVisible = false;      // Modal de edición
  docenteSeleccionado: Docente | null = null;  // Para eliminar
  docenteParaEditar: Docente | null = null;    // Para editar

  docentes: Docente[] = [
    { nombre: 'Ali', apellidoP: 'Lopez', apellidoM: 'Zunun', correo: 'ali.lopez@upchiapas.edu.mx', numero: '9661155544', cuatrimestre: '5', materia: 'Programación' },
    { nombre: 'Eduardo', apellidoP: 'Toledo', apellidoM: 'Perez', correo: 'eduardo.toledo@upchiapas.edu.mx', numero: '9661155549', cuatrimestre: '3', materia: 'Base de Datos' },
    { nombre: 'Daniel', apellidoP: 'Chanona', apellidoM: 'Castro', correo: 'daniel.chanona@upchiapas.edu.mx', numero: '9661155355', cuatrimestre: '7', materia: 'Redes' },
  ];

  constructor(private titleService: TitleService) {}

  ngOnInit() {
    this.titleService.setTitle('Docentes');
    this.titleService.setSearch(false);
  }

  // Abrir modal de agregar
  abrirModal() {
    this.isModalVisible = true;
  }
  cerrarModal() {
    this.isModalVisible = false;
  }
  guardarDocente(docente: Docente) {
    this.docentes.push(docente);
    this.cerrarModal();
  }

  // Abrir modal de edición
  abrirEditModal(docente: Docente) {
    this.docenteParaEditar = { ...docente }; // clonamos para no modificar directamente
    this.isEditModalVisible = true;
  }
  cerrarEditModal() {
    this.isEditModalVisible = false;
    this.docenteParaEditar = null;
  }
  actualizarDocente(docenteActualizado: Docente) {
    if (this.docenteParaEditar) {
      const index = this.docentes.findIndex(d => d === this.docenteParaEditar);
      if (index > -1) {
        this.docentes[index] = docenteActualizado;
      }
    }
    this.cerrarEditModal();
  }

  // Abrir modal de eliminar
  confirmarEliminacion(docente: Docente) {
    this.docenteSeleccionado = docente;
    this.isAlertVisible = true;
  }
  cerrarAlerta() {
    this.isAlertVisible = false;
  }
  eliminarDocenteConfirmado() {
    if (this.docenteSeleccionado) {
      this.docentes = this.docentes.filter(d => d !== this.docenteSeleccionado);
      this.docenteSeleccionado = null;
    }
    this.cerrarAlerta();
  }
}
