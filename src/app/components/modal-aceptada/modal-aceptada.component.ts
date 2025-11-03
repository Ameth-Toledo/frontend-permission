import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-aceptada',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-aceptada.component.html'
})
export class ModalAceptadaComponent {
  @Input() visible: boolean = false;
  @Output() cerrar = new EventEmitter<void>();

  cerrarModal() {
    this.visible = false;
    this.cerrar.emit();
  }
}
