import { supabase } from '../lib/supabase';

export interface ThongSoLuong {
  id: string;
  loai: string;
  co_so: string | null;
  gia_tri: number;
  mo_ta: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BieuThueTNCN {
  id: string;
  bac_thue: number;
  tu_nam: number | null;
  den_nam: number | null;
  tu_thang: number | null;
  den_thang: number | null;
  thue_suat: number;
}

export const getPayrollSettings = async (): Promise<ThongSoLuong[]> => {
  const { data, error } = await supabase
    .from('thong_so_luong')
    .select('*')
    .order('loai');

  if (error) { console.error('Error fetching payroll settings:', error); throw error; }
  return data as ThongSoLuong[];
};

export const upsertPayrollSetting = async (setting: Partial<ThongSoLuong>): Promise<ThongSoLuong> => {
  const { data, error } = await supabase
    .from('thong_so_luong')
    .upsert(setting)
    .select()
    .single();

  if (error) { console.error('Error upserting payroll setting:', error); throw error; }
  return data as ThongSoLuong;
};

export const getTaxBrackets = async (): Promise<BieuThueTNCN[]> => {
  const { data, error } = await supabase
    .from('bieu_thue_tncn')
    .select('*')
    .order('bac_thue');

  if (error) { console.error('Error fetching tax brackets:', error); throw error; }
  return data as BieuThueTNCN[];
};

export const upsertTaxBracket = async (bracket: Partial<BieuThueTNCN>): Promise<BieuThueTNCN> => {
  const { data, error } = await supabase
    .from('bieu_thue_tncn')
    .upsert(bracket)
    .select()
    .single();

  if (error) { console.error('Error upserting tax bracket:', error); throw error; }
  return data as BieuThueTNCN;
};
