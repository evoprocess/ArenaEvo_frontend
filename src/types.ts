export type UserRole = 'gerente' | 'supervisor' | 'cliente';
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
  turmas: string[];
  alunoId?: string;
}

export interface Student {
  id?: string;
  nome: string;
  observacao?: string;
  telefone: string;
  modalidade: string;
  turmas: string[];
  horario: string;
  dataMatricula: string;
  plano: 'mensal' | 'trimestral' | 'semestral';
  valor: number;
  vencimento: number;
  status: 'ativo' | 'inativo' | 'suspenso';
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  id?: string;
  alunoId: string;
  alunoNome: string;
  modalidade: string;
  valor: number;
  vencimento: string;
  pago: boolean;
  dataPagamento?: string | null;
  formaPagamento?: 'dinheiro' | 'cartao' | 'pix' | 'boleto' | null;
  observacao?: string;
  mesReferencia: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClassGroup {
  id?: string;
  modalidade: string;
  turma: string;
  professor: string;
  dias: string[];
  horario: string;
  limiteVagas: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Attendance {
  id?: string;
  data: string;
  alunoId: string;
  turmaId: string;
  nome: string;
  modalidade?: string;
  presenca: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type ExpenseCategory = 'aluguel' | 'agua' | 'luz' | 'internet' | 'material' | 'professor' | 'outros';

export interface Expense {
  id?: string;
  data: string;
  descricao: string;
  categoria: ExpenseCategory;
  valor: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FinancialSummary {
  mes: string;
  receitas: number;
  despesas: number;
  lucro: number;
}

export interface DashboardMetrics {
  activeStudents: number;
  monthlyRevenue: number;
  overduePayments: number;
  attendanceToday: number;
  attendanceRateToday: number;
  modalityCounts: Array<{ name: string; value: number }>;
  recentActivities: string[];
}

