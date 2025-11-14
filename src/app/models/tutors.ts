export interface Tutor {
  tutor_id: number;
  user_id: number;
  informacion_personal: {
    nombre_completo: string;
    email: string;
    telefono: string;
  };
  informacion_rol: {
    nombre_rol: string;
    descripcion: string;
  };
  fecha_registro: string;
}

export interface TutorsResponse {
  tutors: Tutor[];
  total: number;
}