import type { Metadata } from "next";
import Link from "next/link";
import { WeaveDivider } from "@/components/weave/WeaveDivider";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Tentang Proyek & Metodologi",
  description:
    "Penjelasan pendekatan jurnalisme damai, pemetaan nilai Pancasila ke fitur produk, dan panduan komunitas forum.",
};

export default function TentangPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center gap-3 mb-3">
        <Badge tone="kunyit">Metodologi</Badge>
      </div>
      <h1 className="font-display text-[44px] leading-[1.05] tracking-tight mb-6">
        Tentang Proyek Ini
      </h1>

      <p className="font-body text-lg leading-relaxed text-[var(--color-ink)]/90 mb-10 max-w-[68ch]">
        Anyaman adalah produk digital yang dibuat untuk mata kuliah Pancasila.
        Bukan esai — melainkan sebuah produk yang menerjemahkan nilai-nilai
        Pancasila ke dalam keputusan teknis dan desain. Halaman ini menjelaskan
        tiga hal: kenapa jurnalisme damai dipilih, bagaimana nilai Pancasila
        tercermin di fitur, dan bagaimana forum dirancang untuk tetap kritis
        tanpa toksik.
      </p>

      <div className="max-w-[200px] mb-12">
        <WeaveDivider variant="crossed" />
      </div>

      <section className="space-y-10">
        <article>
          <h2 className="font-display text-[26px] leading-tight mb-3">
            1. Apa itu jurnalisme damai
          </h2>
          <p className="font-body leading-relaxed text-[var(--color-ink)]/90">
            Jurnalisme damai adalah pendekatan peliputan yang secara sadar
            memilih framing yang tidak memperbesar konflik. Dipopulerkan oleh
            Johan Galtung dan dikembangkan Jake Lynch, pendekatannya
            berangkat dari satu pengamatan: media punya pilihan framing, dan
            pilihan itu punya konsekuensi nyata terhadap bagaimana masyarakat
            memahami (dan merespons) konflik.
          </p>
          <p className="font-body leading-relaxed text-[var(--color-ink)]/90 mt-3">
            Bukan berarti media harus &ldquo;positif terus&rdquo; atau
            menyensor masalah. Ini soal <em>bagaimana</em> masalah diliput.
          </p>

          <h3 className="font-display text-[18px] mt-6 mb-2">
            Empat pergeseran framing yang dipakai di redaksi ini
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-[var(--color-line)]">
              <thead className="bg-[var(--color-paper)] border-b border-[var(--color-line)]">
                <tr className="font-mono text-[11px] uppercase tracking-wider text-left">
                  <th className="px-3 py-2">Konflik</th>
                  <th className="px-3 py-2">Damai</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--color-line)]">
                  <td className="px-3 py-2 font-body">
                    Fokus ke 2 pihak berseteru
                  </td>
                  <td className="px-3 py-2 font-body">
                    Fokus ke banyak pihak &amp; kepentingan yang terlibat
                  </td>
                </tr>
                <tr className="border-b border-[var(--color-line)]">
                  <td className="px-3 py-2 font-body">Liputan reaktif</td>
                  <td className="px-3 py-2 font-body">
                    Liputan proaktif akar masalah &amp; inisiatif penyelesaian
                  </td>
                </tr>
                <tr className="border-b border-[var(--color-line)]">
                  <td className="px-3 py-2 font-body">
                    Bahasa dramatis (&ldquo;serangan&rdquo;, &ldquo;perang&rdquo;)
                  </td>
                  <td className="px-3 py-2 font-body">
                    Bahasa presisi, tidak menghasut
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-body">
                    Sumber didominasi elite
                  </td>
                  <td className="px-3 py-2 font-body">
                    Melibatkan suara warga biasa yang terdampak
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="font-body text-sm text-[var(--color-ink)]/75 mt-3">
            Penerapan konkret di portal ini: kotak &ldquo;Sudut Pandang
            Berimbang&rdquo; wajib memuat ≥2 sudut pandang untuk artikel
            kontroversial, kategori &ldquo;Toleransi &amp; Kebhinekaan&rdquo;
            punya liputan rutin, dan setiap artikel kategori sensitif wajib
            punya bagian Konteks.
          </p>
        </article>

        <article id="pancasila">
          <h2 className="font-display text-[26px] leading-tight mb-3">
            2. Pemetaan nilai Pancasila → fitur
          </h2>
          <p className="font-body leading-relaxed text-[var(--color-ink)]/90 mb-4">
            Setiap butir Pancasila diterjemahkan ke keputusan produk yang
            konkret. Bukan slogan.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-[var(--color-line)]">
              <thead className="bg-[var(--color-paper)] border-b border-[var(--color-line)]">
                <tr className="font-mono text-[11px] uppercase tracking-wider text-left">
                  <th className="px-3 py-2">Nilai</th>
                  <th className="px-3 py-2">Penerapan di produk</th>
                </tr>
              </thead>
              <tbody className="align-top">
                <tr className="border-b border-[var(--color-line)]">
                  <td className="px-3 py-3 font-display font-semibold">
                    Ketuhanan Yang Maha Esa
                  </td>
                  <td className="px-3 py-3 font-body">
                    Kebijakan konten melarang penghinaan simbol/praktik
                    keagamaan. Kategori &ldquo;Toleransi &amp;
                    Kebhinekaan&rdquo; jadi liputan rutin, bukan hanya saat
                    insiden.
                  </td>
                </tr>
                <tr className="border-b border-[var(--color-line)]">
                  <td className="px-3 py-3 font-display font-semibold">
                    Kemanusiaan yang Adil dan Beradab
                  </td>
                  <td className="px-3 py-3 font-body">
                    Panduan komunitas melarang dehumanisasi pihak lain. Bahasa
                    UI menghormati pengguna bahkan saat menolak konten (lihat{" "}
                    <Link
                      href="#panduan-forum"
                      className="text-[var(--color-tarum)] underline-offset-2 hover:underline"
                    >
                      Panduan Forum
                    </Link>
                    ).
                  </td>
                </tr>
                <tr className="border-b border-[var(--color-line)]">
                  <td className="px-3 py-3 font-display font-semibold">
                    Persatuan Indonesia
                  </td>
                  <td className="px-3 py-3 font-body">
                    Fitur &ldquo;Sudut Pandang Berimbang&rdquo; di setiap
                    artikel kontroversial — ringkasan argumen dari ≥2 sisi
                    sebelum komentar dibuka. Tag wilayah/kelompok dirancang
                    untuk menghubungkan, bukan mengkotak-kotakkan.
                  </td>
                </tr>
                <tr className="border-b border-[var(--color-line)]">
                  <td className="px-3 py-3 font-display font-semibold">
                    Kerakyatan / Musyawarah
                  </td>
                  <td className="px-3 py-3 font-body">
                    Reaksi forum berbasis kualitas argumen
                    (&ldquo;Argumen Kuat&rdquo;, &ldquo;Butuh Sumber&rdquo;,
                    &ldquo;Bantu Lihat Sisi Lain&rdquo;), bukan like/dislike
                    populer. Moderasi gabungan voting komunitas + keputusan
                    editor, bukan otoritas tunggal.
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-3 font-display font-semibold">
                    Keadilan Sosial
                  </td>
                  <td className="px-3 py-3 font-body">
                    Aksesibilitas penuh (WCAG AA, fokus keyboard, kontras
                    warna, semantic HTML). Performa dijaga agar bisa diakses
                    di koneksi lambat / perangkat low-end — Lighthouse ditarget
                    ≥90 di empat kategori (lihat{" "}
                    <Link
                      href="/tentang#lighthouse"
                      className="text-[var(--color-tarum)] underline-offset-2 hover:underline"
                    >
                      bagian performa
                    </Link>
                    ).
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <article id="panduan-forum">
          <h2 className="font-display text-[26px] leading-tight mb-3">
            3. Panduan komunitas forum
          </h2>
          <p className="font-body leading-relaxed text-[var(--color-ink)]/90">
            Forum di sini didesain untuk argumen yang <strong>tajam dan
            kritis</strong>, bukan adem-adem semua. Yang dilarang bukan
            ketajaman — yang dilarang adalah dehumanisasi.
          </p>

          <h3 className="font-display text-[18px] mt-6 mb-2">Boleh</h3>
          <ul className="font-body list-disc pl-6 space-y-1 text-[var(--color-ink)]/90">
            <li>Mengkritik keras sebuah kebijakan, institusi, atau argumen.</li>
            <li>Tidak setuju secara terbuka dan eksplisit dengan pengguna lain.</li>
            <li>
              Menyampaikan opini minoritas/kontroversial selama disertai
              penalaran.
            </li>
          </ul>

          <h3 className="font-display text-[18px] mt-6 mb-2">Tidak boleh</h3>
          <ul className="font-body list-disc pl-6 space-y-1 text-[var(--color-ink)]/90">
            <li>
              Menyerang identitas pribadi lawan diskusi (suku, agama, gender)
              sebagai pengganti argumen.
            </li>
            <li>
              Klaim faktual tanpa sumber yang bisa ditelusuri — sistem akan
              memberi peringatan saat Anda menulis klaim numerik tanpa
              menyertakan tautan sumber.
            </li>
            <li>
              Brigading — mengajak pihak luar menyerbu satu thread/satu user.
            </li>
            <li>
              Generalisasi merendahkan terhadap kelompok (&ldquo;orang [X]
              memang selalu&hellip;&rdquo;).
            </li>
          </ul>

          <h3 className="font-display text-[18px] mt-6 mb-2">
            Mekanisme yang menopang prinsip ini
          </h3>
          <ul className="font-body list-disc pl-6 space-y-1 text-[var(--color-ink)]/90">
            <li>
              <strong>Tiga jenis reaksi</strong> (bukan like/dislike biner):
              &ldquo;Argumen Kuat&rdquo;, &ldquo;Butuh Sumber&rdquo;,
              &ldquo;Bantu Lihat Sisi Lain&rdquo;.
            </li>
            <li>
              <strong>Rate limit halus</strong> di thread aktif: 1 balasan per
              10 detik per akun. Bukan untuk membatasi suara — untuk memberi
              jeda berpikir saat topik panas.
            </li>
            <li>
              <strong>SOP moderasi</strong>: setiap laporan ditinjau editor,
              keputusan tercatat (DISMISSED atau ACTIONED), tidak ada hard
              delete. Pelanggaran berulang bisa menyebabkan reply disembunyikan
              via <code className="font-mono text-sm">isHidden</code>.
            </li>
          </ul>
        </article>

        <article id="lighthouse">
          <h2 className="font-display text-[26px] leading-tight mb-3">
            4. Bukti performa &amp; aksesibilitas
          </h2>
          <p className="font-body leading-relaxed text-[var(--color-ink)]/90 mb-3">
            Target kelulusan untuk tugas ini: skor Lighthouse ≥90 di keempat
            kategori (Performance, Accessibility, Best Practices, SEO) pada
            halaman beranda, halaman artikel, dan halaman thread forum.
          </p>
          <p className="font-body leading-relaxed text-[var(--color-ink)]/90">
            Skor Lighthouse aktual dan cara verifikasi tercatat di README
            repository. Angka konkret akan ditambahkan setelah deployment
            production.
          </p>
        </article>
      </section>
    </main>
  );
}