import { Component, OnInit } from '@angular/core';
import { HeaderStudentComponent } from "../../components/header-student/header-student.component";
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TitleService } from '../../services/title/title.service';
import { PermitionService } from '../../services/permition/permition.service';
import { AuthService } from '../../services/auth/auth.service';
import { Permition } from '../../models/permition';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-permits-student',
  standalone: true,
  imports: [HeaderStudentComponent, CommonModule, FormsModule],
  templateUrl: './permits-student.component.html',
  styleUrl: './permits-student.component.css'
})
export class PermitsStudentComponent implements OnInit {
  approvedPermits: Permition[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private titleService: TitleService,
    private permitionService: PermitionService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.titleService.setTitle('Mis Permisos Aprobados');
    this.loadApprovedPermits();
  }

  loadApprovedPermits() {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.errorMessage = 'No hay usuario autenticado';
      this.isLoading = false;
      this.router.navigate(['/login']);
      return;
    }

    if (!currentUser.studentId) {
      this.errorMessage = 'El usuario no tiene un studentId asignado';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.permitionService.getPermitsByStudent(currentUser.studentId).subscribe({
      next: (response) => {
        this.approvedPermits = response.permits.filter(
          permit => permit.status.toLowerCase().trim() === 'approved'
        );
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar permisos:', error);
        this.errorMessage = 'Error al cargar los permisos. Por favor, intenta de nuevo.';
        this.isLoading = false;
      }
    });
  }

  verPermisoPDF(pdfUrl: string) {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  }

  descargarPermiso(pdfUrl: string, permitId: number) {
    if (!pdfUrl) return;

    const urlMatch = pdfUrl.match(/file=([^&]+)/);
    const realPdfUrl = urlMatch ? decodeURIComponent(urlMatch[1]) : pdfUrl;

    const link = document.createElement('a');
    link.href = realPdfUrl;
    link.download = `Permiso_${permitId}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  verEvidencia(evidenciaUrl: string) {
    if (evidenciaUrl) {
      window.open(evidenciaUrl, '_blank');
    }
  }

  refreshPermits() {
    this.loadApprovedPermits();
  }

  irAHistorial() {
    this.router.navigate(['/student/history']);
  }
  currentPage: number = 1;
  itemsPerPage: number = 10;
  Math = Math; 

  get paginatedPermits() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.approvedPermits.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.approvedPermits.length / this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.scrollToTop();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.scrollToTop();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.scrollToTop();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const leftBound = Math.max(1, this.currentPage - 2);
      const rightBound = Math.min(this.totalPages, this.currentPage + 2);

      for (let i = leftBound; i <= rightBound; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}