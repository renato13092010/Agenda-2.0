import React from 'react';
import { X, BarChart2, Users, Star, Mail, Building, Briefcase, Heart, Smile, Tag } from 'lucide-react';
import { Contact, ContactCategory } from '../types';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  contacts,
}) => {
  if (!isOpen) return null;

  const total = contacts.length;
  const favorites = contacts.filter((c) => c.is_favorite).length;
  const withEmail = contacts.filter((c) => Boolean(c.email)).length;
  const withCompany = contacts.filter((c) => Boolean(c.company)).length;

  const categories: ContactCategory[] = ['Trabalho', 'Família', 'Amigos', 'Clientes', 'Outros'];
  const byCategory = categories.reduce((acc, cat) => {
    acc[cat] = contacts.filter((c) => c.category === cat).length;
    return acc;
  }, {} as Record<ContactCategory, number>);

  const categoryColors: Record<ContactCategory, string> = {
    Trabalho: 'bg-blue-500 text-blue-400',
    Família: 'bg-amber-500 text-amber-400',
    Amigos: 'bg-emerald-500 text-emerald-400',
    Clientes: 'bg-violet-500 text-violet-400',
    Outros: 'bg-slate-400 text-slate-400',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Estatísticas da Agenda</h2>
              <p className="text-xs text-slate-400">Métricas e distribuição dos seus contatos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-800/60 border border-slate-800 rounded-xl text-center">
              <Users className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-slate-100">{total}</p>
              <p className="text-[10px] text-slate-400">Total Contatos</p>
            </div>

            <div className="p-3 bg-slate-800/60 border border-slate-800 rounded-xl text-center">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-slate-100">{favorites}</p>
              <p className="text-[10px] text-slate-400">Favoritos</p>
            </div>

            <div className="p-3 bg-slate-800/60 border border-slate-800 rounded-xl text-center">
              <Mail className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-slate-100">{withEmail}</p>
              <p className="text-[10px] text-slate-400">Com E-mail</p>
            </div>

            <div className="p-3 bg-slate-800/60 border border-slate-800 rounded-xl text-center">
              <Building className="w-4 h-4 text-violet-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-slate-100">{withCompany}</p>
              <p className="text-[10px] text-slate-400">Com Empresa</p>
            </div>
          </div>

          {/* Category Distribution Bars */}
          <div className="space-y-3 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Distribuição por Categoria
            </h3>

            <div className="space-y-2.5">
              {categories.map((cat) => {
                const count = byCategory[cat];
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                const barColor = categoryColors[cat].split(' ')[0];

                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{cat}</span>
                      <span className="text-slate-400 font-mono">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
