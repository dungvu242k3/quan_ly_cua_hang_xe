import React, { useState, useEffect } from 'react';
import { 
  upsertPayrollSetting,
  getPayrollSettings,
  getTaxBrackets
} from '../data/payrollSettingsData';
import type { ThongSoLuong, BieuThueTNCN } from '../data/payrollSettingsData';
import { clsx } from 'clsx';
import { Briefcase, Settings2, ShieldCheck, Loader2, Info } from 'lucide-react';

const PayrollSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'luong' | 'thue' | 'bao-hiem'>('luong');
  const [settings, setSettings] = useState<ThongSoLuong[]>([]);
  const [taxBrackets, setTaxBrackets] = useState<BieuThueTNCN[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [settingsData, taxData] = await Promise.all([
        getPayrollSettings(),
        getTaxBrackets()
      ]);
      setSettings(settingsData);
      setTaxBrackets(taxData);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSetting = async (id: string, value: number) => {
    try {
      setSaving(true);
      const setting = settings.find(s => s.id === id);
      if (setting) {
        await upsertPayrollSetting({ ...setting, gia_tri: value });
        setSettings(prev => prev.map(s => s.id === id ? { ...s, gia_tri: value } : s));
      }
    } catch (error) {
      console.error('Error updating setting:', error);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'luong', label: 'Lương', icon: Briefcase },
    { id: 'thue', label: 'Thuế TNCN', icon: Settings2 },
    { id: 'bao-hiem', label: 'Bảo hiểm', icon: ShieldCheck },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Thông số mặc định</h1>
          <p className="text-sm text-slate-500">Cấu hình các tham số tính lương toàn hệ thống</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
              activeTab === tab.id 
                ? "bg-white text-primary shadow-sm" 
                : "text-slate-500 hover:bg-white/50"
            )}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8">
          {activeTab === 'luong' && (
            <div className="space-y-8 max-w-2xl">
              <div>
                <label className="block text-sm font-black text-slate-900 mb-2 uppercase tracking-wide">Mức lương cơ sở (VND)</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="number"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-black outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    defaultValue={settings.find(s => s.loai === 'luong_co_so')?.gia_tri}
                    onBlur={(e) => {
                      const s = settings.find(s => s.loai === 'luong_co_so');
                      if (s) handleUpdateSetting(s.id, Number(e.target.value));
                    }}
                  />
                  <span className="text-slate-400 font-bold">VNĐ</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-slate-900 mb-2 uppercase tracking-wide">Mức lương trần đóng BHXH, BHYT (VND)</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="number"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-black outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    defaultValue={settings.find(s => s.loai === 'tran_bhxh_bhyt')?.gia_tri}
                    onBlur={(e) => {
                      const s = settings.find(s => s.loai === 'tran_bhxh_bhyt');
                      if (s) handleUpdateSetting(s.id, Number(e.target.value));
                    }}
                  />
                  <span className="text-slate-400 font-bold">VNĐ</span>
                </div>
              </div>

              <div className="pt-4">
                <label className="block text-sm font-black text-slate-900 mb-4 uppercase tracking-wide">Mức lương tối thiểu vùng</label>
                <div className="overflow-hidden border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 font-black text-slate-900">Đơn vị</th>
                        <th className="px-4 py-3 font-black text-slate-900 text-right">Mức lương tối thiểu (VND)</th>
                        <th className="px-4 py-3 font-black text-slate-900 text-right">Trần đóng BHTN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {['Cơ sở Bắc Ninh', 'Cơ sở Bắc Giang'].map(co_so => (
                        <tr key={co_so} className="hover:bg-slate-50/50">
                          <td className="px-4 py-4 font-bold text-slate-700">{co_so}</td>
                          <td className="px-4 py-4 text-right">
                            <input 
                              type="number"
                              className="w-32 bg-transparent text-right font-black text-slate-900 focus:outline-none border-b border-dashed border-slate-200 focus:border-primary"
                              defaultValue={settings.find(s => s.loai === 'luong_toi_thieu_vung' && s.co_so === co_so)?.gia_tri}
                              onBlur={(e) => {
                                const s = settings.find(s => s.loai === 'luong_toi_thieu_vung' && s.co_so === co_so);
                                if (s) handleUpdateSetting(s.id, Number(e.target.value));
                              }}
                            />
                          </td>
                          <td className="px-4 py-4 text-right text-slate-900 font-black">
                            {new Intl.NumberFormat('vi-VN').format(settings.find(s => s.loai === 'tran_bhtn' && s.co_so === co_so)?.gia_tri || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'thue' && (
            <div className="space-y-8">
              <div className="flex flex-col gap-4">
                <label className="text-sm font-black text-slate-900 uppercase tracking-wide">Thuế suất của nhân viên thử việc</label>
                <div className="flex gap-8">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="trial_tax" defaultChecked className="w-4 h-4 text-primary focus:ring-primary" />
                    <span className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">Theo 10%</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="trial_tax" className="w-4 h-4 text-primary focus:ring-primary" />
                    <span className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">Theo biểu lũy tiến</span>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">Biểu thuế lũy tiến</h4>
                <div className="overflow-hidden border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th rowSpan={2} className="px-4 py-3 font-black text-slate-900 border-r border-slate-200">Bậc thuế</th>
                        <th colSpan={2} className="px-4 py-3 font-black text-slate-900 text-center border-r border-slate-200">Phần thu nhập tính thuế/năm (VND)</th>
                        <th colSpan={2} className="px-4 py-3 font-black text-slate-900 text-center border-r border-slate-200">Phần thu nhập tính thuế/tháng (VND)</th>
                        <th rowSpan={2} className="px-4 py-3 font-black text-slate-900 text-center">Thuế suất (%)</th>
                      </tr>
                      <tr className="border-t border-slate-200">
                        <th className="px-4 py-2 font-black text-slate-600 text-center border-r border-slate-200">Trên</th>
                        <th className="px-4 py-2 font-black text-slate-600 text-center border-r border-slate-200">Đến</th>
                        <th className="px-4 py-2 font-black text-slate-600 text-center border-r border-slate-200">Trên</th>
                        <th className="px-4 py-2 font-black text-slate-600 text-center border-r border-slate-200">Đến</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {taxBrackets.map(bracket => (
                        <tr key={bracket.bac_thue} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 text-center font-black text-slate-900 border-r border-slate-200">{bracket.bac_thue}</td>
                          <td className="px-4 py-3 text-right text-slate-700 border-r border-slate-200">{bracket.tu_nam ? new Intl.NumberFormat('vi-VN').format(bracket.tu_nam) : '-'}</td>
                          <td className="px-4 py-3 text-right text-slate-700 border-r border-slate-200">{bracket.den_nam ? new Intl.NumberFormat('vi-VN').format(bracket.den_nam) : '-'}</td>
                          <td className="px-4 py-3 text-right text-slate-700 border-r border-slate-200">{bracket.tu_thang ? new Intl.NumberFormat('vi-VN').format(bracket.tu_thang) : '-'}</td>
                          <td className="px-4 py-3 text-right text-slate-700 border-r border-slate-200">{bracket.den_thang ? new Intl.NumberFormat('vi-VN').format(bracket.den_thang) : '-'}</td>
                          <td className="px-4 py-3 text-center font-black text-primary">{bracket.thue_suat}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bao-hiem' && (
            <div className="space-y-8 max-w-xl">
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 flex gap-4">
                <Info className="text-primary shrink-0" size={20} />
                <p className="text-sm text-primary/80 font-medium">Tỷ lệ đóng bảo hiểm hiện tại được áp dụng theo quy định mới nhất của Nhà nước.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { label: 'BHXH người lao động', key: 'ty_le_bhxh_nld', icon: ShieldCheck },
                  { label: 'BHYT người lao động', key: 'ty_le_bhyt_nld', icon: ShieldCheck },
                  { label: 'BHTN người lao động', key: 'ty_le_bhtn_nld', icon: ShieldCheck },
                ].map(item => (
                  <div key={item.key} className="space-y-2">
                    <label className="text-sm font-black text-slate-900 uppercase tracking-wide">{item.label}</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="number"
                        step="0.1"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-black outline-none focus:ring-2 focus:ring-primary/20"
                        defaultValue={settings.find(s => s.loai === item.key)?.gia_tri}
                        onBlur={(e) => {
                          const s = settings.find(s => s.loai === item.key);
                          if (s) handleUpdateSetting(s.id, Number(e.target.value));
                        }}
                      />
                      <span className="text-slate-400 font-bold">%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {saving && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
          <Loader2 className="animate-spin" size={20} />
          <span className="text-sm font-bold">Đang cập nhật hệ thống...</span>
        </div>
      )}
    </div>
  );
};

export default PayrollSettingsPage;
