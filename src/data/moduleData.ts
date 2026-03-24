import {
  Calendar, ClipboardList, 
  Wrench,
  Users, ShoppingCart, 
  Wallet, ArrowLeftRight
} from 'lucide-react';
import type { ModuleCardProps } from '../components/ui/ModuleCard';

// Comprehensive mock data for module pages to match the Quản lý chuỗi cửa hàng sửa xe precisely
export const moduleData: Record<string, { section: string; items: ModuleCardProps[] }[]> = {
  '/hanh-chinh': [
    {
      section: 'Quản lý bán hàng',
      items: [
        { icon: Users, title: 'Khách hàng', description: 'Quản lý danh sách và thông tin khách hàng.', colorScheme: 'blue', path: '/ban-hang/khach-hang' },
        { icon: ShoppingCart, title: 'Bán hàng', description: 'Lập hóa đơn và quản lý giao dịch bán hàng.', colorScheme: 'green' },
        { icon: Wallet, title: 'Thu chi', description: 'Theo dõi các khoản thu và chi tiết tài chính.', colorScheme: 'orange' },
        { icon: Wrench, title: 'Dịch vụ', description: 'Quản lý các gói dịch vụ và tiến độ sửa chữa.', colorScheme: 'purple' }
      ]
    }
  ],
  '/nhan-su': [
    {
      section: 'Quản lý nhân sự',
      items: [
        { icon: Users, title: 'Nhân sự', description: 'Quản lý hồ sơ, thông tin nhân viên trong hệ thống.', colorScheme: 'emerald', path: '/nhan-su/ung-vien' },
        { icon: Calendar, title: 'Chấm công', description: 'Thực hiện chấm công hàng ngày cho nhân viên.', colorScheme: 'blue' },
        { icon: ClipboardList, title: 'Bảng chấm công', description: 'Xem và tổng hợp dữ liệu chấm công theo tháng.', colorScheme: 'orange' }
      ]
    }
  ],
  '/kho-van': [
    {
      section: 'Quản lý kho',
      items: [
        { icon: ArrowLeftRight, title: 'Xuất nhập kho', description: 'Quản lý các hoạt động nhập hàng vào kho và xuất hàng ra khỏi kho.', colorScheme: 'teal' }
      ]
    }
  ],
};
