import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Plus, 
  Edit2, Trash2, Camera,
  Loader2, ArrowLeft, ChevronDown, 
  Building2, Wrench,
  Download, Upload
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useNavigate, useLocation } from 'react-router-dom';
import { getServicesPaginated, upsertService, deleteService, bulkUpsertServices, deleteAllServices } from '../data/serviceData';
import type { DichVu } from '../data/serviceData';
import Pagination from '../components/Pagination';
import ServiceFormModal from '../components/ServiceFormModal';

const ServiceManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [services, setServices] = useState<DichVu[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  // Filter states
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<DichVu | null>(null);
  const [formData, setFormData] = useState<Partial<DichVu>>({});

  const branchOptions = ["Cơ sở Bắc Giang", "Cơ sở Bắc Ninh"];

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load data from Supabase
  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await getServicesPaginated(currentPage, pageSize, debouncedSearch, {
        branches: selectedBranches
      });
      setServices(data.data);
      setTotalCount(data.totalCount);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, selectedBranches, location.pathname]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string[]>>, val: string) => {
    setter(prev => {
      const isSelected = prev.includes(val);
      const newFilters = isSelected ? prev.filter(v => v !== val) : [...prev, val];
      setCurrentPage(1); 
      return newFilters;
    });
  };

  const handleOpenModal = (service?: DichVu) => {
    if (service) {
      setEditingService(service);
      setFormData({ ...service });
    } else {
      setEditingService(null);
      setFormData({
        co_so: 'Cơ sở Bắc Giang',
        ten_dich_vu: '',
        gia_nhap: 0,
        gia_ban: 0,
        hoa_hong: 0,
        tu_ngay: '',
        toi_ngay: '',
        anh: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setFormData({});
  };

  const handleSubmit = async (formDataToSave: Partial<DichVu>) => {
    try {
      await upsertService(formDataToSave);
      await loadData();
      handleCloseModal();
    } catch (error) {
      alert('Lỗi: Không thể lưu thông tin dịch vụ.');
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        "Tên dịch vụ": "Bảo dưỡng toàn bộ",
        "ID": "Optional: UUID format",
        "Cơ sở": "Cơ sở Bắc Giang",
        "Giá nhập": 200000,
        "Giá bán": 350000,
        "Hoa hồng": 50000,
        "Từ ngày": "2024-01-01",
        "Tới ngày": "2024-12-31"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "MauDichVu");
    XLSX.writeFile(workbook, "Mau_nhap_dich_vu.xlsx");
  };

  const handleDeleteAll = async () => {
    if (window.confirm('CẢNH BÁO: Hành động này sẽ xóa TOÀN BỘ danh sách dịch vụ. Bạn có chắc chắn muốn tiếp tục?')) {
      try {
        setLoading(true);
        await deleteAllServices();
        await loadData();
        alert('Đã xóa toàn bộ dịch vụ.');
      } catch (error) {
        alert('Lỗi: Không thể xóa toàn bộ dịch vụ.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        const formattedData: Partial<DichVu>[] = data.map(item => {
          const norm: any = {};
          Object.keys(item).forEach(k => {
            norm[String(k).trim().toLowerCase().replace(/\s+/g, ' ')] = item[k];
          });

          const getValue = (keys: string[]) => {
            const k = keys.find(key => norm[key.toLowerCase().replace(/\s+/g, ' ')] !== undefined);
            return k ? norm[k.toLowerCase().replace(/\s+/g, ' ')] : undefined;
          };

          const formatExcelDate = (val: any) => {
            if (!val) return null;
            if (typeof val === 'number') {
              const date = new Date((val - 25569) * 86400 * 1000);
              return date.toISOString().split('T')[0];
            }
            if (typeof val === 'string' && val.includes('/')) {
              const [d, m, y] = val.split('/');
              return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            }
            return String(val).split('T')[0];
          };

          const record: Partial<DichVu> = {
            co_so: getValue(['Cơ sở', 'cơ sở', 'chi nhánh', 'branch']) || 'Cơ sở Bắc Giang',
            ten_dich_vu: String(getValue(['Tên dịch vụ', 'tên', 'dịch vụ', 'service_name']) || 'Dịch vụ mới').trim(),
            gia_nhap: Math.round(Number(getValue(['Giá nhập', 'giá nhập', 'vốn', 'cost'])) || 0),
            gia_ban: Math.round(Number(getValue(['Giá', 'giá', 'giá lẻ', 'giá bán', 'price'])) || 0),
            anh: getValue(['Ảnh', 'ảnh', 'image', 'hình ảnh']) || null,
            hoa_hong: Math.round(Number(getValue(['Hoa hồng', 'hoa hồng', 'chiết khấu', 'commission'])) || 0),
            tu_ngay: formatExcelDate(getValue(['Từ ngày', 'từ ngày', 'start_date'])),
            toi_ngay: formatExcelDate(getValue(['Tới ngày', 'tới ngày', 'end_date']))
          };

          const rawId = String(getValue(['id', 'ID', 'uuid', 'mã']) || '').trim();
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (rawId && uuidRegex.test(rawId)) {
            record.id = rawId;
          }

          return record;
        });

        if (formattedData.length > 0) {
          setLoading(true);
          await bulkUpsertServices(formattedData);
          await loadData();
          alert(`Đã nhập thành công ${formattedData.length} dịch vụ!`);
        }
      } catch (error) {
        console.error(error);
        alert("Lỗi khi đọc file Excel.");
      } finally {
        setLoading(false);
        if (e.target) e.target.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) {
      try {
        await deleteService(id);
        await loadData();
      } catch (error) {
        alert('Lỗi: Không thể xóa dịch vụ.');
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="w-full h-full flex flex-col p-4 lg:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto pt-8">
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
              <Wrench size={24} />
            </div>
            Quản lý Dịch vụ
          </h1>
        </div>

        {/* Toolbar */}
        <div className="bg-card p-3 rounded-lg border border-border shadow-sm flex flex-wrap items-center justify-between gap-4" ref={dropdownRef}>
          <div className="flex items-center gap-3 flex-1 flex-wrap">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded text-[13px] text-muted-foreground hover:bg-accent transition-colors">
              <ArrowLeft size={18} /> Quay lại
            </button>
            <div className="relative w-full sm:w-[250px]">
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                <Search size={18} />
              </div>
              <input 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset page on search
                }}
                className="w-full pl-9 pr-4 py-1.5 border border-border rounded text-[13px] focus:ring-1 focus:ring-primary focus:border-primary placeholder-slate-400 outline-none" 
                placeholder="Tìm tên dịch vụ..." 
                type="text"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <button onClick={() => toggleDropdown('branch')} className="flex items-center gap-2 px-3 py-1.5 border border-border rounded text-[13px] text-muted-foreground min-w-[140px] justify-between bg-card hover:bg-accent">
                  <div className="flex items-center gap-2"><Building2 size={18} />Cơ sở</div>
                  <ChevronDown size={18} />
                </button>
                {openDropdown === 'branch' && (
                  <div className="absolute top-10 left-0 z-50 min-w-[200px] bg-card border border-border rounded shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <ul className="py-1 text-[13px] text-muted-foreground">
                      {branchOptions.map(branch => (
                        <li key={branch} className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center gap-2" onClick={() => handleFilterChange(setSelectedBranches, branch)}>
                          <input 
                            type="checkbox" 
                            checked={selectedBranches.includes(branch)}
                            readOnly
                            className="rounded border-border text-primary size-4"
                          /> {branch}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button 
                onClick={handleDownloadTemplate}
                className="flex items-center gap-2 px-3 py-1.5 border border-border rounded text-[13px] text-muted-foreground hover:bg-accent transition-colors font-medium bg-card"
                title="Tải mẫu Excel"
              >
                <Download size={18} />
                <span>Tải mẫu</span>
              </button>
              <div className="relative">
                <button 
                  onClick={() => document.getElementById('excel-import')?.click()}
                  className="flex items-center gap-2 px-3 py-1.5 border border-border rounded text-[13px] text-muted-foreground hover:bg-accent transition-colors font-medium bg-card"
                  title="Nhập dịch vụ từ Excel"
                >
                  <Upload size={18} />
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

            <button
              onClick={handleDeleteAll}
              className="px-3 py-1.5 border border-red-200 rounded text-[13px] text-red-600 hover:bg-red-50 transition-colors font-medium bg-white flex items-center gap-2"
              title="Xóa toàn bộ dữ liệu"
            >
              <Trash2 size={18} />
              <span>Xóa tất cả</span>
            </button>

            <button 
              onClick={() => handleOpenModal()}
              className="bg-primary hover:bg-primary/90 text-white px-5 py-1.5 rounded flex items-center gap-2 text-[14px] font-semibold transition-colors"
            >
              <Plus size={20} /> Thêm dịch vụ mới
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted border-b border-border text-muted-foreground text-[12px] font-bold uppercase tracking-wider">
                  <th className="px-4 py-3 font-semibold">Ảnh</th>
                  <th className="px-4 py-3 font-semibold">Cơ sở</th>
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Tên dịch vụ</th>
                  <th className="px-4 py-3 font-semibold text-right">Giá nhập</th>
                  <th className="px-4 py-3 font-semibold text-right">Giá bán</th>
                  <th className="px-4 py-3 font-semibold text-right">Hoa hồng</th>
                  <th className="px-4 py-3 font-semibold text-center">Hiệu lực</th>
                  <th className="px-4 py-3 text-center font-semibold">Tác vụ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px]">
                {loading ? (
                   <tr>
                     <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                       <Loader2 className="animate-spin inline-block mr-2" size={20} />
                       Đang tải dữ liệu...
                     </td>
                   </tr>
                ) : services.map(service => (
                  <tr key={service.id} className="hover:bg-muted/80 transition-colors">
                    <td className="px-4 py-4">
                      {service.anh ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-border">
                          <img src={service.anh || undefined} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground/30"><Camera size={18} /></div>
                      )}
                    </td>
                    <td className="px-4 py-4">{service.co_so}</td>
                    <td className="px-4 py-4 font-mono text-[10px] text-muted-foreground max-w-[80px] truncate" title={service.id}>
                      {service.id}
                    </td>
                    <td className="px-4 py-4 font-bold text-foreground">{service.ten_dich_vu}</td>
                    <td className="px-4 py-4 text-right text-muted-foreground">{formatCurrency(service.gia_nhap)}</td>
                    <td className="px-4 py-4 text-right font-black text-primary">{formatCurrency(service.gia_ban)}</td>
                    <td className="px-4 py-4 text-right text-orange-600 font-bold">{formatCurrency(service.hoa_hong)}</td>
                    <td className="px-4 py-4 text-center">
                      <div className="text-[11px] text-muted-foreground">
                        {service.tu_ngay ? <span>{new Date(service.tu_ngay).toLocaleDateString('vi-VN')}</span> : '—'}
                        <br />
                        {service.toi_ngay ? <span>{new Date(service.toi_ngay).toLocaleDateString('vi-VN')}</span> : '—'}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleOpenModal(service)} className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"><Edit2 size={15} /></button>
                        <button onClick={() => handleDelete(service.id)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && services.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">Không có dữ liệu dịch vụ.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination 
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
            loading={loading}
          />
        </div>
      </div>

      <ServiceFormModal
        isOpen={isModalOpen}
        editingService={editingService}
        initialData={formData}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        branchOptions={branchOptions}
      />
    </div>
  );
};



export default ServiceManagementPage;
