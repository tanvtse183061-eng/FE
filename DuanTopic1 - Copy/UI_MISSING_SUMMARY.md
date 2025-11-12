# TÓM TẮT CÁC UI CÒN THIẾU VÀ CẦN BỔ SUNG

## ✅ ĐÃ HOÀN THÀNH
1. **API Functions** - Đã bổ sung tất cả các API functions vào `API.js`:
   - `quotationAPI` - Báo giá khách hàng
   - `publicQuotationAPI` - Public API cho báo giá
   - `dealerOrderAPI` - Đơn hàng đại lý
   - `dealerQuotationAPI` - Báo giá đại lý
   - `dealerInvoiceAPI` - Hóa đơn đại lý
   - `dealerPaymentAPI` - Thanh toán đại lý
   - `appointmentAPI` - Lịch hẹn
   - `publicAppointmentAPI` - Public API cho lịch hẹn
   - `vehicleDeliveryAPI` - Giao hàng

## ❌ CÁC UI PAGES CÒN THIẾU

### 1. **Quotation Page** (Báo giá khách hàng)
- **Vị trí**: `Pages/Admin/Quotation.jsx`, `Pages/EVMStaff/Quotation.jsx`
- **Quyền**: EVM_STAFF, ADMIN
- **Chức năng**:
  - Xem danh sách báo giá
  - Tạo báo giá từ đơn hàng
  - Gửi báo giá cho khách hàng
  - Xem chi tiết báo giá
  - Cập nhật/xóa báo giá
- **API sử dụng**: `quotationAPI`
- **Menu**: Đã có trong `roleMenus.js` nhưng chưa có component

### 2. **DealerOrder Page** (Đơn hàng đại lý)
- **Vị trí**: `Pages/DealerManager/DealerOrder.jsx`, `Pages/EVMStaff/DealerOrder.jsx`, `Pages/Admin/DealerOrder.jsx`
- **Quyền**: DEALER_MANAGER (own), EVM_STAFF, ADMIN
- **Chức năng**:
  - Xem danh sách đơn hàng đại lý
  - Tạo đơn hàng đại lý (DEALER_MANAGER)
  - Duyệt/từ chối đơn hàng (EVM_STAFF, ADMIN)
  - Yêu cầu báo giá
  - Xem chi tiết đơn hàng
  - Cập nhật/hủy đơn hàng
- **API sử dụng**: `dealerOrderAPI`
- **Menu**: Cần thêm vào menu cho DEALER_MANAGER, EVM_STAFF, ADMIN

### 3. **DealerQuotation Page** (Báo giá đại lý)
- **Vị trí**: `Pages/DealerManager/DealerQuotation.jsx`, `Pages/EVMStaff/DealerQuotation.jsx`, `Pages/Admin/DealerQuotation.jsx`
- **Quyền**: DEALER_MANAGER (own), EVM_STAFF, ADMIN
- **Chức năng**:
  - Xem danh sách báo giá đại lý
  - Tạo báo giá từ đơn hàng (EVM_STAFF, ADMIN)
  - Gửi báo giá (EVM_STAFF, ADMIN)
  - Chấp nhận/từ chối báo giá (DEALER_MANAGER)
  - Xem chi tiết báo giá
- **API sử dụng**: `dealerQuotationAPI`
- **Menu**: Cần thêm vào menu

### 4. **DealerInvoice Page** (Hóa đơn đại lý)
- **Vị trí**: `Pages/DealerManager/DealerInvoice.jsx`, `Pages/EVMStaff/DealerInvoice.jsx`, `Pages/Admin/DealerInvoice.jsx`
- **Quyền**: DEALER_MANAGER (own), EVM_STAFF, ADMIN
- **Chức năng**:
  - Xem danh sách hóa đơn
  - Xem chi tiết hóa đơn
  - Tạo hóa đơn (tự động khi accept quotation)
  - Cập nhật trạng thái hóa đơn
- **API sử dụng**: `dealerInvoiceAPI`
- **Menu**: Cần thêm vào menu

### 5. **DealerPayment Page** (Thanh toán đại lý)
- **Vị trí**: `Pages/DealerManager/DealerPayment.jsx`, `Pages/Admin/DealerPayment.jsx`
- **Quyền**: DEALER_MANAGER (own), ADMIN
- **Chức năng**:
  - Xem danh sách thanh toán
  - Thanh toán hóa đơn (process payment)
  - Xem chi tiết thanh toán
  - Cập nhật trạng thái thanh toán
- **API sử dụng**: `dealerPaymentAPI`
- **Menu**: Cần thêm vào menu

