
import React from 'react';
import { Discipline, DayOfWeek, Category } from '../types';

interface ScheduleGridProps {
  selectedDisciplines: Discipline[];
}

const DAYS = [DayOfWeek.SEG, DayOfWeek.TER, DayOfWeek.QUA, DayOfWeek.QUI, DayOfWeek.SEX];
const TIMES = ['08:00-12:00', '13:30-17:30', '18:00-22:00'];

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ selectedDisciplines }) => {
  const getDisciplineForSlot = (day: DayOfWeek, time: string) => {
    // Find disciplines that overlap with this standard time block
    return selectedDisciplines.filter(d => 
      d.schedules.some(s => s.day === day && (s.time.includes(time) || time.includes(s.time)))
    );
  };

  const getCategoryColor = (category: Category) => {
    switch (category) {
      case Category.MANDATORY: return 'bg-amber-500';
      case Category.ELECTIVE_CINEMA: return 'bg-indigo-500';
      case Category.GENERAL_ICA: return 'bg-emerald-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="w-full overflow-x-auto bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
      <div className="min-w-[800px]">
        {/* Header Days */}
        <div className="grid grid-cols-6 gap-4 mb-4">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center justify-center">Horário</div>
          {DAYS.map(day => (
            <div key={day} className="text-slate-200 text-sm font-bold text-center py-2 bg-slate-800/50 rounded-lg">
              {day}
            </div>
          ))}
        </div>

        {/* Time Rows */}
        {TIMES.map(time => (
          <div key={time} className="grid grid-cols-6 gap-4 mb-4 min-h-[140px]">
            <div className="bg-slate-800/30 rounded-lg border border-slate-700/30 flex items-center justify-center text-slate-400 text-xs font-mono">
              {time}
            </div>
            
            {DAYS.map(day => {
              const matched = getDisciplineForSlot(day, time);
              return (
                <div key={`${day}-${time}`} className="relative bg-slate-800/20 rounded-lg border border-dashed border-slate-700/50 p-2 flex flex-col gap-2 overflow-y-auto">
                  {matched.length === 0 ? (
                    <div className="h-full flex items-center justify-center opacity-10">
                       <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
                    </div>
                  ) : (
                    matched.map(d => (
                      <div 
                        key={`${d.id}-${day}`} 
                        className={`p-2 rounded shadow-lg text-[10px] leading-tight text-white font-medium ${getCategoryColor(d.category)} transform hover:scale-105 transition-transform cursor-default relative overflow-hidden`}
                      >
                        <div className="absolute top-0 right-0 p-1 opacity-20">
                          <span className="font-mono text-[8px]">{d.code}</span>
                        </div>
                        <div className="font-bold mb-1 line-clamp-2 uppercase">{d.name}</div>
                        <div className="flex justify-between items-center mt-auto pt-1 border-t border-white/20">
                          <span>{d.turma ? `T${d.turma}` : ''}</span>
                          {d.bimester && <span className="bg-white/20 px-1 rounded">{d.bimester} BIM</span>}
                        </div>
                      </div>
                    ))
                  )}
                  {matched.length > 1 && (
                    <div className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full animate-pulse shadow-lg">
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
