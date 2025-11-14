import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { TitleService } from '../../services/title/title.service';
import { AuthService } from '../../services/auth/auth.service';
import { TutoradosService } from '../../services/tutorados/tutorados.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import Sortable from 'sortablejs';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css'
})
export class WelcomeComponent implements OnInit, AfterViewInit, OnDestroy {
  username: string = '';
  
  totalTutorados: number = 0;
  permisosPendientes: number = 0;
  permisosAprobados: number = 0;
  docentesActivos: number = 0;
  
  isLoading: boolean = true;
  
  private sortableInstance: Sortable | null = null;
  private sortableQuickAccessInstance: Sortable | null = null;

  constructor(
    private titleService: TitleService, 
    private router: Router,
    private authService: AuthService,
    private tutoradosService: TutoradosService
  ) {
    gsap.registerPlugin(Draggable);
  }

  ngOnInit() {
    this.titleService.setTitle('Dashboard');
    this.loadUserData();
    this.loadDashboardData();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initializeDragAndDrop();
      this.initializeQuickAccessDragAndDrop();
      this.animateOnLoad();
    }, 100);
  }

  ngOnDestroy() {
    if (this.sortableInstance) {
      this.sortableInstance.destroy();
    }
    if (this.sortableQuickAccessInstance) {
      this.sortableQuickAccessInstance.destroy();
    }
  }

  initializeDragAndDrop() {
    const container = document.querySelector('.stats-grid') as HTMLElement;
    
    if (!container) {
      console.warn('Contenedor no encontrado');
      return;
    }

    this.sortableInstance = Sortable.create(container, {
      animation: 200,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      
      onStart: (evt) => {
        const item = evt.item;
        gsap.to(item, {
          scale: 1.05,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
          duration: 0.2,
          ease: 'power2.out'
        });
      },
      
      onEnd: (evt) => {
        const item = evt.item;
        gsap.to(item, {
          scale: 1,
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          duration: 0.3,
          ease: 'elastic.out(1, 0.5)'
        });
        
        this.saveLayout();
      }
    });

    this.restoreLayout();
  }

  initializeQuickAccessDragAndDrop() {
    const container = document.querySelector('.quick-access-grid') as HTMLElement;
    
    if (!container) {
      console.warn('Contenedor de accesos rápidos no encontrado');
      return;
    }

    this.sortableQuickAccessInstance = Sortable.create(container, {
      animation: 200,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      
      onStart: (evt) => {
        const item = evt.item;
        gsap.to(item, {
          scale: 1.05,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
          duration: 0.2,
          ease: 'power2.out'
        });
      },
      
      onEnd: (evt) => {
        const item = evt.item;
        gsap.to(item, {
          scale: 1,
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          duration: 0.3,
          ease: 'elastic.out(1, 0.5)'
        });
        
        this.saveQuickAccessLayout();
      }
    });

    this.restoreQuickAccessLayout();
  }

  animateOnLoad() {
    gsap.from('.stat-card', {
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out'
    });

    gsap.from('.quick-access-btn', {
      y: 40,
      opacity: 0,
      duration: 0.7,
      stagger: 0.15,
      ease: 'back.out(1.4)',
      delay: 0.3
    });

    gsap.from('.activity-item', {
      x: -30,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power2.out',
      delay: 0.6
    });
  }

  saveLayout() {
    const container = document.querySelector('.stats-grid') as HTMLElement;
    if (!container) return;
    
    const order = Array.from(container.children).map((el) => 
      el.getAttribute('data-id')
    );
    localStorage.setItem('dashboardLayout', JSON.stringify(order));
    console.log('Layout guardado:', order);
  }

  restoreLayout() {
    const savedLayout = localStorage.getItem('dashboardLayout');
    if (!savedLayout) return;

    try {
      const order = JSON.parse(savedLayout);
      const container = document.querySelector('.stats-grid') as HTMLElement;
      if (!container) return;

      const items = Array.from(container.children);
      
      order.forEach((id: string, index: number) => {
        const item = items.find(el => el.getAttribute('data-id') === id);
        if (item) {
          container.appendChild(item);
        }
      });
      
      console.log('Layout restaurado:', order);
    } catch (error) {
      console.error('Error al restaurar layout:', error);
    }
  }

  saveQuickAccessLayout() {
    const container = document.querySelector('.quick-access-grid') as HTMLElement;
    if (!container) return;
    
    const order = Array.from(container.children).map((el) => 
      el.getAttribute('data-id')
    );
    localStorage.setItem('quickAccessLayout', JSON.stringify(order));
    console.log('Quick Access Layout guardado:', order);
  }

  restoreQuickAccessLayout() {
    const savedLayout = localStorage.getItem('quickAccessLayout');
    if (!savedLayout) return;

    try {
      const order = JSON.parse(savedLayout);
      const container = document.querySelector('.quick-access-grid') as HTMLElement;
      if (!container) return;

      const items = Array.from(container.children);
      
      order.forEach((id: string, index: number) => {
        const item = items.find(el => el.getAttribute('data-id') === id);
        if (item) {
          container.appendChild(item);
        }
      });
      
      console.log('Quick Access Layout restaurado:', order);
    } catch (error) {
      console.error('Error al restaurar quick access layout:', error);
    }
  }

  resetLayout() {
    localStorage.removeItem('dashboardLayout');
    localStorage.removeItem('quickAccessLayout');
    
    const cards = document.querySelectorAll('.stat-card, .quick-access-btn');
    gsap.to(cards, {
      scale: 0.8,
      opacity: 0,
      duration: 0.3,
      stagger: 0.05,
      ease: 'power2.in',
      onComplete: () => {
        window.location.reload();
      }
    });
  }

  loadUserData() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.username = currentUser.name;
    }
  }

  loadDashboardData() {
    this.isLoading = true;
    
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser || !currentUser.userId) {
      console.error('No se encontró el userId del usuario logueado');
      this.isLoading = false;
      return;
    }

    this.tutoradosService.getStudentsByTutorId(currentUser.userId).subscribe({
      next: (response) => {
        this.totalTutorados = response.total;
        this.isLoading = false;
        console.log('✅ Tutorados cargados:', response);
        console.log('📊 Total de tutorados:', this.totalTutorados);
      },
      error: (error) => {
        console.error('❌ Error al cargar tutorados:', error);
        this.totalTutorados = 0;
        this.isLoading = false;
      }
    });
  }

  sentTopermisos(event: Event) {
    event.preventDefault();
    this.router.navigate(['dashboard/permission']);
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  onButtonHover(event: MouseEvent, isEntering: boolean) {
    const button = event.currentTarget as HTMLElement;
    const icon = button.querySelector('.icon-container') as HTMLElement;
    
    if (isEntering) {
      gsap.to(button, {
        y: -8,
        scale: 1.02,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
        duration: 0.3,
        ease: 'power2.out'
      });
      
      gsap.to(icon, {
        rotation: 10,
        scale: 1.1,
        duration: 0.3,
        ease: 'back.out(2)'
      });
    } else {
      gsap.to(button, {
        y: 0,
        scale: 1,
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        duration: 0.3,
        ease: 'power2.out'
      });
      
      gsap.to(icon, {
        rotation: 0,
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  }
}