### 6. **Appointment Page** (Lịch hẹn)
- **Vị trí**: `Pages/EVMStaff/Appointment.jsx`, `Pages/Admin/Appointment.jsx`
- **Quyền**: EVM_STAFF, ADMIN (quản lý), PUBLIC (đặt lịch)
- **Chức năng**:
  - Xem danh sách lịch hẹn
  - Xác nhận lịch hẹn (EVM_STAFF)
  - Hoàn tất lịch hẹn (EVM_STAFF)
  - Hủy/đổi lịch
  - Xem chi tiết lịch hẹn
- **API sử dụng**: `appointmentAPI`, `publicAppointmentAPI`
- **Menu**: Cần thêm vào menu cho EVM_STAFF, ADMIN

### 7. **SalesContract Page** (Hợp đồng bán hàng)
- **Vị trí**: `Pages/EVMStaff/SalesContract.jsx`, `Pages/Admin/SalesContract.jsx`
- **Quyền**: EVM_STAFF, ADMIN
- **Chức năng**:
  - Xem danh sách hợp đồng
  - Tạo hợp đồng từ đơn hàng
  - Gửi hợp đồng cho khách hàng
  - Xem chi tiết hợp đồng
  - Cập nhật trạng thái hợp đồng
- **API sử dụng**: `salesContractAPI` (đã có trong API.js)
- **Menu**: Cần thêm vào menu

### 8. **DealerContract Page** (Hợp đồng đại lý)
- **Vị trí**: `Pages/DealerManager/DealerContract.jsx`, `Pages/EVMStaff/DealerContract.jsx`, `Pages/Admin/DealerContract.jsx`
- **Quyền**: DEALER_MANAGER (own), EVM_STAFF, ADMIN
- **Chức năng**:
  - Xem danh sách hợp đồng đại lý
  - Tạo hợp đồng đại lý (EVM_STAFF, ADMIN)
  - Ký hợp đồng (DEALER_MANAGER)
  - Xem chi tiết hợp đồng
  - Cập nhật trạng thái hợp đồng
- **API sử dụng**: `dealerContractAPI` (đã có trong API.js)
- **Menu**: Cần thêm vào menu

### 9. **DealerTarget Page** (Mục tiêu đại lý)
- **Vị trí**: `Pages/DealerManager/DealerTarget.jsx`, `Pages/EVMStaff/DealerTarget.jsx`, `Pages/Admin/DealerTarget.jsx`
- **Quyền**: DEALER_MANAGER (own), EVM_STAFF, ADMIN
- **Chức năng**:
  - Xem danh sách mục tiêu
  - Tạo mục tiêu (EVM_STAFF, ADMIN)
  - Xem hiệu suất mục tiêu
  - Cập nhật mục tiêu
- **API sử dụng**: `dealerTargetAPI` (đã có trong API.js)
- **Menu**: Cần thêm vào menu

### 10. **InstallmentPlan Page** (Kế hoạch trả góp)
- **Vị trí**: `Pages/EVMStaff/InstallmentPlan.jsx`, `Pages/Admin/InstallmentPlan.jsx`
- **Quyền**: EVM_STAFF, ADMIN
- **Chức năng**:
  - Xem danh sách kế hoạch trả góp
  - Tạo kế hoạch trả góp
  - Xem lịch trả góp
  - Cập nhật trạng thái
- **API sử dụng**: `installmentPlanAPI`, `installmentScheduleAPI` (đã có trong API.js)
- **Menu**: Cần thêm vào menu

## 📋 CẦN CẬP NHẬT

### 1. **App.jsx** - Thêm routes cho các pages mới
### 2. **roleMenus.js** - Thêm menu items cho các pages mới
### 3. **Tạo các component pages** - Tạo các file .jsx cho từng page

## 🎯 ƯU TIÊN THỰC HIỆN

### Phase 1 (Quan trọng nhất - Luồng chính):
1. **Quotation Page** - Cần cho luồng khách hàng mua xe
2. **DealerOrder Page** - Cần cho luồng đại lý đặt xe
3. **DealerQuotation Page** - Cần cho luồng đại lý đặt xe
4. **DealerInvoice Page** - Cần cho luồng đại lý đặt xe
5. **DealerPayment Page** - Cần cho luồng đại lý đặt xe

### Phase 2 (Hỗ trợ):
6. **Appointment Page** - Quản lý lịch hẹn
7. **SalesContract Page** - Hợp đồng bán hàng
8. **DealerContract Page** - Hợp đồng đại lý

### Phase 3 (Bổ sung):
9. **DealerTarget Page** - Mục tiêu đại lý
10. **InstallmentPlan Page** - Kế hoạch trả góp

## 📝 LƯU Ý

- Tất cả các API functions đã được bổ sung vào `API.js`
- Cần kiểm tra và đảm bảo các API endpoints khớp với Backend
- Cần implement phân quyền đúng cho từng page (DEALER_MANAGER chỉ xem được data của dealer mình)
- Cần thêm routes vào `App.jsx` và menu items vào `roleMenus.js`

