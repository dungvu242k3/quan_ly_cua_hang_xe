-- Migration: Đổi khach_hang_id từ UUID sang TEXT
-- Chạy script này trong Supabase SQL Editor

-- 1. Xóa foreign key constraint cũ
ALTER TABLE public.the_ban_hang DROP CONSTRAINT IF EXISTS the_ban_hang_khach_hang_id_fkey;

-- 2. Đổi kiểu dữ liệu sang TEXT
ALTER TABLE public.the_ban_hang ALTER COLUMN khach_hang_id TYPE TEXT USING khach_hang_id::TEXT;

-- 3. Xóa index cũ (dựa trên UUID) và tạo lại
DROP INDEX IF EXISTS idx_the_ban_hang_khach_hang;
CREATE INDEX IF NOT EXISTS idx_the_ban_hang_khach_hang ON public.the_ban_hang(khach_hang_id);
