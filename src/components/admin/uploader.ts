import type { Media } from "@/lib/cms/types";

export interface UploadRow {
  key: string;
  name: string;
  pct: number;
  status: "uploading" | "ok" | "err";
  error?: string;
}

/**
 * Šalje JEDAN fajl po zahtjevu (XHR, zbog stvarnog progresa).
 * Namjerno po jedan: ako jedan fajl padne, ostali se i dalje pošalju
 * i uploaduju — jedan neuspjeh ne smije srušiti cijeli batch ni stranicu.
 */
export async function uploadOne(
  file: File,
  onProgress: (pct: number) => void
): Promise<{ media?: Media; error?: string }> {
  // Direktan upload u Storage (potpisani URL) — zaobilazi Vercelov limit
  // tijela zahtjeva od ~4.5 MB, pa rade i veliki GIF-ovi/videi.
  const post = async (payload: Record<string, unknown>) => {
    const res = await fetch("/api/admin/media/direct", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        mime: file.type,
        size: file.size,
        ...payload,
      }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data) {
      throw new Error(data?.error || "Server je vratio neočekivan odgovor.");
    }
    return data;
  };

  try {
    const { key, signedUrl } = await post({ action: "sign" });

    await new Promise<void>((resolve, reject) => {
      const fd = new FormData();
      fd.append("cacheControl", "31536000");
      fd.append("", file);
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", signedUrl);
      xhr.setRequestHeader("x-upsert", "false");
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 96));
      };
      xhr.onload = () =>
        xhr.status < 300
          ? resolve()
          : reject(new Error(`Storage je odbio upload (${xhr.status}).`));
      xhr.onerror = () => reject(new Error("Prekinuta veza pri uploadu."));
      xhr.send(fd);
    });

    const { media } = await post({ action: "register", key });
    return { media };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload nije uspio." };
  }
}
