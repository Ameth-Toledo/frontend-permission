import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-alert.component.html',
})
export class ModalAlertComponent {
  @Input() isVisible = false;
  @Input() docente: any;
  @Output() cerrar = new EventEmitter<void>();
  @Output() confirmar = new EventEmitter<void>();
}
