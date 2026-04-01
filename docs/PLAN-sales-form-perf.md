# Tối ưu hiệu năng Form Bán hàng & Lập phiếu

## Mô tả vấn đề

Khi mở Form "Lập phiếu mới" hoặc "Thêm hạng mục CT", các thao tác chọn dropdown (Khách hàng, Nhân viên, Dịch vụ) và nhập liệu vào các ô input đang rất chậm và giật lag.

## Phân tích nguyên nhân gốc rễ (Root Cause)

Sau khi kiểm tra mã nguồn, tôi xác định được **3 nguyên nhân chính**:

### 1. Tải toàn bộ danh sách Khách hàng vào bộ nhớ (`getCustomers()`)

**File:** [SalesCardManagementPage.tsx](file:///c:/Users/dungv/quan_ly_cua_hang_xe/src/pages/SalesCardManagementPage.tsx#L50-L69)

```typescript
// Dòng 55: Tải TOÀN BỘ khách hàng mỗi lần mount
const [cardsResult, custData, persData, servData] = await Promise.all([
  getSalesCardsPaginated(currentPage, pageSize, searchQuery),
  getCustomers(),   // ⚠️ TẢI TẤT CẢ - hàng nghìn bản ghi
  getPersonnel(),
  getServices()
]);
```

Hàm `getCustomers()` tải **toàn bộ** bảng `khach_hang` (có thể hàng nghìn bản ghi kèm cột `anh` chứa Base64 cũ). Dữ liệu này sau đó được truyền vào `SalesCardFormModal` → `SearchableSelect`, tạo ra hàng nghìn DOM node trong dropdown.

### 2. `cmdk` (Command) render lại toàn bộ danh sách khi gõ phím

**File:** [SearchableSelect.tsx](file:///c:/Users/dungv/quan_ly_cua_hang_xe/src/components/ui/SearchableSelect.tsx#L98-L118)

Thư viện `cmdk` lọc danh sách bằng cách render **tất cả** `CommandItem` rồi ẩn những item không khớp, thay vì chỉ render các item khớp. Với 600+ khách hàng, mỗi lần gõ 1 ký tự trong ô tìm kiếm sẽ trigger re-render hàng trăm DOM node.

### 3. Form chung state với trang chính (SalesCardCTManagementPage)

**File:** [SalesCardCTManagementPage.tsx](file:///c:/Users/dungv/quan_ly_cua_hang_xe/src/pages/SalesCardCTManagementPage.tsx#L38-L45)

Form Chi tiết bán hàng (CT) vẫn nằm inline trong component chính. Mỗi lần `setFormData` được gọi (khi gõ phím), toàn bộ bảng danh sách + toolbar + pagination đều bị vẽ lại.

---

## Kế hoạch sửa chữa

### Bước 1: Virtualize danh sách dropdown (Tác động lớn nhất)

> [!IMPORTANT]
> Đây là bước quan trọng nhất vì nó trực tiếp xử lý nguyên nhân số 2 - render hàng nghìn DOM node.

#### [MODIFY] [SearchableSelect.tsx](file:///c:/Users/dungv/quan_ly_cua_hang_xe/src/components/ui/SearchableSelect.tsx)

- Thay thế việc render toàn bộ `options.map(...)` bằng **lọc trước rồi chỉ hiển thị tối đa 50 kết quả**.
- Khi user gõ vào ô tìm kiếm, chỉ render những item khớp (client-side filter), giới hạn 50 item đầu tiên.
- Thêm thông báo "Còn X kết quả khác, hãy nhập thêm để thu hẹp..." khi danh sách bị cắt.

#### [MODIFY] [MultiSearchableSelect.tsx](file:///c:/Users/dungv/quan_ly_cua_hang_xe/src/components/ui/MultiSearchableSelect.tsx)

- Áp dụng cùng chiến lược giới hạn render tối đa 50 item.
- Tối ưu logic `handleUnselect` để không trigger re-render không cần thiết.

### Bước 2: Tách Form CT thành Component riêng (Portal)

#### [NEW] [SalesCardCTFormModal.tsx](file:///c:/Users/dungv/quan_ly_cua_hang_xe/src/components/SalesCardCTFormModal.tsx)

- Tách toàn bộ phần Modal + Form từ `SalesCardCTManagementPage` thành Component con.
- Sử dụng `React.memo` + `createPortal` (giống pattern đã dùng cho `CustomerFormModal`).
- Di chuyển state `formData`, `editingItem` và các handler vào bên trong.

#### [MODIFY] [SalesCardCTManagementPage.tsx](file:///c:/Users/dungv/quan_ly_cua_hang_xe/src/pages/SalesCardCTManagementPage.tsx)

- Thay thế inline Modal bằng `<SalesCardCTFormModal />`.
- Truyền `isOpen`, `onClose`, `onSuccess`, `salesCards`, `services` làm props.

### Bước 3: Lazy-load danh sách Khách hàng trong SalesCardManagementPage

#### [MODIFY] [SalesCardManagementPage.tsx](file:///c:/Users/dungv/quan_ly_cua_hang_xe/src/pages/SalesCardManagementPage.tsx)

- Thay `getCustomers()` bằng phiên bản **chỉ lấy `id`, `ho_va_ten`, `so_dien_thoai`** (không lấy cột `anh` chứa Base64).
- Tạo hàm `getCustomersForSelect()` trong `customerData.ts` chỉ select các cột cần thiết.

#### [MODIFY] [customerData.ts](file:///c:/Users/dungv/quan_ly_cua_hang_xe/src/data/customerData.ts)

- Thêm hàm mới:
```typescript
export const getCustomersForSelect = async () => {
  const { data, error } = await supabase
    .from('khach_hang')
    .select('id, ho_va_ten, so_dien_thoai, bien_so_xe, ma_khach_hang')
    .order('ho_va_ten');
  // ...
};
```

---

## Tóm tắt thay đổi

| File | Hành động | Mục đích |
|------|-----------|----------|
| `SearchableSelect.tsx` | Giới hạn render 50 item | Giảm DOM node 90% |
| `MultiSearchableSelect.tsx` | Giới hạn render 50 item | Giảm DOM node 90% |
| `SalesCardCTFormModal.tsx` | [MỚI] Tách Component | Cô lập re-render |
| `SalesCardCTManagementPage.tsx` | Dùng Component mới | Trang không bị lag khi gõ |
| `customerData.ts` | Thêm `getCustomersForSelect` | Giảm payload 80% |
| `SalesCardManagementPage.tsx` | Dùng hàm mới | Tải nhanh hơn |

## Kế hoạch xác minh

### Kiểm tra thủ công
1. Mở Form "Lập phiếu mới" → Bấm vào dropdown Khách hàng → Gõ tên → Kiểm tra tốc độ phản hồi.
2. Chọn nhiều dịch vụ trong MultiSelect → Kiểm tra không bị lag.
3. Nhập số KM và các ô text → Kiểm tra phản hồi tức thì.
4. Mở Form "Thêm hạng mục CT" → Điền form → Kiểm tra mượt mà.

### Tiêu chí thành công
- Dropdown mở ra trong < 200ms
- Gõ phím phản hồi tức thì (< 50ms)
- Không có hiện tượng "freeze" trình duyệt khi chọn dịch vụ
