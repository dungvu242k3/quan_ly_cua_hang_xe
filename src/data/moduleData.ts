import {
  ArrowLeftRight,
  Calendar, ClipboardList,
  ShoppingCart,
  Users,
  Wallet,
  Wrench
} from 'lucide-react';
import type { ModuleCardProps } from '../components/ui/ModuleCard';

// Comprehensive mock data for module pages to match the Quản lý chuỗi cửa hàng sửa xe precisely
export const moduleData: Record<string, { section: string; items: ModuleCardProps[] }[]> = {
  '/ban-hang': [
    {
      section: 'Quản lý bán hàng',
      items: [
        { icon: Users, title: 'Khách hàng', description: 'Quản lý danh sách và thông tin khách hàng.', colorScheme: 'blue', path: '/ban-hang/khach-hang' },
        { icon: ShoppingCart, title: 'Bán hàng', description: 'Lập hóa đơn và quản lý giao dịch bán hàng.', colorScheme: 'green', path: '/ban-hang/phieu-ban-hang' },
        { icon: Wallet, title: 'Thu chi', description: 'Quản lý thu chi, dòng tiền và chứng từ tài chính.', colorScheme: 'orange', path: '/ban-hang/thu-chi' },
        { icon: Wrench, title: 'Dịch vụ', description: 'Quản lý các gói dịch vụ và tiến độ sửa chữa.', colorScheme: 'purple', path: '/ban-hang/dich-vu' }
      ]
    }
  ],
  '/nhan-su': [
    {
      section: 'Quản lý nhân sự',
      items: [
        { icon: Users, title: 'Nhân sự', description: 'Quản lý danh sách nhân viên, vị trí và cơ sở làm việc.', colorScheme: 'emerald', path: '/nhan-su/ung-vien' },
        { icon: Calendar, title: 'Chấm công', description: 'Thực hiện chấm công hàng ngày cho nhân viên.', colorScheme: 'blue' },
        { icon: ClipboardList, title: 'Bảng chấm công', description: 'Xem và tổng hợp dữ liệu chấm công theo tháng.', colorScheme: 'orange', path: '/nhan-su/bang-cham-cong' }
      ]
    }
  ],
  '/kho-van': [
    {
      section: 'Quản lý kho',
      items: [
        { icon: ArrowLeftRight, title: 'Xuất nhập kho', description: 'Quản lý các hoạt động nhập hàng vào kho và xuất hàng ra khỏi kho.', colorScheme: 'teal', path: '/kho-van/xuat-nhap-kho' }
      ]
    }
  ],
};
