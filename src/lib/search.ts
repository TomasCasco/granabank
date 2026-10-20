/** Lowercase and strip accents so "José" and "jose" compare equal. */
export function toSearchKey(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}
