# PLAN: Hệ thống Tính lương (Payroll System)

> Module quản lý tiền lương cho chuỗi cửa hàng xe, tích hợp với hệ thống nhân sự và chấm công hiện tại.

---

## 📋 Phân tích từ ảnh tham khảo

### Ảnh 1 - Thông số mặc định (Tab Lương)
- Mức lương cơ sở (VND)
- Mức lương trần đóng BHXH, BHYT (VND)
- Mức lương tối thiểu vùng: bảng theo Đơn vị → Mức lương tối thiểu, Mức lương trần đóng BHTN

### Ảnh 2 - Thuế TNCN (Tab Thuế TNCN)
- Thuế suất nhân viên thử việc: Theo 10% / Theo biểu lũy tiến
- Biểu thuế lũy tiến: 7 bậc thuế, cột Phần thu nhập tính thuế/năm (Trên, Đến), Phần thu nhập tính thuế/tháng (Trên, Đến), Thuế suất (%)

### Ảnh 3 - Thêm Thành phần lương
- Form: Tên thành phần, Mã thành phần, Đơn vị áp dụng, Loại thành phần, Tính chất (Thu nhập: Chịu thuế/Không chịu thuế), Định mức, Kiểu giá trị, Giá trị, Mô tả

### Ảnh 4 - Chính sách Phụ cấp
- Form: Đơn vị áp dụng, Khoản phụ cấp, Tên chính sách
- Giá trị phụ cấp theo Vị trí công việc: Vị trí công việc (dropdown), Định mức, Giá trị
- Nút "+ Thêm vị trí"

### Ảnh 5 - Bảng lương
- Tiêu đề: "Bảng lương tháng X/YYYY - [Đơn vị]"
- Các cột: STT, Mã NV, Họ tên, Đơn vị, Doanh số, Doanh số mục tiêu, Tỷ lệ hoàn thành, Lương ngày công, Lương doanh số, Lương làm thêm giờ/chiều, Lương làm thêm giờ/chính, Phụ cấp đi lại...
- Tùy chỉnh cột (Column customizer)
- Pagination, Tìm kiếm, Filter trạng thái & đơn vị

---

## 🗄️ Thiết kế Database (SQL - Supabase)

### Bảng 1: `thong_so_luong` (Thông số mặc định)
Lưu các thông số cấu hình lương toàn cục.

