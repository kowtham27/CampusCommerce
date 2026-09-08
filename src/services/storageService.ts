/**
 * Image storage abstraction for listing photos.
 *
 * No object storage is required to demo the app: if Supabase Storage isn't
 * configured (see instruction.md), photo picks resolve to stable placeholder
 * images instead of failing. Once NEXT_PUBLIC_SUPABASE_URL /
 * NEXT_PUBLIC_SUPABASE_ANON_KEY are set, swap the body of `uploadListingImages`
 * for a real `supabase.storage.from("listing-images").upload(...)` call —
 * callers only depend on the returned string[] of URLs.
 */

export function isStorageConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function uploadListingImages(files: File[], seedHint: string): Promise<string[]> {
  if (files.length === 0) return [];

  if (!isStorageConfigured()) {
    const safeHint = seedHint.replace(/[^a-zA-Z0-9-]+/g, "-").slice(0, 40);
    return files.map((_, i) => `https://picsum.photos/seed/${safeHint}-${i}-${Date.now()}/640/480`);
  }

  // Real upload path once Supabase Storage is configured.
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const urls: string[] = [];
  for (const file of files) {
    const path = `${seedHint}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("listing-images").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}
