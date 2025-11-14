import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TitleService } from '../../services/title/title.service';
import { Tutorado } from '../../models/tutorado';

@Component({
  selector: 'app-generate-permission',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './generate-permission.component.html',
  styleUrl: './generate-permission.component.css'
})
export class GeneratePermissionComponent implements OnInit {
  selectedStudent: Tutorado | null = null;
  
  // Datos del formulario
  fechaInicial: string = '';
  fechaFinal: string = '';
  motivo: string = 'tramites-personales';
  docentesSeleccionados: number[] = [];
  
  // Archivos
  selectedFile: File | null = null;
  isDragging: boolean = false;
  
  // Lista de docentes (esto podría venir de un servicio)
  docentes = [
    { id: 1, nombre: 'Marcelo Álvarez Hernández' },
    { id: 2, nombre: 'Sirgei Garcia Bailindas' },
    { id: 3, nombre: 'Jose Pablo Vazquez Cruz' },
    { id: 4, nombre: 'Diana Beatriz Vazquez Cruz' },
    { id: 5, nombre: 'Alonso Guadalupe Hernandez Mendoza' }
  ];

  constructor(
    private titleService: TitleService,
    private router: Router
  ) { }

  ngOnInit() {
    this.titleService.setTitle('Generar Permiso');
    
    // Cargar datos del alumno seleccionado desde sessionStorage
    const studentData = sessionStorage.getItem('selectedStudent');
    
    if (studentData) {
      this.selectedStudent = JSON.parse(studentData);
      console.log('📋 Alumno cargado para permiso:', this.selectedStudent);
    } else {
      console.warn('⚠️ No hay alumno seleccionado');
    }
  }

  // Manejo de archivos
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log('📎 Archivo seleccionado:', this.selectedFile.name);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.selectedFile = event.dataTransfer.files[0];
      console.log('📎 Archivo arrastrado:', this.selectedFile.name);
    }
  }

  toggleDocente(docenteId: number) {
    const index = this.docentesSeleccionados.indexOf(docenteId);
    if (index > -1) {
      this.docentesSeleccionados.splice(index, 1);
    } else {
      this.docentesSeleccionados.push(docenteId);
    }
  }

  isDocenteSelected(docenteId: number): boolean {
    return this.docentesSeleccionados.includes(docenteId);
  }

  cancelar() {
    // Limpiar sessionStorage
    sessionStorage.removeItem('selectedStudent');
    
    // Navegar de regreso
    this.router.navigate(['/dashboard/welcome']);
  }

  generarPermiso() {
    if (!this.selectedStudent) {
      alert('No hay alumno seleccionado');
      return;
    }

    if (!this.fechaInicial || !this.fechaFinal) {
      alert('Por favor selecciona las fechas');
      return;
    }

    if (this.docentesSeleccionados.length === 0) {
      alert('Por favor selecciona al menos un docente');
      return;
    }

    const permisoData = {
      alumno: this.selectedStudent,
      fechaInicial: this.fechaInicial,
      fechaFinal: this.fechaFinal,
      motivo: this.motivo,
      docentes: this.docentesSeleccionados,
      archivo: this.selectedFile ? this.selectedFile.name : null
    };

    console.log('✅ Generando permiso:', permisoData);
    
    // Aquí implementarías la llamada al servicio para crear el permiso
    // this.permisosService.crearPermiso(permisoData).subscribe(...)
    
    alert('Permiso generado exitosamente');
    
    // Limpiar sessionStorage y regresar
    sessionStorage.removeItem('selectedStudent');
    this.router.navigate(['/dashboard/welcome']);
  }
}