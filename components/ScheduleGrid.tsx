
import React from 'react';
import { Discipline, DayOfWeek, Category } from '../types';

interface ScheduleGridProps {
  selectedDisciplines: Discipline[];
}

const DAYS = [DayOfWeek.SEG, DayOfWeek.TER, DayOfWeek.QUA, DayOfWeek.QUI, DayOfWeek.SEX];
const TIMES = ['08:00-12:00', '13:30-17:30', '18:00-22:00'];

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ selectedDisciplines }) => {
  const getDisciplineForSlot = (day: DayOfWeek, time: string) => {
    return selectedDisciplines.filter(d => 
      d.schedules.some(s => s.day === day && (s.time.includes(time) || time.includes(s.time)))
    );
  };

  const getCategoryColor = (category: Category) => {
    switch (category) {
      case Category.MANDATORY: return 'bg-[#F8381C]';
      case Category.ELECTIVE_CINEMA: return 'bg-[#0167E3]';
      case Category.GENERAL_ICA: return 'bg-emerald-600';
      default: return 'bg-slate-600';
    }
  };

  return (
    <div className="w-full overflow-x-auto bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      <div className="min-w-[900px]">
        {/* Header Days */}
        <div className="grid grid-cols-6 gap-4 mb-6">
          <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center">Horário</div>
          {DAYS.map(day => (
            <div key={day} className="text-slate-800 text-sm font-black text-center py-3 bg-[#F8E9E7] rounded-xl border border-slate-200/50">
              {day}
            </div>
          ))}
        </div>

        {/* Time Rows */}
        {TIMES.map(time => (
          <div key={time} className="grid grid-cols-6 gap-4 mb-4 min-h-[160px]">
            <div className="bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-slate-600 text-[11px] font-black font-mono px-2">
              <span className="opacity-40 uppercase text-[8px] mb-1">Período</span>
              {time}
            </div>
            
            {DAYS.map(day => {
              const matched = getDisciplineForSlot(day, time);
              return (
                <div key={`${day}-${time}`} className="relative bg-[#F8E9E7]/30 rounded-2xl border-2 border-dashed border-slate-200/60 p-2.5 flex flex-col gap-2 overflow-y-auto">
                  {matched.length === 0 ? (
                    <div className="h-full flex items-center justify-center opacity-10 grayscale">
                       <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
                    </div>
                  ) : (
                    matched.map(d => (
                      <div 
                        key={`${d.id}-${day}`} 
                        className={`p-3 rounded-xl shadow-md text-[10px] leading-snug text-white font-bold ${getCategoryColor(d.category)} transform hover:scale-[1.02] transition-all cursor-default relative overflow-hidden group`}
                      >
                        <div className="absolute top-0 right-0 p-1 opacity-20 group-hover:opacity-40 transition-opacity">
                          <span className="font-mono text-[8px]">{d.code}</span>
                        </div>
                        <div className="font-black mb-1.5 line-clamp-2 uppercase leading-tight tracking-tight">{d.name}</div>
                        <div className="flex justify-between items-center mt-auto pt-1.5 border-t border-white/20">
                          <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded-md">{d.turma ? `T${d.turma.replace('Turma ', '')}` : 'S/T'}</span>
                          {d.bimester && <span className="bg-white/20 px-1.5 py-0.5 rounded-md text-[8px] uppercase">{d.bimester} BIM</span>}
                        </div>
                      </div>
                    ))
                  )}
                  {matched.length > 1 && (
                    <div className="absolute -top-1.5 -right-1.5 bg-black text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-lg border-2 border-white z-10">
                      CONFLITO
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleGrid;
