import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export function formatTanggal(date: Date | null | undefined) {
  if (!date) return "";
  return format(date, "d MMMM yyyy", { locale: localeId });
}

export function formatTanggalPendek(date: Date | null | undefined) {
  if (!date) return "";
  return format(date, "d MMM", { locale: localeId });
}