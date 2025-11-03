import './Customer.css';
import { FaSearch, FaEye, FaPen, FaTrash, FaPlus } from "react-icons/fa";
import { useEffect, useState } from "react";
import API from '../Login/API';

export default function Customer() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
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
    creditScore: 750,
    notes: ""
  });

  // 📦 Lấy danh sách khách hàng
  const fetchCustomers = async () => {
    try {
      const res = await API.get("/api/customers");
      console.log("📦 Customers từ API:", res.data);
      setCustomers(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy khách hàng:", err);
      alert("Không thể tải danh sách khách hàng!");
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // 🔍 Tìm kiếm khách hàng
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

  // 👁️ Xem chi tiết
  const handleView = (customer) => {
    setSelectedCustomer(customer);
    setShowDetail(true);
  };

  // ➕ Mở form thêm mới
  const handleOpenAdd = () => {
    setIsEdit(false);
    setSelectedCustomer(null);
    setCustomerForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      preferredContactMethod: "",
      creditScore: 750,
      notes: ""
    });
    setErrors({});
    setShowPopup(true);
  };

  // ✏️ Mở form sửa
  const handleEdit = (customer) => {
    setIsEdit(true);
    setSelectedCustomer(customer);
    setCustomerForm({
      firstName: customer.firstName || "",
      lastName: customer.lastName || "",
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
      city: customer.city || "",
      postalCode: customer.postalCode || "",
      preferredContactMethod: customer.preferredContactMethod || "",
      creditScore: customer.creditScore || 750,
      notes: customer.notes || ""
    });
    setErrors({});
    setShowPopup(true);
  };

  // 🗑️ Xoá khách hàng
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

  // 📝 Xử lý nhập liệu
  const handleChange = (e) => {
    setCustomerForm({
      ...customerForm,
      [e.target.name]: e.target.value
    });
    // Xóa lỗi khi người dùng sửa
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  // ✅ Kiểm tra lỗi
  const validate = () => {
    let newErrors = {};
    if (!customerForm.firstName.trim()) newErrors.firstName = "Vui lòng nhập họ.";
    if (!customerForm.lastName.trim()) newErrors.lastName = "Vui lòng nhập tên.";
    if (!customerForm.email.trim()) newErrors.email = "Vui lòng nhập email.";
    else if (!/\S+@\S+\.\S+/.test(customerForm.email)) newErrors.email = "Email không hợp lệ.";
    if (!customerForm.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại.";
    else if (!/^[0-9]{9,11}$/.test(customerForm.phone)) newErrors.phone = "Số điện thoại không hợp lệ.";
    if (!customerForm.creditScore || isNaN(customerForm.creditScore))
      newErrors.creditScore = "Vui lòng nhập điểm tín dụng hợp lệ.";
    return newErrors;
  };

  // 💾 Gửi form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validate();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    const payload = {
      ...customerForm,
      creditScore: Number(customerForm.creditScore)
    };

    console.log("📤 Payload:", payload);

    try {
      if (isEdit && selectedCustomer) {
        await API.put(`/api/customers/${selectedCustomer.customerId}`, payload);
        alert("Cập nhật khách hàng thành công!");
      } else {
        await API.post("/api/customers", payload);
        alert("Thêm khách hàng thành công!");
      }
      
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
        creditScore: 750,
        notes: "",
      });
      setErrors({});
      fetchCustomers();
    } catch (err) {
      console.error("Lỗi khi lưu khách hàng:", err);
      const errorMsg = err.response?.data?.message || "Không thể lưu khách hàng!";
      alert(`❌ Lỗi: ${errorMsg}`);
    }
  };

  // 📅 Format ngày
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="customer">
      <div className="title-customer">Quản lý khách hàng</div>

      <div className="title2-customer">
        <h2>Danh sách khách hàng ({customers.length})</h2>
        <h3 onClick={handleOpenAdd}>
          <FaPlus /> Thêm khách hàng
        </h3>
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
                  <td className="customer-name">
                    {c.firstName} {c.lastName}
                  </td>
                  <td>{c.email || "—"}</td>
                  <td>{c.phone || "—"}</td>
                  <td>{c.city || "—"}</td>
                  <td>
                    <span className="credit-score">{c.creditScore || "—"}</span>
                  </td>
                  <td>{formatDate(c.createdAt)}</td>
                  <td className="action-buttons">
                    <button className="icon-btn view" onClick={() => handleView(c)} title="Xem chi tiết">
                      <FaEye />
                    </button>
                    <button className="icon-btn edit" onClick={() => handleEdit(c)} title="Chỉnh sửa">
                      <FaPen />
                    </button>
                    <button className="icon-btn delete" onClick={() => handleDelete(c.customerId)} title="Xóa">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">
                  Không có dữ liệu khách hàng
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Popup thêm/sửa khách hàng */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box popup-form">
            <h2>{isEdit ? "✏️ Sửa thông tin khách hàng" : "➕ Thêm khách hàng mới"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Họ *</label>
                  <input 
                    name="firstName" 
                    placeholder="Nguyễn Văn" 
                    value={customerForm.firstName} 
                    onChange={handleChange}
                    className={errors.firstName ? "input-error" : ""}
                  />
                  {errors.firstName && <span className="error">{errors.firstName}</span>}
                </div>

                <div className="form-group">
                  <label>Tên *</label>
                  <input 
                    name="lastName" 
                    placeholder="An" 
                    value={customerForm.lastName} 
                    onChange={handleChange}
                    className={errors.lastName ? "input-error" : ""}
                  />
                  {errors.lastName && <span className="error">{errors.lastName}</span>}
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input 
                    name="email" 
                    type="email"
                    placeholder="example@email.com" 
                    value={customerForm.email} 
                    onChange={handleChange}
                    className={errors.email ? "input-error" : ""}
                  />
                  {errors.email && <span className="error">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label>Số điện thoại *</label>
                  <input 
                    name="phone" 
                    placeholder="0901234567" 
                    value={customerForm.phone} 
                    onChange={handleChange}
                    className={errors.phone ? "input-error" : ""}
                  />
                  {errors.phone && <span className="error">{errors.phone}</span>}
                </div>

                <div className="form-group full-width">
                  <label>Địa chỉ</label>
                  <input 
                    name="address" 
                    placeholder="123 Đường ABC" 
                    value={customerForm.address} 
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Thành phố</label>
                  <input 
                    name="city" 
                    placeholder="Hồ Chí Minh" 
                    value={customerForm.city} 
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Mã bưu điện</label>
                  <input 
                    name="postalCode" 
                    placeholder="700000" 
                    value={customerForm.postalCode} 
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Phương thức liên hệ</label>
                  <select 
                    name="preferredContactMethod" 
                    value={customerForm.preferredContactMethod} 
                    onChange={handleChange}
                  >
                    <option value="">-- Chọn --</option>
                    <option value="EMAIL">Email</option>
                    <option value="SMS">SMS</option>
                    <option value="PHONE">Điện thoại</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Điểm tín dụng *</label>
                  <input
                    type="number"
                    name="creditScore"
                    placeholder="750"
                    value={customerForm.creditScore}
                    onChange={handleChange}
                    className={errors.creditScore ? "input-error" : ""}
                    min="300"
                    max="850"
                  />
                  {errors.creditScore && <span className="error">{errors.creditScore}</span>}
                </div>

                <div className="form-group full-width">
                  <label>Ghi chú</label>
                  <textarea 
                    name="notes" 
                    placeholder="Ghi chú thêm..." 
                    value={customerForm.notes} 
                    onChange={handleChange}
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowPopup(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-submit">
                  {isEdit ? "💾 Cập nhật" : "➕ Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 👁️ Popup xem chi tiết */}
      {showDetail && selectedCustomer && (
        <div className="popup-overlay">
          <div className="popup-box popup-detail">
            <h2>🔍 Thông tin khách hàng</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Họ tên:</span>
                <span className="detail-value">{selectedCustomer.firstName} {selectedCustomer.lastName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{selectedCustomer.email || "—"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Số điện thoại:</span>
                <span className="detail-value">{selectedCustomer.phone || "—"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Địa chỉ:</span>
                <span className="detail-value">{selectedCustomer.address || "—"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Thành phố:</span>
                <span className="detail-value">{selectedCustomer.city || "—"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Mã bưu điện:</span>
                <span className="detail-value">{selectedCustomer.postalCode || "—"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Điểm tín dụng:</span>
                <span className="detail-value credit-score">{selectedCustomer.creditScore || "—"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phương thức liên hệ:</span>
                <span className="detail-value">{selectedCustomer.preferredContactMethod || "—"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Ngày tạo:</span>
                <span className="detail-value">{formatDate(selectedCustomer.createdAt)}</span>
              </div>
              {selectedCustomer.notes && (
                <div className="detail-item full-width">
                  <span className="detail-label">Ghi chú:</span>
                  <span className="detail-value">{selectedCustomer.notes}</span>
                </div>
              )}
            </div>
            <button className="btn-close" onClick={() => setShowDetail(false)}>
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}