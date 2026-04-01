import { useState, useEffect } from 'react';
import { 
  Wallet, Plus, Trash2, Save, Loader2, Info, ChevronLeft, MapPin, Briefcase
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSalaryComponents } from '../data/salaryComponentData';
import type { ThanhPhanLuong } from '../data/salaryComponentData';
import { upsertAllowancePolicy } from '../data/allowancePolicyData';

const AllowancePolicyPage: React.FC = () => {
  const navigate = useNavigate();
  const [components, setComponents] = useState<ThanhPhanLuong[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [selectedCoSo, setSelectedCoSo] = useState('Cơ sở Bắc Ninh');
  const [selectedComponentId, setSelectedComponentId] = useState('');
  const [policyName, setPolicyName] = useState('');
  const [positionEntries, setPositionEntries] = useState<{ vi_tri: string, dinh_muc: string, gia_tri: number }[]>([
    { vi_tri: 'Tất cả vị trí', dinh_muc: '', gia_tri: 0 }
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [compData] = await Promise.all([
        getSalaryComponents()
      ]);
      setComponents(compData.filter(c => c.loai === 'thu_nhap'));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComponent = () => {
    setPositionEntries([...positionEntries, { vi_tri: '', dinh_muc: '', gia_tri: 0 }]);
  };

  const handleRemovePosition = (index: number) => {
    const newEntries = [...positionEntries];
    newEntries.splice(index, 1);
    setPositionEntries(newEntries);
  };

  const handleSave = async () => {
    if (!selectedComponentId || !policyName) {
      alert('Vui lòng nhập tên chính sách và chọn khoản phụ cấp');
      return;
    }

    try {
      setSaving(true);
      for (const entry of positionEntries) {
        if (!entry.vi_tri) continue;
        await upsertAllowancePolicy({
          co_so: selectedCoSo,
          thanh_phan_luong_id: selectedComponentId,
          ten_chinh_sach: policyName,
          vi_tri: entry.vi_tri,
          dinh_muc: entry.dinh_muc,
          gia_tri: entry.gia_tri
        });
      }
      alert('Đã lưu chính sách phụ cấp thành công!');
      fetchData();
    } catch (error) {
      console.error('Error saving policy:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft size={24} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Thêm chính sách phụ cấp</h1>
          <p className="text-sm text-slate-500 font-medium">Cấu hình giá trị phụ cấp cho từng vị trí công việc</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* General Info */}
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Info size={14} className="text-primary" />
            Thông tin chung
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Đơn vị áp dụng *</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-all"
                  value={selectedCoSo}
                  onChange={(e) => setSelectedCoSo(e.target.value)}
                >
                  <option>Cơ sở Bắc Ninh</option>
                  <option>Cơ sở Bắc Giang</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Khoản phụ cấp *</label>
              <div className="relative">
                <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-all"
                  value={selectedComponentId}
                  onChange={(e) => setSelectedComponentId(e.target.value)}
                >
                  <option value="">Chọn khoản phụ cấp...</option>
                  {components.map(c => (
                    <option key={c.id} value={c.id}>{c.ten}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Tên chính sách *</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-300"
                placeholder="Nhập tên chính sách (VD: Chính sách phụ cấp ăn trưa tháng 6)"
                value={policyName}
                onChange={(e) => setPolicyName(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Position-based Values */}
        <div className="p-8">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Briefcase size={14} className="text-primary" />
            Giá trị phụ cấp theo vị trí
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-slate-50 rounded-xl">
              <div className="col-span-5 text-[10px] font-black text-slate-500 uppercase tracking-wider">Vị trí công việc</div>
              <div className="col-span-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Định mức</div>
              <div className="col-span-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Giá trị (VND)</div>
              <div className="col-span-1"></div>
            </div>

            {positionEntries.map((entry, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-4 items-center group animate-in slide-in-from-left-2 duration-300">
                <div className="col-span-5 relative">
                  <select
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-primary transition-all appearance-none"
                    value={entry.vi_tri}
                    onChange={(e) => {
                      const newEntries = [...positionEntries];
                      newEntries[idx].vi_tri = e.target.value;
                      setPositionEntries(newEntries);
                    }}
                  >
                    <option value="">Chọn vị trí...</option>
                    <option value="Tất cả vị trí">Tất cả vị trí trong đơn vị</option>
                    <option value="Quản lý">Quản lý cơ sở</option>
                    <option value="Kỹ thuật viên">Kỹ thuật viên</option>
                    <option value="Kế toán">Kế toán</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Plus size={14} />
                  </div>
                </div>
                <div className="col-span-3">
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-primary transition-all"
                    placeholder="VD: 200k/ngày"
                    value={entry.dinh_muc}
                    onChange={(e) => {
                      const newEntries = [...positionEntries];
                      newEntries[idx].dinh_muc = e.target.value;
                      setPositionEntries(newEntries);
                    }}
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-black text-sm outline-none focus:border-primary transition-all"
                    value={entry.gia_tri}
                    onChange={(e) => {
                      const newEntries = [...positionEntries];
                      newEntries[idx].gia_tri = Number(e.target.value);
                      setPositionEntries(newEntries);
                    }}
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  {idx > 0 && (
                    <button 
                      onClick={() => handleRemovePosition(idx)}
                      className="p-2 text-rose-400 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={handleAddComponent}
              className="flex items-center gap-2 px-6 py-3 text-primary font-black text-sm hover:bg-primary/5 rounded-xl transition-colors mt-6 border-2 border-dashed border-primary/20 w-full justify-center"
            >
              <Plus size={20} />
              Thêm vị trí công việc
            </button>
          </div>
        </div>

        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-10 py-3 bg-emerald-600 text-white rounded-xl font-black shadow-lg shadow-emerald-600/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Lưu chính sách
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllowancePolicyPage;
