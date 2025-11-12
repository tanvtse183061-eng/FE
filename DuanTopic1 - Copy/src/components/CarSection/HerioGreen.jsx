import { useState, useEffect } from "react";
import { Carousel } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import Nvabar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import ContactModal from "../ContactModal/ContactModal";
import CreateOrder3Steps from "../CreateOrderFromCar/CreateOrder3Steps";
import { publicVehicleAPI } from "../../services/API.js";

import anhVang from "../../assets/cars/herio-yellow.png";
import anhDo from "../../assets/cars/herio-red.png";
import anhTrang from "../../assets/cars/herio-white.png";
import anhXam from "../../assets/cars/herio.png";
import anhDen from "../../assets/cars/herio-black.png";

import "./Car.css";

export default function HerioGreen() {
  const location = useLocation();
  const carData = location.state; // Thông tin xe từ CarSection
  
  const [index, setIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  
  // Lấy danh sách màu từ inventory
  const [availableColors, setAvailableColors] = useState([]);
  const [carImages, setCarImages] = useState([
    { src: anhDo, alt: "Herio Red", color: "Đỏ" },
    { src: anhTrang, alt: "Herio White", color: "Trắng" },
    { src: anhVang, alt: "Herio Yellow", color: "Vàng" },
    { src: anhDen, alt: "Herio Black", color: "Đen" },
  ]);
  const [colorNames, setColorNames] = useState(["Xám", "Đỏ", "Trắng", "Vàng", "Đen"]);
  
  // Kiểm tra role của user
  const userRole = localStorage.getItem("role");
  const isDealerStaff = userRole === "STAFF" || userRole === "DEALER_STAFF";

  // Load màu sắc từ inventory nếu có carData
  useEffect(() => {
    const loadColorsFromInventory = async () => {
      if (carData?.variantId) {
        try {
          const inventoryRes = await publicVehicleAPI.getInventoryByVariant(carData.variantId);
          const inventories = inventoryRes.data || [];
          
          // Lọc inventory có sẵn và lấy danh sách màu
          const available = inventories.filter(inv => {
            const status = inv.status?.toLowerCase() || "";
            return status === "available" || status === "AVAILABLE";
          });

          // Tạo danh sách màu từ inventory
          const colorsList = [];
          const imagesList = [];
          
          available.forEach(inv => {
            const colorId = inv.colorId || inv.color?.colorId || inv.color?.id;
            const colorName = inv.color?.colorName || inv.colorName || "";
            
            if (colorId && colorName && !colorsList.find(c => c.colorId === colorId)) {
              // Parse images
              let vehicleImages = [];
              try {
                if (inv.vehicleImages) {
                  vehicleImages = typeof inv.vehicleImages === 'string' 
                    ? JSON.parse(inv.vehicleImages) 
                    : inv.vehicleImages;
                }
              } catch (e) {
                console.warn("Lỗi parse images:", e);
              }

              const mainImage = vehicleImages?.[0] || null;
              
              colorsList.push({ colorId, colorName });
              imagesList.push({ 
                src: mainImage || anhXam, 
                alt: `Herio ${colorName}`, 
                color: colorName 
              });
            }
          });

          if (colorsList.length > 0) {
            setAvailableColors(colorsList);
            setCarImages(imagesList);
            setColorNames(["Xám", ...colorsList.map(c => c.colorName)]);
            
            // Tìm index của màu từ carData
            if (carData.colorId) {
              const colorIndex = colorsList.findIndex(c => 
                String(c.colorId) === String(carData.colorId)
              );
              if (colorIndex >= 0) {
                setIndex(colorIndex + 1); // +1 vì index 0 là Xám
              }
            }
          }
        } catch (err) {
          console.warn("Không thể load màu từ inventory:", err);
        }
      }
    };

    loadColorsFromInventory();
  }, [carData]);

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  const handleImageClick = () => {
    // Tất cả user đều có thể tạo đơn hàng (Public API không cần đăng nhập)
    setShowOrderModal(true);
  };

  const getCurrentColor = () => {
    // index 0 = Xám, index 1 = Đỏ, index 2 = Trắng, index 3 = Vàng, index 4 = Đen
    return colorNames[index] || carImages[index - 1]?.color || "";
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <Nvabar />

      <div className="car-page">
        {/* Ảnh chính - sử dụng ảnh từ inventory nếu có */}
        <div className="car-top">
          <img 
            src={carData?.mainImage || (index === 0 ? anhXam : carImages[index - 1]?.src || anhXam)} 
            alt={carData?.variantName || "Herio Green"} 
            className="main-car-image" 
            onClick={handleImageClick}
            style={{ cursor: 'pointer' }}
            onError={(e) => {
              e.target.src = anhXam; // Fallback về ảnh mặc định
            }}
          />
          <h2>{carData?.variantName || "Herio Green"}</h2>
          <p>Giá từ {carData?.sellingPrice ? carData.sellingPrice.toLocaleString('vi-VN') + '₫' : '499,000,000₫'}</p>
        </div>

        {/* Thanh menu đen + nút báo giá */}
        <div className="car-menu">
          
        </div>

        {/* Ưu đãi màu đỏ */}
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

        {/* Hàng thumbnail chọn màu - hiển thị từ inventory */}
        <div className="thumbnail-row">
          {/* Thumbnail đầu tiên: màu xám mặc định */}
          <img
            key="gray"
            src={anhXam}
            alt="color option"
            onClick={() => setIndex(0)}
            className={`thumbnail-img ${index === 0 ? "active" : ""}`}
          />
          {/* Các thumbnail từ inventory */}
          {carImages.map((car, i) => (
            <img
              key={car.colorId || i}
              src={car.src}
              alt={`color option ${car.color}`}
              onClick={() => {
                // Thumbnail 0 = Xám, các thumbnail khác = màu từ inventory
                setIndex(i + 1);
              }}
              className={`thumbnail-img ${
                index === i + 1 ? "active" : ""
              }`}
              onError={(e) => {
                e.target.src = anhXam; // Fallback
              }}
            />
          ))}
        </div>

        {showModal && !isDealerStaff && (
          <ContactModal isOpen={showModal} onClose={closeModal} />
        )}
        
        {/* Modal tạo đơn hàng 3 bước - Tất cả user đều có thể tạo (Public API) */}
        {showOrderModal && (
          <CreateOrder3Steps
            show={showOrderModal}
            onClose={() => setShowOrderModal(false)}
            carName={carData?.variantName || "Herio Green"}
            carColor={getCurrentColor()}
            carPrice={carData?.sellingPrice || 499000000}
          />
        )}
      </div>
      <Footer />
    </>
  );
}
