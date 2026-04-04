import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, Clock, History, Loader2, Plus, Save, ShoppingCart, User, Wrench, X } from 'lucide-react';
import type { SalesCard } from '../data/salesCardData';
import type { KhachHang } from '../data/customerData';
import type { NhanSu } from '../data/personnelData';
import type { DichVu } from '../data/serviceData';
import { SearchableSelect } from './ui/SearchableSelect';
import { MultiSearchableSelect } from './ui/MultiSearchableSelect';
import CustomerFormModal from './CustomerFormModal';

// Helper for dynamic classes
const clsx = (...classes: any[]) => classes.filter(Boolean).join(' ');

const InputField: React.FC<{
  label: string,
  name: string,
  value?: string | number,
  onChange: (e: any) => void,
  icon: React.ElementType,
  type?: 'text' | 'date' | 'time' | 'select',
  options?: string[],
  required?: boolean,
  placeholder?: string,
  disabled?: boolean
}> = ({ label, name, value, onChange, icon: Icon, type = 'text', options, required, placeholder, disabled }) => (
  <div className="space-y-1.5">
    <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
      <Icon size={14} className="text-primary/70" />
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {type === 'select' ? (
      <select name={name} value={value ?? ''} onChange={onChange} required={required} disabled={disabled} className={clsx("w-full px-4 py-2.5 bg-background border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-[14px]", disabled && "bg-muted/30 cursor-not-allowed opacity-80")}>
        {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    ) : (
      <input
        type={type} name={name} value={value ?? ''} onChange={onChange}
        onFocus={(e) => e.target.select()}
        required={required} placeholder={placeholder} disabled={disabled}
        className={clsx("w-full px-4 py-2.5 bg-background border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-[14px]", disabled && "bg-muted/30 cursor-not-allowed opacity-80")}
      />
    )}
  </div>
);

const SalesCardFormModal: React.FC<{
  isOpen: boolean;
  editingCard: SalesCard | null;
  initialData: Partial<SalesCard>;
  customers: KhachHang[];
  personnel: NhanSu[];
  services: DichVu[];
  onClose: () => void;
  onSubmit: (data: Partial<SalesCard>) => Promise<void>;
  onCustomerAdded: () => Promise<void>;
  onCollectPayment?: (data: any) => Promise<void>;
  isReadOnly?: boolean;
}> = React.memo(({ isOpen, editingCard, initialData, customers, personnel, services, onClose, onSubmit, onCustomerAdded, isReadOnly, onCollectPayment }) => {
  const [formData, setFormData] = useState<Partial<SalesCard & { service_items?: { id: string, ten_dich_vu: string, gia_ban: number }[] }>>(initialData);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isCollecting, setIsCollecting] = useState(false);

  // Memoize heavy options so dropdowns don't re-render on every keystroke
  const customerOptions = React.useMemo(() => customers.map(c => ({
    value: c.id,
    label: `${c.ho_va_ten}${c.so_dien_thoai ? ' - ' + c.so_dien_thoai : ''}`
  })), [customers]);

  // Sync service information based on dich_vu_id (which is now TEXT/Name)
  React.useEffect(() => {
    if (formData.dich_vu_id) {
      const service = services.find(s => s.ten_dich_vu === formData.dich_vu_id || s.id_dich_vu === formData.dich_vu_id);
      if (service) {
          // Update the localized service data if not already set correctly
          if (!formData.dich_vu || formData.dich_vu.ten_dich_vu !== service.ten_dich_vu) {
              setFormData(prev => ({
                  ...prev,
                  dich_vu: {
                      ten_dich_vu: service.ten_dich_vu,
                      gia_ban: service.gia_ban,
                      gia_nhap: service.gia_nhap,
                      co_so: service.co_so
                  }
              }));
          }
      }
    }
  }, [formData.dich_vu_id, services]);

  // Auto-generate id_bh for new cards
  React.useEffect(() => {
    if (!editingCard && !formData.id_bh && isOpen) {
      const randomId = 'BH-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      setFormData(prev => ({ ...prev, id_bh: randomId }));
    }
  }, [editingCard, isOpen, formData.id_bh]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'so_km') {
      const numericValue = value.replace(/\D/g, '').replace(/^0+(?!$)/, '');
      const num = parseInt(numericValue, 10);
      setFormData(prev => ({ ...prev, [name]: isNaN(num) ? undefined : num }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleServiceChange = (val: string) => {
    setFormData(prev => ({ ...prev, dich_vu_id: val }));
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null || isNaN(num)) return '';
    return num.toLocaleString('vi-VN');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/60" style={{ zIndex: 1000 }}>
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl border border-border shadow-2xl flex flex-col max-h-[90vh] relative overflow-hidden" style={{ zIndex: 1001 }}>
        <div className="px-8 py-5 border-b border-border flex items-center justify-between bg-muted/40 shrink-0">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <ShoppingCart className="text-primary" size={20} />
            {isReadOnly ? 'Chi tiết Phiếu Bán hàng' : editingCard ? 'Cập nhật Phiếu Bán hàng' : 'Lập Phiếu Bán hàng Mới'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleFormSubmit} className="overflow-y-auto p-8 flex-1 custom-scrollbar">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Ngày lập" name="ngay" type="date" value={formData.ngay || ''} onChange={handleInputChange} icon={Calendar} required disabled={isReadOnly} />
              <InputField label="Giờ lập" name="gio" type="time" value={formData.gio || ''} onChange={handleInputChange} icon={Clock} required disabled={isReadOnly} />
              <InputField label="Mã phiếu" name="id_bh" value={formData.id_bh || ''} onChange={handleInputChange} icon={ShoppingCart} required placeholder="BH-XXXXXX" disabled={isReadOnly} />
              <div className="hidden md:block"></div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-primary/70" />
                    Khách hàng <span className="text-red-500">*</span>
                  </div>
                  {!isReadOnly && (
                    <button 
                      type="button"
                      onClick={() => setIsCustomerModalOpen(true)}
                      className="text-primary hover:text-primary/80 flex items-center gap-1 normal-case font-bold transition-all px-2 py-0.5 rounded-lg hover:bg-primary/5"
                    >
                      <Plus size={14} /> Thêm mới
                    </button>
                  )}
                </label>
                <SearchableSelect
                  options={customerOptions}
                  value={formData.khach_hang_id || undefined}
                  onValueChange={(val: string) => !isReadOnly && setFormData(prev => ({ ...prev, khach_hang_id: val }))}
                  placeholder="-- Chọn hoặc tìm khách hàng --"
                  searchPlaceholder="Tìm tên, SĐT, biển số..."
                  className={clsx("font-bold overflow-hidden", isReadOnly && "pointer-events-none opacity-80")}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <User size={14} className="text-primary/70" />
                  Người phụ trách (Nhân viên) <span className="text-red-500">*</span>
                </label>
                <MultiSearchableSelect
                  options={personnel.map(p => ({ value: p.ho_ten, label: `${p.ho_ten} (${p.vi_tri})` }))}
                  value={formData.nhan_vien_id ? formData.nhan_vien_id.split(',').map(s => s.trim()) : []}
                  onValueChange={(vals: string[]) => !isReadOnly && setFormData(prev => ({ ...prev, nhan_vien_id: vals.join(', ') }))}
                  placeholder="-- Chọn nhân viên --"
                  searchPlaceholder="Tìm tên, vị trí..."
                  className={clsx("font-bold overflow-hidden", isReadOnly && "pointer-events-none opacity-80")}
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Wrench size={14} className="text-primary/70" />
                  Dịch vụ sử dụng <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  options={services.map(s => ({ value: s.ten_dich_vu, label: `${s.ten_dich_vu} (${s.gia_ban.toLocaleString()}đ)` }))}
                  value={formData.dich_vu_id || undefined}
                  onValueChange={(val: string) => !isReadOnly && handleServiceChange(val)}
                  placeholder="-- Chọn hoặc tìm dịch vụ --"
                  searchPlaceholder="Tìm tên dịch vụ..."
                  className={clsx("font-bold", isReadOnly && "pointer-events-none opacity-80")}
                />
              </div>

              <InputField label="Số Km" name="so_km" value={formatNumber(formData.so_km)} onChange={handleInputChange} icon={History} placeholder="12.000" disabled={isReadOnly} />

              <InputField label="Ngày nhắc thay dầu" name="ngay_nhac_thay_dau" type="date" value={formData.ngay_nhac_thay_dau || ''} onChange={handleInputChange} icon={Calendar} disabled={isReadOnly} />
            </div>

            {formData.dich_vu && (
              <div className="mt-8 bg-primary/5 p-5 rounded-2xl border border-primary/20 border-dashed flex justify-between items-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-0.5">
                  <div className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">Tổng chi phí dịch vụ</div>
                  <div className="text-[11px] text-muted-foreground">({formData.dich_vu.ten_dich_vu})</div>
                </div>
                <div className="text-2xl font-black text-primary tracking-tight">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(formData.dich_vu.gia_ban || 0)}
                </div>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between gap-3 pt-6 border-t border-border">
              <div className="flex items-center gap-3">
                {editingCard && onCollectPayment && (
                  <button 
                    type="button" 
                    onClick={async () => {
                      setIsCollecting(true);
                      try { await onCollectPayment(formData); } finally { setIsCollecting(false); }
                    }}
                    disabled={isCollecting}
                    className="px-6 py-2 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isCollecting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    <span>THU TIỀN</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button type="button" onClick={onClose} className="px-6 py-2 rounded-xl text-sm font-bold border border-border hover:bg-muted transition-all">
                  {isReadOnly ? 'Đóng' : 'Hủy'}
                </button>
                {!isReadOnly && (
                  <button type="submit" className="px-8 py-2 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all flex items-center gap-2">
                    <Save size={18} /> <span>{editingCard ? 'Lưu thay đổi' : 'Lập phiếu'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>

      <CustomerFormModal 
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customer={null}
        onSuccess={async (newCust: KhachHang) => {
          await onCustomerAdded();
          setFormData(prev => ({ ...prev, khach_hang_id: newCust.ma_khach_hang || newCust.id }));
          setIsCustomerModalOpen(false);
        }}
      />
    </div>,
    document.body
  );
});

export default SalesCardFormModal;
