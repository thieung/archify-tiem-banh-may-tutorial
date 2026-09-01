# Hướng Dẫn Archify End-to-End Với Tiệm Bánh Mây

## Vấn đề

Một diagram AI tạo ra có thể rất đẹp nhưng vẫn bịa database, queue hoặc failure
path. Tutorial này dùng một app nhỏ chạy thật để bạn kiểm tra được từng nét vẽ.

Hãy hình dung source là gian bếp thật, test/log là sổ bếp, prompt là phiếu khảo
sát, Archify là khuôn bản vẽ, còn bạn là người nghiệm thu. Archify không tự chứng
minh một thiết kế tưởng tượng chạy được; nó kiểm tra cấu trúc và cách trình bày
của sơ đồ mà AI Agent author.

## Đối tượng phù hợp

- Người không viết code nhưng cần hiểu hệ thống qua flow.
- Developer muốn tạo docs architecture có thể review và tái tạo.
- Tech lead muốn phân biệt system fact với proposal.

Bạn chỉ cần biết mở Terminal, copy command và mở file bằng browser.

## Điều kiện trước khi làm

- Git.
- Node.js 20 trở lên.
- Một AI Agent có khả năng đọc repository và dùng Agent Skills.
- Archify đã cài theo [hướng dẫn setup](ai-agent-setup.md).

## Quick start

```bash
git clone https://github.com/thieung/archify-tiem-banh-may-tutorial.git
cd archify-tiem-banh-may-tutorial
npm run check
npm start
```

Mở `http://localhost:3000`. Tạo đơn với `tok_success`, chạy hai kitchen tick và
hoàn tất đơn. Bạn vừa tạo evidence cho đường:

```text
AWAITING_PAYMENT → CONFIRMED → IN_KITCHEN → READY → COMPLETED
```

Thử lại bằng `tok_declined`. Kết quả phải dừng tại `PAYMENT_FAILED`.

## Cách tiếp cận evidence-first

Trước mỗi diagram, đừng bắt đầu bằng “loại hình nào đẹp”. Hãy bắt đầu bằng một
câu hỏi mà người xem cần trả lời:

1. Chốt một câu hỏi hẹp.
2. Chỉ định source/test/log agent được đọc.
3. Yêu cầu agent liệt kê fact và uncertainty.
4. Chọn mode phù hợp với câu hỏi.
5. Author JSON, validate 9/9 và deliver HTML.
6. Chạy visual-check, mở ảnh và đối chiếu với source map.

Quy tắc nhanh: không trỏ được node, edge hoặc state về evidence thì bỏ khỏi
`CURRENT`, hoặc chuyển sang artifact `PROPOSED` riêng.

## Scenario 1 — Architecture

**Câu hỏi:** App có những thành phần chạy thật nào và chúng nối với nhau ra sao?

Đọc [prompt gốc](../prompts/01-architecture-current.md), sau đó mở
[Architecture HTML](../diagrams/current/architecture-current.html). Dùng khi
onboard người mới, review boundary hoặc kiểm tra AI có bịa infrastructure không.

Evidence chính: `public/app.js`, `src/http.js`, các store in-memory và
`scripts/run-demo.js`. Diagram không có Postgres hay payment provider thật vì
app không có chúng.

## Scenario 2 — Workflow

**Câu hỏi:** Một order thành công hoặc thất bại đi qua bước và quyết định nào?

Đọc [prompt gốc](../prompts/02-workflow-current.md), mở
[Workflow HTML](../diagrams/current/workflow-current.html). Dùng cho SOP, vận
hành và giải thích business path cho người không cần biết class/function.

Điểm cần soi: sold-out xảy ra trước khi order được tạo; payment decline đi đến
`PAYMENT_FAILED`; happy path chỉ `COMPLETED` sau hai tick và thao tác complete.

## Scenario 3 — Sequence

**Câu hỏi:** Trong request create + pay, thành phần nào gọi thành phần nào theo
thứ tự thời gian?

Đọc [prompt gốc](../prompts/03-sequence-current.md), mở
[Sequence HTML](../diagrams/current/sequence-current.html). Dùng để debug API,
review integration boundary hoặc giải thích request/response.

Sequence khác Workflow: Workflow nhấn vào bước và nhánh quyết định; Sequence
nhấn vào thứ tự lời gọi giữa Browser, HTTP handler, stores, gateway và event log.

