# Kế hoạch triển khai module Xuất Nhập Kho

Dựa trên yêu cầu, chúng ta sẽ xây dựng tính năng quản lý Xuất Nhập Kho với cơ sở dữ liệu Supabase và giao diện React.

## Proposed Changes

### Database (Supabase)

Tạo bảng `nhap_xuat_kho` với các trường sử dụng `snake_case` (không dấu) giúp thuận tiện cho việc lập trình, nhưng sẽ hiển thị Tiếng Việt trên giao diện.

#### [NEW] `nhap_xuat_kho` table
```sql
CREATE TABLE nhap_xuat_kho (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  loai_phieu text NOT NULL, -- Nhập kho / Xuất kho (Sẽ xác nhận lại)
  id_don_hang text, -- Nhập thủ công
  co_so text, -- "Cơ sở Bắc Giang", "Cơ sở Bắc Ninh"
  ten_mat_hang text NOT NULL,
  so_luong numeric DEFAULT 0,
  gia numeric DEFAULT 0,
  tong_tien numeric DEFAULT 0,
  ngay date DEFAULT CURRENT_DATE,
  gio time DEFAULT CURRENT_TIME,
  nguoi_thuc_hien text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

---

### Backend / Data Layer

#### [NEW] [inventoryData.ts](file:///c:/Users/dungv/quan_ly_cua_hang_xe/src/data/inventoryData.ts)
- Định nghĩa interface `InventoryRecord` với các trường Tiếng Việt.
- Các hàm CRUD: `getInventoryRecords`, `addInventoryRecord`, `deleteInventoryRecord`.

---

### Frontend / UI

#### [MODIFY] [moduleData.ts](file:///c:/Users/dungv/quan_ly_cua_hang_xe/src/data/moduleData.ts)
- Cập nhật `path: '/kho-van/xuat-nhap-kho'` cho thẻ "Xuất nhập kho".

#### [MODIFY] [App.tsx](file:///c:/Users/dungv/quan_ly_cua_hang_xe/src/App.tsx)
- Thêm route mới: `<Route path="/kho-van/xuat-nhap-kho" element={<InventoryManagementPage />} />`.

#### [NEW] [InventoryManagementPage.tsx](file:///c:/Users/dungv/quan_ly_cua_hang_xe/src/pages/InventoryManagementPage.tsx)
- Giao diện chính hiển thị danh sách lịch sử xuất nhập.
- Bộ lọc theo Loại phiếu, Cơ sở, Ngày tháng.

#### [NEW] [AddInventoryDialog.tsx](file:///c:/Users/dungv/quan_ly_cua_hang_xe/src/pages/inventory/dialogs/AddInventoryDialog.tsx)
- Form nhập liệu mới với đầy đủ các trường yêu cầu.
- Tự động tính "Tổng tiền" = "Số lượng" * "Giá".

## Verification Plan

### Automated Tests
- Chạy `npm run lint` để kiểm tra lỗi cú pháp.

### Manual Verification
1. Truy cập vào module **Kho vận** -> **Xuất nhập kho**.
2. Nhấn "Thêm mới" và nhập dữ liệu.
3. Kiểm tra tính toán "Tổng tiền".
4. Kiểm tra tên cột trong SQL qua Supabase Dashboard.
