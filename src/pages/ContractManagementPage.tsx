import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ArrowLeft, Search, Download, Plus,
  ChevronDown, FileText, X, Upload, Link2,
  Edit2, Trash2, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon,
  Building2, User, Hash, CreditCard, Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ─────────────────────────────────────────────
//  Data Types
// ─────────────────────────────────────────────
type KindOfContract = 'Logistic' | 'Trading' | 'Logistic, Trading';

interface BusinessContract {
  id: string;
  name: string;          // Tên hợp đồng / khách hàng
  pic: string;           // Người phụ trách (tên nhân viên)
  noContract: string;    // Số hợp đồng
  paymentTerm: string;   // Điều khoản thanh toán
  kindOfContract: KindOfContract;
  // ADD-only fields
  supplierId: string;       // Bộ NCC (ID KH + tên NCC)
  supplierName: string;
  contractValue: string;    // Bộ Giá trị HĐ
  fileName?: string;        // File đã upload
}

// ─────────────────────────────────────────────
//  Mock data
// ─────────────────────────────────────────────
const INITIAL_DATA: BusinessContract[] = [
  {
    id: '1',
    name: 'ACME Corporation',
    pic: 'Nguyễn Văn An',
    noContract: 'HD-LOG-2025-001',
    paymentTerm: 'Net 30',
    kindOfContract: 'Logistic',
    supplierId: 'KH001 / NCC-ACME',
    supplierName: 'ACME Logistics Ltd',
    contractValue: '1,200,000,000 ₫',
    fileName: 'HopDong_ACME_2025.pdf',
  },
  {
    id: '2',
    name: 'TradePlus Vietnam',
    pic: 'Trần Thị Bình',
    noContract: 'HD-TRD-2025-042',
    paymentTerm: 'Net 45',
    kindOfContract: 'Trading',
    supplierId: 'KH002 / NCC-TPV',
    supplierName: 'TradePlus Vietnam Co.',
    contractValue: '850,000,000 ₫',
    fileName: 'HopDong_TradePlus.docx',
  },
  {
    id: '3',
    name: 'Global Freight Partners',
    pic: 'Lê Minh Châu',
    noContract: 'HD-MIX-2024-015',
    paymentTerm: 'Net 60',
    kindOfContract: 'Logistic, Trading',
    supplierId: 'KH003 / NCC-GFP',
    supplierName: 'Global Freight Partners',
    contractValue: '3,500,000,000 ₫',
  },
];

const PIC_OPTIONS = [
  { label: 'Nguyễn Văn An', count: 3 },
  { label: 'Trần Thị Bình', count: 2 },
  { label: 'Lê Minh Châu', count: 4 },
  { label: 'Phạm Hồng Đức', count: 1 },
];

const KIND_OPTIONS = [
  { label: 'Logistic', count: 18 },
  { label: 'Trading', count: 24 },
  { label: 'Logistic, Trading', count: 6 },
];

// ─────────────────────────────────────────────
//  Kind badge colours
// ─────────────────────────────────────────────
const kindColor: Record<KindOfContract, string> = {
  Logistic: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  Trading: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  'Logistic, Trading': 'bg-teal-50 text-teal-700 ring-teal-600/20',
};

// ─────────────────────────────────────────────
//  Helper: Filter Dropdown
// ─────────────────────────────────────────────
interface FilterDropdownProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  options: { label: string; count: number }[];
  selected: string[];
  open: boolean;
  onToggle: () => void;
  onChange: (val: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}
