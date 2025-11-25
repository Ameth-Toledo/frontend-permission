import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TutorsService } from '../../services/tutors/tutors.service';
import { UsersService } from '../../services/users/users.service';
import { AuthService } from '../../services/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-perfil-tutor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil-tutor.component.html',
  styleUrl: './perfil-tutor.component.css'
})
export class PerfilTutorComponent implements OnInit, AfterViewInit {
  @ViewChild('signatureCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  name: string = '';
  email: string = '';
  telefono: string = '';
  role: string = '';
  fecha_registro: string = '';
  firmaUrl: string = '';

  userId: number = 0;
  tutorId: number = 0;
  roleId: number = 0;

  firstName: string = '';
  middleName: string = '';
  lastName: string = '';
  secondLastName: string = '';

  editingField: { [key: string]: boolean } = {};
  tempValues: { [key: string]: string } = {};

  showSignatureModal: boolean = false;
  isDrawing: boolean = false;
  isCanvasEmpty: boolean = true;
  isLoadingSignature: boolean = false;
  signatureErrorMessage: string = '';
  signatureSuccessMessage: string = '';

  isLoading: boolean = true;
  errorMessage: string = '';

  private context: CanvasRenderingContext2D | null = null;

  constructor(
    private tutorsService: TutorsService,
    private usersService: UsersService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const tutorId = this.route.snapshot.params['id'];
    const parsedId = Number(tutorId);

    if (!isNaN(parsedId) && parsedId > 0) {
      this.loadTutorProfile(parsedId);
    } else {
      this.errorMessage = `ID de tutor inválido: "${tutorId}"`;
      this.isLoading = false;
    }
  }

  ngAfterViewInit(): void {
    if (this.showSignatureModal) {
      this.initCanvas();
    }
  }

  loadTutorProfile(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.tutorsService.getTutorById(id).subscribe({
      next: (response) => {
        this.tutorId = response.tutor_id;
        this.userId = response.user_id;
        this.name = response.informacion_personal.nombre_completo;
        this.email = response.informacion_personal.email;
        this.telefono = response.informacion_personal.telefono;
        this.role = response.informacion_rol.nombre_rol;
        this.firmaUrl = response.firma_url || '';

        const fecha = new Date(response.fecha_registro);
        this.fecha_registro = fecha.toLocaleString('es-MX', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });

        const nameParts = this.name.split(' ').filter(part => part.trim() !== '');
        this.firstName = nameParts[0] || '';
        this.middleName = nameParts[1] || '';
        this.lastName = nameParts[2] || '';
        this.secondLastName = nameParts[3] || '';

        this.loadUserData();
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar el perfil del tutor';
        this.isLoading = false;
      }
    });
  }

  loadUserData(): void {
    const currentUser = this.authService.getCurrentUser();

    if (currentUser && currentUser.userId === this.userId) {
      this.roleId = 1;
      this.isLoading = false;
      return;
    }

    this.usersService.getUserById(this.userId).subscribe({
      next: (user) => {
        const userData = Array.isArray(user) ? user[0] : user;

        if (userData.firstName) {
          this.firstName = userData.firstName;
          this.middleName = userData.middleName || '';
          this.lastName = userData.lastName;
          this.secondLastName = userData.secondLastName || '';
        }

        if (userData.roleId) {
          this.roleId = userData.roleId;
        } else {
          this.roleId = 1;
        }

        this.isLoading = false;
      },
      error: (error) => {
        this.roleId = 1;
        this.isLoading = false;
      }
    });
  }

  startEdit(field: string): void {
    if (!this.firstName || !this.lastName) {
      return;
    }

    if (!this.roleId || this.roleId === 0) {
      this.roleId = 1;
    }

    this.editingField[field] = true;
    this.tempValues[field] = 
      field === 'name' ? this.name :
      field === 'email' ? this.email :
      field === 'phone' ? this.telefono : '';
  }

  cancelEdit(field: string): void {
    this.editingField[field] = false;
    delete this.tempValues[field];
  }

  saveEdit(field: string): void {
    const newValue = this.tempValues[field]?.trim();

    if (!newValue || newValue === '') {
      this.cancelEdit(field);
      return;
    }

    const currentValue = 
      field === 'name' ? this.name :
      field === 'email' ? this.email :
      field === 'phone' ? this.telefono : '';

    if (newValue === currentValue) {
      this.cancelEdit(field);
      return;
    }

    this.updateUserData(field, newValue);
  }

  updateUserData(field: string, value: string): void {
    let updateData: any = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      roleId: this.roleId
    };

