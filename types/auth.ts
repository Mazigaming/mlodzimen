export type UserRole = 'student' | 'mentor';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSession {
  user: User;
  expires: string;
}
