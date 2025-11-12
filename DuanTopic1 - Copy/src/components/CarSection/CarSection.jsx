import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { publicVehicleAPI, inventoryAPI } from "../../services/API.js";
import './CarSection.css';

export default function CarSection() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch available inventory từ API
  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Thử lấy inventory từ nhiều nguồn
        let allInventory = [];
        
        // Thử nhiều cách lấy inventory theo tài liệu API
        let inventoryRes = null;
        
        // Cách 1: Thử /api/public/inventory/available (theo tài liệu)
        try {
          console.log("🔍 Thử 1: Public API - getAvailableInventory (/api/public/inventory/available)");
          inventoryRes = await publicVehicleAPI.getAvailableInventory();
          console.log("✅ Thành công với getAvailableInventory:", inventoryRes);
        } catch (err1) {
          console.warn("⚠️ Lỗi với getAvailableInventory:", err1.response?.status, err1.response?.data);
          
          // Cách 2: Thử /api/public/vehicle-inventory/status/available
          try {
            console.log("🔍 Thử 2: Public API - getInventoryByStatus('available')");
            inventoryRes = await publicVehicleAPI.getInventoryByStatus('available');
            console.log("✅ Thành công với getInventoryByStatus:", inventoryRes);
          } catch (err2) {
            console.warn("⚠️ Lỗi với getInventoryByStatus:", err2.response?.status, err2.response?.data);
            
            // Cách 3: Thử /api/public/vehicle-inventory (tất cả inventory)
            try {
              console.log("🔍 Thử 3: Public API - getInventory (/api/public/vehicle-inventory)");
              inventoryRes = await publicVehicleAPI.getInventory();
              console.log("✅ Thành công với getInventory:", inventoryRes);
            } catch (err3) {
              console.warn("⚠️ Lỗi với public getInventory:", err3.response?.status, err3.response?.data);
              
              // Cách 4: Thử authenticated API (nếu có token)
              const token = localStorage.getItem('token');
              if (token) {
                try {
                  console.log("🔍 Thử 4: Authenticated API - inventoryAPI.getInventory");
                  inventoryRes = await inventoryAPI.getInventory();
                  console.log("✅ Thành công với inventoryAPI.getInventory:", inventoryRes);
                } catch (err4) {
                  console.error("❌ Lỗi với cả 4 cách:", err4);
                  throw err4;
                }
              } else {
                throw err3;
              }
            }
          }
        }
        
        // Xử lý response structure - Theo tài liệu API, response trả về array trực tiếp
        if (inventoryRes) {
          if (Array.isArray(inventoryRes.data)) {
            allInventory = inventoryRes.data;
          } else if (Array.isArray(inventoryRes.data?.data)) {
            allInventory = inventoryRes.data.data;
          } else if (Array.isArray(inventoryRes.data?.inventory)) {
            allInventory = inventoryRes.data.inventory;
          } else if (Array.isArray(inventoryRes.data?.content)) {
            allInventory = inventoryRes.data.content;
          } else if (Array.isArray(inventoryRes.data?.featuredVehicles)) {
            // Nếu là response từ /api/public/home
            allInventory = inventoryRes.data.featuredVehicles;
          } else if (Array.isArray(inventoryRes.data?.availableInventory)) {
            // Nếu là response từ /api/public/catalog
            allInventory = inventoryRes.data.availableInventory;
          } else if (Array.isArray(inventoryRes)) {
            allInventory = inventoryRes;
          } else {
            console.warn("⚠️ Không nhận diện được cấu trúc response:", inventoryRes);
            allInventory = [];
          }
        }

        console.log("📊 Tổng số inventory nhận được:", allInventory.length);
        if (allInventory.length > 0) {
          console.log("📊 Sample inventory item:", allInventory[0]);
          console.log("📊 Sample inventory keys:", Object.keys(allInventory[0]));
        }

        // Lọc chỉ lấy inventory có status = available (nếu API chưa filter)
        // Nếu dùng getAvailableInventory thì không cần filter lại
        const availableCars = allInventory.filter(inv => {
          const status = (inv.status || inv.inventoryStatus || inv.inventory?.status || "").toLowerCase();
          // Chấp nhận nhiều giá trị status
          const isAvailable = !status || 
                 status === "available" || 
                 status === "AVAILABLE" ||
                 status === "in_stock" ||
                 status === "IN_STOCK" ||
                 status === "in stock";
          
          if (!isAvailable && allInventory.length > 0) {
            console.log(`⚠️ Bỏ qua item với status: "${status}"`, inv);
          }
          
          return isAvailable;
        });

        console.log("✅ Số lượng xe available sau khi filter:", availableCars.length);

        if (availableCars.length === 0) {
          console.warn("⚠️ Không có xe nào available sau khi filter");
          setCars([]);
          setLoading(false);
          return;
        }

        // Load variants để lấy tên variant
        let variantsMap = new Map();
        try {
          const variantsRes = await publicVehicleAPI.getVariants();
          const variants = Array.isArray(variantsRes.data) ? variantsRes.data : [];
          variants.forEach(v => {
            const id = v.variantId || v.id;
            if (id) {
              variantsMap.set(id, v.variantName || v.name || "Unknown");
            }
          });
          console.log("📦 Đã load", variantsMap.size, "variants:", variantsMap);
        } catch (err) {
          console.warn("⚠️ Không thể load variants:", err);
        }

        // Load colors để lấy tên màu
        let colorsMap = new Map();
        try {
          const colorsRes = await publicVehicleAPI.getColors();
          const colors = Array.isArray(colorsRes.data) ? colorsRes.data : [];
          colors.forEach(c => {
            const id = c.colorId || c.id;
            if (id) {
              colorsMap.set(id, c.colorName || c.name || "Unknown");
            }
          });
          console.log("🎨 Đã load", colorsMap.size, "colors:", colorsMap);
        } catch (err) {
          console.warn("⚠️ Không thể load colors:", err);
        }

        // Nhóm xe theo variant (mỗi variant chỉ hiển thị 1 lần với màu đầu tiên có sẵn)
        const variantMap = new Map();
        
        availableCars.forEach((inv, idx) => {
          const variantId = inv.variantId || inv.variant?.variantId || inv.variant?.id;
          // Lấy tên variant từ variantsMap
          const variantName = variantsMap.get(variantId) || inv.variant?.variantName || inv.variantName || inv.variant?.name || `Variant ${variantId}`;
          
          if (!variantId) {
            console.warn(`⚠️ Inventory item ${idx} không có variantId:`, inv);
            return;
          }

          // Nếu variant chưa có trong map, thêm vào
          if (!variantMap.has(variantId)) {
            // Parse images từ JSON string
            let vehicleImages = [];
            let exteriorImages = [];
            let interiorImages = [];

            try {
              // Parse vehicleImages từ JSON string (theo cấu trúc BE: "[\"https://example.com/image1.jpg\"]")
              if (inv.vehicleImages) {
                if (typeof inv.vehicleImages === 'string') {
                  try {
                    vehicleImages = JSON.parse(inv.vehicleImages);
                    if (!Array.isArray(vehicleImages)) {
                      vehicleImages = [vehicleImages];
                    }
                  } catch (e) {
                    // Nếu parse lỗi, thử parse như array string
                    console.warn("⚠️ Lỗi parse vehicleImages, thử cách khác:", e);
                    vehicleImages = inv.vehicleImages.startsWith('[') 
                      ? JSON.parse(inv.vehicleImages) 
                      : [inv.vehicleImages];
                  }
                } else if (Array.isArray(inv.vehicleImages)) {
                  vehicleImages = inv.vehicleImages;
                }
              }
              
              // Parse exteriorImages
              if (inv.exteriorImages) {
                if (typeof inv.exteriorImages === 'string') {
                  try {
                    exteriorImages = JSON.parse(inv.exteriorImages);
                    if (!Array.isArray(exteriorImages)) {
                      exteriorImages = [exteriorImages];
                    }
                  } catch (e) {
                    exteriorImages = inv.exteriorImages.startsWith('[') 
                      ? JSON.parse(inv.exteriorImages) 
                      : [inv.exteriorImages];
                  }
                } else if (Array.isArray(inv.exteriorImages)) {
                  exteriorImages = inv.exteriorImages;
                }
              }
              
              // Parse interiorImages
              if (inv.interiorImages) {
                if (typeof inv.interiorImages === 'string') {
                  try {
                    interiorImages = JSON.parse(inv.interiorImages);
                    if (!Array.isArray(interiorImages)) {
                      interiorImages = [interiorImages];
                    }
                  } catch (e) {
                    interiorImages = inv.interiorImages.startsWith('[') 
                      ? JSON.parse(inv.interiorImages) 
                      : [inv.interiorImages];
                  }
                } else if (Array.isArray(inv.interiorImages)) {
                  interiorImages = inv.interiorImages;
                }
              }
            } catch (e) {
              console.warn("⚠️ Lỗi parse images:", e, "Item:", inv);
            }

            // Ưu tiên: vehicleImages > exteriorImages > interiorImages
            const mainImage = vehicleImages?.[0] || exteriorImages?.[0] || interiorImages?.[0] || null;

            const colorId = inv.colorId || inv.color?.colorId || inv.color?.id;
            // Lấy tên màu từ colorsMap
            const colorName = colorsMap.get(colorId) || inv.color?.colorName || inv.colorName || `Color ${colorId}`;
            
            variantMap.set(variantId, {
              inventoryId: inv.inventoryId || inv.id,
              variantId: variantId,
              variantName: variantName,
              colorId: colorId,
              colorName: colorName,
              sellingPrice: inv.sellingPrice || inv.price || 0,
              mainImage: mainImage,
              modelName: inv.variant?.model?.modelName || inv.modelName || "",
              brandName: inv.variant?.model?.brand?.brandName || inv.brandName || "",
            });
            
            console.log(`✅ Đã thêm variant ${variantId} (${variantName}) vào map`);
          } else {
            console.log(`ℹ️ Variant ${variantId} đã có trong map, bỏ qua`);
          }
        });
        
        console.log("📊 Số lượng variant unique:", variantMap.size);

        // Chuyển map thành array và sắp xếp
        const carsList = Array.from(variantMap.values()).sort((a, b) => {
          // Sắp xếp theo giá giảm dần
          return (b.sellingPrice || 0) - (a.sellingPrice || 0);
        });

        setCars(carsList);
        console.log("✅ Đã load", carsList.length, "xe từ inventory:", carsList);
        
        if (carsList.length === 0) {
          console.warn("⚠️ Không có xe nào để hiển thị sau khi xử lý");
        }
      } catch (err) {
        console.error("❌ Lỗi khi load xe từ inventory:", err);
        console.error("❌ Error details:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          url: err.config?.url
        });
        setError(`Không thể tải danh sách xe: ${err.response?.data?.message || err.message || "Vui lòng thử lại sau"}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  // Tạo route dựa trên variant name và truyền thông tin qua state
  const getCarRoute = (car) => {
    // Tạo route từ variant name (lowercase, replace spaces with dashes)
    const variantName = car.variantName?.toLowerCase().replace(/\s+/g, '') || '';
    
    // Map các variant name phổ biến
    const routeMap = {
      'herio': '/heriogreen',
      'heriogreen': '/heriogreen',
      'limo': '/limo',
      'limogreen': '/limo',
      'minio': '/minio',
      'miniogreen': '/minio',
      'vinfastvf3': '/vinfast3',
      'vinfastvf6': '/vinfast6',
      'vinfastvf7': '/vinfast7',
      'macan': '/macan',
      'macan4': '/macan4',
    };

    // Tìm route trong map
    for (const [key, route] of Object.entries(routeMap)) {
      if (variantName.includes(key)) {
        return route;
      }
    }

    // Fallback: route động dựa trên variantId
    return `/car/${car.variantId}`;
  };

  // Tạo state để truyền thông tin xe
  const getCarState = (car) => {
    return {
      variantId: car.variantId,
      colorId: car.colorId,
      inventoryId: car.inventoryId,
      variantName: car.variantName,
      colorName: car.colorName,
      sellingPrice: car.sellingPrice,
      mainImage: car.mainImage,
    };
  };

  // Format giá
  const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    return price.toLocaleString('vi-VN') + " ₫";
  };

  if (loading) {
    return (
      <div className="body">
        <div className='te'>
          <a>CÁC DÒNG XE HOT TẠI EVM CAR</a>
        </div>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Đang tải danh sách xe...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="body">
        <div className='te'>
          <a>CÁC DÒNG XE HOT TẠI EVM CAR</a>
        </div>
        <div style={{ textAlign: 'center', padding: '50px', color: '#e74c3c' }}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className="body">
        <div className='te'>
          <a>CÁC DÒNG XE HOT TẠI EVM CAR</a>
        </div>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Hiện tại chưa có xe nào trong kho. Vui lòng liên hệ Dealer để thêm xe.</p>
        </div>
      </div>
    );
  }

  // Chia xe thành các nhóm để hiển thị (3 nhóm như cũ)
  const group1 = cars.slice(0, 3);
  const group2 = cars.slice(3, 6);
  const group3 = cars.slice(6);

  return (
    <div className="body">
      <div className='te'>
        <a>CÁC DÒNG XE HOT TẠI EVM CAR</a>
      </div>
      
      {/* Nhóm 1 */}
      {group1.length > 0 && (
        <div className='car-body'>
          {group1.map((car, index) => (
            <div key={car.inventoryId || index} className='car-card'>
              <Link to={getCarRoute(car)} state={getCarState(car)}>
                {car.mainImage ? (
                  <img 
                    src={car.mainImage} 
                    alt={car.variantName} 
                    onError={(e) => {
                      // Fallback nếu ảnh lỗi
                      e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />
                ) : (
                  <div style={{ 
                    width: '100%', 
                    height: '300px', 
                    background: '#f0f0f0', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#999'
                  }}>
                    Chưa có hình ảnh
                  </div>
                )}
              </Link>
              <p className='name-car'>{car.variantName}</p>
              <p className='color-car' style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                Màu: {car.colorName}
              </p>
              <p className='price-car'>GIÁ TỪ {formatPrice(car.sellingPrice)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Nhóm 2 */}
      {group2.length > 0 && (
        <div className='car-body2'>
          {group2.map((car, index) => (
            <div key={car.inventoryId || index} className='car-card'>
              <Link to={getCarRoute(car)} state={getCarState(car)}>
                {car.mainImage ? (
                  <img 
                    src={car.mainImage} 
                    alt={car.variantName} 
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />
                ) : (
                  <div style={{ 
                    width: '100%', 
                    height: '300px', 
                    background: '#f0f0f0', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#999'
                  }}>
                    Chưa có hình ảnh
                  </div>
                )}
              </Link>
              <p className='name-car'>{car.variantName}</p>
              <p className='color-car' style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                Màu: {car.colorName}
              </p>
              <p className='price-car'>GIÁ TỪ {formatPrice(car.sellingPrice)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Nhóm 3 */}
      {group3.length > 0 && (
        <div className='car-body3'>
          {group3.map((car, index) => (
            <div key={car.inventoryId || index} className='car-card'>
              <Link to={getCarRoute(car)} state={getCarState(car)}>
                {car.mainImage ? (
                  <img 
                    src={car.mainImage} 
                    alt={car.variantName} 
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />
                ) : (
                  <div style={{ 
                    width: '100%', 
                    height: '300px', 
                    background: '#f0f0f0', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#999'
                  }}>
                    Chưa có hình ảnh
                  </div>
                )}
              </Link>
              <p className='name-car'>{car.variantName}</p>
              <p className='color-car' style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                Màu: {car.colorName}
              </p>
              <p className='price-car'>GIÁ TỪ {formatPrice(car.sellingPrice)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
