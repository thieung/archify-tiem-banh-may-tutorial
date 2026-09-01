# Deploy Tiệm Bánh Mây Lên Cloudflare

## Kiến trúc triển khai

Cloudflare Workers phục vụ API, còn Workers Static Assets phục vụ ba file trong
`public/`. Mỗi browser session được route tới một Durable Object để các request
create/pay/tick/complete nhìn thấy cùng state. Custom Domain trỏ toàn bộ
`demo.slopengineer.dev` tới Worker này.

```text
Browser → demo.slopengineer.dev
        ├─ /, /app.js, /styles.css → Static Assets
        └─ /api/*                  → Worker adapter → session Durable Object
```

Local Node server vẫn chạy bằng `npm start`. `src/worker.js` là adapter riêng
cho runtime Cloudflare và dùng lại catalog, order, payment, kitchen, event modules.

## Điều kiện

- Cloudflare account quản lý zone `slopengineer.dev`.
- OAuth/API token có quyền deploy Workers và Workers Routes.
- Node.js 20 trở lên.

## Chạy local bằng runtime Cloudflare

```bash
npm install
npm run dev:cloudflare
```

## Deploy

```bash
npm run check
npx wrangler deploy --dry-run
npm run deploy:cloudflare
```

`wrangler.jsonc` dùng Custom Domain nên Cloudflare tự tạo DNS record và certificate.
Không tạo CNAME thủ công cho hostname này.

## Verification

```bash
curl --fail https://demo.slopengineer.dev/api/health
curl --fail https://demo.slopengineer.dev/
```

Health response phải chứa:

```json
{"service":"tiem-banh-may","status":"ok","runtime":"cloudflare-worker"}
```

Sau đó dùng browser chạy create → pay → hai kitchen tick → complete. State cuối
phải là `COMPLETED`.

## Rollback

```bash
npx wrangler deployments status
npx wrangler rollback <version-id>
```

Rollback code không phục hồi state vì app không có durable storage.

## Giới hạn

- State nằm trong memory của session Durable Object và mất khi object bị evict
  hoặc khi deploy; Durable Object storage chưa được dùng.
- Không dùng cho order thật, payment thật hoặc nhiều người dùng đồng thời.
- Muốn production hóa cần Durable Object/D1 và thiết kế consistency riêng; việc
  đó nằm ngoài tutorial hiện tại.

## References

- [Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Cloudflare Workers Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)

## Câu Hỏi Chưa Rõ

- Không có trong phạm vi deployment demo v2.1.0.
