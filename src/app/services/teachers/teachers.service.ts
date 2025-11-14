import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Teacher, TeachersResponse } from '../../models/teacher';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class TeachersService {
  private apiUrl = `${environment.apiUrl}/api/teachers`;

  constructor(private http: HttpClient) { }

  getAllTeachers(): Observable<TeachersResponse> {
    return this.http.get<TeachersResponse>(this.apiUrl);
  }

  getTeacherById(teacherId: number): Observable<Teacher> {
    return this.http.get<Teacher>(`${this.apiUrl}/${teacherId}`);
  }

  createTeacher(teacher: Partial<Teacher>): Observable<Teacher> {
    return this.http.post<Teacher>(this.apiUrl, teacher);
  }

  updateTeacher(teacherId: number, teacher: Partial<Teacher>): Observable<Teacher> {
    return this.http.put<Teacher>(`${this.apiUrl}/${teacherId}`, teacher);
  }

  deleteTeacher(teacherId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${teacherId}`);
  }
}