-- Create the dich_vu table
CREATE TABLE IF NOT EXISTS dich_vu (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    co_so TEXT NOT NULL,
    ten_dich_vu TEXT NOT NULL,
    gia_nhap NUMERIC DEFAULT 0,
    gia_ban NUMERIC DEFAULT 0,
    anh TEXT,
    hoa_hong NUMERIC DEFAULT 0,
    tu_ngay DATE,
    toi_ngay DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable Row Level Security
ALTER TABLE dich_vu ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all actions for now (Development mode)
CREATE POLICY "Allow all actions for dich_vu" ON dich_vu FOR ALL USING (true);
