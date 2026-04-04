# Lên kế hoạch: Thống kê Giao dịch Khách hàng (Customer Orders & Revenue)

## Overview (Tổng quan)
- Thêm tính năng để admin/nhân viên có thể xem lịch sử giao dịch (danh sách đơn theo thẻ bán hàng, dịch vụ) và tổng doanh số của một khách hàng cụ thể.
- Tính năng được tích hợp trực tiếp bên trong thông tin khách hàng, cho phép lọc theo khoảng thời gian (Từ ngày - Đến ngày).

## Project Type
- **WEB** (Sử dụng `frontend-specialist`)

## Success Criteria (Tiêu chí thành công)
1. Thêm một View/Tab/Modal hiển thị chi tiết giao dịch từ trong "Quản lý Khách hàng".
2. Hiển thị được **Danh sách đơn hàng** (Mã Đơn, Ngày, Sản phẩm/Dịch vụ, Tổng tiền) dựa vào dữ liệu thẻ bán hàng (`the_ban_hang` và `the_ban_hang_ct`).
3. Có bộ lọc (Date Picker) **Từ ngày - Đến ngày** áp dụng đồng thời.
4. Hiển thị box **Tổng số đơn hàng** và **Tổng doanh số** thay đổi động theo bộ lọc thời gian.

## Tech Stack
- React (useState, useMemo, useEffect)
- Native HTML `<input type="date" />` 
- Tailwind CSS
- Lucide React (Icons)
- Supabase (Truy vấn dữ liệu từ `the_ban_hang` bằng `khach_hang_id`).

## File Structure
- `src/components/CustomerOrderHistory.tsx` (Component UI chính: lọc, thống kê, bảng).
- `src/data/salesCardData.ts` (Sử dụng hoặc bổ sung hàm fetch truyền tham số lọc ngày và mã khách hàng).
- `src/pages/CustomerManagementPage.tsx` (Thêm nút "Lịch sử MH" trong cột Action của bảng Danh sách KH để mở Component `CustomerOrderHistory`).

## Task Breakdown (Chi tiết công việc)

### Task 1: Xây dựng hàm lấy dữ liệu đơn hàng theo Date Range
- **Agent:** frontend-specialist
- **Mô tả:** Review lại `salesCardData.ts`, bổ sung hàm `getSalesCardsByCustomer(customerId, startDate, endDate)` để lấy toàn bộ `the_ban_hang` của khách hàng đó trong khoảng thời gian đã định.
- **INPUT:** `customerId`, `startDate`, `endDate`.
- **OUTPUT:** Function trả về mảng `SalesCard` kèm chi tiết hóa đơn.
- **VERIFY:** Truy vấn đúng Supabase không lỗi, lọc bằng `gte` và `lte` trên cột `ngay`.

### Task 2: Tạo component UI `CustomerOrderHistoryModal.tsx`
- **Agent:** frontend-specialist
- **Thực thi:** Build Component bao gồm:
  - Header: Tên khách hàng & Bộ lọc 2 input date (`Từ ngày`, `Đến ngày`).
  - Cards: 2 thẻ thống kê nhanh: "Tổng số đơn" và "Tổng doanh thu (VNĐ)".
  - Table: Hiển thị chi tiết (Mã Phiếu, Ngày, Dịch vụ sử dụng, Tổng tiền).
- **INPUT:** Data từ Task 1 truyền xuống.
- **OUTPUT:** Modal UI React Component đẹp, chuẩn màu sắc cửa hàng.
- **VERIFY:** Component render thành công, thay đổi date picker làm update State tổng số đơn.

### Task 3: UX Integration - Tích hợp UI vào Trang Quản lý Khách hàng
- **Agent:** frontend-specialist
- **Thực thi:** Trong bảng CustomerManagementPage, thêm 1 action icon (ví dụ FileText / Clock) để mở Lịch sử mua hàng của dòng đó. Mở ra Modal `CustomerOrderHistoryModal`.
- **INPUT:** Component từ Task 2 và Khách hàng tương ứng.
- **OUTPUT:** Click Action -> Component xuất hiện -> Load Data ứng với khách hàng đó.
- **VERIFY:** Chức năng hoạt động end-to-end, ko có warning Console.

## Phase X: Verification
- [ ] Code Lint / No TS errors: Không có thẻ ts-ignore lung tung.
- [ ] Logic tính tổng doanh thu: Map chính xác từ cột `tong_tien` hoặc tính tổng của `the_ban_hang_ct`.
- [ ] Giao diện không vi phạm rules mẫu cơ bản.
