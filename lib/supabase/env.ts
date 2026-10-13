// CROWN_STORAGE=file forces the local data/store.json even when Supabase keys
// are present, so the shop can be tried out (orders, forms, the house book)
// without writing to the live database. `npm run dev:file` sets it.
export function isSupabaseConfigured() {
  if (process.env.CROWN_STORAGE === "file") return false;
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function supabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set.");
  return url;
}

export function supabaseAnonKey() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set.");
  return key;
}
