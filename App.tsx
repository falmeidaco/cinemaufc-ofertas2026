
import React, { useState, useMemo, useEffect } from 'react';
import { Category, Discipline } from './types';
import { parseCSV, mapRowToDiscipline } from './data';
import CourseCard from './components/CourseCard';
import ScheduleGrid from './components/ScheduleGrid';

const App: React.FC = () => {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [viewMode, setViewMode] = useState<'cards' | 'calendar'>('cards');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch('disciplines.csv');
        if (!response.ok) throw new Error('Falha ao carregar arquivo de dados.');
        const csvText = await response.text();
        const rows = parseCSV(csvText);
        
        // Skip header row
        const dataRows = rows.slice(1);
        const mapped = dataRows.map((row, idx) => mapRowToDiscipline(row, idx));
        
        setDisciplines(mapped);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar as disciplinas. Verifique o arquivo CSV.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredDisciplines = useMemo(() => {
    return disciplines.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) || 
                           d.code.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'All' || d.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory, disciplines]);

  const selectedDisciplines = useMemo(() => {
    return disciplines.filter(d => selectedIds.has(d.id));
  }, [selectedIds, disciplines]);

  const toggleDiscipline = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-serif text-lg animate-pulse">Carregando Acervo 2026.1...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
        <div className="bg-rose-500/10 border border-rose-500/30 p-8 rounded-2xl max-w-md text-center">
          <svg className="w-16 h-16 text-rose-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-white text-xl font-bold mb-2">Ops! Algo deu errado</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-rose-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-rose-600 transition-colors">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col">
      {/* Cinematic Header */}
      <header className="relative bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 pt-12 pb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="grid grid-cols-12 gap-1 h-full w-full rotate-12 scale-150">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="bg-slate-500 h-full w-[1px]"></div>
            ))}
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-amber-500 font-bold tracking-[0.3em] uppercase text-xs mb-2 block">
                UFC • Instituto de Cultura e Arte
              </span>
              <h1 className="text-5xl md:text-7xl font-serif text-white mb-4">
                Cinema <span className="text-slate-500 italic">2026.1</span>
              </h1>
              <p className="text-slate-400 max-w-2xl text-lg font-light leading-relaxed">
                Explore a grade curricular do semestre, organize seus horários e visualize sua jornada cinematográfica no curso de Cinema e Audiovisual da Universidade Federal do Ceará.
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-slate-800/50 p-1 rounded-xl border border-slate-700 self-start md:self-auto">
              <button 
                onClick={() => setViewMode('cards')}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white'}`}
              >
                Lista de Disciplinas
              </button>
              <button 
                onClick={() => setViewMode('calendar')}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white'}`}
              >
                Grade Semanal
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-6 -mt-10 mb-20 flex-grow">
        {/* Filters Sticky Bar */}
        <div className="sticky top-6 z-40 bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-700/50 shadow-2xl flex flex-col md:flex-row items-center gap-4 mb-8">
          <div className="relative flex-grow w-full">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Buscar por código ou nome (ex: Fotografia)..."
              className="w-full bg-slate-800 border-none rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-amber-500 transition-all text-slate-100 placeholder-slate-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto">
            {['All', Category.MANDATORY, Category.ELECTIVE_CINEMA, Category.GENERAL_ICA].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat as any)}
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold transition-all border ${activeCategory === cat ? 'bg-amber-500 border-amber-400 text-slate-900 shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
              >
                {cat === 'All' ? 'Todas' : cat}
              </button>
            ))}
          </div>
        </div>

        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDisciplines.length > 0 ? (
              filteredDisciplines.map(d => (
                <CourseCard 
                  key={d.id} 
                  discipline={d} 
                  isSelected={selectedIds.has(d.id)}
                  onToggle={toggleDiscipline}
                />
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <div className="mb-4 inline-block p-4 rounded-full bg-slate-800">
                   <svg className="w-12 h-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                   </svg>
                </div>
                <h3 className="text-xl font-serif text-slate-300 mb-2">Nenhuma disciplina encontrada</h3>
                <p className="text-slate-500">Tente ajustar seus filtros ou busca.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2 px-2">
              <h2 className="text-2xl font-serif text-white">Visualizador de Grade</h2>
              <div className="text-sm text-slate-400">
                <span className="font-bold text-amber-500">{selectedIds.size}</span> disciplinas selecionadas
              </div>
            </div>
            <ScheduleGrid selectedDisciplines={selectedDisciplines} />
            
            {selectedIds.size === 0 && (
               <div className="bg-amber-500/10 border border-amber-500/30 p-8 rounded-2xl text-center">
                  <p className="text-amber-500 font-medium">Você ainda não selecionou nenhuma disciplina para ver na grade.</p>
                  <button 
                    onClick={() => setViewMode('cards')}
                    className="mt-4 text-amber-500 underline text-sm hover:text-amber-400 transition-colors"
                  >
                    Voltar para a lista e selecionar
                  </button>
               </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Action Menu for Selected Courses */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-bounce-subtle">
           <div className="bg-white text-slate-900 px-6 py-4 rounded-full shadow-2xl flex items-center gap-6 border-4 border-slate-900">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-tighter opacity-60">Matrícula 2026.1</span>
                <span className="text-sm font-bold">{selectedIds.size} Disciplinas</span>
              </div>
              <div className="h-8 w-[1px] bg-slate-200"></div>
              <button 
                onClick={() => setSelectedIds(new Set())}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 uppercase"
              >
                Limpar
              </button>
              <button 
                onClick={() => setViewMode('calendar')}
                className="bg-slate-900 text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Ver Grade
              </button>
           </div>
        </div>
      )}

      {/* Simple Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 opacity-40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center font-bold text-lg">C</div>
            <span className="text-sm font-medium tracking-widest uppercase">Cinema UFC</span>
          </div>
          <p className="text-xs text-center md:text-right">
            Semestre Letivo 2026.1 • Planejamento Acadêmico<br/>
            As informações podem sofrer alterações sem aviso prévio.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
