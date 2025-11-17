import { Component, OnInit } from '@angular/core';
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
export class PerfilTutorComponent implements OnInit {
  name: string = '';
  email: string = '';
  telefono: string = '';
  role: string = '';
  fecha_registro: string = '';
  
  userId: number = 0;
  tutorId: number = 0;
  roleId: number = 0;
  
  firstName: string = '';
  middleName: string = '';
  lastName: string = '';
  secondLastName: string = '';
  
  editingField: { [key: string]: boolean } = {};
  tempValues: { [key: string]: string } = {};
  
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private tutorsService: TutorsService,
    private usersService: UsersService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const tutorId = this.route.snapshot.params['id'];
    const tutorName = this.route.snapshot.params['name'];

    const parsedId = Number(tutorId);

    if (!isNaN(parsedId) && parsedId > 0) {
      this.loadTutorProfile(parsedId);
    } else {
      this.errorMessage = `ID de tutor inválido: "${tutorId}"`;
      this.isLoading = false;
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
    this.tempValues[field] = field === 'name' ? this.name : 
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

    const currentValue = field === 'name' ? this.name : 
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