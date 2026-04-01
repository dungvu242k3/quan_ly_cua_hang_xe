import { supabase } from '../lib/supabase';

export interface ThanhPhanLuong {
  id: string;
  ten: string;
  ma: string;
  co_so: string | null;
  loai: string;
  tinh_chat: string;
  kieu_gia_tri: string;
  gia_tri: number;
  dinh_muc: string | null;
  mo_ta: string | null;
  thu_tu: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const getSalaryComponents = async (): Promise<ThanhPhanLuong[]> => {
  const { data, error } = await supabase
    .from('thanh_phan_luong')
    .select('*')
    .order('thu_tu');

  if (error) { console.error('Error fetching salary components:', error); throw error; }
  return data as ThanhPhanLuong[];
};

export const upsertSalaryComponent = async (component: Partial<ThanhPhanLuong>): Promise<ThanhPhanLuong> => {
  const { data, error } = await supabase
    .from('thanh_phan_luong')
    .upsert(component)
    .select()
    .single();

  if (error) { console.error('Error upserting salary component:', error); throw error; }
  return data as ThanhPhanLuong;
};

export const deleteSalaryComponent = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('thanh_phan_luong')
    .delete()
    .eq('id', id);

  if (error) { console.error('Error deleting salary component:', error); throw error; }
};
