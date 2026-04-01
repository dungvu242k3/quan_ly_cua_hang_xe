import { useState, useEffect } from 'react';
import { 
  Search, Settings2, Download, Send, BadgeDollarSign, 
  ChevronDown, Filter, Calendar, Building2, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import { getPayrollBatch } from '../data/payrollData';
import type { BangLuong } from '../data/payrollData';
import { clsx } from 'clsx';

const PayrollPage: React.FC = () => {
  const [payrollData, setPayrollData] = useState<BangLuong[]>([]);
  const [loading, setLoading] = useState(true);
  const selectedMonth = new Date().getMonth() + 1;
  const selectedYear = new Date().getFullYear();
  const selectedCoSo = 'Tất cả cơ sở';
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear, selectedCoSo]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getPayrollBatch(selectedMonth, selectedYear, selectedCoSo);
      setPayrollData(data);
    } catch (error) {
      console.error('Error fetching payroll:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val);

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Bảng lương tháng {selectedMonth}/{selectedYear}</h1>
            <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-black uppercase rounded-full">Chưa khóa</span>
          </div>
          <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
            <Building2 size={14} className="text-slate-400" />
            Đơn vị: {selectedCoSo}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl font-black text-sm shadow-sm hover:bg-slate-50 transition-all">
            <Calendar size={18} className="text-primary" />
            Chọn Kỳ Lương
            <ChevronDown size={14} className="text-slate-400" />
          </button>
          
          <div className="h-10 w-px bg-slate-200 mx-2 hidden lg:block" />

          <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition-all">
            <Download size={18} />
            Nhập khẩu
          </button>
          <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition-all">
            <Send size={18} />
            Gửi phiếu lương
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-black shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all">
            <BadgeDollarSign size={20} />
            Chi trả lương
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col xl:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Tìm kiếm nhân viên (Tên, Mã, Email)..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full xl:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1.5 rounded-xl">
             {['Tất cả', 'Đã duyệt', 'Đã trả'].map(st => (
               <button key={st} className={clsx(
                 "px-4 py-1.5 rounded-lg text-xs font-black transition-all",
                 st === 'Tất cả' ? "bg-white shadow-sm text-primary" : "text-slate-500 hover:text-slate-700"
               )}>
                 {st}
               </button>
             ))}
          </div>
          <button className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 transition-all">
            <Filter size={18} />
          </button>
          <button className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-primary hover:bg-slate-100 transition-all">
            <Settings2 size={18} />
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[2000px]">
            <thead className="sticky top-0 bg-slate-50/80 backdrop-blur-md z-30 border-b border-slate-200">
              <tr>
                <th className="sticky left-0 bg-slate-50 border-r border-slate-100 px-4 py-4 text-[10px] font-black text-slate-900 uppercase tracking-widest text-center w-12">STT</th>
                <th className="sticky left-12 bg-slate-50 border-r border-slate-200 px-6 py-4 text-[10px] font-black text-slate-900 uppercase tracking-widest min-w-[200px]">Họ và tên</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-900 uppercase tracking-widest">Đơn vị công tác</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-900 uppercase tracking-widest text-right">Doanh số</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-900 uppercase tracking-widest text-right">D.Số Mục tiêu</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">Tỷ lệ HT (%)</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right text-slate-500">Lương Ngày công</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right text-slate-500">Lương Doanh số</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right text-emerald-600">Phụ cấp đ.lại</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right text-emerald-600">Phụ cấp điện th.</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right text-rose-600">BHXH (8%)</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right text-rose-600">Thuế TNCN</th>
                <th className="sticky right-0 bg-slate-50 border-l border-slate-200 px-8 py-4 text-[10px] font-black text-slate-900 uppercase tracking-widest text-right min-w-[150px]">Thực lĩnh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                 <tr>
                    <td colSpan={13} className="py-20 text-center">
                       <Loader2 className="animate-spin inline-block text-primary" size={24} />
                    </td>
                 </tr>
              ) : payrollData.length === 0 ? (
                 <tr>
                    <td colSpan={13} className="py-20 text-center">
                       <p className="text-slate-400 font-bold">Chưa có bảng lương cho tháng này</p>
                       <button className="mt-4 text-sm font-black text-primary hover:underline italic">Khởi tạo ngay dữ liệu mẫu →</button>
                    </td>
                 </tr>
              ) : payrollData.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="sticky left-0 bg-white group-hover:bg-slate-50 border-r border-slate-100 px-4 py-4 text-xs font-bold text-slate-400 text-center">{idx + 1}</td>
                  <td className="sticky left-12 bg-white group-hover:bg-slate-50 border-r border-slate-200 px-6 py-4">
                    <div>
                      <p className="text-sm font-black text-slate-900">{item.nhan_su?.ho_ten}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.nhan_su?.vi_tri}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">{item.co_so}</td>
                  <td className="px-6 py-4 text-right text-xs font-black text-slate-900">{formatCurrency(item.doanh_so)}</td>
                  <td className="px-6 py-4 text-right text-xs font-black text-slate-500">{formatCurrency(item.doanh_so_muc_tieu)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black rounded-lg">
                      {((item.doanh_so / (item.doanh_so_muc_tieu || 1)) * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-xs font-black text-slate-700">{formatCurrency(item.luong_ngay_cong)}</td>
                  <td className="px-6 py-4 text-right text-xs font-black text-slate-700">{formatCurrency(item.luong_doanh_so)}</td>
                  <td className="px-6 py-4 text-right text-xs font-black text-emerald-600">300.000</td>
                  <td className="px-6 py-4 text-right text-xs font-black text-emerald-600">200.000</td>
                  <td className="px-6 py-4 text-right text-xs font-black text-rose-500">{formatCurrency(item.bhxh)}</td>
                  <td className="px-6 py-4 text-right text-xs font-black text-rose-500">{formatCurrency(item.thue_tncn)}</td>
                  <td className="sticky right-0 bg-white group-hover:bg-emerald-50 border-l border-slate-200 px-8 py-4 text-right">
                    <p className="text-sm font-black text-emerald-700">{formatCurrency(item.thuc_linh)}</p>
                    {item.trang_thai === 'Đã chi trả' ? (
                      <CheckCircle2 size={12} className="inline text-emerald-500 ml-1" />
                    ) : (
                      <AlertCircle size={12} className="inline text-amber-500 ml-1" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Simple Footer/Summary */}
        <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng Thực Lĩnh</p>
               <p className="text-xl font-black text-slate-900">124.500.000 <span className="text-xs text-slate-400">VND</span></p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đã Chi Trả</p>
               <p className="text-xl font-black text-emerald-600">82.000.000 <span className="text-xs text-slate-400">VND</span></p>
            </div>
          </div>
          <div className="text-right">
             <p className="text-[11px] font-bold text-slate-500">Hiển thị 5 trên 5 bản ghi</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollPage;
