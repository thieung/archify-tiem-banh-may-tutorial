# Archify End-to-End Tutorial — Tiệm bánh Mây

Repository hướng dẫn dùng AI Agent và Archify trên **một ứng dụng chạy thật**.

Người học sẽ đi từ source code, test và log của Tiệm bánh Mây đến năm loại sơ đồ
CURRENT: Architecture, Workflow, Sequence, Data Flow và Lifecycle.

> Repository này là tutorial độc lập. Bộ artifact minh họa cũ vẫn được giữ nguyên
> tại [archify-tiem-banh-may-demo](https://github.com/thieung/archify-tiem-banh-may-demo).

## Bắt đầu ở đâu?

- Người không viết code: đọc [lộ trình học](docs/learning-path.md) trước.
- Người muốn chạy ngay: chờ mốc `feature-02-app-foundation-v2.0.0` rồi dùng
  `npm start`.
- Người muốn xem lịch sử xây dựng: đọc [quy ước branch và tag](docs/git-learning-history.md).

## Đích đến

```text
App chạy thật → test/log làm evidence → prompt cho AI Agent
             → JSON có cấu trúc → Archify validate/render
             → người học đối chiếu sơ đồ với code
```

Chi tiết được bổ sung tuần tự trong `docs/`, `prompts/`, `evidence/` và
`diagrams/`. [Bảng tiến độ](docs/progress.md) phân biệt rõ phần dự kiến, đã viết,
đã chạy và đã được con người xem lại.

## Chạy app

Yêu cầu Node.js 20 trở lên. App không có runtime dependency bên ngoài.

```bash
npm start
```

Mở `http://localhost:3000`. Kiểm tra foundation bằng:

```bash
npm test
```

## License

MIT
