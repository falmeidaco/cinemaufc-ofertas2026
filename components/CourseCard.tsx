
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
        return 'border-l-[#F8381C] bg-white text-[#F8381C]';
      case Category.ELECTIVE_CINEMA:
        return 'border-l-[#0167E3] bg-white text-[#0167E3]';
      case Category.GENERAL_ICA:
        return 'border-l-emerald-600 bg-white text-emerald-600';
      default:
        return 'border-l-slate-400 bg-white text-slate-400';
    }
  };

  return (
    <div 
      className={`group relative p-5 rounded-2xl border border-slate-200 border-l-4 ${getCategoryStyles(discipline.category)} transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer bg-white ${isSelected ? 'ring-4 ring-[#0167E3]/20 shadow-lg' : 'shadow-sm'}`}
      onClick={() => onToggle(discipline.id)}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-col">
          <span className="text-[10px] font-black tracking-widest uppercase opacity-60 text-slate-500">
            {discipline.code} {discipline.semester ? `• ${discipline.semester} SEM` : ''}
          </span>
          <span className="text-[9px] font-mono font-bold opacity-40 text-slate-900">{discipline.period}</span>
        </div>
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${isSelected ? 'bg-[#0167E3] border-[#0167E3]' : 'border-slate-200 group-hover:border-slate-300'}`}>
          {isSelected && (
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      
      <h3 className="text-slate-900 font-bold text-base leading-tight mb-2 group-hover:text-slate-950 transition-colors">
        {discipline.name}
      </h3>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {discipline.schedules.map((s, idx) => (
          <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-600 font-bold border border-slate-200/50">
            {s.day} • {s.time}
          </span>
        ))}
        {discipline.bimester && (
          <span className="bg-[#F8381C]/10 text-[#F8381C] px-2 py-0.5 rounded text-[10px] font-black uppercase">
            {discipline.bimester} BIMESTRE
          </span>
        )}
      </div>

      {discipline.description && (
        <p className="text-slate-500 text-[11px] line-clamp-2 leading-relaxed mb-4 group-hover:text-slate-600 transition-colors italic">
          {discipline.description.replace(/^Ementa:\s*/, '')}
        </p>
      )}

      {discipline.turma && (
        <span className="inline-block text-[10px] font-black bg-slate-900 text-white px-2.5 py-1 rounded-full uppercase tracking-tighter">
          {discipline.turma}
        </span>
      )}
    </div>
  );
};

export default CourseCard;