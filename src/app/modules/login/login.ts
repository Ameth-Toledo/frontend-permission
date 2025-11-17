import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { LoginRequest } from '../../models/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit {
  credentials: LoginRequest = {
    email: '',
    password: ''
  };

  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        const redirectRoute = this.authService.getRedirectRoute(currentUser.email);
        this.router.navigate([redirectRoute]);
      }
      return;
    }

    this.route.queryParams.subscribe(params => {
      if (params['error']) {
        switch(params['error']) {
          case 'invalid_institutional_email':
            this.errorMessage = 'Debes usar una cuenta institucional (@ids.upchiapas.edu.mx)';
            break;
          case 'authentication_failed':
          case 'auth_failed':
            this.errorMessage = 'Error al autenticar con el proveedor externo';
            break;
          case 'google_auth_failed':
            this.errorMessage = 'Error al autenticar con Google';
            break;
          case 'github_auth_failed':
            this.errorMessage = 'Error al autenticar con GitHub';
            break;
          case 'no_code':
            this.errorMessage = 'No se recibió código de autorización';
            break;
          case 'no_email':
            this.errorMessage = 'No se pudo obtener el correo electrónico';
            break;
          default:
            this.errorMessage = 'Error desconocido al iniciar sesión';
        }
      }
    });
  }

  sendToRegister(event: Event) {
    event.preventDefault();
    this.router.navigate(['registro']);
  }
  
  onLogin() {
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    if (!this.credentials.email.endsWith('@ids.upchiapas.edu.mx')) {
      this.errorMessage = 'Debes usar una cuenta institucional (@ids.upchiapas.edu.mx)';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        console.log('Login exitoso', response);
        const redirectRoute = this.authService.getRedirectRoute(response.data.email);
        this.router.navigate([redirectRoute]); 
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Error al iniciar sesión';
        console.error('Error en login:', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  loginWithGoogle() {
    this.authService.loginWithGoogle();
  }

  loginWithGitHub() {
    this.authService.loginWithGitHub();
  }
}