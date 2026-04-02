import { clsx } from 'clsx';
import {
  ArrowLeft,
  Building2,
  ChevronDown,
  Download,
  Edit2,
  History,
  List,
  Plus,
  Search,
  Trash2,
  Upload,
  User
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import CustomerDetailsModal from '../components/CustomerDetailsModal';
import CustomerFormModal from '../components/CustomerFormModal';
import Pagination from '../components/Pagination';
import type { KhachHang } from '../data/customerData';
import { bulkDeleteCustomers, bulkUpsertCustomers, deleteCustomer, getCustomersPaginated } from '../data/customerData';

const CustomerManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<KhachHang[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  // Filter states (keep for now, but focus on pagination first)
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [selectedCycles, setSelectedCycles] = useState<string[]>([]);

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<KhachHang | null>(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<KhachHang | null>(null);

  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'anh', 'ma_khach_hang', 'ho_va_ten', 'so_dien_thoai', 'dia_chi_hien_tai', 'bien_so_xe',
    'ngay_dang_ky', 'so_km', 'so_ngay_thay_dau', 'ngay_thay_dau', 'actions'
  ]);

  const allColumns = [
    { id: 'anh', label: 'Ảnh' },
    { id: 'ho_va_ten', label: 'Họ và tên' },
    { id: 'so_dien_thoai', label: 'Số điện thoại' },
    { id: 'dia_chi_hien_tai', label: 'Địa chỉ' },
    { id: 'bien_so_xe', label: 'Biển số' },
    { id: 'ngay_dang_ky', label: 'Ngày đăng ký' },
    { id: 'so_km', label: 'Số KM' },
    { id: 'so_ngay_thay_dau', label: 'Chu kỳ' },
    { id: 'ngay_thay_dau', label: 'Ngày thay dầu' },
    { id: 'actions', label: 'Thao tác' }
  ];

  const toggleColumn = useCallback((colId: string) => {
    setVisibleColumns(prev =>
      prev.includes(colId) ? prev.filter(c => c !== colId) : [...prev, colId]
    );
  }, []);

  const cycleOptions = useMemo(() => ["30 ngày", "60 ngày", "90 ngày", "180 ngày"], []);
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Load data from Supabase with pagination
  const loadCustomers = async () => {
    try {
      setLoading(true);
      // If we have local filters (Dept or Cycle), we still fetch all for now 
      // OR we can implement server-side filtering for those too.
      // For now, let's prioritize Search + Range.
      const { data, totalCount } = await getCustomersPaginated(currentPage, pageSize, searchQuery);
      setCustomers(data);
      setTotalCount(totalCount);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [currentPage, pageSize]); // Re-load when page or size changes

  // Reset page when searching
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) setCurrentPage(1);
      else loadCustomers();
    }, 500); // Debounce search
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (id: string) => {
    setOpenDropdown(prev => prev === id ? null : id);
  };

  const handleFilterChange = useCallback((setter: React.Dispatch<React.SetStateAction<string[]>>, val: string) => {
    setter(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  }, []);

  // Since we use Server-side pagination, 'customers' IS already the filtered list for the current page
  const displayCustomers = customers;




  const handleOpenModal = useCallback((customer?: KhachHang) => {
    setEditingCustomer(customer || null);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  }, []);

  const handleOpenDetails = useCallback((customer: KhachHang) => {
    setSelectedCustomer(customer);
    setIsDetailsOpen(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setIsDetailsOpen(false);
    setSelectedCustomer(null);
  }, []);



  const handleDownloadTemplate = () => {
    const templateData = [
      {
        "id": "",
        "Họ và tên": "Nguyễn Văn A",
        "SĐT": "0912345678",
        "Ảnh": "https://example.com/image.png",
        "Địa chỉ lưu trú hiện tại": "Bắc Giang",
        "Biển số Xe": "98A-123.45",
        "Ngày đăng ký": "2024-01-01",
        "Số Km": 15000,
        "Số ngày thay dầu": 60,
        "Ngày thay dầu": "2024-02-15"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "Mau_nhap_khach_hang.xlsx");
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        // Helper to convert Excel date serial numbers
        const formatExcelDate = (val: any) => {
          if (val === undefined || val === null || val === '') return undefined;
          if (typeof val === 'number' && val > 40000) {
            const d = new Date(Math.round((val - 25569) * 86400 * 1000));
            return d.toISOString().split('T')[0];
          }
          const s = String(val).trim();
          return s || undefined;
        };

        const formattedData: Partial<KhachHang>[] = data.map(row => {
          // Normalize keys (trim whitespace and handle case)
          const normalizedRow: any = {};
          Object.keys(row).forEach(key => {
            normalizedRow[key.trim().toLowerCase()] = row[key];
          });

          // Fuzzy mapping
          const getValue = (possibleKeys: string[]) => {
            const key = possibleKeys.find(k => normalizedRow[k.toLowerCase()] !== undefined);
            return key ? normalizedRow[key.toLowerCase()] : undefined;
          };

          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          const rawId = String(getValue(['id', 'mã', 'uuid', 'mã khách hàng']) || '').trim();
          const validId = uuidRegex.test(rawId) ? rawId : undefined;

          const res: Partial<KhachHang> = {
            ho_va_ten: String(getValue(['họ và tên', 'tên', 'tên khách hàng', 'họ tên']) || '').trim(),
            so_dien_thoai: String(getValue(['số điện thoại', 'sđt', 'phone']) || '').trim(),
            anh: getValue(['ảnh', 'hình ảnh', 'image', 'avatar']) || '',
            dia_chi_hien_tai: String(getValue(['địa chỉ', 'địa chỉ lưu trú hiện tại', 'địa chỉ hiện tại', 'address']) || '').trim(),
            bien_so_xe: String(getValue(['biển số xe', 'biển số', 'plate']) || '').trim(),
            ngay_dang_ky: formatExcelDate(getValue(['ngày đăng ký', 'ngay dang ky'])),
            so_km: Number(getValue(['số km', 'số km hiện tại', 'km'])) || 0,
            so_ngay_thay_dau: Number(getValue(['số ngày thay dầu', 'chu kỳ', 'số ngày'])) || 0,
            ngay_thay_dau: formatExcelDate(getValue(['ngày thay dầu', 'ngay thay dau'])),
            ma_khach_hang: !validId && rawId ? rawId : undefined // Save legacy ID if not UUID
          };

          // Find existing customer to prevent duplication
          const cleanPhone = (p: any) => String(p || '').replace(/\D/g, '');
          const rowPhone = cleanPhone(res.so_dien_thoai);

          const existing = customers.find(c => {
            const matchId = validId && c.id === validId;
            const matchMa = rawId && c.ma_khach_hang === rawId;
            const matchPhone = rowPhone && cleanPhone(c.so_dien_thoai) === rowPhone;
            return matchId || matchMa || matchPhone;
          });

          if (existing) {
            res.id = existing.id;
            // If ma_khach_hang is blank in DB but present in Excel, keep it
            if (!existing.ma_khach_hang && !validId && rawId) {
              res.ma_khach_hang = rawId;
            }
          } else if (validId) {
            res.id = validId;
          }

          return res;
        }).filter(item => item.ho_va_ten);

        if (formattedData.length > 0) {
          setLoading(true);
          await bulkUpsertCustomers(formattedData);
          await loadCustomers();
          alert(`Đã xử lý thành công ${formattedData.length} khách hàng!`);
        }
      } catch (error) {
        console.error("Lỗi khi nhập Excel:", error);
        alert("Lỗi khi đọc file Excel. Vui lòng kiểm tra lại định dạng file.");
      } finally {
        setLoading(false);
        if (e.target) e.target.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
      try {
        await deleteCustomer(id);
        await loadCustomers();
      } catch (error) {
        alert('Lỗi: Không thể xóa khách hàng.');
      }
    }
  }, [loadCustomers]);

  const handleDeleteAll = async () => {
    if (window.confirm('CẢNH BÁO: Bạn có chắc chắn muốn XÓA TẤT CẢ khách hàng?')) {
      if (window.confirm('HÀNH ĐỘNG NÀY KHÔNG THỂ HOÀN TÁC! Bạn vẫn muốn tiếp tục?')) {
        try {
          setLoading(true);
          await bulkDeleteCustomers();
          await loadCustomers();
          alert('Đã xóa sạch toàn bộ danh sách khách hàng.');
        } catch (error) {
          alert('Lỗi khi xóa dữ liệu.');
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const deptOptions = useMemo(() => Array.from(new Set(customers.map(c => c.dia_chi_hien_tai).filter(Boolean))), [customers]);

  return (
    <div className="w-full flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500 text-muted-foreground font-sans">
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="bg-card p-3 rounded-lg border border-border shadow-sm flex flex-wrap items-center gap-2 sm:gap-4 justify-between" ref={dropdownRef}>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded text-[13px] text-muted-foreground hover:bg-accent transition-colors">
              <ArrowLeft size={18} /> Quay lại
            </button>
            <div className="relative w-[180px] sm:w-[250px]">
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                <Search className="size-4 sm:size-[18px]" />
              </div>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 border border-border rounded text-[11px] sm:text-[13px] focus:ring-1 focus:ring-primary focus:border-primary placeholder-slate-400 outline-none"
                placeholder="Tìm khách, SĐT, biển số..."
                type="text"
              />
            </div>

            <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 custom-scrollbar-hide">
              {/* Dept Dropdown */}
              <div className="relative shrink-0">
                <button onClick={() => toggleDropdown('dept')} className="flex items-center gap-2 px-3 py-1.5 border border-border rounded text-[13px] text-muted-foreground min-w-[140px] justify-between bg-card hover:bg-accent">
                  <div className="flex items-center gap-2 shrink-0"><Building2 size={18} />Chi nhánh</div>
                  <ChevronDown size={18} className="shrink-0" />
                </button>
                {openDropdown === 'dept' && (
                  <div className="absolute top-10 left-0 z-50 min-w-[200px] bg-card border border-border rounded shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 bg-muted border-b border-border/50 flex items-center justify-between">
                      <label className="flex items-center gap-2 font-bold text-primary text-[13px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedDepts.length === deptOptions.length && deptOptions.length > 0}
                          onChange={(e) => setSelectedDepts(e.target.checked ? deptOptions : [])}
                          className="rounded border-border text-primary size-4"
                        /> Chọn tất cả
                      </label>
                      <button onClick={() => setSelectedDepts([])} className="text-[11px] text-destructive hover:underline font-medium">Xoá chọn</button>
                    </div>
                    <ul className="py-1 text-[13px] text-muted-foreground max-h-[200px] overflow-y-auto">
                      {deptOptions.map(dept => (
                        <li key={dept} className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedDepts.includes(dept)}
                            onChange={() => handleFilterChange(setSelectedDepts, dept)}
                            className="rounded border-border text-primary size-4"
                          /> {dept}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Cycle Dropdown */}
              <div className="relative shrink-0">
                <button onClick={() => toggleDropdown('cycle')} className="flex items-center gap-2 px-3 py-1.5 border border-border rounded text-[13px] text-muted-foreground min-w-[120px] justify-between bg-card hover:bg-accent">
                  <div className="flex items-center gap-2 shrink-0"><History size={18} />Chu kỳ</div>
                  <ChevronDown size={18} className="shrink-0" />
                </button>
                {openDropdown === 'cycle' && (
                  <div className="absolute top-10 left-0 z-50 min-w-[160px] bg-card border border-border rounded shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 bg-muted border-b border-border/50 flex items-center justify-between">
                      <label className="flex items-center gap-2 font-bold text-primary text-[13px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCycles.length === cycleOptions.length}
                          onChange={(e) => setSelectedCycles(e.target.checked ? cycleOptions : [])}
                          className="rounded border-border text-primary size-4"
                        /> Chọn tất cả
                      </label>
                      <button onClick={() => setSelectedCycles([])} className="text-[11px] text-destructive hover:underline font-medium">Xoá chọn</button>
                    </div>
                    <ul className="py-1 text-[13px] text-muted-foreground">
                      {cycleOptions.map(cycle => (
                        <li key={cycle} className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedCycles.includes(cycle)}
                            onChange={() => handleFilterChange(setSelectedCycles, cycle)}
                            className="rounded border-border text-primary size-4"
                          /> {cycle}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleOpenModal()}
                className="bg-primary hover:bg-primary/90 text-white px-3 py-1 sm:px-5 sm:py-1.5 rounded flex items-center gap-1.5 text-[12px] sm:text-[14px] font-semibold transition-colors shrink-0 shadow-sm"
              >
                <Plus className="size-4 sm:size-5" /> Thêm mới
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <div className="relative shrink-0">
              <button
                onClick={() => toggleDropdown('columns')}
                className={clsx(
                  "p-1.5 border rounded transition-colors",
                  openDropdown === 'columns' ? "bg-primary/10 border-primary text-primary" : "border-border text-muted-foreground hover:bg-accent"
                )}
                title="Cài đặt cột hiển thị"
              >
                <List size={20} />
              </button>
              {openDropdown === 'columns' && (
                <div className="absolute top-10 right-0 z-50 min-w-[200px] bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 bg-muted border-b border-border flex items-center justify-between">
                    <span className="text-[12px] font-bold text-foreground">Cài đặt hiển thị cột</span>
                    <button onClick={() => setVisibleColumns(allColumns.map(c => c.id))} className="text-[10px] text-primary hover:underline">Hiện tất cả</button>
                  </div>
                  <ul className="py-2 text-[13px] text-muted-foreground max-h-[300px] overflow-y-auto custom-scrollbar">
                    {allColumns.map(col => (
                      <li
                        key={col.id}
                        onClick={() => toggleColumn(col.id)}
                        className="px-4 py-2 hover:bg-accent cursor-pointer flex items-center gap-3 transition-colors"
                      >
                        <div className={clsx(
                          "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                          visibleColumns.includes(col.id) ? "bg-primary border-primary" : "border-border"
                        )}>
                          {visibleColumns.includes(col.id) && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        {col.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              onClick={handleDeleteAll}
              className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 border border-destructive/20 rounded text-[11px] sm:text-[13px] text-destructive hover:bg-destructive/10 transition-colors font-medium bg-card shrink-0"
              title="Xóa tất cả khách hàng"
            >
              <Trash2 className="size-4 sm:size-[18px]" />
              <span>Xóa tất cả</span>
            </button>

            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 border border-border rounded text-[11px] sm:text-[13px] text-muted-foreground hover:bg-accent transition-colors font-medium shrink-0"
              title="Tải mẫu Excel"
            >
              <Download className="size-4 sm:size-[18px]" />
              <span>Tải mẫu</span>
            </button>

            <div className="relative shrink-0">
              <button
                onClick={() => document.getElementById('excel-import')?.click()}
                className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 border border-border rounded text-[11px] sm:text-[13px] text-muted-foreground hover:bg-accent transition-colors font-medium"
                title="Nhập khách hàng từ file Excel"
              >
                <Upload className="size-4 sm:size-[18px]" />
                <span>Nhập Excel</span>
              </button>
              <input
                id="excel-import"
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                onChange={handleImportExcel}
              />
            </div>
          </div>
        </div>

        {/* Mobile View (Cards) */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-card p-4 rounded-xl border border-border animate-pulse space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-24" />
                    <div className="h-3 bg-muted rounded w-32" />
                  </div>
                </div>
                <div className="h-20 bg-muted rounded-lg" />
              </div>
            ))
          ) : displayCustomers.length > 0 ? (
            displayCustomers.map(customer => {
              const isDue = customer.ngay_thay_dau ? new Date(customer.ngay_thay_dau) <= today : false;
              const formatDateMobile = (dateStr?: string) => {
                if (!dateStr) return '—';
                const d = new Date(dateStr);
                return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('vi-VN');
              };

              return (
                <div key={customer.id} className="bg-card p-4 rounded-xl border border-border shadow-sm space-y-4 relative group hover:border-primary/30 transition-all">
                  {/* Row 1: Identity & Status */}
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden border border-border shadow-sm">
                        {customer.anh ? (
                          <img src={customer.anh} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User size={20} />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <button onClick={() => handleOpenDetails(customer)} className="text-[15px] font-black text-foreground hover:text-primary transition-colors text-left leading-tight">
                          {customer.ho_va_ten}
                        </button>
                        <span className="text-[11px] font-mono text-muted-foreground uppercase opacity-60">
                          {customer.ma_khach_hang || customer.id.slice(0, 8)}
                        </span>
                      </div>
                    </div>
                    {isDue && (
                      <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-black animate-pulse flex items-center gap-1">
                        ⚠️ CẦN THAY DẦU
                      </span>
                    )}
                  </div>

                  {/* Row 2: Contact */}
                  <div className="flex items-center gap-2 text-[14px] text-muted-foreground font-medium">
                    <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">📱</span>
                    {customer.so_dien_thoai || 'Chưa cập nhật'}
                  </div>

                  {/* Row 3: Vehicle Specs (Plate / KM / Cycle) */}
                  <div className="bg-muted/40 p-3 rounded-lg border border-border/40 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-bold text-muted-foreground/60">Biển số xe</div>
                      <span className={clsx(
                        "px-2 py-1 rounded text-[12px] font-black border block w-fit",
                        customer.bien_so_xe === 'Xe Chưa Biển' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-blue-50 text-blue-600 border-blue-100 uppercase"
                      )}>
                        {customer.bien_so_xe}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-bold text-muted-foreground/60">Quãng đường</div>
                      <div className="text-[14px] font-bold text-foreground">
                        {customer.so_km?.toLocaleString()} <span className="text-[10px] font-normal opacity-60">Km</span>
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Timeline */}
                  <div className="grid grid-cols-2 gap-2 text-[12px]">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-muted-foreground/60 text-[10px] uppercase font-bold">Ngày đăng ký:</span>
                      <span className="font-medium">{formatDateMobile(customer.ngay_dang_ky)}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-muted-foreground/60 text-[10px] uppercase font-bold">Lần thay dầu tới:</span>
                      <span className={clsx("font-black", isDue ? "text-red-600" : "text-primary")}>
                        {formatDateMobile(customer.ngay_thay_dau)}
                      </span>
                    </div>
                  </div>

                  {/* Actions for Mobile Card */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/30 overflow-x-auto no-scrollbar">
                    <button onClick={() => handleOpenDetails(customer)} className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-[12px] font-bold border border-blue-100 transition-colors shrink-0">
                      <List size={14} /> Chi tiết
                    </button>
                    <button onClick={() => handleOpenModal(customer)} className="flex items-center gap-1.5 px-3 py-1.5 text-primary hover:bg-primary/10 rounded-lg text-[12px] font-bold border border-primary/20 transition-colors shrink-0">
                      <Edit2 size={14} /> Sửa
                    </button>
                    <button onClick={() => handleDelete(customer.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-destructive hover:bg-destructive/10 rounded-lg text-[12px] font-bold border border-destructive/20 transition-colors shrink-0">
                      <Trash2 size={14} /> Xóa
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-card p-12 text-center text-muted-foreground border border-border border-dashed rounded-xl">
              Chưa có khách hàng nào được tìm thấy.
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-card rounded-lg border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted border-b border-border text-muted-foreground text-[10px] font-bold uppercase tracking-tighter">
                  <th className="px-2 py-1 w-6 text-center"><input className="rounded border-border text-primary size-3" type="checkbox" /></th>
                  {visibleColumns.includes('ma_khach_hang') && <th className="px-2 py-1 font-semibold">Mã</th>}
                  {visibleColumns.includes('anh') && <th className="px-2 py-1 font-semibold">Ảnh</th>}
                  {visibleColumns.includes('ho_va_ten') && <th className="px-2 py-1 font-semibold">Họ tên</th>}
                  {visibleColumns.includes('so_dien_thoai') && <th className="px-2 py-1 font-semibold">SĐT</th>}
                  {visibleColumns.includes('dia_chi_hien_tai') && <th className="px-2 py-1 font-semibold">Địa chỉ</th>}
                  {visibleColumns.includes('bien_so_xe') && <th className="px-2 py-1 font-semibold">Biển</th>}
                  {visibleColumns.includes('ngay_dang_ky') && <th className="px-2 py-1 font-semibold">Ngày ĐK</th>}
                  {visibleColumns.includes('so_km') && <th className="px-2 py-1 font-semibold">KM</th>}
                  {visibleColumns.includes('so_ngay_thay_dau') && <th className="px-2 py-1 font-semibold">CK</th>}
                  {visibleColumns.includes('ngay_thay_dau') && <th className="px-2 py-1 font-semibold">Lần tới</th>}
                  {visibleColumns.includes('actions') && <th className="px-2 py-1 text-center font-semibold">Lệnh</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px]">
                {loading ? (
                  Array.from({ length: pageSize }).map((_, i) => (
                    <SkeletonRow key={i} visibleColumns={visibleColumns} />
                  ))
                ) : displayCustomers.map(customer => (
                  <CustomerTableRow
                    key={customer.id}
                    customer={customer}
                    visibleColumns={visibleColumns}
                    onEdit={handleOpenModal}
                    onDelete={handleDelete}
                    onOpenDetails={handleOpenDetails}
                    today={today}
                  />
                ))}
                {!loading && displayCustomers.length === 0 && (
                  <tr>
                    <td colSpan={12} className="px-4 py-8 text-center text-muted-foreground">
                      Không tìm thấy khách hàng nào khớp với điều kiện tìm kiếm.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
        />
      </div>

      {/* Modal - Add/Edit Customer */}
      <CustomerFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={loadCustomers}
        customer={editingCustomer}
      />

      {/* Modal - Customer Details & History */}
      <CustomerDetailsModal
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
        customer={selectedCustomer}
      />
    </div>
  );
};

// Optimized Row Component
const CustomerTableRow: React.FC<{
  customer: KhachHang,
  visibleColumns: string[],
  onEdit: (customer: KhachHang) => void,
  onDelete: (id: string) => void,
  onOpenDetails: (customer: KhachHang) => void,
  today: Date
}> = React.memo(({ customer, visibleColumns, onEdit, onDelete, onOpenDetails, today }) => {
  const isCầnThayDầu = customer.ngay_thay_dau ? new Date(customer.ngay_thay_dau) <= today : false;

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('vi-VN');
    } catch { return dateStr; }
  };

  return (
    <tr className="hover:bg-muted/80 transition-colors border-b border-slate-50 last:border-0 h-8">
      <td className="px-2 py-1 text-center"><input className="rounded border-border text-primary size-3" type="checkbox" /></td>
      {visibleColumns.includes('ma_khach_hang') && <td className="px-2 py-1 font-mono text-[9px] text-muted-foreground/50 uppercase">{customer.ma_khach_hang || customer.id.slice(0, 6)}</td>}
      {visibleColumns.includes('anh') && (
        <td className="px-2 py-1">
          <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary overflow-hidden border border-border shadow-sm">
            {customer.anh ? (
              <img src={customer.anh} alt="" className="w-full h-full object-cover border-none" loading="lazy" />
            ) : (
              <User size={12} />
            )}
          </div>
        </td>
      )}
      {visibleColumns.includes('ho_va_ten') && (
        <td className="px-2 py-1 font-bold text-foreground whitespace-nowrap text-[11px]">
          <button onClick={() => onOpenDetails(customer)} className="text-primary hover:underline transition-all text-left">
            {customer.ho_va_ten}
          </button>
        </td>
      )}
      {visibleColumns.includes('so_dien_thoai') && <td className="px-2 py-1 text-muted-foreground/80 whitespace-nowrap text-[11px] tabular-nums">{customer.so_dien_thoai}</td>}
      {visibleColumns.includes('dia_chi_hien_tai') && (
        <td className="px-2 py-1 text-muted-foreground/70 text-[10px] truncate max-w-[120px]" title={customer.dia_chi_hien_tai}>
          {customer.dia_chi_hien_tai || '—'}
        </td>
      )}
      {visibleColumns.includes('bien_so_xe') && (
        <td className="px-2 py-1">
          <span className={clsx(
            "px-1 py-0 rounded text-[9px] font-black border tracking-tighter",
            customer.bien_so_xe === 'Xe Chưa Biển' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-blue-50 text-blue-600 border-blue-100 uppercase"
          )}>
            {customer.bien_so_xe}
          </span>
        </td>
      )}
      {visibleColumns.includes('ngay_dang_ky') && <td className="px-2 py-1 text-muted-foreground/60 whitespace-nowrap text-[10px]">{formatDate(customer.ngay_dang_ky)}</td>}
      {visibleColumns.includes('so_km') && (
        <td className="px-2 py-1 font-bold text-foreground text-[11px] tabular-nums">
          {customer.so_km?.toLocaleString()} <span className="font-normal text-muted-foreground/50 text-[9px]">Km</span>
        </td>
      )}
      {visibleColumns.includes('so_ngay_thay_dau') && <td className="px-2 py-1 text-center text-muted-foreground/60 text-[11px]">{customer.so_ngay_thay_dau}</td>}
      {visibleColumns.includes('ngay_thay_dau') && (
        <td className="px-2 py-1">
          <div className="flex items-center gap-1">
            <span className={clsx("font-bold text-[11px] tabular-nums", isCầnThayDầu ? "text-red-500" : "text-muted-foreground/80")}>
              {formatDate(customer.ngay_thay_dau)}
            </span>
          </div>
        </td>
      )}
      {visibleColumns.includes('actions') && (
        <td className="px-2 py-1">
          <div className="flex items-center justify-center gap-2">
            <button onClick={(e) => { e.preventDefault(); onEdit(customer); }} className="text-primary" title="Sửa">
              <Edit2 size={14} />
            </button>
            <button onClick={(e) => { e.preventDefault(); onDelete(customer.id); }} className="text-destructive" title="Xóa">
              <Trash2 size={14} />
            </button>
          </div>
        </td>
      )}
    </tr>
  );
});

const SkeletonRow: React.FC<{ visibleColumns: string[] }> = ({ visibleColumns }) => (
  <tr className="animate-pulse border-b border-border/50">
    <td className="px-4 py-5 w-10 text-center"><div className="w-4 h-4 bg-muted rounded mx-auto" /></td>
    {visibleColumns.map(col => (
      <td key={col} className="px-4 py-5">
        <div className={clsx(
          "bg-muted rounded h-4",
          col === 'ho_va_ten' ? "w-32" : col === 'anh' ? "w-10 h-10 rounded-full" : "w-20"
        )} />
      </td>
    ))}
  </tr>
);

export default CustomerManagementPage;
