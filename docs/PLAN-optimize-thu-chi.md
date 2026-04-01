# PLAN: Tối ưu trang Thu Chi — Phân trang, Tốc độ tải & Ghi nhận phiếu mới

## Tổng quan vấn đề

Trang Thu Chi (`/thu-chi`) hiện tại có **3 vấn đề hiệu năng**:

1. **Tải hết dữ liệu cùng lúc** — `getTransactions()` fetch TOÀN BỘ bảng `thu_chi` về client → lag khi lượng dữ liệu lớn
2. **Chưa có phân trang (pagination)** — Bảng render hàng ngàn dòng DOM → scroll chậm, browser nặng
3. **Modal ghi nhận phiếu mới nằm chung file 661 dòng** — re-render nặng khi mở modal / nhập liệu

---

## Phân tích chi tiết

### 🔴 Vấn đề 1: Data Loading (Nghiêm trọng)

**Hiện tại:** `getTransactions()` → `SELECT * FROM thu_chi` (không limit, không offset)

```typescript
// financialData.ts — dòng 20-32
export const getTransactions = async (): Promise<ThuChi[]> => {
  const { data, error } = await supabase
    .from('thu_chi')
    .select('*')
    .order('ngay', { ascending: false })
    .order('gio', { ascending: false });
  // ← Fetch ALL records, no pagination
};
```

**Tại sao chậm:** Với 1000+ bản ghi, mỗi request fetch ~200KB+ JSON. Trên Vercel, round-trip time tới Supabase ~100-300ms + transfer ~200ms = **500ms+ delay** mỗi lần load.

### 🔴 Vấn đề 2: Client-side filtering (Không scale)

**Hiện tại:** Filter + Search chạy hoàn toàn trên client bằng `useMemo`:

```typescript
// FinancialManagementPage.tsx — dòng 74-87
const filteredTransactions = useMemo(() => {
  return transactions.filter(t => { ... }); // ← Filter 1000+ items in JS
}, [transactions, searchQuery, selectedBranches, selectedTypes]);
```

Khi dataset lớn, mỗi keystroke gây re-filter hàng ngàn items → UI giật.

### 🟡 Vấn đề 3: Thống kê phải tính lại từ toàn bộ data

```typescript
// dòng 89-93
const stats = useMemo(() => {
  const income = transactions.filter(...).reduce(...);
  const expense = transactions.filter(...).reduce(...);
  return { income, expense, balance: income - expense };
}, [transactions]);
```

Stats cần TOÀN BỘ data (vì tổng thu/chi không phải chỉ trang hiện tại). Cần query riêng từ server.

### 🟡 Vấn đề 4: Modal form nặng

Modal nằm trực tiếp trong file chính (661 dòng). Tốn performance vì mỗi khi `isModalOpen`, `formData` hay bất kỳ state nào thay đổi → toàn bộ page (table + stats + toolbar + modal) re-render.

---

## Giải pháp đề xuất

### Phase 1: Server-side Pagination + Search (P0 — Ưu tiên cao nhất)

#### T1.1: Tạo `getTransactionsPaginated()` trong `financialData.ts`

Áp dụng đúng pattern đã có sẵn từ `getSalesCardCTsPaginated()`:

```typescript
export const getTransactionsPaginated = async (
  page: number,
  pageSize: number,
  searchQuery?: string,
  filters?: { branches?: string[], types?: string[] }
): Promise<{ data: ThuChi[], totalCount: number }> => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from('thu_chi').select('*', { count: 'exact' });

  if (searchQuery) {
    query = query.or(`danh_muc.ilike.%${searchQuery}%,ghi_chu.ilike.%${searchQuery}%,id_don.ilike.%${searchQuery}%,id_khach_hang.ilike.%${searchQuery}%`);
  }
  if (filters?.branches?.length) {
    query = query.in('co_so', filters.branches);
  }
  if (filters?.types?.length) {
    query = query.in('loai_phieu', filters.types);
  }

  const { data, count, error } = await query
    .order('ngay', { ascending: false })
    .order('gio', { ascending: false })
    .range(from, to);

  return { data: data || [], totalCount: count || 0 };
};
```

