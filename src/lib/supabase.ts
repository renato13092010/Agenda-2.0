import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get credentials from environment or localStorage override
export function getSupabaseCredentials() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const customUrl = localStorage.getItem('custom_supabase_url') || '';
  const customKey = localStorage.getItem('custom_supabase_key') || '';

  const url = customUrl || envUrl;
  const anonKey = customKey || envKey;

  return { url, anonKey, isConfigured: Boolean(url && anonKey) };
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseCredentials();

  if (!isConfigured) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, anonKey);
    } catch (err) {
      console.error('Erro ao inicializar Supabase:', err);
      return null;
    }
  }

  return supabaseInstance;
}

// Save custom Supabase credentials
export function saveCustomSupabaseCredentials(url: string, anonKey: string) {
  if (url && anonKey) {
    localStorage.setItem('custom_supabase_url', url.trim());
    localStorage.setItem('custom_supabase_key', anonKey.trim());
  } else {
    localStorage.removeItem('custom_supabase_url');
    localStorage.removeItem('custom_supabase_key');
  }
  supabaseInstance = null; // reset client
}

// Test connection
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase não configurado. Forneça a URL do Projeto e a Chave Anon (API Key).',
    };
  }

  try {
    const { error } = await client.from('contacts').select('id').limit(1);
    if (error) {
      if (error.code === '42P01') { // relation "contacts" does not exist
        return {
          success: false,
          message: 'Conectado ao Supabase! Porém, a tabela "contacts" ainda não foi criada no seu banco.',
        };
      }
      return {
        success: false,
        message: `Erro do Supabase: ${error.message} (Código: ${error.code})`,
      };
    }

    return {
      success: true,
      message: 'Conexão com o Supabase estabelecida com sucesso! Tabela "contacts" encontrada.',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido ao conectar';
    return {
      success: false,
      message: `Falha na conexão: ${msg}`,
    };
  }
}

export const SUPABASE_SQL_SCHEMA = `-- Copie e cole este código no SQL Editor do seu Supabase Dashboard:

CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    secondary_phone TEXT,
    category TEXT DEFAULT 'Outros',
    company TEXT,
    job_title TEXT,
    address TEXT,
    birthday DATE,
    notes TEXT,
    avatar_color TEXT DEFAULT '#3b82f6',
    avatar_url TEXT,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Política de acesso permissiva para testes e uso público
CREATE POLICY "Permitir acesso total aos contatos" 
ON public.contacts 
FOR ALL 
USING (true) 
WITH CHECK (true);
`;
