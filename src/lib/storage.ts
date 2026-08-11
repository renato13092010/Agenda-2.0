import { Contact } from '../types';
import { SAMPLE_CONTACTS } from '../data/sampleContacts';
import { getSupabaseClient, getSupabaseCredentials } from './supabase';

const LOCAL_STORAGE_KEY = 'contacts_app_data_v1';

// Load contacts from LocalStorage
export function getLocalContacts(): Contact[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Erro ao ler contatos do localStorage:', err);
    return [];
  }
}

// Save contacts to LocalStorage
export function saveLocalContacts(contacts: Contact[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(contacts));
  } catch (err) {
    console.error('Erro ao salvar no localStorage:', err);
  }
}

// Initialize contacts: if empty, load sample contacts
export function initializeStorageIfNeeded(): Contact[] {
  const current = getLocalContacts();
  if (current.length === 0) {
    saveLocalContacts(SAMPLE_CONTACTS);
    return SAMPLE_CONTACTS;
  }
  return current;
}

/**
 * Fetch all contacts:
 * Tries Supabase first if configured. If successful, updates local cache and returns them.
 * If Supabase fails or is not configured, returns LocalStorage contacts.
 */
export async function fetchAllContacts(): Promise<{ contacts: Contact[]; isFromSupabase: boolean; error?: string }> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data) {
        const formatted: Contact[] = data.map((item) => ({
          id: item.id,
          name: item.name || '',
          email: item.email || '',
          phone: item.phone || '',
          secondary_phone: item.secondary_phone || '',
          category: item.category || 'Outros',
          company: item.company || '',
          job_title: item.job_title || '',
          address: item.address || '',
          birthday: item.birthday || '',
          notes: item.notes || '',
          avatar_color: item.avatar_color || '#3b82f6',
          avatar_url: item.avatar_url || '',
          is_favorite: Boolean(item.is_favorite),
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString(),
        }));

        // Cache locally for offline availability
        saveLocalContacts(formatted);

        return { contacts: formatted, isFromSupabase: true };
      } else {
        console.warn('Erro ao carregar do Supabase, usando cache local:', error?.message);
        return {
          contacts: getLocalContacts(),
          isFromSupabase: false,
          error: error?.message || 'Tabela de contatos não encontrada no Supabase',
        };
      }
    } catch (err: unknown) {
      console.error('Falha de rede ao conectar com Supabase:', err);
      return {
        contacts: getLocalContacts(),
        isFromSupabase: false,
        error: 'Erro de conexão com Supabase',
      };
    }
  }

  // Local storage fallback
  const local = initializeStorageIfNeeded();
  return { contacts: local, isFromSupabase: false };
}

/**
 * Save / Create a new contact
 */
export async function createContact(contactData: Omit<Contact, 'id' | 'created_at' | 'updated_at'>): Promise<{ contact: Contact; isFromSupabase: boolean }> {
  const now = new Date().toISOString();
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const payload = {
        name: contactData.name,
        email: contactData.email || null,
        phone: contactData.phone,
        secondary_phone: contactData.secondary_phone || null,
        category: contactData.category || 'Outros',
        company: contactData.company || null,
        job_title: contactData.job_title || null,
        address: contactData.address || null,
        birthday: contactData.birthday || null,
        notes: contactData.notes || null,
        avatar_color: contactData.avatar_color || '#3b82f6',
        avatar_url: contactData.avatar_url || null,
        is_favorite: contactData.is_favorite || false,
      };

      const { data, error } = await supabase.from('contacts').insert([payload]).select().single();

      if (!error && data) {
        const created: Contact = {
          id: data.id,
          name: data.name,
          email: data.email || '',
          phone: data.phone,
          secondary_phone: data.secondary_phone || '',
          category: data.category || 'Outros',
          company: data.company || '',
          job_title: data.job_title || '',
          address: data.address || '',
          birthday: data.birthday || '',
          notes: data.notes || '',
          avatar_color: data.avatar_color || '#3b82f6',
          avatar_url: data.avatar_url || '',
          is_favorite: Boolean(data.is_favorite),
          created_at: data.created_at,
          updated_at: data.updated_at,
        };

        const currentLocal = getLocalContacts();
        saveLocalContacts([created, ...currentLocal]);

        return { contact: created, isFromSupabase: true };
      }
    } catch (err) {
      console.error('Erro de Supabase na criação:', err);
    }
  }

  // Fallback local creation
  const newLocalContact: Contact = {
    ...contactData,
    id: 'loc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    created_at: now,
    updated_at: now,
  };

  const currentLocal = getLocalContacts();
  const updatedList = [newLocalContact, ...currentLocal];
  saveLocalContacts(updatedList);

  return { contact: newLocalContact, isFromSupabase: false };
}

