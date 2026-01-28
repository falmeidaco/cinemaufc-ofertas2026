
export enum Category {
  MANDATORY = 'Obrigatória',
  ELECTIVE_CINEMA = 'Optativa Cinema',
  GENERAL_ICA = 'Geral ICA'
}

export enum DayOfWeek {
  SEG = 'SEG',
  TER = 'TER',
  QUA = 'QUA',
  QUI = 'QUI',
  SEX = 'SEX'
}

export interface Schedule {
  day: DayOfWeek;
  time: string;
}

export interface Discipline {
  id: string;
  code: string;
  name: string;
  category: Category;
  semester?: string;
  turma?: string;
  schedules: Schedule[];
  period: string;
  bimester?: '1º' | '2º';
  description?: string;
}
