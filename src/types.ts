export type UserRole = 'owner' | 'admin' | 'manager' | 'instructor' | 'viewer';
export type UserType = 'funcionario' | 'cliente';

export interface OrganizationBrand {
  orgId: string;
  slug: string;
  shortName: string;
  name: string;
  tagline: string;
  description: string;
  logoUrl: string;
  colors: {
    primary: string;
    secondary: string;
    surface: string;
  };
  contact: {
    address: string;
    city: string;
    instagram: string;
  };
  modalities: string[];
}

export interface OrganizationLookup {
  orgId: string;
  slug: string;
  name: string;
  shortName?: string;
  active: boolean;
}

export interface AdminOrganization {
  orgId: string;
  slug: string;
  name: string;
  shortName: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminSession {
  uid: string;
  email: string;
  name: string;
}

export interface UserProfile {
  uid: string;
  orgId: string;
  username: string;
  displayName: string;
  role: UserRole;
  active: boolean;
  tipo: UserType;
}

export interface Student {
  id?: string;
  nome: string;
  telefone?: string;
  modalidade: string;
  plano?: string;
  valor?: number;
  status: 'ativo' | 'inativo' | 'suspenso';
  createdAt?: string;
}

export interface DashboardMetrics {
  activeStudents: number;
  monthlyRevenue: number;
  overduePayments: number;
  attendanceToday: number;
}