/**
 * Update an existing contact
 */
export async function updateContact(id: string, contactData: Partial<Contact>): Promise<{ contact: Contact; isFromSupabase: boolean }> {
  const now = new Date().toISOString();
  const supabase = getSupabaseClient();

  // Local update first
  const currentLocal = getLocalContacts();
  const index = currentLocal.findIndex((c) => c.id === id);
  let updatedLocal: Contact;

  if (index !== -1) {
    updatedLocal = {
      ...currentLocal[index],
      ...contactData,
      updated_at: now,
    };
    currentLocal[index] = updatedLocal;
  } else {
    updatedLocal = {
      id,
      name: contactData.name || '',
      phone: contactData.phone || '',
      category: contactData.category || 'Outros',
      is_favorite: Boolean(contactData.is_favorite),
      created_at: now,
      updated_at: now,
      ...contactData,
    };
    currentLocal.unshift(updatedLocal);
  }
  saveLocalContacts(currentLocal);

  if (supabase && !id.startsWith('loc-')) {
    try {
      const payload: Record<string, any> = {
        updated_at: now,
      };

      if (contactData.name !== undefined) payload.name = contactData.name;
      if (contactData.email !== undefined) payload.email = contactData.email || null;
      if (contactData.phone !== undefined) payload.phone = contactData.phone;
      if (contactData.secondary_phone !== undefined) payload.secondary_phone = contactData.secondary_phone || null;
      if (contactData.category !== undefined) payload.category = contactData.category;
      if (contactData.company !== undefined) payload.company = contactData.company || null;
      if (contactData.job_title !== undefined) payload.job_title = contactData.job_title || null;
      if (contactData.address !== undefined) payload.address = contactData.address || null;
      if (contactData.birthday !== undefined) payload.birthday = contactData.birthday || null;
      if (contactData.notes !== undefined) payload.notes = contactData.notes || null;
      if (contactData.avatar_color !== undefined) payload.avatar_color = contactData.avatar_color;
      if (contactData.avatar_url !== undefined) payload.avatar_url = contactData.avatar_url || null;
      if (contactData.is_favorite !== undefined) payload.is_favorite = contactData.is_favorite;

      const { data, error } = await supabase
        .from('contacts')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return { contact: updatedLocal, isFromSupabase: true };
      }
    } catch (err) {
      console.error('Erro ao atualizar no Supabase:', err);
    }
  }

  return { contact: updatedLocal, isFromSupabase: false };
}

/**
 * Toggle favorite status
 */
export async function toggleFavorite(contact: Contact): Promise<Contact> {
  const result = await updateContact(contact.id, { is_favorite: !contact.is_favorite });
  return result.contact;
}

/**
 * Delete a contact
 */
export async function deleteContact(id: string): Promise<{ success: boolean; isFromSupabase: boolean }> {
  const supabase = getSupabaseClient();

  const currentLocal = getLocalContacts().filter((c) => c.id !== id);
  saveLocalContacts(currentLocal);

  if (supabase && !id.startsWith('loc-')) {
    try {
      const { error } = await supabase.from('contacts').delete().eq('id', id);
      if (!error) {
        return { success: true, isFromSupabase: true };
      }
    } catch (err) {
      console.error('Erro ao excluir no Supabase:', err);
    }
  }

  return { success: true, isFromSupabase: false };
}

/**
 * Sync local contacts to Supabase (Upload offline contacts)
 */
export async function syncLocalContactsToSupabase(): Promise<{ synced: number; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { synced: 0, error: 'Supabase não está configurado.' };
  }

  const localContacts = getLocalContacts();
  if (localContacts.length === 0) {
    return { synced: 0, error: 'Nenhum contato local encontrado para sincronizar.' };
  }

  let count = 0;
  for (const c of localContacts) {
    const payload = {
      name: c.name,
      email: c.email || null,
      phone: c.phone,
      secondary_phone: c.secondary_phone || null,
      category: c.category || 'Outros',
      company: c.company || null,
      job_title: c.job_title || null,
      address: c.address || null,
      birthday: c.birthday || null,
      notes: c.notes || null,
      avatar_color: c.avatar_color || '#3b82f6',
      avatar_url: c.avatar_url || null,
      is_favorite: c.is_favorite || false,
    };

    const { error } = await supabase.from('contacts').insert([payload]);
    if (!error) {
      count++;
    }
  }

  return { synced: count };
}
