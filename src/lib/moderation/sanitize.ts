import sanitize from "sanitize-html";

// Whitelist HTML minimal — lihat ARCHITECTURE.md §7
const ALLOWED_TAGS = ["p", "br", "strong", "em", "b", "i", "a", "blockquote", "code", "ul", "ol", "li"];
const ALLOWED_ATTR = ["href", "rel", "target"];

export function sanitizeHtml(input: string): string {
  return sanitize(input, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      "*": ALLOWED_ATTR,
    },
    allowProtocolTags: ["http", "https", "mailto"],
    disallowedTagsMode: "discard",
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