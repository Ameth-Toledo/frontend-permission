export interface User {
  userId?: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  secondLastName?: string;
  email: string;
  phone?: string | null; 
  password?: string; 
  registrationDate?: string;
  roleId: number;
  oauthProvider?: string | null; // 'google' | 'github' | null
  oauthId?: string | null;
}

export interface RegisterRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  secondLastName?: string;
  email: string;
  phone?: string; 
  password?: string; 
  roleId?: number;
}

export interface RegisterResponse {
  message: string;
  data: {
    userId: number;
    email: string;
    name: string;
  };
}