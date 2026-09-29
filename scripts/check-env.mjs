// `npm run doctor:env` — checks the tools this project needs on this machine.
// Prints one line per tool and exits 1 if anything required is missing.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const run = (command) => {
  const result = spawnSync(command, { encoding: 'utf8', shell: true });
  return { ok: result.status === 0, out: `${result.stdout ?? ''}${result.stderr ?? ''}`.trim() };
};

const checks = [
  {
    name: 'Node 20+',
    required: true,
    test: () => {
      const major = Number(process.versions.node.split('.')[0]);
      return { ok: major >= 20, detail: `v${process.versions.node}` };
    },
    fix: 'Install Node 20 or newer: https://nodejs.org',
  },
  {
    name: 'Playwright (web E2E)',
    required: true,
    test: () => {
      const { ok, out } = run('npx --no-install playwright --version');
      return { ok, detail: ok ? out.split('\n').pop() : 'not installed' };
    },
    fix: 'npm install',
  },
  {
    name: 'Playwright Chromium',
    required: true,
    test: () => {
      // --dry-run prints each browser's install location; a missing one is reported as not installed.
      const { ok, out } = run('npx --no-install playwright install --dry-run chromium');
      const dir = out.match(/Install location:\s*(.+)/)?.[1]?.trim();
      const installed = ok && Boolean(dir) && existsSync(dir);
      return { ok: installed, detail: installed ? dir : 'not downloaded' };
    },
    fix: 'npx playwright install chromium',
  },
];

// iOS runs on a real iPhone through Expo Go (ADR 0007); nothing to check on this machine.
console.log('info  iOS: install Expo Go on the iPhone, then npm start and scan the QR code.\n');

let missing = 0;
for (const check of checks) {
  const { ok, detail } = check.test();
  const mark = ok ? 'ok  ' : check.required ? 'MISS' : 'warn';
  console.log(`${mark}  ${check.name.padEnd(36)} ${detail}`);
  if (!ok) {
    console.log(`      → ${check.fix}`);
    if (check.required) missing += 1;
  }
}

console.log(
  missing
    ? `\n${missing} required tool(s) missing. See docs/setup.md.`
    : '\nAll required tools found.',
);
process.exit(missing ? 1 : 0);
