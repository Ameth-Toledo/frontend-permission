import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';
import { Tutorado, TutoradosResponse } from '../../models/tutorado';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class TutoradosService {
  private apiUrl = `${environment.apiUrl}/api/students`;
  
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllStudents(): Observable<TutoradosResponse> {
    return this.http.get<TutoradosResponse>(this.apiUrl, {
      headers: this.getHeaders()
    });
  }

  getStudentById(id: number): Observable<Tutorado> {
    return this.http.get<Tutorado>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  searchStudents(query: string): Observable<TutoradosResponse> {
    return this.http.get<TutoradosResponse>(`${this.apiUrl}/search?q=${query}`, {
      headers: this.getHeaders()
    });
  }

  // Obtiene los tutorados de un tutor específico
  getStudentsByTutorId(tutorId: number): Observable<TutoradosResponse> {
    return this.http.get<TutoradosResponse>(`${this.apiUrl}/tutor/${tutorId}`, {
      headers: this.getHeaders()
    });
  }
}