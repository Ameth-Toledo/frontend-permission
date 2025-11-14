export interface Teacher {
  teacherId: number;
  userId: number;
  informacionPersonal: {
    nombreCompleto: string;
    email: string;
    telefono: string | null;
  };
  informacionRol: {
    nombreRol: string;
    descripcion: string | null;
  };
  fechaRegistro: string;
}

export interface TeachersResponse {
  teachers: Teacher[];
  total: number;
}