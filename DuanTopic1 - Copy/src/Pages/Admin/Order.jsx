import './Order.css'
import { FaSearch, FaEye, FaPen, FaTrash, FaSpinner, FaExclamationCircle, FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import { orderAPI } from "../../services/API";

export default function Order(){
  const [order, setOrder] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);

  // Lấy danh sách đơn hàng
  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Đang tải danh sách đơn hàng...");
      const res = await orderAPI.getOrders();
      console.log("✅ Response từ API:", res);
      console.log("📦 Dữ liệu đơn hàng:", res.data);
      
      // Backend trả về { orders: [...], total: ... } hoặc { success: true, getAllOrders_count: 5, ... }
      let orders = [];
      if (Array.isArray(res.data)) {
        orders = res.data;
        console.log("✅ Backend trả về array trực tiếp");
      } else if (res.data?.orders && Array.isArray(res.data.orders)) {
        orders = res.data.orders;
        console.log("✅ Backend trả về { orders: [...] }");
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        orders = res.data.data;
        console.log("✅ Backend trả về { data: [...] }");
      } else {
        console.warn("⚠️ Không nhận diện được cấu trúc response");
        orders = [];
      }
      
      console.log("📊 Số lượng đơn hàng sau khi xử lý:", orders.length);
      setOrder(orders);
      
      if (orders.length === 0) {
        console.warn("⚠️ Không có đơn hàng nào trong database");
      } else {
        console.log("✅ Đã load thành công", orders.length, "đơn hàng");
      }
    } catch (err) {
      console.error("❌ Lỗi khi lấy đơn hàng:", err);
      console.error("❌ Error response:", err.response?.data);
      console.error("❌ Error status:", err.response?.status);
      setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, []);

  // Xóa đơn hàng
  const handleDelete = async (orderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này không?")) return;
    try {
      setDeleting(orderId);
      await orderAPI.deleteOrder(orderId);
      await fetchOrder();
    } catch (err) {
      console.error("Lỗi khi xóa đơn hàng:", err);
      alert("Xóa thất bại! " + (err.response?.data?.error || err.message));
    } finally {
      setDeleting(null);
    }
  };

  // Tìm kiếm theo tên (real-time)
  const filteredOrders = order.filter((o) => {
    if (!o) return false;
    const keyword = searchTerm.toLowerCase();
    try {
      // Tìm theo orderNumber
      if (o.orderNumber?.toLowerCase().includes(keyword)) return true;
      
      // Tìm theo customer (có thể từ quotation hoặc trực tiếp)
      if (o.quotation?.customer) {
        if (o.quotation.customer.firstName?.toLowerCase().includes(keyword)) return true;
        if (o.quotation.customer.lastName?.toLowerCase().includes(keyword)) return true;
        if (o.quotation.customer.email?.toLowerCase().includes(keyword)) return true;
      }
      
      // Tìm theo status
      if (o.status?.toLowerCase().includes(keyword)) return true;
      
      return false;
    } catch (err) {
      console.error("❌ Lỗi khi filter đơn hàng:", err, o);
      return false;
    }
  });

  // Xử lý khi nhấn nút "Xem"
  const handleView = (order) => {
    setSelectedOrder(order);
    setShowDetail(true);
  };

  // Get status badge class
  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('pending') || statusLower.includes('chờ')) return 'status-pending';
    if (statusLower.includes('confirmed') || statusLower.includes('xác nhận')) return 'status-confirmed';
    if (statusLower.includes('paid') || statusLower.includes('đã thanh toán')) return 'status-paid';
    if (statusLower.includes('delivered') || statusLower.includes('đã giao')) return 'status-delivered';
    if (statusLower.includes('completed') || statusLower.includes('hoàn tất')) return 'status-completed';
    if (statusLower.includes('cancelled') || statusLower.includes('hủy')) return 'status-cancelled';
    return 'status-default';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('pending') || statusLower.includes('chờ')) return <FaClock />;
    if (statusLower.includes('confirmed') || statusLower.includes('xác nhận')) return <FaCheckCircle />;
    if (statusLower.includes('paid') || statusLower.includes('đã thanh toán')) return <FaCheckCircle />;
    if (statusLower.includes('delivered') || statusLower.includes('đã giao')) return <FaCheckCircle />;
    if (statusLower.includes('completed') || statusLower.includes('hoàn tất')) return <FaCheckCircle />;
    if (statusLower.includes('cancelled') || statusLower.includes('hủy')) return <FaTimesCircle />;
    return <FaExclamationCircle />;
  };

  return (
    <div className="customer">
      <div className="title-customer">
        <span className="title-icon">📦</span>
        Quản lý đơn hàng
      </div>

      <div className="title2-customer">
        <div>
          <h2>Danh sách đơn hàng</h2>
          <p className="subtitle">{order.length} đơn hàng tổng cộng</p>
        </div>
        <button className="btn-add" onClick={() => setShowPopup(true)}>
          <FaPen className="btn-icon" />
          Thêm đơn hàng
        </button>
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm theo số đơn, khách hàng, trạng thái..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button 
            className="search-clear" 
            onClick={() => setSearchTerm("")}
            title="Xóa tìm kiếm"
          >
            <FaTimesCircle />
          </button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="error-banner">
          <FaExclamationCircle />
          <span>{error}</span>
          <button onClick={fetchOrder}>Thử lại</button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Đang tải danh sách đơn hàng...</p>
        </div>
      ) : (
        <div className="customer-table-container">
          {filteredOrders.length > 0 ? (
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
                {filteredOrders.map((c) => (
                  <tr key={c.orderId} className="table-row">
                    <td>
                      <span className="order-number">{c.orderNumber}</span>
                    </td>
                     <td>
                       <div className="customer-info">
                         <span className="customer-name">
                           {c.quotation?.customer?.firstName || ''} {c.quotation?.customer?.lastName || ''}
                           {!c.quotation?.customer && <span style={{ color: '#999' }}>Không có thông tin</span>}
                         </span>
                         {c.quotation?.customer?.email && (
                           <span className="customer-email">{c.quotation.customer.email}</span>
                         )}
                       </div>
                     </td>
                     <td>
                       <div className="vehicle-info">
                         {c.quotation?.variant?.model ? (
                           <>
                             <span className="vehicle-brand">
                               {c.quotation.variant.model.brand?.brandName || ''}
                             </span>
                             <span className="vehicle-model">
                               {c.quotation.variant.model.modelName || 'N/A'}
                             </span>
                           </>
                         ) : c.inventoryId ? (
                           <span style={{ color: '#666' }}>Xe trong kho (ID: {c.inventoryId})</span>
                         ) : (
                           <span style={{ color: '#999' }}>Chưa chọn xe</span>
                         )}
                       </div>
                     </td>
                     <td>
                       <span className="price-amount">
                         {c.totalAmount 
                           ? Number(c.totalAmount).toLocaleString('vi-VN') + ' ₫'
                           : c.quotation?.finalPrice 
                           ? Number(c.quotation.finalPrice).toLocaleString('vi-VN') + ' ₫'
                           : 'N/A'}
                       </span>
                     </td>
                    <td>
                      <span className={`status-badge ${getStatusBadge(c.status)}`}>
                        {getStatusIcon(c.status)}
                        <span>{c.status || 'N/A'}</span>
                      </span>
                    </td>
                    <td>
                      <span className="date-text">
                        {c.orderDate ? new Date(c.orderDate).toLocaleDateString("vi-VN") : 'N/A'}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button 
                        className="icon-btn view" 
                        onClick={() => handleView(c)}
                        title="Xem chi tiết"
                      >
                        <FaEye />
                      </button>
                      <button 
                        className="icon-btn edit"
                        title="Chỉnh sửa"
                      >
                        <FaPen />
                      </button>
                      <button 
                        className="icon-btn delete" 
                        onClick={() => handleDelete(c.orderId)}
                        disabled={deleting === c.orderId}
                        title="Xóa đơn hàng"
                      >
                        {deleting === c.orderId ? <FaSpinner className="spinner-small" /> : <FaTrash />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>{searchTerm ? 'Không tìm thấy đơn hàng' : 'Chưa có đơn hàng nào'}</h3>
              <p>
                {searchTerm 
                  ? 'Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc' 
                  : 'Bắt đầu bằng cách tạo đơn hàng mới'}
              </p>
              {!searchTerm && (
                <button className="btn-primary" onClick={() => setShowPopup(true)}>
                  Tạo đơn hàng đầu tiên
                </button>
              )}
            </div>
          )}
        </div>
      )}

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
        <div className="popup-overlay" onClick={() => setShowDetail(false)}>
          <div className="popup-box detail-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h2>Chi tiết đơn hàng</h2>
              <button className="popup-close" onClick={() => setShowDetail(false)}>
                <FaTimesCircle />
              </button>
            </div>
            <div className="popup-content">
              <div className="detail-section">
                <h3>Thông tin đơn hàng</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Số đơn hàng</span>
                    <span className="detail-value">{selectedOrder.orderNumber}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Trạng thái</span>
                    <span className={`status-badge ${getStatusBadge(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)}
                      <span>{selectedOrder.status}</span>
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Ngày đặt hàng</span>
                    <span className="detail-value">
                      {selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleDateString("vi-VN") : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Thông tin khách hàng</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Họ tên</span>
                    <span className="detail-value">
                      {selectedOrder.quotation?.customer?.firstName || ''} {selectedOrder.quotation?.customer?.lastName || ''}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{selectedOrder.quotation?.customer?.email || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Điện thoại</span>
                    <span className="detail-value">{selectedOrder.quotation?.customer?.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Thông tin xe</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Thương hiệu</span>
                    <span className="detail-value">
                      {selectedOrder.quotation?.variant?.model?.brand?.brandName || 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Dòng xe</span>
                    <span className="detail-value">
                      {selectedOrder.quotation?.variant?.model?.modelName || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Thông tin thanh toán</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Tổng tiền</span>
                    <span className="detail-value price-highlight">
                      {selectedOrder.quotation?.finalPrice?.toLocaleString('vi-VN') || '0'} ₫
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="popup-footer">
              <button className="btn-primary" onClick={() => setShowDetail(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
