import DOMPurify from "isomorphic-dompurify";

// Whitelist HTML minimal — lihat ARCHITECTURE.md §7
const ALLOWED_TAGS = ["p", "br", "strong", "em", "b", "i", "a", "blockquote", "code", "ul", "ol", "li"];

export function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ["href", "rel", "target"],
    ALLOW_DATA_ATTR: false,
  });
}

// rate limit sederhana: in-memory, per-thread, per-author-email.
// untuk production perlu ganti ke Redis/Upstash, cukup untuk skala tugas kuliah.
type BucketKey = string;
const buckets = new Map<BucketKey, number[]>();

export function checkRateLimit(key: BucketKey, windowMs = 10_000, max = 1): boolean {
  const now = Date.now();
  const arr = buckets.get(key) ?? [];
  const filtered = arr.filter((t) => now - t < windowMs);
  if (filtered.length >= max) {
    buckets.set(key, filtered);
    return false;
  }
  filtered.push(now);
  buckets.set(key, filtered);
  return true;
}

export function clearRateLimit(key: BucketKey) {
  buckets.delete(key);
}