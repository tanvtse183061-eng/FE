import './Customer.css';
import { FaSearch, FaEye, FaPen, FaTrash, FaPlus } from "react-icons/fa";
import { useEffect, useState } from "react";
import API from '../Login/API';

export default function VehicleInventory() {
  const [inventories, setInventories] = useState([]);
  const [variants, setVariants] = useState([]);
  const [colors, setColors] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    variantId: "",
    colorId: "",
    warehouseId: "",
    dealerId: "",
    vin: "",
    stockQuantity: 0,
    availableQuantity: 0,
    reservedQuantity: 0,
    status: "IN_STOCK",
    condition: "NEW",
    manufacturingDate: "",
    arrivalDate: "",
    notes: "",
  });

  // ✅ Lấy danh sách variants
  const fetchVariants = async () => {
    try {
      const res = await API.get("/api/vehicles/variants");
      setVariants(res.data);
    } catch (err) {
      console.error("Lỗi lấy variants:", err);
    }
  };

  // ✅ Lấy danh sách colors
  const fetchColors = async () => {
    try {
      const res = await API.get("/api/vehicles/colors");
      setColors(res.data);
    } catch (err) {
      console.error("Lỗi lấy colors:", err);
    }
  };

  // ✅ Lấy danh sách warehouses
  const fetchWarehouses = async () => {
    try {
      const res = await API.get("/api/warehouses");
      setWarehouses(res.data);
    } catch (err) {
      console.error("Lỗi lấy warehouses:", err);
    }
  };

  // ✅ Lấy danh sách dealers
  const fetchDealers = async () => {
    try {
      const res = await API.get("/api/dealers");
      setDealers(res.data);
    } catch (err) {
      console.error("Lỗi lấy dealers:", err);
    }
  };

  // ✅ Lấy danh sách inventories
  const fetchInventories = async () => {
    try {
      const res = await API.get("/api/inventory");
      setInventories(res.data);
    } catch (err) {
      console.error("Lỗi lấy inventory:", err);
    }
  };

  useEffect(() => {
    fetchVariants();
    fetchColors();
    fetchWarehouses();
    fetchDealers();
    fetchInventories();
  }, []);

  // ✅ Tìm kiếm
  useEffect(() => {
    const delay = setTimeout(async () => {
      const trimmed = searchTerm.trim();
      if (trimmed === "") {
        fetchInventories();
        return;
      }
      try {
        const res = await API.get(`/api/inventory/search?keyword=${encodeURIComponent(trimmed)}`);
        setInventories(res.data);
      } catch (err) {
        console.error("Lỗi tìm kiếm:", err);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  // ✅ Xem chi tiết
  const handleView = (inventory) => {
    setSelectedInventory(inventory);
    setShowDetail(true);
  };

  // ✅ Mở form thêm
  const handleOpenAdd = () => {
    setIsEdit(false);
    setError("");
    setFormData({
      variantId: "",
      colorId: "",
      warehouseId: "",
      dealerId: "",
      vin: "",
      stockQuantity: 0,
      availableQuantity: 0,
      reservedQuantity: 0,
      status: "IN_STOCK",
      condition: "NEW",
      manufacturingDate: "",
      arrivalDate: "",
      notes: "",
    });
    setShowPopup(true);
  };

  // ✅ Mở form sửa
  const handleEdit = (inventory) => {
    setIsEdit(true);
    setSelectedInventory(inventory);
    setError("");
    setFormData({
      variantId: inventory.variant?.variantId || "",
      colorId: inventory.color?.colorId || "",
      warehouseId: inventory.warehouse?.warehouseId || "",
      dealerId: inventory.dealer?.dealerId || "",
      vin: inventory.vin || "",
      stockQuantity: inventory.stockQuantity || 0,
      availableQuantity: inventory.availableQuantity || 0,
      reservedQuantity: inventory.reservedQuantity || 0,
      status: inventory.status || "IN_STOCK",
      condition: inventory.condition || "NEW",
      manufacturingDate: inventory.manufacturingDate?.split('T')[0] || "",
      arrivalDate: inventory.arrivalDate?.split('T')[0] || "",
      notes: inventory.notes || "",
    });
    setShowPopup(true);
  };

  // ✅ Xóa
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa kho xe này không?")) return;
    try {
      await API.delete(`/api/inventory/${id}`);
      alert("Xóa thành công!");
      fetchInventories();
    } catch (err) {
      console.error("Lỗi xóa:", err);
      alert("Không thể xóa!");
    }
  };

  // ✅ Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.variantId || !formData.colorId || !formData.warehouseId) {
      setError("Vui lòng chọn biến thể, màu sắc và kho!");
      return;
    }

    const payload = {
      variantId: Number(formData.variantId),
      colorId: Number(formData.colorId),
      warehouseId: Number(formData.warehouseId),
      dealerId: formData.dealerId ? Number(formData.dealerId) : null,
      vin: formData.vin.trim() || null,
      stockQuantity: Number(formData.stockQuantity),
      availableQuantity: Number(formData.availableQuantity),
      reservedQuantity: Number(formData.reservedQuantity),
      status: formData.status,
      condition: formData.condition,
      manufacturingDate: formData.manufacturingDate || null,
      arrivalDate: formData.arrivalDate || null,
      notes: formData.notes.trim() || null,
    };

    try {
      if (isEdit && selectedInventory) {
        await API.put(`/api/inventory/${selectedInventory.inventoryId}`, payload);
        alert("Cập nhật thành công!");
      } else {
        await API.post("/api/inventory", payload);
        alert("Thêm mới thành công!");
      }
      setShowPopup(false);
      fetchInventories();
    } catch (err) {
      console.error("Lỗi lưu:", err);
      alert("Không thể lưu!");
    }
  };

  return (
    <div className="customer">
      <div className="title-customer">Quản lý kho xe</div>
      <div className="title2-customer">
        <h2>Danh sách xe trong kho</h2>
        <h3 onClick={handleOpenAdd}>
          <FaPlus /> Thêm xe vào kho
        </h3>
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm xe..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="customer-table-container">
        <table className="customer-table">
          <thead>
            <tr>
              <th>VIN</th>
              <th>BIẾN THỂ</th>
              <th>MÀU SẮC</th>
              <th>KHO</th>
              <th>ĐẠI LÝ</th>
              <th>SỐ LƯỢNG</th>
              <th>CÓ SẴN</th>
              <th>TRẠNG THÁI</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {inventories.length > 0 ? (
              inventories.map((inv) => (
                <tr key={inv.inventoryId}>
                  <td>{inv.vin || "—"}</td>
                  <td>{inv.variant?.variantName || "—"}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          backgroundColor: inv.color?.colorCode || "#ccc",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                        }}
                      ></div>
                      {inv.color?.colorName || "—"}
                    </div>
                  </td>
                  <td>{inv.warehouse?.warehouseName || "—"}</td>
                  <td>{inv.dealer?.dealerName || "—"}</td>
                  <td>{inv.stockQuantity || 0}</td>
                  <td>{inv.availableQuantity || 0}</td>
                  <td>
                    <span
                      style={{
                        background: inv.status === "IN_STOCK" ? "#dcfce7" : "#fee2e2",
                        color: inv.status === "IN_STOCK" ? "#16a34a" : "#dc2626",
                        padding: "5px 8px",
                        borderRadius: "5px",
                      }}
                    >
                      {inv.status === "IN_STOCK" ? "Còn hàng" : inv.status}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button className="icon-btn view" onClick={() => handleView(inv)}>
                      <FaEye />
                    </button>
                    <button className="icon-btn edit" onClick={() => handleEdit(inv)}>
                      <FaPen />
                    </button>
                    <button className="icon-btn delete" onClick={() => handleDelete(inv.inventoryId)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", color: "#666" }}>
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Popup thêm/sửa */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box" style={{ maxWidth: "700px" }}>
            <h2>{isEdit ? "Sửa thông tin xe" : "Thêm xe vào kho"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div>
                  <label>Biến thể xe *</label>
                  <select
                    value={formData.variantId}
                    onChange={(e) => setFormData({ ...formData, variantId: e.target.value })}
                    style={{ color: "black" }}
                    required
                  >
                    <option value="">-- Chọn biến thể --</option>
                    {variants.map((v) => (
                      <option key={v.variantId} value={v.variantId}>
                        {v.variantName} ({v.model?.modelName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>Màu sắc *</label>
                  <select
                    value={formData.colorId}
                    onChange={(e) => setFormData({ ...formData, colorId: e.target.value })}
                    style={{ color: "black" }}
                    required
                  >
                    <option value="">-- Chọn màu --</option>
                    {colors.map((c) => (
                      <option key={c.colorId} value={c.colorId}>
                        {c.colorName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>Kho *</label>
                  <select
                    value={formData.warehouseId}
                    onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                    style={{ color: "black" }}
                    required
                  >
                    <option value="">-- Chọn kho --</option>
                    {warehouses.map((w) => (
                      <option key={w.warehouseId} value={w.warehouseId}>
                        {w.warehouseName} - {w.city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>Đại lý (Optional)</label>
                  <select
                    value={formData.dealerId}
                    onChange={(e) => setFormData({ ...formData, dealerId: e.target.value })}
                    style={{ color: "black" }}
                  >
                    <option value="">-- Không chọn --</option>
                    {dealers.map((d) => (
                      <option key={d.dealerId} value={d.dealerId}>
                        {d.dealerName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>VIN (Số khung)</label>
                  <input
                    placeholder="VIN"
                    value={formData.vin}
                    onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                    style={{ color: "black" }}
                  />
                </div>

                <div>
                  <label>Số lượng tồn kho</label>
                  <input
                    type="number"
                    placeholder="Số lượng"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    style={{ color: "black" }}
                  />
                </div>

                <div>
                  <label>Số lượng có sẵn</label>
                  <input
                    type="number"
                    placeholder="Có sẵn"
                    value={formData.availableQuantity}
                    onChange={(e) => setFormData({ ...formData, availableQuantity: e.target.value })}
                    style={{ color: "black" }}
                  />
                </div>

                <div>
                  <label>Số lượng đã đặt</label>
                  <input
                    type="number"
                    placeholder="Đã đặt"
                    value={formData.reservedQuantity}
                    onChange={(e) => setFormData({ ...formData, reservedQuantity: e.target.value })}
                    style={{ color: "black" }}
                  />
                </div>

                <div>
                  <label>Trạng thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ color: "black" }}
                  >
                    <option value="IN_STOCK">Còn hàng</option>
                    <option value="OUT_OF_STOCK">Hết hàng</option>
                    <option value="IN_TRANSIT">Đang vận chuyển</option>
                    <option value="RESERVED">Đã đặt</option>
                  </select>
                </div>

                <div>
                  <label>Tình trạng</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    style={{ color: "black" }}
                  >
                    <option value="NEW">Mới</option>
                    <option value="USED">Đã qua sử dụng</option>
                    <option value="DEMO">Demo</option>
                  </select>
                </div>

                <div>
                  <label>Ngày sản xuất</label>
                  <input
                    type="date"
                    value={formData.manufacturingDate}
                    onChange={(e) => setFormData({ ...formData, manufacturingDate: e.target.value })}
                    style={{ color: "black" }}
                  />
                </div>

                <div>
                  <label>Ngày nhập kho</label>
                  <input
                    type="date"
                    value={formData.arrivalDate}
                    onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                    style={{ color: "black" }}
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label>Ghi chú</label>
                  <textarea
                    placeholder="Ghi chú..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    style={{ color: "black" }}
                  ></textarea>
                </div>
              </div>

              {error && <span className="error">{error}</span>}

              <div className="form-actions">
                <button type="submit">{isEdit ? "Cập nhật" : "Tạo mới"}</button>
                <button type="button" onClick={() => setShowPopup(false)}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup xem chi tiết */}
      {showDetail && selectedInventory && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>Thông tin xe trong kho</h2>
            <p><b>VIN:</b> {selectedInventory.vin || "—"}</p>
            <p><b>Biến thể:</b> {selectedInventory.variant?.variantName}</p>
            <p><b>Màu sắc:</b> {selectedInventory.color?.colorName}</p>
            <p><b>Kho:</b> {selectedInventory.warehouse?.warehouseName}</p>
            <p><b>Đại lý:</b> {selectedInventory.dealer?.dealerName || "—"}</p>
            <p><b>Số lượng tồn:</b> {selectedInventory.stockQuantity}</p>
            <p><b>Có sẵn:</b> {selectedInventory.availableQuantity}</p>
            <p><b>Đã đặt:</b> {selectedInventory.reservedQuantity}</p>
            <p><b>Trạng thái:</b> {selectedInventory.status}</p>
            <p><b>Tình trạng:</b> {selectedInventory.condition}</p>
            <p><b>Ngày sản xuất:</b> {selectedInventory.manufacturingDate || "—"}</p>
            <p><b>Ngày nhập kho:</b> {selectedInventory.arrivalDate || "—"}</p>
            <p><b>Ghi chú:</b> {selectedInventory.notes || "—"}</p>
            <button className="btn-close" onClick={() => setShowDetail(false)}>
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}