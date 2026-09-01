# Prompt 02 — Workflow CURRENT

Hãy dùng Archify Workflow schema v2 để trả lời: “Một đơn bánh đi từ chọn món
đến hoàn tất như thế nào, và dừng ở đâu khi hết hàng hoặc thanh toán lỗi?”

Đọc `public/app.js`, `src/http.js`, `src/orders.js`, `src/payment.js`,
`src/kitchen.js`, các test và `evidence/happy-path-order.json`. Tách main path,
sold-out branch và payment-decline branch. Không thêm retry, queue hoặc thao tác
tự động không có trong source. Dùng tiếng Việt, `quality_profile: showcase`,
validate 9/9, deliver và visual-check.
