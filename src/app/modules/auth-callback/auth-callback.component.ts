import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B5A85] mx-auto mb-4"></div>
        <p class="text-gray-600 text-lg">Autenticando...</p>
      </div>
    </div>
  `,
  styles: []
})
export class AuthCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const userId = params['userId'];
      const name = params['name'];
      const email = params['email'];

      if (token && userId && name && email) {
        // Guardar datos de autenticación
        this.authService.saveAuthDataFromOAuth({
          token,
          userId: parseInt(userId),
          name: decodeURIComponent(name),
          email: decodeURIComponent(email)
        });

        // 👇 Forzar recarga completa de la página
        window.location.href = '/dashboard/welcome';
      } else {
        // Si no hay token, redirigir al login con error
        console.error('Error: No se recibieron los datos de autenticación');
        this.router.navigate(['/'], { 
          queryParams: { error: 'authentication_failed' } 
        });
      }
    });
  }
}