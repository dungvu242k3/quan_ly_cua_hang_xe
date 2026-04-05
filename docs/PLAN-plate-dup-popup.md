# PLAN: Biển số xe trùng → Mở popup Lập Phiếu Bán hàng Mới

## Overview
Khi nhập biển số xe ở form Thêm Khách hàng mà phát hiện **biển số đã tồn tại**, hệ thống sẽ:
1. Hiện thông báo xác nhận ("Khách hàng X đã tồn tại. Bạn muốn lập phiếu bán hàng?")
2. Nếu OK → Chuyển sang trang Quản lý Phiếu Bán hàng
3. **Tự động mở popup "Lập Phiếu Bán hàng Mới"** với pre-fill: Khách hàng + Người phụ trách (user đang đăng nhập)

## Vấn đề hiện tại
- **`CustomerFormModal.tsx` (L84-121):** Khi phát hiện biển số trùng → navigate thẳng sang trang `/ban-hang/phieu-ban-hang` **KHÔNG** có xác nhận (confirm). User bị chuyển trang bất ngờ.
- **`SalesCardManagementPage.tsx` (L99-143):** Code logic auto-open modal đã CÓ nhưng **không hoạt động đúng** do race condition:
  - `useEffect(() => { ... }, [])` chạy 1 lần khi mount
  - Nhưng `personnel` state rỗng tại thời điểm đó → fallback `await getPersonnel()` có thể fail
  - Modal có thể không mở được nếu query Supabase lỗi hoặc customer không tìm thấy

## Proposed Changes

### 1. `CustomerFormModal.tsx` — Thêm confirm dialog

#### [MODIFY] [CustomerFormModal.tsx](file:///c:/Users/dungv/quan_ly_cua_hang_xe/src/components/CustomerFormModal.tsx)

**Dòng 94-108:** Thay vì navigate thẳng, thêm `window.confirm()` trước khi chuyển:

```diff
 if (existing && existing.id !== (customer ? customer.id : '')) {
   if (!customer) {
     const isOnSalesPage = location.pathname.includes('/ban-hang/phieu-ban-hang');
     
     if (!isOnSalesPage) {
-      console.log('[DEBUG] Saving pendingCustomerId to sessionStorage:', existing.id);
-      sessionStorage.setItem('pendingCustomerId', existing.id);
-      navigate('/ban-hang/phieu-ban-hang');
-      onClose();
+      const confirmed = window.confirm(
+        `⚠️ Biển số "${plate}" đã thuộc về khách hàng: ${existing.ho_va_ten}\n\n` +
+        `Bạn có muốn lập Phiếu Bán hàng mới cho khách hàng này không?`
+      );
+      if (confirmed) {
+        sessionStorage.setItem('pendingCustomerId', existing.id);
+        navigate('/ban-hang/phieu-ban-hang');
+        onClose();
+      }
     } else {
       onSuccess(existing);
       onClose();
     }
```

---

### 2. `SalesCardManagementPage.tsx` — Fix auto-open modal

#### [MODIFY] [SalesCardManagementPage.tsx](file:///c:/Users/dungv/quan_ly_cua_hang_xe/src/pages/SalesCardManagementPage.tsx)

**Dòng 99-143:** Refactor useEffect để robust hơn:

- Đợi `loadData()` hoàn tất trước khi đọc `pendingCustomerId`
- Đảm bảo personnel đã load xong
- Luôn gọi `getPersonnel()` fresh thay vì dùng state có thể rỗng
- Thêm guard check tốt hơn

```diff
  useEffect(() => {
    const pendingId = sessionStorage.getItem('pendingCustomerId');
    if (!pendingId) return;
    sessionStorage.removeItem('pendingCustomerId');

    const openFormForCustomer = async () => {
      try {
        const { data: customer } = await supabase
          .from('khach_hang')
-         .select('id, ma_khach_hang, ho_va_ten, so_dien_thoai, so_km')
+         .select('id, ma_khach_hang, ho_va_ten, so_dien_thoai, so_km, bien_so_xe')
          .eq('id', pendingId)
          .maybeSingle();

        if (!customer) {
          console.warn('[DEBUG] Customer not found for id:', pendingId);
          return;
        }

-       const persData = personnel.length > 0 ? personnel : await getPersonnel();
+       // Always fetch fresh to avoid race condition with empty state
+       const persData = await getPersonnel();
        const matchedUser = persData.find(
          p => p.ho_ten?.toLowerCase() === currentUser?.ho_ten?.toLowerCase()
        ) || persData[0];

        setEditingCard(null);
        setIsReadOnlyModal(false);
        setFormData({
          ngay: new Date().toISOString().split('T')[0],
          gio: new Date().toLocaleTimeString('vi-VN', ...),
          khach_hang_id: customer.ma_khach_hang || customer.id,
          nhan_vien_id: matchedUser ? matchedUser.ho_ten : '',
          dich_vu_id: '',
          dich_vu_ids: [],
          so_km: customer.so_km || 0,
          ngay_nhac_thay_dau: ''
        });
+       // Delay slightly to ensure React state is ready
+       setTimeout(() => setIsModalOpen(true), 100);
-       setIsModalOpen(true);
      } catch (err) {
        console.error('Error auto-opening form:', err);
      }
    };

    openFormForCustomer();
  }, []);
```

**Key fix:** Dùng `setTimeout` nhỏ (~100ms) để đảm bảo state đã update trước khi mở modal, tránh race condition React batch update.

---

## File Summary

| File | Thay đổi |
|------|----------|
| `src/components/CustomerFormModal.tsx` | Thêm `window.confirm()` trước khi navigate |
| `src/pages/SalesCardManagementPage.tsx` | Fix race condition auto-open modal |

## Verification
- [ ] Nhập biển số trùng → hiện confirm dialog với tên khách hàng
- [ ] Nhấn OK → chuyển trang + popup "Lập Phiếu Bán hàng Mới" mở tự động
- [ ] Popup pre-fill: Khách hàng + Người phụ trách (user đăng nhập)
- [ ] Nhấn Hủy → ở lại form, không chuyển trang
- [ ] Không có console error
