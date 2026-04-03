import { supabase } from '../lib/supabase';
import type { KhachHang } from './customerData';
import type { NhanSu } from './personnelData';
import type { DichVu } from './serviceData';

export interface SalesCard {
  id: string;
  id_bh?: string | null; // Mã phiếu bán hàng (BH-XXXXXX)
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
  const { data } = await supabase
    .from('the_ban_hang')
    .select(`
      *
    `)
    .order('ngay', { ascending: false })
    .order('gio', { ascending: false });

  // Lookup customer info by ma_khach_hang
  const cards = data as SalesCard[];
  const custIds = [...new Set(cards.map(c => c.khach_hang_id).filter(Boolean))];
  if (custIds.length > 0) {
    const { data: customers } = await supabase
      .from('khach_hang')
      .select('ma_khach_hang, ho_va_ten, so_dien_thoai')
      .in('ma_khach_hang', custIds as string[]);
    const custMap = new Map((customers || []).map(c => [c.ma_khach_hang, c]));
    cards.forEach(card => {
      if (card.khach_hang_id) {
        const cust = custMap.get(card.khach_hang_id);
        if (cust) card.khach_hang = { ho_va_ten: cust.ho_va_ten, so_dien_thoai: cust.so_dien_thoai };
      }
    });
  }

    const staffIds = [...new Set(cards.map(c => c.nhan_vien_id).filter(Boolean))];
    if (staffIds.length > 0) {
      const { data: personnel } = await supabase
        .from('nhan_su')
        .select('ho_ten, id_nhan_su, vi_tri, co_so')
        .or(`ho_ten.in.(${staffIds.map(id => `"${id}"`).join(',')}),id_nhan_su.in.(${staffIds.map(id => `"${id}"`).join(',')})`);
      
      const nameMap = new Map((personnel || []).map(p => [p.ho_ten.toLowerCase(), p]));
      const idMap = new Map((personnel || []).filter(p => !!p.id_nhan_su).map(p => [p.id_nhan_su!.toLowerCase(), p]));

      cards.forEach(card => {
        if (card.nhan_vien_id) {
          const key = card.nhan_vien_id.toLowerCase();
          const p = idMap.get(key) || nameMap.get(key);
          if (p) card.nhan_su = { ho_ten: p.ho_ten, vi_tri: p.vi_tri, co_so: p.co_so };
        }
      });
    }

    // Lookup services info by dich_vu_id (TEXT: Name or ID)
    const serviceIds = [...new Set(cards.map(c => c.dich_vu_id).filter(Boolean))];
    if (serviceIds.length > 0) {
      const { data: services } = await supabase
        .from('dich_vu')
        .select('ten_dich_vu, id_dich_vu, gia_ban, gia_nhap, co_so')
        .or(`ten_dich_vu.in.(${serviceIds.map(id => `"${id}"`).join(',')}),id_dich_vu.in.(${serviceIds.map(id => `"${id}"`).join(',')})`);
      
      const serviceNameMap = new Map((services || []).map(s => [s.ten_dich_vu.toLowerCase(), s]));
      const serviceIdMap = new Map((services || []).filter(s => !!s.id_dich_vu).map(s => [s.id_dich_vu!.toLowerCase(), s]));

      cards.forEach(card => {
        if (card.dich_vu_id) {
          const key = card.dich_vu_id.toLowerCase();
          const s = serviceIdMap.get(key) || serviceNameMap.get(key);
          if (s) card.dich_vu = { ten_dich_vu: s.ten_dich_vu, gia_ban: s.gia_ban, gia_nhap: s.gia_nhap, co_so: s.co_so };
        }
      });
    }

    return cards;
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
    .select(`*`, { count: 'exact' });

