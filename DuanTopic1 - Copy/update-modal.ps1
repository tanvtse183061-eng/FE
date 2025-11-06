# Script để thêm modal vào tất cả các component xe

$files = @(
    "src\components\CarSection\Minio.jsx",
    "src\components\CarSection\Vinfast3.jsx",
    "src\components\CarSection\Vinfast6.jsx",
    "src\components\CarSection\Vinfast7.jsx",
    "src\components\CarSection\Macan.jsx",
    "src\components\CarSection\Macan4.jsx"
)

$modalHTML = @'

        {/* Modal liên hệ tư vấn */}
        {showModal && (
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
'@

foreach ($file in $files) {
    Write-Host "Đang xử lý: $file"
    
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Thêm state và handlers
        $content = $content -replace '(const \[index, setIndex\] = useState\(0\);)', "`$1`n  const [showModal, setShowModal] = useState(false);"
        
        # Thêm handlers sau handleSelect
        $content = $content -replace '(const handleSelect = \(selectedIndex\) => \{[^}]+\};)', "`$1`n`n  const handleImageClick = () => {`n    setShowModal(true);`n  };`n`n  const closeModal = () => {`n    setShowModal(false);`n  };"
        
        # Thêm onClick và cursor vào main image
        $content = $content -replace '(<img\s+src=\{[^}]+\}\s+alt="[^"]+"\s+className="main-car-image"\s*/>)', '<img $1 onClick={handleImageClick} style={{ cursor: ''pointer'' }} />'
        
        # Thêm onClick vào carousel images
        $content = $content -replace '(<img[^>]+className="d-block w-100 car-carousel-image"[^>]+/>)', '$1 onClick={handleImageClick} style={{ cursor: ''pointer'' }}'
        
        # Thêm modal trước </div>\n    </>\n  );\n}
        $content = $content -replace '(        </div>\s*</div>\s*</>\s*\);\s*})', "        </div>$modalHTML`n      </div>`n    </>`n  );`n}"
        
        Set-Content $file -Value $content
        Write-Host "✓ Hoàn thành: $file" -ForegroundColor Green
    } else {
        Write-Host "✗ Không tìm thấy: $file" -ForegroundColor Red
    }
}

Write-Host "`nĐã cập nhật tất cả các file!" -ForegroundColor Cyan
