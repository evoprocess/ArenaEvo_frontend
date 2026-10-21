import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { tenantCollectionPath } from './tenant';
import type {
  Attendance,
  ClassGroup,
  DashboardMetrics,
  Expense,
  FinancialSummary,
  Payment,
  Student,
} from '../types';

const now = () => new Date().toISOString();
const monthKey = (date = new Date()) => date.toISOString().slice(0, 7);
const refFor = (orgId: string, name: string) => collection(db, tenantCollectionPath(orgId, name));
const docFor = (orgId: string, name: string, id: string) => doc(db, tenantCollectionPath(orgId, name), id);

const readCollection = async <T>(orgId: string, name: string): Promise<T[]> => {
  const snapshot = await getDocs(refFor(orgId, name));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() })) as T[];
};

const normalizeStudent = (student: Student): Student => ({
  ...student,
  telefone: student.telefone || '',
  turmas: Array.isArray(student.turmas) ? student.turmas : [],
  horario: student.horario || '',
  dataMatricula: student.dataMatricula || '',
  plano: student.plano || 'mensal',
  valor: Number(student.valor || 0),
  vencimento: Number(student.vencimento || 1),
  status: student.status || 'ativo',
});

export const loadStudents = async (orgId: string): Promise<Student[]> =>
  (await readCollection<Student>(orgId, 'alunos'))
    .map(normalizeStudent)
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

export const loadRecentStudents = async (orgId: string): Promise<Student[]> =>
  (await loadStudents(orgId)).slice(0, 8);

