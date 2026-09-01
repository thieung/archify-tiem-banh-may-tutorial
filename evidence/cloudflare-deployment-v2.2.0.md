# Cloudflare Deployment Evidence — v2.2.0

## Target

- URL: `https://demo.slopengineer.dev/s/9eb05eebff7f/`
- Worker: `archify-tiem-banh-may-demo`
- Custom Domain: `demo.slopengineer.dev`
- Cloudflare Version ID: `3788aed3-e840-432c-98d2-cb5565a96b85`
- Deployed: 2026-09-01

## Pre-deploy gates

- `npm run check`: 28/28 test pass; deterministic order kết thúc ở `COMPLETED`.
- `ARCHIFY_SKILL_ROOT=<installed-archify-skill> npm run diagrams:check`: năm
  diagram đều 9/9, 0 error, 0 warning.
- `wrangler deploy --dry-run`: 3 assets, Worker bundle, Durable Object và
  `ASSETS` binding pass.
- `npm audit`: 0 vulnerability.
- Wrangler local runtime pass root redirect, slug assets/API, scoped cookie và
  hành trình order đầy đủ.

## Deployment receipt

- Upload 2 asset thay đổi; 1 asset đã có trên edge.
- Worker startup time: 4 ms.
- Root `GET /` và `HEAD /` trả `302` tới `/s/9eb05eebff7f/`.
- Slug index, `app.js`, `styles.css` và health API trả `200`.
- Root `/api/health` trả `404` nên app không chiếm API namespace của domain.
- Health response tạo secure HttpOnly cookie với `Path=/s/9eb05eebff7f`.
- Public API journey qua cùng cookie pass đủ:
  `AWAITING_PAYMENT → CONFIRMED → IN_KITCHEN → READY → COMPLETED`.
- Browser desktop journey pass tới `COMPLETED`, không có console error/warning.
- Mobile viewport 390×844 có `scrollWidth = innerWidth = 390`; không overflow ngang.
- Cloudflare và Google public DNS resolver trả về Cloudflare edge IP. Local system
  resolver còn giữ negative cache nên CLI verification dùng `curl --resolve`.

## Boundary

State vẫn là memory-only trong session Durable Object. Release này chứng minh
routing, isolation và interactive journey; không chứng minh durability hoặc
multi-user consistency.
