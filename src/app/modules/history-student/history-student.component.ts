import { Component, OnInit } from '@angular/core';
import { HeaderStudentComponent } from "../../components/header-student/header-student.component";
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TitleService } from '../../services/title/title.service';
import { HistoryService } from '../../services/history/history.service';
import { AuthService } from '../../services/auth/auth.service';
import { History } from '../../models/history';

@Component({
  selector: 'app-history-student',
  standalone: true,
  imports: [HeaderStudentComponent, CommonModule],
  templateUrl: './history-student.component.html',
  styleUrl: './history-student.component.css'
})
export class HistoryStudentComponent implements OnInit {
  histories: History[] = [];
  historiesFiltered: History[] = [];
  historiesToShow: History[] = []; // Historias de la página actual
  total: number = 0;
  isLoading: boolean = true;
  errorMessage: string = '';
  currentFilter: string = 'all';

  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  Math = Math;

  statusFilters = [
    { label: 'Todos', value: 'all' },
    { label: 'Aprobados', value: 'approved' },
    { label: 'Rechazados', value: 'rejected' },
    { label: 'Pendientes', value: 'pending' }
  ];

  constructor(
    private titleService: TitleService,
    private historyService: HistoryService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.titleService.setTitle('Historial de Permisos');
    this.loadHistories();
  }

  loadHistories() {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      this.errorMessage = 'No hay usuario autenticado';
      this.isLoading = false;
      this.router.navigate(['/login']);
      return;
    }

    if (!currentUser.studentId) {
      this.errorMessage = 'El usuario no tiene un studentId asignado. Por favor, cierra sesión y vuelve a iniciar sesión.';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    this.historyService.getHistoryByStudent(currentUser.studentId).subscribe({
      next: (response) => {
        this.histories = response.histories;
        this.total = response.total;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar historial:', error);
        this.errorMessage = 'Error al cargar el historial. Por favor, intenta de nuevo.';
        this.isLoading = false;
      }
    });
  }

  filterByStatus(status: string) {
    this.currentFilter = status;
    this.currentPage = 1; // Reiniciar a la primera página al cambiar filtro
    this.applyFilter();
  }

  applyFilter() {
    if (this.currentFilter === 'all') {
      this.historiesFiltered = this.histories;
    } else {
      this.historiesFiltered = this.histories.filter(history => {
        const estadoNormalizado = history.estado.toLowerCase().trim();
        return estadoNormalizado === this.currentFilter;
      });
    }
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.historiesFiltered.length / this.itemsPerPage);
    
    // Asegurar que currentPage no exceda totalPages
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
    
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.historiesToShow = this.historiesFiltered.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5; // Mostrar máximo 5 números de página
    
    if (this.totalPages <= maxPagesToShow) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar páginas alrededor de la página actual
      let startPage = Math.max(1, this.currentPage - 2);
      let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
      
      if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  getCountByStatus(status: string): number {
    if (status === 'all') {
      return this.histories.length;
    }
    return this.histories.filter(history => {
      const estadoNormalizado = history.estado.toLowerCase().trim();
      return estadoNormalizado === status;
    }).length;
  }

  getFilterButtonClass(status: string): string {
    const baseClasses = 'px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200';
    
    if (this.currentFilter === status) {
      return `${baseClasses} bg-blue-600 text-white shadow-lg transform scale-105`;
    }
    return `${baseClasses} bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-blue-300`;
  }

  getFilterLabel(): string {
    const filter = this.statusFilters.find(f => f.value === this.currentFilter);
    return filter ? filter.label : 'Todos';
  }

  verEvidencia(evidenciaUrl: string) {
    if (evidenciaUrl) {
      window.open(evidenciaUrl, '_blank');
    }
  }

  getStatusClass(status: string): string {
    switch(status.toLowerCase().trim()) {
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
    switch(status.toLowerCase().trim()) {
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

  refreshHistory() {
    this.currentPage = 1;
    this.loadHistories();
  }
}