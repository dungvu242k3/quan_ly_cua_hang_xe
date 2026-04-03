-- Migration: Thay đổi dich_vu_id từ UUID sang TEXT trong bảng the_ban_hang
-- Chạy script này trong Supabase SQL Editor

-- 1. Xóa ràng buộc khóa ngoại cũ (nếu có)
ALTER TABLE public.the_ban_hang DROP CONSTRAINT IF EXISTS the_ban_hang_dich_vu_id_fkey;

-- 2. Thay đổi kiểu dữ liệu cột dich_vu_id sang TEXT
ALTER TABLE public.the_ban_hang ALTER COLUMN dich_vu_id TYPE TEXT USING dich_vu_id::TEXT;

-- 3. Tạo lại index để tìm kiếm nhanh
DROP INDEX IF EXISTS idx_the_ban_hang_dich_vu;
CREATE INDEX IF NOT EXISTS idx_the_ban_hang_dich_vu ON public.the_ban_hang(dich_vu_id);
