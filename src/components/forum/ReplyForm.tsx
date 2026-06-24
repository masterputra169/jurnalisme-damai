"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea, Input } from "@/components/ui/Input";
import { createReply, flagReply } from "@/actions/forum";

interface ReplyFormProps {
  threadId: string;
  parentId?: string | null;
  defaultEmail?: string;
  onSuccess?: () => void;
  compact?: boolean;
}

export function ReplyForm({
  threadId,
  parentId = null,
  defaultEmail = "",
  onSuccess,
  compact = false,
}: ReplyFormProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [email, setEmail] = useState(defaultEmail);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setWarning(null);

    startTransition(async () => {
      const result = await createReply({
        threadId,
        parentId: parentId ?? undefined,
        content,
        sourceUrl: sourceUrl || undefined,
        authorEmail: email,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (result.warning) setWarning(result.warning);
      setContent("");
      setSourceUrl("");
      onSuccess?.();
      router.refresh();
    });
  };

  const isEmailSet = email.length > 0;

  return (
    <>
      {!isEmailSet && (
        <div className="border border-[var(--color-line)] p-4 text-sm">
          <p className="font-body text-[var(--color-ink)]/85">
            Untuk membalas, masukkan email akun Anda (sesuai yang didaftarkan
            saat seed). Untuk demo:{" "}
            <code className="font-mono text-xs">pembaca@anyaman.id</code> atau{" "}
            <code className="font-mono text-xs">daniel@anyaman.id</code>.
          </p>
          <Input
            label="Email Anda"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@contoh.id"
            className="mt-3 max-w-md"
          />
        </div>
      )}
      {isEmailSet && (
        <form onSubmit={handleSubmit} className={`flex flex-col gap-3 ${compact ? "mt-3" : ""}`}>
          <Textarea
            label={parentId ? "Balas komentar ini" : "Tulis balasan"}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Sampaikan argumen Anda. Tanpa dehumanisasi."
            rows={compact ? 3 : 5}
            error={error ?? undefined}
          />
          <Input
            label="Sumber (opsional, tapi disarankan untuk klaim faktual)"
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://..."
          />
          {warning && (
            <p className="text-sm text-[var(--color-kunyit)]">{warning}</p>
          )}
          <div>
            <Button type="submit" disabled={pending}>
              {pending ? "Mengirim..." : parentId ? "Kirim balasan" : "Kirim komentar"}
            </Button>
          </div>
        </form>
      )}
    </>
  );
}

interface FlagButtonProps {
  replyId: string;
  defaultEmail?: string;
}

export function FlagButton({ replyId, defaultEmail = "" }: FlagButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [email, setEmail] = useState(defaultEmail);
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    startTransition(async () => {
      const result = await flagReply({ replyId, reason, reporterEmail: email });
      if (!result.ok) {
        setErrorMsg(result.error);
        setStatus("err");
        return;
      }
      setStatus("ok");
      setOpen(false);
      setReason("");
      router.refresh();
    });
  };

  return (
    <div className="inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-ink)]/60 hover:text-[var(--color-waspada)] transition-colors"
      >
        · Laporkan
      </button>
      {open && (
        <form
          onSubmit={handleSubmit}
          className="mt-2 p-3 border border-[var(--color-line)] flex flex-col gap-2 max-w-md"
        >
          {!email && (
            <Input
              label="Email Anda"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@contoh.id"
            />
          )}
          <Textarea
            label="Alasan pelaporan"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="Mis. menyerang identitas, klaim tanpa sumber, dll."
          />
          {errorMsg && <p className="text-xs text-[var(--color-waspada)]">{errorMsg}</p>}
          <div className="flex gap-2">
            <Button type="submit" variant="danger" disabled={pending}>
              {pending ? "Mengirim..." : "Kirim laporan"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Batal
            </Button>
          </div>
        </form>
      )}
      {status === "ok" && (
        <span className="ml-3 font-mono text-[11px] text-[var(--color-giri)]">
          Laporan terkirim. Editor akan meninjaunya.
        </span>
      )}
    </div>
  );
}