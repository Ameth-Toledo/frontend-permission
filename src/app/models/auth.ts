export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  data: {
    token: string;
    userId: number;
    name: string;
    email: string;
  };
}

export interface User {
  userId: number;
  name: string;
  email: string;
}