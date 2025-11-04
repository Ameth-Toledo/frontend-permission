import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Notification {
  notificationId: number;
  senderId: number;
  receiverId: number;
  tipo: string;
  mensaje: string;
  relatedPermitId: number;
  leido: boolean;
  fechaCreacion: string;
}

@Component({
  selector: 'app-modal-notify',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-notify.component.html',
})
export class ModalNotifyComponent {
  @Input() visible: boolean = false;
  @Input() notifications: Notification[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() markAsRead = new EventEmitter<number>();

  constructor(private router: Router) {}

  cerrarModal() {
    this.close.emit();
  }

  handleNotificationClick(notification: Notification) {
    if (!notification.leido) {
      this.markAsRead.emit(notification.notificationId);
    }
  }

  descargarPDF(notification: Notification) {
    // Lógica para descargar el PDF del permiso aprobado
    const link = document.createElement('a');
    link.href = `assets/permiso_${notification.relatedPermitId}.pdf`;
    link.download = `Permiso_${notification.relatedPermitId}.pdf`;
    link.click();
    
    this.markAsRead.emit(notification.notificationId);
  }

  verPermiso(notification: Notification) {
    this.router.navigate(['/permisos', notification.relatedPermitId]);
    this.markAsRead.emit(notification.notificationId);
    this.cerrarModal();
  }

  marcarTodasComoLeidas() {
    this.notifications
      .filter(n => !n.leido)
      .forEach(n => this.markAsRead.emit(n.notificationId));
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Justo ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays < 7) return `Hace ${diffDays} d`;
    
    return date.toLocaleDateString('es-MX', { 
      day: 'numeric', 
      month: 'short' 
    });
  }
}