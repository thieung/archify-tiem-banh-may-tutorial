# Releases

## v2.2.0 — Stable demo slug

- Public app chuyển sang `https://demo.slopengineer.dev/s/9eb05eebff7f/` để domain có thể chứa nhiều demo.
- Domain root tạm thời redirect tới demo; app không còn chiếm `/api/*` ở root.
- Static assets, API và session cookie đều được scope theo slug ổn định.
- Local Node tutorial vẫn chạy ở `http://localhost:3000` mà không cần cấu hình prefix.
- 28/28 test pass trước deployment; live verification được lưu trong evidence release.

## v2.1.0 — Cloudflare hosted demo

- Public app tại `https://demo.slopengineer.dev`.
- Workers Static Assets phục vụ UI; Worker adapter phục vụ `/api/*`.
- Browser session được route tới cùng Durable Object bằng secure HttpOnly cookie.
- 25/25 test pass; public API và browser journey kết thúc `COMPLETED`.
- Có guide deploy, rollback và evidence receipt; state vẫn được ghi rõ là memory-only.

## v2.0.0 — End-to-end tutorial

- Ứng dụng Tiệm bánh Mây chạy thật bằng Node.js 20+, không có runtime dependency.
- Happy path và payment failure có test, deterministic evidence và event log không chứa raw token.
- Năm prompt evidence-first: Architecture, Workflow, Sequence, Data Flow và Lifecycle.
- Năm JSON source, HTML tương tác, light/dark screenshots và receipt 9/9.
- Guide cài Archify cho AI Agent, prompt mẫu, branch/tag learning history và troubleshooting.

Release gate: `npm run check`, `npm run diagrams:check`, clean-clone reproduction và human visual review.
