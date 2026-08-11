import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Building, MapPin, Calendar, FileText, Star, Check, AlertCircle } from 'lucide-react';
import { Contact, ContactCategory } from '../types';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contactData: Omit<Contact, 'id' | 'created_at' | 'updated_at'>, editingId?: string) => Promise<void>;
  editingContact?: Contact | null;
}

const AVATAR_COLORS = [
  { name: 'Azul', hex: '#3b82f6' },
  { name: 'Verde', hex: '#10b981' },
  { name: 'Roxo', hex: '#8b5cf6' },
  { name: 'Laranja', hex: '#f59e0b' },
  { name: 'Rosa', hex: '#ec4899' },
  { name: 'Ciano', hex: '#06b6d4' },
  { name: 'Índigo', hex: '#6366f1' },
  { name: 'Cinza', hex: '#64748b' },
];

const CATEGORIES: ContactCategory[] = ['Trabalho', 'Família', 'Amigos', 'Clientes', 'Outros'];

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingContact,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<ContactCategory>('Trabalho');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [address, setAddress] = useState('');
  const [birthday, setBirthday] = useState('');
  const [notes, setNotes] = useState('');
  const [avatarColor, setAvatarColor] = useState('#3b82f6');
  const [isFavorite, setIsFavorite] = useState(false);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingContact) {
      setName(editingContact.name || '');
      setPhone(editingContact.phone || '');
      setSecondaryPhone(editingContact.secondary_phone || '');
      setEmail(editingContact.email || '');
      setCategory(editingContact.category || 'Trabalho');
      setCompany(editingContact.company || '');
      setJobTitle(editingContact.job_title || '');
      setAddress(editingContact.address || '');
      setBirthday(editingContact.birthday || '');
      setNotes(editingContact.notes || '');
      setAvatarColor(editingContact.avatar_color || '#3b82f6');
      setIsFavorite(Boolean(editingContact.is_favorite));
    } else {
      // Reset
      setName('');
      setPhone('');
      setSecondaryPhone('');
      setEmail('');
      setCategory('Trabalho');
      setCompany('');
      setJobTitle('');
      setAddress('');
      setBirthday('');
      setNotes('');
      setAvatarColor('#3b82f6');
      setIsFavorite(false);
    }
    setError('');
  }, [editingContact, isOpen]);

  // Format phone number automatically as user types
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }

    setter(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, informe o nome completo do contato.');
      return;
    }
    if (!phone.trim()) {
      setError('Por favor, informe o telefone principal.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSave(
        {
          name: name.trim(),
          phone: phone.trim(),
          secondary_phone: secondaryPhone.trim(),
          email: email.trim(),
          category,
          company: company.trim(),
          job_title: jobTitle.trim(),
          address: address.trim(),
          birthday,
          notes: notes.trim(),
          avatar_color: avatarColor,
          is_favorite: isFavorite,
        },
        editingContact?.id
      );
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar contato';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">
                {editingContact ? 'Editar Contato' : 'Novo Contato'}
              </h2>
              <p className="text-xs text-slate-400">
                Preencha os dados abaixo para {editingContact ? 'atualizar' : 'cadastrar'} o contato
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl flex items-center gap-2.5 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Avatar Color & Favorite Row */}
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Cor do Avatar
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {AVATAR_COLORS.map((col) => (
                  <button
                    key={col.hex}
                    type="button"
                    onClick={() => setAvatarColor(col.hex)}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 relative"
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  >
                    {avatarColor === col.hex && (
                      <Check className="w-4 h-4 text-white drop-shadow-md" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isFavorite
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>{isFavorite ? 'Marcar como Favorito' : 'Favorito'}</span>
            </button>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Full Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nome Completo <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Maria Fernandes"
                  className="w-full bg-slate-800/90 border border-slate-700 text-slate-100 text-sm pl-9 pr-3 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ContactCategory)}
                className="w-full bg-slate-800/90 border border-slate-700 text-slate-100 text-sm px-3 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: maria@empresa.com"
                  className="w-full bg-slate-800/90 border border-slate-700 text-slate-100 text-sm pl-9 pr-3 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Primary Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Telefone Principal <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => handlePhoneChange(e, setPhone)}
                  placeholder="(11) 99999-9999"
                  className="w-full bg-slate-800/90 border border-slate-700 text-slate-100 text-sm pl-9 pr-3 py-2 rounded-xl font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Secondary Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Telefone Secundário / Fixo
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={secondaryPhone}
                  onChange={(e) => handlePhoneChange(e, setSecondaryPhone)}
                  placeholder="(11) 3333-4444"
                  className="w-full bg-slate-800/90 border border-slate-700 text-slate-100 text-sm pl-9 pr-3 py-2 rounded-xl font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Company */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Empresa / Organização
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Ex: Google Brasil"
                  className="w-full bg-slate-800/90 border border-slate-700 text-slate-100 text-sm pl-9 pr-3 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Cargo / Função
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Ex: Engenheira de Software"
                className="w-full bg-slate-800/90 border border-slate-700 text-slate-100 text-sm px-3 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Endereço
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex: Av. Paulista, 1000 - São Paulo, SP"
                  className="w-full bg-slate-800/90 border border-slate-700 text-slate-100 text-sm pl-9 pr-3 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Birthday */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Data de Nascimento
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 text-slate-100 text-sm pl-9 pr-3 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Observações / Notas
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anotações adicionais sobre o contato..."
                  className="w-full bg-slate-800/90 border border-slate-700 text-slate-100 text-sm pl-9 pr-3 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando...' : editingContact ? 'Salvar Alterações' : 'Cadastrar Contato'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