  if (searchQuery && searchQuery.trim()) {
    const term = searchQuery.trim();
    
    const { data: matchedCustomers } = await supabase
      .from('khach_hang')
      .select('ma_khach_hang')
      .or(`ho_va_ten.ilike.%${term}%,so_dien_thoai.ilike.%${term}%,ma_khach_hang.ilike.%${term}%`);
    
    const customerCodes = (matchedCustomers || []).slice(0, 50).map(c => c.ma_khach_hang).filter(Boolean);

    // Find matching services
    const { data: matchedServices } = await supabase
      .from('dich_vu')
      .select('id')
      .ilike('ten_dich_vu', `%${term}%`);
    const serviceIds = (matchedServices || []).slice(0, 50).map(s => s.id);

    // Filter Sales Cards
    const orConditions: string[] = [];
    if (customerCodes.length > 0) orConditions.push(`khach_hang_id.in.(${customerCodes.join(',')})`);
    if (serviceIds.length > 0) orConditions.push(`dich_vu_id.in.(${serviceIds.join(',')})`);
    orConditions.push(`id_bh.ilike.%${term}%`);
    orConditions.push(`khach_hang_id.ilike.%${term}%`);

    if (orConditions.length > 0) {
      query = query.or(orConditions.join(','));
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

  // Lookup customer info by ma_khach_hang
  const cards = (data as SalesCard[]) || [];
  const custIds = [...new Set(cards.map(c => c.khach_hang_id).filter(Boolean))];
  if (custIds.length > 0) {
    const { data: customers } = await supabase
      .from('khach_hang')
      .select('ma_khach_hang, ho_va_ten, so_dien_thoai')
      .in('ma_khach_hang', custIds as string[]);
    const custMap = new Map((customers || []).map(c => [c.ma_khach_hang, c]));
    cards.forEach(card => {
      if (card.khach_hang_id) {
        const cust = custMap.get(card.khach_hang_id);
        if (cust) card.khach_hang = { ho_va_ten: cust.ho_va_ten, so_dien_thoai: cust.so_dien_thoai };
      }
    });
  }

  // Lookup personnel info by nhan_vien_id (TEXT: Name or ID)
  const staffIds = [...new Set(cards.map(c => c.nhan_vien_id).filter(Boolean))];
  if (staffIds.length > 0) {
    const { data: personnel } = await supabase
      .from('nhan_su')
      .select('ho_ten, id_nhan_su, vi_tri, co_so')
      .or(`ho_ten.in.(${staffIds.map(id => `"${id}"`).join(',')}),id_nhan_su.in.(${staffIds.map(id => `"${id}"`).join(',')})`);
    
    // Map either by name or by official staff ID
    const nameMap = new Map((personnel || []).map(p => [p.ho_ten.toLowerCase(), p]));
    const idMap = new Map((personnel || []).filter(p => !!p.id_nhan_su).map(p => [p.id_nhan_su!.toLowerCase(), p]));

    cards.forEach(card => {
      if (card.nhan_vien_id) {
        const key = card.nhan_vien_id.toLowerCase();
        const p = idMap.get(key) || nameMap.get(key);
        if (p) card.nhan_su = { ho_ten: p.ho_ten, vi_tri: p.vi_tri, co_so: p.co_so };
      }
    });
  }

  // Lookup services info by dich_vu_id (TEXT: Name or ID)
  const serviceIds = [...new Set(cards.map(c => c.dich_vu_id).filter(Boolean))];
  if (serviceIds.length > 0) {
    const { data: services } = await supabase
      .from('dich_vu')
      .select('ten_dich_vu, id_dich_vu, gia_ban, gia_nhap, co_so')
      .or(`ten_dich_vu.in.(${serviceIds.map(id => `"${id}"`).join(',')}),id_dich_vu.in.(${serviceIds.map(id => `"${id}"`).join(',')})`);
    
    const serviceNameMap = new Map((services || []).map(s => [s.ten_dich_vu.toLowerCase(), s]));
    const serviceIdMap = new Map((services || []).filter(s => !!s.id_dich_vu).map(s => [s.id_dich_vu!.toLowerCase(), s]));

    cards.forEach(card => {
      if (card.dich_vu_id) {
        const key = card.dich_vu_id.toLowerCase();
        const s = serviceIdMap.get(key) || serviceNameMap.get(key);
        if (s) card.dich_vu = { ten_dich_vu: s.ten_dich_vu, gia_ban: s.gia_ban, gia_nhap: s.gia_nhap, co_so: s.co_so };
      }
    });
  }

  return {
    data: cards,
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
    console.error('Error deleting sales card:', id, error);
    throw error;
  }
};

export const deleteAllSalesCards = async (): Promise<void> => {
  const { error } = await supabase
    .from('the_ban_hang')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (error) {
    console.error('Error deleting all sales cards:', error);
    throw error;
  }
};

