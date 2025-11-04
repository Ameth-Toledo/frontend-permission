import { Component, OnInit, OnDestroy } from '@angular/core';
import { TitleService } from '../../services/title/title.service';
import { CommonModule } from '@angular/common';
import { ModalNotifyComponent } from '../modal-notify/modal-notify.component';
import { HttpClient } from '@angular/common/http';
import { Subscription, interval } from 'rxjs';

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
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ModalNotifyComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  nameInterface: string = '';
  showSearch: boolean = false;
  showNotification: boolean = false;
  notifications: Notification[] = [];
  unreadCount: number = 0;
  private pollingSubscription?: Subscription;

  constructor(
    private titleService: TitleService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.titleService.title$.subscribe(title => this.nameInterface = title);
    this.titleService.search$.subscribe(show => this.showSearch = show);
    
    // Cargar notificaciones inicialmente
    this.loadNotifications();
    
    // Polling cada 30 segundos para actualizar notificaciones
    this.pollingSubscription = interval(30000).subscribe(() => {
      this.loadNotifications();
    });
  }

  ngOnDestroy() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  loadNotifications() {
    const userId = 1; // Obtén el ID del usuario logueado
    this.http.get<Notification[]>(`http://localhost:8080/api/notifications/${userId}`)
      .subscribe({
        next: (data) => {
          this.notifications = data;
          this.unreadCount = data.filter(n => !n.leido).length;
        },
        error: (err) => console.error('Error loading notifications:', err)
      });
  }

  toggleNotification() {
    this.showNotification = !this.showNotification;
  }

  closeNotification() {
    this.showNotification = false;
  }

  markNotificationAsRead(notificationId: number) {
    this.http.put(`http://localhost:8080/api/notifications/${notificationId}/read`, {})
      .subscribe({
        next: () => {
          this.loadNotifications();
        },
        error: (err) => console.error('Error marking as read:', err)
      });
  }
}