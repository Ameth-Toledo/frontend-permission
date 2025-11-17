import { Injectable } from '@angular/core';
import { environment } from '../../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { TutorsResponse } from '../../models/tutors';

@Injectable({
  providedIn: 'root'
})
export class TutorsService {
  private apiUrl = `${environment.apiUrl}/api/tutors`;

  constructor(private http: HttpClient) {
    console.log('🔧 TutorsService creado con URL:', this.apiUrl);
  }

  getAllTutors(): Observable<TutorsResponse> {
    console.log('🌐 GET request a:', this.apiUrl);
    return this.http.get<TutorsResponse>(this.apiUrl).pipe(
      tap(response => console.log('📡 Respuesta HTTP recibida:', response))
    );
  }

  getTutorById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}