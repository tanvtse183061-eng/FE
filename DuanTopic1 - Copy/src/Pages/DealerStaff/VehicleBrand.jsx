import './Customer.css';
import { FaSearch, FaEye, FaPen, FaTrash, FaPlus } from "react-icons/fa";
import { useEffect, useState } from "react";
import API from '../Login/API';

export default function VehicleBrand() {
  const [brands, setBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    brandName: "",
    description: "",
    country: "",
    foundedYear: "",
    website: "",
    logoUrl: "",
    isActive: true,
    notes: "",
  });

  // ✅ Lấy danh sách thương hiệu
  const fetchBrands = async () => {
    try {
      const res = await API.get("/api/vehicles/brands");
      setBrands(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách thương hiệu:", err);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  // ✅ Tìm kiếm thương hiệu
  useEffect(() => {
    const delay = setTimeout(async () => {
      const trimmed = searchTerm.trim();
      if (trimmed === "") {
        fetchBrands();
        return;
      }
      try {
        const res = await API.get(`/api/vehicles/brands/search?name=${encodeURIComponent(trimmed)}`);
        setBrands(res.data);
      } catch (err) {
        console.error("Lỗi tìm kiếm:", err);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  // ✅ Xem chi tiết thương hiệu
  const handleView = (brand) => {
    setSelectedBrand(brand);
    setShowDetail(true);
  };

  // ✅ Mở form thêm
  const handleOpenAdd = () => {
    setIsEdit(false);
    setFormData({
      brandName: "",
      description: "",
      country: "",
      foundedYear: "",
      website: "",
      logoUrl: "",
      isActive: true,
      notes: "",
    });
    setShowPopup(true);
  };

  // ✅ Mở form sửa
  const handleEdit = (brand) => {
    setIsEdit(true);
    setSelectedBrand(brand);
    setFormData({
      brandName: brand.brandName,
      description: brand.description || "",
      country: brand.country,
      foundedYear: brand.foundedYear || "",
      website: brand.website || "",
      logoUrl: brand.logoUrl || "",
      isActive: brand.isActive,
      notes: brand.notes || "",
    });
    setShowPopup(true);
  };

  // ✅ Xóa thương hiệu
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa thương hiệu này không?")) return;
    try {
      await API.delete(`/api/vehicles/brands/${id}`);
      alert("Xóa thương hiệu thành công!");
      fetchBrands();
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
      alert("Không thể xóa thương hiệu!");
    }
  };

  // ✅ Gửi form thêm/sửa
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.brandName || !formData.country) {
      setError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const payload = {
      brandName: formData.brandName,
      description: formData.description,
      country: formData.country,
      foundedYear: Number(formData.foundedYear) || 0,
      website: formData.website,
      logoUrl: formData.logoUrl,
      isActive: formData.isActive,
      notes: formData.notes,
    };

    try {
      if (isEdit && selectedBrand) {
        await API.put(`/api/vehicles/brands/${selectedBrand.brandId}`, payload);
        alert("Cập nhật thương hiệu thành công!");
      } else {
        await API.post("/api/vehicles/brands", payload);
        alert("Thêm thương hiệu thành công!");
      }
      setShowPopup(false);
      fetchBrands();
    } catch (err) {
      console.error("Lỗi khi lưu thương hiệu:", err);
      alert("Không thể lưu thương hiệu!");
    }
  };

  return (
    <div className="customer">
      <div className="title-customer">Quản lý thương hiệu xe</div>

      <div className="title2-customer">
        <h2>Danh sách thương hiệu</h2>
        <h3 onClick={handleOpenAdd}>
          <FaPlus /> Thêm thương hiệu
        </h3>
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm thương hiệu..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="customer-table-container">
        <table className="customer-table">
          <thead>
            <tr>
              <th>LOGO</th>
              <th>TÊN THƯƠNG HIỆU</th>
              <th>QUỐC GIA</th>
              <th>NĂM THÀNH LẬP</th>
              <th>TRẠNG THÁI</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {brands.length > 0 ? (
              brands.map((b) => (
                <tr key={b.brandId}>
                  <td>
                    {b.logoUrl ? (
                      <img
                        src={b.logoUrl}
                        alt={b.brandName}
                        style={{ width: "60px", height: "40px", borderRadius: "6px", objectFit: "cover" }}
                      />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{b.brandName}</td>
                  <td>{b.country}</td>
                  <td>{b.foundedYear || "—"}</td>
                  <td>
                    <span
                      style={{
                        background: b.isActive ? "#dcfce7" : "#fee2e2",
                        color: b.isActive ? "#16a34a" : "#dc2626",
                        padding: "5px 8px",
                        borderRadius: "5px",
                      }}
                    >
                      {b.isActive ? "Hoạt động" : "Ngừng"}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button className="icon-btn view" onClick={() => handleView(b)}>
                      <FaEye />
                    </button>
                    <button className="icon-btn edit" onClick={() => handleEdit(b)}>
                      <FaPen />
                    </button>
                    <button className="icon-btn delete" onClick={() => handleDelete(b.brandId)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", color: "#666" }}>
                  Không có dữ liệu thương hiệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Popup thêm/sửa */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>{isEdit ? "Sửa thương hiệu" : "Thêm thương hiệu mới"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <input name="brandName" placeholder="Tên thương hiệu" value={formData.brandName} onChange={(e) => setFormData({ ...formData, brandName: e.target.value })} style={{color:'black'}} />
                <input name="country" placeholder="Quốc gia" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} style={{color:'black'}}/>
                <input name="foundedYear" type="number" placeholder="Năm thành lập" value={formData.foundedYear} onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })} style={{color:'black'}} />
                <input name="website" placeholder="Website" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} style={{color:'black'}}/>
                <input name="logoUrl" placeholder="URL Logo" value={formData.logoUrl} onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })} style={{color:'black'}}/>
                <textarea name="description" placeholder="Mô tả" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{color:'black'}}></textarea>
                <textarea name="notes" placeholder="Ghi chú" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} style={{color:'black'}}></textarea>
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

      {/* ✅ Popup xem chi tiết */}
      {showDetail && selectedBrand && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>Thông tin thương hiệu</h2>
            {selectedBrand.logoUrl && (
              <img src={selectedBrand.logoUrl} alt="Logo" style={{ width: "120px", borderRadius: "10px" }} />
            )}
            <p><b>Tên:</b> {selectedBrand.brandName}</p>
            <p><b>Quốc gia:</b> {selectedBrand.country}</p>
            <p><b>Năm thành lập:</b> {selectedBrand.foundedYear}</p>
            <p><b>Website:</b> {selectedBrand.website}</p>
            <p><b>Mô tả:</b> {selectedBrand.description}</p>
            <p><b>Ghi chú:</b> {selectedBrand.notes}</p>
            <p><b>Trạng thái:</b> {selectedBrand.isActive ? "Hoạt động" : "Ngừng"}</p>
            <button className="btn-close" onClick={() => setShowDetail(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}
