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
    .from('personnel') // Reuse personnel bucket or create new
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('personnel')
    .getPublicUrl(filePath);

  return data.publicUrl;
};
