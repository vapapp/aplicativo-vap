export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  profession?: string;
  profile?: 'pai' | 'mae' | 'cuidador';
  points: number;
  level: UserLevel;
  createdAt: string;
  updatedAt: string;
}

export enum UserLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export interface Child {
  id: string;
  userId: string;
  name: string;
  birthDate: string;
  weight: number;
  height: number;
  allergies?: string[];
  observations?: string;
  createdAt: string;
  updatedAt: string;
}