# Cloudflare Deployment Evidence — v2.1.0

## Target

- URL: `https://demo.slopengineer.dev`
- Worker: `archify-tiem-banh-may-demo`
- Custom Domain: `demo.slopengineer.dev`
- Cloudflare Version ID: `242e72eb-16a1-47c8-bc8e-daeaa641186c`
- Deployed: 2026-09-01

## Pre-deploy gates

- `npm run check`: 25/25 test pass.
- Worker happy path test kết thúc ở `COMPLETED`.
- Session-cookie routing test chứng minh request kế tiếp dùng cùng Durable Object.
- Invalid session ID được thay bằng UUID mới trước khi gọi Durable Object binding.
- `wrangler deploy --dry-run`: 3 assets, Worker bundle và `ASSETS` binding pass.
- `npm audit`: 0 vulnerability.

## Deployment receipt

- Upload 3 static assets thành công.
- Worker startup time: 4 ms.
- Custom Domain trigger được tạo thành công.
- DNS từ Cloudflare và Google public resolver trả về Cloudflare edge IP.
- HTTPS health và homepage pass qua Cloudflare edge trong lúc local resolver còn
  giữ negative cache.
- Public API journey qua cùng cookie pass đủ:
  `AWAITING_PAYMENT → CONFIRMED → IN_KITCHEN → READY → COMPLETED`.
- Browser desktop journey pass tới `COMPLETED`, không có console error/warning.
- Mobile viewport 390×844 có `scrollWidth = innerWidth = 390`; không overflow ngang.

## Boundary

State là memory-only theo đúng scope demo; deployment này không chứng minh
durability hoặc multi-user consistency.
