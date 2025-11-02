import './Customer.css';
import { FaSearch, FaEye, FaPen, FaTrash } from "react-icons/fa";
import { useEffect, useState } from "react";
import API from '../Login/API';

export default function Customer() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [errors, setErrors] = useState({});
  
  const [customerForm, setCustomerForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    preferredContactMethod: "",
    notes: ""
  });

  // Lấy danh sách khách hàng
  const fetchCustomers = async () => {
    try {
      const res = await API.get("/api/customers");
      setCustomers(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy khách hàng:", err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Xoá khách hàng
  const handleDelete = async (customerId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khách hàng này không?")) return;
    try {
      await API.delete(`/api/customers/${customerId}`);
      alert("Xóa khách hàng thành công!");
      fetchCustomers();
    } catch (err) {
      console.error("Lỗi khi xóa khách hàng:", err);
      alert("Xóa thất bại!");
    }
  };

  // Tìm kiếm khách hàng
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      const trimmed = searchTerm.trim();
      if (trimmed === "") {
        fetchCustomers();
        return;
      }
      try {
        const res = await API.get(`/api/customers/search?name=${encodeURIComponent(trimmed)}`);
        setCustomers(res.data);
      } catch (err) {
        console.error("Lỗi khi tìm khách hàng:", err);
      }
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  // Xem chi tiết
  const handleView = (customer) => {
    setSelectedCustomer(customer);
    setShowDetail(true);
  };

  // Xử lý nhập liệu
  const handleChange = (e) => {
    setCustomerForm({
      ...customerForm,
      [e.target.name]: e.target.value
    });
  };

  // Kiểm tra lỗi
  const validate = () => {
    let newErrors = {};
    if (!customerForm.firstName.trim()) newErrors.firstName = "Vui lòng nhập họ.";
    if (!customerForm.lastName.trim()) newErrors.lastName = "Vui lòng nhập tên.";
    if (!customerForm.email.trim()) newErrors.email = "Vui lòng nhập email.";
    else if (!/\S+@\S+\.\S+/.test(customerForm.email)) newErrors.email = "Email không hợp lệ.";
    if (!customerForm.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại.";
    else if (!/^[0-9]{9,11}$/.test(customerForm.phone)) newErrors.phone = "Số điện thoại không hợp lệ.";
    return newErrors;
  };

  // Gửi form thêm khách hàng
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validate();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    try {
      await API.post("/api/customers", customerForm);
      alert("Thêm khách hàng thành công!");
      setShowPopup(false);
      setCustomerForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        postalCode: "",
        preferredContactMethod: "",
        notes: ""
      });
      setErrors({});
      fetchCustomers();
    } catch (err) {
      console.error("Lỗi khi thêm khách hàng:", err);
      alert("Thêm thất bại!");
    }
  };

  return (
    <div className="customer">
      <div className="title-customer">Quản lý khách hàng</div>

      <div className="title2-customer">
        <h2>Danh sách khách hàng</h2>
        <h3 onClick={() => setShowPopup(true)}>+ Thêm khách hàng</h3>
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm khách hàng..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="customer-table-container">
        <table className="customer-table">
          <thead>
            <tr>
              <th>HỌ TÊN</th>
              <th>EMAIL</th>
              <th>SỐ ĐIỆN THOẠI</th>
              <th>THÀNH PHỐ</th>
              <th>ĐIỂM TÍN DỤNG</th>
              <th>NGÀY TẠO</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {customers.length > 0 ? (
              customers.map((c) => (
                <tr key={c.customerId}>
                  <td>{c.firstName} {c.lastName}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td>{c.city}</td>
                  <td>{c.creditScore}</td>
                  <td>{c.createdAt}</td>
                  <td className="action-buttons">
                    <button className="icon-btn view" onClick={() => handleView(c)}>
                      <FaEye />
                    </button>
                    <button className="icon-btn edit">
                      <FaPen />
                    </button>
                    <button className="icon-btn delete" onClick={() => handleDelete(c.customerId)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", color: "#666" }}>
                  Không có dữ liệu khách hàng
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Popup thêm khách hàng */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <h2>Thêm khách hàng mới</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <input name="firstName" placeholder="Họ" value={customerForm.firstName} onChange={handleChange} />
                {errors.firstName && <span className="error">{errors.firstName}</span>}

                <input name="lastName" placeholder="Tên" value={customerForm.lastName} onChange={handleChange} />
                {errors.lastName && <span className="error">{errors.lastName}</span>}

                <input name="email" placeholder="Email" value={customerForm.email} onChange={handleChange} />
                {errors.email && <span className="error">{errors.email}</span>}

                <input name="phone" placeholder="Số điện thoại" value={customerForm.phone} onChange={handleChange} />
                {errors.phone && <span className="error">{errors.phone}</span>}

                <input name="address" placeholder="Địa chỉ" value={customerForm.address} onChange={handleChange} />
                <input name="city" placeholder="Thành phố" value={customerForm.city} onChange={handleChange} />
                <input name="postalCode" placeholder="Mã bưu điện" value={customerForm.postalCode} onChange={handleChange} />
                <input name="preferredContactMethod" placeholder="Liên hệ qua (Email/SMS)" value={customerForm.preferredContactMethod} onChange={handleChange} />
                <textarea name="notes" placeholder="Ghi chú" value={customerForm.notes} onChange={handleChange}></textarea>
              </div>

              <div className="form-actions">
                <button type="submit">Tạo</button>
                <button type="button" onClick={() => setShowPopup(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup xem chi tiết */}
      {showDetail && selectedCustomer && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>Thông tin khách hàng</h2>
            <p><b>Họ tên:</b> {selectedCustomer.firstName} {selectedCustomer.lastName}</p>
            <p><b>Email:</b> {selectedCustomer.email}</p>
            <p><b>Số điện thoại:</b> {selectedCustomer.phone}</p>
            <p><b>Thành phố:</b> {selectedCustomer.city}</p>
            <p><b>Điểm tín dụng:</b> {selectedCustomer.creditScore}</p>
            <p><b>Ngày tạo:</b> {selectedCustomer.createdAt}</p>
            <button className="btn-close" onClick={() => setShowDetail(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}
