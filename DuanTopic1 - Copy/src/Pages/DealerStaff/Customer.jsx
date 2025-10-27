import './Customer.css'
import { FaSearch, FaEye, FaPen, FaTrash } from "react-icons/fa";
import { useEffect, useState } from "react";
import API from '../Login/API';

export default function Customer() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // ✅ Lấy danh sách khách hàng ban đầu
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

  //  Xoá khách hàng
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

  //  Tìm kiếm theo tên (real-time)
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

  //  Xử lý khi nhấn nút “Xem”
  const handleView = (customer) => {
    setSelectedCustomer(customer);
    setShowDetail(true);
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
                    <button className="icon-btn activate">
                      Kích hoạt
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
          <div className="popup-box">
            <h2>Thêm khách hàng mới</h2>
            <p>(Chưa có form, chỉ là popup mẫu)</p>
            <button className="btn-close" onClick={() => setShowPopup(false)}>
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Popup xem chi tiết khách hàng */}
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
