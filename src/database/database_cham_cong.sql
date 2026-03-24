-- SQL Script để khởi tạo bảng cham_cong cho module Nhân Sự -> Chấm công
-- Chạy script này trong phần "SQL Editor" của Supabase

CREATE TABLE cham_cong (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ngay date DEFAULT CURRENT_DATE NOT NULL,
  checkin time,
  checkout time,
  anh text, -- Dùng để lưu đường dẫn ảnh hoặc Base64
  vi_tri text, -- Vị trí chấm công (ví dụ: Tọa độ GPS hoặc Tên chi nhánh)
  nhan_su text NOT NULL, -- Tên hoặc ID của nhân sự
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bật tính năng Row Level Security (RLS) để bảo mật
ALTER TABLE cham_cong ENABLE ROW LEVEL SECURITY;

-- Tạo policy cho phép mọi thao tác từ public (Phục vụ việc đang dev)
CREATE POLICY "Allow all public operations" ON cham_cong
  FOR ALL USING (true) WITH CHECK (true);
