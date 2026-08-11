import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  Building,
  MapPin,
  Calendar,
  FileText,
  Star,
  Download,
  Copy,
  Check,
  MessageCircle,
  Edit2,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { Contact } from '../types';
import { downloadVCard, getWhatsAppLink } from '../lib/vcard';

interface ContactDetailModalProps {
  contact: Contact | null;
  onClose: () => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onToggleFavorite: (contact: Contact) => void;
}

export const ContactDetailModal: React.FC<ContactDetailModalProps> = ({
  contact,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const [copied, setCopied] = useState(false);

  if (!contact) return null;

  const initials = contact.name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const handleCopyInfo = () => {
    const text = [
      `Nome: ${contact.name}`,
      `Telefone: ${contact.phone}`,
      contact.secondary_phone ? `Telefone 2: ${contact.secondary_phone}` : null,
      contact.email ? `E-mail: ${contact.email}` : null,
      contact.company ? `Empresa: ${contact.company}` : null,
      contact.job_title ? `Cargo: ${contact.job_title}` : null,
      contact.address ? `Endereço: ${contact.address}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header Cover Banner */}
        <div className="h-28 bg-gradient-to-r from-blue-900 via-slate-800 to-indigo-900 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Avatar Card */}
        <div className="px-6 relative -mt-12 mb-4 flex items-end justify-between">
          <div
            className="w-20 h-20 rounded-2xl border-4 border-slate-900 shadow-xl flex items-center justify-center text-2xl font-bold text-white shrink-0"
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(contact)}
              className="p-2 bg-slate-800 hover:bg-slate-700/80 text-slate-300 rounded-xl border border-slate-700 transition-colors"
              title={contact.is_favorite ? 'Remover Favorito' : 'Marcar Favorito'}
            >
              <Star
                className={`w-4 h-4 ${
                  contact.is_favorite ? 'fill-amber-400 text-amber-400' : ''
                }`}
              />
            </button>

            <button
              onClick={() => {
                onClose();
                onEdit(contact);
              }}
              className="p-2 bg-slate-800 hover:bg-slate-700/80 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors"
              title="Editar"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                onClose();
                onDelete(contact);
              }}
              className="p-2 bg-slate-800 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 rounded-xl border border-slate-700 transition-colors"
              title="Excluir"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Contact Info Header */}
        <div className="px-6 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-slate-100">{contact.name}</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {contact.category}
            </span>
          </div>

          {(contact.job_title || contact.company) && (
            <p className="text-sm text-slate-400 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-slate-500 shrink-0" />
              <span>
                {contact.job_title}
                {contact.job_title && contact.company ? ' em ' : ''}
                {contact.company}
              </span>
            </p>
          )}
        </div>

        {/* Action Bar Buttons */}
        <div className="px-6 py-3 bg-slate-800/50 border-y border-slate-800 grid grid-cols-4 gap-2">
          
          <a
            href={getWhatsAppLink(contact.phone)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 transition-colors text-center"
          >
            <MessageCircle className="w-5 h-5 mb-1" />
            <span className="text-[11px] font-medium">WhatsApp</span>
          </a>

          <a
            href={`tel:${contact.phone}`}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 transition-colors text-center"
          >
            <Phone className="w-5 h-5 mb-1" />
            <span className="text-[11px] font-medium">Ligar</span>
          </a>

          <button
            onClick={() => downloadVCard(contact)}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 border border-violet-500/20 transition-colors text-center"
          >
            <Download className="w-5 h-5 mb-1" />
            <span className="text-[11px] font-medium">vCard</span>
          </button>

          <button
            onClick={handleCopyInfo}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors text-center"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 mb-1 text-emerald-400" />
                <span className="text-[11px] font-medium text-emerald-400">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 mb-1" />
                <span className="text-[11px] font-medium">Copiar</span>
              </>
            )}
          </button>

        </div>

        {/* Detailed Items List */}
        <div className="p-6 space-y-4 max-h-[45vh] overflow-y-auto">
          
          {/* Phones */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm text-slate-200">
              <Phone className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <p className="font-mono">{contact.phone}</p>
                <p className="text-[10px] text-slate-500">Telefone Principal</p>
              </div>
            </div>

            {contact.secondary_phone && (
              <div className="flex items-center gap-3 text-sm text-slate-200 pl-7">
                <div>
                  <p className="font-mono">{contact.secondary_phone}</p>
                  <p className="text-[10px] text-slate-500">Telefone Secundário</p>
                </div>
              </div>
            )}
          </div>

          {/* Email */}
          {contact.email && (
            <div className="flex items-center gap-3 text-sm text-slate-200 border-t border-slate-800/80 pt-3">
              <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
              <div className="min-w-0">
                <a
                  href={`mailto:${contact.email}`}
                  className="hover:underline hover:text-blue-400 truncate block"
                >
                  {contact.email}
                </a>
                <p className="text-[10px] text-slate-500">E-mail</p>
              </div>
            </div>
          )}

          {/* Address */}
          {contact.address && (
            <div className="flex items-start gap-3 text-sm text-slate-200 border-t border-slate-800/80 pt-3">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-slate-200">{contact.address}</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    contact.address
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-blue-400 hover:underline inline-flex items-center gap-1 mt-1"
                >
                  <span>Ver no Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Birthday */}
          {contact.birthday && (
            <div className="flex items-center gap-3 text-sm text-slate-200 border-t border-slate-800/80 pt-3">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <p>{new Date(contact.birthday + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                <p className="text-[10px] text-slate-500">Data de Nascimento</p>
              </div>
            </div>
          )}

          {/* Notes */}
          {contact.notes && (
            <div className="flex items-start gap-3 text-sm text-slate-200 border-t border-slate-800/80 pt-3">
              <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-300 text-xs whitespace-pre-wrap leading-relaxed">
                  {contact.notes}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">Observações</p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-800/30 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-500">
            Criado em {new Date(contact.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>

      </div>
    </div>
  );
};
