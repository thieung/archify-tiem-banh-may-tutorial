# Tiến Độ Và Evidence

## Ý nghĩa trạng thái

- `PLANNED`: đã chốt scope, chưa có code.
- `WRITTEN`: đã có file, chưa đủ verification.
- `VERIFIED`: command hoặc test đã chạy thành công.
- `HUMAN REVIEWED`: người xem đã kiểm tra hình và ý nghĩa.

## Bảng tiến độ

| Lát | Trạng thái | Evidence |
|---|---|---|
| Learning baseline | WRITTEN | `docs/learning-path.md`, lịch sử Git |
| App foundation | VERIFIED | `npm test`: 3/3 pass trên Node.js 26.4.0 |
| Order domain | VERIFIED | `npm test`: catalog, create/get order, sold-out paths pass |
| Payment mock | VERIFIED | `npm test`: success, decline, double-payment paths pass |
| Kitchen worker | VERIFIED | `npm test`: explicit ticks, ready, complete và invalid state pass |
| Web checkout | VERIFIED | Browser: happy path chạy từ catalog đến `COMPLETED`, desktop layout pass |
| Tests và observability | VERIFIED | `npm run check`: 20/20 test pass, evidence kết thúc `COMPLETED` với 6 event |
| Năm prompt CURRENT | PLANNED | Chưa có |
| Năm diagram CURRENT | PLANNED | Chưa có |
| Follower guide | PLANNED | Chưa có |

Không dùng trạng thái `VERIFIED` chỉ vì file tồn tại hoặc sơ đồ trông hợp lý.
