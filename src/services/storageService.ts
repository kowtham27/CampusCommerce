/**
 * Image storage abstraction for listing photos.
 *
 * No object storage is required to demo the app: if Supabase Storage isn't
 * configured (see instruction.md), photo picks resolve to stable placeholder
 * images instead of failing. Once NEXT_PUBLIC_SUPABASE_URL /
 * NEXT_PUBLIC_SUPABASE_ANON_KEY are set, real photos are uploaded to the
 * `listing-images` bucket via the shared anon-key Supabase client.
 */

import { resolveProductImage } from "@/lib/productImages";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export function isStorageConfigured() {
  return isSupabaseConfigured;
}

function safePathSegment(value: string, maxLength: number) {
  return (
    value
      .trim()
      .replace(/[^a-zA-Z0-9-_. ]+/g, "-")
      .replace(/\s+/g, "-")
      .slice(0, maxLength) || "listing"
  );
}

export async function uploadListingImages(files: File[], seedHint: string): Promise<string[]> {
  if (files.length === 0) return [];

  if (!supabase) {
    return files.map(() => resolveProductImage(seedHint));
  }

  const folder = safePathSegment(seedHint, 60);
  const urls: string[] = [];
  for (const [i, file] of files.entries()) {
    const extIndex = file.name.lastIndexOf(".");
    const ext = extIndex >= 0 ? file.name.slice(extIndex) : "";
    const path = `${folder}/${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const { error } = await supabase.storage.from("listing-images").upload(path, file, {
      contentType: file.type || undefined,
      upsert: false,
    });
    if (error) throw error;
    const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}
