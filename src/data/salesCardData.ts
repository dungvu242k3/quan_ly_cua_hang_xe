import { supabase } from '../lib/supabase';
import type { KhachHang } from './customerData';
import type { NhanSu } from './personnelData';
import type { DichVu } from './serviceData';

export interface SalesCard {
  id: string;
  ngay: string;
  gio: string;
  khach_hang_id: string | null;
  nhan_vien_id: string | null;
  dich_vu_id: string | null;
  danh_gia: string | null;
  so_km: number;
  ngay_nhac_thay_dau: string | null;
  created_at?: string;
  
  // Joined fields
  khach_hang?: Partial<KhachHang>;
  nhan_su?: Partial<NhanSu>;
  dich_vu?: Partial<DichVu>;
  dich_vu_ids?: string[]; // Frontend helper for multi-selection
}

export const getSalesCards = async (): Promise<SalesCard[]> => {
  const { data, error } = await supabase
    .from('the_ban_hang')
    .select(`
      *,
      khach_hang:khach_hang_id(ho_va_ten, so_dien_thoai),
      nhan_su:nhan_vien_id(ho_ten),
      dich_vu:dich_vu_id(ten_dich_vu),
      the_ban_hang_ct(san_pham, gia_ban, so_luong)
    `)
    .order('ngay', { ascending: false })
    .order('gio', { ascending: false });

  if (error) {
    console.error('Error fetching sales cards:', error);
    throw error;
  }
  return data as SalesCard[];
};

export const getSalesCardsPaginated = async (
  page: number, 
  pageSize: number, 
  searchQuery?: string
): Promise<{ data: SalesCard[], totalCount: number }> => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('the_ban_hang')
    .select(`
      *,
      khach_hang:khach_hang_id(id, ho_va_ten, so_dien_thoai),
      nhan_su:nhan_vien_id(id, ho_ten),
      dich_vu:dich_vu_id(id, ten_dich_vu),
      the_ban_hang_ct(san_pham, gia_ban, so_luong)
    `, { count: 'exact' });

  if (searchQuery && searchQuery.trim()) {
    const term = searchQuery.trim();
    
    // Step 1: Find matching customers
    const { data: matchedCustomers } = await supabase
      .from('khach_hang')
      .select('id')
      .or(`ho_va_ten.ilike.%${term}%,so_dien_thoai.ilike.%${term}%`);
    
    const customerIds = (matchedCustomers || []).map(c => c.id);

    // Step 2: Find matching services
    const { data: matchedServices } = await supabase
      .from('dich_vu')
      .select('id')
      .ilike('ten_dich_vu', `%${term}%`);
    
    const serviceIds = (matchedServices || []).map(s => s.id);

    // Step 3: Filter Sales Cards
    const orConditions: string[] = [];
    if (customerIds.length > 0) orConditions.push(`khach_hang_id.in.(${customerIds.join(',')})`);
    if (serviceIds.length > 0) orConditions.push(`dich_vu_id.in.(${serviceIds.join(',')})`);
    
    // Also search in ID (if user enters UUID or part of it)
    if (term.length >= 8) orConditions.push(`id.ilike.%${term}%`);

    if (orConditions.length > 0) {
      query = query.or(orConditions.join(','));
    } else {
      // If no customer, no service, and term is search but no matches, return empty
      return { data: [], totalCount: 0 };
    }
  }

  const { data, count, error } = await query
    .order('ngay', { ascending: false })
    .order('gio', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching paginated sales cards:', error);
    throw error;
  }

  return {
    data: (data as SalesCard[]) || [],
    totalCount: count || 0
  };
};

export const upsertSalesCard = async (card: Partial<SalesCard>): Promise<SalesCard> => {
  const { data, error } = await supabase
    .from('the_ban_hang')
    .upsert(card)
    .select()
    .single();

  if (error) {
    console.error('Error upserting sales card:', error);
    throw error;
  }
  return data as SalesCard;
};

export const bulkUpsertSalesCards = async (cards: Partial<SalesCard>[]): Promise<void> => {
  const { error } = await supabase
    .from('the_ban_hang')
    .upsert(cards);

  if (error) {
    console.error('Error bulk upserting sales cards:', error);
    throw error;
  }
};

export const deleteSalesCard = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('the_ban_hang')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting sales card:', error);
    throw error;
  }
};
