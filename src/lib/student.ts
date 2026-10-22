import type { Student } from '../types';

type StudentIdentity = Pick<Student, 'nome' | 'observacao'>;

export const formatStudentName = (student?: Partial<StudentIdentity> | null) => {
  const name = String(student?.nome || '').trim();
  const observation = String(student?.observacao || '').trim().replace(/^\((.*)\)$/, '$1').trim();
  return observation ? `${name} (${observation})` : name;
};

