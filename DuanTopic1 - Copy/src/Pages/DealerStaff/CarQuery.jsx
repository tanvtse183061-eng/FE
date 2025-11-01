import React, { useEffect, useState } from 'react';
import { getCars, compareCars } from '../../api/cars';

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
  // Lấy tất cả mẫu xe, không cần phân trang nếu backend trả về toàn bộ
  const res = await getCars();
  setCars(Array.isArray(res) ? res : res?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Lỗi khi tải danh sách xe');
    } finally {
      setLoading(false);
    }
  }

  function toggleSelect(id) {
    setSelected(sel => sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]);
  }

  async function handleCompare() {
    if (selected.length < 2) return alert('Chọn ít nhất 2 xe để so sánh');
    try {
      const res = await compareCars(selected);
      setCompareResult(res?.data || res || []);
    } catch (err) {
      alert('Lỗi khi so sánh xe: ' + (err?.response?.data?.message || err.message));
    }
  }

  return (
    <div className="car-query-page">
      <h2>Truy vấn thông tin xe</h2>
      {loading && <div>Đang tải...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <table className="car-table">
        <thead>
          <tr>
            <th>Chọn</th>
            <th>Tên xe</th>
            <th>Hãng</th>
            <th>Model</th>
            <th>Năm</th>
            <th>Giá</th>
          </tr>
        </thead>
        <tbody>
          {cars.map(car => (
            <tr key={car.id || car._id || car.modelId}>
              <td><input type="checkbox" checked={selected.includes(car.id || car._id || car.modelId)} onChange={() => toggleSelect(car.id || car._id || car.modelId)} /></td>
              <td>{car.name || car.title || car.modelName}</td>
              <td>{car.brandName || car.make}</td>
              <td>{car.modelCode || car.model}</td>
              <td>{car.year || car.releaseYear}</td>
              <td>{car.price ? car.price.toLocaleString() + ' ₫' : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleCompare} disabled={selected.length < 2}>So sánh xe đã chọn</button>
      {compareResult && (
        <div className="compare-result">
          <h3>Kết quả so sánh</h3>
          <table>
            <thead>
              <tr>
                <th>Tên xe</th>
                <th>Hãng</th>
                <th>Model</th>
                <th>Năm</th>
                <th>Giá</th>
                <th>Tính năng</th>
              </tr>
            </thead>
            <tbody>
              {compareResult.map(car => (
                <tr key={car.id || car._id || car.modelId}>
                  <td>{car.name || car.title || car.modelName}</td>
                  <td>{car.brandName || car.make}</td>
                  <td>{car.modelCode || car.model}</td>
                  <td>{car.year || car.releaseYear}</td>
                  <td>{car.price ? car.price.toLocaleString() + ' ₫' : ''}</td>
                  <td>{Array.isArray(car.features) ? car.features.join(', ') : car.features}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
