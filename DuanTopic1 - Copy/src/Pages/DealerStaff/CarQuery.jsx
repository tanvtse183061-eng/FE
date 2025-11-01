import React, { useEffect, useState } from 'react';
import { getCars, compareCars } from '../../api/cars';
import './CarQuery.css';

export default function CarQuery() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState([]);
  const [compareResult, setCompareResult] = useState(null);

  useEffect(() => {
    fetchCars();
  }, []);

  async function fetchCars() {
    setLoading(true);
    setError(null);
    try {
      const res = await getCars();
      console.log('API Response:', res); // Debug: xem cấu trúc dữ liệu
      
      // Backend trả về array hoặc object với nhiều properties
      let carsList = [];
      if (Array.isArray(res)) {
        carsList = res;
      } else if (res && typeof res === 'object') {
        // Chuyển object thành array các values
        carsList = Object.values(res);
      }
      
      setCars(carsList);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Lỗi khi tải danh sách xe');
      console.error('Error fetching cars:', err);
    } finally {
      setLoading(false);
    }
  }

  function toggleSelect(car) {
    if (!car) return;
    const id = car.modelId || car.brandId || car.id;
    setSelected(sel => {
      const exists = sel.find(s => (s.modelId || s.brandId || s.id) === id);
      return exists ? sel.filter(s => (s.modelId || s.brandId || s.id) !== id) : [...sel, car];
    });
  }

  function isSelected(car) {
    if (!car) return false;
    const id = car.modelId || car.brandId || car.id;
    return selected.some(s => (s.modelId || s.brandId || s.id) === id);
  }

  async function handleCompare() {
    if (selected.length < 2) return alert('Chọn ít nhất 2 xe để so sánh');
    try {
      const ids = selected.map(car => car.modelId || car.brandId || car.id);
      const res = await compareCars(ids);
      const result = Array.isArray(res) ? res : (res?.data ? Object.values(res.data) : Object.values(res || {}));
      setCompareResult(result);
    } catch (err) {
      alert('Lỗi khi so sánh xe: ' + (err?.response?.data?.message || err.message));
    }
  }

  function closeCompare() {
    setCompareResult(null);
  }

  const getCarImage = (car) => {
    if (!car) return 'https://via.placeholder.com/300x200?text=No+Image';
    // Thử lấy hình ảnh từ nhiều nguồn khác nhau
    return car.brandLogoUrl || car.imageUrl || car.image || car.thumbnail || 
           (car.images && car.images[0]) || 
           'https://via.placeholder.com/300x200?text=' + encodeURIComponent(car.brandName || car.modelName || 'Car');
  };

  return (
    <div className="car-query-page">
      <h2>Truy vấn thông tin xe</h2>
      
      {loading && <div className="loading">⏳ Đang tải danh sách xe...</div>}
      {error && <div className="error">❌ {error}</div>}

      <div className="car-grid">
        {Array.isArray(cars) && cars.map((car, index) => {
          if (!car || typeof car !== 'object') return null;
          
          const carId = car.modelId || car.id || car.brandId || index;
          const selected = isSelected(car);
          const brandInfo = car.brand || {};
          
          return (
            <div 
              key={carId} 
              className={`car-card ${selected ? 'selected' : ''}`}
              onClick={() => toggleSelect(car)}
            >
              <div className="car-card-image">
                <img 
                  src={getCarImage(car)} 
                  alt={car.modelName || car.brandName || car.name || 'Car'} 
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'; }}
                />
                <input 
                  type="checkbox" 
                  className="car-card-checkbox"
                  checked={selected}
                  onChange={() => toggleSelect(car)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="car-card-body">
                <div className="car-card-title">{car.modelName || car.name || 'Unknown Model'}</div>
                <div className="car-card-info">🏢 Hãng: {brandInfo.brandName || car.brandName || 'N/A'}</div>
                <div className="car-card-info">� Loại xe: {car.vehicleType || 'N/A'}</div>
                <div className="car-card-info">📅 Năm: {car.modelYear || car.year || 'N/A'}</div>
                <div className="car-card-info">🌍 Quốc gia: {brandInfo.country || 'N/A'}</div>
                <div className="car-card-price">
                  {car.price ? `${car.price.toLocaleString('vi-VN')} ₫` : 'Liên hệ'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!loading && cars.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
          Không có xe nào trong danh sách
        </div>
      )}

      {selected.length > 0 && (
        <div className="compare-section">
          <div className="selected-count">
            📋 Đã chọn <strong>{selected.length}</strong> xe để so sánh
          </div>
          <button 
            className="compare-btn" 
            onClick={handleCompare}
            disabled={selected.length < 2}
          >
            So sánh xe ({selected.length})
          </button>
        </div>
      )}

      {compareResult && compareResult.length > 0 && (
        <div className="compare-result">
          <button className="close-compare-btn" onClick={closeCompare}>✖ Đóng</button>
          <h3>🔍 Kết quả so sánh</h3>
          <table className="compare-table">
            <thead>
              <tr>
                <th>Tên xe</th>
                <th>Hãng</th>
                <th>Loại xe</th>
                <th>Năm</th>
                <th>Giá</th>
                <th>Quốc gia</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(compareResult) && compareResult.map((car, index) => {
                if (!car) return null;
                const brandInfo = car.brand || {};
                return (
                  <tr key={car.modelId || car.brandId || car.id || index}>
                    <td><strong>{car.modelName || car.name || 'N/A'}</strong></td>
                    <td>{brandInfo.brandName || car.brandName || 'N/A'}</td>
                    <td>{car.vehicleType || 'N/A'}</td>
                    <td>{car.modelYear || car.year || 'N/A'}</td>
                    <td><strong>{car.price ? car.price.toLocaleString('vi-VN') + ' ₫' : 'Liên hệ'}</strong></td>
                    <td>{brandInfo.country || car.country || 'N/A'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}