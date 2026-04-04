import { supabase } from '../lib/supabase';
import type { Candidate } from '../pages/candidates/types';

export const getCandidates = async (): Promise<Candidate[]> => {
  const { data, error } = await supabase
    .from('ung_vien')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching candidates:', error);
    throw error;
  }
  return data.map(mapDbToCandidate);
};

export const upsertCandidate = async (candidate: Partial<Candidate>): Promise<Candidate> => {
  const dbData = mapCandidateToDb(candidate);
  const { data, error } = await supabase
    .from('ung_vien')
    .upsert(dbData)
    .select()
    .single();

  if (error) {
    console.error('Error upserting candidate:', error);
    throw error;
  }
  return mapDbToCandidate(data);
};

export const deleteCandidate = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('ung_vien')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting candidate:', error);
    throw error;
  }
};

export const getCandidatesPaginated = async (
  page: number,
  pageSize: number,
  searchQuery?: string
): Promise<{ data: Candidate[], totalCount: number }> => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('ung_vien')
    .select('*', { count: 'exact' });

  if (searchQuery) {
    query = query.or(`ho_ten.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,id_ung_vien.ilike.%${searchQuery}%`);
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching paginated candidates:', error);
    throw error;
  }

  return {
    data: (data || []).map(mapDbToCandidate),
    totalCount: count || 0
  };
};

export const getNextCandidateCode = async (): Promise<string> => {
  const { data, error } = await supabase
    .from('ung_vien')
    .select('id_ung_vien')
    .order('id_ung_vien', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error fetching next candidate code:', error);
    return 'UV-0001';
  }

  if (!data || data.length === 0 || !data[0].id_ung_vien) {
    return 'UV-0001';
  }

  const lastCode = data[0].id_ung_vien;
  const match = lastCode.match(/^UV-(\d+)$/);
  
  if (match) {
    const nextNumber = parseInt(match[1]) + 1;
    return `UV-${nextNumber.toString().padStart(4, '0')}`;
  }

  return `UV-${(data.length + 1).toString().padStart(4, '0')}`;
};

// Helpers to map between DB and Frontend types
const mapDbToCandidate = (db: any): Candidate => ({
  id: db.id,
  id_ung_vien: db.id_ung_vien,
  name: db.ho_ten,
  email: db.email,
  phone: db.so_dien_thoai,
  birthYear: db.nam_sinh || '',
  position: db.vi_tri || '',
  // Mapping positionId to something if needed, or keeping it as position
  positionId: db.ma_vi_tri || '', 
  status: db.trang_thai || 'new',
  source: db.nguon || '',
  latestInterview: db.ngay_phong_van_gan_nhat || '',
  latestResult: db.ket_qua_phong_van_gan_nhat || '',
  createdAt: db.created_at,
  documents: db.tai_lieu || []
});

const mapCandidateToDb = (c: Partial<Candidate>) => {
  const db: any = {};
  if (c.id) db.id = c.id;
  if (c.id_ung_vien) db.id_ung_vien = c.id_ung_vien;
  if (c.name) db.ho_ten = c.name;
  if (c.email) db.email = c.email;
  if (c.phone) db.so_dien_thoai = c.phone;
  if (c.birthYear) db.nam_sinh = c.birthYear;
  if (c.position) db.vi_tri = c.position;
  if (c.positionId) db.ma_vi_tri = c.positionId;
  if (c.status) db.trang_thai = c.status;
  if (c.source) db.nguon = c.source;
  if (c.latestInterview) db.ngay_phong_van_gan_nhat = c.latestInterview;
  if (c.latestResult) db.ket_qua_phong_van_gan_nhat = c.latestResult;
  // Handle documents if needed
  return db;
};
