# Archify End-to-End Tutorial — Tiệm bánh Mây

Repository hướng dẫn dùng AI Agent và Archify trên **một ứng dụng chạy thật**.

Người học sẽ đi từ source code, test và log của Tiệm bánh Mây đến năm loại sơ đồ
CURRENT: Architecture, Workflow, Sequence, Data Flow và Lifecycle.

> Repository này là tutorial độc lập. Bộ artifact minh họa cũ vẫn được giữ nguyên
> tại [archify-tiem-banh-may-demo](https://github.com/thieung/archify-tiem-banh-may-demo).

## Trạng thái

Đang triển khai theo từng feature branch. Mỗi lát học có annotated tag trước khi
được merge bằng `--no-ff` về `main`.

## Đích đến

```text
App chạy thật → test/log làm evidence → prompt cho AI Agent
             → JSON có cấu trúc → Archify validate/render
             → người học đối chiếu sơ đồ với code
```

Chi tiết sẽ được bổ sung tuần tự trong `docs/`, `prompts/`, `evidence/` và
`diagrams/`.

## License

MIT
