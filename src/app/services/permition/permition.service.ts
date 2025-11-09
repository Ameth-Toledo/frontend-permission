import { Injectable } from '@angular/core';
import { environment } from '../../../environment/environment';
import { Permition, PermitionsResponse } from '../../models/permition';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PermitionService {
  private apiUrl = `${environment.apiUrl}/api/permits`;

  constructor(private http: HttpClient) { }

  // Obtener todos los permisos
  getAllPermits(): Observable<PermitionsResponse> {
    return this.http.get<PermitionsResponse>(this.apiUrl);
  }

  // Obtener permisos por tutor ID
  getPermitsByTutor(tutorId: number): Observable<PermitionsResponse> {
    const params = new HttpParams().set('tutorId', tutorId.toString());
    return this.http.get<PermitionsResponse>(this.apiUrl, { params });
  }

  // Obtener permisos por estudiante ID
  getPermitsByStudent(studentId: number): Observable<PermitionsResponse> {
    const params = new HttpParams().set('studentId', studentId.toString());
    return this.http.get<PermitionsResponse>(this.apiUrl, { params });
  }

  // Obtener permisos por profesor ID
  getPermitsByTeacher(teacherId: number): Observable<PermitionsResponse> {
    const params = new HttpParams().set('teacherId', teacherId.toString());
    return this.http.get<PermitionsResponse>(this.apiUrl, { params });
  }

  // Obtener permiso por ID
  getPermitById(id: number): Observable<Permition> {
    return this.http.get<Permition>(`${this.apiUrl}/${id}`);
  }

  // Crear permiso
  createPermit(formData: FormData): Observable<Permition> {
    return this.http.post<Permition>(this.apiUrl, formData);
  }

  // Actualizar permiso
  updatePermit(id: number, data: Partial<Permition>): Observable<Permition> {
    return this.http.put<Permition>(`${this.apiUrl}/${id}`, data);
  }

  // Eliminar permiso
  deletePermit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Actualizar estado del permiso
  updatePermitStatus(id: number, status: 'approved' | 'rejected'): Observable<Permition> {
    const formData = new FormData();
    formData.append('status', status);
    return this.http.put<Permition>(`${this.apiUrl}/${id}`, formData);
  }
}
