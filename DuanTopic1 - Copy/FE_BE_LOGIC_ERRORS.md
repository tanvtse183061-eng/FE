# CÁC LỖI LOGIC VÀ TIỀM ẨN GIỮA FRONTEND VÀ BACKEND

## ❌ LỖI 1: PublicQuotationController - Accept/Reject Quotation

### Vấn đề:
- **Backend**: `PublicQuotationController.acceptQuotation()` và `rejectQuotation()` sử dụng `@RequestParam` (query parameters)
- **Frontend**: `publicQuotationAPI.acceptQuotation()` và `rejectQuotation()` đang gửi data trong request body

### Backend Code:
```java
@PostMapping("/{quotationId}/accept")
public ResponseEntity<?> acceptQuotation(
    @PathVariable UUID quotationId,
    @RequestParam(required = false) String conditions) {  // Query param

@PostMapping("/{quotationId}/reject")
public ResponseEntity<?> rejectQuotation(
    @PathVariable UUID quotationId,
    @RequestParam(required = false) String reason,  // Query param
    @RequestParam(required = false) String adjustmentRequest) {  // Query param
```

### Frontend Code (SAI):
```javascript
acceptQuotation: (id, conditions) => publicApi.post(`/quotations/${id}/accept`, { conditions }),  // Body
rejectQuotation: (id, reason, adjustmentRequest) => publicApi.post(`/quotations/${id}/reject`, { reason, adjustmentRequest }),  // Body
```

### Fix:
```javascript
// Option 1: Sửa Frontend để gửi query params
acceptQuotation: (id, conditions) => {
  const params = conditions ? { conditions } : {};
  return publicApi.post(`/quotations/${id}/accept`, null, { params });
},
rejectQuotation: (id, reason, adjustmentRequest) => {
  const params = {};
  if (reason) params.reason = reason;
  if (adjustmentRequest) params.adjustmentRequest = adjustmentRequest;
  return publicApi.post(`/quotations/${id}/reject`, null, { params });
},

// Option 2: Sửa Backend để nhận request body (KHUYẾN NGHỊ)
// Thay @RequestParam bằng @RequestBody Map<String, String>
```

---

## ❌ LỖI 2: DealerOrderController - Reject Order

### Vấn đề:
- **Backend**: `rejectDealerOrder()` sử dụng `@RequestParam String rejectionReason`
- **Frontend**: `dealerOrderAPI.rejectOrder()` đang gửi trong request body

### Backend Code:
```java
@PostMapping("/{dealerOrderId}/reject")
public ResponseEntity<?> rejectDealerOrder(
    @PathVariable UUID dealerOrderId, 
    @RequestParam @Parameter(description = "Lý do từ chối") String rejectionReason) {  // Query param
```

### Frontend Code (SAI):
```javascript
rejectOrder: (id, rejectionReason) => api.post(`/dealer-orders/${id}/reject`, { rejectionReason }),  // Body
```

### Fix:
```javascript
// Option 1: Sửa Frontend
rejectOrder: (id, rejectionReason) => 
  api.post(`/dealer-orders/${id}/reject`, null, { params: { rejectionReason } }),

// Option 2: Sửa Backend (KHUYẾN NGHỊ)
// Thay @RequestParam bằng @RequestBody Map<String, String>
```

---

## ❌ LỖI 3: DealerOrderController - Request Quotation

### Vấn đề:
- **Backend**: `requestQuotationFromFactory()` sử dụng `@RequestParam(required = false) String notes`
- **Frontend**: `dealerOrderAPI.requestQuotation()` đang gửi trong request body

### Backend Code:
```java
@PostMapping("/{dealerOrderId}/request-quotation")
public ResponseEntity<?> requestQuotationFromFactory(
    @PathVariable UUID dealerOrderId, 
    @RequestParam(required = false) String notes) {  // Query param
```

### Frontend Code (SAI):
```javascript
requestQuotation: (id, notes) => api.post(`/dealer-orders/${id}/request-quotation`, { notes }),  // Body
```

