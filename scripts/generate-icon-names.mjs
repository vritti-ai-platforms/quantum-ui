// Generates the unified `icon-names.json` consumed by:
//   - @vritti/quantum-ui  → icon selector components (lib/selects/icon)
//   - @vritti/api-sdk     → @IsIconName() validator decorator (src/icons)
//
// Run MANUALLY when an icon dependency is bumped:
//   node scripts/generate-icon-names.mjs
// It is intentionally NOT wired into pre/postinstall.
//
// Sources (lucide-react is already a dependency; the other two are devDependencies):
//   lucide   ← lucide-react   (dist/esm/dynamicIconImports.js keys — kebab-case)
//   sf       ← sf-symbols-typescript (single-quoted union members in dist/index.d.ts — dot-case)
//   material ← Material Symbols names from quantum-ui-native's generated codepoints map (the same
//              set the mobile app renders on Android), so cloud authoring matches mobile rendering
//
// Output: `{ lucide: string[], sf: string[], material: string[] }`, each sorted + de-duped.

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Lucide — kebab names are the keys of dynamicIconImports. We keep only the names the STATIC
// `icons` map can render, because IconSelect renders glyphs via `icons[PascalName]` (not the
// per-icon dynamic import). Resolve via the package root so we don't hard-code a node_modules path.
const toPascalCase = (kebab) =>
  kebab
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
async function lucideNames() {
  const pkgRoot = path.dirname(require.resolve('lucide-react/package.json'));
  const dynImports = await import(pathToFileURL(path.join(pkgRoot, 'dist/esm/dynamicIconImports.js')));
  const lib = await import(pathToFileURL(path.join(pkgRoot, 'dist/esm/lucide-react.js')));
  const map = lib.icons ?? {};
  return Object.keys(dynImports.default ?? dynImports).filter((k) => map[toPascalCase(k)]);
}

// SF Symbols ships per-locale/script + directional variants of base symbols (e.g. `0.circle.ar`,
// `0.circle.hi`, `arrow.left.rtl`) — not distinct symbols anyone authors, so we drop any name with
// a locale/script/direction suffix segment, leaving the base catalog (~7843).
const SF_VARIANT_SEGMENTS = new Set([
  'ar', 'hi', 'he', 'th', 'ja', 'ko', 'zh', 'my', 'km', 'ne', 'kn', 'gu', 'ml', 'ta', 'te',
  'bn', 'si', 'am', 'or', 'pa', 'sat', 'sa', 'ku', 'rtl', 'ltr',
]);

// Authoritative source: the installed SF Symbols app's own metadata (matches the user's exact
// version). Falls back to the sf-symbols-typescript union (a cumulative superset that lags Apple
// and keeps deprecated names) only when the app isn't installed.
const SF_PLIST = '/Applications/SF Symbols.app/Contents/Resources/Metadata/name_availability.plist';
function sfNames() {
  let names;
  if (fs.existsSync(SF_PLIST)) {
    const json = JSON.parse(
      execSync(`plutil -convert json -o - "${SF_PLIST}"`, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }),
    );
    names = Object.keys(json.symbols ?? {});
  } else {
    const pkgRoot = path.dirname(require.resolve('sf-symbols-typescript/package.json'));
    const dts = fs.readFileSync(path.join(pkgRoot, 'dist/index.d.ts'), 'utf8');
    names = [];
    for (const line of dts.split('\n')) {
      const m = line.match(/^\s*\|\s*'([^']+)'/);
      if (m) names.push(m[1]);
    }
  }
  return [...new Set(names.filter((n) => !n.split('.').some((seg) => SF_VARIANT_SEGMENTS.has(seg))))];
}

// Material — Material Symbols names (snake_case), the SAME set the mobile app renders on Android
// (quantum-ui-native's DynamicIcon draws these codepoints from the bundled Material Symbols font),
// so the cloud picker/validator offers exactly what mobile can show. Sourced from the codepoints
// map generated from that font (../../quantum-ui-native/.../materialSymbols.codepoints.json).
function materialNames() {
  const codepointsPath = path.join(
    __dirname,
    '..',
    '..',
    'quantum-ui-native',
    'lib',
    'components',
    'DynamicIcon',
    'materialSymbols.codepoints.json',
  );
  return Object.keys(require(codepointsPath));
}

async function main() {
  const json = {
    lucide: (await lucideNames()).sort(),
    sf: sfNames().sort(),
    material: materialNames().sort(),
  };
  const pretty = `${JSON.stringify(json, null, 2)}\n`;

  // Write the same file into both consuming packages (sibling repos under the workspace root).
  const targets = [
    path.join(__dirname, '..', 'lib', 'icons', 'icon-names.json'),
    path.join(__dirname, '..', '..', 'api-sdk', 'src', 'icons', 'icon-names.json'),
  ];
  for (const target of targets) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, pretty);
    console.log(`wrote ${target}`);
  }
  console.log(`counts → lucide:${json.lucide.length} sf:${json.sf.length} material:${json.material.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
