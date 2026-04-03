-- ==========================================================
-- MASTER SQL: BẢNG KHÁCH HÀNG (KHACH_HANG)
-- Phiên bản: 2.0 (Chuẩn Production)
-- Chức năng: Quản lý thông tin khách hàng, xe, và lịch sử bảo trì.
-- ==========================================================

-- 1. Kích hoạt tiện ích mở rộng (nếu cần)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Khởi tạo cấu trúc bảng chính
CREATE TABLE IF NOT EXISTS public.khach_hang (
    -- ID hệ thống (UUID ẩn)
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Định danh khách hàng (Dùng trong Excel/Giao diện)
    ma_khach_hang TEXT UNIQUE,
    
    -- Thông tin cá nhân
    ho_va_ten TEXT NOT NULL,
    so_dien_thoai TEXT NOT NULL,
    anh TEXT,
    dia_chi_hien_tai TEXT,
    
    -- Thông tin xe & Vận hành
    bien_so_xe TEXT,
    so_km INTEGER DEFAULT 0,
    
    -- Lịch sử & Chu kỳ bảo trì
    ngay_dang_ky DATE DEFAULT CURRENT_DATE,
    ngay_thay_dau DATE,
    so_ngay_thay_dau INTEGER DEFAULT 0,
    lich_su_thay_dau JSONB DEFAULT '[]'::jsonb,
    
    -- Hệ thống quản lý thời gian
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Migration: Xử lý nâng cấp cho Database cũ (nếu có)
DO $$ 
BEGIN 
    -- Kiểm tra & bổ sung ma_khach_hang (nếu từ bản 1.0 lên)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='khach_hang' AND column_name='ma_khach_hang') THEN
        ALTER TABLE public.khach_hang ADD COLUMN ma_khach_hang TEXT UNIQUE;
    END IF;

    -- Kiểm tra & bổ sung updated_at (nếu thiếu)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='khach_hang' AND column_name='updated_at') THEN
        ALTER TABLE public.khach_hang ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
    END IF;
END $$;

-- 4. Tối ưu hóa truy vấn (Indexes)
CREATE INDEX IF NOT EXISTS idx_khach_hang_ma_khach_hang ON public.khach_hang (ma_khach_hang);
CREATE INDEX IF NOT EXISTS idx_khach_hang_ho_va_ten ON public.khach_hang (ho_va_ten);
CREATE INDEX IF NOT EXISTS idx_khach_hang_so_dien_thoai ON public.khach_hang (so_dien_thoai);
CREATE INDEX IF NOT EXISTS idx_khach_hang_bien_so_xe ON public.khach_hang (bien_so_xe);

-- 5. Tự động cập nhật updated_at
-- Hàm trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Gán trigger vào bảng
DROP TRIGGER IF EXISTS update_khach_hang_updated_at ON public.khach_hang;
CREATE TRIGGER update_khach_hang_updated_at
    BEFORE UPDATE ON public.khach_hang
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Bảo mật mức hàng (Row Level Security - RLS)
ALTER TABLE public.khach_hang ENABLE ROW LEVEL SECURITY;

-- 7. Chính sách truy cập (Policies)
DO $$ 
BEGIN
    -- Xóa policy cũ nếu cần cấu trúc lại
    -- DROP POLICY IF EXISTS "Allow all actions for anyone" ON public.khach_hang;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'khach_hang' AND policyname = 'Allow all actions for anyone'
    ) THEN
        CREATE POLICY "Allow all actions for anyone" ON public.khach_hang
            FOR ALL
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;

-- ==========================================================
-- Ghi chú: Copy toàn bộ nội dung dán vào Supabase SQL Editor.
-- ==========================================================
