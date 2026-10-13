import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { tenantCollectionPath } from './tenant';
import type { DashboardMetrics, Student } from '../types';

const monthKey = () => new Date().toISOString().slice(0, 7);

export const loadDashboardMetrics = async (orgId: string): Promise<DashboardMetrics> => {
  const studentsRef = collection(db, tenantCollectionPath(orgId, 'alunos'));
  const paymentsRef = collection(db, tenantCollectionPath(orgId, 'mensalidades'));
  const attendanceRef = collection(db, tenantCollectionPath(orgId, 'frequencia'));
  const today = new Date().toISOString().slice(0, 10);

  const [students, payments, overdue, attendance] = await Promise.all([
    getCountFromServer(query(studentsRef, where('status', '==', 'ativo'))),
    getDocs(query(paymentsRef, where('mesReferencia', '==', monthKey()), where('pago', '==', true))),
    getCountFromServer(query(paymentsRef, where('mesReferencia', '==', monthKey()), where('pago', '==', false))),
    getCountFromServer(query(attendanceRef, where('data', '==', today), where('presenca', '==', true))),
  ]);

  return {
    activeStudents: students.data().count,
    monthlyRevenue: payments.docs.reduce((total, item) => total + Number(item.data().valor || 0), 0),
    overduePayments: overdue.data().count,
    attendanceToday: attendance.data().count,
  };
};

export const loadRecentStudents = async (orgId: string): Promise<Student[]> => {
  const ref = collection(db, tenantCollectionPath(orgId, 'alunos'));
  const snapshot = await getDocs(query(ref, orderBy('nome'), limit(8)));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() })) as Student[];
};

