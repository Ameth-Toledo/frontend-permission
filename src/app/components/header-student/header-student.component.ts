import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalNotifyComponent } from '../modal-notify/modal-notify.component';
import { NotifyService } from '../../services/notify/notify.service';
import { AuthService } from '../../services/auth/auth.service';
import { Notify } from '../../models/notify';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header-student',
  standalone: true,
  imports: [CommonModule, ModalNotifyComponent],
  templateUrl: './header-student.component.html',
  styleUrl: './header-student.component.css'
})
export class HeaderStudentComponent implements OnInit, OnDestroy {
  name: string = 'AuthGrid';
  showNotification: boolean = false;
  showUserMenu: boolean = false;
  notifications: Notify[] = [];
  unreadCount: number = 0;
  
  private notificationsSubscription?: Subscription;
  private unreadCountSubscription?: Subscription;
  private currentUserId: number | null = null;
  private currentStudentId: number | null = null;

  constructor(
    private notifyService: NotifyService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    
    if (currentUser && currentUser.userId) {
      this.currentUserId = currentUser.userId;
      this.currentStudentId = currentUser.studentId || null;
      this.name = currentUser.name; 
      console.log(`👤 Usuario logueado: ${currentUser.name} (ID: ${currentUser.userId}, StudentID: ${this.currentStudentId})`);
      
      this.notifyService.requestNotificationPermission();
      this.notifyService.connect(currentUser.userId);
      
      this.notificationsSubscription = this.notifyService.notifications$
        .subscribe(notifications => {
          this.notifications = notifications;
          console.log(`📋 Notificaciones actualizadas en header: ${notifications.length}`);
        });
      
      this.unreadCountSubscription = this.notifyService.unreadCount$
        .subscribe(count => {
          this.unreadCount = count;
          console.log(`🔢 Contador no leídas: ${count}`);
        });
    } else {
      console.warn('⚠️ No hay usuario logueado, no se conectará al WebSocket');
    }
  }

  ngOnDestroy() {
    console.log('🧹 Destruyendo HeaderStudentComponent...');
    
    this.notifyService.disconnect();
    
    if (this.notificationsSubscription) {
      this.notificationsSubscription.unsubscribe();
    }
    if (this.unreadCountSubscription) {
      this.unreadCountSubscription.unsubscribe();
    }
  }

  toggleNotification() {
    this.showNotification = !this.showNotification;
    this.showUserMenu = false;
    console.log(`🔔 Modal de notificaciones: ${this.showNotification ? 'abierto' : 'cerrado'}`);
  }

  closeNotification() {
    this.showNotification = false;
    console.log('❌ Modal de notificaciones cerrado');
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
    this.showNotification = false;
    console.log(`👤 Menú de usuario: ${this.showUserMenu ? 'abierto' : 'cerrado'}`);
  }

  closeUserMenu() {
    this.showUserMenu = false;
    console.log('❌ Menú de usuario cerrado');
  }

  goToProfile() {
    this.closeUserMenu();
    
    if (this.currentStudentId && this.name) {
      const formattedName = this.name.replace(/\s+/g, '-').toLowerCase();
      // Navega a la ruta: /profile/student/:id/:name
      this.router.navigate(['/profile/student', this.currentStudentId, formattedName]);
      console.log(`📝 Navegando a perfil del estudiante: ${this.currentStudentId} - ${formattedName}`);
    } else {
      console.error('❌ No se puede navegar al perfil: studentId no disponible');
      // Fallback: navegar a la página principal del estudiante
      this.router.navigate(['/student']);
    }
  }

  logout() {
    this.closeUserMenu();
    console.log('👋 Cerrando sesión...');
    this.authService.logout();
  }

  markNotificationAsRead(notificationId: number) {
    console.log(`✅ Marcando notificación ${notificationId} como leída...`);
    
    this.notifyService.markAsRead(notificationId)
      .subscribe({
        next: () => {
          this.notifications = this.notifications.map(n => 
            n.notificationId === notificationId 
              ? { ...n, leido: true }
              : n
          );
          
          this.unreadCount = this.notifications.filter(n => !n.leido).length;
          
          console.log(`✅ Notificación ${notificationId} marcada como leída`);
        },
        error: (err) => console.error('❌ Error al marcar como leída:', err)
      });
  }

  markAllAsRead() {
    if (!this.currentUserId) {
      console.error('❌ No hay usuario logueado');
      return;
    }

    console.log('✅ Marcando todas las notificaciones como leídas...');
    
    this.notifyService.markAllAsRead(this.currentUserId)
      .subscribe({
        next: () => {
          this.notifyService.loadNotifications(this.currentUserId!);
          console.log('✅ Todas las notificaciones marcadas como leídas');
        },
        error: (err) => console.error('❌ Error al marcar todas como leídas:', err)
      });
  }

  sendToHistory(event: Event) {
    event.preventDefault();
    this.router.navigate(['student/history'])
  }

  sendToHome(event: Event) {
    event.preventDefault();
    this.router.navigate(['student']);
  }

  sendToPermits(event: Event) {
    event.preventDefault();
    this.router.navigate(['permits/student'])
  }
}