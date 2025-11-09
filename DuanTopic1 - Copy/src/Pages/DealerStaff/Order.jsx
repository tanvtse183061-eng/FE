
 import './Order.css'
import { FaSearch, FaEye, FaPen, FaTrash } from "react-icons/fa";
import { useEffect, useState } from "react";
export default function Order(){
   
  const [order, setOrder] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  //  Lấy danh sách khách hàng ban đầu
  const fetchOrder = async () => {
    try {
      const res = await API.get("/api/orders");
      setOrder(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy khách hàng:", err);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, []);

  //  Xoá khách hàng
  const handleDelete = async (orderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đơn hàng  này không?")) return;
    try {
      await API.delete(`/api/orders/${orderId}`);
      alert("Xóa khách hàng thành công!");
      fetchOrder();
    } catch (err) {
      console.error("Lỗi khi xóa khách hàng:", err);
      alert("Xóa thất bại!");
    }
  };

  //  Tìm kiếm theo tên (real-time)
const filteredOrders = order.filter((o) => {
  const keyword = searchTerm.toLowerCase();
  return (
    o.orderNumber.toLowerCase().includes(keyword) ||
    o.quotation.customer.firstName.toLowerCase().includes(keyword) ||
    o.quotation.customer.lastName.toLowerCase().includes(keyword) ||
    o.status.toLowerCase().includes(keyword)
  );
});

  //  Xử lý khi nhấn nút “Xem”
  const handleView = (order) => {
    setSelectedOrder(order);
    setShowDetail(true);
  };

  return (
    <div className="customer">
      <div className="title-customer">Quản lý đơn hàng</div>

      <div className="title2-customer">
        <h2>Danh sách đơn hàng</h2>
        <h3 onClick={() => setShowPopup(true)}>+ Thêm đơn hàng</h3>
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm đơn hàng..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="customer-table-container">
        <table className="customer-table">
          <thead>
            <tr>
              <th>SỐ ĐƠN HÀNG</th>
              <th>KHÁCH HÀNG</th>
              <th>XE ĐẶT MUA</th>
              <th>TỔNG TIỀN</th>
              <th>TRẠNG THÁI</th>
              <th>NGÀY ĐẶT HÀNG</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((c) => (
                <tr key={c.orderId}>
                  <td>{c.orderNumber}</td>
                  <td>{c.quotation.customer.firstName} {c.quotation.customer.lastName}</td>
                  <td>{c.quotation.variant.model.brand.brandName}{""}
                      {c.quotation.variant.model.modelName}
                  </td>
                  <td>{c.quotation.finalPrice.toLocaleString()} ₫</td>
                  <td>{c.status}</td>
                  <td>{new Date(c.orderDate).toLocaleDateString("vi-VN")}</td>
                  <td className="action-buttons">
                    <button className="icon-btn view" onClick={() => handleView(c)}>
                      <FaEye />
                    </button>
                    <button className="icon-btn edit">
                      <FaPen />
                    </button>
                    
                    <button className="icon-btn delete" onClick={() => handleDelete(c.orderId)}>
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

      {/* Popup thêm đơn hàng */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>Thêm đơn hàng mới</h2>
            <p>(Chưa có form, chỉ là popup mẫu)</p>
            <button className="btn-close" onClick={() => setShowPopup(false)}>
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Popup xem chi tiết đặt hàng */}
      {showDetail && selectedOrder && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>Thông tin đặt hàng</h2>
            <p><b>Số đơn hàng:</b> {selectedOrder.orderNumber} </p>
            <p><b>Khách hàng:</b>{selectedOrder.quotation.customer.firstName} {selectedOrder.quotation.customer.lastName} </p>
            <p><b>Xe đặt mua:</b> {selectedOrder.quotation.variant.model.brand.brandName}{" "} {selectedOrder.quotation.variant.model.modelName}</p>
            <p><b>Tổng tiền:</b>{selectedOrder.quotation.finalPrice.toLocaleString()} ₫ </p>
            <p><b>Trạng thái:</b> {selectedOrder.status}</p>
            <p><b>Ngày đặt hàng:</b> {new Date(selectedOrder.orderDate).toLocaleDateString("vi-VN")}</p>
            <button className="btn-close" onClick={() => setShowDetail(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}
