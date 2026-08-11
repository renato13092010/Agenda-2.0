import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  CheckCircle,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  UploadCloud,
  Code,
  ExternalLink,
} from 'lucide-react';
import {
  getSupabaseCredentials,
  saveCustomSupabaseCredentials,
  testSupabaseConnection,
  SUPABASE_SQL_SCHEMA,
} from '../lib/supabase';
import { syncLocalContactsToSupabase } from '../lib/storage';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);
  const [status, setStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
    loading: boolean;
  }>({
    tested: false,
    success: false,
    message: '',
    loading: false,
  });

  const [syncStatus, setSyncStatus] = useState<{
    syncing: boolean;
    message: string;
  }>({
    syncing: false,
    message: '',
  });

  useEffect(() => {
    if (isOpen) {
      const creds = getSupabaseCredentials();
      setUrl(creds.url);
      setAnonKey(creds.anonKey);
      runTest();
    }
  }, [isOpen]);

  const runTest = async () => {
    setStatus((prev) => ({ ...prev, loading: true }));
    const result = await testSupabaseConnection();
    setStatus({
      tested: true,
      success: result.success,
      message: result.message,
      loading: false,
    });
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    saveCustomSupabaseCredentials(url, anonKey);
    await runTest();
    onSuccess();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleSyncData = async () => {
    setSyncStatus({ syncing: true, message: 'Sincronizando contatos...' });
    const res = await syncLocalContactsToSupabase();
    if (res.error) {
      setSyncStatus({ syncing: false, message: `Erro: ${res.error}` });
    } else {
      setSyncStatus({
        syncing: false,
        message: `${res.synced} contatos sincronizados com sucesso no Supabase!`,
      });
      onSuccess();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Configuração do Supabase</h2>
              <p className="text-xs text-slate-400">
                Conecte seu banco de dados PostgreSQL do Supabase para sincronização em nuvem
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

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Connection Status Box */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
              status.success
                ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                : 'bg-amber-950/40 border-amber-800/80 text-amber-200'
            }`}
          >
            {status.loading ? (
              <RefreshCw className="w-5 h-5 text-blue-400 animate-spin shrink-0 mt-0.5" />
            ) : status.success ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}

            <div className="flex-1 text-xs space-y-1">
              <p className="font-semibold text-sm">
                {status.loading
                  ? 'Testando conexão...'
                  : status.success
                  ? 'Supabase Ativo & Conectado'
                  : 'Aviso de Conexão'}
              </p>
              <p className="leading-relaxed opacity-90">{status.message}</p>
            </div>

            <button
              onClick={runTest}
              disabled={status.loading}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 shrink-0"
              title="Testar Conexão Novamente"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${status.loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Configuration Form */}
          <form onSubmit={handleSaveCredentials} className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <span>Credenciais da API do Supabase</span>
            </h3>

            <p className="text-xs text-slate-400">
              Você pode definir estas variáveis em seu arquivo <code className="text-blue-400 bg-slate-800 px-1 py-0.5 rounded">.env</code> como <code className="text-blue-400 bg-slate-800 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> e <code className="text-blue-400 bg-slate-800 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code>, ou preenchê-las manualmente abaixo:
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Project URL (VITE_SUPABASE_URL)
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full bg-slate-800/90 border border-slate-700 text-slate-100 text-sm px-3 py-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Anon API Key (VITE_SUPABASE_ANON_KEY)
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full bg-slate-800/90 border border-slate-700 text-slate-100 text-sm px-3 py-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Acessar Supabase Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
              >
                Salvar e Testar
              </button>
            </div>
          </form>

          {/* Sync Local Contacts to Supabase */}
          {status.success && (
            <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Sincronização Offline</h4>
                  <p className="text-[11px] text-slate-400">
                    Enviar contatos armazenados localmente para o seu banco Supabase
                  </p>
                </div>
                <button
                  onClick={handleSyncData}
                  disabled={syncStatus.syncing}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-50 shrink-0"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Sincronizar Agora</span>
                </button>
              </div>

              {syncStatus.message && (
                <p className="text-xs text-blue-300 bg-blue-950/50 p-2 rounded-lg border border-blue-900/50">
                  {syncStatus.message}
                </p>
              )}
            </div>
          )}

          {/* SQL Editor Code Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Code className="w-4 h-4 text-emerald-400" />
                <span>Script SQL de Criação da Tabela</span>
              </h3>

              <button
                onClick={handleCopySql}
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">SQL Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar SQL</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-emerald-300/90 overflow-x-auto max-h-48 whitespace-pre leading-relaxed">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>

        </div>

      </div>
    </div>
  );
};
