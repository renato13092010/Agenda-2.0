import React from 'react';
import {
  Star,
  Phone,
  Mail,
  Building,
  MessageCircle,
  Edit2,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import { Contact } from '../types';
import { getWhatsAppLink } from '../lib/vcard';

interface ContactRowProps {
  contact: Contact;
  onSelect: (contact: Contact) => void;
  onToggleFavorite: (contact: Contact) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
}

const CATEGORY_STYLES: Record<string, string> = {
  Trabalho: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Família: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Amigos: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Clientes: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  Outros: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

export const ContactRow: React.FC<ContactRowProps> = ({
  contact,
  onSelect,
  onToggleFavorite,
  onEdit,
  onDelete,
}) => {
  const initials = contact.name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const categoryStyle = CATEGORY_STYLES[contact.category] || CATEGORY_STYLES.Outros;

  return (
    <div className="group bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-3.5 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
      
      {/* Left Details */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        
        {/* Favorite */}
        <button
          onClick={() => onToggleFavorite(contact)}
          className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-amber-400 transition-colors shrink-0"
        >
          <Star
            className={`w-4 h-4 ${
              contact.is_favorite ? 'fill-amber-400 text-amber-400' : ''
            }`}
          />
        </button>

        {/* Avatar */}
        <div
          onClick={() => onSelect(contact)}
          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs cursor-pointer shrink-0"
          style={{ backgroundColor: contact.avatar_color || '#3b82f6' }}
        >
          {contact.avatar_url ? (
            <img
              src={contact.avatar_url}
              alt={contact.name}
              className="w-full h-full rounded-xl object-cover"
            />
          ) : (
            initials
          )}
        </div>

        {/* Name & Company */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              onClick={() => onSelect(contact)}
              className="font-semibold text-slate-100 text-sm hover:text-blue-400 cursor-pointer transition-colors truncate"
            >
              {contact.name}
            </h3>
            <span
              className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${categoryStyle}`}
            >
              {contact.category}
            </span>
          </div>

          {(contact.company || contact.job_title) && (
            <p className="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
              <Building className="w-3 h-3 text-slate-500 shrink-0" />
              <span>
                {contact.job_title ? `${contact.job_title}` : ''}
                {contact.job_title && contact.company ? ' • ' : ''}
                {contact.company ? `${contact.company}` : ''}
              </span>
            </p>
          )}
        </div>

      </div>

      {/* Middle Phone & Email */}
      <div className="flex items-center gap-4 text-xs text-slate-300 font-mono w-full sm:w-auto shrink-0 justify-between sm:justify-end">
        <div className="flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-blue-400" />
          <span>{contact.phone}</span>
        </div>

        {contact.email && (
          <div className="hidden lg:flex items-center gap-1.5 text-slate-400 max-w-[180px] truncate">
            <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">{contact.email}</span>
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <a
          href={getWhatsAppLink(contact.phone)}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 rounded-lg transition-colors"
          title="WhatsApp"
        >
          <MessageCircle className="w-4 h-4" />
        </a>

        <a
          href={`tel:${contact.phone}`}
          className="p-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-lg transition-colors"
          title="Ligar"
        >
          <Phone className="w-4 h-4" />
        </a>

        <button
          onClick={() => onEdit(contact)}
          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
          title="Editar"
        >
          <Edit2 className="w-4 h-4" />
        </button>

        <button
          onClick={() => onDelete(contact)}
          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
          title="Excluir"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <button
          onClick={() => onSelect(contact)}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Detalhes"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
