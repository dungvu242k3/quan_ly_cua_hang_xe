# Hướng dẫn Nâng cấp Giao diện & Logic Bảng lương

Tôi đã hoàn thành việc nâng cấp toàn diện trang Bảng lương để đạt chuẩn SaaS chuyên nghiệp và khớp hoàn toàn với logic nghiệp vụ bạn yêu cầu.

## Các Thay đổi Chính

### 1. Header & Bộ lọc Chuyên nghiệp
- **Tìm kiếm thông minh**: Hỗ trợ tìm kiếm **không dấu** (accent-insensitive) cho cả bảng lương chính và modal chọn nhân viên.
- **Tiêu đề thông minh**: Hiển thị linh hoạt theo Tháng/Năm và Cơ sở. Bạn có thể nhấn vào icon Bút chì để thay đổi kỳ lương.
- **Nút Hành động**: Thêm nút **"Chọn nhân viên"** (+) để mở rộng danh sách lương.
- **Tiện ích nâng cao**: Đã kích hoạt các nút **Xuất File (CSV)**, **Lọc nâng cao**, và **Tùy chỉnh cột** ngay trong thanh bộ lọc.
- **Bộ lọc cải tiến**: Tách biệt rõ ràng ô tìm kiếm và các dropdown lọc theo Trạng thái/Đơn vị. Khoảng cách giữa các thành phần được tối ưu để dễ nhìn hơn.

### 2. Bảng dữ liệu Nâng cao
- **Avatar**: Hiển thị hình ảnh nhân sự hoặc tên viết tắt trong hình tròn chuyên nghiệp.
- **Tùy chỉnh cột**: Nhấn vào icon Cài đặt ở thanh bộ lọc để chọn các cột muốn hiển thị.
- **Chọn hàng loạt**: Sử dụng Checkbox để chọn nhiều nhân viên cùng lúc.

### 3. Logic "Chọn nhân viên" (Khớp Logic)
- Hệ thống sẽ liệt kê các nhân sự có trong danh mục `nhan_su` nhưng chưa có trong bảng lương tháng này.
- Khi chọn và nhấn "Thêm", hệ thống sẽ khởi tạo bản ghi lương mới cho họ.

### 4. Xử lý Hàng loạt
- Nút **"Trả lương"** hiện đã thông minh hơn: Nếu bạn chọn Checkbox, nó sẽ chỉ trả lương cho những người được chọn. Nếu không chọn ai, nó sẽ mặc định trả lương cho tất cả những người chưa được thanh toán.

## Verification Checklist (Phase X)

- [x] Giao diện khớp 100% so với ảnh mẫu.
- [x] Tính năng Ẩn/Hiện cột hoạt động mượt mà.
- [x] Modal "Chọn nhân viên" tích hợp thành công với Supabase.
- [x] Không còn lỗi Lint hoặc TypeScript.

> [!TIP]
> Bạn có thể thử tính năng **Tùy chỉnh cột** để tối ưu không gian hiển thị cho màn hình nhỏ!
