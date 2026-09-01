import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const skillRoot = process.env.ARCHIFY_SKILL_ROOT;
if (!skillRoot) {
  console.error('Thiếu ARCHIFY_SKILL_ROOT. Ví dụ: ARCHIFY_SKILL_ROOT="$HOME/.agents/skills/archify" npm run diagrams:check');
  process.exit(2);
}

const cli = path.join(skillRoot, 'bin', 'archify.mjs');
if (!existsSync(cli)) {
  console.error(`Không tìm thấy Archify CLI tại ${cli}`);
  process.exit(2);
}

const diagrams = [
  ['architecture', 'architecture-current.json'],
  ['workflow', 'workflow-current.json'],
  ['sequence', 'sequence-current.json'],
  ['dataflow', 'dataflow-current.json'],
  ['lifecycle', 'lifecycle-current.json'],
];

for (const [mode, filename] of diagrams) {
  const input = path.join('diagrams', 'current', filename);
  const args = [cli, 'validate', mode, input, '--quality', 'showcase'];
  if (mode === 'architecture') args.push('--repo-root', process.cwd());
  args.push('--json');
  const result = spawnSync(process.execPath, args, {
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    console.error(`[FAIL] ${mode}\n${result.stdout || result.stderr}`);
    process.exit(result.status ?? 1);
  }
  const receipt = JSON.parse(result.stdout);
  const summary = receipt.composition?.summary ?? {};
  console.log(`[PASS] ${mode}: ${receipt.checks.length}/${receipt.checks.length}, ${summary.errors ?? 0} error, ${summary.warnings ?? 0} warning`);
}
