# Lộ Trình Học Archify End-to-End

## Mô hình dễ hiểu

Hãy hình dung AI Agent là một nhân viên khảo sát tiệm bánh:

- Source code là gian bếp thật.
- Test và log là sổ ghi nhận việc bếp đã làm.
- Prompt là phiếu giao nhiệm vụ khảo sát.
- Archify là bộ khuôn kiểm tra và trình bày bản vẽ.
- Người dùng là người duyệt xem bản vẽ có đúng với gian bếp hay không.

Vì vậy, Archify **không tự chạy thử thiết kế tưởng tượng**. AI Agent có thể đọc
source rồi mô tả hệ thống đang có, hoặc vẽ một đề xuất tương lai. Tutorial này
luôn ghi rõ hai loại:

- `CURRENT`: có evidence từ code, test hoặc log.
- `PROPOSED`: ý tưởng thiết kế, chưa được xem là hành vi của app.

## Kết quả sau tutorial

Người học có thể:

1. Chạy app Tiệm bánh Mây và tạo một đơn hàng.
2. Chạy test để quan sát happy path và failure path.
3. Đưa prompt cho AI Agent có cài Archify skill.
4. Yêu cầu agent trích evidence trước khi vẽ.
5. Tạo năm loại sơ đồ CURRENT và kiểm tra lại với source.
6. Nhận ra khi AI thêm component hoặc luồng không có thật.

## Các chặng

| Chặng | Việc người học làm | Bằng chứng nhận được |
|---|---|---|
| 1. Baseline | Hiểu bài toán và lịch sử Git | Roadmap, branch, tag |
| 2. App | Chạy web và API | HTTP response |
| 3. Nghiệp vụ | Tạo đơn, thanh toán, làm bánh | State transitions |
| 4. Verification | Chạy test và demo script | Test output, event log |
| 5. Prompt | Cho AI đọc source có giới hạn | Evidence manifest |
| 6. Archify | Validate và render năm sơ đồ | JSON, HTML, receipt |
| 7. Review | So sánh hình với code | Checklist human review |

## Quy tắc quyết định nhanh

Nếu một node, edge hoặc state không trỏ được về file, test hay log, hãy gắn nhãn
`PROPOSED` hoặc bỏ nó khỏi sơ đồ `CURRENT`.
