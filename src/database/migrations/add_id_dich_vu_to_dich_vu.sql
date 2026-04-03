-- Migration: Thêm trường id_dich_vu vào bảng dich_vu
-- Chạy script này trong Supabase SQL Editor

-- 1. Thêm cột id_dich_vu (TEXT)
ALTER TABLE public.dich_vu ADD COLUMN IF NOT EXISTS id_dich_vu TEXT;

-- 2. Tạo index cho id_dich_vu để tìm kiếm nhanh
CREATE INDEX IF NOT EXISTS idx_dich_vu_id_dich_vu ON public.dich_vu(id_dich_vu);
