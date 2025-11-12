import { useEffect, useState } from "react";
import { FaSearch, FaEye, FaPen, FaTrash, FaPlus } from "react-icons/fa";
import { inventoryAPI, publicVehicleAPI, warehouseAPI } from "../../services/API";
import "./Customer.css";

export default function VehicleInventory() {
  const [vehicles, setVehicles] = useState([]);
  const [variants, setVariants] = useState([]);
  const [colors, setColors] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    vin: "",
    chassisNumber: "",
    licensePlate: "",
    variantId: "",
    colorId: "",
    warehouseId: "",
    manufacturingDate: "",
    arrivalDate: "",
    price: "",
    status: "AVAILABLE",
  });

  // 🔹 Helper: Lấy tên từ ID
  const getVariantName = (variantId) => {
    if (!variantId) return "—";
    const variant = variants.find(v => 
      v.variantId === variantId || 
      v.id === variantId ||
      String(v.variantId) === String(variantId) ||
      String(v.id) === String(variantId)
    );
    return variant?.variantName || variant?.name || "—";
  };

  const getColorName = (colorId) => {
    if (!colorId) return "—";
    const color = colors.find(c => 
      c.colorId === colorId || 
      c.id === colorId ||
      String(c.colorId) === String(colorId) ||
      String(c.id) === String(colorId)
    );
    return color?.colorName || color?.color || "—";
  };

  const getWarehouseName = (warehouseId) => {
    if (!warehouseId) return "—";
    const warehouse = warehouses.find(w => 
      w.warehouseId === warehouseId || 
      w.id === warehouseId ||
      String(w.warehouseId) === String(warehouseId) ||
      String(w.id) === String(warehouseId)
    );
    return warehouse?.warehouseName || warehouse?.name || "—";
  };

  // 🔹 Load data khi mở trang
  const fetchAll = async () => {
    try {
      // Load variants, colors, warehouses trước
      const [variantRes, colorRes, warehouseRes1, warehouseRes2] = await Promise.all([
        publicVehicleAPI.getVariants(),
        publicVehicleAPI.getColors(),
        warehouseAPI.getWarehouses().catch(() => ({ data: [] })),
        publicVehicleAPI.getWarehouses().catch(() => ({ data: [] })),
      ]);

      // Chọn API nào có dữ liệu
      const warehouseRes = warehouseRes1?.data?.length > 0 ? warehouseRes1 : warehouseRes2;

      setVariants(variantRes.data || []);
      setColors(colorRes.data || []);
      setWarehouses(warehouseRes?.data || []);

      // 🔍 Debug: Log dữ liệu để kiểm tra
      console.log("📦 Variants:", variantRes.data);
      console.log("🎨 Colors:", colorRes.data);
      console.log("🏭 Warehouses:", warehouseRes?.data);

      // Thử nhiều cách lấy inventory
      let vehicleRes = null;
      let vehiclesList = [];
      
      // Cách 1: Thử public API - available inventory (theo tài liệu)
      try {
        console.log("🔍 Thử 1: Public API - getAvailableInventory");
        vehicleRes = await publicVehicleAPI.getAvailableInventory();
        console.log("✅ Thành công với getAvailableInventory:", vehicleRes);
        
        // Xử lý response
        if (Array.isArray(vehicleRes.data)) {
          vehiclesList = vehicleRes.data;
        } else if (Array.isArray(vehicleRes.data?.data)) {
          vehiclesList = vehicleRes.data.data;
        } else if (Array.isArray(vehicleRes)) {
          vehiclesList = vehicleRes;
        }
        
        console.log("📊 Từ getAvailableInventory nhận được:", vehiclesList.length, "xe");
        
        // Nếu mảng rỗng, thử endpoint khác
        if (vehiclesList.length === 0) {
          console.warn("⚠️ getAvailableInventory trả về mảng rỗng, thử endpoint khác");
          throw new Error("Empty array from getAvailableInventory");
        }
      } catch (err1) {
        console.warn("⚠️ Lỗi với getAvailableInventory hoặc mảng rỗng:", err1.response?.status, err1.response?.data);
        
        // Cách 2: Thử public API - tất cả inventory
        try {
          console.log("🔍 Thử 2: Public API - getInventory (/api/public/vehicle-inventory)");
          vehicleRes = await publicVehicleAPI.getInventory();
          console.log("✅ Thành công với getInventory:", vehicleRes);
          
          // Xử lý response
          if (Array.isArray(vehicleRes.data)) {
            vehiclesList = vehicleRes.data;
          } else if (Array.isArray(vehicleRes.data?.data)) {
            vehiclesList = vehicleRes.data.data;
          } else if (Array.isArray(vehicleRes)) {
            vehiclesList = vehicleRes;
          }
          
          console.log("📊 Từ getInventory nhận được:", vehiclesList.length, "xe");
          
          // Filter chỉ lấy available
          if (vehiclesList.length > 0) {
            vehiclesList = vehiclesList.filter(v => {
              const status = (v.status || "").toLowerCase();
              return status === "available" || status === "AVAILABLE";
            });
            console.log("📊 Sau khi filter available:", vehiclesList.length, "xe");
          }
        } catch (err2) {
          console.warn("⚠️ Lỗi với public getInventory:", err2.response?.status, err2.response?.data);
          
          // Cách 3: Thử authenticated API (nếu có token)
          const token = localStorage.getItem('token');
          if (token) {
            try {
              console.log("🔍 Thử 3: Authenticated API - inventoryAPI.getInventory");
              vehicleRes = await inventoryAPI.getInventory();
              console.log("✅ Thành công với inventoryAPI.getInventory:", vehicleRes);
              
              // Xử lý response
              if (Array.isArray(vehicleRes.data)) {
                vehiclesList = vehicleRes.data;
              } else if (Array.isArray(vehicleRes.data?.data)) {
                vehiclesList = vehicleRes.data.data;
              } else if (Array.isArray(vehicleRes)) {
                vehiclesList = vehicleRes;
              }
              
              console.log("📊 Từ inventoryAPI.getInventory nhận được:", vehiclesList.length, "xe");
              
              // Filter chỉ lấy available
              if (vehiclesList.length > 0) {
                vehiclesList = vehiclesList.filter(v => {
                  const status = (v.status || "").toLowerCase();
                  return status === "available" || status === "AVAILABLE";
                });
                console.log("📊 Sau khi filter available:", vehiclesList.length, "xe");
              }
            } catch (err3) {
              console.error("❌ Lỗi với cả 3 cách:", err3);
              throw err3;
            }
          } else {
            throw err2;
          }
        }
      }

      console.log("📊 Tổng số inventory nhận được:", vehiclesList.length);
      if (vehiclesList.length > 0) {
        console.log("📊 Sample inventory item:", vehiclesList[0]);
        console.log("📊 Sample inventory keys:", Object.keys(vehiclesList[0]));
      } else {
        console.warn("⚠️ Không có xe nào trong inventory!");
      }

      setVehicles(vehiclesList);
    } catch (error) {
      console.error("❌ Lỗi tải dữ liệu:", error);
      console.error("❌ Error response:", error.response?.data);
      setError("Không thể tải danh sách xe. Vui lòng thử lại sau.");
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // 🔹 Tìm kiếm theo biển số
  useEffect(() => {
    const delay = setTimeout(async () => {
      const q = searchTerm.trim();
      if (!q) {
        fetchAll();
        return;
      }
      try {
        // Thử lấy từ public API trước
        let allVehicles = null;
        try {
          allVehicles = await publicVehicleAPI.getAvailableInventory();
        } catch (err1) {
          try {
            allVehicles = await publicVehicleAPI.getInventory();
          } catch (err2) {
            const token = localStorage.getItem('token');
            if (token) {
              allVehicles = await inventoryAPI.getInventory();
            } else {
              throw err2;
            }
          }
        }

        // Xử lý response structure
        let vehiclesList = [];
        if (allVehicles) {
          if (Array.isArray(allVehicles.data)) {
            vehiclesList = allVehicles.data;
          } else if (Array.isArray(allVehicles.data?.data)) {
            vehiclesList = allVehicles.data.data;
          } else if (Array.isArray(allVehicles)) {
            vehiclesList = allVehicles;
          }
        }

        const filtered = vehiclesList.filter(v => 
          v.licensePlate?.toLowerCase().includes(q.toLowerCase()) ||
          v.vin?.toLowerCase().includes(q.toLowerCase()) ||
          v.chassisNumber?.toLowerCase().includes(q.toLowerCase()) ||
          (v.inventoryId && String(v.inventoryId).toLowerCase().includes(q.toLowerCase()))
        );
        setVehicles(filtered);
      } catch (err) {
        console.error("Lỗi tìm kiếm:", err);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  // 🔹 Mở popup thêm mới
  const handleOpenAdd = () => {
    setIsEdit(false);
    setSelectedVehicle(null);
    setFormData({
      vin: "",
      chassisNumber: "",
      licensePlate: "",
      variantId: "",
      colorId: "",
      warehouseId: "",
      manufacturingDate: "",
      arrivalDate: "",
      price: "",
      status: "AVAILABLE",
    });
    setError("");
    setShowPopup(true);
  };

  // 🔹 Mở popup sửa
  const handleEdit = (v) => {
    setIsEdit(true);
    setSelectedVehicle(v);
    setFormData({
      vin: v.vin || "",
      chassisNumber: v.chassisNumber || "",
      licensePlate: v.licensePlate || "",
      variantId: v.variantId || "",
      colorId: v.colorId || "",
      warehouseId: v.warehouseId || "",
      manufacturingDate: v.manufacturingDate || "",
      arrivalDate: v.arrivalDate || "",
      price: v.price || "",
      status: v.status || "AVAILABLE",
    });
    setError("");
    setShowPopup(true);
  };

  // 🔹 Xem chi tiết
  const handleView = (v) => {
    setSelectedVehicle(v);
    setShowDetail(true);
  };

  // 🔹 Thêm hoặc sửa xe
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.vin || !formData.variantId) {
      setError("Vui lòng nhập đầy đủ: VIN và Biến thể.");
      return;
    }

    // 🔍 Debug: Log formData trước khi submit
    console.log("📤 FormData trước khi submit:", formData);
    console.log("📤 variantId:", formData.variantId, "type:", typeof formData.variantId);
    console.log("📤 colorId:", formData.colorId, "type:", typeof formData.colorId);
    console.log("📤 warehouseId:", formData.warehouseId, "type:", typeof formData.warehouseId);

    const payload = {
      vin: formData.vin,
      chassisNumber: formData.chassisNumber || "",
      licensePlate: formData.licensePlate || "",
      variantId: formData.variantId ? Number(formData.variantId) : null,
      colorId: formData.colorId && formData.colorId !== "" ? Number(formData.colorId) : null,
      warehouseId: formData.warehouseId && formData.warehouseId !== "" ? Number(formData.warehouseId) : null,
      manufacturingDate: formData.manufacturingDate || null,
      arrivalDate: formData.arrivalDate || null,
      price: formData.price ? Number(formData.price) : null,
      status: formData.status || "AVAILABLE",
    };

    console.log("📤 Payload gửi lên server:", payload);

    try {
      if (isEdit && selectedVehicle) {
        await inventoryAPI.updateInventory(selectedVehicle.id, payload);
        alert("✅ Cập nhật xe thành công!");
      } else {
        await inventoryAPI.createInventory(payload);
        alert("✅ Thêm xe thành công!");
      }
      setShowPopup(false);
      fetchAll();
    } catch (err) {
      console.error("❌ Lỗi lưu xe:", err);
      const msg = err.response?.data?.message || JSON.stringify(err.response?.data) || err.message;
      setError("Lưu thất bại: " + msg);
      alert("Lưu thất bại: " + msg);
    }
  };

  // 🔹 Xóa xe
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa xe này không?")) return;
    try {
      await inventoryAPI.deleteInventory(id);
      alert("✅ Xóa thành công!");
      fetchAll();
    } catch (error) {
      console.error("❌ Lỗi xóa xe:", error);
      const msg = error.response?.data?.message || error.message || "Không thể xóa xe";
      alert("Không thể xóa xe: " + msg);
    }
  };

  return (
    <div className="customer">
      <div className="title-customer">📦 Quản lý kho xe</div>

      <div className="title2-customer">
        <h2>Danh sách xe trong kho ({vehicles.length} xe)</h2>
        <h3 onClick={handleOpenAdd}><FaPlus /> Thêm xe</h3>
      </div>

      {/* Debug Info */}
      <div style={{
        background: "#f3f4f6",
        padding: "10px",
        borderRadius: "6px",
        marginBottom: "15px",
        fontSize: "12px"
      }}>
        <b>Debug:</b> Variants: {variants.length} | Colors: {colors.length} | Warehouses: {warehouses.length}
        {warehouses.length > 0 && (
          <div style={{ marginTop: "5px" }}>
            Danh sách kho: {warehouses.map(w => w.warehouseName || w.name || w.warehouseId || w.id).join(", ")}
          </div>
        )}
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm theo biển số, VIN, chassis..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="customer-table-container">
        <table className="customer-table">
          <thead>
            <tr>
              <th>VIN</th>
              <th>Biển số</th>
              <th>Biến thể</th>
              <th>Màu</th>
              <th>Kho</th>
              <th>Giá</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.length > 0 ? (
              vehicles.map((v) => {
                const vehicleId = v.inventoryId || v.id;
                const sellingPrice = v.sellingPrice || v.price || 0;
                const status = (v.status || "").toUpperCase();
                
                return (
                  <tr key={vehicleId}>
                    <td>{v.vin || "—"}</td>
                    <td>{v.licensePlate || "—"}</td>
                    <td>{getVariantName(v.variantId)}</td>
                    <td>{getColorName(v.colorId)}</td>
                    <td>{getWarehouseName(v.warehouseId)}</td>
                    <td>{sellingPrice ? `${Number(sellingPrice).toLocaleString('vi-VN')} đ` : "—"}</td>
                    <td>
                      <span style={{
                        background: status === 'AVAILABLE' ? "#dcfce7" : "#fee2e2",
                        color: status === 'AVAILABLE' ? "#16a34a" : "#dc2626",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "500",
                      }}>
                        {status || "—"}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button onClick={() => handleView(v)} className="icon-btn view"><FaEye /></button>
                      <button onClick={() => handleEdit(v)} className="icon-btn edit"><FaPen /></button>
                      <button onClick={() => handleDelete(vehicleId)} className="icon-btn delete"><FaTrash /></button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "40px" }}>
                  {error ? (
                    <div style={{ color: "#dc2626" }}>{error}</div>
                  ) : (
                    "Không có dữ liệu"
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Popup Thêm / Sửa */}
      {showPopup && (
        <div className="popup-overlay" onClick={(e) => { if (e.target.className === 'popup-overlay') setShowPopup(false); }}>
          <div className="popup-box">
            <h2>{isEdit ? "✏️ Sửa xe" : "➕ Thêm xe"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <input
                  name="vin"
                  placeholder="VIN *"
                  value={formData.vin}
                  onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                  required
                />

                <input
                  name="chassisNumber"
                  placeholder="Số khung"
                  value={formData.chassisNumber}
                  onChange={(e) => setFormData({ ...formData, chassisNumber: e.target.value })}
                />

                <input
                  name="licensePlate"
                  placeholder="Biển số"
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                />

                <select
                  name="variantId"
                  value={formData.variantId || ""}
                  onChange={(e) => {
                    console.log("🔹 Selected variantId:", e.target.value);
                    setFormData({ ...formData, variantId: e.target.value });
                  }}
                  required
                >
                  <option value="">-- Chọn biến thể --</option>
                  {variants.map((v) => {
                    const variantId = v.variantId || v.id || v.variant?.variantId || v.variant?.id;
                    const variantName = v.variantName || v.name || v.variant?.variantName || v.variant?.name || `Variant ${variantId}`;
                    return (
                      <option key={variantId} value={String(variantId || "")}>
                        {variantName}
                      </option>
                    );
                  })}
                </select>

                <select
                  name="colorId"
                  value={formData.colorId || ""}
                  onChange={(e) => {
                    console.log("🎨 Selected colorId:", e.target.value);
                    setFormData({ ...formData, colorId: e.target.value });
                  }}
                >
                  <option value="">-- Chọn màu --</option>
                  {colors.map((c) => {
                    const colorId = c.colorId || c.id || c.color?.colorId || c.color?.id;
                    const colorName = c.colorName || c.color || c.name || c.color?.colorName || c.color?.color || `Color ${colorId}`;
                    return (
                      <option key={colorId} value={String(colorId || "")}>
                        {colorName}
                      </option>
                    );
                  })}
                </select>

                <select
                  name="warehouseId"
                  value={formData.warehouseId || ""}
                  onChange={(e) => {
                    console.log("🏭 Selected warehouseId:", e.target.value);
                    setFormData({ ...formData, warehouseId: e.target.value });
                  }}
                >
                  <option value="">-- Chọn kho --</option>
                  {warehouses.map((w) => {
                    const warehouseId = w.warehouseId || w.id || w.warehouse?.warehouseId || w.warehouse?.id;
                    const warehouseName = w.warehouseName || w.name || w.warehouse?.warehouseName || w.warehouse?.name || `Warehouse ${warehouseId}`;
                    return (
                      <option key={warehouseId} value={String(warehouseId || "")}>
                        {warehouseName}
                      </option>
                    );
                  })}
                </select>

                <input
                  name="price"
                  type="number"
                  placeholder="Giá (VNĐ)"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />

                <select
                  name="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="SOLD">Sold</option>
                  <option value="RESERVED">Reserved</option>
                  <option value="IN_TRANSIT">In Transit</option>
                </select>

                <input
                  name="manufacturingDate"
                  type="date"
                  placeholder="Ngày sản xuất"
                  value={formData.manufacturingDate}
                  onChange={(e) => setFormData({ ...formData, manufacturingDate: e.target.value })}
                />

                <input
                  name="arrivalDate"
                  type="date"
                  placeholder="Ngày nhập kho"
                  value={formData.arrivalDate}
                  onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                />
              </div>

              {error && <div className="error" style={{ color: 'red', marginTop: 8 }}>{error}</div>}

              <div className="form-actions">
                <button type="submit">{isEdit ? "Cập nhật" : "Tạo mới"}</button>
                <button type="button" onClick={() => setShowPopup(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup xem chi tiết */}
      {showDetail && selectedVehicle && (
        <div className="popup-overlay" onClick={(e) => { if (e.target.className === 'popup-overlay') setShowDetail(false); }}>
          <div className="popup-box">
            <h2>👁️ Chi tiết xe</h2>
            <p><b>VIN:</b> {selectedVehicle.vin || "—"}</p>
            <p><b>Số khung:</b> {selectedVehicle.chassisNumber || "—"}</p>
            <p><b>Biển số:</b> {selectedVehicle.licensePlate || "—"}</p>
            <p><b>Biến thể:</b> {getVariantName(selectedVehicle.variantId)}</p>
            <p><b>Màu:</b> {getColorName(selectedVehicle.colorId)}</p>
            <p><b>Kho:</b> {getWarehouseName(selectedVehicle.warehouseId)}</p>
            <p><b>Giá:</b> {selectedVehicle.price ? `${Number(selectedVehicle.price).toLocaleString()} đ` : "—"}</p>
            <p><b>Trạng thái:</b> {selectedVehicle.status || "—"}</p>
            <p><b>Ngày sản xuất:</b> {selectedVehicle.manufacturingDate || "—"}</p>
            <p><b>Ngày nhập kho:</b> {selectedVehicle.arrivalDate || "—"}</p>
            <button onClick={() => setShowDetail(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}