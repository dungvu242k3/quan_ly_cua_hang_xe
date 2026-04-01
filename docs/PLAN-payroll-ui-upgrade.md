# Kế hoạch Nâng cấp Giao diện & Logic Bảng lương (Payroll UI & Logic Upgrade)

Mục tiêu là biến giao diện Bảng lương hiện tại thành một Dashboard chuyên nghiệp, chuẩn SaaS và ĐẦY ĐỦ LOGIC nghiệp vụ dựa trên hình ảnh tham chiếu.

## Xác nhận Logic Nghiệp vụ từ Người dùng

> [!IMPORTANT]
> - **Mã nhân viên**: Tự động tạo theo quy tắc: Chữ cái đầu (Họ + Đệm) + Tên chính (Không dấu, Viết hoa). Ví dụ: `Phạm Trường Giang` -> `PTGIANG`.
> - **Chọn nhân viên**: Xây dựng Modal chọn nhân sự từ bảng `nhan_su`. Những nhân sự được chọn sẽ được tạo bản ghi mới trong `bang_luong` của tháng/năm/cơ sở hiện tại.
> - **Tùy chỉnh cột**: Quản lý trạng thái hiển thị cột bằng React State, cho phép ẩn/hiện các cột kỹ thuật hoặc lương chi tiết.
> - **Xử lý hàng loạt**: Tích hợp Checkbox để thực hiện Chi trả lương cho nhiều người cùng lúc.

## Các Thay đổi Đề xuất

### [Component] Giao diện & Logic Quản lý Bảng lương

#### [MODIFY] [PayrollPage.tsx](file:///c:/Users/dungv/quan_ly_cua_hang_xe/src/pages/PayrollPage.tsx)
- **Quản lý Column Visibility**: Thêm state `visibleColumns` và menu dropdown để điều chỉnh.
- **Selection State**: Thêm state `selectedIds` cho checkbox.
- **SelectEmployeeModal**: Component mới để thực hiện logic "Chọn nhân viên".
- **Logic Tính toán**: Đảm bảo các cột Doanh số, Tỷ lệ hoàn thành được tính toán đúng dựa trên dữ liệu hiện có.

#### [MODIFY] [payrollData.ts](file:///c:/Users/dungv/quan_ly_cua_hang_xe/src/data/payrollData.ts)
- Cập nhật `getPayrollBatch` để lấy đầy đủ thông tin nhân sự (Avatar, ID).
- Thêm hàm `bulkCreatePayrollItems` để hỗ trợ tính năng "Chọn nhân viên".

## Danh sách Tác vụ (Task Breakdown)

1. [ ] **Task 1**: Cập nhật Model & Logic dữ liệu (hỗ trợ Avatar, Mã nhân viên ảo, Bulk Create).
2. [ ] **Task 2**: Refactor Header & Thanh bộ lọc (Thêm button Chọn nhân viên, Layout chuẩn).
3. [ ] **Task 3**: Nâng cấp Table (Checkbox, STT, Mã NV, Avatar, Logic Ẩn/Hiện cột).
4. [ ] **Task 4**: Xây dựng Modal "Chọn nhân viên" và logic thêm vào bảng lương.
5. [ ] **Task 5**: Triển khai logic "Tùy chỉnh cột" và "Xử lý hàng loạt".

## Kế hoạch Xác minh (Phase X)

- [ ] Kiểm tra logic tạo Mã nhân viên với các tên có dấu phức tạp.
- [ ] Kiểm tra việc thêm nhân viên mới vào bảng lương (không trùng lặp).
- [ ] Kiểm tra tính năng ẩn/hiện cột có mượt mà không.
- [ ] Kiểm tra xử lý hàng loạt khi chọn hàng trăm nhân viên.
