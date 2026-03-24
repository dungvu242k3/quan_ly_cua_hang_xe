import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Search, Plus, Filter, 
  X, FileText, ShoppingCart, Calculator
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Types
interface PurchaseOrder {
  id: string;
  supplierId: string;
  shipmentId: string;
  supplierName: string;
  description: string;
  hsCode: string;
  cost: number;
  tax: number; // in %
  taxValue: number;
  pic: string;
  // Details from ADD
  rate: number;
  quantity: number;
  unit: string;
  currency: 'VND' | 'USD';
  exchangeRate: number;
  total: number;
  specification: string;
  note: string;
}

// Mock Data
const initialOrders: PurchaseOrder[] = [
  {
    id: '1',
    supplierId: 'SUP001',
    shipmentId: 'SCM-TEC-190326',
    supplierName: 'Global Supplier Ltd',
    description: 'Linh kiện điện tử',
    hsCode: '85423100',
    rate: 15.5,
    quantity: 1000,
    unit: 'cái',
    currency: 'USD',
    exchangeRate: 25000,
    cost: 15.5 * 1000 * 25000,
    tax: 10,
    taxValue: (15.5 * 1000 * 25000) * 0.1,
    total: (15.5 * 1000 * 25000) + ((15.5 * 1000 * 25000) * 0.1),
    pic: 'Nguyễn Văn A',
    specification: 'Thông số tiêu chuẩn',
    note: 'Giao hàng khẩn'
  }
];

const PurchaseOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<PurchaseOrder[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    shipmentId: '',
    supplier: '',
    description: '',
    hsCode: '',
    rate: '',
    quantity: '',
    unit: '',
    currency: 'VND',
    exchangeRate: '1',
    tax: '',
    pic: '',
    specification: '',
    note: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Calculations
  const rateNum = parseFloat(formData.rate) || 0;
  const qtyNum = parseFloat(formData.quantity) || 0;
  const exRateNum = parseFloat(formData.exchangeRate) || 0;
  const taxNum = parseFloat(formData.tax) || 0;

  const cost = qtyNum * rateNum * exRateNum;
  const taxValue = cost * (taxNum / 100);
  const total = cost + taxValue;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrder: PurchaseOrder = {
      id: Date.now().toString(),
      supplierId: formData.supplier.substring(0, 6).toUpperCase() || 'NEW',
      shipmentId: formData.shipmentId || 'N/A',
      supplierName: formData.supplier || 'N/A',
      description: formData.description || 'N/A',
      hsCode: formData.hsCode || 'N/A',
      rate: rateNum,
      quantity: qtyNum,
      unit: formData.unit || 'N/A',
      currency: formData.currency as 'VND' | 'USD',
      exchangeRate: exRateNum,
      cost: cost,
      tax: taxNum,
      taxValue: taxValue,
      total: total,
      pic: formData.pic || 'N/A',
      specification: formData.specification || 'N/A',
      note: formData.note || 'N/A'
    };
    setData([newOrder, ...data]);
    setFormData({
      shipmentId: '',
      supplier: '',
      description: '',
      hsCode: '',
      rate: '',
      quantity: '',
      unit: '',
      currency: 'VND',
      exchangeRate: '1',
      tax: '',
      pic: '',
      specification: '',
      note: ''
    });
    setIsAddModalOpen(false);
  };

  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.shipmentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  // Format currency helper
  const formatCurrency = (amount: number, currency: string = 'VND') => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: currency }).format(amount);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans text-foreground">
      {/* Page Header */}
      <div className="flex-1 overflow-auto bg-background p-4 sm:p-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Quản lý Đơn đặt hàng</h2>
            <p className="text-[13px] text-muted-foreground mt-1">Tra cứu và tạo mới đơn đặt hàng, nhà cung cấp, chi phí và thuế.</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-4 mb-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <button onClick={() => navigate('/mua-hang')} className="flex items-center px-3 py-2 bg-card border border-border rounded-lg text-[13px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20">
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Quay lại
              </button>
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-[13px] bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/60" 
                  placeholder="Tìm theo lô hàng, nhà cung cấp, hàng hóa..." 
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center px-4 py-2 bg-card border border-border rounded-lg text-[13px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20">
                <Filter className="w-4 h-4 mr-2" /> Lọc
              </button>
              <button className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg text-[13px] font-medium hover:bg-primary/90 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/50" onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Thêm mới
              </button>
            </div>
          </div>
        </div>

        {/* List View Table */}
        <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col relative overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar pt-1">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[max-content]">
              <thead>
                <tr className="bg-muted/50 border-b border-border/50 text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-3 border-r border-border/50 text-center">STT</th>
                  <th className="px-4 py-3 border-r border-border/50">Mã NCC</th>
                  <th className="px-4 py-3 border-r border-border/50">Mã Lô hàng</th>
                  <th className="px-4 py-3 border-r border-border/50">Tên nhà cung cấp</th>
                  <th className="px-4 py-3 border-r border-border/50">Mô tả hàng hoá</th>
                  <th className="px-4 py-3 border-r border-border/50 text-center">Mã HS</th>
                  <th className="px-4 py-3 border-r border-border/50 text-right">Chi phí</th>
                  <th className="px-4 py-3 border-r border-border/50 text-center">Thuế (%)</th>
                  <th className="px-4 py-3 border-r border-border/50 text-right">Tiền thuế</th>
                  <th className="px-4 py-3 border-r border-border/50 text-right">Tổng cộng</th>
                  <th className="px-4 py-3">Người phụ trách</th>
                </tr>
              </thead>
              <tbody className="text-[13px] divide-y divide-border/50">
                {filteredData.map((item, index) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-center text-muted-foreground border-r border-border/50">{index + 1}</td>
                    <td className="px-4 py-3 border-r border-border/50 font-medium">{item.supplierId}</td>
                    <td className="px-4 py-3 border-r border-border/50 text-primary">{item.shipmentId}</td>
                    <td className="px-4 py-3 border-r border-border/50">{item.supplierName}</td>
                    <td className="px-4 py-3 border-r border-border/50 truncate max-w-[200px]" title={item.description}>{item.description}</td>
                    <td className="px-4 py-3 border-r border-border/50 text-center text-muted-foreground">{item.hsCode}</td>
                    <td className="px-4 py-3 border-r border-border/50 text-right font-medium">{formatCurrency(item.cost)}</td>
                    <td className="px-4 py-3 border-r border-border/50 text-center text-muted-foreground">{item.tax}%</td>
                    <td className="px-4 py-3 border-r border-border/50 text-right font-medium text-red-600">{formatCurrency(item.taxValue)}</td>
                    <td className="px-4 py-3 border-r border-border/50 text-right font-bold text-emerald-600">{formatCurrency(item.total)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.pic}</td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={11} className="px-4 py-12 text-center text-muted-foreground">
                      Không tìm thấy đơn hàng nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-border/50 bg-card flex items-center justify-between">
            <div className="text-[12px] text-muted-foreground">
              Tổng số dòng: <strong className="text-foreground">{filteredData.length}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ADD Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-ultra border border-border flex flex-col overflow-hidden dialog-slide-in">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground leading-tight">Thêm mới Đơn Đặt Hàng</h3>
                  <div className="text-[12px] text-muted-foreground flex items-center mt-0.5">
                    Nhập thông tin để tạo mới một đơn mua hàng
                  </div>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors focus:outline-none">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form id="add-order-form" onSubmit={handleAddSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-background/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                
                {/* Thông tin đối tác & Hàng hóa */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-[14px] text-primary border-b border-border pb-2 mb-3">Thông tin chung</h4>
                  <FieldRow label="Mã lô hàng" id="shipmentId" required value={formData.shipmentId} onChange={handleInputChange} />
                  <FieldRow label="Nhà cung cấp" id="supplier" required value={formData.supplier} onChange={handleInputChange} />
                  <FieldRow label="Người phụ trách" id="pic" value={formData.pic} onChange={handleInputChange} />
                  <FieldRow label="Mô tả hàng hoá" id="description" value={formData.description} onChange={handleInputChange} />
                  <FieldRow label="Quy cách" id="specification" value={formData.specification} onChange={handleInputChange} />
                  <FieldRow label="Ghi chú" id="note" value={formData.note} onChange={handleInputChange} />
                </div>

                {/* Thông tin Chi phí */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-[14px] text-primary border-b border-border pb-2 mb-3">Thông tin chi phí & thuế</h4>
                  <FieldRow label="Mã HS" id="hsCode" value={formData.hsCode} onChange={handleInputChange} />
                  <div className="grid grid-cols-2 gap-2">
                    <FieldRow label="Số lượng" id="quantity" type="number" step="0.01" value={formData.quantity} onChange={handleInputChange} vertical />
                    <FieldRow label="Đơn vị" id="unit" value={formData.unit} onChange={handleInputChange} vertical />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <FieldRow label="Đơn giá (Rate)" id="rate" type="number" step="0.01" value={formData.rate} onChange={handleInputChange} vertical />
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="currency" className="text-[12px] font-medium text-foreground w-full">Tiền tệ</label>
                      <select 
                        id="currency" 
                        name="currency" 
                        value={formData.currency} 
                        onChange={handleInputChange}
                        className="w-full px-3 py-1.5 text-[13px] bg-card border border-border rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                      >
                        <option value="VND">VND</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                  </div>

                  <FieldRow label="Tỷ giá" id="exchangeRate" type="number" step="1" value={formData.exchangeRate} onChange={handleInputChange} />
                  <FieldRow label="Thuế (%)" id="tax" type="number" step="0.1" value={formData.tax} onChange={handleInputChange} />
                  
                  {/* Summary Box */}
                  <div className="mt-4 bg-muted/30 border border-border rounded-lg p-4 space-y-2">
                    <div className="flex items-center text-primary mb-2 font-semibold text-[14px]">
                      <Calculator className="w-4 h-4 mr-2" /> Kết quả tính toán
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-muted-foreground">Chi phí (Cost):</span>
                      <span className="font-medium">{formatCurrency(cost, 'VND')}</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-muted-foreground">Tiền thuế (Tax Value):</span>
                      <span className="font-medium text-red-600">+{formatCurrency(taxValue, 'VND')}</span>
                    </div>
                    <div className="pt-2 mt-2 border-t border-border flex justify-between text-[14px]">
                      <span className="font-bold text-foreground">Tổng cộng:</span>
                      <span className="font-bold text-emerald-600">{formatCurrency(total, 'VND')}</span>
                    </div>
                  </div>
                </div>

              </div>
            </form>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-border text-foreground text-[13px] font-medium rounded-lg hover:bg-muted transition-colors focus:outline-none">
                Hủy bỏ
              </button>
              <button type="submit" form="add-order-form" className="px-6 py-2 bg-primary text-primary-foreground text-[13px] font-medium rounded-lg hover:bg-primary/90 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50">
                Lưu đơn hàng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for form rows
const FieldRow = ({ 
  label, note, placeholder, type = "text", vertical = false, id, value, onChange, required = false, step
}: { 
  label: string, note?: string, placeholder?: string, type?: string, vertical?: boolean,
  id: string, value: string | number, onChange: any, required?: boolean, step?: string
}) => {
  return (
    <div className={`flex ${vertical ? 'flex-col gap-1.5' : 'flex-col sm:flex-row sm:items-center'} gap-1`}>
      <label htmlFor={id} className={`text-[12px] font-medium text-foreground ${vertical ? 'w-full' : 'sm:w-[130px] shrink-0'}`}>
        {label} {note && <span className="text-[10px] font-normal text-muted-foreground block">{note}</span>}
      </label>
      <div className="flex-1 w-full relative">
        <input 
          id={id}
          name={id}
          type={type} 
          required={required}
          step={step}
          value={value}
          onChange={onChange}
          className="w-full px-3 py-1.5 text-[13px] bg-card border border-border rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors placeholder:text-muted-foreground/40"
          placeholder={placeholder || (type === 'number' ? '0' : 'Nhập nội dung...')}
        />
      </div>
    </div>
  );
}

export default PurchaseOrderPage;
