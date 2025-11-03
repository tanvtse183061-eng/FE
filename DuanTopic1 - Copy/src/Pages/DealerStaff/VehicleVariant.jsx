import './Customer.css';
import { FaSearch, FaEye, FaPen, FaTrash, FaPlus } from "react-icons/fa";
import { useEffect, useState } from "react";
import API from '../Login/API';

export default function VehicleVariant() {
  const [variants, setVariants] = useState([]);
  const [models, setModels] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    variantName: "",
    engineType: "",
    transmission: "",
    fuelType: "",
    torque: "",
    topSpeed: "",
    batteryCapacity: "",
    chargingTimeFast: "",
    chargingTimeSlow: "",
    weight: "",
    length: "",
    width: "",
    height: "",
    wheelbase: "",
    description: "",
    isActive: true,
    notes: "",
    variantImageUrl: "",
    basePrice: "",
    powerKw: "",
    acceleration0100: "",
    rangeKm: "",
    modelId: ""
  });

  // 🧭 Lấy danh sách models
  const fetchModels = async () => {
    try {
      const res = await API.get("/api/vehicles/models");
      setModels(res.data);
    } catch (err) {
      console.error("Lỗi lấy model:", err);
    }
  };

  // 🧭 Lấy danh sách variants
  const fetchVariants = async () => {
    try {
      const res = await API.get("/api/vehicles/variants");
      setVariants(res.data);
    } catch (err) {
      console.error("Lỗi lấy variant:", err);
    }
  };

  useEffect(() => {
    fetchModels();
    fetchVariants();
  }, []);

  // 🧭 Tìm kiếm
  useEffect(() => {
    const delay = setTimeout(async () => {
      const trimmed = searchTerm.trim();
      if (trimmed === "") {
        fetchVariants();
        return;
      }
      try {
        const res = await API.get(`/api/vehicles/variants/search?name=${encodeURIComponent(trimmed)}`);
        setVariants(res.data);
      } catch (err) {
        console.error("Lỗi tìm kiếm:", err);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  // 🧭 Xem chi tiết
  const handleView = (variant) => {
    setSelectedVariant(variant);
    setShowDetail(true);
  };

  // 🧭 Thêm mới
  const handleOpenAdd = () => {
    setIsEdit(false);
    setFormData({
      variantName: "",
      engineType: "",
      transmission: "",
      fuelType: "",
      torque: "",
      topSpeed: "",
      batteryCapacity: "",
      chargingTimeFast: "",
      chargingTimeSlow: "",
      weight: "",
      length: "",
      width: "",
      height: "",
      wheelbase: "",
      description: "",
      isActive: true,
      notes: "",
      variantImageUrl: "",
      basePrice: "",
      powerKw: "",
      acceleration0100: "",
      rangeKm: "",
      modelId: ""
    });
    setShowPopup(true);
  };

  // 🧭 Sửa
  const handleEdit = (variant) => {
    setIsEdit(true);
    setSelectedVariant(variant);
    setFormData({
      variantName: variant.variantName,
      engineType: variant.engineType || "",
      transmission: variant.transmission,
      fuelType: variant.fuelType,
      torque: variant.torque,
      topSpeed: variant.topSpeed,
      batteryCapacity: variant.batteryCapacity,
      chargingTimeFast: variant.chargingTimeFast,
      chargingTimeSlow: variant.chargingTimeSlow,
      weight: variant.weight,
      length: variant.length,
      width: variant.width,
      height: variant.height,
      wheelbase: variant.wheelbase,
      description: variant.description,
      isActive: variant.isActive,
      notes: variant.notes,
      variantImageUrl: variant.variantImageUrl,
      basePrice: variant.engineType || "",
      powerKw: variant.powerKw,
      acceleration0100: variant.acceleration0100,
      rangeKm: variant.rangeKm,
      modelId: variant.model?.modelId || ""
    });
    setShowPopup(true);
  };

  // 🧭 Xóa
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa biến thể này không?")) return;
    try {
      await API.delete(`/api/vehicles/variants/${id}`);
      alert("Xóa thành công!");
      fetchVariants();
    } catch (err) {
      console.error("Lỗi xóa variant:", err);
    }
  };

  // 🧭 Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.variantName || !formData.modelId) {
      setError("Vui lòng nhập tên biến thể và chọn dòng xe!");
      return;
    }

    const payload = {
      ...formData,
      torque: Number(formData.torque),
      topSpeed: Number(formData.topSpeed),
      batteryCapacity: Number(formData.batteryCapacity),
      chargingTimeFast: Number(formData.chargingTimeFast),
      chargingTimeSlow: Number(formData.chargingTimeSlow),
      weight: Number(formData.weight),
      length: Number(formData.length),
      width: Number(formData.width),
      height: Number(formData.height),
      wheelbase: Number(formData.wheelbase),
      basePrice: Number(formData.basePrice),
      powerKw: Number(formData.powerKw),
      acceleration0100: Number(formData.acceleration0100),
      rangeKm: Number(formData.rangeKm),
      modelId: Number(formData.modelId)
    };

    try {
      if (isEdit && selectedVariant) {
        await API.put(`/api/vehicles/variants/${selectedVariant.variantId}`, payload);
        alert("Cập nhật thành công!");
      } else {
        await API.post("/api/vehicles/variants", payload);
        alert("Thêm mới thành công!");
      }
      setShowPopup(false);
      fetchVariants();
    } catch (err) {
      console.error("Lỗi lưu variant:", err);
      alert("Không thể lưu biến thể!");
    }
  };
const formatPrice = (price) => {
  if (!price || price === 0) return "—";
  return new Intl.NumberFormat('vi-VN').format(price) + " VNĐ";
};
  return (
    <div className="customer">
      <div className="title-customer">Quản lý biến thể xe</div>

      <div className="title2-customer">
        <h2>Danh sách biến thể</h2>
        <h3 onClick={handleOpenAdd}><FaPlus /> Thêm biến thể</h3>
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm biến thể..."
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
              <th>TÊN BIẾN THỂ</th>
              <th>DÒNG XE</th>
              <th>ĐỘNG CƠ</th>
              <th>GIÁ (VNĐ)</th>
              <th>TRẠNG THÁI</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {variants.length > 0 ? (
              variants.map((v) => (
                <tr key={v.variantId}>
                  <td>
                    {v.variantImageUrl ? (
                      <img src={v.variantImageUrl} alt={v.variantName} style={{ width: "70px", borderRadius: "6px", objectFit: "cover" }} />
                    ) : "—"}
                  </td>
                  <td>{v.variantName}</td>
                  <td>{v.model?.modelName || "—"}</td>
                  <td>{v.engineType || "—"}</td>
                  <td>{formatPrice(v.basePrice)}</td>
                  <td>
                    <span style={{
                      background: v.isActive ? "#dcfce7" : "#fee2e2",
                      color: v.isActive ? "#16a34a" : "#dc2626",
                      padding: "5px 8px",
                      borderRadius: "5px",
                    }}>
                      {v.isActive ? "Hoạt động" : "Ngừng"}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button className="icon-btn view" onClick={() => handleView(v)}><FaEye /></button>
                    <button className="icon-btn edit" onClick={() => handleEdit(v)}><FaPen /></button>
                    <button className="icon-btn delete" onClick={() => handleDelete(v.variantId)}><FaTrash /></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="7" style={{ textAlign: "center", color: "#666" }}>Không có dữ liệu</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🧭 Popup thêm/sửa */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>{isEdit ? "Sửa biến thể" : "Thêm biến thể mới"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <select value={formData.modelId} onChange={(e) => setFormData({ ...formData, modelId: e.target.value })} style={{color:'black'}}>
                  <option value="">-- Chọn dòng xe --</option>
                  {models.map((m) => (
                    <option key={m.modelId} value={m.modelId}>{m.modelName}</option>
                  ))}
                </select>
                <input name="variantName" placeholder="Tên biến thể" value={formData.variantName} onChange={(e) => setFormData({ ...formData, variantName: e.target.value })} style={{color:'black'}}/>
                <input name="engineType" placeholder="Loại động cơ" value={formData.engineType} onChange={(e) => setFormData({ ...formData, engineType: e.target.value })} style={{color:'black'}}/>
                <input name="fuelType" placeholder="Nhiên liệu" value={formData.fuelType} onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })} style={{color:'black'}}/>
                <input name="basePrice" type="number" placeholder="Giá cơ bản" value={formData.basePrice} onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })} style={{color:'black'}}/>
                <input name="powerKw" type="number" placeholder="Công suất (kW)" value={formData.powerKw} onChange={(e) => setFormData({ ...formData, powerKw: e.target.value })} style={{color:'black'}}/>
                <input name="topSpeed" type="number" placeholder="Tốc độ tối đa (km/h)" value={formData.topSpeed} onChange={(e) => setFormData({ ...formData, topSpeed: e.target.value })} style={{color:'black'}}/>
                <input name="rangeKm" type="number" placeholder="Phạm vi (km)" value={formData.rangeKm} onChange={(e) => setFormData({ ...formData, rangeKm: e.target.value })} style={{color:'black'}}/>
                <input name="variantImageUrl" placeholder="URL hình ảnh" value={formData.variantImageUrl} onChange={(e) => setFormData({ ...formData, variantImageUrl: e.target.value })} style={{color:'black'}}/>
                <textarea name="description" placeholder="Mô tả" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{color:'black'}}></textarea>
                <textarea name="notes" placeholder="Ghi chú" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} style={{color:'black'}}></textarea>
              </div>

              {error && <span className="error">{error}</span>}

              <div className="form-actions">
                <button type="submit">{isEdit ? "Cập nhật" : "Tạo mới"}</button>
                <button type="button" onClick={() => setShowPopup(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🧭 Popup xem chi tiết */}
      {showDetail && selectedVariant && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>Thông tin biến thể</h2>
            {selectedVariant.variantImageUrl && (
              <img src={selectedVariant.variantImageUrl} alt="Variant" style={{ width: "120px", borderRadius: "10px" }} />
            )}
            <p><b>Tên:</b> {selectedVariant.variantName}</p>
            <p><b>Động cơ:</b> {selectedVariant.engineType}</p>
            <p><b>Nhiên liệu:</b> {selectedVariant.fuelType}</p>
            <p><b>Tốc độ tối đa:</b> {selectedVariant.topSpeed} km/h</p>
            <p><b>Giá cơ bản:</b> {selectedVariant.basePrice?.toLocaleString()} VNĐ</p>
            <p><b>Mô tả:</b> {selectedVariant.description}</p>
            <p><b>Ghi chú:</b> {selectedVariant.notes}</p>
            <p><b>Trạng thái:</b> {selectedVariant.isActive ? "Hoạt động" : "Ngừng"}</p>
            <button className="btn-close" onClick={() => setShowDetail(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}
