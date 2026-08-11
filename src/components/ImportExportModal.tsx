import React, { useState } from 'react';
import {
  X,
  Download,
  Upload,
  FileSpreadsheet,
  FileCode,
  FileText,
  CheckCircle,
  AlertCircle,
  FileUp,
} from 'lucide-react';
import { Contact } from '../types';
import { downloadVCard } from '../lib/vcard';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  onImportContacts: (imported: Omit<Contact, 'id' | 'created_at' | 'updated_at'>[]) => Promise<void>;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  contacts,
  onImportContacts,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewContacts, setPreviewContacts] = useState<Omit<Contact, 'id' | 'created_at' | 'updated_at'>[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  if (!isOpen) return null;

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Nome', 'Telefone', 'Telefone Secundario', 'Email', 'Categoria', 'Empresa', 'Cargo', 'Endereco', 'Aniversario', 'Notas'];
    const rows = contacts.map((c) => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.phone}"`,
      `"${c.secondary_phone || ''}"`,
      `"${c.email || ''}"`,
      `"${c.category || ''}"`,
      `"${c.company || ''}"`,
      `"${c.job_title || ''}"`,
      `"${c.address || ''}"`,
      `"${c.birthday || ''}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contatos_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(contacts, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_contatos_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export All as vCard
  const handleExportAllVCards = () => {
    contacts.forEach((c) => downloadVCard(c));
  };

  // Handle File Upload for Import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportMessage(null);
    const reader = new FileReader();

    if (file.name.endsWith('.json')) {
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            const valid = parsed.map((item) => ({
              name: item.name || 'Sem nome',
              phone: item.phone || '',
              secondary_phone: item.secondary_phone || '',
              email: item.email || '',
              category: item.category || 'Outros',
              company: item.company || '',
              job_title: item.job_title || '',
              address: item.address || '',
              birthday: item.birthday || '',
              notes: item.notes || '',
              avatar_color: item.avatar_color || '#3b82f6',
              is_favorite: Boolean(item.is_favorite),
            }));
            setPreviewContacts(valid);
          } else {
            setImportMessage({ type: 'error', text: 'Formato JSON inválido. Esperava-se uma lista de contatos.' });
          }
        } catch {
          setImportMessage({ type: 'error', text: 'Erro ao processar arquivo JSON.' });
        }
      };
      reader.readAsText(file);
    } else if (file.name.endsWith('.csv')) {
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const lines = text.split('\n').filter((l) => l.trim().length > 0);
          if (lines.length < 2) {
            setImportMessage({ type: 'error', text: 'O arquivo CSV está vazio ou sem dados.' });
            return;
          }

          const parsedList: Omit<Contact, 'id' | 'created_at' | 'updated_at'>[] = [];
          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
            if (cols.length >= 2 && cols[0]) {
              parsedList.push({
                name: cols[0],
                phone: cols[1] || '',
                secondary_phone: cols[2] || '',
                email: cols[3] || '',
                category: (cols[4] as any) || 'Outros',
                company: cols[5] || '',
                job_title: cols[6] || '',
                address: cols[7] || '',
                birthday: cols[8] || '',
                notes: cols[9] || '',
                avatar_color: '#3b82f6',
                is_favorite: false,
              });
            }
          }
          setPreviewContacts(parsedList);
        } catch {
          setImportMessage({ type: 'error', text: 'Erro ao processar arquivo CSV.' });
        }
      };
      reader.readAsText(file);
    } else {
      setImportMessage({ type: 'error', text: 'Por favor, selecione um arquivo no formato .csv ou .json.' });
    }
  };

  const handleConfirmImport = async () => {
    if (previewContacts.length === 0) return;
    setIsImporting(true);
    try {
      await onImportContacts(previewContacts);
      setImportMessage({
        type: 'success',
        text: `${previewContacts.length} contatos importados com sucesso!`,
      });
      setPreviewContacts([]);
    } catch {
      setImportMessage({ type: 'error', text: 'Erro ao importar contatos.' });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Importar & Exportar</h2>
              <p className="text-xs text-slate-400">Gerencie backups e arquivos CSV/JSON/vCard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 px-6 pt-3 gap-4">
          <button
            onClick={() => setActiveTab('export')}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'export'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Exportar Contatos ({contacts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'import'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Importar de Arquivo</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          {activeTab === 'export' ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 mb-2">
                Escolha o formato desejado para exportar seus contatos:
              </p>

              {/* CSV Export */}
              <button
                onClick={handleExportCSV}
                className="w-full flex items-center justify-between p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-200">Planilha CSV (.csv)</p>
                    <p className="text-[11px] text-slate-400">Ideal para abrir no Excel ou Google Sheets</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
              </button>

              {/* JSON Backup Export */}
              <button
                onClick={handleExportJSON}
                className="w-full flex items-center justify-between p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-200">Backup JSON Completo (.json)</p>
                    <p className="text-[11px] text-slate-400">Preserva todas as propriedades e observações</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
              </button>

              {/* vCards Export */}
              <button
                onClick={handleExportAllVCards}
                className="w-full flex items-center justify-between p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-200">Cartões de Visita vCard (.vcf)</p>
                    <p className="text-[11px] text-slate-400">Compatível com Android, iOS e Google Contacts</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-violet-400 transition-colors" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              
              {importMessage && (
                <div
                  className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs ${
                    importMessage.type === 'success'
                      ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/50 border-rose-800 text-rose-300'
                  }`}
                >
                  {importMessage.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{importMessage.text}</span>
                </div>
              )}

              <div className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-800/40 relative">
                <input
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <FileUp className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-200 mb-1">
                  Clique ou arraste um arquivo .csv ou .json
                </p>
                <p className="text-[11px] text-slate-500">
                  Importe listas exportadas de planilhas ou de outros backups
                </p>
              </div>

              {previewContacts.length > 0 && (
                <div className="space-y-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                  <div className="flex items-center justify-between text-xs text-slate-200">
                    <span className="font-semibold">Pré-visualização da Importação</span>
                    <span className="text-blue-400 font-mono">{previewContacts.length} contatos</span>
                  </div>

                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                    {previewContacts.map((c, i) => (
                      <div key={i} className="text-xs text-slate-300 flex justify-between py-1 border-b border-slate-700/50">
                        <span className="font-medium truncate max-w-[200px]">{c.name}</span>
                        <span className="text-slate-400 font-mono">{c.phone}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleConfirmImport}
                    disabled={isImporting}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
                  >
                    {isImporting ? 'Importando...' : `Confirmar Importação de ${previewContacts.length} Contatos`}
                  </button>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
