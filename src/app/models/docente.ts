export interface InformacionPersonalDocente {
  nombreCompleto: string;
  email: string;
  telefono: string;
}

export interface InformacionRol {
  nombreRol: string;
  descripcion: string;
}

export interface Docente {
  teacherId: number;
  userId: number;
  informacionPersonal: InformacionPersonalDocente;
  informacionRol: InformacionRol;
  fechaRegistro: string;
}

export interface DocentesResponse {
  teachers: Docente[];
  total: number;
}