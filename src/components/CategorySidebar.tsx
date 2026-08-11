import React from 'react';
import {
  Users,
  Star,
  Briefcase,
  Heart,
  Smile,
  Building,
  Tag,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { ContactCategory } from '../types';

interface CategorySidebarProps {
  selectedCategory: string; // 'all' | 'favorites' | ContactCategory
  onSelectCategory: (category: string) => void;
  categoryCounts: Record<string, number>;
  totalCount: number;
  favoritesCount: number;
  onLoadSamples: () => void;
  selectedLetter: string;
  onSelectLetter: (letter: string) => void;
}

const CATEGORIES: { id: ContactCategory; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'Trabalho', label: 'Trabalho', icon: <Briefcase className="w-4 h-4" />, color: 'text-blue-500 bg-blue-500/10' },
  { id: 'Família', label: 'Família', icon: <Heart className="w-4 h-4" />, color: 'text-amber-500 bg-amber-500/10' },
  { id: 'Amigos', label: 'Amigos', icon: <Smile className="w-4 h-4" />, color: 'text-emerald-500 bg-emerald-500/10' },
  { id: 'Clientes', label: 'Clientes', icon: <Building className="w-4 h-4" />, color: 'text-violet-500 bg-violet-500/10' },
  { id: 'Outros', label: 'Outros', icon: <Tag className="w-4 h-4" />, color: 'text-slate-400 bg-slate-500/10' },
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  totalCount,
  favoritesCount,
  onLoadSamples,
  selectedLetter,
  onSelectLetter,
}) => {
  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-6">
      
      {/* Category Navigation Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 mb-3">
          Categorias
        </h2>

        <nav className="space-y-1">
          {/* All Contacts */}
          <button
            onClick={() => {
              onSelectCategory('all');
              onSelectLetter('');
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              selectedCategory === 'all' && !selectedLetter
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4" />
              <span>Todos os Contatos</span>
            </div>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                selectedCategory === 'all' && !selectedLetter
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {totalCount}
            </span>
          </button>

          {/* Favorites */}
          <button
            onClick={() => {
              onSelectCategory('favorites');
              onSelectLetter('');
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              selectedCategory === 'favorites' && !selectedLetter
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>Favoritos</span>
            </div>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                selectedCategory === 'favorites' && !selectedLetter
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {favoritesCount}
            </span>
          </button>

          <div className="pt-2 pb-1">
            <div className="h-px bg-slate-800 my-1" />
          </div>

          {/* Individual Categories */}
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id && !selectedLetter;
            const count = categoryCounts[cat.id] || 0;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  onSelectLetter('');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-slate-800 text-white font-semibold ring-1 ring-slate-700'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${cat.color}`}>
                    {cat.icon}
                  </div>
                  <span>{cat.label}</span>
                </div>
                <span className="text-xs text-slate-500">{count}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Quick Alphabetical Jump */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Índice de Letras
          </h2>
          {selectedLetter && (
            <button
              onClick={() => onSelectLetter('')}
              className="text-xs text-blue-400 hover:underline"
            >
              Limpar
            </button>
          )}
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {ALPHABET.map((letter) => {
            const isSelected = selectedLetter === letter;
            return (
              <button
                key={letter}
                onClick={() => onSelectLetter(letter)}
                className={`py-1 rounded text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sample Loader Promo Card */}
      <div className="bg-gradient-to-br from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-900/40 rounded-2xl p-4 text-center">
        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-2">
          <Sparkles className="w-4 h-4" />
        </div>
        <h3 className="text-xs font-semibold text-slate-200 mb-1">Precisa de dados de teste?</h3>
        <p className="text-xs text-slate-400 mb-3">
          Carregue contatos de exemplo para testar as buscas, filtros e WhatsApp.
        </p>
        <button
          onClick={onLoadSamples}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
        >
          <span>Carregar Exemplo</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </aside>
  );
};
