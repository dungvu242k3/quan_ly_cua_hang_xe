import { supabase } from '../lib/supabase';

export interface DichVu {
  id: string;
  co_so: string;
  ten_dich_vu: string;
  gia_nhap: number;
  gia_ban: number;
  anh: string | null;
  hoa_hong: number;
  tu_ngay: string | null;
  toi_ngay: string | null;
  created_at?: string;
  updated_at?: string;
}

export const getServices = async (): Promise<DichVu[]> => {
  const { data, error } = await supabase
    .from('dich_vu')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
  return data as DichVu[];
};

export const upsertService = async (service: Partial<DichVu>): Promise<DichVu> => {
  const { data, error } = await supabase
    .from('dich_vu')
    .upsert(service)
    .select()
    .single();

  if (error) {
    console.error('Error upserting service:', error);
    throw error;
  }
  return data as DichVu;
};

export const bulkUpsertServices = async (services: Partial<DichVu>[]): Promise<void> => {
  const { error } = await supabase
    .from('dich_vu')
    .upsert(services);

  if (error) {
    console.error('Error bulk upserting services:', error);
    throw error;
  }
};

export const deleteService = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('dich_vu')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
};

export const uploadServiceImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `services/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('images') // Use unified images bucket
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('images')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export const deleteAllServices = async (): Promise<void> => {
  const { error } = await supabase
    .from('dich_vu')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (error) {
    console.error('Error deleting all services:', error);
    throw error;
  }
};

export interface ServiceFilters {
  branches?: string[];
}

export const getServicesPaginated = async (
  page: number,
  pageSize: number,
  searchQuery?: string,
  filters?: ServiceFilters
): Promise<{ data: DichVu[], totalCount: number }> => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('dich_vu')
    .select('*', { count: 'exact' });

  if (searchQuery) {
    query = query.or(`ten_dich_vu.ilike.%${searchQuery}%,id.ilike.%${searchQuery}%`);
  }

  if (filters?.branches?.length) {
    query = query.in('co_so', filters.branches);
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching paginated services:', error);
    throw error;
  }

  return {
    data: (data as DichVu[]) || [],
    totalCount: count || 0
  };
};
