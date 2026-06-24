import { z } from "zod";

// Validasi sesuai CONTENT-STRATEGY.md §3: klaim numerik/statistik tanpa sumber -> warning (tidak blocking keras).
// Boleh: kritik, ketidaksetujuan, opini minoritas.
// Tidak boleh di filter otomatis: klaim tanpa sumber untuk fakta numerik — warning saja.
export const CreateReplySchema = z.object({
  threadId: z.string().min(1),
  parentId: z.string().min(1).optional().nullable(),
  content: z
    .string()
    .min(2, "Komentar minimal 2 karakter")
    .max(5000, "Komentar maksimal 5000 karakter"),
  sourceUrl: z
    .string()
    .url("Sumber harus URL valid (https://...)")
    .optional()
    .or(z.literal("")),
  authorEmail: z.string().email("Email tidak valid").optional().or(z.literal("")),
});

export type CreateReplyInput = z.infer<typeof CreateReplySchema>;

const FAKTUAL_PATTERN =
  /\b\d{2,}\s*(%|persen|orang|jiwa|rb|ribu|jt|juta|triliun|triliun|kasus|ton|hektare|ha|km|kg|rupiah)\b/i;

export function needsFactSource(content: string): boolean {
  return FAKTUAL_PATTERN.test(content);
}

export const FlagReplySchema = z.object({
  replyId: z.string().min(1),
  reason: z.string().min(5, "Alasan minimal 5 karakter").max(500),
  reporterEmail: z.string().email().optional().or(z.literal("")),
});

export type FlagReplyInput = z.infer<typeof FlagReplySchema>;