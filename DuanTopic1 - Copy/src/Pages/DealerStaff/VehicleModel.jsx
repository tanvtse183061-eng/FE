import './Customer.css';
import { FaSearch, FaEye, FaPen, FaTrash, FaPlus } from "react-icons/fa";
import { useEffect, useState } from "react";
import API from '../Login/API';

export default function VehicleModel() {
  const [models, setModels] = useState([]);
  const [brands, setBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    modelName: "",
    vehicleType: "",
    bodyStyle: "",
    seatingCapacity: "",
    imageUrl: "",
    description: "",
    notes: "",
    brandId: "",
    isActive: true,
    modelYear: "",
    effectiveModelYear: "",
  });

  // 🧭 Lấy danh sách brand và model
  const fetchBrands = async () => {
    try {
      const res = await API.get("/api/vehicles/brands");
      setBrands(res.data);
    } catch (err) {
      console.error("Lỗi lấy brand:", err);
    }
  };

  const fetchModels = async () => {
    try {
      const res = await API.get("/api/vehicles/models");
      setModels(res.data);
    } catch (err) {
      console.error("Lỗi lấy model:", err);
    }
  };

  useEffect(() => {
    fetchBrands();
    fetchModels();
  }, []);

  // 🔍 Tìm kiếm
  useEffect(() => {
    const delay = setTimeout(async () => {
      const trimmed = searchTerm.trim();
      if (trimmed === "") {
        fetchModels();
        return;
      }
      try {
        const res = await API.get(`/api/vehicles/models/search?name=${encodeURIComponent(trimmed)}`);
        setModels(res.data);
      } catch (err) {
        console.error("Lỗi tìm kiếm:", err);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  // 🧭 Mở popup thêm
  const handleAdd = () => {
    setIsEdit(false);
    setFormData({
      modelName: "",
      vehicleType: "",
      bodyStyle: "",
      seatingCapacity: "",
      imageUrl: "",
      description: "",
      notes: "",
      brandId: "",
      isActive: true,
      modelYear: "",
      effectiveModelYear: "",
    });
    setShowPopup(true);
  };

  // 🧭 Sửa
  const handleEdit = (m) => {
    setIsEdit(true);
    setSelectedModel(m);
    setFormData({
      modelName: m.modelName,
      vehicleType: m.vehicleType,
      bodyStyle: m.bodyStyle,
      seatingCapacity: m.seatingCapacity,
      imageUrl: m.imageUrl,
      description: m.description,
      notes: m.notes,
      brandId: m.brand?.brandId || "",
      isActive: m.isActive,
      modelYear: m.modelYear,
      effectiveModelYear: m.effectiveModelYear,
    });
    setShowPopup(true);
  };

  // 🧭 Xóa
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa dòng xe này không?")) return;
    try {
      await API.delete(`/api/vehicles/models/${id}`);
      alert("Xóa thành công!");
      fetchModels();
    } catch (err) {
      console.error("Lỗi xóa:", err);
    }
  };

  // 🧭 Xem chi tiết
  const handleView = (m) => {
    setSelectedModel(m);
    setShowDetail(true);
  };

  // 🧭 Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.modelName || !formData.brandId) {
      setError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const payload = {
      ...formData,
      brandId: Number(formData.brandId),
      seatingCapacity: Number(formData.seatingCapacity) || 0,
      modelYear: Number(formData.modelYear) || 0,
      effectiveModelYear: Number(formData.effectiveModelYear) || 0,
    };

    try {
      if (isEdit && selectedModel) {
        await API.put(`/api/vehicles/models/${selectedModel.modelId}`, payload);
        alert("Cập nhật thành công!");
      } else {
        await API.post("/api/vehicles/models", payload);
        alert("Thêm mới thành công!");
      }
      setShowPopup(false);
      fetchModels();
    } catch (err) {
      console.error("Lỗi khi lưu:", err);
    }
  };

  return (
    <div className="customer">
      <div className="title-customer">Quản lý dòng xe</div>

      <div className="title2-customer">
        <h2>Danh sách dòng xe</h2>
        <h3 onClick={handleAdd}><FaPlus /> Thêm dòng xe</h3>
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm dòng xe..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Danh sách dòng xe */}
      <div className="customer-table-container">
        <table className="customer-table">
          <thead>
            <tr>
              <th>ẢNH</th>
              <th>TÊN DÒNG XE</th>
              <th>THƯƠNG HIỆU</th>
              <th>KIỂU XE</th>
              <th>SỐ CHỖ</th>
              <th>TRẠNG THÁI</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {models.length > 0 ? (
              models.map((m) => (
                <tr key={m.modelId}>
                  <td>
                    {m.imageUrl ? (
                      <img src={m.imageUrl} alt="" style={{ width: "70px", height: "50px", borderRadius: "6px", objectFit: "cover" }} />
                    ) : "—"}
                  </td>
                  <td>{m.modelName}</td>
                  <td>{m.brand?.brandName}</td>
                  <td>{m.vehicleType}</td>
                  <td>{m.seatingCapacity}</td>
                  <td>
                    <span style={{
                      background: m.isActive ? "#dcfce7" : "#fee2e2",
                      color: m.isActive ? "#16a34a" : "#dc2626",
                      padding: "5px 8px",
                      borderRadius: "5px",
                    }}>
                      {m.isActive ? "Hoạt động" : "Ngừng"}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button className="icon-btn view" onClick={() => handleView(m)}><FaEye /></button>
                    <button className="icon-btn edit" onClick={() => handleEdit(m)}><FaPen /></button>
                    <button className="icon-btn delete" onClick={() => handleDelete(m.modelId)}><FaTrash /></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="7" style={{ textAlign: "center", color: "#666" }}>Không có dữ liệu dòng xe</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Popup thêm/sửa */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>{isEdit ? "Sửa dòng xe" : "Thêm dòng xe mới"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <select value={formData.brandId} onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}>
                  <option value="">-- Chọn thương hiệu --</option>
                  {brands.map((b) => (
                    <option key={b.brandId} value={b.brandId}>{b.brandName}</option>
                  ))}
                </select>
                <input name="modelName" placeholder="Tên dòng xe" value={formData.modelName} onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}  style={{color:'black'}}/>
                <input name="vehicleType" placeholder="Kiểu xe" value={formData.vehicleType} onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })} style={{color:'black'}}/>
                <input name="bodyStyle" placeholder="Body Style" value={formData.bodyStyle} onChange={(e) => setFormData({ ...formData, bodyStyle: e.target.value })} />
                <input type="number" name="seatingCapacity" placeholder="Số chỗ" value={formData.seatingCapacity} onChange={(e) => setFormData({ ...formData, seatingCapacity: e.target.value })} style={{color:'black'}}/>
                <input name="imageUrl" placeholder="Ảnh (URL)" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} style={{color:'black'}}/>
                <input name="modelYear" type="number" placeholder="Năm sản xuất" value={formData.modelYear} onChange={(e) => setFormData({ ...formData, modelYear: e.target.value })} style={{color:'black'}}/>
                <input name="effectiveModelYear" type="number" placeholder="Năm hiệu lực" value={formData.effectiveModelYear} onChange={(e) => setFormData({ ...formData, effectiveModelYear: e.target.value })} style={{color:'black'}}/>
                <textarea name="description" placeholder="Mô tả" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}style={{color:'black'}}></textarea>
                <textarea name="notes" placeholder="Ghi chú" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}style={{color:'black'}}></textarea>
              </div>

              {error && <span className="error">{error}</span>}

              <div className="form-actions">
                <button type="submit">{isEdit ? "Cập nhật" : "Tạo"}</button>
                <button type="button" onClick={() => setShowPopup(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup xem chi tiết */}
      {showDetail && selectedModel && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>Chi tiết dòng xe</h2>
            {selectedModel.imageUrl && (
              <img src={selectedModel.imageUrl} alt="Ảnh xe" style={{ width: "120px", borderRadius: "10px" }} />
            )}
            <p><b>Tên:</b> {selectedModel.modelName}</p>
            <p><b>Thương hiệu:</b> {selectedModel.brand?.brandName}</p>
            <p><b>Kiểu xe:</b> {selectedModel.vehicleType}</p>
            <p><b>Body Style:</b> {selectedModel.bodyStyle}</p>
            <p><b>Số chỗ:</b> {selectedModel.seatingCapacity}</p>
            <p><b>Mô tả:</b> {selectedModel.description}</p>
            <p><b>Ghi chú:</b> {selectedModel.notes}</p>
            <p><b>Trạng thái:</b> {selectedModel.isActive ? "Hoạt động" : "Ngừng"}</p>
            <button className="btn-close" onClick={() => setShowDetail(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}
