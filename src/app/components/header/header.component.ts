import { Component, OnInit, OnDestroy } from '@angular/core';
import { TitleService } from '../../services/title/title.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalNotifyComponent } from '../modal-notify/modal-notify.component';
import { NotifyService } from '../../services/notify/notify.service';
import { AuthService } from '../../services/auth/auth.service';
import { TutoradosService } from '../../services/tutorados/tutorados.service';
import { Notify } from '../../models/notify';
import { Tutorado } from '../../models/tutorado';
import { Subscription, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ModalNotifyComponent, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  nameInterface: string = '';
  showSearch: boolean = false;
  showNotification: boolean = false;
  notifications: Notify[] = [];
  unreadCount: number = 0;
  
  // Búsqueda de alumnos
  searchQuery: string = '';
  searchResults: Tutorado[] = [];
  showSearchResults: boolean = false;
  isSearching: boolean = false;
  private searchSubject = new Subject<string>();
  
  private notificationsSubscription?: Subscription;
  private unreadCountSubscription?: Subscription;
  private searchSubscription?: Subscription;
  private currentUserId: number | null = null;
  private currentTutorId: number | null = null;
  private currentUserName: string = '';

  constructor(
    private titleService: TitleService,
    private notifyService: NotifyService,
    private authService: AuthService,
    private tutoradosService: TutoradosService,
    private router: Router
  ) {}

  ngOnInit() {
    // Suscribirse a los cambios de título y búsqueda
    this.titleService.title$.subscribe(title => this.nameInterface = title);
    this.titleService.search$.subscribe(show => this.showSearch = show);
    
    // Configurar búsqueda con debounce
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300), // Espera 300ms después de que el usuario deje de escribir
      distinctUntilChanged(), // Solo busca si el valor cambió
      switchMap(query => {
        if (query.trim().length < 2) {
          this.searchResults = [];
          this.showSearchResults = false;
          this.isSearching = false;
          return [];
        }
        
        this.isSearching = true;
        return this.tutoradosService.searchStudents(query);
      })
    ).subscribe({
      next: (response) => {
        this.searchResults = response.students || [];
        this.showSearchResults = true;
        this.isSearching = false;
        console.log(`🔍 Resultados de búsqueda: ${this.searchResults.length}`);
      },
      error: (err) => {
        console.error('❌ Error en búsqueda:', err);
        this.searchResults = [];
        this.showSearchResults = false;
        this.isSearching = false;
      }
    });
    
    // Obtener el usuario logueado
    const currentUser = this.authService.getCurrentUser();
    
    if (currentUser && currentUser.userId) {
      this.currentUserId = currentUser.userId;
      this.currentTutorId = currentUser.tutorId || null;
      this.currentUserName = currentUser.name || '';
      console.log(`👤 Usuario logueado: ${currentUser.name} (ID: ${currentUser.userId}, TutorID: ${this.currentTutorId})`);
      
      // Solicitar permisos de notificación del navegador
      this.notifyService.requestNotificationPermission();
      
      // Conectar al WebSocket con el userId del usuario logueado
      this.notifyService.connect(currentUser.userId);
      
      // Suscribirse a las notificaciones en tiempo real
      this.notificationsSubscription = this.notifyService.notifications$
        .subscribe(notifications => {
          this.notifications = notifications;
          console.log(`📋 Notificaciones actualizadas en header: ${notifications.length}`);
        });
      
      // Suscribirse al contador de no leídas
      this.unreadCountSubscription = this.notifyService.unreadCount$
        .subscribe(count => {
          this.unreadCount = count;
          console.log(`🔢 Contador no leídas: ${count}`);
        });
      
      // Verificar estado de conexión después de 2 segundos
      setTimeout(() => {
        this.notifyService.getConnectionStatus();
      }, 2000);
    } else {
      console.warn('⚠️ No hay usuario logueado, no se conectará al WebSocket');
    }
  }

  ngOnDestroy() {
    console.log('🧹 Destruyendo HeaderComponent...');
    
    // Desconectar el WebSocket al destruir el componente
    this.notifyService.disconnect();
    
    // Cancelar suscripciones
    if (this.notificationsSubscription) {
      this.notificationsSubscription.unsubscribe();
    }
    if (this.unreadCountSubscription) {
      this.unreadCountSubscription.unsubscribe();
    }
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  // Método llamado cuando el usuario escribe en el input
  onSearchInput(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  // Seleccionar un alumno y navegar a generar permiso
  selectStudent(student: Tutorado) {
    console.log('✅ Alumno seleccionado:', student);
    
    // Guardar datos del alumno en sessionStorage para usarlos en la siguiente página
    sessionStorage.setItem('selectedStudent', JSON.stringify(student));
    
    // Limpiar búsqueda
    this.searchQuery = '';
    this.searchResults = [];
    this.showSearchResults = false;
    
    // Navegar a generar permiso
    this.router.navigate(['/dashboard/generate-permission']);
  }

  // Cerrar resultados de búsqueda
  closeSearchResults() {
    // Pequeño delay para permitir el click en los resultados
    setTimeout(() => {
      this.showSearchResults = false;
    }, 200);
  }

  toggleNotification() {
    this.showNotification = !this.showNotification;
    console.log(`🔔 Modal de notificaciones: ${this.showNotification ? 'abierto' : 'cerrado'}`);
  }

  closeNotification() {
    this.showNotification = false;
    console.log('❌ Modal de notificaciones cerrado');
  }

  markNotificationAsRead(notificationId: number) {
    console.log(`✅ Marcando notificación ${notificationId} como leída...`);
    
    this.notifyService.markAsRead(notificationId)
      .subscribe({
        next: () => {
          // Actualizar la notificación localmente
          this.notifications = this.notifications.map(n => 
            n.notificationId === notificationId 
              ? { ...n, leido: true }
              : n
          );
          
          // Actualizar el contador
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
          // Recargar notificaciones
          this.notifyService.loadNotifications(this.currentUserId!);
          console.log('✅ Todas las notificaciones marcadas como leídas');
        },
        error: (err) => console.error('❌ Error al marcar todas como leídas:', err)
      });
  }

  // Navegar al perfil del usuario
  navigateToProfile() {
    if (this.currentTutorId && this.currentUserName) {
      const formattedName = this.currentUserName.replace(/\s+/g, '-').toLowerCase();
      this.router.navigate(['/dashboard/profile/docente', this.currentTutorId, formattedName]);
    } else {
      console.error('❌ No se puede navegar al perfil: tutorId no disponible');
    }
  }
}