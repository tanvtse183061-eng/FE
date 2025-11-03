import { useState } from "react";
import { Carousel } from "react-bootstrap";
import Nvabar from "../Navbar/Navbar";

import anhVang from "../../assets/cars/herio-yellow.png";
import anhDo from "../../assets/cars/herio-red.png";
import anhTrang from "../../assets/cars/herio-white.png";
import anhXam from "../../assets/cars/herio.png";
import anhDen from "../../assets/cars/herio-black.png";

import "./Car.css";

export default function HerioGreen() {
  const [index, setIndex] = useState(0);

  const carImages = [
    { src: anhDo, alt: "Herio Red" },
    { src: anhTrang, alt: "Herio White" },
    { src: anhVang, alt: "Herio Yellow" },
    { src: anhDen, alt: "Herio Black" },
  ];

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  return (
    <>
      <Nvabar />

      <div className="car-page">
        {/* Ảnh chính màu xám */}
        <div className="car-top">
          <img src={anhXam} alt="Herio Green" className="main-car-image" />
          <h2>Herio Green</h2>
          <p>Giá chỉ 499,000,000₫</p>
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
                />
              </Carousel.Item>
            ))}
          </Carousel>
        </div>

        {/* Hàng thumbnail chọn màu */}
        <div className="thumbnail-row">
          {[anhXam, anhDo, anhTrang, anhVang, anhDen].map((car, i) => (
            <img
              key={i}
              src={car}
              alt="color option"
              onClick={() => setIndex(i - 1 >= 0 ? i - 1 : 0)}
              className={`thumbnail-img ${
                index === i - 1 ? "active" : ""
              }`}
            />
          ))}
        </div>
      </div>
    </>
  );
}
