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
      console.error('❌ No se puede conectar sin userId');
      return;
    }

    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log('✅ WebSocket ya está conectado');
      return;
    }

    this.currentUserId = userId;

    try {
      const wsUrl = `${this.WS_URL}/${userId}`;
      console.log(`🔌 CONECTANDO WebSocket a: ${wsUrl}`);
      console.log(`📍 URL completa: ${wsUrl}`);
      console.log(`👤 UserId: ${userId}`);
      
      this.socket = new WebSocket(wsUrl);
      
      console.log('⏳ WebSocket creado, esperando conexión...');

      this.socket.onopen = () => {
        console.log('✅✅✅ WebSocket CONECTADO EXITOSAMENTE ✅✅✅');
        console.log('🔗 Estado de la conexión: OPEN');
        console.log('📡 Listo para recibir notificaciones en tiempo real');
        this.reconnectAttempts = 0;
        this.loadNotifications(userId);
      };

      this.socket.onmessage = (event) => {
        console.log('');
        console.log('🎯🎯🎯 MENSAJE WEBSOCKET RECIBIDO 🎯🎯🎯');
        console.log('⏰ Timestamp:', new Date().toLocaleTimeString());
        console.log('📦 Raw data:', event.data);
        
        try {
          const data = JSON.parse(event.data);
          console.log('📨 Data parseada:', JSON.stringify(data, null, 2));
          console.log('🔍 Tipo de data:', typeof data);
          console.log('🔍 Keys de data:', Object.keys(data));
          
          // Caso 1: Respuesta de conexión inicial
          if (data.type === 'connected') {
            console.log('🔗 Mensaje de CONEXIÓN confirmada');
            console.log('✅ El WebSocket está funcionando correctamente');
            return;
          }
          
          // Caso 2: Lista inicial de notificaciones
          if (data.notifications && Array.isArray(data.notifications)) {
            console.log('📋 LISTA INICIAL de notificaciones recibida');
            console.log(`📊 Total: ${data.total}, Unread: ${data.unread}, Array length: ${data.notifications.length}`);
            this.notificationsSubject.next(data.notifications);
            this.unreadCountSubject.next(data.unread || 0);
            return;
          }
          
          // Caso 3: Nueva notificación en tiempo real con formato WebSocketNotification
          if (data.type === 'notification' && data.data) {
            console.log('🔔🔔🔔 NOTIFICACIÓN EN TIEMPO REAL RECIBIDA (con type) 🔔🔔🔔');
            const notification: Notify = data.data;
            
            console.log('📦 Notificación completa:', JSON.stringify(notification, null, 2));
            console.log('🆔 ID:', notification.notificationId);
            console.log('📝 Tipo:', notification.tipo);
            console.log('💬 Mensaje:', notification.mensaje);
            console.log('👤 Remitente:', notification.informacionRemitente?.nombreCompleto);
            console.log('📄 Permiso ID:', notification.informacionPermiso?.permitId);
            
            // Agregar la notificación al inicio de la lista
            const currentNotifications = this.notificationsSubject.value;
            const updatedNotifications = [notification, ...currentNotifications];
            this.notificationsSubject.next(updatedNotifications);
            
            // Actualizar el contador de no leídas
            const unreadCount = updatedNotifications.filter(n => !n.leido).length;
            this.unreadCountSubject.next(unreadCount);
            
            // Mostrar notificación del navegador
            this.showBrowserNotification(notification);
            
            console.log('✅ Notificación agregada al array. Total notificaciones:', updatedNotifications.length);
            console.log('');
            return;
          }
          
          // Caso 4: Nueva notificación con wrapper { data: {...} } pero SIN type
          if (data.data && data.data.notificationId) {
            console.log('🔔🔔🔔 NOTIFICACIÓN EN TIEMPO REAL (formato: {data: {...}}) 🔔🔔🔔');
            const notification: Notify = data.data;
            
            console.log('📦 Notificación completa:', JSON.stringify(notification, null, 2));
            console.log('🆔 ID:', notification.notificationId);
            console.log('📝 Tipo:', notification.tipo);
            console.log('💬 Mensaje:', notification.mensaje);
            console.log('👤 Remitente:', notification.informacionRemitente?.nombreCompleto);
            console.log('📄 Permiso ID:', notification.informacionPermiso?.permitId);
            
            // Agregar la notificación al inicio de la lista
            const currentNotifications = this.notificationsSubject.value;
            const updatedNotifications = [notification, ...currentNotifications];
            this.notificationsSubject.next(updatedNotifications);
            
            // Actualizar el contador de no leídas
            const unreadCount = updatedNotifications.filter(n => !n.leido).length;
            this.unreadCountSubject.next(unreadCount);
            
            // Mostrar notificación del navegador
            this.showBrowserNotification(notification);
            
            console.log('✅ Notificación agregada al array. Total notificaciones:', updatedNotifications.length);
            console.log('');
            return;
          }
          
          // Caso 5: Notificación en formato antiguo (directo sin wrapper)
          if (data.notificationId) {
            console.log('⚠️ NOTIFICACIÓN en formato ANTIGUO (sin wrapper)');
            const notification: Notify = data;
            
            console.log('📦 Notificación:', JSON.stringify(notification, null, 2));
            
            const currentNotifications = this.notificationsSubject.value;
            const updatedNotifications = [notification, ...currentNotifications];
            this.notificationsSubject.next(updatedNotifications);
            
            const unreadCount = updatedNotifications.filter(n => !n.leido).length;
            this.unreadCountSubject.next(unreadCount);
            
            this.showBrowserNotification(notification);
            console.log('✅ Notificación agregada. Total:', updatedNotifications.length);
            return;
          }
          
          console.warn('⚠️⚠️⚠️ FORMATO DESCONOCIDO ⚠️⚠️⚠️');
          console.warn('Data recibida:', data);
          console.warn('No coincide con ningún formato esperado');
          console.log('');
          
        } catch (error) {
          console.error('❌❌❌ ERROR AL PROCESAR MENSAJE ❌❌❌');
          console.error('Error:', error);
          console.error('Data original:', event.data);
          console.log('');
        }
      };

      this.socket.onerror = (error) => {
        console.error('❌❌❌ ERROR EN WEBSOCKET ❌❌❌');
        console.error('Error:', error);
        console.error('Estado del socket:', this.socket?.readyState);
        console.error('URL:', `${this.WS_URL}/${userId}`);
      };

      this.socket.onclose = (event) => {
        console.log('');
        console.log('🔌🔌🔌 WEBSOCKET DESCONECTADO 🔌🔌🔌');
        console.log('⏰ Timestamp:', new Date().toLocaleTimeString());
        console.log('📊 Código de cierre:', event.code);
        console.log('📝 Razón:', event.reason || 'Sin razón especificada');
        console.log('🔍 Fue limpio?:', event.wasClean);
        
        this.socket = null;
        
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`🔄 INTENTANDO RECONECTAR (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
          setTimeout(() => {
            if (this.currentUserId) {
              console.log('🔄 Ejecutando reconexión...');
              this.connect(this.currentUserId);
            }
          }, this.reconnectInterval);
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('❌ MÁXIMO DE INTENTOS DE RECONEXIÓN ALCANZADO');
          console.error('💡 El WebSocket NO se reconectará automáticamente');
        } else {
          console.log('✅ Cierre normal del WebSocket (código 1000)');
        }
        console.log('');
      };
    } catch (error) {
      console.error('❌ Error al crear WebSocket:', error);
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
    console.log(`🔄 Haciendo GET a: ${this.API_URL}/user/${userId}`);
    this.http.get<NotificationResponse>(`${this.API_URL}/user/${userId}`)
      .subscribe({
        next: (response) => {
          console.log('📥 RESPUESTA COMPLETA HTTP:', JSON.stringify(response, null, 2));
          console.log(`📊 Estructura: total=${response.total}, unread=${response.unread}, notifications.length=${response.notifications?.length}`);
          
          if (response.notifications && response.notifications.length > 0) {
            console.log('🔍 Primera notificación de ejemplo:', JSON.stringify(response.notifications[0], null, 2));
          }
          
          this.notificationsSubject.next(response.notifications);
          this.unreadCountSubject.next(response.unread);
        },
        error: (err) => {
          console.error('❌ Error al cargar notificaciones:', err);
          console.error('❌ Detalles del error:', JSON.stringify(err, null, 2));
        }
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
    const connected = this.socket?.readyState === WebSocket.OPEN;
    console.log(`🔍 Estado WebSocket: ${connected ? '✅ CONECTADO' : '❌ DESCONECTADO'} (readyState: ${this.socket?.readyState})`);
    return connected;
  }

  getCurrentNotifications(): Notify[] {
    return this.notificationsSubject.value;
  }

  getCurrentUnreadCount(): number {
    return this.unreadCountSubject.value;
  }

  getConnectionStatus(): void {
    console.log('');
    console.log('🔍🔍🔍 DIAGNÓSTICO DE WEBSOCKET 🔍🔍🔍');
    console.log('⏰ Timestamp:', new Date().toLocaleTimeString());
    console.log('👤 Usuario actual:', this.currentUserId);
    console.log('🔌 Socket existe?:', !!this.socket);
    console.log('📡 Ready State:', this.socket?.readyState);
    console.log('📊 Estados posibles:');
    console.log('   0 = CONNECTING (conectando)');
    console.log('   1 = OPEN (abierto y funcionando) ✅');
    console.log('   2 = CLOSING (cerrando)');
    console.log('   3 = CLOSED (cerrado)');
    console.log('🔗 URL:', `${this.WS_URL}/${this.currentUserId}`);
    console.log('📋 Notificaciones en memoria:', this.notificationsSubject.value.length);
    console.log('🔢 No leídas:', this.unreadCountSubject.value);
    console.log('');
  }
}