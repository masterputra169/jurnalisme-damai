"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      id: metric.id,
      label: metric.label,
      rating: metric.rating,
      navigationType: metric.navigationType,
    });

    // gunakan sendBeacon bila tersedia agar tidak memblokir unload
    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      navigator.sendBeacon("/api/vitals", body);
    } else {
      fetch("/api/vitals", {
        method: "POST",
        body,
        keepalive: true,
      }).catch(() => {
        // swallow — telemetry tidak boleh mengganggu UX
      });
    }
  });

  return null;
}