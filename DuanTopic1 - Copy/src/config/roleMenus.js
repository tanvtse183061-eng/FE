// Role-based menu configuration
// Định nghĩa menu items cho từng user role

export const ROLE_NAMES = {
  ADMIN: "Quản trị viên",
  EVM_STAFF: "Nhân viên EVM",
  MANAGER: "Quản lý đại lý",
  STAFF: "Nhân viên đại lý"
};

// Menu items cho Admin (có đầy đủ quyền)
const adminMenuItems = [
  {
    id: "dashboard",
    label: "Tổng quan",
    icon: "faGrip",
    path: "dashboard",
    color: "text-secondary"
  },
  {
    id: "vehicle",
    label: "Truy vấn thông tin xe",
    icon: "faCar",
    color: "text-primary",
    children: [
      { id: "vehicle-brand", label: "Thương hiệu", path: "vehiclebrand" },
      { id: "vehicle-model", label: "Dòng xe", path: "vehiclemodel" },
      { id: "vehicle-variant", label: "Phiên bản", path: "vehiclevariant" },
      { id: "vehicle-color", label: "Màu sắc", path: "vehiclcolor" }
    ]
  },
  {
    id: "dealer",
    label: "Tạo Dealer",
    icon: "faUserPlus",
    path: "createdealer",
    color: "text-info"
  },
  {
    id: "usermanagement",
    label: "Quản lý tài khoản",
    icon: "faUserCog",
    path: "usermanagement",
    color: "text-primary"
  },
  {
    id: "warehouse",
    label: "Kho",
    icon: "faWarehouse",
    path: "warehouse",
    color: "text-info"
  },
  {
    id: "vehicleinventory",
    label: "Tồn kho xe",
    icon: "faBoxes",
    path: "vehicleinventory",
    color: "text-info"
  }
];

// Menu items cho EVM Staff (không có Dealer và UserManagement)
const evmStaffMenuItems = [
  {
    id: "dashboard",
    label: "Tổng quan",
    icon: "faGrip",
    path: "dashboard",
    color: "text-secondary"
  },
  {
    id: "vehicle",
    label: "Truy vấn thông tin xe",
    icon: "faCar",
    color: "text-primary",
    children: [
      { id: "vehicle-brand", label: "Thương hiệu", path: "vehiclebrand" },
      { id: "vehicle-model", label: "Dòng xe", path: "vehiclemodel" },
      { id: "vehicle-variant", label: "Phiên bản", path: "vehiclevariant" },
      { id: "vehicle-color", label: "Màu sắc", path: "vehiclcolor" }
    ]
  },
  {
    id: "warehouse",
    label: "Kho",
    icon: "faWarehouse",
    path: "warehouse",
    color: "text-info"
  },
  {
    id: "vehicleinventory",
    label: "Tồn kho xe",
    icon: "faBoxes",
    path: "vehicleinventory",
    color: "text-info"
  }
];

// Menu items cho Dealer Manager và Dealer Staff
const dealerMenuItems = [
  {
    id: "dashboard",
    label: "Tổng quan",
    icon: "faGrip",
    path: "dashboard",
    color: "text-secondary"
  },
  {
    id: "vehicle",
    label: "Truy vấn thông tin xe",
    icon: "faCar",
    color: "text-primary",
    children: [
      { id: "vehicle-brand", label: "Thương hiệu", path: "vehiclebrand", viewOnly: true },
      { id: "vehicle-model", label: "Dòng xe", path: "vehiclemodel", viewOnly: true },
      { id: "vehicle-variant", label: "Phiên bản", path: "vehiclevariant", viewOnly: true },
      { id: "vehicle-color", label: "Màu sắc", path: "vehiclcolor", viewOnly: true }
    ]
  },
  {
    id: "quotation",
    label: "Báo giá",
    icon: "faFileAlt",
    path: "quotation",
    color: "text-warning"
  },
  {
    id: "customer",
    label: "Khách hàng",
    icon: "faUsers",
    path: "customer",
    color: "text-success"
  },
  {
    id: "order",
    label: "Đơn hàng",
    icon: "faShoppingCart",
    path: "order",
    color: "text-purple"
  },
  {
    id: "contract",
    label: "Hợp Đồng",
    icon: "faFileAlt",
    path: "contract",
    color: "text-danger",
    disabled: true // Chưa có component
  },
  {
    id: "cardelivery",
    label: "Giao xe",
    icon: "faTruck",
    path: "cardelivery",
    color: "text-info"
  },
  {
    id: "paymentcustomer",
    label: "Thanh Toán",
    icon: "faMoneyCheckDollar",
    path: "paymentcustomer",
    color: "text-success"
  }
];

// Function để lấy menu items theo role
export const getMenuItemsByRole = (role) => {
  switch (role) {
    case "ADMIN":
      return adminMenuItems;
    case "EVM_STAFF":
      return evmStaffMenuItems;
    case "MANAGER":
    case "STAFF":
      return dealerMenuItems;
    default:
      return [];
  }
};

// Function để lấy role display name
export const getRoleDisplayName = (role) => {
  return ROLE_NAMES[role] || role;
};

// Function để check xem user có quyền truy cập route không
export const hasAccessToRoute = (role, routePath) => {
  const menuItems = getMenuItemsByRole(role);
  
  // Check trong menu items
  const hasAccess = menuItems.some(item => {
    if (item.path === routePath) return true;
    if (item.children) {
      return item.children.some(child => child.path === routePath);
    }
    return false;
  });
  
  return hasAccess;
};

