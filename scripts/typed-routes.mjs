// Regenerates .expo/types/router.d.ts from the files in src/app, before every typecheck.
//
// Why: on Windows the dev server's typed-routes watcher (@expo/router-server) checks
// `path.relative(appRoot, file).startsWith('../')`, but Windows paths start with '..\'.
// So every edit to a file outside src/app is added as a bogus route ("/../features/…")
// and `tsc` fails while `expo start` is running. Regenerating from disk avoids it.
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const projectRoot = process.cwd();
const appRoot = path.join(projectRoot, 'src', 'app');
const outFile = path.join(projectRoot, '.expo', 'types', 'router.d.ts');

const require = createRequire(path.join(projectRoot, 'package.json'));
const { requireContext } = require('expo-router/internal/testing');
const { EXPO_ROUTER_CTX_IGNORE } = require('expo-router/_ctx-shared');

// The generator ships with the Expo CLI that the installed `expo` package uses.
const cliRequire = createRequire(
  require.resolve('@expo/cli/package.json', {
    paths: [path.dirname(require.resolve('expo/package.json'))],
  }),
);
const { getTypedRoutesDeclarationFile } = cliRequire(
  '@expo/router-server/build/typed-routes/generate',
);

process.env.EXPO_ROUTER_APP_ROOT = appRoot;
const ctx = requireContext(appRoot, true, EXPO_ROUTER_CTX_IGNORE);
const file = getTypedRoutesDeclarationFile(ctx, {});
if (!file) {
  console.error('typed-routes: nothing generated');
  process.exit(1);
}
mkdirSync(path.dirname(outFile), { recursive: true });
writeFileSync(outFile, file);
