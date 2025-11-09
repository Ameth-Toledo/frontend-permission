import { Injectable } from '@angular/core';
import { environment } from '../../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { History, HistoryListResponse, SingleHistoryResponse } from '../../models/history';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private apiUrl = `${environment.apiUrl}/api/history`;

  constructor(private http: HttpClient) { }

  // Obtener todo el historial
  getAllHistory(): Observable<HistoryListResponse> {
    return this.http.get<HistoryListResponse>(this.apiUrl);
  }

  // Obtener historial por ID
  getHistoryById(id: number): Observable<SingleHistoryResponse> {
    return this.http.get<SingleHistoryResponse>(`${this.apiUrl}/${id}`);
  }

  // Obtener historial por estudiante
  getHistoryByStudent(studentId: number): Observable<HistoryListResponse> {
    return this.http.get<HistoryListResponse>(`${this.apiUrl}/student/${studentId}`);
  }

  // Obtener historial por tutor
  getHistoryByTutor(tutorId: number): Observable<HistoryListResponse> {
    return this.http.get<HistoryListResponse>(`${this.apiUrl}/tutor/${tutorId}`);
  }

  // Actualizar estado del historial
  updateHistoryStatus(id: number, estado: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { estado });
  }

  // Crear historial
  createHistory(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}