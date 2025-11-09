export interface InformacionRemitente {
  userId: number;
  nombreCompleto: string;
  email: string;
}

export interface InformacionPermiso {
  permitId: number;
  matricula: string; 
  motivo: string;
  estado: string;
}

export interface Notify {
  notificationId: number;
  senderId: number;
  receiverId: number;
  tipo: string;
  mensaje: string;
  relatedPermitId: number;
  leido: boolean;
  fechaCreacion: string;
  informacionRemitente: InformacionRemitente;
  informacionPermiso?: InformacionPermiso;
}

export interface NotificationResponse {
  notifications: Notify[];
  total: number;
  unread: number;
}