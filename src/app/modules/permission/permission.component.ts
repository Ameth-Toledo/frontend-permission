import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TitleService } from '../../services/title/title.service';
import { PermitionService } from '../../services/permition/permition.service';
import { AuthService } from '../../services/auth/auth.service';
import { Permition } from '../../models/permition';

@Component({
  selector: 'app-permission',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './permission.component.html',
  styleUrl: './permission.component.css'
})
export class PermissionComponent implements OnInit {
  permisos: Permition[] = [];
  permisosFiltered: Permition[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  currentFilter: string = 'all';
  tutorId: number | null = null;

  statusFilters = [
    { label: 'Todos', value: 'all' },
    { label: 'Pendientes', value: 'pending' },
    { label: 'Aprobados', value: 'approved' },
    { label: 'Rechazados', value: 'rejected' }
  ];

  constructor(
    private titleService: TitleService,
    private permitionService: PermitionService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.titleService.setTitle('Mis Permisos');
    this.loadTutorPermits();
  }

  loadTutorPermits() {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      this.errorMessage = 'No hay usuario autenticado';
      this.isLoading = false;
      this.router.navigate(['login']);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.permitionService.getAllPermits().subscribe({
      next: (response) => {
        this.permisos = response.permits.filter(
          permiso => permiso.tutor.userId === currentUser.userId
        );
        
        if (this.permisos.length > 0) {
          this.tutorId = this.permisos[0].tutor.tutorId;
        }

        this.applyFilter();
        this.isLoading = false;
        console.log('Permisos del tutor cargados:', this.permisos);
      },
      error: (error) => {
        console.error('Error al cargar permisos:', error);
        this.errorMessage = 'Error al cargar los permisos. Por favor, intenta de nuevo.';
        this.isLoading = false;
      }
    });
  }

  filterByStatus(status: string) {
    this.currentFilter = status;
    this.applyFilter();
  }

  applyFilter() {
    if (this.currentFilter === 'all') {
      this.permisosFiltered = this.permisos;
    } else {
      this.permisosFiltered = this.permisos.filter(
        permiso => permiso.status.toLowerCase() === this.currentFilter
      );
    }
  }

  getCountByStatus(status: string): number {
    if (status === 'all') {
      return this.permisos.length;
    }
    return this.permisos.filter(
      permiso => permiso.status.toLowerCase() === status
    ).length;
  }

  getCurrentFilterLabel(): string {
    const filter = this.statusFilters.find(f => f.value === this.currentFilter);
    return filter ? filter.label : 'Todos';
  }

  getFilterButtonClass(status: string): string {
    const baseClasses = 'px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200';
    
    if (this.currentFilter === status) {
      return `${baseClasses} bg-blue-600 text-white shadow-lg transform scale-105`;
    }
    return `${baseClasses} bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-blue-300`;
  }

  
  viewPermitDetail(permiso: Permition) {
    this.router.navigate(['dashboard/permition/detail', permiso.estudiante.numeroMatricula, permiso.permitId]);
  }

  deletePermit(permitId: number, event: Event) {
    event.stopPropagation();
    
    if (confirm('¿Estás seguro de que deseas eliminar este permiso?')) {
      this.permitionService.deletePermit(permitId).subscribe({
        next: () => {
          this.permisos = this.permisos.filter(p => p.permitId !== permitId);
          this.applyFilter();
          alert('Permiso eliminado exitosamente');
        },
        error: (error) => {
          console.error('Error al eliminar permiso:', error);
          alert('Error al eliminar el permiso');
        }
      });
    }
  }

  getStatusClass(status: string): string {
    switch(status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusText(status: string): string {
    switch(status.toLowerCase()) {
      case 'approved':
        return 'Aprobado';
      case 'pending':
        return 'Pendiente';
      case 'rejected':
        return 'Rechazado';
      default:
        return status;
    }
  }

  refreshPermits() {
    this.loadTutorPermits();
  }
}