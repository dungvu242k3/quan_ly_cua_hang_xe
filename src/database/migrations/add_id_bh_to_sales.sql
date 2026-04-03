-- Migration: Thêm mã phiếu (id_bh) cho bảng the_ban_hang
-- Chạy đoạn mã này trong Supabase SQL Editor

-- 1. Thêm cột id_bh (Mã bán hàng)
ALTER TABLE public.the_ban_hang ADD COLUMN IF NOT EXISTS id_bh TEXT UNIQUE;

-- 2. Thêm index để tăng tốc độ tìm kiếm theo mã phiếu
CREATE INDEX IF NOT EXISTS idx_the_ban_hang_id_bh ON public.the_ban_hang(id_bh);

-- 3. Tự động cập nhật mã ngẫu nhiên cho các bản ghi cũ chưa có mã
UPDATE public.the_ban_hang 
SET id_bh = 'BH-' || UPPER(SUBSTRING(md5(random()::text), 1, 6))
WHERE id_bh IS NULL;
