import { useState } from "react";
import { Carousel } from "react-bootstrap";
import Nvabar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import ContactModal from "../ContactModal/ContactModal";
import CreateOrder3Steps from "../CreateOrderFromCar/CreateOrder3Steps";

// Import ảnh xe Minio các màu
import anhGreen from "../../assets/cars/miniogreen-green.png"; // màu chính
import anhDen from "../../assets/cars/miniogreen-black.png";
import anhHong from "../../assets/cars/miniogreen-pink.png";
import anhDo from "../../assets/cars/miniogreen-red.png";
import anhTrang from "../../assets/cars/miniogreen-white.png";
import anhVang from "../../assets/cars/miniogreen-yellow.png";

import "./Car.css";

export default function Minio() {
  const [index, setIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  
  // Kiểm tra role của user
  const userRole = localStorage.getItem("role");
  const isDealerStaff = userRole === "STAFF" || userRole === "DEALER_STAFF";

  const carImages = [
    { src: anhDen, alt: "Minio Black", color: "Đen" },
    { src: anhHong, alt: "Minio Pink", color: "Hồng" },
    { src: anhDo, alt: "Minio Red", color: "Đỏ" },
    { src: anhTrang, alt: "Minio White", color: "Trắng" },
    { src: anhVang, alt: "Minio Yellow", color: "Vàng" },
  ];

  const colorNames = ["Xanh", "Đen", "Hồng", "Đỏ", "Trắng", "Vàng"];

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  const handleImageClick = () => {
    // Tất cả user đều có thể tạo đơn hàng (Public API không cần đăng nhập)
    setShowOrderModal(true);
  };

  const getCurrentColor = () => {
    // index 0 = Xanh, index 1 = Đen, index 2 = Hồng, index 3 = Đỏ, index 4 = Trắng, index 5 = Vàng
    return colorNames[index] || carImages[index - 1]?.color || "";
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <Nvabar />

      <div className="car-page">
        {/* Ảnh chính màu xanh */}
        <div className="car-top">
          <img 
            src={anhGreen} 
            alt="Minio Green" 
            className="main-car-image" 
            onClick={handleImageClick}
            style={{ cursor: 'pointer' }}
          />
          <h2>Minio Green</h2>
          <p>Giá từ 269,000,000₫</p>
        </div>

        {/* Thanh menu */}
        <div className="car-menu"></div>

        {/* Ưu đãi */}
        <div className="promo">
          <ul>
            <li>Miễn 100% lệ phí trước bạ</li>
            <li>Miễn phí sạc pin đến 30/06/2027</li>
          </ul>
        </div>

        {/* Carousel hiển thị các màu xe khác */}
        <div className="car-carousel-container">
          <Carousel
            activeIndex={index}
            onSelect={handleSelect}
            interval={null}
            indicators={false}
            className="car-carousel"
          >
            {carImages.map((car, i) => (
              <Carousel.Item key={i}>
                <img
                  className="d-block w-100 car-carousel-image"
                  src={car.src}
                  alt={car.alt}
                  onClick={handleImageClick}
                  style={{ cursor: 'pointer' }}
                />
              </Carousel.Item>
            ))}
          </Carousel>
        </div>

        {/* Hàng thumbnail chọn màu */}
        <div className="thumbnail-row">
          {[anhGreen, anhDen, anhHong, anhDo, anhTrang, anhVang].map((car, i) => (
            <img
              key={i}
              src={car}
              alt="color option"
              onClick={() => setIndex(i)}
              className={`thumbnail-img ${index === i ? "active" : ""}`}
            />
          ))}
        </div>

        {/* Modal liên hệ tư vấn */}
        {showModal && !isDealerStaff && (
          <div className="contact-modal-overlay" onClick={closeModal}>
            <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
              <div className="contact-modal-icon">🚗💨</div>
              <h2>Bạn quan tâm đến chiếc xe này?</h2>
              <p>Vui lòng liên hệ với nhân viên tư vấn của chúng tôi</p>
              <p>để được hỗ trợ tốt nhất!</p>
              <div className="contact-modal-phone">📞 Hotline: 1900-xxxx</div>
              <p style={{ fontSize: '16px', marginTop: '15px' }}>
                Hoặc đến showroom gần nhất để trải nghiệm xe
              </p>
              <button className="contact-modal-button" onClick={closeModal}>
                Đóng
              </button>
            </div>
          </div>
        )}
        
        {/* Modal tạo đơn hàng 3 bước - Tất cả user đều có thể tạo (Public API) */}
        {showOrderModal && (
          <CreateOrder3Steps
            show={showOrderModal}
            onClose={() => setShowOrderModal(false)}
            carName="Minio Green"
            carColor={getCurrentColor()}
            carPrice={269000000}
          />
        )}
      </div>
      <Footer />
    </>
  );
}
