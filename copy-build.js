const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'frontend', 'build');
const dest = path.join(__dirname, 'build');

if (fs.existsSync(src)) {
  fs.cpSync(src, dest, { recursive: true });
  console.log('[build-script] Successfully copied frontend/build -> ./build');
} else {
  console.error('[build-script] Error: frontend/build does not exist!');
  process.exit(1);
}
