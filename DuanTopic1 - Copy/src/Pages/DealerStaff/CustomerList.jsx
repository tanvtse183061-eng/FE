import { useState, useEffect } from 'react';
import './CustomerList.css';
import API from '../Login/API';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faEdit, faTrash, faTimes, faPhone, faEnvelope, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    address: '',
    dateOfBirth: '',
    gender: 'male'
  });

  // Fetch customers from API
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await API.get('/api/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách khách hàng:', err);
      alert('Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.fullName?.toLowerCase().includes(searchLower) ||
      customer.phoneNumber?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower)
    );
  });

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Open modal for add
  const handleAdd = () => {
    setIsEdit(false);
    setCurrentCustomer(null);
    setFormData({
      fullName: '',
      phoneNumber: '',
      email: '',
      address: '',
      dateOfBirth: '',
      gender: 'male'
    });
    setShowModal(true);
  };

  // Open modal for edit
  const handleEdit = (customer) => {
    setIsEdit(true);
    setCurrentCustomer(customer);
    setFormData({
      fullName: customer.fullName || '',
      phoneNumber: customer.phoneNumber || '',
      email: customer.email || '',
      address: customer.address || '',
      dateOfBirth: customer.dateOfBirth || '',
      gender: customer.gender || 'male'
    });
    setShowModal(true);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isEdit) {
        // Update customer
        await API.put(`/api/customers/${currentCustomer.id}`, formData);
        alert('Cập nhật khách hàng thành công!');
      } else {
        // Create customer
        await API.post('/api/customers', formData);
        alert('Thêm khách hàng thành công!');
      }
      
      setShowModal(false);
      fetchCustomers(); // Refresh list
    } catch (err) {
      console.error('Lỗi:', err);
      alert(isEdit ? 'Không thể cập nhật khách hàng' : 'Không thể thêm khách hàng');
    }
  };

  // Delete customer
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
      try {
        await API.delete(`/api/customers/${id}`);
        alert('Xóa khách hàng thành công!');
        fetchCustomers(); // Refresh list
      } catch (err) {
        console.error('Lỗi:', err);
        alert('Không thể xóa khách hàng');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="customer-list-container">
      <div className="customer-header">
        <h1>Quản lý khách hàng</h1>
        <button className="btn-add" onClick={handleAdd}>
          <FontAwesomeIcon icon={faPlus} /> Thêm khách hàng
        </button>
      </div>

      {/* Search Box */}
      <div className="search-section">
        <div className="search-box">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, số điện thoại hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="results-count">
          Tìm thấy <strong>{filteredCustomers.length}</strong> khách hàng
        </div>
      </div>

      {/* Customer Table */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="customer-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Họ và tên</th>
                <th>Số điện thoại</th>
                <th>Email</th>
                <th>Địa chỉ</th>
                <th>Ngày sinh</th>
                <th>Giới tính</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer, index) => (
                  <tr key={customer.id}>
                    <td>{index + 1}</td>
                    <td className="customer-name">
                      <strong>{customer.fullName}</strong>
                    </td>
                    <td>
                      <FontAwesomeIcon icon={faPhone} className="icon-sm" /> {customer.phoneNumber}
                    </td>
                    <td>
                      <FontAwesomeIcon icon={faEnvelope} className="icon-sm" /> {customer.email}
                    </td>
                    <td>
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="icon-sm" /> {customer.address || 'N/A'}
                    </td>
                    <td>{formatDate(customer.dateOfBirth)}</td>
                    <td>
                      <span className={`gender-badge ${customer.gender}`}>
                        {customer.gender === 'male' ? 'Nam' : customer.gender === 'female' ? 'Nữ' : 'Khác'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-edit" onClick={() => handleEdit(customer)} title="Sửa">
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button className="btn-delete" onClick={() => handleDelete(customer.id)} title="Xóa">
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-data">
                    Không tìm thấy khách hàng
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEdit ? 'Sửa thông tin khách hàng' : 'Thêm khách hàng mới'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="customer-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Họ và tên <span className="required">*</span></label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="Nhập họ và tên"
                  />
                </div>

                <div className="form-group">
                  <label>Số điện thoại <span className="required">*</span></label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    placeholder="Nhập số điện thoại"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email <span className="required">*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Nhập email"
                  />
                </div>

                <div className="form-group">
                  <label>Ngày sinh</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Địa chỉ</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Nhập địa chỉ"
                />
              </div>

              <div className="form-group">
                <label>Giới tính</label>
                <select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-submit">
                  {isEdit ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
