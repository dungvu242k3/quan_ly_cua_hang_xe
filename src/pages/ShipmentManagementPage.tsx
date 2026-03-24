import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Search, Plus, Filter, 
  X, Box, Anchor, FileText, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Types
interface Shipment {
  id: string;
  date: string;
  code: string;
  // Customer
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerTaxCode: string;
  // Supplier
  supplierId: string;
  supplierName: string;
  supplierEmail: string;
  supplierPhone: string;
  supplierAddress: string;
  supplierTaxCode: string;
  // Shipment
  commodity: string;
  hsCode: string;
  quantity: number;
  packing: string;
  vesselVoyage: string;
  term: string;
  transportation: 'Air' | 'Sea' | '';
  loadType: 'FCL' | 'LCL' | '';
  pol: string;
  pod: string;
  etd: string;
  eta: string;
  status: string;
}

// Mock Data
const initialShipments: Shipment[] = [
  {
    id: '1',
    date: '19/03/2026',
    code: 'SCM-TEC-190326',
    customerId: 'CUS001',
    customerName: 'TechCorp VN',
    customerEmail: 'contact@techcorp.vn',
    customerPhone: '0901234567',
    customerAddress: 'Q1, TP HCM',
    customerTaxCode: '0312345678',
    supplierId: 'SUP',
    supplierName: 'Global Supplier Ltd',
    supplierEmail: 'sales@global.com',
    supplierPhone: '+1-202-555-0176',
    supplierAddress: 'New York, USA',
    supplierTaxCode: 'US-987654321',
    commodity: 'Electronics Components',
    hsCode: '85423100',
    quantity: 1500.5,
    packing: 'Carton Box',
    vesselVoyage: 'FLIGHT JL759',
    term: 'FCA',
    transportation: 'Air',
    loadType: '',
    pol: 'SGN',
    pod: 'NRT',
    etd: '20/03/2026',
    eta: '21/03/2026',
    status: 'In Transit'
  },
  {
    id: '2',
    date: '15/03/2026',
    code: 'SCM-FAS-150326',
    customerId: 'CUS002',
    customerName: 'FastLogistics JSC',
    customerEmail: 'info@fastlog.vn',
    customerPhone: '0987654321',
    customerAddress: 'Hải Phòng, VN',
    customerTaxCode: '0201234567',
    supplierId: 'OCE',
    supplierName: 'Oceania Trading',
    supplierEmail: 'hello@oceania.au',
    supplierPhone: '+61-412-345-678',
    supplierAddress: 'Sydney, AUS',
    supplierTaxCode: 'AU-11223344',
    commodity: 'Garments',
    hsCode: '62046200',
    quantity: 12000,
    packing: 'Pallet',
    vesselVoyage: 'MSC ALINA V.123',
    term: 'FOB',
    transportation: 'Sea',
    loadType: 'FCL',
    pol: 'HPH',
    pod: 'LAX',
    etd: '18/03/2026',
    eta: '10/04/2026',
    status: 'Booked'
  }
];

const ShipmentManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<Shipment[]>(initialShipments);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Customer
    customerId: '',
    customerCompany: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    customerTaxCode: '',
    // Supplier
    supplierId: '',
    supplierCompany: '',
    supplierEmail: '',
    supplierPhone: '',
    supplierAddress: '',
    supplierTaxCode: '',
    // Shipment
    commodity: '',
    hsCode: '',
    quantity: '',
    packing: '',
    vesselVoyage: '',
    term: '',
    transportationAir: false,
    transportationSea: false,
    loadTypeFCL: false,
    loadTypeLCL: false,
    pol: '',
    pod: '',
    etd: '',
    eta: '',
    openDate: new Date().toISOString().split('T')[0] // today YYYY-MM-DD
  });

  // Auto-generate code: SCM + 3 chars of Customer + Date (DDMMYY)
  const generateCode = () => {
    const cust3 = formData.customerCompany.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'XXX').substring(0, 3);
    const codeCust = cust3.length === 3 ? cust3 : 'CUS';
    const d = new Date(formData.openDate);
    if(isNaN(d.getTime())) return `SCM-${codeCust}-XXXXXX`;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    return `SCM-${codeCust}-${dd}${mm}${yy}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      // Handle radio-like behavior for checkboxes if needed, 
      // but according to prompt it's Tick (Air/Sea) - usually mutually exclusive
      if (name === 'transportationAir' && checked) setFormData(p => ({ ...p, transportationAir: true, transportationSea: false }));
      else if (name === 'transportationSea' && checked) setFormData(p => ({ ...p, transportationSea: true, transportationAir: false }));
      else if (name === 'loadTypeFCL' && checked) setFormData(p => ({ ...p, loadTypeFCL: true, loadTypeLCL: false }));
      else if (name === 'loadTypeLCL' && checked) setFormData(p => ({ ...p, loadTypeLCL: true, loadTypeFCL: false }));
      else setFormData(p => ({ ...p, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newShipment: Shipment = {
      id: Date.now().toString(),
      date: new Date(formData.openDate).toLocaleDateString('vi-VN'),
      code: generateCode(),
      customerId: formData.customerId || 'N/A',
      customerName: formData.customerCompany || 'N/A',
      customerEmail: formData.customerEmail || 'N/A',
      customerPhone: formData.customerPhone || 'N/A',
      customerAddress: formData.customerAddress || 'N/A',
      customerTaxCode: formData.customerTaxCode || 'N/A',
      supplierId: formData.supplierId || 'N/A',
      supplierName: formData.supplierCompany || 'N/A',
      supplierEmail: formData.supplierEmail || 'N/A',
      supplierPhone: formData.supplierPhone || 'N/A',
      supplierAddress: formData.supplierAddress || 'N/A',
      supplierTaxCode: formData.supplierTaxCode || 'N/A',
      commodity: formData.commodity || 'N/A',
      quantity: parseFloat(formData.quantity) || 0,
      hsCode: formData.hsCode || 'N/A',
      packing: formData.packing || 'N/A',
      vesselVoyage: formData.vesselVoyage || 'N/A',
      term: formData.term || 'N/A',
      transportation: formData.transportationAir ? 'Air' : formData.transportationSea ? 'Sea' : '',
      loadType: formData.loadTypeFCL ? 'FCL' : formData.loadTypeLCL ? 'LCL' : '',
      pol: formData.pol || 'N/A',
      pod: formData.pod || 'N/A',
      etd: formData.etd ? new Date(formData.etd).toLocaleDateString('vi-VN') : 'N/A',
      eta: formData.eta ? new Date(formData.eta).toLocaleDateString('vi-VN') : 'N/A',
      status: 'New'
    };
    setData([newShipment, ...data]);
    setIsAddModalOpen(false);
  };

  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.commodity.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans text-foreground">
      {/* Page Header */}
      <div className="flex-1 overflow-auto bg-background p-4 sm:p-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Quản lý Lô hàng (Shipment)</h2>
            <p className="text-[13px] text-muted-foreground mt-1">Tra cứu và tạo mới lô hàng, thông tin khách hàng, nhà cung cấp, vận tải.</p>
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
                  placeholder="Tìm theo mã lô, tên KH, NCC, hàng hóa..." 
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
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
                {/* Super Headers Row */}
                <tr className="border-b border-border/75 text-[12px] font-bold tracking-wider">
                  <th colSpan={3} className="px-4 py-3 bg-muted/80 text-muted-foreground border-r border-border/50 text-center">
                    THÔNG TIN CHUNG
                  </th>
                  <th colSpan={6} className="px-4 py-3 bg-primary/5 text-primary border-r border-border/50 text-center">
                    THÔNG TIN KHÁCH HÀNG
                  </th>
                  <th colSpan={6} className="px-4 py-3 bg-orange-500/5 text-orange-600 border-r border-border/50 text-center">
                    THÔNG TIN NHÀ CUNG CẤP
                  </th>
                  <th colSpan={12} className="px-4 py-3 bg-emerald-500/5 text-emerald-600 text-center">
                    THÔNG TIN LÔ HÀNG
                  </th>
                </tr>
                {/* Sub Headers Row */}
                <tr className="bg-card border-b border-border/50 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {/* Chung */}
                  <th className="px-4 py-3">Mã Lô Hàng</th>
                  <th className="px-4 py-3">Ngày Mở</th>
                  <th className="px-4 py-3 border-r border-border/50">Trạng thái</th>
                  
                  {/* Khách hàng */}
                  <th className="px-4 py-3 bg-primary/5">Mã KH</th>
                  <th className="px-4 py-3 bg-primary/5">Tên DN</th>
                  <th className="px-4 py-3 bg-primary/5">Email</th>
                  <th className="px-4 py-3 bg-primary/5">SĐT</th>
                  <th className="px-4 py-3 bg-primary/5">Địa chỉ</th>
                  <th className="px-4 py-3 bg-primary/5 border-r border-border/50">MST</th>
                  
                  {/* Nhà cung cấp */}
                  <th className="px-4 py-3 bg-orange-500/5">Mã NCC</th>
                  <th className="px-4 py-3 bg-orange-500/5">Tên DN</th>
                  <th className="px-4 py-3 bg-orange-500/5">Email</th>
                  <th className="px-4 py-3 bg-orange-500/5">SĐT</th>
                  <th className="px-4 py-3 bg-orange-500/5">Địa chỉ</th>
                  <th className="px-4 py-3 bg-orange-500/5 border-r border-border/50">MST</th>
                  
                  {/* Lô hàng */}
                  <th className="px-4 py-3 bg-emerald-500/5">Tên hàng</th>
                  <th className="px-4 py-3 bg-emerald-500/5">Mã HS</th>
                  <th className="px-4 py-3 bg-emerald-500/5">Khối lượng</th>
                  <th className="px-4 py-3 bg-emerald-500/5">Đóng gói</th>
                  <th className="px-4 py-3 bg-emerald-500/5">Tàu/Chuyến</th>
                  <th className="px-4 py-3 bg-emerald-500/5">Điều kiện GH</th>
                  <th className="px-4 py-3 bg-emerald-500/5">Vận chuyển</th>
                  <th className="px-4 py-3 bg-emerald-500/5">Loại tải</th>
                  <th className="px-4 py-3 bg-emerald-500/5">Cảng đi</th>
                  <th className="px-4 py-3 bg-emerald-500/5">Cảng đến</th>
                  <th className="px-4 py-3 bg-emerald-500/5">ETD</th>
                  <th className="px-4 py-3 bg-emerald-500/5">ETA</th>
                </tr>
              </thead>
              <tbody className="text-[13px] divide-y divide-border/50">
                {filteredData.map(item => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    {/* Chung */}
                    <td className="px-4 py-3 font-mono font-medium text-primary bg-card group-hover:bg-muted/50">{item.code}</td>
                    <td className="px-4 py-3 text-muted-foreground bg-card group-hover:bg-muted/50">{item.date}</td>
                    <td className="px-4 py-3 border-r border-border/50 bg-card group-hover:bg-muted/50">
                      <span className={`px-2 py-1 rounded text-[11px] font-medium border ${item.status === 'Booked' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-green-500/10 text-green-600 border-green-500/20'}`}>
                        {item.status}
                      </span>
                    </td>
                    
                    {/* Khách hàng */}
                    <td className="px-4 py-3 bg-primary/[0.02]">{item.customerId}</td>
                    <td className="px-4 py-3 bg-primary/[0.02] font-medium">{item.customerName}</td>
                    <td className="px-4 py-3 bg-primary/[0.02] text-muted-foreground">{item.customerEmail}</td>
                    <td className="px-4 py-3 bg-primary/[0.02] text-muted-foreground">{item.customerPhone}</td>
                    <td className="px-4 py-3 bg-primary/[0.02] text-muted-foreground">{item.customerAddress}</td>
                    <td className="px-4 py-3 bg-primary/[0.02] text-muted-foreground border-r border-border/50">{item.customerTaxCode}</td>

                    {/* NCC */}
                    <td className="px-4 py-3 bg-orange-500/[0.02]">{item.supplierId}</td>
                    <td className="px-4 py-3 bg-orange-500/[0.02] font-medium">{item.supplierName}</td>
                    <td className="px-4 py-3 bg-orange-500/[0.02] text-muted-foreground">{item.supplierEmail}</td>
                    <td className="px-4 py-3 bg-orange-500/[0.02] text-muted-foreground">{item.supplierPhone}</td>
                    <td className="px-4 py-3 bg-orange-500/[0.02] text-muted-foreground">{item.supplierAddress}</td>
                    <td className="px-4 py-3 bg-orange-500/[0.02] text-muted-foreground border-r border-border/50">{item.supplierTaxCode}</td>

                    {/* Lô hàng */}
                    <td className="px-4 py-3 bg-emerald-500/[0.02] font-medium">{item.commodity}</td>
                    <td className="px-4 py-3 bg-emerald-500/[0.02] text-muted-foreground">{item.hsCode}</td>
                    <td className="px-4 py-3 bg-emerald-500/[0.02]">{item.quantity}</td>
                    <td className="px-4 py-3 bg-emerald-500/[0.02] text-muted-foreground">{item.packing}</td>
                    <td className="px-4 py-3 bg-emerald-500/[0.02] text-muted-foreground">{item.vesselVoyage}</td>
                    <td className="px-4 py-3 bg-emerald-500/[0.02] text-muted-foreground">{item.term}</td>
                    <td className="px-4 py-3 bg-emerald-500/[0.02]">
                      <div className="flex items-center gap-1.5 font-medium">
                        {item.transportation === 'Sea' ? <Anchor className="w-3.5 h-3.5 text-blue-500" /> : item.transportation === 'Air' ? <Box className="w-3.5 h-3.5 text-amber-500" /> : null}
                        {item.transportation}
                      </div>
                    </td>
                    <td className="px-4 py-3 bg-emerald-500/[0.02]">{item.loadType && <span className="text-[10px] bg-border px-1.5 py-0.5 rounded">{item.loadType}</span>}</td>
                    <td className="px-4 py-3 bg-emerald-500/[0.02]">{item.pol}</td>
                    <td className="px-4 py-3 bg-emerald-500/[0.02]">{item.pod}</td>
                    <td className="px-4 py-3 bg-emerald-500/[0.02] text-muted-foreground">{item.etd}</td>
                    <td className="px-4 py-3 bg-emerald-500/[0.02] text-muted-foreground">{item.eta}</td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={27} className="px-4 py-12 text-center text-muted-foreground">
                      Không tìm thấy lô hàng nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-border/50 bg-card flex items-center justify-between">
            <div className="text-[12px] text-muted-foreground">
              Tổng số lô hàng: <strong className="text-foreground">{filteredData.length}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ADD Modal - Chứa 3 mục như thiết kế */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-ultra border border-border flex flex-col overflow-hidden dialog-slide-in">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground leading-tight">Giao Diện ADD (Thêm Mới)</h3>
                  <div className="text-[12px] text-muted-foreground flex items-center gap-2 mt-0.5">
                    <span>Date (Ngày mở): <input type="date" name="openDate" value={formData.openDate} onChange={handleInputChange} className="ml-1 bg-transparent border-b border-border outline-none focus:border-primary text-foreground" /></span>
                    <span className="w-1 h-1 rounded-full bg-border"></span>
                    <span>Mã dự kiến: <strong className="text-primary font-mono">{generateCode()}</strong></span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors focus:outline-none">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - 3 Columns */}
            <form onSubmit={handleAddSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-background/30">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Column 1: Customer Information */}
                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-primary/5 px-4 py-3 border-b border-border">
                    <h4 className="font-bold text-primary text-[14px]">Thông tin Khách hàng</h4>
                  </div>
                  <div className="p-4 space-y-4">
                    <FieldRow label="Mã KH" id="customerId" value={formData.customerId} onChange={handleInputChange} />
                    <FieldRow label="Tên doanh nghiệp" id="customerCompany" required value={formData.customerCompany} onChange={handleInputChange} />
                    <FieldRow label="Email" id="customerEmail" type="email" value={formData.customerEmail} onChange={handleInputChange} />
                    <FieldRow label="Số điện thoại" id="customerPhone" value={formData.customerPhone} onChange={handleInputChange} />
                    <FieldRow label="Địa chỉ" id="customerAddress" value={formData.customerAddress} onChange={handleInputChange} />
                    <FieldRow label="Mã số thuế" id="customerTaxCode" value={formData.customerTaxCode} onChange={handleInputChange} />
                  </div>
                </div>

                {/* Column 2: Supplier Information */}
                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-orange-500/5 px-4 py-3 border-b border-border">
                    <h4 className="font-bold text-orange-600 text-[14px]">Thông tin Nhà cung cấp</h4>
                  </div>
                  <div className="p-4 space-y-4">
                    <FieldRow label="Mã NCC" note="(3 kí tự)" id="supplierId" maxLength={3} value={formData.supplierId} onChange={handleInputChange} />
                    <FieldRow label="Tên doanh nghiệp" id="supplierCompany" required value={formData.supplierCompany} onChange={handleInputChange} />
                    <FieldRow label="Email" id="supplierEmail" type="email" value={formData.supplierEmail} onChange={handleInputChange} />
                    <FieldRow label="Số điện thoại" id="supplierPhone" value={formData.supplierPhone} onChange={handleInputChange} />
                    <FieldRow label="Địa chỉ" id="supplierAddress" value={formData.supplierAddress} onChange={handleInputChange} />
                    <FieldRow label="Mã số thuế" id="supplierTaxCode" value={formData.supplierTaxCode} onChange={handleInputChange} />
                  </div>
                </div>

                {/* Column 3: Shipment Information */}
                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-emerald-500/5 px-4 py-3 border-b border-border">
                    <h4 className="font-bold text-emerald-600 text-[14px]">Thông tin Lô hàng</h4>
                  </div>
                  <div className="p-4 space-y-4">
                    <FieldRow label="Tên hàng" placeholder="Nhập văn bản..." id="commodity" value={formData.commodity} onChange={handleInputChange} />
                    <FieldRow label="Mã HS" id="hsCode" type="number" placeholder="Nhập số..." value={formData.hsCode} onChange={handleInputChange} />
                    <FieldRow label="Khối lượng" id="quantity" type="number" step="0.01" placeholder="Số thập phân..." value={formData.quantity} onChange={handleInputChange} />
                    <FieldRow label="Quy cách đóng gói" id="packing" value={formData.packing} onChange={handleInputChange} />
                    <FieldRow label="Tên tàu & Chuyến" id="vesselVoyage" value={formData.vesselVoyage} onChange={handleInputChange} />
                    <FieldRow label="Điều kiện GH (Term)" id="term" value={formData.term} onChange={handleInputChange} />
                    
                    {/* Transportation Checkboxes */}
                    <div className="border border-border rounded-lg p-3 bg-muted/20">
                      <div className="text-[13px] font-medium text-foreground mb-2">Vận chuyển:</div>
                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                          <input type="checkbox" name="transportationAir" checked={formData.transportationAir} onChange={handleInputChange} className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer" />
                          Đường hàng không (Air)
                        </label>
                        <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                          <input type="checkbox" name="transportationSea" checked={formData.transportationSea} onChange={handleInputChange} className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer" />
                          Đường biển (Sea)
                        </label>
                      </div>
                    </div>

                    {/* Load Type Checkboxes (conditional styling to match generic mockup) */}
                    <div className="border border-border rounded-lg p-3 bg-muted/20">
                      <div className="text-[13px] font-medium text-foreground mb-2">Loại tải:</div>
                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                          <input type="checkbox" name="loadTypeFCL" checked={formData.loadTypeFCL} onChange={handleInputChange} className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer" />
                          FCL
                        </label>
                        <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                          <input type="checkbox" name="loadTypeLCL" checked={formData.loadTypeLCL} onChange={handleInputChange} className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer" />
                          LCL
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <FieldRow label="Cảng đi (POL)" id="pol" value={formData.pol} onChange={handleInputChange} vertical />
                      <FieldRow label="Cảng đến (POD)" id="pod" value={formData.pod} onChange={handleInputChange} vertical />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <FieldRow label="Ngày đi (ETD)" format="DD/MM/YYYY" id="etd" type="date" value={formData.etd} onChange={handleInputChange} vertical />
                      <FieldRow label="Ngày đến (ETA)" format="DD/MM/YYYY" id="eta" type="date" value={formData.eta} onChange={handleInputChange} vertical />
                    </div>

                  </div>
                </div>
                
              </div>
            </form>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-end gap-3">
              <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-border text-foreground text-[13px] font-medium rounded-lg hover:bg-muted transition-colors focus:outline-none">
                Hủy bỏ
              </button>
              <button onClick={handleAddSubmit} className="px-6 py-2 bg-primary text-primary-foreground text-[13px] font-medium rounded-lg hover:bg-primary/90 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50">
                Lưu lô hàng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for form rows to match detailed tracking sheet style
const FieldRow = ({ 
  label, note, placeholder, format, type = "text", vertical = false, id, value, onChange, required = false, maxLength, step
}: { 
  label: string, note?: string, placeholder?: string, format?: string, type?: string, vertical?: boolean,
  id: string, value: string, onChange: any, required?: boolean, maxLength?: number, step?: string
}) => {
  return (
    <div className={`flex ${vertical ? 'flex-col gap-1.5' : 'flex-col sm:flex-row sm:items-start'} gap-1`}>
      <label htmlFor={id} className={`text-[12px] font-medium text-foreground ${vertical ? 'w-full' : 'sm:w-[130px] shrink-0 pt-2'}`}>
        {label} {note && <span className="text-[10px] font-normal text-muted-foreground block">{note}</span>}
      </label>
      <div className="flex-1 w-full relative">
        <input 
          id={id}
          name={id}
          type={type} 
          required={required}
          maxLength={maxLength}
          step={step}
          value={value}
          onChange={onChange}
          className="w-full px-3 py-1.5 text-[13px] bg-card border border-border rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors placeholder:text-muted-foreground/40"
          placeholder={placeholder || "Nhập tay..."}
        />
        {format && <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none">{format}</div>}
      </div>
    </div>
  );
}

export default ShipmentManagementPage;
