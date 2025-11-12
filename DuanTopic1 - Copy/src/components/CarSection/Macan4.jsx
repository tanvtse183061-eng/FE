import { useState } from "react";
import { Carousel } from "react-bootstrap";
import Nvabar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import ContactModal from "../ContactModal/ContactModal";
import CreateOrder3Steps from "../CreateOrderFromCar/CreateOrder3Steps";

import anhTim from "../../assets/cars/Macantim4.png";
import anhXanhDuong from "../../assets/cars/Macan4-blue.png";
import anhXanhLa from "../../assets/cars/Macan4-green.png";
import anhCam from "../../assets/cars/Macan4-orange.png";

import "./Car.css";

export default function Macan4() {
  const [index, setIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  
  // Kiểm tra role của user
  const userRole = localStorage.getItem("role");
  const isDealerStaff = userRole === "STAFF" || userRole === "DEALER_STAFF";

  const carImages = [
    { src: anhXanhDuong, alt: "Macan 4 Blue", color: "Xanh dương" },
    { src: anhXanhLa, alt: "Macan 4 Green", color: "Xanh lá" },
    { src: anhCam, alt: "Macan 4 Orange", color: "Cam" },
  ];

  const colorNames = ["Tím", "Xanh dương", "Xanh lá", "Cam"];

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  const handleImageClick = () => {
    // Tất cả user đều có thể tạo đơn hàng (Public API không cần đăng nhập)
    setShowOrderModal(true);
  };

  const getCurrentColor = () => {
    // index 0 = Tím, index 1 = Xanh dương, index 2 = Xanh lá, index 3 = Cam
    return colorNames[index] || carImages[index - 1]?.color || "";
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <Nvabar />
      <div className="car-page">
        <div className="car-top">
          <img src={anhTim} alt="Macan 4 thuần điện" className="main-car-image" onClick={handleImageClick} style={{ cursor: "pointer" }} />
          <h2>Macan 4 thuần điện</h2>
          <p>Giá từ 3,740,000,000</p>
        </div>
        <div className="car-menu"></div>
        <div className="promo">
          <ul>
            <li>Động cơ điện hiệu suất cao</li>
            <li>Công nghệ Porsche tiên tiến</li>
          </ul>
        </div>
        <div className="car-carousel-container">
          <Carousel activeIndex={index} onSelect={handleSelect} interval={null} indicators={false} className="car-carousel">
            {carImages.map((car, i) => (
              <Carousel.Item key={i}>
                <img className="d-block w-100 car-carousel-image" src={car.src} alt={car.alt} onClick={handleImageClick} style={{ cursor: "pointer" }} />
              </Carousel.Item>
            ))}
          </Carousel>
        </div>
        <div className="thumbnail-row">
          {[anhTim, anhXanhDuong, anhXanhLa, anhCam].map((car, i) => (
            <img 
              key={i} 
              src={car} 
              alt="color option" 
              onClick={() => setIndex(i)} 
              className={`thumbnail-img ${index === i ? "active" : ""}`} 
            />
          ))}
        </div>
        {/* Modal tạo đơn hàng 3 bước - Tất cả user đều có thể tạo (Public API) */}
        {showOrderModal && (
          <CreateOrder3Steps
            show={showOrderModal}
            onClose={() => setShowOrderModal(false)}
            carName="Macan 4 thuần điện"
            carColor={getCurrentColor()}
            carPrice={3740000000}
          />
        )}
        
        {/* Modal liên hệ (tùy chọn - có thể giữ lại nếu cần) */}
        {showModal && !isDealerStaff && (
          <div className="contact-modal-overlay" onClick={closeModal}>
            <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
              <div className="contact-modal-icon"></div>
              <h2>Bạn quan tâm đến chiếc xe này?</h2>
              <p>Vui lòng liên hệ với nhân viên tư vấn của chúng tôi</p>
              <p>để được hỗ trợ tốt nhất!</p>
              <div className="contact-modal-phone"> Hotline: 1900-xxxx</div>
              <p style={{ fontSize: "16px", marginTop: "15px" }}>Hoặc đến showroom gần nhất để trải nghiệm xe</p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button 
                  className="contact-modal-button" 
                  onClick={() => {
                    closeModal();
                    setShowOrderModal(true);
                  }}
                  style={{ background: '#0066cc', color: 'white', flex: 1 }}
                >
                  📦 Tạo đơn hàng ngay
                </button>
                <button className="contact-modal-button" onClick={closeModal} style={{ flex: 1 }}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