## Scenario 4 — Data Flow

**Câu hỏi:** Dữ liệu checkout, payment fixture, state và evidence đi đâu?

Đọc [prompt gốc](../prompts/04-dataflow-current.md), mở
[Data Flow HTML](../diagrams/current/dataflow-current.html). Dùng khi review data
lineage, PII, logging hoặc ranh giới lưu trữ.

Token chỉ được dùng để tạo outcome deterministic. Order và event evidence không
lưu raw token; test tại `test/events.test.js` giữ invariant này.

## Scenario 5 — Lifecycle

**Câu hỏi:** Một order đã được tạo có thể chuyển state thế nào?

Đọc [prompt gốc](../prompts/05-lifecycle-current.md), mở
[Lifecycle HTML](../diagrams/current/lifecycle-current.html). Dùng khi review
state machine, terminal state hoặc điều kiện chuyển trạng thái.

`REJECTED` có trong enum nhưng không có transition thực thi được. Nó không xuất
hiện trong lifecycle `CURRENT`; đây là ví dụ quan trọng về việc không biến một
string trong source thành behavior chưa tồn tại.

## Cách đọc ba lớp artifact

- Prompt `.md`: nhiệm vụ, scope và definition of done đã giao cho AI.
- JSON: nguồn có cấu trúc để review node, edge, message hoặc transition.
- HTML: artifact tương tác để trình bày; PNG là visual evidence cho QA.
- Receipt `.md`: hash, validation score, containment và human-review status.

HTML đẹp không đủ. JSON cho biết agent đã author gì; receipt cho biết đúng file
đó đã qua validator; source map cho biết semantic claim có bằng chứng hay không.

## Học lại theo từng tag

Ví dụ xem app trước và sau khi có payment:

```bash
git switch --detach feature-03-order-domain-v2.0.0
npm test
git switch --detach feature-04-payment-mock-v2.0.0
npm test
git switch main
```

Danh sách đầy đủ nằm trong [lịch sử Git](git-learning-history.md). Mỗi tag nằm
trên feature/prompt commit trước merge; `main` dùng merge commit để giữ ranh giới.

## Verification

```bash
npm run check
ARCHIFY_SKILL_ROOT="$HOME/.agents/skills/archify" npm run diagrams:check
```

Expected output:

- 20/20 test pass.
- Evidence happy path kết thúc `COMPLETED` với 6 event.
- Năm dòng `[PASS]`, mỗi diagram `9/9`, 0 error, 0 warning.

Sau automated check, mở các file `*.visual-check.html`. Kiểm tra light/dark,
không overlap, label đọc được và nhánh failure không nhập nhằng với main path.

## Khi nào vẽ PROPOSED?

Ví dụ bạn muốn thêm Postgres và queue. Tạo prompt/artifact mới có `PROPOSED`
trong title; không sửa diagram `CURRENT` để giả như component đã tồn tại. Sau khi
implement và test, chạy lại evidence workflow để tạo phiên bản `CURRENT` mới.

Archify render proposal; app test/harness mới chứng minh proposal chạy được.

## Troubleshooting

- Port 3000 đang bận: chạy `PORT=3100 npm start` và mở port mới.
- Test fail sau khi đã chạy app: dừng process cũ rồi chạy lại; test tự tạo state riêng.
- Diagram khác source: checkout đúng tag/revision ghi trong prompt, rồi kiểm tra
  `evidence/source-map.md`.
- Viewer không mở trên GitHub: clone repo và mở file HTML local.
- Visual-check báo overflow: giảm scope/canvas hoặc sửa đúng diagnostic, deliver
  lại rồi mới review ảnh mới.

## Giới hạn

- Dữ liệu mất khi process dừng.
- Payment token chỉ là fixture, không phải xử lý card thật.
- Kitchen tick do người dùng kích hoạt, không có background worker thật.
- Browser happy path đã kiểm tra desktop; mobile responsive chưa phải release gate.
- Diagram phản ánh revision được pin trong prompt, không tự cập nhật khi code đổi.

## References

- [Archify repository](https://github.com/tt-a1i/archify)
- [Archify guide](https://tt-a1i.github.io/archify/guide.html)
- [Source map của tutorial](../evidence/source-map.md)

## Câu hỏi chưa rõ

- Không có trong phạm vi tutorial v2.0.0.
