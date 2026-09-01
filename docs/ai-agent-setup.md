# Cài Archify Cho AI Agent

## Hiểu đúng “gắn skill vào AI”

Skill là một thư mục có `SKILL.md`, schema, renderer và command đi kèm. Bạn đặt
thư mục đó vào nơi AI Agent quét skill. Agent đọc hướng dẫn để biết phải inspect
source và author JSON; runtime của Archify validate rồi render artifact.

```text
Bạn giao câu hỏi
  → AI Agent đọc source/test/log
  → Agent viết JSON theo schema Archify
  → Archify validate và render HTML
  → Bạn đối chiếu hình với evidence
```

## Cài cho agent dùng thư mục `~/.agents/skills`

Các command dưới đây tạo bản cài user-local, không sửa project tutorial:

```bash
mkdir -p ~/.agents/skills
git clone https://github.com/tt-a1i/archify.git ~/.agents/skills/archify
cd ~/.agents/skills/archify
npm install
```

Nếu agent của bạn dùng thư mục skill khác, thay `~/.agents/skills` bằng đường
dẫn được ghi trong tài liệu của agent. Không chỉ gửi URL GitHub trong prompt rồi
mong agent tự cài; hãy kiểm tra skill đã được discover trước.

## Kiểm tra cài đặt

```bash
test -f ~/.agents/skills/archify/SKILL.md
node ~/.agents/skills/archify/bin/archify.mjs --help
```

Sau đó mở phiên AI Agent mới và hỏi:

```text
Hãy liệt kê các skill liên quan đến architecture diagram mà bạn đang thấy.
Nếu có Archify, chỉ cho tôi path của SKILL.md; chưa tạo diagram.
```

Kết quả mong đợi: agent nhận ra `archify`. Nếu không, kiểm tra lại đúng thư mục
discovery của agent và khởi động lại phiên.

## Prompt đầu tiên nên dùng

```text
Hãy dùng skill Archify để trả lời đúng một câu hỏi:
“Request tạo order hiện tại đi qua các thành phần nào?”

Trước khi vẽ:
1. Đọc source, test và log liên quan trong repository này.
2. Liệt kê evidence bằng file path và nói phần nào chưa chắc chắn.
3. Chỉ vẽ hành vi CURRENT có evidence; không thêm database, queue hay cloud.
4. Author JSON mới theo schema và example của Archify.
5. Validate với quality_profile showcase, deliver HTML và chạy visual-check.
6. Báo receipt 9/9, 0 error, 0 warning; nếu không đạt thì nói rõ lỗi.
```

Prompt tốt luôn có câu hỏi hẹp, evidence boundary, nhãn `CURRENT/PROPOSED` và
definition of done. Chỉ nói “vẽ architecture cho repo này” thường tạo sơ đồ quá
rộng và khó bắt hallucination.

## Tự chạy validator

Trong tutorial này:

```bash
ARCHIFY_SKILL_ROOT="$HOME/.agents/skills/archify" npm run diagrams:check
```

Hoặc kiểm tra một file:

```bash
node "$HOME/.agents/skills/archify/bin/archify.mjs" \
  validate architecture diagrams/current/architecture-current.json \
  --quality showcase --json
```

## Lỗi thường gặp

- `SKILL.md` không tồn tại: clone sai cấp thư mục hoặc sai skill root.
- `Cannot find module`: command đang trỏ nhầm `scripts/archify.mjs`; CLI đúng
  nằm tại `bin/archify.mjs`.
- Agent thêm Postgres/Redis/queue: prompt thiếu evidence boundary hoặc agent
  đang vẽ `PROPOSED` nhưng không ghi nhãn.
- JSON có nhưng HTML cũ: `deliver` đã fail; không dùng artifact cũ làm bằng chứng.
- Validation pass nhưng hình khó đọc: chạy `visual-check` rồi mở bốn ảnh light/dark;
  automated pass không thay thế human review.

## Câu hỏi chưa rõ

- Mỗi AI Agent có vị trí discovery và cơ chế refresh skill khác nhau; kiểm tra
  tài liệu chính thức của agent đang dùng nếu `~/.agents/skills` không được hỗ trợ.
