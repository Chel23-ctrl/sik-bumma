/**
 * Bridge environment variables Vercel (`VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY`)
 * ke `REACT_APP_SUPABASE_*` secara otomatis saat menjalankan Create React App (`start` / `build`),
 * tanpa menulis file rahasia apa pun ke disk.
 */
const { spawnSync } = require('child_process');

const mode = process.argv[2] || 'build';
const env = { ...process.env };

if (!env.REACT_APP_SUPABASE_URL) {
  env.REACT_APP_SUPABASE_URL =
    env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || '';
}

if (!env.REACT_APP_SUPABASE_ANON_KEY) {
  env.REACT_APP_SUPABASE_ANON_KEY =
    env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
}

const scriptPath = require.resolve(`react-scripts/scripts/${mode}`);
const result = spawnSync(process.execPath, [scriptPath], {
  stdio: 'inherit',
  env
});

process.exit(result.status === null ? 1 : result.status);
