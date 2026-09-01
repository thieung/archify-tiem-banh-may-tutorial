# Prompt 05 — Lifecycle CURRENT

Hãy dùng skill Archify để trả lời đúng một câu hỏi: “Một order đã được tạo trong Tiệm bánh Mây chuyển trạng thái thế nào?”

Đọc `src/orders.js`, `test/payment.test.js`, `test/kitchen.test.js` và `evidence/happy-path-order.json`. Vẽ lifecycle CURRENT từ evidence tại revision `ca4de54c78ffaca9c6d6159ec9643fa0447c01e2`. Chỉ đưa các state có transition thực thi được vào sơ đồ. Tách main path và payment failure; không biến `REJECTED` thành state reachable nếu source không có transition tới nó. Dùng `quality_profile: showcase`, validate 9/9, deliver HTML, chạy visual-check và báo receipt cùng giới hạn evidence.
