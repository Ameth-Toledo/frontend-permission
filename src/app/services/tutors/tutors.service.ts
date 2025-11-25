import { Injectable } from '@angular/core';
import { environment } from '../../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { TutorsResponse, Tutor } from '../../models/tutors';

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

  getTutorById(id: number): Observable<Tutor> {
    console.log('🌐 GET request a:', `${this.apiUrl}/${id}`);
    return this.http.get<Tutor>(`${this.apiUrl}/${id}`).pipe(
      tap(response => console.log('📡 Tutor obtenido:', response))
    );
  }

  createTutor(tutorData: any): Observable<any> {
    console.log('📝 POST request a:', this.apiUrl);
    return this.http.post<any>(this.apiUrl, tutorData).pipe(
      tap(response => console.log('✅ Tutor creado:', response))
    );
  }

  updateTutor(id: number, tutorData: any): Observable<any> {
    console.log('✏️ PUT request a:', `${this.apiUrl}/${id}`);
    return this.http.put<any>(`${this.apiUrl}/${id}`, tutorData).pipe(
      tap(response => console.log('✅ Tutor actualizado:', response))
    );
  }

  updateTutorSignature(tutorId: number, signatureBase64: string, userId: number): Observable<any> {
    console.log('📝 Subiendo firma para tutor:', tutorId);

    const formData = new FormData();

    const arr = signatureBase64.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    const n = bstr.length;
    const u8arr = new Uint8Array(n);

    for (let i = 0; i < n; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }

    const blob = new Blob([u8arr], { type: mime });
    formData.append('firma', blob, 'firma.png');
    formData.append('userId', userId.toString());

    return this.http.put<any>(`${this.apiUrl}/${tutorId}`, formData).pipe(
      tap(response => console.log('✅ Firma actualizada:', response))
    );
  }

  deleteTutor(id: number): Observable<any> {
    console.log('🗑️ DELETE request a:', `${this.apiUrl}/${id}`);
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      tap(response => console.log('✅ Tutor eliminado:', response))
    );
  }
}