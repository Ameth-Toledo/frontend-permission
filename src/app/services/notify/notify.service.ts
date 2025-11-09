import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Notify, NotificationResponse } from '../../models/notify';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class NotifyService {
  private socket: WebSocket | null = null;
  private notificationsSubject = new BehaviorSubject<Notify[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  
  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();
  
  private readonly API_URL = `${environment.apiUrl}/api/notifications`;
  private readonly WS_URL = environment.apiUrl.replace('http', 'ws') + '/ws/notifications';
  
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private currentUserId: number | null = null;

  constructor(private http: HttpClient) {}

  connect(userId: number): void {
    if (!userId) {
      console.error('No se puede conectar sin userId');
      return;
    }

    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log('WebSocket ya está conectado');
      return;
    }

    this.currentUserId = userId;

    try {
      const wsUrl = `${this.WS_URL}/${userId}`;
      console.log(`🔌 Conectando a: ${wsUrl}`);
      
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('WebSocket conectado exitosamente');
        this.reconnectAttempts = 0;
        this.loadNotifications(userId);
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Mensaje WebSocket recibido:', data);
          
          if (data.notifications && Array.isArray(data.notifications)) {
            console.log(`Notificaciones iniciales: ${data.total} total, ${data.unread} sin leer`);
            this.notificationsSubject.next(data.notifications);
            this.unreadCountSubject.next(data.unread || 0);
            return;
          }
          
          if (data.notificationId) {
            const notification: Notify = data;
            console.log('🔔 Nueva notificación recibida:', notification.mensaje);
            
            const currentNotifications = this.notificationsSubject.value;
            const updatedNotifications = [notification, ...currentNotifications];
            this.notificationsSubject.next(updatedNotifications);
            
            const unreadCount = updatedNotifications.filter(n => !n.leido).length;
            this.unreadCountSubject.next(unreadCount);
            
            this.showBrowserNotification(notification);
          }
        } catch (error) {
          console.error('Error al procesar mensaje WebSocket:', error);
        }
      };

      this.socket.onerror = (error) => {
        console.error('Error en WebSocket:', error);
      };

      this.socket.onclose = (event) => {
        console.log(`🔌 WebSocket desconectado (código: ${event.code})`);
        this.socket = null;
        
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Intentando reconectar (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
          setTimeout(() => {
            if (this.currentUserId) {
              this.connect(this.currentUserId);
            }
          }, this.reconnectInterval);
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('Máximo de intentos de reconexión alcanzado');
        }
      };
    } catch (error) {
      console.error('Error al crear WebSocket:', error);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close(1000, 'Desconexión intencional');
      this.socket = null;
      this.currentUserId = null;
      console.log('🔌 WebSocket desconectado manualmente');
    }
  }

  loadNotifications(userId: number): void {
    this.http.get<NotificationResponse>(`${this.API_URL}/user/${userId}`)
      .subscribe({
        next: (response) => {
          console.log(`Notificaciones cargadas: ${response.total} total, ${response.unread} sin leer`);
          this.notificationsSubject.next(response.notifications);
          this.unreadCountSubject.next(response.unread);
        },
        error: (err) => console.error('Error al cargar notificaciones:', err)
      });
  }

  markAsRead(notificationId: number): Observable<any> {
    return this.http.put(`${this.API_URL}/${notificationId}/read`, {});
  }

  markAllAsRead(userId: number): Observable<any> {
    return this.http.patch(`${this.API_URL}/user/${userId}/read-all`, {});
  }

  private showBrowserNotification(notification: Notify): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const title = notification.informacionRemitente?.nombreCompleto || 'Nueva Notificación';
      const notif = new Notification(title, {
        body: notification.mensaje,
        icon: '/assets/notification-icon.png',
        badge: '/assets/badge-icon.png',
        tag: `notification-${notification.notificationId}`,
        requireInteraction: false
      });

      setTimeout(() => notif.close(), 5000);
    }
  }


  requestNotificationPermission(): void {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('🔔 Permiso de notificaciones:', permission);
      });
    }
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  getCurrentNotifications(): Notify[] {
    return this.notificationsSubject.value;
  }

  getCurrentUnreadCount(): number {
    return this.unreadCountSubject.value;
  }
}