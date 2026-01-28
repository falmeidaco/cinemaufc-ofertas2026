import { Category, DayOfWeek, Discipline, Schedule } from './types';

/**
 * Robust CSV parser that handles quotes and multiple columns correctly.
 */
export function parseCSV(text: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(current.trim());
        current = '';
      } else if (char === '\n' || char === '\r') {
        row.push(current.trim());
        if (row.length > 0 && row.some(cell => cell !== '')) {
          result.push(row);
        }
        row = [];
        current = '';
        if (char === '\r' && next === '\n') i++;
      } else {
        current += char;
      }
    }
  }
  
  if (current !== '' || row.length > 0) {
    row.push(current.trim());
    result.push(row);
  }

  return result;
}

const parseSchedules = (scheduleStr: string): Schedule[] => {
  if (!scheduleStr) return [];
  return scheduleStr.split('/').map(part => {
    const trimmed = part.trim();
    const spaceIndex = trimmed.indexOf(' ');
    if (spaceIndex === -1) return null;
    const dayStr = trimmed.substring(0, spaceIndex).toUpperCase();
    const time = trimmed.substring(spaceIndex + 1);
    const day = DayOfWeek[dayStr as keyof typeof DayOfWeek] || DayOfWeek.SEG;
    return { day, time };
  }).filter(s => s !== null) as Schedule[];
};

export const mapRowToDiscipline = (row: string[], index: number): Discipline => {
  const [semestre, tipo, curso, periodo, idCode, nome, turma, horario, ementa] = row;
  
  let category = Category.MANDATORY;
  if (tipo.toUpperCase().includes('OPTATIVA')) {
    category = curso.toUpperCase() === 'ICA' ? Category.GENERAL_ICA : Category.ELECTIVE_CINEMA;
  }

  const bimester = periodo.includes('1º BIMESTRE') ? '1º' : periodo.includes('2º BIMESTRE') ? '2º' : undefined;

  return {
    id: `csv-${index}-${idCode}`,
    code: idCode,
    name: nome,
    category,
    semester: semestre ? `${semestre}º` : undefined,
    turma: turma || undefined,
    schedules: parseSchedules(horario),
    // Fixed: removed invalid property 'periodo' which is not part of the Discipline interface
    period: periodo, 
    bimester,
    description: ementa || undefined
  };
};