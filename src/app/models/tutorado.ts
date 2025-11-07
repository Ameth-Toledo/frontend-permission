export interface Tutorado {
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

export interface TutoradosResponse {
  students: Tutorado[];
  total: number;
}