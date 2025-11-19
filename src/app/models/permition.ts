export interface Estudiante {
  studentId: number;
  userId: number;
  nombreCompleto: string;
  email: string;
  telefono: string;
  numeroMatricula: string | null;
}

export interface Tutor {
  tutorId: number;
  userId: number;
  nombreCompleto: string;
  email: string;
  telefono: string;
}

export interface Profesor {
  teacherId: number;
  userId: number;
  nombreCompleto: string;
  email: string;
  telefono: string;
}

export interface Permition {
  permitId: number;
  estudiante: Estudiante;
  tutor: Tutor;
  profesores: Profesor[];
  startDate: string;
  endDate: string;
  reason: string;
  description: string;
  cuatrimestre: number;
  evidence: string;
  status: string;
  requestDate: string;
  permitDocumentUrl: string | null;
}

export interface PermitionsResponse {
  permits: Permition[];
  total: number;
}

export interface UpdatePermitDocumentUrlRequest {
  permitDocumentUrl: string;
}

export interface MessageResponse {
  message: string;
}