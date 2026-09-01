# Release Evidence — v2.0.0

## Environment

- Ngày chạy: 2026-09-01
- Remote: `https://github.com/thieung/archify-tiem-banh-may-tutorial`
- Remote `main` revision được clone: `eb641ae4ce53040b9fa813c189a27a23bca1f8e7`
- Node.js: `v26.4.0` (project contract: Node.js 20+)
- Archify: `v2.16.0`, stable channel

## Clean-clone reproduction

```bash
git clone --branch main --single-branch \
  https://github.com/thieung/archify-tiem-banh-may-tutorial.git
cd archify-tiem-banh-may-tutorial
npm run check
ARCHIFY_SKILL_ROOT=/path/to/archify npm run diagrams:check
```

Kết quả:

- 20/20 test pass, 0 fail.
- `evidence/happy-path-order.json` được tái tạo nhưng working tree vẫn clean.
- Happy path kết thúc `COMPLETED` với 6 event.
- Architecture, Workflow, Sequence, Data Flow và Lifecycle đều 9/9,
  composition pass, 0 error, 0 warning.
- Remote repository là public và default branch là `main`.

## Visual review

- 5/5 contact sheet đã được kiểm tra bằng mắt.
- Light/dark capture và containment pass tại 1440×900, 1600×1000,
  1920×1080 và 2048×1320.
- Không dùng raw visual receipt JSON trong public repository vì receipt đó chứa
  absolute path của máy chạy; public receipt chỉ giữ hash và kết quả cần review.

## Giới hạn

- Browser happy path được chạy trên desktop local; mobile responsive không nằm
  trong release gate v2.0.0.
