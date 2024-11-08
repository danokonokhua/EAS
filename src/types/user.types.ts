export type UserRole = 'PATIENT' | 'DRIVER' | 'HOSPITAL_ADMIN' | 'SYSTEM_ADMIN';

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}
