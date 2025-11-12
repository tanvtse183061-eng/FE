import { useState, useEffect } from "react";
import { customerAPI, publicOrderAPI, publicPaymentAPI, publicVehicleAPI } from "../../services/API.js";
import "./CreateOrderFromCar.css";

export default function CreateOrder3Steps({ 
  show, 
  onClose, 
  carName, 
  carColor, 
  carPrice 
}) {
  const [step, setStep] = useState(1); // 1: Customer, 2: Order, 3: Payment
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  // Lưu trữ dữ liệu từ các bước
  const [customerId, setCustomerId] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [orderNumber, setOrderNumber] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  
  // Form Bước 1: Khách hàng
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

  // Form Bước 2: Đơn hàng
  const [orderForm, setOrderForm] = useState({
    variantId: "",
    colorId: "",
    totalAmount: carPrice || "",
    depositAmount: "",
    paymentMethod: "cash",
    notes: "",
  });

  // Form Bước 3: Thanh toán
  const [paymentForm, setPaymentForm] = useState({
    paymentAmount: "",
    paymentMethod: "cash",
    paymentDate: new Date().toISOString().split('T')[0],
    transactionReference: "",
    notes: "",
  });

  // Danh sách variants và colors
  const [variants, setVariants] = useState([]);
  const [colors, setColors] = useState([]);
  const [availableInventory, setAvailableInventory] = useState([]); // Inventory có sẵn
  const [inventoryError, setInventoryError] = useState(""); // Lỗi không có inventory

  // Reset form khi đóng modal
  useEffect(() => {
    if (!show) {
      setStep(1);
      setCustomerId(null);
      setOrderId(null);
      setOrderNumber(null);
      setPaymentId(null);
      setError("");
      setSuccess(false);
      setInventoryError("");
      setAvailableInventory([]);
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
        totalAmount: carPrice || "",
        depositAmount: "",
        paymentMethod: "cash",
        notes: "",
      });
      setPaymentForm({
        paymentAmount: "",
        paymentMethod: "cash",
        paymentDate: new Date().toISOString().split('T')[0],
        transactionReference: "",
        notes: "",
      });
    } else {
      // Khi modal mở, reset colorId để có thể cập nhật lại từ carColor
      setOrderForm((prev) => ({
        ...prev,
        colorId: "",
      }));
    }
  }, [show, carPrice]);

  // Load variants và colors khi bước 2
  useEffect(() => {
    if (step === 2 && show) {
      loadVariantsAndColors();
      checkAvailableInventory();
    }
  }, [step, show]);

  // Cập nhật colorId khi carColor prop thay đổi (user chọn màu khác)
  useEffect(() => {
    if (carColor && colors.length > 0) {
      const matchedColor = colors.find(
        (c) => {
          const colorName = (c.colorName || c.name || "").toLowerCase();
          const searchColor = carColor.toLowerCase();
          return (
            colorName.includes(searchColor) ||
            colorName === searchColor ||
            // Match các tên màu phổ biến
            (searchColor.includes("đỏ") && (colorName.includes("red") || colorName.includes("đỏ"))) ||
            (searchColor.includes("xanh dương") && (colorName.includes("blue") || colorName.includes("xanh dương"))) ||
            (searchColor.includes("xanh lá") && (colorName.includes("green") || colorName.includes("xanh lá"))) ||
            (searchColor.includes("vàng") && (colorName.includes("yellow") || colorName.includes("vàng"))) ||
            (searchColor.includes("tím") && (colorName.includes("purple") || colorName.includes("tím"))) ||
            (searchColor.includes("cam") && (colorName.includes("orange") || colorName.includes("cam"))) ||
            (searchColor.includes("đen") && (colorName.includes("black") || colorName.includes("đen"))) ||
            (searchColor.includes("trắng") && (colorName.includes("white") || colorName.includes("trắng"))) ||
            (searchColor.includes("xám") && (colorName.includes("gray") || colorName.includes("grey") || colorName.includes("xám")))
          );
        }
      );
      if (matchedColor) {
        const newColorId = matchedColor.colorId || matchedColor.id;
        // Luôn cập nhật khi carColor thay đổi
        setOrderForm((prev) => ({
          ...prev,
          colorId: newColorId,
        }));
      }
    }
  }, [carColor, colors]);

  // Kiểm tra inventory khi variant/color thay đổi
  useEffect(() => {
    if (step === 2 && orderForm.variantId) {
      checkAvailableInventory();
    }
  }, [orderForm.variantId, orderForm.colorId, step]);

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
          (c) => {
            const colorName = (c.colorName || c.name || "").toLowerCase();
            const searchColor = carColor.toLowerCase();
            return (
              colorName.includes(searchColor) ||
              colorName === searchColor ||
              // Match các tên màu phổ biến
              (searchColor.includes("đỏ") && (colorName.includes("red") || colorName.includes("đỏ"))) ||
              (searchColor.includes("xanh") && (colorName.includes("blue") || colorName.includes("green") || colorName.includes("xanh"))) ||
              (searchColor.includes("vàng") && (colorName.includes("yellow") || colorName.includes("vàng"))) ||
              (searchColor.includes("tím") && (colorName.includes("purple") || colorName.includes("tím"))) ||
              (searchColor.includes("cam") && (colorName.includes("orange") || colorName.includes("cam"))) ||
              (searchColor.includes("đen") && (colorName.includes("black") || colorName.includes("đen"))) ||
              (searchColor.includes("trắng") && (colorName.includes("white") || colorName.includes("trắng"))) ||
              (searchColor.includes("xám") && (colorName.includes("gray") || colorName.includes("grey") || colorName.includes("xám")))
            );
          }
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
      setError("Không thể tải danh sách biến thể và màu sắc.");
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra inventory có sẵn
  const checkAvailableInventory = async () => {
    try {
      setInventoryError("");
      
      if (!orderForm.variantId) {
        return; // Chưa chọn variant
      }

      // Lấy inventory theo variant
      let inventoryRes;
      try {
        inventoryRes = await publicVehicleAPI.getInventoryByVariant(orderForm.variantId);
      } catch (err) {
        // Nếu API không tồn tại, thử lấy tất cả inventory
        try {
          inventoryRes = await publicVehicleAPI.getAvailableInventory();
        } catch (err2) {
          console.warn("Không thể kiểm tra inventory:", err2);
          return;
        }
      }

      const allInventory = inventoryRes.data || [];
      
      // Lọc inventory theo variant và color (nếu có)
      let filteredInventory = allInventory.filter(inv => {
        const invVariantId = inv.variantId || inv.variant?.variantId || inv.variant?.id;
        const invColorId = inv.colorId || inv.color?.colorId || inv.color?.id;
        
        // Phải match variant
        const matchVariant = String(invVariantId) === String(orderForm.variantId);
        
        // Nếu có chọn color, phải match color
        const matchColor = !orderForm.colorId || String(invColorId) === String(orderForm.colorId);
        
        // Status phải là available
        const status = inv.status?.toLowerCase() || "";
        const isAvailable = status === "available" || status === "AVAILABLE";
        
        return matchVariant && matchColor && isAvailable;
      });

      setAvailableInventory(filteredInventory);

      // Nếu không có inventory, hiển thị lỗi
      if (filteredInventory.length === 0) {
        const variantName = variants.find(v => 
          String(v.variantId || v.id) === String(orderForm.variantId)
        )?.variantName || "xe này";
        
        const colorName = orderForm.colorId ? 
          colors.find(c => String(c.colorId || c.id) === String(orderForm.colorId))?.colorName || "màu này" 
          : "";
        
        setInventoryError(
          `⚠️ Hiện tại không có ${variantName}${colorName ? ` màu ${colorName}` : ""} trong kho. ` +
          `Vui lòng liên hệ Dealer Staff hoặc Manager để thêm xe vào kho trước khi đặt hàng.`
        );
      } else {
        setInventoryError(""); // Có inventory, xóa lỗi
      }
    } catch (err) {
      console.error("Lỗi khi kiểm tra inventory:", err);
      // Không hiển thị lỗi nếu API không tồn tại
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
        setStep(2); // Chuyển sang bước 2
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

    // Kiểm tra inventory trước khi tạo đơn hàng
    if (availableInventory.length === 0) {
      setError(inventoryError || "Không có xe trong kho. Vui lòng liên hệ Dealer Staff hoặc Manager để thêm xe vào kho.");
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        customerId: customerId || null,
        variantId: Number(orderForm.variantId),
        colorId: orderForm.colorId ? Number(orderForm.colorId) : null,
        totalAmount: orderForm.totalAmount ? Number(orderForm.totalAmount) : null,
        depositAmount: orderForm.depositAmount ? Number(orderForm.depositAmount) : null,
        paymentMethod: orderForm.paymentMethod || "cash",
        notes: orderForm.notes || "",
      };

      console.log("📤 Payload tạo đơn hàng:", JSON.stringify(orderPayload, null, 2));
      
      const orderResponse = await publicOrderAPI.createOrder(orderPayload);
      console.log("✅ Đơn hàng đã được tạo:", orderResponse.data);
      
      const createdOrder = orderResponse.data;
      setOrderId(createdOrder.orderId);
      setOrderNumber(createdOrder.orderNumber);
      
      // Tự động set paymentAmount = depositAmount nếu có
      if (orderForm.depositAmount) {
        setPaymentForm(prev => ({
          ...prev,
          paymentAmount: orderForm.depositAmount,
        }));
      }
      
      setStep(3); // Chuyển sang bước 3
    } catch (err) {
      console.error("❌ Lỗi khi tạo đơn hàng:", err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Không thể tạo đơn hàng!"
      );
    } finally {
      setLoading(false);
    }
  };

  // Bước 3: Tạo thanh toán
  const handleCreatePayment = async (e) => {
    e.preventDefault();
    setError("");

    if (!paymentForm.paymentAmount) {
      setError("Vui lòng nhập số tiền thanh toán.");
      return;
    }

    setLoading(true);
    try {
      const paymentPayload = {
        orderId: orderId,
        customerId: customerId,
        paymentAmount: Number(paymentForm.paymentAmount),
        paymentMethod: paymentForm.paymentMethod || "cash",
        paymentDate: paymentForm.paymentDate,
        transactionReference: paymentForm.transactionReference || null,
        notes: paymentForm.notes || "",
      };

      console.log("📤 Payload tạo thanh toán:", JSON.stringify(paymentPayload, null, 2));
      
      const paymentResponse = await publicPaymentAPI.createPayment(paymentPayload);
      console.log("✅ Thanh toán đã được tạo:", paymentResponse.data);
      
      setPaymentId(paymentResponse.data?.paymentId || paymentResponse.data?.id);
      setSuccess(true);
      
      // Đóng modal sau 3 giây
      setTimeout(() => {
        onClose();
        // Trigger refresh nếu cần
        window.dispatchEvent(new CustomEvent('orderCreated', { 
          detail: { orderId, orderNumber, paymentId: paymentResponse.data?.paymentId } 
        }));
      }, 3000);
    } catch (err) {
      console.error("❌ Lỗi khi tạo thanh toán:", err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Không thể tạo thanh toán!"
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
            {step === 1 && "Bước 1: Thông tin khách hàng"}
            {step === 2 && "Bước 2: Thông tin đơn hàng"}
            {step === 3 && "Bước 3: Thanh toán"}
          </h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Progress indicator */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '10px', 
          marginBottom: '20px',
          padding: '10px'
        }}>
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: step >= 1 ? '#28a745' : '#ccc',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>1</div>
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: step >= 2 ? '#28a745' : '#ccc',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>2</div>
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: step >= 3 ? '#28a745' : '#ccc',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>3</div>
        </div>

        {success ? (
          <div className="success-message">
            <h3>✅ Hoàn tất đặt hàng!</h3>
            {orderNumber && (
              <div style={{ marginTop: '15px', padding: '15px', background: '#f0f8ff', borderRadius: '8px' }}>
                <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#0066cc' }}>
                  📦 Số đơn hàng: <span style={{ color: '#004499' }}>{orderNumber}</span>
                </p>
                {paymentId && (
                  <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                    💳 Mã thanh toán: {paymentId}
                  </p>
                )}
                <p style={{ fontSize: '14px', color: '#28a745', marginTop: '10px', fontWeight: 'bold' }}>
                  ✨ Cảm ơn bạn đã đặt hàng!
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Thông tin xe */}
            <div className="car-info-box">
              <h4>Thông tin xe đặt mua:</h4>
              <p><strong>Xe:</strong> {carName || "—"}</p>
              <p><strong>Màu:</strong> {carColor || "—"}</p>
              {carPrice && (
                <p><strong>Giá:</strong> {carPrice.toLocaleString('vi-VN')} ₫</p>
              )}
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* Bước 1: Form khách hàng */}
            {step === 1 && (
              <form onSubmit={handleCreateCustomer}>
                <div className="form-grid">
                  <input
                    name="firstName"
                    placeholder="Họ *"
                    value={customerForm.firstName}
                    onChange={(e) => setCustomerForm({ ...customerForm, firstName: e.target.value })}
                    required
                  />
                  <input
                    name="lastName"
                    placeholder="Tên *"
                    value={customerForm.lastName}
                    onChange={(e) => setCustomerForm({ ...customerForm, lastName: e.target.value })}
                    required
                  />
                  <input
                    name="email"
                    type="email"
                    placeholder="Email *"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    required
                  />
                  <input
                    name="phone"
                    placeholder="Số điện thoại *"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    required
                  />
                  <input
                    name="dateOfBirth"
                    type="date"
                    placeholder="Ngày sinh"
                    value={customerForm.dateOfBirth}
                    onChange={(e) => setCustomerForm({ ...customerForm, dateOfBirth: e.target.value })}
                  />
                  <input
                    name="address"
                    placeholder="Địa chỉ"
                    value={customerForm.address}
                    onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                  />
                  <input
                    name="city"
                    placeholder="Thành phố"
                    value={customerForm.city}
                    onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                  />
                  <input
                    name="province"
                    placeholder="Tỉnh"
                    value={customerForm.province}
                    onChange={(e) => setCustomerForm({ ...customerForm, province: e.target.value })}
                  />
                </div>
                <div className="form-actions">
                  <button type="button" onClick={onClose}>Hủy</button>
                  <button type="submit" disabled={loading}>
                    {loading ? "Đang tạo..." : "Tiếp theo →"}
                  </button>
                </div>
              </form>
            )}

            {/* Bước 2: Form đơn hàng */}
            {step === 2 && (
              <form onSubmit={handleCreateOrder}>
                {/* Hiển thị thông báo inventory */}
                {inventoryError && (
                  <div style={{
                    padding: '15px',
                    background: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: '8px',
                    marginBottom: '15px',
                    color: '#856404'
                  }}>
                    <strong>⚠️ Lưu ý:</strong> {inventoryError}
                  </div>
                )}
                {availableInventory.length > 0 && !inventoryError && (
                  <div style={{
                    padding: '15px',
                    background: '#d4edda',
                    border: '1px solid #28a745',
                    borderRadius: '8px',
                    marginBottom: '15px',
                    color: '#155724'
                  }}>
                    <strong>✅ Có sẵn:</strong> {availableInventory.length} xe trong kho
                  </div>
                )}
                <div className="form-grid">
                  <label>
                    Biến thể xe *
                    <select
                      value={orderForm.variantId}
                      onChange={(e) => setOrderForm({ ...orderForm, variantId: e.target.value })}
                      required
                    >
                      <option value="">-- Chọn biến thể --</option>
                      {variants.map((v) => (
                        <option key={v.variantId || v.id} value={v.variantId || v.id}>
                          {v.variantName || `${v.model?.brand?.brandName || ""} ${v.model?.modelName || ""} ${v.variantName || ""}`}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Màu sắc
                    <select
                      value={orderForm.colorId}
                      onChange={(e) => setOrderForm({ ...orderForm, colorId: e.target.value })}
                    >
                      <option value="">-- Chọn màu --</option>
                      {colors.map((c) => (
                        <option key={c.colorId || c.id} value={c.colorId || c.id}>
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
                      value={orderForm.totalAmount}
                      onChange={(e) => setOrderForm({ ...orderForm, totalAmount: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Tiền đặt cọc (VNĐ) (Tùy chọn)
                    <input
                      type="number"
                      placeholder="120000000"
                      value={orderForm.depositAmount}
                      onChange={(e) => setOrderForm({ ...orderForm, depositAmount: e.target.value })}
                    />
                  </label>
                  <label>
                    Phương thức thanh toán
                    <select
                      value={orderForm.paymentMethod}
                      onChange={(e) => setOrderForm({ ...orderForm, paymentMethod: e.target.value })}
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
                    onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                    rows="3"
                  />
                </div>
                <div className="form-actions">
                  <button type="button" onClick={() => setStep(1)}>← Quay lại</button>
                  <button type="button" onClick={onClose}>Hủy</button>
                  <button type="submit" disabled={loading}>
                    {loading ? "Đang tạo..." : "Tiếp theo →"}
                  </button>
                </div>
              </form>
            )}

            {/* Bước 3: Form thanh toán */}
            {step === 3 && (
              <form onSubmit={handleCreatePayment}>
                <div className="form-grid">
                  <label>
                    Số tiền thanh toán (VNĐ) *
                    <input
                      type="number"
                      placeholder="120000000"
                      value={paymentForm.paymentAmount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, paymentAmount: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Phương thức thanh toán *
                    <select
                      value={paymentForm.paymentMethod}
                      onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                      required
                    >
                      <option value="cash">Tiền mặt</option>
                      <option value="bank_transfer">Chuyển khoản</option>
                      <option value="credit_card">Thẻ tín dụng</option>
                      <option value="installment">Trả góp</option>
                    </select>
                  </label>
                  <label>
                    Ngày thanh toán *
                    <input
                      type="date"
                      value={paymentForm.paymentDate}
                      onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Mã tham chiếu giao dịch
                    <input
                      type="text"
                      placeholder="VD: TXN123456"
                      value={paymentForm.transactionReference}
                      onChange={(e) => setPaymentForm({ ...paymentForm, transactionReference: e.target.value })}
                    />
                  </label>
                  <textarea
                    placeholder="Ghi chú thanh toán"
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    rows="3"
                  />
                </div>
                <div className="form-actions">
                  <button type="button" onClick={() => setStep(2)}>← Quay lại</button>
                  <button type="button" onClick={onClose}>Hủy</button>
                  <button type="submit" disabled={loading}>
                    {loading ? "Đang xử lý..." : "Hoàn tất"}
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

