import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';
import { Docente, DocentesResponse } from '../../models/docente';

@Injectable({
  providedIn: 'root'
})
export class DocentesService {
  private apiUrl = `${environment.apiUrl}/api/teachers`;

  constructor(private http: HttpClient) { }

  // Obtener todos los docentes
  getAllTeachers(): Observable<DocentesResponse> {
    return this.http.get<DocentesResponse>(this.apiUrl);
  }

  // Obtener un docente por ID
  getTeacherById(id: number): Observable<Docente> {
    return this.http.get<Docente>(`${this.apiUrl}/${id}`);
  }

  // Crear un nuevo docente
  createTeacher(teacher: Partial<Docente>): Observable<Docente> {
    return this.http.post<Docente>(this.apiUrl, teacher);
  }

  // Actualizar un docente
  updateTeacher(id: number, teacher: Partial<Docente>): Observable<Docente> {
    return this.http.put<Docente>(`${this.apiUrl}/${id}`, teacher);
  }

  // Eliminar un docente
  deleteTeacher(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}