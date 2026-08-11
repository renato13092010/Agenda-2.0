export type ContactCategory = 'Trabalho' | 'Família' | 'Amigos' | 'Clientes' | 'Outros';

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone: string;
  secondary_phone?: string;
  category: ContactCategory;
  company?: string;
  job_title?: string;
  address?: string;
  birthday?: string;
  notes?: string;
  avatar_color?: string;
  avatar_url?: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export type ViewMode = 'grid' | 'list';

export type SortOption = 'name_asc' | 'name_desc' | 'recently_added' | 'category';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export interface StatsData {
  total: number;
  favorites: number;
  byCategory: Record<ContactCategory, number>;
  withEmail: number;
  withCompany: number;
}
