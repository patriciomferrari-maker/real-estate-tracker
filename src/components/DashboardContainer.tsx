"use client"

import React, { useState } from 'react'
import { TrendingUp, RefreshCw } from "lucide-react"
import AnalyticsSection from "@/components/AnalyticsSection"
import DataExplorer from "@/components/DataExplorer"
import MatrixSection from "@/components/MatrixSection"
import { syncAllData } from "@/app/actions"

interface ProcessedRecord {
  id: string;
  timestamp: string;
  durationMins: number;
  isIda: boolean;
  isDOT: boolean;
  dayOfWeek: number;
  month: number;
  macro: string;
  barrio: string;
  barrioRaw: string;
  hours: number;
  minutes: number;
  dateStr: string;
  diaDeSemana: string;
  fecha: string;
  año: string;
  mes: string;
  sentido: string;
  destino: string;
  tiempo: number;
  zona: string;
}

export default function DashboardContainer({ records }: { records: ProcessedRecord[] }) {
  const [currentTab, setCurrentTab] = useState<string>("graficos");
  const [visitedTabs, setVisitedTabs] = useState<string[]>(["graficos"]);

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    if (!visitedTabs.includes(tab)) {
      setVisitedTabs(prev => [...prev, tab]);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-[1800px] mx-auto text-slate-200 bg-slate-950 selection:bg-blue-500/30">
      <header className="mb-10 flex justify-between items-center pb-8 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
             <TrendingUp className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tighter">Commute Intelligence</h1>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Real-Time Data Engine</p>
          </div>
        </div>
        <form action={syncAllData}>
          <button type="submit" className="flex items-center gap-3 bg-white text-black hover:bg-slate-200 px-5 py-2.5 rounded-xl text-xs font-black transition-all shadow-xl active:scale-95">
            <RefreshCw size={14} className="animate-spin-slow" /> SYNC
          </button>
        </form>
      </header>

      <nav className="flex gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide">
        {["graficos", "matriz", "datos"].map(t => (
          <button 
            key={t} 
            onClick={() => handleTabChange(t)} 
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black transition-all ${currentTab === t ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-500 hover:text-slate-300'}`}
          >
            {t.replace('-', ' ').toUpperCase()}
          </button>
        ))}
      </nav>

      {/* Tab: Graficos */}
      {visitedTabs.includes('graficos') && (
        <div style={{ display: currentTab === 'graficos' ? 'block' : 'none' }}>
          <AnalyticsSection records={records} mode="charts" />
        </div>
      )}

      {/* Tab: Matriz */}
      {visitedTabs.includes('matriz') && (
        <div style={{ display: currentTab === 'matriz' ? 'block' : 'none' }}>
          <MatrixSection records={records} />
        </div>
      )}

      {/* Tab: Datos */}
      {visitedTabs.includes('datos') && (
        <div style={{ display: currentTab === 'datos' ? 'block' : 'none' }}>
          <DataExplorer records={records} />
        </div>
      )}

      <footer className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
          <span>Core Intelligence Engine v4.0</span>
          <div className="flex gap-6">
            <span>{records.length} DATA_POINTS</span>
            <span className="text-blue-500">Local Daemon: ACTIVE</span>
          </div>
      </footer>
    </main>
  );
}
