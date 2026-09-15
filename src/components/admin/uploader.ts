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
export function uploadOne(
  file: File,
  onProgress: (pct: number) => void
): Promise<{ media?: Media; error?: string }> {
  return new Promise((resolve) => {
    const fd = new FormData();
    fd.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/media");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 96));
    };
    xhr.onload = () => {
      let data: { uploaded?: Media[]; errors?: string[]; error?: string } = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        resolve({ error: "Server je vratio neočekivan odgovor." });
        return;
      }
      if (xhr.status >= 400) {
        resolve({ error: data.error || "Upload nije uspio." });
        return;
      }
      if (data.uploaded?.length) {
        resolve({ media: data.uploaded[0] });
        return;
      }
      resolve({ error: data.errors?.[0] || "Upload nije uspio." });
    };
    xhr.onerror = () => resolve({ error: "Prekinuta veza pri uploadu." });
    xhr.send(fd);
  });
}