### Fix:
```javascript
// Option 1: Sửa Frontend
requestQuotation: (id, notes) => {
  const params = notes ? { notes } : {};
  return api.post(`/dealer-orders/${id}/request-quotation`, null, { params });
},

// Option 2: Sửa Backend (KHUYẾN NGHỊ)
// Thay @RequestParam bằng @RequestBody Map<String, String>
```

---

## ✅ ĐÚNG: DealerQuotationController - Create Quotation From Order

### Backend Code:
```java
@PostMapping("/from-order/{dealerOrderId}")
public ResponseEntity<?> createQuotationFromOrder(
    @PathVariable UUID dealerOrderId,
    @RequestParam(required = false) UUID evmStaffId,
    @RequestParam(required = false) BigDecimal discountPercentage,
    @RequestParam(required = false) String notes) {  // Query params
```

### Frontend Code (ĐÚNG):
```javascript
createQuotationFromOrder: (orderId, params) => 
  api.post(`/dealer-quotations/from-order/${orderId}`, null, { params }),
```

---

## ⚠️ LỖI TIỀM ẨN 1: DealerPaymentController - Payment Method Field

### Vấn đề:
- Backend có fallback logic cho `paymentMethod` vs `paymentType`, nhưng Frontend nên dùng đúng field name

### Backend Code:
```java
// Field name là paymentMethod (không phải paymentType)
String paymentMethod = paymentRequest.getOrDefault("paymentMethod", 
    paymentRequest.getOrDefault("paymentType", "BANK_TRANSFER")).toString();
```

### Khuyến nghị:
Frontend nên luôn dùng `paymentMethod` (không phải `paymentType`) để tránh confusion.

---

## ❌ LỖI 5: DealerQuotationController - Reject Quotation

### Vấn đề:
- **Backend**: `rejectQuotation()` sử dụng `@RequestParam(required = false) String reason`
- **Frontend**: `dealerQuotationAPI.rejectQuotation()` đang gửi trong request body

### Backend Code:
```java
@PostMapping("/{quotationId}/reject")
public ResponseEntity<?> rejectQuotation(
    @PathVariable UUID quotationId,
    @RequestParam(required = false) String reason) {  // Query param
```

### Frontend Code (SAI):
```javascript
rejectQuotation: (id, reason) => api.post(`/dealer-quotations/${id}/reject`, { reason }),  // Body
```

### Fix:
```javascript
// Option 1: Sửa Frontend
rejectQuotation: (id, reason) => {
  const params = reason ? { reason } : {};
  return api.post(`/dealer-quotations/${id}/reject`, null, { params });
},

// Option 2: Sửa Backend (KHUYẾN NGHỊ)
// Thay @RequestParam bằng @RequestBody Map<String, String>
```

---

## 📋 TÓM TẮT CÁC LỖI CẦN FIX

### Ưu tiên cao (Lỗi nghiêm trọng):
1. ✅ **PublicQuotationController.acceptQuotation** - Query param vs Body
2. ✅ **PublicQuotationController.rejectQuotation** - Query param vs Body  
3. ✅ **DealerOrderController.rejectOrder** - Query param vs Body
4. ✅ **DealerOrderController.requestQuotation** - Query param vs Body
5. ✅ **DealerQuotationController.rejectQuotation** - Query param vs Body

### Ưu tiên trung bình (Lỗi tiềm ẩn):
6. ⚠️ **DealerPaymentController** - Đảm bảo Frontend dùng `paymentMethod` (không phải `paymentType`)

---

## 🔧 KHUYẾN NGHỊ FIX

### Option 1: Sửa Frontend (Nhanh)
- Thay đổi các API calls để gửi query params thay vì request body

### Option 2: Sửa Backend (Tốt hơn - KHUYẾN NGHỊ)
- Thay `@RequestParam` bằng `@RequestBody Map<String, String>` cho các endpoints:
  - `PublicQuotationController.acceptQuotation()`
  - `PublicQuotationController.rejectQuotation()`
  - `DealerOrderController.rejectDealerOrder()`
  - `DealerOrderController.requestQuotationFromFactory()`
  - `DealerQuotationController.rejectQuotation()`

Lý do: Request body phù hợp hơn cho các thao tác POST, dễ mở rộng và nhất quán với các endpoints khác.

