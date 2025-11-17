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
      const tutorId = params['tutorId'];      // ← NUEVO
      const studentId = params['studentId'];  // ← NUEVO
      const roleId = params['roleId'];        // ← NUEVO
      const name = params['name'];
      const email = params['email'];

      if (token && userId && roleId && name && email) {
        const decodedEmail = decodeURIComponent(email);
        
        this.authService.saveAuthDataFromOAuth({
          token,
          userId: parseInt(userId),
          tutorId: tutorId ? parseInt(tutorId) : undefined,      // ← NUEVO
          studentId: studentId ? parseInt(studentId) : undefined, // ← NUEVO
          roleId: parseInt(roleId),                               // ← NUEVO
          name: decodeURIComponent(name),
          email: decodedEmail
        });

        const redirectRoute = this.authService.getRedirectRoute(decodedEmail);

        window.location.href = redirectRoute;
      } else {
        console.error('Error: No se recibieron los datos de autenticación');
        console.error('Datos recibidos:', { token, userId, roleId, tutorId, studentId, name, email });
        this.router.navigate(['/'], { 
          queryParams: { error: 'authentication_failed' } 
        });
      }
    });
  }
}