    if (this.middleName) {
      updateData.middleName = this.middleName;
    }

    if (this.secondLastName) {
      updateData.secondLastName = this.secondLastName;
    }

    if (this.telefono) {
      updateData.phone = this.telefono;
    }

    if (field === 'name') {
      const nameParts = value.split(' ').filter(part => part.trim() !== '');
      updateData.firstName = nameParts[0] || this.firstName;
      updateData.lastName = nameParts[2] || nameParts[1] || this.lastName;

      if (nameParts[1] && nameParts[2]) {
        updateData.middleName = nameParts[1];
      } else {
        updateData.middleName = null;
      }

      if (nameParts[3]) {
        updateData.secondLastName = nameParts[3];
      } else {
        updateData.secondLastName = null;
      }
    } else if (field === 'email') {
      updateData.email = value;
    } else if (field === 'phone') {
      updateData.phone = value;
    }

    this.usersService.updateUser(this.userId, updateData).subscribe({
      next: (response) => {
        if (field === 'name') {
          this.name = value;
          this.firstName = updateData.firstName;
          this.middleName = updateData.middleName || '';
          this.lastName = updateData.lastName;
          this.secondLastName = updateData.secondLastName || '';
        }
        if (field === 'email') this.email = value;
        if (field === 'phone') this.telefono = value;

        this.cancelEdit(field);
      },
      error: (error) => {
        this.errorMessage = 'Error al actualizar la información';
        this.cancelEdit(field);
      }
    });
  }

  openSignatureModal(): void {
    this.showSignatureModal = true;
    this.clearSignature();
    
    setTimeout(() => {
      this.initCanvas();
    }, 100);
  }

  closeSignatureModal(): void {
    if (!this.isCanvasEmpty && !confirm('¿Estás seguro? Se perderá tu firma si no la guardaste.')) {
      return;
    }
    this.showSignatureModal = false;
    this.clearSignature();
  }

  private initCanvas(): void {
    if (!this.canvasRef) return;

    const canvas = this.canvasRef.nativeElement;
    this.context = canvas.getContext('2d');

    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = 250;
    }

    if (this.context) {
      this.context.strokeStyle = '#1B5A85';
      this.context.lineWidth = 2;
      this.context.lineCap = 'round';
      this.context.lineJoin = 'round';
    }
  }

  startDrawing(event: MouseEvent): void {
    if (!this.context) return;

    this.isDrawing = true;
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.context.beginPath();
    this.context.moveTo(x, y);
  }

  draw(event: MouseEvent): void {
    if (!this.isDrawing || !this.context) return;

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.context.lineTo(x, y);
    this.context.stroke();

    this.isCanvasEmpty = false;
  }

  stopDrawing(): void {
    if (this.context) {
      this.context.closePath();
    }
    this.isDrawing = false;
  }

  clearSignature(): void {
    if (!this.context) return;

    const canvas = this.canvasRef.nativeElement;
    this.context.clearRect(0, 0, canvas.width, canvas.height);
    this.isCanvasEmpty = true;
    this.signatureErrorMessage = '';
    this.signatureSuccessMessage = '';
  }

  saveSignature(): void {
  if (this.isCanvasEmpty) {
    this.signatureErrorMessage = '⚠️ Por favor, dibuja tu firma antes de guardar';
    return;
  }

  this.isLoadingSignature = true;
  this.signatureErrorMessage = '';
  this.signatureSuccessMessage = '';

  const signatureData = this.canvasRef.nativeElement.toDataURL('image/png');

  this.tutorsService.updateTutorSignature(this.tutorId, signatureData, this.userId).subscribe({
    next: (response) => {
      this.isLoadingSignature = false;
      this.signatureSuccessMessage = '✅ ¡Firma guardada correctamente!';
      this.firmaUrl = response.firma_url || signatureData;

      setTimeout(() => {
        this.closeSignatureModal();
      }, 2000);
    },
    error: (error) => {
      this.isLoadingSignature = false;
      this.signatureErrorMessage = error.error?.message || '❌ Error al guardar la firma. Intenta nuevamente.';
      console.error('❌ Error al guardar firma:', error);
    }
  });
}

  deleteAccount(): void {
    const confirmation = confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.');

    if (confirmation) {
      this.usersService.deleteUser(this.userId).subscribe({
        next: () => {
          this.authService.logout();
        },
        error: (error) => {
          this.errorMessage = 'Error al eliminar la cuenta';
        }
      });
    }
  }
}