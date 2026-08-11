import React from 'react';
import {
  UserPlus,
  Search,
  LayoutGrid,
  List,
  Database,
  Download,
  BarChart2,
  X,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { ViewMode } from '../types';

interface NavbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenAddModal: () => void;
  onOpenSupabaseModal: () => void;
  onOpenImportExportModal: () => void;
  onOpenStatsModal: () => void;
  isSupabaseConnected: boolean;
  totalContacts: number;
  isLoading: boolean;
  onRefresh: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onOpenAddModal,
  onOpenSupabaseModal,
  onOpenImportExportModal,
  onOpenStatsModal,
  isSupabaseConnected,
  totalContacts,
  isLoading,
  onRefresh,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="font-bold text-lg text-white">📇</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-base sm:text-lg text-slate-100 tracking-tight leading-none">
                  Cadastro de Contatos
                </h1>
                <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-full font-medium border border-slate-700">
                  {totalContacts}
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block mt-0.5">
                {isSupabaseConnected ? 'Conectado ao Supabase DB' : 'Modo Armazenamento Local'}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar por nome, telefone, e-mail ou empresa..."
                className="w-full bg-slate-800/90 text-slate-100 placeholder-slate-400 text-sm pl-9 pr-8 py-2 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Controls & Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Atualizar lista de contatos"
              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
            </button>

            {/* Supabase Status Button */}
            <button
              onClick={onOpenSupabaseModal}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                isSupabaseConnected
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/50'
                  : 'bg-amber-950/40 text-amber-300 border-amber-800/60 hover:bg-amber-900/50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <Database className="w-3.5 h-3.5" />
              <span className="hidden md:inline">
                {isSupabaseConnected ? 'Supabase On' : 'Configurar DB'}
              </span>
            </button>

            {/* View Mode Switcher */}
            <div className="hidden sm:flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-1.5 rounded ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                } transition-colors`}
                title="Visualização em Grade"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`p-1.5 rounded ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                } transition-colors`}
                title="Visualização em Lista"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Stats Button */}
            <button
              onClick={onOpenStatsModal}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
            >
              <BarChart2 className="w-4 h-4 text-slate-400" />
              <span>Estatísticas</span>
            </button>

            {/* Import / Export Button */}
            <button
              onClick={onOpenImportExportModal}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Arquivos</span>
            </button>

            {/* Add Contact Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-3.5 py-2 rounded-lg text-sm font-medium shadow-md shadow-blue-600/20 active:scale-[0.98] transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden xs:inline">Novo Contato</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
