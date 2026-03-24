import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Search, Plus, Filter, 
  X, FileText, FileSignature, Printer
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Types
interface Quote {
  id: string;
  shipmentId: string;
  description: string;
  rate: number;
  quantity: number;
  unit: string;
  currency: 'USD' | 'VND';
  exchangeRate: number;
  tax: number;
  taxValue: number;
  total: number;
}

// Mock Data
const initialQuotes: Quote[] = [
  {
    id: '1',
    shipmentId: 'SCM-TEC-190326',
    description: 'Cước vận chuyển hàng không',
    rate: 2.5,
    quantity: 1500,
    unit: 'kg',
    currency: 'USD',
    exchangeRate: 25400,
    tax: 8,
    taxValue: 7620000,
    total: 102870000
  },
  {
    id: '2',
    shipmentId: 'SCM-FAS-150326',
    description: 'Phí THC tại cảng xuất',
    rate: 1500000,
    quantity: 2,
    unit: 'container',
    currency: 'VND',
    exchangeRate: 1,
    tax: 10,
    taxValue: 300000,
    total: 3300000
  }
];

const QuoteManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<Quote[]>(initialQuotes);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    shipmentId: '',
    description: '',
    rate: '',
    quantity: '',
    unit: '',
    currency: 'VND' as 'USD' | 'VND',
    exchangeRate: '1',
    tax: ''
  });

  // Calculate Tax Value and Total whenever relevant fields change
  const calculatedValues = useMemo(() => {
    const rate = parseFloat(formData.rate) || 0;
    const quantity = parseFloat(formData.quantity) || 0;
    const exchangeRate = parseFloat(formData.exchangeRate) || 0;
    const tax = parseFloat(formData.tax) || 0;

    const taxValue = (tax / 100) * quantity * rate * exchangeRate;
    const total = (quantity * rate * exchangeRate) + taxValue;

    return { taxValue, total };
  }, [formData.rate, formData.quantity, formData.exchangeRate, formData.tax]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Auto set exchange rate if currency changes
    if (name === 'currency') {
      const exchangeValue = value === 'VND' ? '1' : '25400';
      setFormData(prev => ({ ...prev, [name]: value as 'USD' | 'VND', exchangeRate: exchangeValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newQuote: Quote = {
      id: Date.now().toString(),
      shipmentId: formData.shipmentId || 'N/A',
      description: formData.description || 'N/A',
      rate: parseFloat(formData.rate) || 0,
      quantity: parseFloat(formData.quantity) || 0,
      unit: formData.unit || 'Lô',
      currency: formData.currency,
      exchangeRate: parseFloat(formData.exchangeRate) || 1,
      tax: parseFloat(formData.tax) || 0,
      taxValue: calculatedValues.taxValue,
      total: calculatedValues.total
    };
    setData([newQuote, ...data]);
    setIsAddModalOpen(false);
    
    // Reset form
    setFormData({
      shipmentId: '',
      description: '',
      rate: '',
      quantity: '',
      unit: '',
      currency: 'VND',
      exchangeRate: '1',
      tax: ''
    });
  };

  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.shipmentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans text-foreground">
      {/* Page Header */}
      <div className="flex-1 overflow-auto bg-background p-4 sm:p-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Quản lý Báo giá</h2>
            <p className="text-[13px] text-muted-foreground mt-1">Lập báo giá, theo dõi hạng mục báo giá và liên kết với lô hàng.</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-4 mb-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <button onClick={() => navigate('/kinh-doanh')} className="flex items-center px-3 py-2 bg-card border border-border rounded-lg text-[13px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20">
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Quay lại
              </button>
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-[13px] bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/60" 
                  placeholder="Tìm theo mã lô hàng, nội dung..." 
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center px-4 py-2 bg-card border border-border rounded-lg text-[13px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20" onClick={() => setIsTemplateModalOpen(true)}>
                <Printer className="w-4 h-4 mr-2" /> Mẫu báo giá
              </button>
              <button className="flex items-center px-4 py-2 bg-card border border-border rounded-lg text-[13px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20">
                <Filter className="w-4 h-4 mr-2" /> Lọc
              </button>
              <button className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg text-[13px] font-medium hover:bg-primary/90 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/50" onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Thêm mới (ADD)
              </button>
            </div>
          </div>
        </div>

        {/* List View Table */}
        <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col relative overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar pt-1">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[max-content]">
              <thead>
                <tr className="bg-card border-b border-border/50 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-3">Mã lô (Shipment ID)</th>
                  <th className="px-4 py-3 min-w-[300px]">Nội dung (Description)</th>
                  <th className="px-4 py-3 text-right">Giá (Price) / Tổng cộng</th>
                  <th className="px-4 py-3 text-right">Thuế (Tax)</th>
                </tr>
              </thead>
              <tbody className="text-[13px] divide-y divide-border/50">
                {filteredData.map(item => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-4 py-3 font-mono font-medium text-primary">
                      <div className="flex items-center gap-2 cursor-pointer hover:underline">
                        <FileSignature className="w-3.5 h-3.5 text-blue-500" />
                        {item.shipmentId}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{item.description}</td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                      {formatCurrency(item.total)}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {item.tax}% ({formatCurrency(item.taxValue)})
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                      Không tìm thấy hạng mục báo giá nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-border/50 bg-card flex items-center justify-between">
            <div className="text-[12px] text-muted-foreground">
              Tổng số hạng mục: <strong className="text-foreground">{filteredData.length}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ADD Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-2xl rounded-2xl shadow-ultra border border-border flex flex-col overflow-hidden dialog-slide-in">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground leading-tight">Thêm hạng mục Báo giá</h3>
                  <div className="text-[12px] text-muted-foreground mt-0.5">
                    Nhập chi tiết hạng mục, đơn giá, số lượng và thuế.
                  </div>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors focus:outline-none">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-background/30 space-y-4">
              
              <FieldRow label="Mã lô (Shipment ID)" id="shipmentId" placeholder="Mã lô hàng liên kết (VD: SCM-123)" value={formData.shipmentId} onChange={handleInputChange} required />
              
              <FieldRow label="Nội dung" note="(Tên hạng mục báo giá)" id="description" placeholder="Tên hạng mục báo giá..." value={formData.description} onChange={handleInputChange} required />
              
              <div className="grid grid-cols-2 gap-4">
                <FieldRow label="Số lượng" note="(Quantity)" id="quantity" type="number" step="0.01" value={formData.quantity} onChange={handleInputChange} required />
                <FieldRow label="Đơn vị tính" note="(Unit)" id="unit" placeholder="Nhập tay (VD: Pcs, Kgs, Cnt...)" value={formData.unit} onChange={handleInputChange} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FieldRow label="Đơn giá" note="(Rate)" id="rate" type="number" step="0.01" value={formData.rate} onChange={handleInputChange} required />
                <div className="flex flex-col gap-1.5 self-start w-full">
                  <label htmlFor="currency" className="text-[12px] font-medium text-foreground">
                    Đơn vị tiền tệ <span className="text-[10px] font-normal text-muted-foreground block">(Lựa chọn)</span>
                  </label>
                  <select 
                    id="currency" name="currency" 
                    value={formData.currency} onChange={handleInputChange as any}
                    className="w-full px-3 py-1.5 text-[13px] bg-card border border-border rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  >
                    <option value="VND">VND</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FieldRow label="Tỷ giá" note="(Exchange Rate)" id="exchangeRate" type="number" step="0.01" value={formData.exchangeRate} onChange={handleInputChange} required />
                <FieldRow label="Thuế" note="(% Tax)" id="tax" type="number" step="0.01" placeholder="Ví dụ: 8, 10..." value={formData.tax} onChange={handleInputChange} required />
              </div>

              {/* Calculated Values Summary */}
              <div className="bg-muted/50 rounded-xl p-4 border border-border mt-6 space-y-3">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-muted-foreground">Tiền thuế (Tax Value)</span>
                  <span className="font-semibold">{formatCurrency(calculatedValues.taxValue)}</span>
                </div>
                <div className="h-px bg-border w-full"></div>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold text-foreground">Tổng cộng (Total)</span>
                  <span className="text-[18px] font-bold text-primary">{formatCurrency(calculatedValues.total)}</span>
                </div>
                <div className="text-[10px] text-muted-foreground/70 text-right mt-1">
                  Công thức: Quantity * Rate * Exchange Rate + Tax Value
                </div>
              </div>

            </form>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-end gap-3">
              <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-border text-foreground text-[13px] font-medium rounded-lg hover:bg-muted transition-colors focus:outline-none">
                Hủy bỏ
              </button>
              <button onClick={handleAddSubmit} className="px-6 py-2 bg-primary text-primary-foreground text-[13px] font-medium rounded-lg hover:bg-primary/90 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50">
                Thêm hạng mục
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quote Template Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white text-black w-full max-w-[800px] h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden dialog-slide-in">
            {/* Modal Actions */}
            <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50 shrink-0">
              <h3 className="font-bold text-gray-800">Xem trước Mẫu Báo Giá</h3>
              <div className="flex items-center gap-2">
                <button className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors flex items-center">
                  <Printer className="w-4 h-4 mr-2" /> In báo giá (Print)
                </button>
                <button onClick={() => setIsTemplateModalOpen(false)} className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* A4 Paper View inside scrollable area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-gray-100/50 flex justify-center">
              {/* The "Paper" */}
              <div className="bg-white w-full max-w-[700px] shadow-sm border border-gray-200 print:shadow-none print:border-none print:max-w-none p-10 relative text-[12px] font-sans">
                
                {/* Header Section */}
                <div className="text-right text-[9px] text-gray-500 uppercase tracking-widest leading-relaxed mb-8">
                  MGM@ANLE-SCM.COM<br/>
                  ANLE-SCM.COM/HOME<br/>
                  NO 1L, 7L STREET, TAN THUAN WARD, HO CHI MINH CITY, VIETNAM
                </div>

                <div className="flex items-center gap-4 mb-8">
                  <div className="w-[80px] h-[80px] bg-gray-200 rounded-full shrink-0 flex items-center justify-center text-gray-400 border-[3px] border-gray-300">LOGO</div>
                  <div className="text-[18px] font-black tracking-widest text-gray-800">ANLE-SUPPLY CHAIN MANAGEMENT</div>
                </div>

                {/* Title */}
                <div className="text-center border-t-2 border-b-2 border-gray-800 py-3 mb-2">
                  <h1 className="text-2xl font-bold uppercase tracking-wider text-gray-900">BÁO GIÁ DỊCH VỤ LOGISTICS</h1>
                </div>
                <div className="text-right text-[11px] font-medium mb-8">
                  Ngày 02 tháng 02 năm 2026
                </div>

                {/* General Information */}
                <div className="mb-6">
                  <h2 className="font-bold uppercase mb-3 text-[13px] border-b border-dashed border-gray-400 pb-1">THÔNG TIN CHUNG</h2>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2.5">
                    <div className="flex justify-between"><span className="text-gray-600">Mã Báo Giá (Reference No.)</span><span className="font-bold">SCMTDI270126</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Người phụ trách</span><span className="font-medium">Phòng Logistics</span></div>

                    <div className="flex justify-between"><span className="text-gray-600">Khách hàng (Customer)</span><span className="font-bold uppercase">CTY TNHH TID I</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Cảng đi (POL)</span><span className="font-medium">Shenzhen, China</span></div>

                    <div className="flex justify-between"><span className="text-gray-600">Dịch vụ (Service)</span><span className="font-bold italic">IM_AIR</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Cảng đến (POD)</span><span className="font-medium">Hanoi, VN</span></div>

                    <div className="flex justify-between"><span className="text-gray-600">Mặt hàng (Commodities)</span><span className="font-bold">Phụ kiện cửa</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Ngày tàu chạy (ATD)</span><span className="font-medium">05/02/2026</span></div>

                    <div className="flex justify-between"><span className="text-gray-600">Khối lượng (Volume)</span><span className="font-bold">18.2 KGS</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Ngày tàu đến (ATA)</span><span className="font-medium"></span></div>

                    <div className="flex justify-between"><span className="text-gray-600">Điều kiện (Term)</span><span className="font-bold italic">EXW</span></div>
                    <div className="flex justify-between border-t border-gray-200 pt-1 mt-1"><span className="text-gray-600">Tên tàu/ Số chuyến</span><span className="font-medium"></span></div>

                    <div className="flex justify-between"><span className="text-gray-600">Đơn vị tiền tệ:</span><span className="font-bold italic uppercase">USD</span></div>
                  </div>
                </div>

                {/* Pricing Table */}
                <div className="mb-8">
                  <h2 className="font-bold uppercase mb-3 text-[13px] border-b border-gray-800 pb-1 flex justify-between">
                    <span>TIẾN ĐỘ XỬ LÝ (Transit 1-3 ngày)</span>
                  </h2>
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b-2 border-gray-300 text-gray-700 font-bold">
                        <th className="py-2 pr-4 font-bold">Nội dung</th>
                        <th className="py-2 px-2 text-right">Đơn Giá<br/><span className="font-normal text-[10px] text-gray-500">(Rate)</span></th>
                        <th className="py-2 px-2 text-right">Số lượng<br/><span className="font-normal text-[10px] text-gray-500">(Quantity)</span></th>
                        <th className="py-2 px-2 text-center">Đơn vị tính<br/><span className="font-normal text-[10px] text-gray-500">(Units)</span></th>
                        <th className="py-2 pl-2 text-right">Tổng<br/><span className="font-normal text-[10px] text-gray-500">(Total)</span></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/60 font-medium">
                      <tr>
                        <td className="py-3 pr-4">Cước phí vận chuyển quốc tế<br/><span className="font-normal text-gray-500">(A/F)</span></td>
                        <td className="py-3 px-2 text-right">4.07</td>
                        <td className="py-3 px-2 text-right">18.2</td>
                        <td className="py-3 px-2 text-center">KGS</td>
                        <td className="py-3 pl-2 text-right">74.074</td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-4">Dịch vụ đầu xuất (EXW Fee)</td>
                        <td className="py-3 px-2 text-right">274</td>
                        <td className="py-3 px-2 text-right">1</td>
                        <td className="py-3 px-2 text-center">Lô</td>
                        <td className="py-3 pl-2 text-right">274</td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-4">Phí chứng từ + xếp dỡ</td>
                        <td className="py-3 px-2 text-right">70</td>
                        <td className="py-3 px-2 text-right">1</td>
                        <td className="py-3 px-2 text-center">Lô</td>
                        <td className="py-3 pl-2 text-right">70</td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-4">Phí thông quan</td>
                        <td className="py-3 px-2 text-right">50</td>
                        <td className="py-3 px-2 text-right">1</td>
                        <td className="py-3 px-2 text-center">Lô</td>
                        <td className="py-3 pl-2 text-right">50</td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-4">Phí vận chuyển nội địa</td>
                        <td className="py-3 px-2 text-right">67</td>
                        <td className="py-3 px-2 text-right">1</td>
                        <td className="py-3 px-2 text-center">Lô</td>
                        <td className="py-3 pl-2 text-right">67</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-800 font-bold text-[14px]">
                        <td colSpan={4} className="py-3 pr-4 text-right">Tổng:</td>
                        <td className="py-3 pl-2 text-right text-black">535.074 USD</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                
                {/* Signature fields */}
                <div className="mt-16 grid grid-cols-2 text-center pb-8">
                  <div>
                    <div className="font-bold">ĐẠI DIỆN KHÁCH HÀNG</div>
                    <div className="text-gray-500 italic text-[11px]">(Ký và ghi rõ họ tên)</div>
                  </div>
                  <div>
                    <div className="font-bold">ĐẠI DIỆN BÁO GIÁ</div>
                    <div className="text-gray-500 italic text-[11px]">(Ký và ghi rõ họ tên)</div>
                    <div className="mt-16 font-medium">BỘ PHẬN LOGISTICS</div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component
const FieldRow = ({ 
  label, note, placeholder, type = "text", id, value, onChange, required = false, step
}: { 
  label: string, note?: string, placeholder?: string, type?: string,
  id: string, value: string | number, onChange: any, required?: boolean, step?: string
}) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full`}>
      <label htmlFor={id} className="text-[12px] font-medium text-foreground">
        {label} {note && <span className="text-[10px] font-normal text-muted-foreground block">{note}</span>}
      </label>
      <div className="w-full relative">
        <input 
          id={id}
          name={id}
          type={type} 
          required={required}
          step={step}
          value={value}
          onChange={onChange}
          className="w-full px-3 py-1.5 text-[13px] bg-card border border-border rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors placeholder:text-muted-foreground/40"
          placeholder={placeholder || (type === "number" ? "0" : "Nhập...")}
        />
      </div>
    </div>
  );
}

export default QuoteManagementPage;
