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
| Kitchen worker | PLANNED | Chưa có |
| Web checkout | PLANNED | Chưa có |
| Tests và observability | PLANNED | Chưa có |
| Năm prompt CURRENT | PLANNED | Chưa có |
| Năm diagram CURRENT | PLANNED | Chưa có |
| Follower guide | PLANNED | Chưa có |

Không dùng trạng thái `VERIFIED` chỉ vì file tồn tại hoặc sơ đồ trông hợp lý.
