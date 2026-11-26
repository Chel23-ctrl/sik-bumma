/**
 * Vercel Serverless Function: mengembalikan public config Supabase
 * (URL & Anon Key yang aman untuk client) dari Environment Variables Vercel
 * sebagai fallback runtime apabila buildCommand di-override.
 */
module.exports = function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  const url = (
    process.env.VITE_SUPABASE_URL ||
    process.env.REACT_APP_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    ''
  )
    .trim()
    .replace(/\/+$/, '');

  const anonKey = (
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.REACT_APP_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    ''
  ).trim();

  res.status(200).json({
    configured: Boolean(url && anonKey),
    url,
    anonKey
  });
};
