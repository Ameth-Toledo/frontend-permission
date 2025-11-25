import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environment/environment';
import { LoginRequest, LoginResponse, User } from '../../models/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;
  private tokenKey = 'auth_token';
  private userKey = 'user_data';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  private signatureRequiredSubject = new BehaviorSubject<boolean>(false);
  public signatureRequired$ = this.signatureRequiredSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.saveAuthData(response.data);
      })
    );
  }

  loginWithGoogle(): void {
    window.location.href = `${this.apiUrl}/google`;
  }

  loginWithGitHub(): void {
    window.location.href = `${this.apiUrl}/github`;
  }

  saveAuthDataFromOAuth(data: {
    token: string;
    userId: number;
    tutorId?: number;
    studentId?: number;
    roleId: number;
    name: string;
    email: string
  }): void {
    this.saveAuthData(data);
  }

  private saveAuthData(data: {
    token: string;
    userId: number;
    tutorId?: number;
    studentId?: number;
    roleId: number;
    name: string;
    email: string
  }): void {
    localStorage.setItem(this.tokenKey, data.token);

    const user: User = {
      userId: data.userId,
      tutorId: data.tutorId,
      studentId: data.studentId,
      roleId: data.roleId,
      name: data.name,
      email: data.email
    };

    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUserSubject.next(user);

    console.log('Usuario guardado:', user);
  }

  setSignatureRequired(required: boolean): void {
    this.signatureRequiredSubject.next(required);
  }

  isSignatureRequired(): boolean {
    return this.signatureRequiredSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private getUserFromStorage(): User | null {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getRedirectRoute(email: string): string {
    const emailPrefix = email.split('@')[0];
    const firstChar = emailPrefix.charAt(0);

    if (/^\d/.test(firstChar)) {
      return '/student';
    } else {
      return '/dashboard/welcome';
    }
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    this.signatureRequiredSubject.next(false);
    this.router.navigate(['']);
  }
}