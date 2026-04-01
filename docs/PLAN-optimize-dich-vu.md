# PLAN: Tối ưu trang Dịch Vụ — Phân trang, Tìm kiếm & Trải nghiệm nhập liệu

## Tổng quan vấn đề

Trang Dịch Vụ (`/dich-vu`) hiện tại có những vấn đề tương tự trang Thu Chi trước đây:

1. **Tải toàn bộ dữ liệu** — `getServices()` kéo toàn bộ bảng `dich_vu` từ server về client.
2. **Lọc dữ liệu trên máy khách (Client-side filtering)** — Việc tìm kiếm và lọc cơ sở chạy bằng JavaScript (`useMemo`) gây giật lag trên dữ liệu lớn.
3. **Modal nhập liệu nằm chung file chính** — Việc gõ dữ liệu, thả ảnh vào Form kích hoạt re-render bảng dữ liệu khổng lồ phía sau.
4. **UX Nhập liệu chưa tối ưu** — Thiếu auto-focus và Tab index lộn xộn.

---

## Giải pháp đề xuất

### Phase 1: Server-side Pagination + Search (P0)

1. **Thêm `getServicesPaginated`** vào `src/data/serviceData.ts`.
   - Cung cấp tính năng phân trang (`page`, `pageSize`).
   - Tìm kiếm (ILIKE) theo `ten_dich_vu` diễn ra trực tiếp trên cơ sở dữ liệu Supabase.
   - Lọc theo `co_so` (Cơ sở) áp dụng trên query báo cáo.

2. **Cập nhật `ServiceManagementPage.tsx`**:
   - Thêm state phân trang (`currentPage`, `pageSize`, `totalCount`).
   - Sử dụng thẻ `<Pagination />` hiện có.
   - Gọi API qua cơ chế Debounce (500ms) khi gõ tìm kiếm.
   - Reset về `Page 1` khi ô tìm kiếm hay bộ lọc thay đổi.

---

### Phase 2: Tách Modal ra component riêng (P1)

1. **Tạo file `src/components/ServiceFormModal.tsx`**:
   - Chuyển mã cục Modal (từ dòng 447 đến 525) sang component độc lập.
   - Đóng gói bằng `React.memo` để triệt tiêu re-render lây lan từ trang danh sách về modal hoặc ngược lại.

2. **Tích hợp lại vào trang chính**:
   - Xóa bỏ hàng loạt code form thừa trong `ServiceManagementPage.tsx`
   - Dọn sạch các import không còn dùng (`Camera`, `Save`, `X`, `Calendar`...)

---

### Phase 3: Tăng tốc nhập liệu & UX (P2)

1. **Auto-Focus thông minh**: Tự động chuyển con trỏ chuột vào ô `Tên dịch vụ` ngay khi bấm nút "Thêm dịch vụ mới".
2. **Tối ưu Tab Order**: Cấu trúc lại luồng đi phím Tab `Tab -> Tên dịch vụ -> Cơ sở -> Giá nhập -> Giá bán -> Hoa hồng -> Ngày tháng` để thao tác nhập phím không bị sai lệch.
3. Gắn cơ chế Format tiền VNĐ (1.000.000) Live trong lúc bấm phím.

---

## Task Breakdown

| Task | Mô tả | File(s) |
|------|--------|---------|
| T1 | Viết hàm `getServicesPaginated()` | `serviceData.ts` |
| T2 | Tạo Component Modal riêng, xử lý Auto-focus + TabIndex | `ServiceFormModal.tsx` |
| T3 | Refactor trang quản lý, xóa bộ lọc tĩnh, thêm Phân trang | `ServiceManagementPage.tsx` |

---

## Verification Plan

- [ ] Lệnh `npm run build` biên dịch thành công (0 lỗi TypeScript).
- [ ] Mở `/dich-vu` không delay, dữ liệu hiển thị tốt với bộ phân trang (trang sau, trang trước).
- [ ] Nhập tìm kiếm -> Chỉ kết quả liên quan hiển thị, hệ thống phản hồi mượt sau khi ngừng gõ nửa giây.
- [ ] Bấm thêm mới -> Con trỏ chuột nằm sẵn ở ô Tên Dịch Vụ, modal nhập rất mượt.
