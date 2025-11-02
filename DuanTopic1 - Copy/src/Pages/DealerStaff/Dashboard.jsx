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
import API from '../Login/API';

export default function Dashboard() {
  const [orderCount, setOrderCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [statusOrder, setStatusOrder] = useState(0);
  const [recentOrder, setRecentOrder] = useState([]);
  const [selectedAction, setSelectedAction] = useState(null);

  // ----------------------Form Báo Giá-------------------------//
  const [quotationForm, setQuotationForm] = useState({
    quotationNumber: '',
    customerId: '',
    userId: '',
    totalAmount: '',
  });

  // errors chung cho cả 2 form (key theo field)
  const [errors, setErrors] = useState({});

  // ----------------------Form Khách Hàng-------------------------//
  const [Customer, setCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    preferredContactMethod: '', // 'Email' hoặc 'Phone'
    notes: '',
  });

  // ------------------ API Calls (giữ như trước) ------------------
  useEffect(() => {
    const fetchCustomerCount = async () => {
      try {
        const res = await API.get('/api/customers');
        setCustomerCount(res.data.length);
      } catch (err) {
        console.error('Lỗi khi lấy khách hàng:', err);
      }
    };
    fetchCustomerCount();
  }, []);

  useEffect(() => {
    const fetchOrderCount = async () => {
      try {
        const res = await API.get('/api/orders');
        setOrderCount(res.data.length);
      } catch (err) {
        console.error('Lỗi khi lấy đơn hàng:', err);
      }
    };
    fetchOrderCount();
  }, []);

  useEffect(() => {
    const fetchVehicleCount = async () => {
      try {
        const res = await API.get('/api/warehouses');
        setVehicleCount(res.data.length);
      } catch (err) {
        console.error('Lỗi khi lấy xe:', err);
      }
    };
    fetchVehicleCount();
  }, []);

  useEffect(() => {
    const fetchStatusOrder = async () => {
      try {
        const res = await API.get('/api/orders/status/PENDING');
        setStatusOrder(res.data.length);
      } catch (err) {
        console.error('Lỗi khi xử lý trạng thái đơn hàng:', err);
      }
    };
    fetchStatusOrder();
  }, []);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const res = await API.get('/api/orders');
        if (res.data && res.data.length > 0) {
          const recent = res.data.sort((a, b) => b.id - a.id).slice(0, 2);
          setRecentOrder(recent);
        }
      } catch (err) {
        console.error('Lỗi khi lấy đơn hàng gần đây:', err);
      }
    };
    fetchRecentOrders();
  }, []);

  // ------------------ Validate Báo Giá ------------------
  const validateQuotationForm = () => {
    const newErrors = {};
    if (!quotationForm.quotationNumber.trim()) {
      newErrors.quotationNumber = 'Số báo giá không được để trống';
    }
    if (!quotationForm.customerId.trim()) {
      newErrors.customerId = 'ID khách hàng không được để trống';
    }
    if (!quotationForm.userId.trim()) {
      newErrors.userId = 'ID nhân viên không được để trống';
    }
    if (!quotationForm.totalAmount.trim()) {
      newErrors.totalAmount = 'Tổng tiền không được để trống';
    } else if (isNaN(quotationForm.totalAmount)) {
      newErrors.totalAmount = 'Tổng tiền phải là số';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ------------------ Submit Báo Giá ------------------
  const handleChange = (e) => {
    setQuotationForm({ ...quotationForm, [e.target.name]: e.target.value });
  };

  const handleSubmitQuotation = async (e) => {
    e.preventDefault();
    if (!validateQuotationForm()) return;
    try {
      const res = await API.post('/api/quotations', quotationForm);
      alert('Tạo báo giá thành công: ' + res.data.quotationNumber);
      setSelectedAction(null);
      setQuotationForm({
        quotationNumber: '',
        customerId: '',
        userId: '',
        totalAmount: '',
      });
      setErrors({});
    } catch (err) {
      alert('Lỗi khi tạo báo giá!');
      console.error(err);
    }
  };

  // ------------------ Validate Khách Hàng ------------------
  const validateCustomerForm = () => {
    const newErrors = {};

    // required
    if (!Customer.firstName.trim()) {
      newErrors.firstName = 'Họ không được để trống';
    }
    if (!Customer.lastName.trim()) {
      newErrors.lastName = 'Tên không được để trống';
    }

    // email: basic regex
    if (!Customer.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(Customer.email.trim())) {
        newErrors.email = 'Email không hợp lệ';
      }
    }

    // phone: chỉ số, độ dài tối thiểu 7 tối đa 15
    if (!Customer.phone.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống';
    } else {
      const phoneOnly = Customer.phone.replace(/\s+/g, '');
      if (!/^\+?\d{7,15}$/.test(phoneOnly)) {
        newErrors.phone = 'Số điện thoại chỉ chứa chữ số (7-15 ký tự), có thể bắt đầu bằng +';
      }
    }

    // city required
    if (!Customer.city.trim()) {
      newErrors.city = 'Thành phố không được để trống';
    }

    // postalCode nếu có thì phải là số
    if (Customer.postalCode && Customer.postalCode.trim()) {
      if (!/^\d+$/.test(Customer.postalCode.trim())) {
        newErrors.postalCode = 'Mã bưu điện phải là số';
      }
    }

    // preferredContactMethod: nếu có thì chỉ 'Email' hoặc 'Phone'
    if (Customer.preferredContactMethod && Customer.preferredContactMethod.trim()) {
      const val = Customer.preferredContactMethod.trim().toLowerCase();
      if (val !== 'email' && val !== 'phone' && val !== 'sms') {
        newErrors.preferredContactMethod = 'Phương thức liên hệ phải là Email, Phone hoặc SMS';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ------------------ Submit Khách Hàng ------------------
  const handleCustomerChange = (e) => {
    setCustomer({ ...Customer, [e.target.name]: e.target.value });
  };

  const handleSubmitCustomer = async (e) => {
    e.preventDefault();
    if (!validateCustomerForm()) return;
    try {
      const res = await API.post('/api/customers', Customer);
      alert('Thêm khách hàng thành công!');
      setSelectedAction(null);
      setCustomer({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        preferredContactMethod: '',
        notes: '',
      });
      setErrors({});
      // cập nhật lại số lượng khách hàng (nếu muốn)
      try {
        const r2 = await API.get('/api/customers');
        setCustomerCount(r2.data.length);
      } catch (_) {}
    } catch (err) {
      console.error('Lỗi khi thêm khách hàng:', err);
      alert('Thêm khách hàng thất bại!');
    }
  };

  // ------------------ Dữ liệu hiển thị ------------------
  const lists = [
    { id: 1, icon: faCartShopping, color: '#3b82f6', bg: '#e0ecff', title: 'Tổng đơn hàng', number: orderCount },
    { id: 2, icon: faUser, color: '#16a34a', bg: '#dcfce7', title: 'Khách hàng', number: customerCount },
    { id: 3, icon: faCar, color: '#9333ea', bg: '#f3e8ff', title: 'Xe trong kho', number: vehicleCount },
    { id: 4, icon: faMoneyBill, color: '#f59e0b', bg: '#fef3c7', title: 'Doanh thu', number: '0.0M VNĐ' },
  ];

  const actions = [
    { icon: faFileInvoice, color: '#3b82f6', bg: '#e0ecff', border: '#3b82f6', title: 'Tạo báo giá mới', desc: 'Tạo báo giá cho khách hàng' },
    { icon: faUserPlus, color: '#16a34a', bg: '#dcfce7', border: '#16a34a', title: 'Thêm khách hàng', desc: 'Đăng ký khách hàng mới' },
    { icon: faBoxesStacked, color: '#9333ea', bg: '#f3e8ff', border: '#9333ea', title: 'Quản lý kho', desc: 'Kiểm tra tồn kho xe' },
    { icon: faChartLine, color: '#f59e0b', bg: '#fef3c7', border: '#f59e0b', title: 'Xem báo cáo', desc: 'Báo cáo doanh số và hiệu suất' },
  ];

  // ------------------ JSX ------------------
  return (
    <>
      <div className="Dashboard">
        <div className="dashboardf">
          <h1 style={{ position: 'relative', left: '50px' }}>Dashboard</h1>
          <div className="dashboard-list">
            {lists.map((list) => (
              <div key={list.id} className="dash">
                <div className="icon-box" style={{ background: list.bg, color: list.color }}>
                  <FontAwesomeIcon icon={list.icon} size="lg" />
                </div>
                <div className="number">{list.number}</div>
                <div className="title">{list.title}</div>
              </div>
            ))}
          </div>
        </div>

        <h3 style={{ position: 'relative', top: '150px', left: '30px' }}>Thông báo quan trọng</h3>
        <div className="important-notice">
          <a><FontAwesomeIcon icon={faCircleExclamation} color="red" /> {statusOrder} đơn hàng đang chờ xử lý</a>
        </div>

        <h3 style={{ position: 'relative', top: '200px', left: '30px' }}>Thao tác nhanh</h3>
        <div className="quick-container">
          <div className="quick-list">
            {actions.map((a, i) => (
              <div
                className="quick-card"
                key={i}
                style={{ borderLeft: `4px solid ${a.border}` }}
                onClick={() => {
                  // khi mở popup nên reset errors để không hiện lỗi cũ
                  setErrors({});
                  setSelectedAction(selectedAction === a.title ? null : a.title);
                }}
              >
                <div className="quick-icon" style={{ background: a.bg, color: a.color }}>
                  <FontAwesomeIcon icon={a.icon} size="lg" />
                </div>
                <div>
                  <h4 className="quick-title">{a.title}</h4>
                  <p className="quick-desc">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hoatdong">
          <h3>Hoạt động gần đây</h3>
          {recentOrder.length > 0 ? (
            <ul className="gan">
              {recentOrder.map((o) => (
                <li key={o.orderId}>Đơn #{o.orderNumber} - {o.status}</li>
              ))}
            </ul>
          ) : (
            <p>Không có đơn hàng gần đây</p>
          )}
        </div>
      </div>

      {/* Popup hành động */}
      {selectedAction && (
        <div
          className="overlay"
          onClick={() => {
            setSelectedAction(null);
            setQuotationForm({
              quotationNumber: '',
              customerId: '',
              userId: '',
              totalAmount: '',
            });
            setCustomer({
              firstName: '',
              lastName: '',
              email: '',
              phone: '',
              address: '',
              city: '',
              postalCode: '',
              preferredContactMethod: '',
              notes: '',
            });
            setErrors({});
          }}
        >
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ textAlign: 'center' }}>{selectedAction}</h3>

            {/* ---- FORM TẠO BÁO GIÁ ---- */}
            {selectedAction === 'Tạo báo giá mới' && (
              <form onSubmit={handleSubmitQuotation}>
                <input name="quotationNumber" placeholder="Số báo giá" value={quotationForm.quotationNumber} onChange={handleChange} />
                {errors.quotationNumber && <p style={{ color: 'red' }}>{errors.quotationNumber}</p>}

                <input name="customerId" placeholder="ID khách hàng" value={quotationForm.customerId} onChange={handleChange} />
                {errors.customerId && <p style={{ color: 'red' }}>{errors.customerId}</p>}

                <input name="userId" placeholder="ID nhân viên" value={quotationForm.userId} onChange={handleChange} />
                {errors.userId && <p style={{ color: 'red' }}>{errors.userId}</p>}

                <input name="totalAmount" placeholder="Tổng tiền" value={quotationForm.totalAmount} onChange={handleChange} />
                {errors.totalAmount && <p style={{ color: 'red' }}>{errors.totalAmount}</p>}

                <div className="form-actions">
                  <button type="submit">Tạo</button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAction(null);
                      setQuotationForm({
                        quotationNumber: '',
                        customerId: '',
                        userId: '',
                        totalAmount: '',
                      });
                      setErrors({});
                    }}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            )}

            {/* ---- FORM THÊM KHÁCH HÀNG ---- */}
            {selectedAction === 'Thêm khách hàng' && (
              <form onSubmit={handleSubmitCustomer}>
                <input name="firstName" placeholder="Họ" value={Customer.firstName} onChange={handleCustomerChange} />
                {errors.firstName && <p style={{ color: 'red' }}>{errors.firstName}</p>}

                <input name="lastName" placeholder="Tên" value={Customer.lastName} onChange={handleCustomerChange} />
                {errors.lastName && <p style={{ color: 'red' }}>{errors.lastName}</p>}

                <input name="email" placeholder="Email" value={Customer.email} onChange={handleCustomerChange} />
                {errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}

                <input name="phone" placeholder="Số điện thoại" value={Customer.phone} onChange={handleCustomerChange} />
                {errors.phone && <p style={{ color: 'red' }}>{errors.phone}</p>}

                <input name="address" placeholder="Địa chỉ" value={Customer.address} onChange={handleCustomerChange} />
                {/* address không required */}

                <input name="city" placeholder="Thành phố" value={Customer.city} onChange={handleCustomerChange} />
                {errors.city && <p style={{ color: 'red' }}>{errors.city}</p>}

                <input name="postalCode" placeholder="Mã bưu điện" value={Customer.postalCode} onChange={handleCustomerChange} />
                {errors.postalCode && <p style={{ color: 'red' }}>{errors.postalCode}</p>}

                <input name="preferredContactMethod" placeholder="Phương thức liên hệ (Email / Phone / SMS)" value={Customer.preferredContactMethod} onChange={handleCustomerChange} />
                {errors.preferredContactMethod && <p style={{ color: 'red' }}>{errors.preferredContactMethod}</p>}

                <textarea
                  name="notes"
                  placeholder="Ghi chú thêm"
                  value={Customer.notes}
                  onChange={handleCustomerChange}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    marginBottom: '14px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    fontSize: '14px',
                    resize: 'none',
                    color:'black'
                  }}
                />
                <div className="form-actions">
                  <button type="submit">Tạo</button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAction(null);
                      setCustomer({
                        firstName: '',
                        lastName: '',
                        email: '',
                        phone: '',
                        address: '',
                        city: '',
                        postalCode: '',
                        preferredContactMethod: '',
                        notes: '',
                      });
                      setErrors({});
                    }}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            )}

            {selectedAction === 'Quản lý kho' && <p>Đây là phần xem tổng kho</p>}
            {selectedAction === 'Xem báo cáo' && <p>Đây là phần xem doanh số</p>}
          </div>
        </div>
      )}
    </>
  );
}
