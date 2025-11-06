// Dashboard.jsx
import './Dashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCartShopping,
  faUser,
  faCar,
  faMoneyBill,
  faCircleExclamation,
  faFileInvoice,
  faUserPlus,
  faBoxesStacked,
  faChartLine,
} from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import {
  customerAPI,
  orderAPI,
  warehouseAPI,
} from "../../services/API.js"; 

export default function Dashboard() {
  // ------------------ STATE ------------------
  const [orderCount, setOrderCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [selectedAction, setSelectedAction] = useState(null);
  const [errors, setErrors] = useState({});

  // Form báo giá
  const [quotation, setQuotation] = useState({
    quotationNumber: '',
    customerId: '',
    userId: '',
    totalAmount: '',
  });

  // Form khách hàng (đầy đủ giống Customer.jsx)
  const [customer, setCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    preferredContactMethod: '',
    creditScore: 750,
    notes: '',
  });

  // ------------------ FETCH DATA ------------------
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [orders, customers, warehouses] = await Promise.all([
          orderAPI.getOrders(),
          customerAPI.getCustomers(),
          warehouseAPI.getWarehouses(),
        ]);

        setOrderCount(orders.data.length);
        setCustomerCount(customers.data.length);
        setVehicleCount(warehouses.data.length);

        const pending = orders.data.filter(o => o.status === 'PENDING');
        setPendingCount(pending.length);

        const recent = orders.data.sort((a, b) => b.id - a.id).slice(0, 2);
        setRecentOrders(recent);
      } catch (err) {
        console.error('❌ Lỗi khi tải dữ liệu dashboard:', err);
      }
    };

    fetchAll();
  }, []);

  // ------------------ VALIDATE ------------------
  const validateCustomer = () => {
    const e = {};
    if (!customer.firstName.trim()) e.firstName = 'Họ không được trống';
    if (!customer.lastName.trim()) e.lastName = 'Tên không được trống';
    if (!customer.email.trim()) e.email = 'Email bắt buộc';
    if (!customer.phone.trim()) e.phone = 'SĐT bắt buộc';
    if (!customer.city.trim()) e.city = 'Thành phố bắt buộc';
    if (!customer.province.trim()) e.province = 'Tỉnh bắt buộc';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ------------------ HANDLE SUBMIT ------------------
  const handleSubmitCustomer = async (e) => {
    e.preventDefault();
    if (!validateCustomer()) return;
    try {
      await customerAPI.createCustomer(customer);
      alert('✅ Thêm khách hàng thành công!');
      setSelectedAction(null);
      setCustomer({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        address: '',
        city: '',
        province: '',
        postalCode: '',
        preferredContactMethod: '',
        creditScore: 750,
        notes: '',
      });

      // 🔄 Gửi event cho trang Customer.jsx reload danh sách
      window.dispatchEvent(new Event("customerAdded"));
    } catch (err) {
      console.error('❌ Lỗi thêm khách hàng:', err);
      alert('Thêm khách hàng thất bại!');
    }
  };

  const handleSubmitQuotation = async (e) => {
    e.preventDefault();
    if (!quotation.quotationNumber || !quotation.customerId || !quotation.userId || !quotation.totalAmount) {
      alert('Vui lòng nhập đầy đủ thông tin báo giá!');
      return;
    }
    try {
      await orderAPI.createOrder(quotation);
      alert('✅ Tạo báo giá thành công!');
      setSelectedAction(null);
      setQuotation({
        quotationNumber: '',
        customerId: '',
        userId: '',
        totalAmount: '',
      });
    } catch (err) {
      console.error('❌ Lỗi tạo báo giá:', err);
      alert('Tạo báo giá thất bại!');
    }
  };

  // ------------------ DASHBOARD CARDS ------------------
  const statsList = [
    { id: 1, icon: faCartShopping, color: '#3b82f6', bg: '#e0ecff', title: 'Đơn hàng', value: orderCount },
    { id: 2, icon: faUser, color: '#16a34a', bg: '#dcfce7', title: 'Khách hàng', value: customerCount },
    { id: 3, icon: faCar, color: '#9333ea', bg: '#f3e8ff', title: 'Xe trong kho', value: vehicleCount },
    { id: 4, icon: faMoneyBill, color: '#f59e0b', bg: '#fef3c7', title: 'Doanh thu', value: '0.0M VNĐ' },
  ];

  const quickActions = [
    { icon: faFileInvoice, color: '#3b82f6', bg: '#e0ecff', title: 'Tạo báo giá mới' },
    { icon: faUserPlus, color: '#16a34a', bg: '#dcfce7', title: 'Thêm khách hàng' },
    { icon: faBoxesStacked, color: '#9333ea', bg: '#f3e8ff', title: 'Quản lý kho' },
    { icon: faChartLine, color: '#f59e0b', bg: '#fef3c7', title: 'Xem báo cáo' },
  ];

  // ------------------ JSX ------------------
  return (
    <>
      <div className="Dashboard">
        <h1>Dashboard</h1>

        {/* Cards */}
        <div className="dashboard-list">
          {statsList.map((item) => (
            <div key={item.id} className="dash">
              <div className="icon-box" style={{ background: item.bg, color: item.color }}>
                <FontAwesomeIcon icon={item.icon} />
              </div>
              <div className="number">{item.value}</div>
              <div className="title">{item.title}</div>
            </div>
          ))}
        </div>

        {/* Notice */}
        <div className="important-notice">
          <FontAwesomeIcon icon={faCircleExclamation} color="red" /> {pendingCount} đơn hàng đang chờ xử lý
        </div>

        {/* Quick actions */}
        <h3>Thao tác nhanh</h3>
        <div className="quick-list">
          {quickActions.map((a) => (
            <div
              key={a.title}
              className="quick-card"
              onClick={() => {
                setErrors({});
                setSelectedAction(selectedAction === a.title ? null : a.title);
              }}
              style={{ borderLeft: `4px solid ${a.color}` }}
            >
              <div className="quick-icon" style={{ background: a.bg, color: a.color }}>
                <FontAwesomeIcon icon={a.icon} />
              </div>
              <div>
                <h4>{a.title}</h4>
              </div>
            </div>
          ))}
        </div>

        {/* Recent orders */}
        <div className="recent-orders">
          <h3>Hoạt động gần đây</h3>
          {recentOrders.length > 0 ? (
            <ul>
              {recentOrders.map((o) => (
                <li key={o.orderId}>Đơn #{o.orderNumber} - {o.status}</li>
              ))}
            </ul>
          ) : (
            <p>Không có đơn hàng gần đây</p>
          )}
        </div>
      </div>

      {/* POPUP */}
      {selectedAction && (
        <div className="overlay" onClick={() => setSelectedAction(null)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedAction}</h3>

            {/* Form báo giá */}
            {selectedAction === 'Tạo báo giá mới' && (
              <form onSubmit={handleSubmitQuotation}>
                <input name="quotationNumber" placeholder="Số báo giá" value={quotation.quotationNumber} onChange={(e) => setQuotation({ ...quotation, quotationNumber: e.target.value })} />
                <input name="customerId" placeholder="ID khách hàng" value={quotation.customerId} onChange={(e) => setQuotation({ ...quotation, customerId: e.target.value })} />
                <input name="userId" placeholder="ID nhân viên" value={quotation.userId} onChange={(e) => setQuotation({ ...quotation, userId: e.target.value })} />
                <input name="totalAmount" placeholder="Tổng tiền" value={quotation.totalAmount} onChange={(e) => setQuotation({ ...quotation, totalAmount: e.target.value })} />
                <div className="form-actions">
                  <button type="submit">Tạo</button>
                  <button type="button" onClick={() => setSelectedAction(null)}>Hủy</button>
                </div>
              </form>
            )}

            {/* Form khách hàng */}
            {selectedAction === 'Thêm khách hàng' && (
              <form onSubmit={handleSubmitCustomer}>
                <input name="firstName" placeholder="Họ" value={customer.firstName} onChange={(e) => setCustomer({ ...customer, firstName: e.target.value })} />
                <input name="lastName" placeholder="Tên" value={customer.lastName} onChange={(e) => setCustomer({ ...customer, lastName: e.target.value })} />
                <input type="email" name="email" placeholder="Email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />
                <input name="phone" placeholder="Số điện thoại" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
                <input type="date" name="dateOfBirth" value={customer.dateOfBirth} onChange={(e) => setCustomer({ ...customer, dateOfBirth: e.target.value })} />
                <input name="address" placeholder="Địa chỉ" value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} />
                <input name="city" placeholder="Thành phố" value={customer.city} onChange={(e) => setCustomer({ ...customer, city: e.target.value })} />
                <input name="province" placeholder="Tỉnh" value={customer.province} onChange={(e) => setCustomer({ ...customer, province: e.target.value })} />
                <input name="postalCode" placeholder="Mã bưu điện" value={customer.postalCode} onChange={(e) => setCustomer({ ...customer, postalCode: e.target.value })} />
                <select name="preferredContactMethod" value={customer.preferredContactMethod} onChange={(e) => setCustomer({ ...customer, preferredContactMethod: e.target.value })}>
                  <option value="">-- Liên hệ qua --</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="phone">Điện thoại</option>
                </select>
                <input type="number" name="creditScore" placeholder="Điểm tín dụng" value={customer.creditScore} onChange={(e) => setCustomer({ ...customer, creditScore: e.target.value })} />
                <textarea name="notes" placeholder="Ghi chú" value={customer.notes} onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}></textarea>

                <div className="form-actions">
                  <button type="submit">Tạo</button>
                  <button type="button" onClick={() => setSelectedAction(null)}>Hủy</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
