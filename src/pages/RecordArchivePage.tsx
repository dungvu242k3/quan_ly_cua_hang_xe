import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Search, FileText, ChevronDown, 
  Building2, RefreshCw, List, Plus, Folder, Pin, 
  Edit, Trash2 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Record {
  id: number;
  code: string;
  name: string;
  doc: string;
  dept: string;
  auth: string;
  expire: string;
  status: string;
  isPinned: boolean;
}

const initialData: Record[] = [
  { id: 1, code: 'HS-2025-01', name: 'Hồ sơ nhân sự quý I/2025', doc: 'Quyết định ban hành nội quy công ty', dept: 'Phòng nhân sự', auth: 'Chưa cấu hình', expire: '31/12/2030', status: 'Đang hoạt động', isPinned: false },
  { id: 2, code: 'HS-2025-02', name: 'Hồ sơ công văn đến/đi', doc: 'Công văn đề nghị cung cấp hồ sơ', dept: 'Phòng hành chính', auth: 'Chưa cấu hình', expire: '31/12/2030', status: 'Đang hoạt động', isPinned: false },
  { id: 3, code: 'HS-2024-12', name: 'Hồ sơ nội quy công ty', doc: 'Quyết định ban hành nội quy công ty', dept: 'Phòng hành chính', auth: 'Chưa cấu hình', expire: '—', status: 'Đang hoạt động', isPinned: false },
  { id: 4, code: 'HS-2025-03', name: 'Hồ sơ dự án đầu tư', doc: 'Tờ trình đề xuất mua sắm thiết bị văn phòng', dept: 'Phòng kỹ thuật', auth: 'Chưa cấu hình', expire: '31/12/2030', status: 'Tạm khóa', isPinned: false }
];

const docOptions = [
  "Quyết định ban hành nội quy công ty",
  "Công văn đề nghị cung cấp hồ sơ",
  "Báo cáo tổng kết tháng 1/2025",
  "Tờ trình đề xuất mua sắm thiết bị văn phòng"
];

const deptOptions = [
  "Phòng kỹ thuật",
  "Phòng nhân sự",
  "Phòng kinh doanh",
  "Phòng hành chính"
];

const statusOptions = [
  "Đang hoạt động",
  "Tạm khóa"
];

