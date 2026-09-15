// Slug iz našeg jezika: čćžšđ -> ccezsd, razmaci -> crtice.
const MAP: Record<string, string> = {
  č: "c", ć: "c", ž: "z", š: "s", đ: "d",
  Č: "c", Ć: "c", Ž: "z", Š: "s", Đ: "d",
};

export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[čćžšđČĆŽŠĐ]/g, (ch) => MAP[ch] ?? ch)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Vrati slug koji sigurno nije zauzet (dodaje -2, -3 ...). */
export function uniqueSlug(base: string, taken: string[]): string {
  const clean = slugify(base) || "proizvod";
  if (!taken.includes(clean)) return clean;
  let i = 2;
  while (taken.includes(`${clean}-${i}`)) i++;
  return `${clean}-${i}`;
}
