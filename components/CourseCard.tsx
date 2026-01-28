
import React from 'react';
import { Discipline, Category } from '../types';

interface CourseCardProps {
  discipline: Discipline;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ discipline, isSelected, onToggle }) => {
  const getCategoryStyles = (category: Category) => {
    switch (category) {
      case Category.MANDATORY:
        return 'border-l-amber-500 bg-amber-500/10 text-amber-500';
      case Category.ELECTIVE_CINEMA:
        return 'border-l-indigo-500 bg-indigo-500/10 text-indigo-500';
      case Category.GENERAL_ICA:
        return 'border-l-emerald-500 bg-emerald-500/10 text-emerald-500';
      default:
        return 'border-l-slate-500 bg-slate-500/10 text-slate-500';
    }
  };

  return (
    <div 
      className={`group relative p-4 rounded-xl border border-slate-700/50 border-l-4 ${getCategoryStyles(discipline.category)} transition-all duration-300 hover:scale-[1.02] cursor-pointer ${isSelected ? 'ring-2 ring-slate-100' : ''}`}
      onClick={() => onToggle(discipline.id)}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold tracking-widest uppercase opacity-70">
            {discipline.code} {discipline.semester ? `• ${discipline.semester} SEM` : ''}
          </span>
          <span className="text-[9px] font-mono opacity-50">{discipline.period}</span>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${isSelected ? 'bg-white border-white' : 'border-slate-500'}`}>
          {isSelected && <div className="w-2 h-2 bg-slate-900 rounded-full" />}
        </div>
      </div>
      
      <h3 className="text-slate-100 font-bold text-sm leading-tight mb-2 group-hover:text-white transition-colors">
        {discipline.name}
      </h3>

      <div className="flex flex-wrap gap-2 mb-3">
        {discipline.schedules.map((s, idx) => (
          <span key={idx} className="bg-slate-800/80 px-2 py-0.5 rounded text-[10px] text-slate-300 font-medium">
            {s.day} • {s.time}
          </span>
        ))}
        {discipline.bimester && (
          <span className="bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded text-[10px] font-bold">
            {discipline.bimester} BIMESTRE
          </span>
        )}
      </div>

      {discipline.description && (
        <p className="text-slate-400 text-[11px] line-clamp-3 leading-relaxed mb-4">
          {discipline.description.replace(/^Ementa:\s*/, '')}
        </p>
      )}

      {discipline.turma && (
        <span className="inline-block text-[9px] font-black bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase tracking-tighter">
          {discipline.turma}
        </span>
      )}
    </div>
  );
};

export default CourseCard;
