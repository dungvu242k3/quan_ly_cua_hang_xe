-- Migration: Thêm cột id_nhan_su vào bảng nhan_su
-- Chạy script này trong Supabase SQL Editor

ALTER TABLE public.nhan_su ADD COLUMN IF NOT EXISTS id_nhan_su TEXT;

-- Tạo index để tìm kiếm nhanh theo mã nhân sự
CREATE INDEX IF NOT EXISTS idx_nhan_su_id_nhan_su ON public.nhan_su(id_nhan_su);
