import './Customer.css';
import { FaSearch, FaEye, FaPen, FaTrash, FaPlus } from "react-icons/fa";
import { useEffect, useState } from "react";
import API from '../Login/API';

export default function VehicleColor() {
  const [colors, setColors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    colorName: "",
    colorCode: "",
    colorType: "",
    priceAdjustment: 0,
    description: "",
    imageUrl: "",
    isAvailable: true,
    notes: "",
  });

  // ✅ Lấy danh sách màu
  const fetchColors = async () => {
    try {
      const res = await API.get("/api/vehicles/colors");
      console.log("📦 Colors từ API:", res.data);
      setColors(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách màu:", err);
      alert("Không thể tải danh sách màu!");
    }
  };

  useEffect(() => {
    fetchColors();
  }, []);

  // ✅ Tìm kiếm
  useEffect(() => {
    const delay = setTimeout(async () => {
      const trimmed = searchTerm.trim();
      if (trimmed === "") {
        fetchColors();
        return;
      }
      try {
        const res = await API.get(`/api/vehicles/colors/search?name=${encodeURIComponent(trimmed)}`);
        setColors(res.data);
      } catch (err) {
        console.error("Lỗi tìm kiếm:", err);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  // ✅ Xem chi tiết
  const handleView = (color) => {
    setSelectedColor(color);
    setShowDetail(true);
  };

  // ✅ Thêm
  const handleOpenAdd = () => {
    setIsEdit(false);
    setError("");
    setFormData({
      colorName: "",
      colorCode: "",
      colorType: "",
      priceAdjustment: 0,
      description: "",
      imageUrl: "",
      isAvailable: true,
      notes: "",
    });
    setShowPopup(true);
  };

  // ✅ Sửa
  const handleEdit = (color) => {
    setIsEdit(true);
    setSelectedColor(color);
    setError("");
    setFormData({
      colorName: color.colorName || "",
      colorCode: color.colorCode || "",
      colorType: color.colorType || "",
      priceAdjustment: color.priceAdjustment || 0,
      description: color.description || "",
      imageUrl: color.imageUrl || "",
      isAvailable: color.isAvailable !== undefined ? color.isAvailable : true,
      notes: color.notes || "",
    });
    setShowPopup(true);
  };

  // ✅ Xóa
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa màu này không?")) return;
    try {
      await API.delete(`/api/vehicles/colors/${id}`);
      alert("Xóa màu thành công!");
      fetchColors();
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
      alert("Không thể xóa màu!");
    }
  };

  // ✅ Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.colorName.trim() || !formData.colorCode.trim()) {
      setError("Vui lòng nhập tên và mã màu!");
      return;
    }

    const payload = {
      colorName: formData.colorName.trim(),
      colorCode: formData.colorCode.trim(),
      colorType: formData.colorType.trim() || "",
      priceAdjustment: Number(formData.priceAdjustment) || 0,
      description: formData.description.trim() || "",
      imageUrl: formData.imageUrl.trim() || "",
      isAvailable: Boolean(formData.isAvailable),
      notes: formData.notes.trim() || "",
    };

    console.log("📤 Payload gửi lên:", payload);

    try {
      if (isEdit && selectedColor) {
        await API.put(`/api/vehicles/colors/${selectedColor.colorId}`, payload);
        alert("Cập nhật màu thành công!");
      } else {
        await API.post("/api/vehicles/colors", payload);
        alert("Thêm màu mới thành công!");
      }
      setShowPopup(false);
      setError("");
      fetchColors();
    } catch (err) {
      console.error("Lỗi khi lưu màu:", err);
      const errorMsg = err.response?.data?.message || "Không thể lưu màu!";
      setError(errorMsg);
      alert("Lỗi: " + errorMsg);
    }
  };

  // Format giá
  const formatPrice = (price) => {
    if (!price || price === 0) return "0";
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  return (
    <div className="customer">
      <div className="title-customer">Quản lý màu xe</div>

      <div className="title2-customer">
        <h2>Danh sách màu ({colors.length})</h2>
        <h3 onClick={handleOpenAdd}>
          <FaPlus /> Thêm màu
        </h3>
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm màu..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="customer-table-container">
        <table className="customer-table">
          <thead>
            <tr>
              <th>HÌNH</th>
              <th>TÊN MÀU</th>
              <th>MÃ MÀU</th>
              <th>LOẠI</th>
              <th>GIÁ (+VNĐ)</th>
              <th>TRẠNG THÁI</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {colors.length > 0 ? (
              colors.map((c) => (
                <tr key={c.colorId}>
                  <td>
                    {c.imageUrl ? (
                      <img 
                        src={c.imageUrl} 
                        alt={c.colorName} 
                        style={{ width: "60px", height: "40px", borderRadius: "6px", objectFit: "cover" }}
                        onError={(e) => { e.target.src = "https://via.placeholder.com/60x40?text=No+Image" }}
                      />
                    ) : (
                      <div style={{ width: "60px", height: "40px", background: "#f0f0f0", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#999" }}>
                        No Image
                      </div>
                    )}
                  </td>
                  <td><strong>{c.colorName || "—"}</strong></td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ 
                        width: "24px", 
                        height: "24px", 
                        backgroundColor: c.colorCode || "#ccc", 
                        border: "2px solid #ccc", 
                        borderRadius: "4px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                      }}></div>
                      <span style={{ fontFamily: "monospace", fontSize: "13px" }}>{c.colorCode || "—"}</span>
                    </div>
                  </td>
                  <td>{c.colorType || "—"}</td>
                  <td>{formatPrice(c.priceAdjustment)}</td>
                  <td>
                    <span style={{
                      background: c.isAvailable ? "#dcfce7" : "#fee2e2",
                      color: c.isAvailable ? "#16a34a" : "#dc2626",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      fontSize: "12px",
                      fontWeight: "500"
                    }}>
                      {c.isAvailable ? "Có sẵn" : "Hết hàng"}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button className="icon-btn view" onClick={() => handleView(c)} title="Xem chi tiết"><FaEye /></button>
                    <button className="icon-btn edit" onClick={() => handleEdit(c)} title="Chỉnh sửa"><FaPen /></button>
                    <button className="icon-btn delete" onClick={() => handleDelete(c.colorId)} title="Xóa"><FaTrash /></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", color: "#666", padding: "30px" }}>Không có dữ liệu màu xe</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Popup thêm/sửa */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box" style={{ maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}>
            <h2>{isEdit ? "✏️ Sửa màu xe" : "➕ Thêm màu mới"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                
                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", color: "#333" }}>Tên màu *</label>
                  <input 
                    name="colorName" 
                    placeholder="VD: Đỏ Metallic" 
                    value={formData.colorName} 
                    onChange={(e) => setFormData({ ...formData, colorName: e.target.value })} 
                    style={{color:'black', width: "100%", padding: "8px"}}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", color: "#333" }}>Mã màu (Hex) *</label>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input 
                      type="color"
                      value={formData.colorCode || "#000000"}
                      onChange={(e) => setFormData({ ...formData, colorCode: e.target.value })}
                      style={{ width: "50px", height: "38px", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer" }}
                    />
                    <input 
                      name="colorCode" 
                      placeholder="#FF0000" 
                      value={formData.colorCode} 
                      onChange={(e) => setFormData({ ...formData, colorCode: e.target.value })} 
                      style={{color:'black', width: "100%", padding: "8px"}}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", color: "#333" }}>Loại màu</label>
                  <select
                    name="colorType"
                    value={formData.colorType}
                    onChange={(e) => setFormData({ ...formData, colorType: e.target.value })}
                    style={{color:'black', width: "100%", padding: "8px"}}
                  >
                    <option value="">-- Chọn loại --</option>
                    <option value="standard">Standard (Tiêu chuẩn)</option>
                    <option value="metallic">Metallic (Kim loại)</option>
                    <option value="pearl">Pearl (Ngọc trai)</option>
                    <option value="matte">Matte (Nhám)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", color: "#333" }}>Giá cộng thêm (VNĐ)</label>
                  <input 
                    name="priceAdjustment" 
                    type="number" 
                    placeholder="VD: 15000000" 
                    value={formData.priceAdjustment} 
                    onChange={(e) => setFormData({ ...formData, priceAdjustment: e.target.value })} 
                    style={{color:'black', width: "100%", padding: "8px"}}
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", color: "#333" }}>URL hình ảnh</label>
                  <input 
                    name="imageUrl" 
                    placeholder="https://example.com/image.jpg" 
                    value={formData.imageUrl} 
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} 
                    style={{color:'black', width: "100%", padding: "8px"}}
                  />
                  {formData.imageUrl && (
                    <img 
                      src={formData.imageUrl} 
                      alt="Preview" 
                      style={{ width: "100px", marginTop: "8px", borderRadius: "6px" }}
                      onError={(e) => { e.target.style.display = "none" }}
                    />
                  )}
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", color: "#333" }}>Trạng thái</label>
                  <select
                    value={String(formData.isAvailable)}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.value === "true" })}
                    style={{ color: 'black', width: "100%", padding: "8px" }}
                  >
                    <option value="true">✅ Có sẵn</option>
                    <option value="false">❌ Hết hàng</option>
                  </select>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", color: "#333" }}>Mô tả</label>
                  <textarea 
                    name="description" 
                    placeholder="Mô tả về màu xe..." 
                    value={formData.description} 
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                    style={{color:'black', width: "100%", padding: "8px", minHeight: "60px"}}
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", color: "#333" }}>Ghi chú nội bộ</label>
                  <textarea 
                    name="notes" 
                    placeholder="Ghi chú..." 
                    value={formData.notes} 
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })} 
                    style={{color:'black', width: "100%", padding: "8px", minHeight: "60px"}}
                  />
                </div>
              </div>

              {error && <div style={{ color: "red", marginTop: "10px", padding: "10px", background: "#fee", borderRadius: "5px" }}>❌ {error}</div>}

              <div className="form-actions" style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowPopup(false)} style={{ padding: "10px 20px", background: "#ddd", border: "none", borderRadius: "5px", cursor: "pointer" }}>Hủy</button>
                <button type="submit" style={{ padding: "10px 20px", background: "#4CAF50", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "500" }}>
                  {isEdit ? "💾 Cập nhật" : "➕ Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Popup xem chi tiết */}
      {showDetail && selectedColor && (
        <div className="popup-overlay">
          <div className="popup-box" style={{ maxWidth: "500px" }}>
            <h2>🎨 Thông tin màu xe</h2>
            {selectedColor.imageUrl && (
              <img 
                src={selectedColor.imageUrl} 
                alt="Color" 
                style={{ width: "100%", maxHeight: "200px", borderRadius: "10px", objectFit: "cover", marginBottom: "15px" }}
                onError={(e) => { e.target.style.display = "none" }}
              />
            )}
            <div style={{ display: "grid", gap: "10px" }}>
              <p>
                <b>Tên màu:</b> {selectedColor.colorName}
                <div style={{ 
                  width: "40px", 
                  height: "40px", 
                  backgroundColor: selectedColor.colorCode, 
                  border: "2px solid #ccc", 
                  borderRadius: "6px",
                  marginTop: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                }}></div>
              </p>
              <p><b>Mã màu:</b> <code style={{ background: "#f0f0f0", padding: "2px 6px", borderRadius: "3px" }}>{selectedColor.colorCode}</code></p>
              <p><b>Loại:</b> {selectedColor.colorType || "—"}</p>
              <p><b>Giá cộng thêm:</b> {formatPrice(selectedColor.priceAdjustment)} VNĐ</p>
              <p><b>Mô tả:</b> {selectedColor.description || "—"}</p>
              <p><b>Ghi chú:</b> {selectedColor.notes || "—"}</p>
              <p><b>Trạng thái:</b> {selectedColor.isAvailable ? "✅ Có sẵn" : "❌ Hết hàng"}</p>
            </div>
            <button 
              className="btn-close" 
              onClick={() => setShowDetail(false)}
              style={{ marginTop: "20px", padding: "10px 20px", background: "#4CAF50", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", width: "100%" }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}