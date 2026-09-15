import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Supabase Storage za uploade. Prije se pisalo u public/uploads, ali na
// Vercelu je disk efemeran — fajlovi bi nestali na prvi deploy.
//
// VAŽNO: koristi se SERVICE ROLE ključ i samo na serveru. Nikad
// NEXT_PUBLIC_*, da ključ ne završi u browseru.
export const BUCKET = process.env.SUPABASE_BUCKET || "media";

const URL_ENV = process.env.SUPABASE_URL ?? "";
const KEY_ENV = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

let _client: SupabaseClient | null = null;

function client(): SupabaseClient {
  if (_client) return _client;
  if (!URL_ENV || !KEY_ENV) {
    throw new Error(
      "SUPABASE_URL i SUPABASE_SERVICE_ROLE_KEY nisu postavljeni u .env.local."
    );
  }
  _client = createClient(URL_ENV, KEY_ENV, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

/** Javni URL fajla u bucketu — ovo se upisuje u bazu i renderuje u <img>. */
export function publicUrl(key: string): string {
  return `${URL_ENV.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET}/${key}`;
}

/** Prefiks svih naših storage URL-ova — koristi ga sanitize.mediaUrl(). */
export function publicUrlPrefix(): string {
  if (!URL_ENV) return "";
  return `${URL_ENV.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET}/`;
}

export async function uploadToStorage(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<{ url: string; key: string }> {
  const { error } = await client()
    .storage.from(BUCKET)
    .upload(key, body, { contentType, upsert: false, cacheControl: "31536000" });
  if (error) throw new Error(error.message);
  return { url: publicUrl(key), key };
}

export async function removeFromStorage(key: string): Promise<void> {
  if (!key) return;
  await client().storage.from(BUCKET).remove([key]);
}