```sql
CREATE TABLE IF NOT EXISTS public.thong_so_luong (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    loai TEXT NOT NULL,               -- 'luong_co_so', 'tran_bhxh_bhyt', 'luong_toi_thieu_vung', 'tran_bhtn'
    co_so TEXT,                        -- NULL = áp dụng chung, hoặc tên cơ sở
    gia_tri DECIMAL(15, 2) NOT NULL DEFAULT 0,
    mo_ta TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Bảng 2: `bieu_thue_tncn` (Biểu thuế lũy tiến)
Lưu 7 bậc thuế TNCN theo quy định.

```sql
CREATE TABLE IF NOT EXISTS public.bieu_thue_tncn (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bac_thue INTEGER NOT NULL,         -- 1-7
    tu_nam DECIMAL(15, 2),             -- Phần thu nhập tính thuế/năm - Trên
    den_nam DECIMAL(15, 2),            -- Phần thu nhập tính thuế/năm - Đến
    tu_thang DECIMAL(15, 2),           -- Phần thu nhập tính thuế/tháng - Trên
    den_thang DECIMAL(15, 2),          -- Phần thu nhập tính thuế/tháng - Đến
    thue_suat DECIMAL(5, 2) NOT NULL,  -- Thuế suất (%)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Bảng 3: `thanh_phan_luong` (Thành phần lương)
Định nghĩa các khoản cấu thành lương (Lương cứng, Phụ cấp, Thưởng...).

```sql
CREATE TABLE IF NOT EXISTS public.thanh_phan_luong (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ten TEXT NOT NULL,                 -- 'Lương cơ bản', 'Phụ cấp ăn trưa'...
    ma TEXT NOT NULL UNIQUE,           -- 'LUONG_CB', 'PHU_CAP_AN'...
    co_so TEXT,                        -- Đơn vị áp dụng (NULL = tất cả)
    loai TEXT NOT NULL,                -- 'thu_nhap', 'khau_tru' (Thu nhập / Khấu trừ)
    tinh_chat TEXT DEFAULT 'chiu_thue', -- 'chiu_thue', 'khong_chiu_thue'
    kieu_gia_tri TEXT DEFAULT 'tien_te', -- 'tien_te', 'phan_tram', 'cong_thuc'
    gia_tri DECIMAL(15, 2) DEFAULT 0,
    dinh_muc TEXT,                     -- Mô tả định mức (ví dụ: "26 ngày/tháng")
    mo_ta TEXT,
    thu_tu INTEGER DEFAULT 0,          -- Thứ tự hiển thị
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Bảng 4: `chinh_sach_phu_cap` (Chính sách phụ cấp)
Gán giá trị phụ cấp theo vị trí công việc.

```sql
CREATE TABLE IF NOT EXISTS public.chinh_sach_phu_cap (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    co_so TEXT NOT NULL,                -- Đơn vị áp dụng
    thanh_phan_luong_id UUID REFERENCES public.thanh_phan_luong(id) ON DELETE CASCADE,
    ten_chinh_sach TEXT NOT NULL,       -- Tên chính sách (auto-generate)
    vi_tri TEXT NOT NULL,              -- Vị trí công việc
    dinh_muc TEXT,
    gia_tri DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Bảng 5: `bang_luong` (Bảng lương tháng)
Bảng tổng hợp lương hàng tháng cho từng nhân viên.

```sql
CREATE TABLE IF NOT EXISTS public.bang_luong (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nhan_su_id UUID REFERENCES public.nhan_su(id) ON DELETE CASCADE,
    thang INTEGER NOT NULL,            -- 1-12
    nam INTEGER NOT NULL,              -- 2024, 2025...
    co_so TEXT NOT NULL,

    -- Ngày công
    ngay_cong_chuan INTEGER DEFAULT 26,
    ngay_cong_thuc_te DECIMAL(5, 1) DEFAULT 0,

    -- Doanh số
    doanh_so DECIMAL(15, 2) DEFAULT 0,
    doanh_so_muc_tieu DECIMAL(15, 2) DEFAULT 0,

    -- Các khoản lương
    luong_co_ban DECIMAL(15, 2) DEFAULT 0,
    luong_ngay_cong DECIMAL(15, 2) DEFAULT 0,
    luong_doanh_so DECIMAL(15, 2) DEFAULT 0,
    luong_lam_them DECIMAL(15, 2) DEFAULT 0,

    -- Phụ cấp
    tong_phu_cap DECIMAL(15, 2) DEFAULT 0,

    -- Khấu trừ
    bhxh DECIMAL(15, 2) DEFAULT 0,
    bhyt DECIMAL(15, 2) DEFAULT 0,
    bhtn DECIMAL(15, 2) DEFAULT 0,
    thue_tncn DECIMAL(15, 2) DEFAULT 0,
    khau_tru_khac DECIMAL(15, 2) DEFAULT 0,

    -- Tổng kết
    tong_thu_nhap DECIMAL(15, 2) DEFAULT 0,
    tong_khau_tru DECIMAL(15, 2) DEFAULT 0,
    thuc_linh DECIMAL(15, 2) DEFAULT 0,

    trang_thai TEXT DEFAULT 'Chờ duyệt',  -- 'Chờ duyệt', 'Đã duyệt', 'Đã chi trả'
    ghi_chu TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(nhan_su_id, thang, nam)
);
```

### Bảng 6: `bang_luong_chi_tiet` (Chi tiết từng khoản)
Lưu chi tiết từng thành phần lương của mỗi nhân viên trong tháng.

```sql
CREATE TABLE IF NOT EXISTS public.bang_luong_chi_tiet (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bang_luong_id UUID REFERENCES public.bang_luong(id) ON DELETE CASCADE,
    thanh_phan_luong_id UUID REFERENCES public.thanh_phan_luong(id),
    ten_thanh_phan TEXT NOT NULL,
    loai TEXT NOT NULL,                 -- 'thu_nhap', 'khau_tru'
    gia_tri DECIMAL(15, 2) DEFAULT 0,
    ghi_chu TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🖥️ Thiết kế Giao diện

### Cấu trúc Navigation

```
Sidebar: [Tiền lương] (icon: Banknote)
  └─ ModulePage: /tien-luong
       ├─ Thông số mặc định: /tien-luong/thong-so
       ├─ Thành phần lương: /tien-luong/thanh-phan
       ├─ Chính sách phụ cấp: /tien-luong/chinh-sach
       └─ Bảng lương: /tien-luong/bang-luong
```

### Trang 1: Thông số mặc định (`/tien-luong/thong-so`)
**Layout: Tab Switcher (3 tabs)**

| Tab | Nội dung |
|-----|----------|
| **Lương** | Form chỉnh sửa: Lương cơ sở, Trần BHXH/BHYT, Bảng Lương tối thiểu vùng (theo Đơn vị) |
| **Thuế TNCN** | Radio: Theo 10% / Theo biểu lũy tiến. Bảng 7 bậc thuế (read-only hoặc editable) |
| **Bảo hiểm** | Tỷ lệ đóng BHXH/BHYT/BHTN cho NLĐ và DN |

### Trang 2: Thành phần lương (`/tien-luong/thanh-phan`)
**Layout: Bảng danh sách + Modal thêm/sửa**

- Bảng: Tên, Mã, Đơn vị, Loại, Tính chất, Kiểu giá trị, Giá trị
- Modal Form: Tên thành phần, Mã, Đơn vị áp dụng (dropdown), Loại thành phần (dropdown), Tính chất (Thu nhập/Khấu trừ + Chịu thuế/Không), Định mức, Kiểu giá trị (Tiền tệ/Phần trăm/Công thức), Giá trị, Mô tả

### Trang 3: Chính sách phụ cấp (`/tien-luong/chinh-sach`)
**Layout: Form nhiều dòng**

- Thông tin chung: Đơn vị áp dụng, Khoản phụ cấp (dropdown từ thanh_phan_luong), Tên chính sách (auto)
- Giá trị phụ cấp: Bảng động - Vị trí công việc (dropdown), Định mức, Giá trị
- Nút "+ Thêm vị trí"

### Trang 4: Bảng lương (`/tien-luong/bang-luong`)
**Layout: Bảng dữ liệu phức tạp**

- Header: "Bảng lương tháng X/YYYY - [Đơn vị]" + Nút Chọn tháng/năm
- Toolbar: Tìm kiếm, Filter trạng thái/đơn vị, Nút "Tính lương", "Xuất phiếu lương", "Nhập khẩu", "Chi trả lương"
- Bảng: Các cột có thể tùy chỉnh hiển thị/ẩn (Column customizer popup)
- Pagination server-side

---

## 📁 Cấu trúc Files

### Database
| File | Mô tả |
|------|--------|
| `src/database/tien_luong.sql` | Tất cả 6 bảng SQL + RLS + Triggers + Seed data biểu thuế |

### Data Layer
| File | Mô tả |
|------|--------|
| `src/data/payrollSettingsData.ts` | CRUD cho `thong_so_luong` + `bieu_thue_tncn` |
| `src/data/salaryComponentData.ts` | CRUD cho `thanh_phan_luong` |
| `src/data/allowancePolicyData.ts` | CRUD cho `chinh_sach_phu_cap` |
| `src/data/payrollData.ts` | CRUD + tính lương cho `bang_luong` + `bang_luong_chi_tiet` |

### Pages
| File | Mô tả |
|------|--------|
| `src/pages/PayrollSettingsPage.tsx` | Trang Thông số mặc định (3 tabs) |
| `src/pages/SalaryComponentPage.tsx` | Trang Thành phần lương |
| `src/pages/AllowancePolicyPage.tsx` | Trang Chính sách phụ cấp |
| `src/pages/PayrollPage.tsx` | Trang Bảng lương chính |

### Components
| File | Mô tả |
|------|--------|
| `src/components/SalaryComponentFormModal.tsx` | Modal thêm/sửa thành phần lương |
| `src/components/AllowancePolicyForm.tsx` | Form chính sách phụ cấp (multi-row) |
| `src/components/PayrollColumnCustomizer.tsx` | Popup tùy chỉnh cột bảng lương |

### Routing & Navigation
| File | Thay đổi |
|------|----------|
| `src/App.tsx` | Thêm 4 routes mới |
| `src/data/sidebarMenu.ts` | Thêm menu "Tiền lương" |
| `src/data/moduleData.ts` | Thêm sub-modules cho `/tien-luong` |

---

## 🔄 Thứ tự triển khai

### Phase 1: Database & Foundation
1. Tạo `src/database/tien_luong.sql` (tất cả 6 bảng)
2. Seed data biểu thuế TNCN (7 bậc theo quy định)
3. Seed data thông số mặc định (lương cơ sở, trần BHXH...)

### Phase 2: Data Layer
4. `payrollSettingsData.ts` - Thông số + Biểu thuế
5. `salaryComponentData.ts` - Thành phần lương
6. `allowancePolicyData.ts` - Chính sách phụ cấp
7. `payrollData.ts` - Bảng lương + Tính lương

### Phase 3: UI - Cấu hình
8. `PayrollSettingsPage.tsx` - 3 tabs (Lương, Thuế, Bảo hiểm)
9. `SalaryComponentPage.tsx` + Modal
10. `AllowancePolicyPage.tsx` + Form

### Phase 4: UI - Bảng lương
11. `PayrollPage.tsx` - Bảng lương chính
12. `PayrollColumnCustomizer.tsx` - Tùy chỉnh cột
13. Logic tính lương tự động

### Phase 5: Integration
14. Cập nhật `App.tsx`, `sidebarMenu.ts`, `moduleData.ts`
15. Kiểm thử end-to-end

---

## ⚠️ Câu hỏi cần xác nhận

1. **Tính lương tự động**: Khi bấm "Tính lương", hệ thống sẽ tự động lấy ngày công từ bảng `cham_cong` để tính lương ngày công. Bạn có muốn tích hợp tính năng này ngay từ đầu không?

2. **Doanh số**: Doanh số của nhân viên lấy từ đâu? Tự nhập tay hay tự động tổng hợp từ bảng `the_ban_hang`?

3. **Scope ban đầu**: Bạn muốn triển khai tất cả 4 trang cùng lúc, hay bắt đầu từ Bảng lương trước rồi bổ sung các trang cấu hình sau?

4. **Bảng bảo hiểm (Tab 3)**: Trong ảnh tham khảo chỉ thấy 2 tabs (Lương + Thuế TNCN). Tab "Bảo hiểm" có cần làm không, hay chỉ lưu tỷ lệ cố định?

---

## ✅ Verification Plan

### Automated
- TypeScript compile: `npx tsc --noEmit`
- Lint check: `npm run lint`

### Manual
- Chạy SQL trong Supabase SQL Editor → Kiểm tra bảng được tạo
- Truy cập từng trang → Kiểm tra CRUD hoạt động
- Kiểm tra responsive trên mobile/tablet
- Kiểm tra logic tính lương với dữ liệu mẫu
