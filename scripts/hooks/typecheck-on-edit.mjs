// Claude Code PostToolUse hook: after an Edit/Write to a .ts/.tsx file, run the
// typecheck. On failure, exit 2 so the errors are fed back to Claude to fix.
import { spawnSync } from 'node:child_process';

let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  let filePath = '';
  try {
    const payload = JSON.parse(input);
    filePath = payload?.tool_input?.file_path ?? payload?.tool_response?.filePath ?? '';
  } catch {
    process.exit(0);
  }

  if (!/\.tsx?$/.test(filePath)) process.exit(0);

  const result = spawnSync('npm run --silent typecheck', { encoding: 'utf8', shell: true });
  if (result.status !== 0) {
    const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim();
    process.stderr.write(`Typecheck failed after editing ${filePath}:\n${output.slice(0, 4000)}\n`);
    process.exit(2);
  }
});
