import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Star,
  Search,
  Filter,
  ArrowUpDown,
  Sparkles,
  Database,
  LayoutGrid,
  List,
  AlertCircle,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { Contact, ViewMode, SortOption } from './types';
import {
  fetchAllContacts,
  createContact,
  updateContact,
  deleteContact,
  toggleFavorite,
  saveLocalContacts,
} from './lib/storage';
import { SAMPLE_CONTACTS } from './data/sampleContacts';
import { Navbar } from './components/Navbar';
import { CategorySidebar } from './components/CategorySidebar';
import { ContactCard } from './components/ContactCard';
import { ContactRow } from './components/ContactRow';
import { ContactModal } from './components/ContactModal';
import { ContactDetailModal } from './components/ContactDetailModal';
import { SupabaseSetupModal } from './components/SupabaseSetupModal';
import { ImportExportModal } from './components/ImportExportModal';
import { StatsModal } from './components/StatsModal';

export default function App() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [supabaseError, setSupabaseError] = useState<string | undefined>(undefined);

  // Filters & Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLetter, setSelectedLetter] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOption, setSortOption] = useState<SortOption>('name_asc');

  // Modals
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [selectedDetailContact, setSelectedDetailContact] = useState<Contact | null>(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  // Fetch contacts on mount
  const loadContacts = async () => {
    setIsLoading(true);
    const result = await fetchAllContacts();
    setContacts(result.contacts);
    setIsSupabaseConnected(result.isFromSupabase);
    setSupabaseError(result.error);
    setIsLoading(false);
  };

  useEffect(() => {
    loadContacts();
  }, []);

  // Category counts calculation
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Trabalho: 0,
      Família: 0,
      Amigos: 0,
      Clientes: 0,
      Outros: 0,
    };
    contacts.forEach((c) => {
      if (counts[c.category] !== undefined) {
        counts[c.category]++;
      } else {
        counts.Outros++;
      }
    });
    return counts;
  }, [contacts]);

  const favoritesCount = useMemo(
    () => contacts.filter((c) => c.is_favorite).length,
    [contacts]
  );

  // Filter & Sort Logic
  const filteredContacts = useMemo(() => {
    return contacts
      .filter((c) => {
        // Category / Favorites filter
        if (selectedCategory === 'favorites') {
          if (!c.is_favorite) return false;
        } else if (selectedCategory !== 'all') {
          if (c.category !== selectedCategory) return false;
        }

        // Letter jump filter
        if (selectedLetter) {
          if (!c.name.toUpperCase().startsWith(selectedLetter)) return false;
        }

        // Search Term filter
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase();
          const matchName = c.name.toLowerCase().includes(query);
          const matchPhone = c.phone.replace(/[^\d]/g, '').includes(query.replace(/[^\d]/g, ''));
          const matchEmail = c.email?.toLowerCase().includes(query) || false;
          const matchCompany = c.company?.toLowerCase().includes(query) || false;
          const matchJob = c.job_title?.toLowerCase().includes(query) || false;
          const matchNotes = c.notes?.toLowerCase().includes(query) || false;

          return matchName || matchPhone || matchEmail || matchCompany || matchJob || matchNotes;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'name_asc') {
          return a.name.localeCompare(b.name, 'pt-BR');
        }
        if (sortOption === 'name_desc') {
          return b.name.localeCompare(a.name, 'pt-BR');
        }
        if (sortOption === 'recently_added') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortOption === 'category') {
          return a.category.localeCompare(b.category, 'pt-BR');
        }
        return 0;
      });
  }, [contacts, selectedCategory, selectedLetter, searchTerm, sortOption]);

  // Handlers
  const handleOpenAddModal = () => {
    setEditingContact(null);
    setIsContactModalOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setIsContactModalOpen(true);
  };

  const handleSaveContact = async (
    contactData: Omit<Contact, 'id' | 'created_at' | 'updated_at'>,
    editingId?: string
  ) => {
    if (editingId) {
      const res = await updateContact(editingId, contactData);
      setContacts((prev) => prev.map((c) => (c.id === editingId ? res.contact : c)));
      if (selectedDetailContact?.id === editingId) {
        setSelectedDetailContact(res.contact);
      }
    } else {
      const res = await createContact(contactData);
      setContacts((prev) => [res.contact, ...prev]);
    }
  };

  const handleToggleFavorite = async (contact: Contact) => {
    const updated = await toggleFavorite(contact);
    setContacts((prev) => prev.map((c) => (c.id === contact.id ? updated : c)));
    if (selectedDetailContact?.id === contact.id) {
      setSelectedDetailContact(updated);
    }
  };

  const handleDeleteContact = async (contact: Contact) => {
    if (confirm(`Tem certeza que deseja excluir o contato "${contact.name}"?`)) {
      await deleteContact(contact.id);
      setContacts((prev) => prev.filter((c) => c.id !== contact.id));
      if (selectedDetailContact?.id === contact.id) {
        setSelectedDetailContact(null);
      }
    }
  };

  const handleLoadSamples = () => {
    saveLocalContacts(SAMPLE_CONTACTS);
    setContacts(SAMPLE_CONTACTS);
  };

  const handleImportContacts = async (
    importedList: Omit<Contact, 'id' | 'created_at' | 'updated_at'>[]
  ) => {
    for (const item of importedList) {
      await createContact(item);
    }
    await loadContacts();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      
      {/* Navigation Topbar */}
      <Navbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenAddModal={handleOpenAddModal}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenImportExportModal={() => setIsImportExportModalOpen(true)}
        onOpenStatsModal={() => setIsStatsModalOpen(true)}
        isSupabaseConnected={isSupabaseConnected}
        totalContacts={contacts.length}
        isLoading={isLoading}
        onRefresh={loadContacts}
      />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Offline / Supabase Connection Notice Banner */}
        {!isSupabaseConnected && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-200/90 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-amber-300">Modo Armazenamento Local Ativo</p>
                <p className="text-slate-400 mt-0.5">
                  Seus contatos estão salvos no navegador. Deseja conectar o banco Supabase em nuvem?
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold transition-colors shrink-0"
            >
              Conectar Supabase
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Category Navigation Sidebar */}
          <CategorySidebar
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            categoryCounts={categoryCounts}
            totalCount={contacts.length}
            favoritesCount={favoritesCount}
            onLoadSamples={handleLoadSamples}
            selectedLetter={selectedLetter}
            onSelectLetter={setSelectedLetter}
          />

          {/* Main Contacts Area */}
          <main className="flex-1 w-full space-y-4">
            
            {/* Filter Bar Header */}
            <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-slate-100 text-lg">
                    {selectedCategory === 'all'
                      ? 'Todos os Contatos'
                      : selectedCategory === 'favorites'
                      ? 'Contatos Favoritos'
                      : `Categoria: ${selectedCategory}`}
                  </h2>
                  {selectedLetter && (
                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                      Letra {selectedLetter}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Exibindo {filteredContacts.length} de {contacts.length} contatos cadastrados
                </p>
              </div>

              {/* Sorting Switcher */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                  <ArrowUpDown className="w-3.5 h-3.5 text-blue-400" />
                  <span>Ordem:</span>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="bg-transparent text-slate-100 font-medium focus:outline-none cursor-pointer"
                  >
                    <option value="name_asc">Nome (A-Z)</option>
                    <option value="name_desc">Nome (Z-A)</option>
                    <option value="recently_added">Mais Recentes</option>
                    <option value="category">Por Categoria</option>
                  </select>
                </div>

                {/* Mobile View Toggle */}
                <div className="flex sm:hidden items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg ${
                      viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg ${
                      viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Loading Skeleton State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 animate-pulse space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-slate-800 rounded w-3/4" />
                        <div className="h-3 bg-slate-800 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="h-3 bg-slate-800 rounded w-full" />
                    <div className="h-8 bg-slate-800 rounded-xl w-full" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredContacts.length === 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto my-8 space-y-4">
                <div className="w-16 h-16 bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-100">
                    Nenhum contato encontrado
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {searchTerm
                      ? `Não encontramos resultados para "${searchTerm}". Tente buscar por outro termo.`
                      : selectedCategory !== 'all' || selectedLetter
                      ? 'Nenhum contato nesta categoria ou filtro.'
                      : 'Sua agenda ainda está vazia. Comece cadastrando seu primeiro contato!'}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
                  {searchTerm || selectedCategory !== 'all' || selectedLetter ? (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                        setSelectedLetter('');
                      }}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
                    >
                      Limpar Filtros
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleOpenAddModal}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Cadastrar Contato</span>
                      </button>

                      <button
                        onClick={handleLoadSamples}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
                      >
                        Carregar Exemplo
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Contacts Grid View */}
            {!isLoading && filteredContacts.length > 0 && viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredContacts.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    onSelect={(c) => setSelectedDetailContact(c)}
                    onToggleFavorite={handleToggleFavorite}
                    onEdit={handleEditContact}
                    onDelete={handleDeleteContact}
                  />
                ))}
              </div>
            )}

            {/* Contacts List View */}
            {!isLoading && filteredContacts.length > 0 && viewMode === 'list' && (
              <div className="space-y-2">
                {filteredContacts.map((contact) => (
                  <ContactRow
                    key={contact.id}
                    contact={contact}
                    onSelect={(c) => setSelectedDetailContact(c)}
                    onToggleFavorite={handleToggleFavorite}
                    onEdit={handleEditContact}
                    onDelete={handleDeleteContact}
                  />
                ))}
              </div>
            )}

          </main>

        </div>

      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-900/50 py-4 text-center text-xs text-slate-500">
        <p>
          Cadastro de Contatos &bull; Desenvolvido com React, Tailwind CSS e Supabase DB
        </p>
      </footer>

      {/* Modals */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onSave={handleSaveContact}
        editingContact={editingContact}
      />

      <ContactDetailModal
        contact={selectedDetailContact}
        onClose={() => setSelectedDetailContact(null)}
        onEdit={handleEditContact}
        onDelete={handleDeleteContact}
        onToggleFavorite={handleToggleFavorite}
      />

      <SupabaseSetupModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onSuccess={loadContacts}
      />

      <ImportExportModal
        isOpen={isImportExportModalOpen}
        onClose={() => setIsImportExportModalOpen(false)}
        contacts={contacts}
        onImportContacts={handleImportContacts}
      />

      <StatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        contacts={contacts}
      />

    </div>
  );
}
