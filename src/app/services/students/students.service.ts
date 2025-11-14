import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';

// ✅ Interface que coincide con la respuesta del backend de Kotlin
export interface Student {
  studentId: number;
  matricula: string;
  telefonoTutorFamiliar: string | null;
  userId: number;
  tutorId: number | null;
  informacionPersonal: {
    nombreCompleto: string;
    email: string;
    telefono: string | null;
  };
  informacionRol: {
    nombreRol: string;
    descripcion: string;
  };
  fechaRegistro: string;
}

export interface UpdateStudentData {
  enrollmentNumber?: string;
  familyTutorPhone?: string;
  tutorId?: number;
  phone?: string;
}

export interface StudentResponse {
  student: Student;
}

@Injectable({
  providedIn: 'root'
})
export class StudentsService {
  private apiUrl = `${environment.apiUrl}/api/students`;

  constructor(private http: HttpClient) {}

  getStudentByUserId(userId: number): Observable<StudentResponse> {
    return this.http.get<StudentResponse>(`${this.apiUrl}/user/${userId}`);
  }

  getStudentById(studentId: number): Observable<StudentResponse> {
    return this.http.get<StudentResponse>(`${this.apiUrl}/${studentId}`);
  }

  updateStudent(studentId: number, data: UpdateStudentData): Observable<any> {
    // Mapear campos de Angular a Kotlin
    const kotlinData: any = {};
    
    if (data.enrollmentNumber !== undefined) {
      kotlinData.matricula = data.enrollmentNumber;
    }
    if (data.familyTutorPhone !== undefined) {
      kotlinData.telefonoTutorFamiliar = data.familyTutorPhone;
    }
    if (data.tutorId !== undefined) {
      kotlinData.tutorId = data.tutorId;
    }
    
    console.log('📤 Enviando al backend:', kotlinData);
    return this.http.put(`${this.apiUrl}/${studentId}`, kotlinData);
  }

  // ✅ MÉTODO CORREGIDO - Valida con la estructura correcta
  isProfileComplete(student: Student): { complete: boolean; missingFields: string[] } {
    const missingFields: string[] = [];

    console.log('🔍 Validando perfil del estudiante:', student);

    // Validar matrícula (string vacío, null o undefined)
    if (!student.matricula || student.matricula.trim() === '') {
      console.log('❌ Falta: matricula');
      missingFields.push('enrollmentNumber');
    }

    // Validar teléfono personal desde informacionPersonal
    if (!student.informacionPersonal?.telefono || student.informacionPersonal.telefono.trim() === '') {
      console.log('❌ Falta: telefono personal');
      missingFields.push('phone');
    }

    // Validar teléfono tutor familiar
    if (!student.telefonoTutorFamiliar) {
      console.log('❌ Falta: telefono tutor familiar');
      missingFields.push('familyTutorPhone');
    }

    // ✅ Validar tutorId (null, undefined o 0)
    if (!student.tutorId || student.tutorId === null || student.tutorId === 0) {
      console.log('❌ Falta: tutorId');
      missingFields.push('tutorId');
    }

    console.log('📋 Campos faltantes detectados:', missingFields);

    return {
      complete: missingFields.length === 0,
      missingFields
    };
  }
}