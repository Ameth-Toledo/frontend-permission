import { Injectable } from '@angular/core';
import { environment } from '../../../environment/environment';
import { 
  Permition, 
  PermitionsResponse, 
  UpdatePermitDocumentUrlRequest, 
  MessageResponse 
} from '../../models/permition';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PermitionService {
  private apiUrl = `${environment.apiUrl}/api/permits`;

  constructor(private http: HttpClient) { }

  getAllPermits(): Observable<PermitionsResponse> {
    return this.http.get<PermitionsResponse>(this.apiUrl);
  }

  getPermitsByTutor(tutorId: number): Observable<PermitionsResponse> {
    const params = new HttpParams().set('tutorId', tutorId.toString());
    return this.http.get<PermitionsResponse>(this.apiUrl, { params });
  }

  getPermitsByStudent(studentId: number): Observable<PermitionsResponse> {
    const params = new HttpParams().set('studentId', studentId.toString());
    return this.http.get<PermitionsResponse>(this.apiUrl, { params });
  }

  getPermitsByTeacher(teacherId: number): Observable<PermitionsResponse> {
    const params = new HttpParams().set('teacherId', teacherId.toString());
    return this.http.get<PermitionsResponse>(this.apiUrl, { params });
  }

  getPermitById(id: number): Observable<{ permit: Permition }> {
    return this.http.get<{ permit: Permition }>(`${this.apiUrl}/${id}`);
  }

  createPermit(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }

  updatePermit(id: number, data: Partial<Permition>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deletePermit(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updatePermitStatus(id: number, status: 'approved' | 'rejected'): Observable<any> {
    const formData = new FormData();
    formData.append('status', status);
    return this.http.put(`${this.apiUrl}/${id}`, formData);
  }

  updatePermitDocumentUrl(permitId: number, documentUrl: string): Observable<MessageResponse> {
    const body: UpdatePermitDocumentUrlRequest = {
      permitDocumentUrl: documentUrl
    };
    return this.http.put<MessageResponse>(`${this.apiUrl}/${permitId}/document-url`, body);
  }

  // Generar documento desde el backend
  generatePermitDocument(permitId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${permitId}/generate-document`, {});
  }
}