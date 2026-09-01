# Lịch Sử Git Dành Cho Người Học

## Vì sao chia branch và tag?

Mỗi branch chỉ giải quyết một lát học. Annotated tag đóng vai trò như điểm lưu:
follower có thể checkout đúng trạng thái trước khi đọc bài kế tiếp.

## Quy trình bắt buộc cho mỗi lát

```bash
git switch main
git pull --ff-only
git switch -c <branch>
# thay đổi + verification
git commit
git tag -a <tag> -m "..."
git switch main
git merge --no-ff <branch>
git push origin main <branch> <tag>
```

Tag được tạo trên commit của feature branch **trước khi merge**. Merge commit
trên `main` giữ nguyên ranh giới của từng lát.

## Ma trận phát hành

| # | Branch | Annotated tag | Nội dung |
|---:|---|---|---|
| 1 | `feature/01-learning-baseline` | `feature-01-learning-baseline-v2.0.0` | Lộ trình và contract học tập |
| 2 | `feature/02-app-foundation` | `feature-02-app-foundation-v2.0.0` | HTTP server và web shell |
| 3 | `feature/03-order-domain` | `feature-03-order-domain-v2.0.0` | Catalog và vòng đời order |
| 4 | `feature/04-payment-mock` | `feature-04-payment-mock-v2.0.0` | Thanh toán deterministic |
| 5 | `feature/05-kitchen-worker` | `feature-05-kitchen-worker-v2.0.0` | Kitchen tick và fulfillment |
| 6 | `feature/06-web-checkout` | `feature-06-web-checkout-v2.0.0` | UI checkout xuyên suốt |
| 7 | `feature/07-tests-observability` | `feature-07-tests-observability-v2.0.0` | Test, event log, evidence |
| 8 | `prompt/01-architecture-current` | `prompt-01-architecture-current-v2.0.0` | Prompt Architecture |
| 9 | `prompt/02-workflow-current` | `prompt-02-workflow-current-v2.0.0` | Prompt Workflow |
| 10 | `prompt/03-sequence-current` | `prompt-03-sequence-current-v2.0.0` | Prompt Sequence |
| 11 | `prompt/04-dataflow-current` | `prompt-04-dataflow-current-v2.0.0` | Prompt Data Flow |
| 12 | `prompt/05-lifecycle-current` | `prompt-05-lifecycle-current-v2.0.0` | Prompt Lifecycle |
| 13 | `docs/01-follower-guide` | `docs-01-follower-guide-v2.0.0` | Guide end-to-end |
| 14 | `release/v2.0.0` | `release-v2.0.0-rc.1` | Clean-clone release candidate |

Release cuối chỉ được gắn tag `v2.0.0` sau khi tất cả gate đã pass.
