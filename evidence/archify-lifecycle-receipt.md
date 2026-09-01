# Receipt — Lifecycle CURRENT

- Specification SHA-256: `9be9cfef3ea5ed595fd3f9da8bf1c66d7c1cc719360827852979b8b1abea7a2e`
- Artifact SHA-256: `8a27504c8555849c295dbdf87117db713c9bc30b69167a85480f3dd2984cee7c`
- Showcase validation: 9/9, composition pass, 0 error, 0 warning
- Scope: năm state happy path và terminal `PAYMENT_FAILED`
- Evidence boundary: `REJECTED` không được vẽ vì source không có transition reachable tới state này
- Visual containment: pass tại bốn desktop viewport; light/dark captures pass
- Human review: pass; main rail và nhánh payment failure tách rõ, label không đè node
