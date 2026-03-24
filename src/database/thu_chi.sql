-- Create Financial Transactions (Thu chi) table
CREATE TABLE IF NOT EXISTS public.thu_chi (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    loai_phieu TEXT NOT NULL, -- 'phiếu thu', 'phiếu chi'
    id_don TEXT,
    co_so TEXT NOT NULL, -- 'Cơ sở Bắc Giang', 'Cơ sở Bắc Ninh'
    id_khach_hang TEXT,
    danh_muc TEXT,
    ghi_chu TEXT,
    anh TEXT,
    so_tien DECIMAL(15, 2) NOT NULL DEFAULT 0,
    trang_thai TEXT DEFAULT 'Hoàn thành', -- 'Hoàn thành', 'Đang chờ', 'Đã hủy'
    ngay DATE DEFAULT CURRENT_DATE,
    gio TIME DEFAULT CURRENT_TIME,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.thu_chi ENABLE ROW LEVEL SECURITY;

-- Create policies (Allowing all access for now as per project pattern)
CREATE POLICY "Enable all access for all users" ON public.thu_chi
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create a trigger for updated_at
CREATE OR REPLACE FUNCTION update_thu_chi_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_thu_chi_updated_at
    BEFORE UPDATE ON public.thu_chi
    FOR EACH ROW
    EXECUTE PROCEDURE update_thu_chi_updated_at_column();
