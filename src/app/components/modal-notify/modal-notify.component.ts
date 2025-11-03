import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-notify',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-notify.component.html',
})
export class ModalNotifyComponent {
  @Input() visible: boolean = false;
  @Output() close = new EventEmitter<void>();

  cerrarModal() {
    this.close.emit();
  }

  descargarPDF() {
    // Aquí puedes agregar la lógica real para descargar un PDF (por ejemplo, desde /assets)
    const link = document.createElement('a');
    link.href = 'assets/solicitud_aprobada.pdf'; // ruta del archivo
    link.download = 'Solicitud_Aprobada.pdf';
    link.click();
  }
}
