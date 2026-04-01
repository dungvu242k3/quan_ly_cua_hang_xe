import { supabase } from '../lib/supabase';

export interface AttendanceRecord {
  id: string;
  ngay: string;
  checkin: string | null;
  checkout: string | null;
  anh: string | null;
  vi_tri: string | null;
  nhan_su: string;
  created_at?: string;
}

export const getAttendanceRecords = async (): Promise<AttendanceRecord[]> => {
  const { data, error } = await supabase
    .from('cham_cong')
    .select('*')
    .order('ngay', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching attendance records:', error);
    throw error;
  }
  return data as AttendanceRecord[];
};

export const upsertAttendanceRecord = async (record: Partial<AttendanceRecord>): Promise<AttendanceRecord> => {
  const { data, error } = await supabase
    .from('cham_cong')
    .upsert(record)
    .select()
    .single();

  if (error) {
    console.error('Error upserting attendance record:', error);
    throw error;
  }
  return data as AttendanceRecord;
};

export const bulkUpsertAttendanceRecords = async (records: Partial<AttendanceRecord>[]): Promise<void> => {
  const { error } = await supabase
    .from('cham_cong')
    .upsert(records);

  if (error) {
    console.error('Error bulk upserting attendance records:', error);
    throw error;
  }
};

export const deleteAttendanceRecord = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('cham_cong')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting attendance record:', error);
    throw error;
  }
};

export interface AttendanceFilters {
  nhan_su?: string;
  ngay?: string;
  startDate?: string;
  endDate?: string;
}

export const getAttendancePaginated = async (
  page: number,
  pageSize: number,
  searchQuery?: string,
  filters?: AttendanceFilters
): Promise<{ data: AttendanceRecord[], totalCount: number }> => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('cham_cong')
    .select('*', { count: 'exact' });

  if (searchQuery) {
    // Search in personnel name or location
    query = query.or(`nhan_su.ilike.%${searchQuery}%,vi_tri.ilike.%${searchQuery}%`);
  }

  if (filters?.nhan_su) {
    query = query.eq('nhan_su', filters.nhan_su);
  }

  if (filters?.ngay) {
    query = query.eq('ngay', filters.ngay);
  }

  if (filters?.startDate) {
    query = query.gte('ngay', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('ngay', filters.endDate);
  }

  const { data, count, error } = await query
    .order('ngay', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching paginated attendance:', error);
    throw error;
  }

  return {
    data: (data as AttendanceRecord[]) || [],
    totalCount: count || 0
  };
};
