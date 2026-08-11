import React from 'react';
import {
  Star,
  Phone,
  Mail,
  Building,
  MapPin,
  MessageCircle,
  MoreVertical,
  Edit2,
  Trash2,
  FileText,
} from 'lucide-react';
import { Contact } from '../types';
import { getWhatsAppLink } from '../lib/vcard';

interface ContactCardProps {
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

export const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  onSelect,
  onToggleFavorite,
  onEdit,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const initials = contact.name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const categoryStyle = CATEGORY_STYLES[contact.category] || CATEGORY_STYLES.Outros;

  return (
    <div className="group relative bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:shadow-slate-950/50 transition-all duration-200 flex flex-col justify-between">
      
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          
          {/* Avatar & Category */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => onSelect(contact)}
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-base shadow-md cursor-pointer transform group-hover:scale-105 transition-transform shrink-0"
              style={{ backgroundColor: contact.avatar_color || '#3b82f6' }}
            >
              {contact.avatar_url ? (
                <img
                  src={contact.avatar_url}
                  alt={contact.name}
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                initials
              )}
            </div>

            <div>
              <span
                className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${categoryStyle} mb-1`}
              >
                {contact.category}
              </span>
              <h3
                onClick={() => onSelect(contact)}
                className="font-semibold text-slate-100 text-base leading-snug cursor-pointer hover:text-blue-400 transition-colors line-clamp-1"
              >
                {contact.name}
              </h3>
            </div>
          </div>

          {/* Favorite & Dropdown Menu */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onToggleFavorite(contact)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
              title={contact.is_favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <Star
                className={`w-4 h-4 ${
                  contact.is_favorite ? 'fill-amber-400 text-amber-400' : ''
                }`}
              />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-8 z-20 w-40 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 text-xs">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onSelect(contact);
                      }}
                      className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-700/80 flex items-center gap-2"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-400" />
                      Ver Detalhes
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onEdit(contact);
                      }}
                      className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-700/80 flex items-center gap-2"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                      Editar
                    </button>
                    <div className="h-px bg-slate-700 my-1" />
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(contact);
                      }}
                      className="w-full text-left px-3 py-2 text-rose-400 hover:bg-slate-700/80 flex items-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Excluir
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>

        {/* Company & Job */}
        {(contact.company || contact.job_title) && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3 line-clamp-1">
            <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>
              {contact.job_title ? `${contact.job_title}` : ''}
              {contact.job_title && contact.company ? ' em ' : ''}
              {contact.company ? `${contact.company}` : ''}
            </span>
          </div>
        )}

        {/* Primary Phone */}
        <div className="flex items-center gap-2 text-sm text-slate-300 font-mono mb-2">
          <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>{contact.phone}</span>
        </div>

        {/* Email */}
        {contact.email && (
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 truncate">
            <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">{contact.email}</span>
          </div>
        )}

        {/* Address */}
        {contact.address && (
          <div className="flex items-center gap-2 text-xs text-slate-500 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="line-clamp-1">{contact.address}</span>
          </div>
        )}
      </div>

      {/* Quick Action Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <a
          href={getWhatsAppLink(contact.phone)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-medium transition-colors"
          title="Iniciar conversa no WhatsApp"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </a>

        <a
          href={`tel:${contact.phone}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-xl text-xs font-medium transition-colors"
          title="Ligar"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Ligar</span>
        </a>

        {contact.email && (
          <a
            href={`mailto:${contact.email}`}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
            title="Enviar e-mail"
          >
            <Mail className="w-4 h-4" />
          </a>
        )}
      </div>

    </div>
  );
};
