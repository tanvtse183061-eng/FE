import { useState, useEffect } from "react";
import { customerAPI, publicOrderAPI, publicVehicleAPI } from "../../services/API.js";
import "./CreateOrderFromCar.css";

export default function CreateOrderFromCar({ 
  show, 
  onClose, 
  carName, 
  carColor, 
  carPrice 
}) {
  const [step, setStep] = useState(1); // 1: Tạo khách hàng, 2: Tạo đơn hàng
  const [customerId, setCustomerId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null); // Lưu orderNumber sau khi tạo thành công
  const [orderId, setOrderId] = useState(null); // Lưu orderId để track/view/cancel

  // Form khách hàng
  const [customerForm, setCustomerForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    preferredContactMethod: "",
    creditScore: 750,
    notes: "",
  });

  // Form đơn hàng
  const [orderForm, setOrderForm] = useState({
    variantId: "",
    colorId: "",
    price: carPrice || "",
    depositAmount: "",
    paymentMethod: "cash",
    notes: "",
  });

  // Danh sách variants và colors
  const [variants, setVariants] = useState([]);
  const [colors, setColors] = useState([]);

  // Reset form khi đóng modal
  useEffect(() => {
    if (!show) {
      setStep(1);
      setCustomerId(null);
      setError("");
      setSuccess(false);
      setCustomerForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        address: "",
        city: "",
        province: "",
        postalCode: "",
        preferredContactMethod: "",
        creditScore: 750,
        notes: "",
      });
      setOrderForm({
        variantId: "",
        colorId: "",
        price: carPrice || "",
        depositAmount: "",
        paymentMethod: "cash",
        notes: "",
      });
      setOrderNumber(null);
      setOrderId(null);
    }
  }, [show, carPrice]);

  // Load variants và colors khi bước 2
  useEffect(() => {
    if (step === 2 && show) {
      loadVariantsAndColors();
    }
  }, [step, show]);

  const loadVariantsAndColors = async () => {
    try {
      setLoading(true);
      const [variantsRes, colorsRes] = await Promise.all([
        publicVehicleAPI.getVariants(),
        publicVehicleAPI.getColors(),
      ]);
      setVariants(variantsRes.data || []);
      setColors(colorsRes.data || []);

      // Tự động tìm variant và color dựa trên tên xe và màu
      if (carName) {
        const matchedVariant = (variantsRes.data || []).find(
          (v) =>
            v.variantName?.toLowerCase().includes(carName.toLowerCase()) ||
            v.model?.modelName?.toLowerCase().includes(carName.toLowerCase())
        );
        if (matchedVariant) {
          setOrderForm((prev) => ({
            ...prev,
            variantId: matchedVariant.variantId || matchedVariant.id,
          }));
        }
      }

      if (carColor) {
        const matchedColor = (colorsRes.data || []).find(
          (c) =>
            c.colorName?.toLowerCase().includes(carColor.toLowerCase()) ||
            c.name?.toLowerCase().includes(carColor.toLowerCase())
        );
        if (matchedColor) {
          setOrderForm((prev) => ({
            ...prev,
            colorId: matchedColor.colorId || matchedColor.id,
          }));
        }
      }
    } catch (err) {
      console.error("Lỗi khi load variants/colors:", err);
      console.error("Chi tiết lỗi:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message,
      });
      
      // Hiển thị thông báo lỗi cho người dùng
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          err.message || 
                          "Không thể tải danh sách biến thể và màu sắc. Vui lòng thử lại sau.";
      setError(errorMessage);
      
      // Nếu lỗi 500, có thể là lỗi server
      if (err.response?.status === 500) {
        setError("Lỗi máy chủ: Không thể kết nối đến server. Vui lòng kiểm tra kết nối hoặc liên hệ quản trị viên.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Validate form khách hàng
  const validateCustomer = () => {
    if (!customerForm.firstName.trim()) {
      setError("Vui lòng nhập họ.");
      return false;
    }
    if (!customerForm.lastName.trim()) {
      setError("Vui lòng nhập tên.");
      return false;
    }
    if (!customerForm.email.trim()) {
      setError("Vui lòng nhập email.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(customerForm.email)) {
      setError("Email không hợp lệ.");
      return false;
    }
    if (!customerForm.phone.trim()) {
      setError("Vui lòng nhập số điện thoại.");
      return false;
    }
    return true;
  };

  // Bước 1: Tạo khách hàng
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateCustomer()) return;

    setLoading(true);
    try {
      const payload = {
        ...customerForm,
        creditScore: Number(customerForm.creditScore),
      };

      const res = await customerAPI.createCustomer(payload);
      const newCustomerId = res.data?.customerId || res.data?.id;
      
      if (newCustomerId) {
        setCustomerId(newCustomerId);
        setStep(2);
      } else {
        setError("Không thể lấy ID khách hàng sau khi tạo.");
      }
    } catch (err) {
      console.error("Lỗi khi tạo khách hàng:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Không thể tạo khách hàng!"
      );
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Tạo đơn hàng
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setError("");

    if (!orderForm.variantId) {
      setError("Vui lòng chọn biến thể xe.");
      return;
    }

    setLoading(true);
    try {
      // Payload theo cấu trúc PublicOrderController
      const orderPayload = {
        customerId: customerId || null, // Optional - UUID string
        variantId: Number(orderForm.variantId), // Nếu không có inventoryId
        colorId: orderForm.colorId ? Number(orderForm.colorId) : null, // Nếu không có inventoryId
        totalAmount: orderForm.price ? Number(orderForm.price) : null,
        depositAmount: orderForm.depositAmount ? Number(orderForm.depositAmount) : null,
        paymentMethod: orderForm.paymentMethod || "cash",
        notes: orderForm.notes || "",
      };

      console.log("📤 Payload tạo đơn hàng (Public API):", JSON.stringify(orderPayload, null, 2));
      
      // Sử dụng Public Order API (không cần đăng nhập)
      const orderResponse = await publicOrderAPI.createOrder(orderPayload);
      console.log("✅ Đơn hàng đã được tạo thành công:", orderResponse.data);
      
      // Lưu orderNumber và orderId từ response
      const createdOrder = orderResponse.data;
      setOrderNumber(createdOrder.orderNumber);
      setOrderId(createdOrder.orderId);
      
      // Lưu vào localStorage để có thể track sau
      if (createdOrder.orderNumber) {
        localStorage.setItem('lastOrderNumber', createdOrder.orderNumber);
      }
      if (createdOrder.orderId) {
        localStorage.setItem('lastOrderId', createdOrder.orderId);
      }
      
      setSuccess(true);
      
      // Đóng modal sau 3 giây để user có thể thấy orderNumber
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err) {
      console.error("❌ Lỗi khi tạo đơn hàng:", err);
      console.error("❌ Error response:", err.response?.data);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Không thể tạo đơn hàng! Vui lòng kiểm tra lại thông tin."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div 
      className="create-order-modal-overlay" 
      onClick={onClose}
    >
      <div className="create-order-modal" onClick={(e) => e.stopPropagation()}>
        <div className="create-order-modal-header">
          <h2>
            {step === 1
              ? "Bước 1: Tạo khách hàng"
              : "Bước 2: Tạo đơn hàng"}
          </h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {success ? (
          <div className="success-message">
            <h3>✅ Đơn hàng đã được tạo thành công!</h3>
            {orderNumber && (
              <div style={{ marginTop: '15px', padding: '15px', background: '#f0f8ff', borderRadius: '8px' }}>
                <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#0066cc' }}>
                  📦 Số đơn hàng của bạn: <span style={{ color: '#004499' }}>{orderNumber}</span>
                </p>
                <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                  Vui lòng lưu số đơn hàng này để theo dõi đơn hàng sau.
                </p>
                <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {orderNumber && (
                    <button 
                      onClick={async () => {
                        try {
                          const trackRes = await publicOrderAPI.trackOrder(orderNumber);
                          alert(`Trạng thái đơn hàng: ${trackRes.data.status}\nTổng tiền: ${trackRes.data.totalAmount?.toLocaleString('vi-VN')} ₫`);
                        } catch (err) {
                          alert("Không thể theo dõi đơn hàng: " + (err.response?.data?.error || err.message));
                        }
                      }}
                      style={{ 
                        padding: '8px 16px', 
                        background: '#0066cc', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      🔍 Theo dõi đơn hàng
                    </button>
                  )}
                  {orderId && (
                    <button 
                      onClick={async () => {
                        try {
                          const detailRes = await publicOrderAPI.getOrder(orderId);
                          const order = detailRes.data;
                          alert(`Chi tiết đơn hàng:\nSố đơn: ${order.orderNumber}\nTrạng thái: ${order.status}\nTổng tiền: ${order.totalAmount?.toLocaleString('vi-VN')} ₫`);
                        } catch (err) {
                          alert("Không thể xem chi tiết: " + (err.response?.data?.error || err.message));
                        }
                      }}
                      style={{ 
                        padding: '8px 16px', 
                        background: '#28a745', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      👁️ Xem chi tiết
                    </button>
                  )}
                </div>
              </div>
            )}
            <p style={{ marginTop: '15px', fontSize: '14px', color: '#28a745', fontWeight: 'bold' }}>
              ✨ Đơn hàng đã được ghi nhận thành công!
            </p>
          </div>
        ) : (
          <>
            {/* Thông tin xe */}
            <div className="car-info-box">
              <h4>Thông tin xe đặt mua:</h4>
              <p>
                <strong>Xe:</strong> {carName || "—"}
              </p>
              <p>
                <strong>Màu:</strong> {carColor || "—"}
              </p>
              {carPrice && (
                <p>
                  <strong>Giá:</strong> {carPrice.toLocaleString()} ₫
                </p>
              )}
            </div>

            {error && <div className="error-message">{error}</div>}

            {step === 1 ? (
              // Form tạo khách hàng
              <form onSubmit={handleCreateCustomer}>
                <div className="form-grid">
                  <input
                    name="firstName"
                    placeholder="Họ *"
                    value={customerForm.firstName}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        firstName: e.target.value,
                      })
                    }
                    required
                  />
                  <input
                    name="lastName"
                    placeholder="Tên *"
                    value={customerForm.lastName}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        lastName: e.target.value,
                      })
                    }
                    required
                  />
                  <input
                    name="email"
                    type="email"
                    placeholder="Email *"
                    value={customerForm.email}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        email: e.target.value,
                      })
                    }
                    required
                  />
                  <input
                    name="phone"
                    placeholder="Số điện thoại *"
                    value={customerForm.phone}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        phone: e.target.value,
                      })
                    }
                    required
                  />
                  <input
                    name="dateOfBirth"
                    type="date"
                    placeholder="Ngày sinh"
                    value={customerForm.dateOfBirth}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        dateOfBirth: e.target.value,
                      })
                    }
                  />
                  <input
                    name="address"
                    placeholder="Địa chỉ"
                    value={customerForm.address}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        address: e.target.value,
                      })
                    }
                  />
                  <input
                    name="city"
                    placeholder="Thành phố"
                    value={customerForm.city}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        city: e.target.value,
                      })
                    }
                  />
                  <input
                    name="province"
                    placeholder="Tỉnh"
                    value={customerForm.province}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        province: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-actions">
                  <button type="button" onClick={onClose}>
                    Hủy
                  </button>
                  <button type="submit" disabled={loading}>
                    {loading ? "Đang tạo..." : "Tạo khách hàng →"}
                  </button>
                </div>
              </form>
            ) : (
              // Form tạo đơn hàng
              <form onSubmit={handleCreateOrder}>
                <div className="form-grid">
                  <label>
                    Biến thể xe *
                    <select
                      value={orderForm.variantId}
                      onChange={(e) =>
                        setOrderForm({
                          ...orderForm,
                          variantId: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">-- Chọn biến thể --</option>
                      {variants.map((v) => (
                        <option
                          key={v.variantId || v.id}
                          value={v.variantId || v.id}
                        >
                          {v.variantName ||
                            `${v.model?.brand?.brandName || ""} ${
                              v.model?.modelName || ""
                            } ${v.variantName || ""}`}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Màu sắc
                    <select
                      value={orderForm.colorId}
                      onChange={(e) =>
                        setOrderForm({
                          ...orderForm,
                          colorId: e.target.value,
                        })
                      }
                    >
                      <option value="">-- Chọn màu --</option>
                      {colors.map((c) => (
                        <option
                          key={c.colorId || c.id}
                          value={c.colorId || c.id}
                        >
                          {c.colorName || c.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Tổng tiền (VNĐ) *
                    <input
                      type="number"
                      placeholder="1200000000"
                      value={orderForm.price}
                      onChange={(e) =>
                        setOrderForm({
                          ...orderForm,
                          price: e.target.value,
                        })
                      }
                      required
                    />
                  </label>
                  <label>
                    Tiền đặt cọc (VNĐ) (Tùy chọn)
                    <input
                      type="number"
                      placeholder="120000000"
                      value={orderForm.depositAmount}
                      onChange={(e) =>
                        setOrderForm({
                          ...orderForm,
                          depositAmount: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    Phương thức thanh toán
                    <select
                      value={orderForm.paymentMethod}
                      onChange={(e) =>
                        setOrderForm({
                          ...orderForm,
                          paymentMethod: e.target.value,
                        })
                      }
                    >
                      <option value="cash">Tiền mặt</option>
                      <option value="bank_transfer">Chuyển khoản</option>
                      <option value="credit_card">Thẻ tín dụng</option>
                      <option value="installment">Trả góp</option>
                    </select>
                  </label>
                  <textarea
                    placeholder="Ghi chú đơn hàng"
                    value={orderForm.notes}
                    onChange={(e) =>
                      setOrderForm({
                        ...orderForm,
                        notes: e.target.value,
                      })
                    }
                    rows="3"
                  />
                </div>
                <div className="form-actions">
                  <button type="button" onClick={() => setStep(1)}>
                    ← Quay lại
                  </button>
                  <button type="button" onClick={onClose}>
                    Hủy
                  </button>
                  <button type="submit" disabled={loading}>
                    {loading ? "Đang tạo..." : "Tạo đơn hàng"}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