const RecordArchivePage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<Record[]>(initialData);
  const [currentTab, setCurrentTab] = useState<'all' | 'pin'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleDocChange = (doc: string) => {
    setSelectedDocs(prev => prev.includes(doc) ? prev.filter(d => d !== doc) : [...prev, doc]);
  };

  const handleDeptChange = (dept: string) => {
    setSelectedDepts(prev => prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]);
  };

  const togglePin = (id: number) => {
    setData(prev => prev.map(item => item.id === id ? { ...item, isPinned: !item.isPinned } : item));
  };

  const deleteRow = (id: number) => {
    if(window.confirm('Xác nhận xóa?')) {
      setData(prev => prev.filter(item => item.id !== id));
    }
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDoc = selectedDocs.length === 0 || selectedDocs.includes(item.doc);
      const matchDept = selectedDepts.length === 0 || selectedDepts.includes(item.dept);
      const matchStatus = selectedStatus.length === 0 || selectedStatus.includes(item.status);
      const matchTab = currentTab === 'all' || (currentTab === 'pin' && item.isPinned);

      return matchSearch && matchDoc && matchDept && matchStatus && matchTab;
    });
  }, [data, searchQuery, selectedDocs, selectedDepts, selectedStatus, currentTab]);

  return (
    <div className="w-full flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500 text-muted-foreground font-sans">
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentTab('all')} 
            className={`flex items-center gap-2 px-4 py-2 ${currentTab === 'all' ? 'bg-card rounded-t-lg border border-b-0 border-border text-primary font-medium text-[13px] relative after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-primary z-10' : 'text-muted-foreground hover:text-muted-foreground font-medium text-[13px] border-b border-transparent'}`}
          >
            <Folder size={18} /> Tất cả hồ sơ
          </button>
          <button 
            onClick={() => setCurrentTab('pin')} 
            className={`flex items-center gap-2 px-4 py-2 ${currentTab === 'pin' ? 'bg-card rounded-t-lg border border-b-0 border-border text-primary font-medium text-[13px] relative after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-primary z-10' : 'text-muted-foreground hover:text-muted-foreground font-medium text-[13px] border-b border-transparent'}`}
          >
            <Pin size={18} /> Đã ghim
          </button>
          {/* Fill bottom border for tabs container if needed to match design */}
          <div className="flex-1 border-b border-border"></div>
        </div>

        {/* Toolbar */}
        <div className="bg-card p-3 rounded-tr-lg rounded-b-lg border border-border shadow-sm flex flex-wrap items-center justify-between gap-4 -mt-4 z-0 relative">
          <div className="flex items-center gap-3 flex-1 flex-wrap" ref={dropdownRef}>
            <button onClick={() => navigate('/hanh-chinh')} className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded text-[13px] text-muted-foreground hover:bg-accent transition-colors">
              <ArrowLeft size={18} /> Quay lại
            </button>
            <div className="relative w-full sm:w-[300px]">
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                <Search size={18} />
              </div>
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 border border-border rounded text-[13px] focus:ring-1 focus:ring-primary focus:border-primary placeholder-slate-400 outline-none" 
                placeholder="Tìm kiếm . . ." 
                type="text"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {/* Document Dropdown */}
              <div className="relative">
                <button onClick={() => toggleDropdown('doc')} className="flex items-center gap-2 px-3 py-1.5 border border-border rounded text-[13px] text-muted-foreground min-w-[120px] justify-between bg-card hover:bg-accent">
                  <div className="flex items-center gap-2"><FileText size={18} />Tài liệu</div>
                  <ChevronDown size={18} />
                </button>
                {openDropdown === 'doc' && (
                  <div className="absolute top-10 left-0 z-50 w-[320px] bg-card border border-border rounded shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 bg-muted border-b border-border/50 flex items-center justify-between">
                      <label className="flex items-center gap-2 font-bold text-primary text-[13px] cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={selectedDocs.length === docOptions.length && docOptions.length > 0}
                          onChange={(e) => setSelectedDocs(e.target.checked ? docOptions : [])} 
                          className="rounded border-border text-primary size-4"
                        /> Chọn tất cả
                      </label>
                      <button onClick={() => setSelectedDocs([])} className="text-[11px] text-destructive hover:underline font-medium">Xoá chọn</button>
                    </div>
                    <ul className="py-1 text-[13px] text-muted-foreground max-h-[200px] overflow-y-auto">
                      {docOptions.map(doc => (
                        <li key={doc} className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={selectedDocs.includes(doc)}
                            onChange={() => handleDocChange(doc)}
                            className="rounded border-border text-primary size-4"
                          /> {doc}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Department Dropdown */}
              <div className="relative">
                <button onClick={() => toggleDropdown('dept')} className="flex items-center gap-2 px-3 py-1.5 border border-border rounded text-[13px] text-muted-foreground min-w-[160px] justify-between bg-card hover:bg-accent">
                  <div className="flex items-center gap-2"><Building2 size={18} />Phòng quản lý</div>
                  <ChevronDown size={18} />
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
                    <ul className="py-1 text-[13px] text-muted-foreground">
                      {deptOptions.map(dept => (
                        <li key={dept} className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={selectedDepts.includes(dept)}
                            onChange={() => handleDeptChange(dept)}
                            className="rounded border-border text-primary size-4"
                          /> {dept}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Status Dropdown */}
              <div className="relative">
                <button onClick={() => toggleDropdown('status')} className="flex items-center gap-2 px-3 py-1.5 border border-border rounded text-[13px] text-muted-foreground min-w-[140px] justify-between bg-card hover:bg-accent">
                  <div className="flex items-center gap-2"><RefreshCw size={18} />Trạng thái</div>
                  <ChevronDown size={18} />
                </button>
                {openDropdown === 'status' && (
                  <div className="absolute top-10 left-0 z-50 min-w-[180px] bg-card border border-border rounded shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 bg-muted border-b border-border/50 flex items-center justify-between">
                      <label className="flex items-center gap-2 font-bold text-primary text-[13px] cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={selectedStatus.length === statusOptions.length && statusOptions.length > 0}
                          onChange={(e) => setSelectedStatus(e.target.checked ? statusOptions : [])}
                          className="rounded border-border text-primary size-4"
                        /> Chọn tất cả
                      </label>
                      <button onClick={() => setSelectedStatus([])} className="text-[11px] text-destructive hover:underline font-medium">Xoá chọn</button>
                    </div>
                    <ul className="py-1 text-[13px] text-muted-foreground">
                      {statusOptions.map(status => (
                        <li key={status} className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={selectedStatus.includes(status)}
                            onChange={() => handleStatusChange(status)}
                            className="rounded border-border text-primary size-4"
                          /> {status}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-1.5 border border-border rounded text-muted-foreground hover:bg-accent transition-colors">
              <List size={20} />
            </button>
            <button className="bg-primary hover:bg-primary/90 text-white px-5 py-1.5 rounded flex items-center gap-2 text-[14px] font-semibold transition-colors">
              <Plus size={20} /> Thêm
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
                  <th className="px-4 py-3 font-semibold">Mã - Tên hồ sơ</th>
                  <th className="px-4 py-3 font-semibold">Tài liệu</th>
                  <th className="px-4 py-3 font-semibold">Phòng quản lý</th>
                  <th className="px-4 py-3 font-semibold">Phân quyền</th>
                  <th className="px-4 py-3 font-semibold">Thời hạn lưu trữ</th>
                  <th className="px-4 py-3 font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 text-center font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px]">
                {filteredData.map(item => (
                  <tr key={item.id} className="hover:bg-muted/80 transition-colors">
                    <td className="px-4 py-4 text-center"><input className="rounded border-border text-primary size-4" type="checkbox" /></td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground/60 text-[11px] mb-0.5">{item.code}</span>
                        <span className="text-foreground font-semibold">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">{item.doc}</td>
                    <td className="px-4 py-4">{item.dept}</td>
                    <td className="px-4 py-4 text-muted-foreground/60 italic">{item.auth}</td>
                    <td className="px-4 py-4 text-muted-foreground">{item.expire}</td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-semibold border ${item.status === 'Tạm khóa' ? 'bg-muted text-muted-foreground border-border' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-4">
                        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); togglePin(item.id); }} className={`transition-colors ${item.isPinned ? 'text-amber-500 hover:text-amber-600' : 'text-muted-foreground/60 hover:text-amber-500'}`}>
                          <Pin size={18} className={item.isPinned ? "fill-amber-500" : ""} />
                        </button>
                        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); alert('Tính năng sửa hồ sơ đang được phát triển...'); }} className="text-primary hover:text-blue-700 transition-colors">
                          <Edit size={18} />
                        </button>
                        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteRow(item.id); }} className="text-destructive hover:text-destructive/80 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                      Không tìm thấy hồ sơ nào khớp với điều kiện tìm kiếm.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-card border-t border-border flex items-center justify-between text-[12px]">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="font-bold text-muted-foreground">{filteredData.length}</span>/Tổng:<span className="font-bold text-muted-foreground">{data.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordArchivePage;