export const createStudent = async (orgId: string, student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => {
  const timestamp = now();
  const result = await addDoc(refFor(orgId, 'alunos'), { ...student, createdAt: timestamp, updatedAt: timestamp });
  return result.id;
};

export const updateStudent = async (orgId: string, id: string, student: Partial<Student>) =>
  updateDoc(docFor(orgId, 'alunos', id), { ...student, updatedAt: now() });

export const deleteStudent = async (orgId: string, id: string) => deleteDoc(docFor(orgId, 'alunos', id));

export const loadClasses = async (orgId: string): Promise<ClassGroup[]> =>
  (await readCollection<ClassGroup>(orgId, 'turmas'))
    .map((item) => ({ ...item, dias: Array.isArray(item.dias) ? item.dias : [], limiteVagas: Number(item.limiteVagas || 0) }))
    .sort((a, b) => `${a.modalidade} ${a.turma}`.localeCompare(`${b.modalidade} ${b.turma}`, 'pt-BR'));

export const createClass = async (orgId: string, classGroup: Omit<ClassGroup, 'id' | 'createdAt' | 'updatedAt'>) => {
  const timestamp = now();
  const result = await addDoc(refFor(orgId, 'turmas'), { ...classGroup, createdAt: timestamp, updatedAt: timestamp });
  return result.id;
};

export const updateClass = async (orgId: string, id: string, classGroup: Partial<ClassGroup>) =>
  updateDoc(docFor(orgId, 'turmas', id), { ...classGroup, updatedAt: now() });

export const deleteClass = async (orgId: string, id: string) => deleteDoc(docFor(orgId, 'turmas', id));

export const setStudentClass = async (orgId: string, student: Student, classId: string, enrolled: boolean) => {
  if (!student.id) return;
  const current = student.turmas || [];
  const turmas = enrolled ? Array.from(new Set([...current, classId])) : current.filter((id) => id !== classId);
  await updateStudent(orgId, student.id, { turmas });
};

export const loadPayments = async (orgId: string): Promise<Payment[]> =>
  (await readCollection<Payment>(orgId, 'mensalidades'))
    .map((item) => ({ ...item, valor: Number(item.valor || 0), pago: Boolean(item.pago) }))
    .sort((a, b) => b.vencimento.localeCompare(a.vencimento));

export const createPayment = async (orgId: string, payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => {
  const timestamp = now();
  const result = await addDoc(refFor(orgId, 'mensalidades'), { ...payment, createdAt: timestamp, updatedAt: timestamp });
  return result.id;
};

export const updatePayment = async (orgId: string, id: string, payment: Partial<Payment>) =>
  updateDoc(docFor(orgId, 'mensalidades', id), { ...payment, updatedAt: now() });

export const deletePayment = async (orgId: string, id: string) => deleteDoc(docFor(orgId, 'mensalidades', id));

export const loadExpenses = async (orgId: string): Promise<Expense[]> =>
  (await readCollection<Expense>(orgId, 'despesas'))
    .map((item) => ({ ...item, valor: Number(item.valor || 0) }))
    .sort((a, b) => b.data.localeCompare(a.data));

export const createExpense = async (orgId: string, expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
  const timestamp = now();
  const result = await addDoc(refFor(orgId, 'despesas'), { ...expense, createdAt: timestamp, updatedAt: timestamp });
  return result.id;
};

export const updateExpense = async (orgId: string, id: string, expense: Partial<Expense>) =>
  updateDoc(docFor(orgId, 'despesas', id), { ...expense, updatedAt: now() });

export const deleteExpense = async (orgId: string, id: string) => deleteDoc(docFor(orgId, 'despesas', id));

export const loadAttendance = async (orgId: string, date: string, classId: string): Promise<Attendance[]> =>
  (await readCollection<Attendance>(orgId, 'frequencia'))
    .filter((item) => item.data === date && item.turmaId === classId);

export const saveAttendance = async (orgId: string, attendance: Attendance[]) => {
  const batch = writeBatch(db);
  const timestamp = now();
  attendance.forEach((item) => {
    const { id, ...values } = item;
    if (id) batch.set(docFor(orgId, 'frequencia', id), { ...values, updatedAt: timestamp }, { merge: true });
    else batch.set(doc(refFor(orgId, 'frequencia')), { ...values, createdAt: timestamp, updatedAt: timestamp });
  });
  await batch.commit();
};

export const loadFinancialData = async (
  orgId: string,
  selectedMonth: string,
  modality?: string,
  paymentStatus?: 'pagos' | 'nao-pagos',
) => {
  const [allPayments, allExpenses] = await Promise.all([loadPayments(orgId), loadExpenses(orgId)]);
  const matches = (payment: Payment) =>
    (!modality || payment.modalidade === modality) &&
    (!paymentStatus || (paymentStatus === 'pagos' ? payment.pago : !payment.pago));
  const filteredPayments = allPayments.filter(matches);

  const summarize = (mes: string): FinancialSummary => {
    const receitas = filteredPayments
      .filter((item) => item.mesReferencia === mes && item.pago)
      .reduce((total, item) => total + item.valor, 0);
    const despesas = allExpenses
      .filter((item) => item.data.startsWith(mes))
      .reduce((total, item) => total + item.valor, 0);
    return { mes, receitas, despesas, lucro: receitas - despesas };
  };

  const history = Array.from({ length: 12 }, (_, index) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1 - index, 1);
    return summarize(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  });

  const byModality = Object.entries(
    allPayments
      .filter((item) => item.mesReferencia === selectedMonth && item.pago && (!modality || item.modalidade === modality))
      .reduce<Record<string, number>>((acc, item) => {
        acc[item.modalidade || 'outras'] = (acc[item.modalidade || 'outras'] || 0) + item.valor;
        return acc;
      }, {}),
  ).map(([name, value]) => ({ name, value }));

  const overdue = allPayments.filter(
    (item) => item.mesReferencia === selectedMonth && !item.pago && (!modality || item.modalidade === modality),
  );

  return { summary: summarize(selectedMonth), history, byModality, overdue };
};

export const loadDashboardMetrics = async (orgId: string): Promise<DashboardMetrics> => {
  const [students, payments, attendance] = await Promise.all([
    loadStudents(orgId),
    loadPayments(orgId),
    readCollection<Attendance>(orgId, 'frequencia'),
  ]);
  const month = monthKey();
  const today = new Date().toISOString().slice(0, 10);
  return {
    activeStudents: students.filter((item) => item.status === 'ativo').length,
    monthlyRevenue: payments.filter((item) => item.mesReferencia === month && item.pago).reduce((total, item) => total + item.valor, 0),
    overduePayments: payments.filter((item) => item.mesReferencia === month && !item.pago).length,
    attendanceToday: attendance.filter((item) => item.data === today && item.presenca).length,
  };
};
