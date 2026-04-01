// Attendance Management Page
import { clsx } from 'clsx';
import {
  ArrowLeft,
  Calendar,
  Camera,
  Clock,
  Download,
  Edit2,
  List,
  Loader2,
  MapPin,
  Plus,
  Save,
  Search,
  Trash2,
  Upload,
  User,
  X
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import type { AttendanceRecord } from '../data/attendanceData';
import { bulkUpsertAttendanceRecords, deleteAttendanceRecord, upsertAttendanceRecord, getAttendancePaginated } from '../data/attendanceData';
import { getPersonnel, type NhanSu } from '../data/personnelData';
import { createPortal } from 'react-dom';
import Pagination from '../components/Pagination';

const AttendanceManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [personnel, setPersonnel] = useState<NhanSu[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  // Filter states
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [formData, setFormData] = useState<Partial<AttendanceRecord>>({});
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'anh', 'nhan_su', 'ngay', 'checkin', 'checkout', 'vi_tri', 'actions'
  ]);

  const allColumns = [
    { id: 'anh', label: 'Ảnh' },
    { id: 'nhan_su', label: 'Nhân sự' },
    { id: 'ngay', label: 'Ngày' },
    { id: 'checkin', label: 'Giờ vào' },
    { id: 'checkout', label: 'Giờ ra' },
    { id: 'vi_tri', label: 'Vị trí' },
    { id: 'actions', label: 'Thao tác' }
  ];

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadRecords = React.useCallback(async () => {
    try {
      setLoading(true);
      const [attendanceResult, personnelData] = await Promise.all([
        getAttendancePaginated(currentPage, pageSize, debouncedSearch, {
          nhan_su: selectedStaff,
          ngay: selectedDate
        }),
        getPersonnel()
      ]);
      setRecords(attendanceResult.data);
      setTotalCount(attendanceResult.totalCount);
      setPersonnel(personnelData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, selectedStaff, selectedDate]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

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

  const formatDateForDisplay = (dateStr: string | undefined) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('vi-VN');
    } catch {
      return dateStr;
    }
  };

  const handleOpenModal = (record?: AttendanceRecord) => {
    if (record) {
      setEditingRecord(record);
      setFormData({ ...record });
    } else {
      setEditingRecord(null);
      setFormData({
        nhan_su: '',
        ngay: new Date().toISOString().split('T')[0],
        checkin: '',
        checkout: '',
        vi_tri: '',
        anh: ''
      });
      // Tự động lấy tọa độ khi mở modal thêm mới
      setTimeout(() => getLocation(), 100);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getLocation = () => {
    if (!("geolocation" in navigator)) {
      setLocationError("Trình duyệt không hỗ trợ định vị.");
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          vi_tri: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        }));
        setLocationLoading(false);
      },
      (error) => {
        console.error("Lỗi lấy vị trí:", error);
        if (error.code === 1) {
          setLocationError("Bạn đã từ chối quyền truy cập vị trí.");
        } else {
          setLocationError("Không thể xác định vị trí.");
        }
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 1. Tự động lấy giờ hiện tại
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0].substring(0, 5); // HH:mm

      setFormData(prev => ({
        ...prev,
        checkin: prev.checkin || timeStr,
        ngay: now.toISOString().split('T')[0]
      }));

      // 2. Chuyển ảnh sang dạng base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, anh: reader.result as string }));
      };
      reader.readAsDataURL(file);

      // 3. Tự động lấy tọa độ vị trí
      getLocation();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await upsertAttendanceRecord(formData);
      await loadRecords();
      handleCloseModal();
    } catch (error) {
      alert('Lỗi: Không thể lưu thông tin chấm công.');
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        "id": "",
        "Ngày": "2024-03-24",
        "Checkin": "08:00",
        "Checkout": "17:30",
        "Ảnh": "",
        "vị trí": "21.273, 106.194",
        "Nhân sự": "Nguyễn Văn A"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "MauChamCong");
    XLSX.writeFile(workbook, "Mau_nhap_cham_cong.xlsx");
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        console.log('Attendance Sheet Names:', wb.SheetNames);
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        if (data.length > 0) {
          console.log('First Row Keys:', Object.keys(data[0]));
          console.log('First Row Data:', data[0]);
        }

        // Helper to convert Excel date/time serial numbers
        const formatExcelTime = (val: any) => {
          if (val === undefined || val === null || val === '') return null;
          if (typeof val === 'number') {
            const totalSeconds = Math.round(val * 24 * 3600);
            const h = Math.floor(totalSeconds / 3600);
            const m = Math.floor((totalSeconds % 3600) / 60);
            const s = totalSeconds % 60;
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
          }
          const str = String(val).trim();
          if (!str) return null;

          // Case: 9:53:13 PM or 8:56:34 AM
          const ampmMatch = str.match(/^(\d{1,2}):(\d{2})(:(\d{2}))?\s*(AM|PM)$/i);
          if (ampmMatch) {
            let h = parseInt(ampmMatch[1]);
            const m = ampmMatch[2];
            const s = ampmMatch[4] || '00';
            const p = ampmMatch[5].toUpperCase();
            if (p === 'PM' && h < 12) h += 12;
            if (p === 'AM' && h === 12) h = 0;
            return `${String(h).padStart(2, '0')}:${m}:${s}`;
          }

          // Case: HH:mm:ss
          if (str.match(/^\d{1,2}:\d{2}:\d{2}$/)) {
            return str.split(':').map(v => v.padStart(2, '0')).join(':');
          }

          // Case: HH:mm
          if (str.match(/^\d{1,2}:\d{2}$/)) {
            return str.split(':').map(v => v.padStart(2, '0')).join(':') + ':00';
          }

          return str;
        };

        const formatExcelDate = (val: any) => {
          if (val === undefined || val === null || val === '') return null;
          if (typeof val === 'number' && val > 40000) {
            const d = new Date(Math.round((val - 25569) * 86400 * 1000));
            return d.toISOString().split('T')[0];
          }
          const s = String(val).trim();
          return s || null;
        };

        const formattedData: Partial<AttendanceRecord>[] = data.map(item => {
          // Normalize keys (trim whitespace)
          const norm: any = {};
          Object.keys(item).forEach(k => {
            norm[String(k).trim()] = item[k];
          });

          // Fuzzy Mapping
          const nhan_su = String(norm["Nhân sự"] || norm["Họ tên Nhân viên"] || norm["Họ tên"] || '').trim();
          const ngay = formatExcelDate(norm["Ngày"]) || new Date().toISOString().split('T')[0];

          // Skip if no personnel name
          if (!nhan_su || nhan_su === 'undefined' || nhan_su === '') {
            return null;
          }

          const record: Partial<AttendanceRecord> = {
            nhan_su,
            ngay,
            checkin: formatExcelTime(norm["Checkin"] || norm["Giờ vào"] || norm["Check-in"]),
            checkout: formatExcelTime(norm["Checkout"] || norm["Giờ ra"] || norm["Check-out"]),
            vi_tri: (norm["vị trí"] || norm["Vị trí"] || norm["Tọa độ"]) ? String(norm["vị trí"] || norm["Vị trí"] || norm["Tọa độ"]).trim() : null,
            anh: (norm["Ảnh"] || norm["Hình ảnh"]) ? String(norm["Ảnh"] || norm["Hình ảnh"]).trim() : null
          };

          const rawId = norm["id"] ? String(norm["id"]).trim() : '';
          // Strict UUID validation
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (rawId && uuidRegex.test(rawId)) {
            record.id = rawId;
          }

          return record;
        }).filter(Boolean) as Partial<AttendanceRecord>[];

        console.log('Formatted Attendance Data for Import:', formattedData);

        if (formattedData.length > 0) {
          setLoading(true);
          try {
            await bulkUpsertAttendanceRecords(formattedData);
            await loadRecords();
            alert(`Đã nhập thành công ${formattedData.length} bản ghi chấm công!`);
          } catch (err: any) {
            console.error('Database Error details:', err);
            alert(`Lỗi khi lưu dữ liệu chấm công: ${err.message || 'Lỗi DB'}`);
          }
        } else {
          alert("Không tìm thấy dữ liệu chấm công hợp lệ.");
        }
      } catch (error) {
        console.error('Import Pipeline Error:', error);
        alert("Lỗi khi đọc file Excel.");
      } finally {
        setLoading(false);
        if (e.target) e.target.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bản ghi chấm công này?')) {
      try {
        await deleteAttendanceRecord(id);
        await loadRecords();
      } catch (error) {
        alert('Lỗi: Không thể xóa bản ghi.');
      }
    }
  };

  return (
    <div className="w-full flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500 text-muted-foreground font-sans">
      <div className="space-y-4">
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
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-1.5 border border-border rounded text-[13px] focus:ring-1 focus:ring-primary focus:border-primary placeholder-slate-400 outline-none"
                placeholder="Tìm nhân viên, vị trí..."
                type="text"
              />
            </div>

            <select 
              value={selectedStaff} 
              onChange={(e) => {
                setSelectedStaff(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 border border-border rounded text-[13px] bg-card outline-none focus:ring-1 focus:ring-primary min-w-[150px]"
            >
              <option value="">Tất cả nhân sự</option>
              {personnel.map(p => (
                <option key={p.id} value={p.ho_ten}>{p.ho_ten}</option>
              ))}
            </select>

            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 border border-border rounded text-[13px] bg-card outline-none focus:ring-1 focus:ring-primary"
            />
            
            {(searchQuery !== '' || selectedStaff !== '' || selectedDate !== '') && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStaff('');
                  setSelectedDate('');
                  setCurrentPage(1);
                }}
                className="text-[12px] text-destructive hover:underline font-medium ml-2"
              >
                Xoá lọc
              </button>
            )}
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
                  title="Nhập chấm công từ Excel"
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

            <div className="relative">
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
                        onClick={() => {
                          setVisibleColumns(prev => prev.includes(col.id) ? prev.filter(c => c !== col.id) : [...prev, col.id]);
                        }}
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
              onClick={() => handleOpenModal()}
              className="bg-primary hover:bg-primary/90 text-white px-5 py-1.5 rounded flex items-center gap-2 text-[14px] font-semibold transition-colors"
            >
              <Plus size={20} /> Chấm công hộ
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted border-b border-border text-muted-foreground text-[12px] font-bold uppercase tracking-wider">
                  <th className="px-4 py-3 w-10 text-center"><input className="rounded border-border text-primary size-4" type="checkbox" /></th>
                  {visibleColumns.includes('anh') && <th className="px-4 py-3 font-semibold">Ảnh</th>}
                  {visibleColumns.includes('nhan_su') && <th className="px-4 py-3 font-semibold">Nhân sự</th>}
                  {visibleColumns.includes('ngay') && <th className="px-4 py-3 font-semibold">Ngày</th>}
                  {visibleColumns.includes('checkin') && <th className="px-4 py-3 font-semibold">Giờ vào</th>}
                  {visibleColumns.includes('checkout') && <th className="px-4 py-3 font-semibold">Giờ ra</th>}
                  {visibleColumns.includes('vi_tri') && <th className="px-4 py-3 font-semibold">Vị trí</th>}
                  {visibleColumns.includes('actions') && <th className="px-4 py-3 text-center font-semibold">Thao tác</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px]">
                {loading ? (
                  <tr>
                    <td colSpan={12} className="px-4 py-12 text-center text-muted-foreground">
                      <Loader2 className="animate-spin inline-block mr-2" size={20} />
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : records.map(record => (
                  <tr key={record.id} className="hover:bg-muted/80 transition-colors">
                    <td className="px-4 py-4 text-center"><input className="rounded border-border text-primary size-4" type="checkbox" /></td>
                    {visibleColumns.includes('anh') && (
                      <td className="px-4 py-4">
                        <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary overflow-hidden border border-border shadow-sm">
                          {record.anh ? (
                            <img src={record.anh} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User size={20} />
                          )}
                        </div>
                      </td>
                    )}
                    {visibleColumns.includes('nhan_su') && <td className="px-4 py-4 font-semibold text-foreground whitespace-nowrap">{record.nhan_su}</td>}
                    {visibleColumns.includes('ngay') && <td className="px-4 py-4 text-muted-foreground whitespace-nowrap">{formatDateForDisplay(record.ngay)}</td>}
                    {visibleColumns.includes('checkin') && <td className="px-4 py-4 text-emerald-600 font-bold">{record.checkin || '—'}</td>}
                    {visibleColumns.includes('checkout') && <td className="px-4 py-4 text-orange-600 font-bold">{record.checkout || '—'}</td>}
                    {visibleColumns.includes('vi_tri') && (
                      <td className="px-4 py-4 text-muted-foreground text-[12px] truncate max-w-[200px]" title={record.vi_tri || ''}>
                        {record.vi_tri || '—'}
                      </td>
                    )}
                    {visibleColumns.includes('actions') && (
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-4">
                          <button onClick={() => handleOpenModal(record)} className="text-primary hover:text-blue-700">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDelete(record.id)} className="text-destructive hover:text-destructive/80">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {!loading && records.length === 0 && (
                  <tr>
                    <td colSpan={12} className="px-4 py-8 text-center text-muted-foreground">
                      Không tìm thấy bản ghi chấm công nào.
                    </td>
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

      {/* Modal - Add/Edit Attendance */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" style={{ zIndex: 9999999 }}>
          <div className="bg-card w-full max-w-lg rounded-3xl border border-border shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in duration-300" style={{ zIndex: 10000000 }}>
            <div className="px-8 py-5 border-b border-border flex items-center justify-between bg-muted/30 shrink-0">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                {editingRecord ? <Edit2 size={20} className="text-primary" /> : <Plus size={20} className="text-primary" />}
                {editingRecord ? 'Chỉnh sửa bản ghi' : 'Thêm bản ghi chấm công'}
              </h3>
              <button onClick={handleCloseModal} className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto p-8 flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 gap-6">
                <div className="flex flex-col items-center mb-4">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl border-4 border-card bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary overflow-hidden shadow-inner">
                      {formData.anh ? <img src={formData.anh} alt="Preview" className="w-full h-full object-cover" /> : <Camera size={40} />}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all"
                    >
                      <Camera size={16} />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <User size={14} className="text-primary/70" />
                    Nhân sự <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="nhan_su"
                    value={formData.nhan_su || ''}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-[14px]"
                  >
                    <option value="">-- Chọn nhân viên --</option>
                    {personnel.map(p => (
                      <option key={p.id} value={p.ho_ten}>{p.ho_ten} ({p.vi_tri})</option>
                    ))}
                  </select>
                </div>

                <InputField label="Ngày" name="ngay" type="date" value={formData.ngay} onChange={handleInputChange} icon={Calendar} required />

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <InputField label="Giờ vào" name="checkin" type="time" value={formData.checkin || ''} onChange={handleInputChange} icon={Clock} />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, checkin: new Date().toTimeString().split(' ')[0].substring(0, 5) }))}
                      className="absolute right-2 top-8 text-[10px] font-bold text-primary hover:underline bg-primary/5 px-2 py-1 rounded"
                    >
                      Hiện tại
                    </button>
                  </div>
                  <div className="relative">
                    <InputField label="Giờ ra" name="checkout" type="time" value={formData.checkout || ''} onChange={handleInputChange} icon={Clock} />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, checkout: new Date().toTimeString().split(' ')[0].substring(0, 5) }))}
                      className="absolute right-2 top-8 text-[10px] font-bold text-primary hover:underline bg-primary/5 px-2 py-1 rounded"
                    >
                      Hiện tại
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <InputField
                    label="Vị trí (Tọa độ)"
                    name="vi_tri"
                    value={formData.vi_tri || ''}
                    onChange={handleInputChange}
                    icon={MapPin}
                    placeholder={locationLoading ? "Đang xác định tọa độ..." : (locationError || "Vị trí chấm công...")}
                    className={clsx(
                      locationLoading && "animate-pulse",
                      locationError && "border-red-300 text-red-500"
                    )}
                  />
                  <div className="absolute right-3 top-9 flex items-center gap-2">
                    {locationLoading && <Loader2 size={16} className="animate-spin text-primary" />}
                    {!locationLoading && (
                      <button
                        type="button"
                        onClick={getLocation}
                        className="text-primary hover:bg-primary/10 p-1 rounded transition-colors"
                        title="Lấy lại tọa độ"
                      >
                        <MapPin size={16} />
                      </button>
                    )}
                  </div>
                  {locationError && (
                    <p className="text-[10px] text-red-500 mt-1 font-medium ml-2">
                      {locationError}. Hãy bật GPS và cho phép truy cập.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-10 flex items-center justify-end gap-3 pt-6 border-t border-border">
                <button type="button" onClick={handleCloseModal} className="px-6 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:bg-muted border border-border">Hủy bỏ</button>
                <button type="submit" className="px-8 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all flex items-center gap-2 active:scale-95">
                  <Save size={18} /> <span>{editingRecord ? 'Lưu thay đổi' : 'Lưu bản ghi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

const InputField: React.FC<{
  label: string,
  name: string,
  value?: string | number,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  icon: React.ElementType,
  type?: string,
  placeholder?: string,
  disabled?: boolean,
  required?: boolean,
  className?: string
}> = ({ label, name, value, onChange, icon: Icon, type = 'text', placeholder, disabled, required, className }) => (
  <div className={clsx("space-y-1.5", className)}>
    <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
      <Icon size={14} className="text-primary/70" />
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type} name={name} value={value} onChange={onChange}
      onFocus={(e) => e.target.select()}
      placeholder={placeholder} disabled={disabled} required={required}
      className={clsx("w-full px-4 py-2.5 bg-background border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[14px]", disabled && "opacity-60 cursor-not-allowed bg-muted/20")}
    />
  </div>
);

export default AttendanceManagementPage;
