export interface PermitInfo {
  permitId: number;
  descripcion: string;
  evidencia: string;
  permitDocumentUrl: string;
  cuatrimestre: number;
}

export interface StudentInfo {
  studentId: number;
  matricula: string;
  nombreCompleto: string;
  email: string;
}

export interface History {
  historyId: number;
  permitId: number;
  studentId: number;
  fechaInicio: string;
  fechaFin: string;
  motivo: string;
  estado: string;
  fechaSolicitud: string;
  informacionPermiso: PermitInfo;
  permitDocumentUrl: string;
  informacionEstudiante: StudentInfo;
}

export interface HistoryListResponse {
  histories: History[];
  total: number;
}

export interface SingleHistoryResponse {
  history: History;
}