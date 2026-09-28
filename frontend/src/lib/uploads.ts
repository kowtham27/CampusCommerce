/**
 * Uploads listing photos to the Express backend (POST /api/uploads) and
 * returns their public URLs (e.g. "/uploads/<id>.jpg"), in the same order.
 */
export async function uploadListingImages(files: File[]): Promise<string[]> {
  if (files.length === 0) return [];

  const form = new FormData();
  for (const file of files) form.append("photos", file);

  const res = await fetch("/api/uploads", { method: "POST", body: form });
  const data = (await res.json().catch(() => null)) as { urls?: string[]; error?: string } | null;
  if (!res.ok || !data?.urls) {
    throw new Error(data?.error ?? "Couldn't upload your photos. Please try again.");
  }
  return data.urls;
}
