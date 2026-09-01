# Source Map Cho Diagram CURRENT

| Fact | Source chính | Verification |
|---|---|---|
| Browser gọi HTTP API | `public/app.js` | Browser happy path |
| HTTP định tuyến request | `src/http.js` | `test/http-foundation.test.js` |
| Catalog giữ và trừ stock | `src/catalog.js` | `test/order-domain.test.js` |
| Order bắt đầu ở `AWAITING_PAYMENT` | `src/orders.js` | order-domain test |
| Payment success/failure deterministic | `src/payment.js` | `test/payment.test.js` |
| Kitchen cần hai tick rõ ràng | `src/kitchen.js` | `test/kitchen.test.js` |
| Order kết thúc ở `COMPLETED` | `src/orders.js` | `evidence/happy-path-order.json` |
| Event log không lưu payment token | `src/events.js` | `test/events.test.js` |

Phạm vi này không có database, message broker, cloud service, authentication hay
payment provider thật. AI Agent không được thêm các component đó vào diagram CURRENT.
