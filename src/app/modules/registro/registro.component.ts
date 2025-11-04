import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { UsersService } from '../../services/users/users.service';
import { RegisterRequest } from '../../models/user';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  userData: RegisterRequest = {
    firstName: '',
    middleName: '',
    lastName: '',
    secondLastName: '',
    email: '',
    phone: '',
    password: '',
    roleId: 0
  };

  confirmPassword: string = '';
  isPasswordVisible: boolean = false;
  isConfirmPasswordVisible: boolean = false;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private usersService: UsersService
  ) {}

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
  }

  sentToLogin(event: Event) {
    event.preventDefault();
    this.router.navigate(['']);
  }

  onRegister() {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.usersService.register(this.userData).subscribe({
      next: (response) => {
        console.log('Registro exitoso', response);
        alert('Registro exitoso. Ahora puedes iniciar sesión.');
        this.router.navigate(['']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.error || error.error?.message || 'Error al registrarse';
        console.error('Error en registro:', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  validateForm(): boolean {
    if (!this.userData.firstName || !this.userData.lastName || 
        !this.userData.email || !this.userData.phone || !this.userData.password) {
      this.errorMessage = 'Por favor completa todos los campos obligatorios';
      return false;
    }

    if (!this.userData.email.endsWith('@ids.upchiapas.edu.mx')) {
      this.errorMessage = 'Debes usar una cuenta institucional (@ids.upchiapas.edu.mx)';
      return false;
    }

    if (this.userData.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return false;
    }

    if (this.userData.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return false;
    }

    return true;
  }

  loginWithGoogle() {
    this.authService.loginWithGoogle();
  }

  loginWithGitHub() {
    this.authService.loginWithGitHub();
  }
}