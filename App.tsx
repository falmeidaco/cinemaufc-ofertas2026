
import React, { useState, useMemo, useEffect } from 'react';
import { Category, Discipline } from './types';
import { parseCSV, mapRowToDiscipline } from './data';
import CourseCard from './components/CourseCard';
import ScheduleGrid from './components/ScheduleGrid';

const STORAGE_KEY = 'cinema_ufc_selected_2026_1';

const CountdownTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const targetDate = useMemo(() => new Date('2026-02-20T00:00:00'), []);

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <div className="bg-[#F8381C] text-white py-2 px-6 overflow-hidden relative shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 text-xs font-black uppercase tracking-widest">
        <span className="opacity-80 hidden sm:inline">Contagem regressiva para matrículas:</span>
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <span className="text-sm leading-none">{timeLeft.days}</span>
            <span className="text-[8px] opacity-70 uppercase tracking-tighter">Dias</span>
          </div>
          <span className="opacity-40">:</span>
          <div className="flex flex-col items-center">
            <span className="text-sm leading-none">{timeLeft.hours}</span>
            <span className="text-[8px] opacity-70 uppercase tracking-tighter">Horas</span>
          </div>
          <span className="opacity-40">:</span>
          <div className="flex flex-col items-center">
            <span className="text-sm leading-none">{timeLeft.minutes}</span>
            <span className="text-[8px] opacity-70 uppercase tracking-tighter">Mins</span>
          </div>
          <span className="opacity-40">:</span>
          <div className="flex flex-col items-center w-6">
            <span className="text-sm leading-none">{timeLeft.seconds}</span>
            <span className="text-[8px] opacity-70 uppercase tracking-tighter">Segs</span>
          </div>
        </div>
        <span className="ml-2 font-serif italic normal-case font-bold hidden md:inline">20 de Fevereiro, 2026</span>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return new Set(parsed);
      } catch (e) {
        console.error("Failed to parse saved selection", e);
      }
    }
    return new Set();
  });

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [viewMode, setViewMode] = useState<'cards' | 'calendar'>('cards');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(selectedIds)));
  }, [selectedIds]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch('disciplines.csv');
        if (!response.ok) throw new Error('Falha ao carregar arquivo de dados.');
        const csvText = await response.text();
        const rows = parseCSV(csvText);
        
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
      <div className="min-h-screen bg-[#e6edf5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#F8381C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-serif text-lg animate-pulse">Carregando Acervo 2026.1...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#e6edf5] flex items-center justify-center p-6">
        <div className="bg-white border border-[#F8381C] p-8 rounded-2xl max-w-md text-center shadow-xl">
          <svg className="w-16 h-16 text-[#F8381C] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-slate-900 text-xl font-bold mb-2">Ops! Algo deu errado</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-[#F8381C] text-white px-6 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e6edf5] text-slate-800 flex flex-col">
      <CountdownTimer />
      
      <header className="relative bg-white border-b border-slate-200 pt-12 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="grid grid-cols-12 gap-1 h-full w-full rotate-12 scale-150">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="bg-slate-400 h-full w-[1px]"></div>
            ))}
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-[#F8381C] font-bold tracking-[0.3em] uppercase text-xs mb-2 block">
                Cinema e Audiovisual • UFC
              </span>
              <h1 className="text-5xl md:text-7xl font-serif text-slate-900 mb-4">
                Ofertas <span className="text-[#0167E3] italic">2026.1</span>
              </h1>
              <p className="text-slate-600 max-w-2xl text-lg font-light leading-relaxed mb-2">
                Explore a grade curricular do semestre, organize seus horários e organize sua jornada para o semestre. 
              </p>
              <p className="text-slate-600 max-w-2xl text-lg font-light leading-relaxed">
                <strong className="text-[#F8381C]">Mas lembre-se:</strong> esta página serve apenas para você conhecer as disciplinas de 2026. As matrículas são feitas dentro do SIGAA no período indicado pela UFC.
              </p>
            </div>
            
            <div className="flex items-center gap-2 bg-[#e6edf5] p-1 rounded-xl border border-slate-200 self-start md:self-auto">
              <button 
                onClick={() => setViewMode('cards')}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'cards' ? 'bg-[#0167E3] text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Disciplinas
              </button>
              <button 
                onClick={() => setViewMode('calendar')}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'calendar' ? 'bg-[#0167E3] text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Grade
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-6 -mt-10 mb-20 flex-grow">
        <div className="sticky top-6 z-40 bg-white/90 backdrop-blur-xl p-4 rounded-2xl border border-slate-200 shadow-xl flex flex-col md:flex-row items-center gap-4 mb-8">
          <div className="relative flex-grow w-full md:w-auto">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Buscar por código ou nome..."
              className="w-full bg-[#e6edf5] border-none rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[#bdccdc] transition-all text-slate-800 placeholder-slate-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto">
            {['All', Category.MANDATORY, Category.ELECTIVE_CINEMA, Category.GENERAL_ICA].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat as any)}
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold transition-all border ${activeCategory === cat ? 'bg-[#F8381C] border-[#F8381C] text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
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
                <div className="mb-4 inline-block p-4 rounded-full bg-white border border-slate-200">
                   <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                   </svg>
                </div>
                <h3 className="text-xl font-serif text-slate-600 mb-2">Nenhuma disciplina encontrada</h3>
                <p className="text-slate-400">Tente ajustar seus filtros ou busca.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2 px-2">
              <h2 className="text-2xl font-serif text-slate-900">Visualizador de Grade</h2>
              <div className="text-sm text-slate-500">
                <span className="font-bold text-[#F8381C]">{selectedIds.size}</span> selecionadas
              </div>
            </div>
            <ScheduleGrid selectedDisciplines={selectedDisciplines} />
            
            {selectedIds.size === 0 && (
               <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center shadow-sm">
                  <p className="text-slate-600 font-medium">Selecione disciplinas na lista para visualizá-las aqui.</p>
                  <button 
                    onClick={() => setViewMode('cards')}
                    className="mt-4 text-[#0167E3] font-bold text-sm hover:underline transition-all"
                  >
                    Voltar para a lista
                  </button>
               </div>
            )}
          </div>
        )}
      </main>

      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
           <div className="bg-slate-900 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-6 border-4 border-white">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-tighter opacity-60 leading-none">2026.1</span>
                <span className="text-sm font-bold">{selectedIds.size} Selecionadas</span>
              </div>
              <div className="h-8 w-[1px] bg-white/20"></div>
              <button 
                onClick={() => setSelectedIds(new Set())}
                className="text-xs font-bold text-slate-400 hover:text-white uppercase transition-colors"
              >
                Limpar
              </button>
              <button 
                onClick={() => setViewMode('calendar')}
                className="bg-[#0167E3] text-white px-5 py-2 rounded-full text-xs font-bold hover:opacity-90 transition-opacity"
              >
                Ver Grade
              </button>
           </div>
        </div>
      )}

      <footer className="bg-white border-t border-slate-200 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 opacity-60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center font-bold text-lg text-white">C</div>
            <span className="text-sm font-medium tracking-widest uppercase text-slate-900">Cinema UFC</span>
          </div>
          <p className="text-xs text-center md:text-right text-slate-600">
            Criado com amor pelo Centro Acadêmico do curso Cinema e Audiovisual<br/>
            As informações podem sofrer alterações sem aviso prévio.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;