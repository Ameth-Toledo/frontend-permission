import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Notify } from '../../models/notify';

@Component({
  selector: 'app-modal-notify',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-notify.component.html',
})
export class ModalNotifyComponent {
  @Input() visible: boolean = false;
  @Input() notifications: Notify[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() markAsRead = new EventEmitter<number>();
  @Output() markAllAsRead = new EventEmitter<void>();

  constructor(private router: Router) { }

  cerrarModal() {
    this.close.emit();
  }

  handleNotificationClick(notification: Notify) {
    if (!notification.leido) {
      this.markAsRead.emit(notification.notificationId);
    }
  }

  descargarPDF(notification: Notify) {
    console.log(`Descargando PDF del permiso ${notification.relatedPermitId}`);

    const link = document.createElement('a');
    link.href = `assets/permiso_${notification.relatedPermitId}.pdf`;
    link.download = `Permiso_${notification.relatedPermitId}.pdf`;
    link.click();

    this.markAsRead.emit(notification.notificationId);
  }

  verPermiso(notification: Notify) {
    console.log('1. Notificación completa:', notification);
    console.log('2. informacionPermiso:', notification.informacionPermiso);

    if (!notification.informacionPermiso) {
      console.error('❌ No hay información del permiso');
      return;
    }

    const matricula = notification.informacionPermiso.matricula;
    const permitId = notification.informacionPermiso.permitId;

    console.log('3. Matrícula:', matricula);
    console.log('4. PermitId:', permitId);
    console.log('5. Navegando a:', ['/dashboard/permition/detail', matricula, permitId]);

    this.router.navigate(['/dashboard/permition/detail', matricula, permitId])
      .then(success => {
        console.log('6. Navegación exitosa:', success);
        this.markAsRead.emit(notification.notificationId);
        this.cerrarModal();
      })
      .catch(error => {
        console.error('7. Error en navegación:', error);
      });
  }

  marcarTodasComoLeidas() {
    console.log('Marcando todas como leídas desde modal');
    this.markAllAsRead.emit();
  }

  formatDate(dateString: string): string {
    try {
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
    } catch (e) {
      return dateString;
    }
  }

  getNombreRemitente(notification: Notify): string {
    return notification.informacionRemitente?.nombreCompleto || 'Usuario';
  }

  getEmailRemitente(notification: Notify): string {
    return notification.informacionRemitente?.email || '';
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.leido).length;
  }

  hasUnreadNotifications(): boolean {
    return this.getUnreadCount() > 0;
  }

  verTipoNotificacion(notification: Notify) {
    console.log('Tipo:', notification.tipo, 'Comparación:', notification.tipo === 'pending');
  }
}