#### T1.2: Tạo `getTransactionStats()` trong `financialData.ts`

Tính tổng thu/chi trên server, không cần fetch toàn bộ data:

```typescript
export const getTransactionStats = async (): Promise<{ income: number, expense: number }> => {
  // Tính thu
  const { data: incomeData } = await supabase
    .from('thu_chi')
    .select('so_tien')
    .eq('loai_phieu', 'phiếu thu')
    .eq('trang_thai', 'Hoàn thành');
  
  // Tính chi
  const { data: expenseData } = await supabase
    .from('thu_chi')
    .select('so_tien')
    .eq('loai_phieu', 'phiếu chi')
    .eq('trang_thai', 'Hoàn thành');

  const income = (incomeData || []).reduce((s, t) => s + Number(t.so_tien), 0);
  const expense = (expenseData || []).reduce((s, t) => s + Number(t.so_tien), 0);
  return { income, expense };
};
```

#### T1.3: Cập nhật `FinancialManagementPage.tsx`

- Thêm state: `currentPage`, `pageSize`, `totalCount`
- Sử dụng `useCallback` cho `loadData`
- Di chuyển filter logic lên server (bỏ `useMemo` filter)
- Thêm component `<Pagination />` (đã có sẵn)
- Dùng `useTransition` cho search input
- Thêm `debounce` (500ms) cho search query

---

### Phase 2: Tách Modal ra component riêng (P1)

#### T2.1: Tạo `FinancialFormModal.tsx`

Tách modal form (dòng 534-609) ra file riêng `src/components/FinancialFormModal.tsx`. Wrap với `React.memo` để chỉ re-render khi props thay đổi, không re-render khi table data thay đổi.

---

### Phase 3: Tăng tốc nhập liệu (P2)

#### T3.1: Cải thiện UX nhập liệu trong form modal

- Auto-focus vào ô "Số tiền" khi mở modal mới
- Format số tiền "live" (hiện `1.000.000` thay vì `1000000`)
- Tab order tối ưu: Loại phiếu → Số tiền → Danh mục → Cơ sở → Ghi chú

---

## Task Breakdown

| Task | Mô tả | File(s) | Priority | Effort |
|------|--------|---------|----------|--------|
| T1.1 | `getTransactionsPaginated()` | `financialData.ts` | P0 | 5 min |
| T1.2 | `getTransactionStats()` | `financialData.ts` | P0 | 5 min |
| T1.3 | Cập nhật page với pagination + server filter | `FinancialManagementPage.tsx` | P0 | 15 min |
| T2.1 | Tách `FinancialFormModal.tsx` | `FinancialFormModal.tsx` (NEW) | P1 | 10 min |
| T3.1 | Auto-focus + tab order modal | `FinancialFormModal.tsx` | P2 | 5 min |

---

## Agent Assignment

| Agent | Tasks |
|-------|-------|
| `frontend-specialist` | T1.1, T1.2, T1.3, T2.1, T3.1 |

---

## ✅ PHASE X: VERIFICATION

- [ ] `npm run build` — không lỗi TypeScript
- [ ] Trang Thu Chi load nhanh (< 500ms) với 1000+ records
- [ ] Phân trang hoạt động: chuyển trang, đổi page size
- [ ] Search server-side: gõ tên danh mục → kết quả đúng
- [ ] Filter cơ sở + loại phiếu hoạt động đúng
- [ ] Stats cards (Tổng Thu/Chi/Số dư) hiện đúng bất kể trang nào
- [ ] Modal mở nhanh, nhập liệu mượt
- [ ] Navigate đi rồi quay lại → data vẫn hiện (không reload)
