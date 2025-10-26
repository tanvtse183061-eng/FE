import { useState, useEffect } from 'react';
import './VehicleList.css';
import API from '../Login/API';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faBolt, faCar, faGauge } from '@fortawesome/free-solid-svg-icons';

export default function VehicleList() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Fetch vehicles from API
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const res = await API.get('/api/vehicles');
        setVehicles(res.data);
      } catch (err) {
        console.error('Lỗi khi lấy danh sách xe:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  // Get unique brands for filter
  const brands = ['all', ...new Set(vehicles.map(v => v.brand))];

  // Filter vehicles
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = selectedBrand === 'all' || vehicle.brand === selectedBrand;
    return matchesSearch && matchesBrand;
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="vehicle-list-container">
      <div className="vehicle-header">
        <h1>Danh sách xe điện</h1>
        <p className="subtitle">Khám phá các mẫu xe điện hiện đại và thân thiện với môi trường</p>
      </div>

      {/* Search & Filter Section */}
      <div className="filter-section">
        <div className="search-box">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên xe hoặc hãng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="brand-filter">
          <FontAwesomeIcon icon={faFilter} className="filter-icon" />
          <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}>
            {brands.map(brand => (
              <option key={brand} value={brand}>
                {brand === 'all' ? 'Tất cả hãng' : brand}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="results-info">
        Tìm thấy <strong>{filteredVehicles.length}</strong> xe
      </div>

      {/* Vehicle Grid */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu xe...</p>
        </div>
      ) : (
        <div className="vehicle-grid">
          {filteredVehicles.length > 0 ? (
            filteredVehicles.map(vehicle => (
              <div key={vehicle.id} className="vehicle-card" onClick={() => setSelectedVehicle(vehicle)}>
                <div className="vehicle-image">
                  <img 
                    src={vehicle.imageUrl || 'https://via.placeholder.com/400x250?text=Electric+Vehicle'} 
                    alt={vehicle.model}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x250?text=Electric+Vehicle';
                    }}
                  />
                  <div className="vehicle-badge">{vehicle.brand}</div>
                </div>

                <div className="vehicle-info">
                  <h3 className="vehicle-name">{vehicle.model}</h3>
                  
                  <div className="vehicle-specs">
                    <div className="spec-item">
                      <FontAwesomeIcon icon={faBolt} className="spec-icon" />
                      <span>{vehicle.batteryCapacity || 'N/A'} kWh</span>
                    </div>
                    <div className="spec-item">
                      <FontAwesomeIcon icon={faCar} className="spec-icon" />
                      <span>{vehicle.range || 'N/A'} km</span>
                    </div>
                    <div className="spec-item">
                      <FontAwesomeIcon icon={faGauge} className="spec-icon" />
                      <span>{vehicle.maxSpeed || 'N/A'} km/h</span>
                    </div>
                  </div>

                  <div className="vehicle-footer">
                    <div className="price">
                      <span className="price-label">Giá bán:</span>
                      <span className="price-value">{formatPrice(vehicle.price)}</span>
                    </div>
                    <button className="view-detail-btn">Xem chi tiết</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <p>Không tìm thấy xe phù hợp</p>
              <p>Hãy thử tìm kiếm với từ khóa khác</p>
            </div>
          )}
        </div>
      )}

      {/* Vehicle Detail Modal */}
      {selectedVehicle && (
        <div className="modal-overlay" onClick={() => setSelectedVehicle(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedVehicle(null)}>×</button>
            
            <div className="modal-header">
              <h2>{selectedVehicle.model}</h2>
              <span className="modal-brand">{selectedVehicle.brand}</span>
            </div>

            <div className="modal-body">
              <img 
                src={selectedVehicle.imageUrl || 'https://via.placeholder.com/600x400?text=Electric+Vehicle'} 
                alt={selectedVehicle.model}
                className="modal-image"
              />

              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Dung lượng pin:</span>
                  <span className="detail-value">{selectedVehicle.batteryCapacity || 'N/A'} kWh</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phạm vi hoạt động:</span>
                  <span className="detail-value">{selectedVehicle.range || 'N/A'} km</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Tốc độ tối đa:</span>
                  <span className="detail-value">{selectedVehicle.maxSpeed || 'N/A'} km/h</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Màu sắc:</span>
                  <span className="detail-value">{selectedVehicle.color || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Năm sản xuất:</span>
                  <span className="detail-value">{selectedVehicle.year || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Giá bán:</span>
                  <span className="detail-value price-highlight">{formatPrice(selectedVehicle.price)}</span>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn-primary">Tạo báo giá</button>
                <button className="btn-secondary">Đặt lịch lái thử</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
