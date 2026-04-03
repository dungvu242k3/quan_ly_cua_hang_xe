-- Migration: Thay đổi nhan_vien_id từ UUID sang TEXT trong bảng the_ban_hang
-- Chạy script này trong Supabase SQL Editor

-- 1. Xóa ràng buộc khóa ngoại cũ (nếu có)
ALTER TABLE public.the_ban_hang DROP CONSTRAINT IF EXISTS the_ban_hang_nhan_vien_id_fkey;

-- 2. Thay đổi kiểu dữ liệu cột nhan_vien_id sang TEXT
ALTER TABLE public.the_ban_hang ALTER COLUMN nhan_vien_id TYPE TEXT USING nhan_vien_id::TEXT;

-- 3. Tạo lại index để tìm kiếm nhanh
DROP INDEX IF EXISTS idx_the_ban_hang_nhan_vien;
CREATE INDEX IF NOT EXISTS idx_the_ban_hang_nhan_vien ON public.the_ban_hang(nhan_vien_id);
