import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const source = path.join(__dirname, '../lib/components/Sidebar/Sidebar.d.ts.template');
const dest = path.join(__dirname, '../dist/Sidebar.d.ts');

try {
  fs.copyFileSync(source, dest);
  console.log('✓ Copied Sidebar.d.ts to dist/');
} catch (error) {
  console.error('Error copying Sidebar.d.ts:', error.message);
  process.exit(1);
}