const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label, icon, options, selected, open, onToggle, onChange, onSelectAll, onClearAll
}) => (
  <div className="relative">
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center justify-between min-w-[150px] px-3 py-2 text-[13px] bg-card border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors ${
        selected.length > 0 ? 'border-primary text-primary' : 'border-border text-muted-foreground'
      }`}
    >
      <div className="flex items-center space-x-2">{icon}<span className="font-medium">{label}</span></div>
      <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
    {open && (
      <div className="absolute left-0 top-full mt-1.5 w-[260px] bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        <div className="p-3 pb-2">
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-muted-foreground/60 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" className="w-full pl-9 pr-3 py-1.5 text-[13px] bg-card border border-border rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none" placeholder="Tìm kiếm..." />
          </div>
          <div className="flex items-center justify-between px-1 py-2 border-b border-border/50 mb-1">
            <button onClick={onSelectAll} className="text-[12px] text-primary font-semibold hover:underline">Chọn tất cả</button>
            <button onClick={onClearAll} className="text-[12px] text-primary font-semibold hover:underline">Xóa chọn</button>
          </div>
          <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
            {options.map(opt => (
              <label key={opt.label} className="flex items-center justify-between px-2 py-2 hover:bg-accent rounded-lg cursor-pointer transition-colors">
                <div className="flex items-center space-x-2.5">
                  <input type="checkbox" checked={selected.includes(opt.label)} onChange={() => onChange(opt.label)} className="rounded border-border text-primary w-4 h-4 focus:ring-primary" />
                  <span className="text-[13px] text-muted-foreground">{opt.label}</span>
                </div>
                <span className="text-[12px] text-muted-foreground font-medium">{opt.count}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    )}
  </div>
);

// ─────────────────────────────────────────────
//  Form Field Helper
// ─────────────────────────────────────────────
const FormField = ({
  label, id, required = false, type = 'text', value, onChange, placeholder, note, children
}: {
  label: string; id: string; required?: boolean; type?: string; value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; note?: string; children?: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-[12px] font-semibold text-foreground">
      {label} {required && <span className="text-red-500">*</span>}
      {note && <span className="ml-1 text-[11px] font-normal text-muted-foreground">({note})</span>}
    </label>
    {children ?? (
      <input
        id={id} name={id} type={type} required={required} value={value} onChange={onChange}
        placeholder={placeholder ?? 'Nhập nội dung...'}
        className="w-full px-3 py-2 text-[13px] bg-card border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors placeholder:text-muted-foreground/40"
      />
    )}
  </div>
);

// ─────────────────────────────────────────────
//  Main Component
// ─────────────────────────────────────────────
const ContractManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<BusinessContract[]>(INITIAL_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BusinessContract | null>(null);

  // Filters
  const [selectedPic, setSelectedPic] = useState<string[]>([]);
  const [selectedKind, setSelectedKind] = useState<string[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Pagination
  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // ── Form state ──
  const emptyForm = {
    name: '',
    supplierId: '',
    supplierName: '',
    pic: '',
    noContract: '',
    contractValue: '',
    paymentTerm: '',
    kindLogistic: false,
    kindTrading: false,
    fileName: '',
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpenDropdown(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (id: string) => setOpenDropdown(p => p === id ? null : id);

  const toggle = (val: string, setter: React.Dispatch<React.SetStateAction<string[]>>) =>
    setter(p => p.includes(val) ? p.filter(v => v !== val) : [...p, val]);

  // ── Filtering ──
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return data.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(q) || c.noContract.toLowerCase().includes(q) || c.pic.toLowerCase().includes(q);
      const matchPic = selectedPic.length === 0 || selectedPic.includes(c.pic);
      const matchKind = selectedKind.length === 0 || selectedKind.includes(c.kindOfContract);
      return matchSearch && matchPic && matchKind;
    });
  }, [data, searchQuery, selectedPic, selectedKind]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // ── Open Add / Edit ──
  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (contract: BusinessContract) => {
    setEditTarget(contract);
    const kinds = contract.kindOfContract.split(', ');
    setForm({
      name: contract.name,
      supplierId: contract.supplierId,
      supplierName: contract.supplierName,
      pic: contract.pic,
      noContract: contract.noContract,
      contractValue: contract.contractValue,
      paymentTerm: contract.paymentTerm,
      kindLogistic: kinds.includes('Logistic'),
      kindTrading: kinds.includes('Trading'),
      fileName: contract.fileName ?? '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xoá hợp đồng này?')) {
      setData(prev => prev.filter(c => c.id !== id));
    }
  };

  // ── Submit ──
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const kinds: string[] = [];
    if (form.kindLogistic) kinds.push('Logistic');
    if (form.kindTrading) kinds.push('Trading');
    const kindOfContract = (kinds.join(', ') || 'Logistic') as KindOfContract;

    if (editTarget) {
      setData(prev => prev.map(c => c.id === editTarget.id ? {
        ...c, name: form.name, supplierId: form.supplierId, supplierName: form.supplierName,
        pic: form.pic, noContract: form.noContract, contractValue: form.contractValue,
        paymentTerm: form.paymentTerm, kindOfContract, fileName: form.fileName || undefined,
      } : c));
    } else {
      const newC: BusinessContract = {
        id: Date.now().toString(),
        name: form.name, supplierId: form.supplierId, supplierName: form.supplierName,
        pic: form.pic, noContract: form.noContract, contractValue: form.contractValue,
        paymentTerm: form.paymentTerm, kindOfContract, fileName: form.fileName || undefined,
      };
      setData(prev => [newC, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setForm(prev => ({ ...prev, fileName: file.name }));
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex-1 overflow-auto bg-background p-4 sm:p-8 font-sans text-foreground">

        {/* ── Page title ── */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Quản lý Hợp đồng</h2>
          <p className="text-[13px] text-muted-foreground mt-1">Tra cứu, tạo mới và quản lý hợp đồng thương mại với khách hàng và nhà cung cấp.</p>
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-col gap-4 mb-5" ref={dropdownRef}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <button
                onClick={() => navigate('/hanh-chinh')}
                className="flex items-center px-3 py-2 bg-card border border-border rounded-lg text-[13px] font-medium text-muted-foreground hover:bg-accent shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Quay lại
              </button>
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-muted-foreground/60 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-[13px] bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
                  placeholder="Tìm theo tên, số HĐ, người phụ trách..."
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center px-4 py-2 bg-card border border-border rounded-lg text-[13px] font-medium text-muted-foreground hover:bg-accent shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20">
                <Download className="w-4 h-4 mr-2" /> Xuất excel
              </button>
              <button
                onClick={openAdd}
                className="flex items-center px-4 py-2 bg-primary rounded-lg text-[13px] font-medium text-white hover:bg-primary/90 shadow-sm shadow-primary/30 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <Plus className="w-4 h-4 mr-2" /> Tạo hợp đồng
              </button>
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap items-center gap-3">
            <FilterDropdown
              id="pic" label="Người phụ trách" icon={<User className="w-4 h-4" />}
              options={PIC_OPTIONS} selected={selectedPic}
              open={openDropdown === 'pic'} onToggle={() => toggleDropdown('pic')}
              onChange={v => toggle(v, setSelectedPic)}
              onSelectAll={() => setSelectedPic(PIC_OPTIONS.map(o => o.label))}
              onClearAll={() => setSelectedPic([])}
            />
            <FilterDropdown
              id="kind" label="Loại HĐ" icon={<Layers className="w-4 h-4" />}
              options={KIND_OPTIONS} selected={selectedKind}
              open={openDropdown === 'kind'} onToggle={() => toggleDropdown('kind')}
              onChange={v => toggle(v, setSelectedKind)}
              onSelectAll={() => setSelectedKind(KIND_OPTIONS.map(o => o.label))}
              onClearAll={() => setSelectedKind([])}
            />
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col relative z-0 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar pt-1">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[900px]">
              <thead>
                <tr className="bg-muted border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-3.5 w-12 text-center">
                    <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" />
                  </th>
                  <th className="px-4 py-3.5 min-w-[200px]">Name</th>
                  <th className="px-4 py-3.5 min-w-[170px]">PIC <span className="normal-case font-normal">(Người phụ trách)</span></th>
                  <th className="px-4 py-3.5">No Contract <span className="normal-case font-normal">(Số HĐ)</span></th>
                  <th className="px-4 py-3.5">Payment Term</th>
                  <th className="px-4 py-3.5">Kind of Contract</th>
                  <th className="px-4 py-3.5 text-center sticky right-0 bg-muted backdrop-blur-md shadow-[-8px_0_10px_-4px_rgba(0,0,0,0.04)] w-28 z-10">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="text-[13px] divide-y divide-border/50">
                {paginated.map(item => (
                  <tr key={item.id} className="hover:bg-accent group transition-colors">
                    <td className="px-4 py-3 text-center">
                      <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" />
                    </td>
                    {/* Name – link to employee info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[11px] font-bold shrink-0">
                          {item.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground leading-tight">{item.name}</div>
                          {item.supplierId && (
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Link2 className="w-3 h-3" />{item.supplierId}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* PIC */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.pic)}&background=e2e8f0&color=475569&size=28`}
                          alt={item.pic} className="w-6 h-6 rounded-full"
                        />
                        <span className="text-foreground">{item.pic}</span>
                      </div>
                    </td>
                    {/* No Contract */}
                    <td className="px-4 py-3 font-mono text-[12px] text-foreground/80">{item.noContract}</td>
                    {/* Payment Term */}
                    <td className="px-4 py-3 text-muted-foreground">{item.paymentTerm}</td>
                    {/* Kind of Contract */}
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-[11px] font-medium ring-1 ${kindColor[item.kindOfContract]}`}>
                        {item.kindOfContract}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3 text-center sticky right-0 bg-card group-hover:bg-accent shadow-[-8px_0_10px_-4px_rgba(0,0,0,0.04)] transition-colors z-10">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEdit(item)}
                          title="Chỉnh sửa"
                          className="p-1.5 text-muted-foreground/60 hover:text-primary rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          title="Xoá"
                          className="p-1.5 text-muted-foreground/60 hover:text-red-500 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground text-[13px]">
                      Không tìm thấy hợp đồng nào khớp với điều kiện lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-border/50 bg-card flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[13px] text-muted-foreground">
              Hiển thị <span className="font-bold text-foreground">{Math.min((currentPage - 1) * PAGE_SIZE + 1, filtered.length)}</span> –{' '}
              <span className="font-bold text-foreground">{Math.min(currentPage * PAGE_SIZE, filtered.length)}</span> của{' '}
              <span className="font-bold text-foreground">{filtered.length}</span> hợp đồng
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-2 text-muted-foreground/60 hover:text-muted-foreground disabled:opacity-30 rounded focus:outline-none"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                <button
                  key={pg}
                  onClick={() => setCurrentPage(pg)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-medium transition-colors ${
                    pg === currentPage ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {pg}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-2 text-muted-foreground/60 hover:text-muted-foreground disabled:opacity-30 rounded focus:outline-none"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          ADD / EDIT MODAL
      ══════════════════════════════════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-2xl max-h-[92vh] rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden">

            {/* Modal header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-foreground leading-tight">
                    {editTarget ? 'Chỉnh sửa Hợp đồng' : 'Tạo Hợp đồng mới'}
                  </h3>
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    Điền đầy đủ thông tin để {editTarget ? 'cập nhật' : 'tạo mới'} hợp đồng thương mại.
                  </p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors focus:outline-none">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <form id="contract-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5 bg-background/20">

              {/* ── ID / Bộ NCC ── */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-4">
                <h4 className="text-[13px] font-semibold text-primary flex items-center gap-2 pb-2 border-b border-border">
                  <Building2 className="w-4 h-4" /> Thông tin đối tác
                </h4>

                <FormField
                  label="ID" id="name" required value={form.name}
                  note="Thay cho ID KH – cả của KH và tên NCC"
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="VD: KH001 – ACME Corporation"
                />

                {/* Bộ NCC */}
                <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3 space-y-3">
                  <span className="text-[12px] font-semibold text-foreground">Bộ NCC</span>
                  <FormField
                    label="Mã NCC" id="supplierId" value={form.supplierId}
                    onChange={e => setForm(p => ({ ...p, supplierId: e.target.value }))}
                    placeholder="VD: NCC-001"
                  />
                  <FormField
                    label="Tên nhà cung cấp" id="supplierName" value={form.supplierName}
                    onChange={e => setForm(p => ({ ...p, supplierName: e.target.value }))}
                    placeholder="VD: ACME Logistics Ltd"
                  />
                </div>
              </div>

              {/* ── Người phụ trách & Số HĐ ── */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-4">
                <h4 className="text-[13px] font-semibold text-primary flex items-center gap-2 pb-2 border-b border-border">
                  <User className="w-4 h-4" /> Người phụ trách & Hợp đồng
                </h4>

                <FormField
                  label="PIC (Người phụ trách)" id="pic" required value={form.pic}
                  note="Tên nhân viên"
                  onChange={e => setForm(p => ({ ...p, pic: e.target.value }))}
                  placeholder="VD: Nguyễn Văn An"
                />

                <FormField
                  label="No Contract (Số HĐ)" id="noContract" required value={form.noContract}
                  onChange={e => setForm(p => ({ ...p, noContract: e.target.value }))}
                  placeholder="VD: HD-LOG-2025-001"
                />
              </div>

              {/* ── Giá trị & Thanh toán ── */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-4">
                <h4 className="text-[13px] font-semibold text-primary flex items-center gap-2 pb-2 border-b border-border">
                  <CreditCard className="w-4 h-4" /> Giá trị & Thanh toán
                </h4>

                {/* Bộ Giá trị HĐ */}
                <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3">
                  <span className="text-[12px] font-semibold text-foreground block mb-3">Bộ Giá trị HĐ</span>
                  <FormField
                    label="Giá trị hợp đồng" id="contractValue" value={form.contractValue}
                    onChange={e => setForm(p => ({ ...p, contractValue: e.target.value }))}
                    placeholder="VD: 1,200,000,000"
                  />
                </div>

                <FormField
                  label="Payment Term (Điều khoản thanh toán)" id="paymentTerm" value={form.paymentTerm}
                  onChange={e => setForm(p => ({ ...p, paymentTerm: e.target.value }))}
                  placeholder="VD: Net 30, Net 45..."
                />
              </div>

              {/* ── Loại HĐ ── */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <h4 className="text-[13px] font-semibold text-primary flex items-center gap-2 pb-2 border-b border-border">
                  <Hash className="w-4 h-4" /> Kind of Contract (Loại hợp đồng)
                </h4>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${form.kindLogistic ? 'bg-primary border-primary' : 'border-border group-hover:border-primary/60'}`}>
                      {form.kindLogistic && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <input type="checkbox" className="sr-only" checked={form.kindLogistic} onChange={e => setForm(p => ({ ...p, kindLogistic: e.target.checked }))} />
                    <span className="text-[13px] font-medium text-foreground">Logistic</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${form.kindTrading ? 'bg-primary border-primary' : 'border-border group-hover:border-primary/60'}`}>
                      {form.kindTrading && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <input type="checkbox" className="sr-only" checked={form.kindTrading} onChange={e => setForm(p => ({ ...p, kindTrading: e.target.checked }))} />
                    <span className="text-[13px] font-medium text-foreground">Trading</span>
                  </label>
                </div>
                {!form.kindLogistic && !form.kindTrading && (
                  <p className="text-[12px] text-amber-600 mt-1">Vui lòng chọn ít nhất một loại hợp đồng.</p>
                )}
              </div>

              {/* ── File upload ── */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <h4 className="text-[13px] font-semibold text-primary flex items-center gap-2 pb-2 border-b border-border">
                  <Upload className="w-4 h-4" /> File đính kèm
                  <span className="ml-1 text-[11px] font-normal text-muted-foreground">(Lưu vào Driver Cty)</span>
                </h4>

                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl py-6 cursor-pointer hover:border-primary/50 hover:bg-accent transition-all group"
                >
                  <Upload className="w-8 h-8 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                  <span className="text-[13px] text-muted-foreground group-hover:text-foreground transition-colors">
                    {form.fileName ? (
                      <span className="font-medium text-primary">{form.fileName}</span>
                    ) : (
                      <>Kéo thả hoặc <span className="text-primary font-semibold">chọn file</span> để upload</>
                    )}
                  </span>
                  <span className="text-[11px] text-muted-foreground/60">PDF, DOCX, XLSX – tối đa 20MB</span>
                  <input id="file-upload" type="file" className="sr-only" accept=".pdf,.doc,.docx,.xlsx,.xls" onChange={handleFileChange} />
                </label>
              </div>

            </form>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button" onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-border text-foreground text-[13px] font-medium rounded-lg hover:bg-muted transition-colors focus:outline-none"
              >
                Hủy bỏ
              </button>
              <button
                type="submit" form="contract-form"
                disabled={!form.kindLogistic && !form.kindTrading}
                className="px-6 py-2 bg-primary text-white text-[13px] font-medium rounded-lg hover:bg-primary/90 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editTarget ? 'Cập nhật' : 'Lưu hợp đồng'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractManagementPage;
