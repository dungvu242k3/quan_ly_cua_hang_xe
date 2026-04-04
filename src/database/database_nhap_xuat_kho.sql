-- SQL Script để khởi tạo bảng nhap_xuat_kho cho module Kho Vận
-- Chạy script này trong phần "SQL Editor" của Supabase

CREATE TABLE nhap_xuat_kho (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  id_xuat_nhap_kho text, -- Mã phiếu xuất nhập
  loai_phieu text NOT NULL, -- "Nhập kho" hoặc "Phiếu nhập"
  id_don_hang text, 
  co_so text, -- "Cơ sở Bắc Giang" hoặc "Cơ sở Bắc Ninh"
  ten_mat_hang text NOT NULL,
  so_luong numeric DEFAULT 0,
  gia numeric DEFAULT 0,
  tong_tien numeric DEFAULT 0,
  ngay date DEFAULT CURRENT_DATE,
  gio time DEFAULT CURRENT_TIME,
  nguoi_thuc_hien text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bật tính năng Row Level Security (RLS) để bảo mật
ALTER TABLE nhap_xuat_kho ENABLE ROW LEVEL SECURITY;

-- Tạo policy cho phép mọi thao tác từ auth users (hoặc public nếu bạn chưa làm login)
-- Giả sử bạn đang thao tác local / public cho dễ test:
CREATE POLICY "Allow all public operations" ON nhap_xuat_kho
  FOR ALL USING (true) WITH CHECK (true);
