// prisma/seed.ts
// Sesuai DATA-MODEL.md §4: 3 user roles, 5 kategori, 8-10 artikel (>=2 punya BalancedViewpoint),
// 3 thread (2 terhubung artikel, 1 bebas) dengan nested reply >=2 level,
// beberapa Reaction + 1 Report PENDING.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // bersih-bersih dulu (urutan FK-safe)
  await prisma.report.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.reply.deleteMany();
  await prisma.thread.deleteMany();
  await prisma.balancedViewpoint.deleteMany();
  await prisma.articleTag.deleteMany();
  await prisma.article.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // USER
  const editor = await prisma.user.create({
    data: {
      name: "Rani Wibowo",
      email: "editor@anyaman.id",
      role: "EDITOR",
    },
  });
  const contributor = await prisma.user.create({
    data: {
      name: "Bagas Pratama",
      email: "kontributor@anyaman.id",
      role: "CONTRIBUTOR",
    },
  });
  const reader = await prisma.user.create({
    data: {
      name: "Maya Lestari",
      email: "pembaca@anyaman.id",
      role: "READER",
    },
  });
  const reader2 = await prisma.user.create({
    data: {
      name: "Daniel Siahaan",
      email: "daniel@anyaman.id",
      role: "READER",
    },
  });

  // CATEGORY (5 sesuai PRD §6.1)
  const catPolitik = await prisma.category.create({
    data: { name: "Politik", slug: "politik" },
  });
  const catSosial = await prisma.category.create({
    data: { name: "Sosial-Budaya", slug: "sosial-budaya" },
  });
  const catToleransi = await prisma.category.create({
    data: { name: "Toleransi & Kebhinekaan", slug: "toleransi-kebhinekaan" },
  });
  const catFakta = await prisma.category.create({
    data: { name: "Klarifikasi/Cek Fakta", slug: "klarifikasi-cek-fakta" },
  });
  const catOpini = await prisma.category.create({
    data: { name: "Opini", slug: "opini" },
  });

  // TAG
  const tagsData = [
    "Pemilu",
    "Jakarta",
    "Sulawesi",
    "Papua",
    "Kalimantan",
    "Pendidikan",
    "Lingkungan",
    "Media Sosial",
  ];
  const tags = await Promise.all(
    tagsData.map((name) => prisma.tag.create({ data: { name } })),
  );

  // ARTIKEL — 9 artikel published, 2 punya BalancedViewpoint
  const articleSeed: Array<{
    slug: string;
    title: string;
    dek: string;
    body: string;
    category: { id: string };
    author: { id: string };
    tagSlugs: string[];
    viewpoints?: Array<{ label: string; summary: string; sourceUrl?: string }>;
  }> = [
    {
      slug: "gotong-royong-tiga-kampung",
      title: "Gotong-royong warga tiga kampung mengembalikan ruang publik bersama",
      dek: "Di tengah wacana polarisasi yang sering mendominasi liputan, tiga kampung di pesisir Sulawesi memilih jalur berbeda: mereka duduk bersama, memetakan kebutuhan, dan memutuskan siapa yang merawat ruang publik mana.",
      body: `Pesisir Sulawesi Selatan, Mei 2026 — Sejak pagi, tiga kampung — Bontobuddung, Lembang Lohe, dan Tamarunang — mengirim dua orang setiap hari ke balai desa bersama. Bukan untuk rapat besar: mereka memetakan satu per satu ruang publik yang tidak terawat (lapangan, sumur, jalan setapak) dan membagi siapa yang bertanggung jawab atas yang mana.

"Yang penting bukan siapa cepat, tapi siapa paling dekat dan paling sering melewati," kata Hj. St. Aminah, salah satu koordinator. Hasilnya setelah enam minggu: tujuh ruang publik kembali berfungsi, termasuk satu lapangan yang sudah tidak dipakai selama tiga tahun.

Yang menarik dari inisiatif ini bukan hasilnya, melainkan caranya. Tidak ada rapat besar, tidak ada bantuan pemerintah daerah yang diminta lebih dulu, dan tidak ada penentuan siapa "ketua". Keputusan diambil di ruang bersama dengan waktu yang tidak terburu-buru — lambat, tapi konsisten.

Pendamping lokal dari LSM Pantau menyebut pola ini sebagai "musyawarah yang tidak teoretis". Ia membandingkannya dengan pendekatan top-down yang lebih sering muncul dalam program serupa. "Bedanya, kalau top-down putus di atas, ini putus di titik terdekat dengan kebutuhan," katanya.

Pertanyaan yang muncul sekarang: apakah pola ini bisa direplikasi di tempat lain — atau justru kekuatannya ada di skala kecil yang rapat?`,
      category: catToleransi,
      author: editor,
      tagSlugs: ["Sulawesi", "Lingkungan"],
    },
    {
      slug: "toleransi-vs-keadilan",
      title:
        "Mengapa kita perlu istilah yang lebih akurat dari &lsquo;toleransi&rsquo;",
      dek: "Toleransi sering dipuji sebagai nilai kebhinekaan, tapi beberapa akademisi dan pegiat komunitas mulai mempertanyakan: apakah toleransi cukup, atau kita perlu istilah yang mengakui kesetaraan, bukan sekadar kesabaran?",
      body: `Istilah "toleransi" sudah lebih dari dua abad dipakai dalam wacana kebhinekaan Indonesia. Namun dalam diskusi-diskusi terbaru — dari forum akademik hingga obrolan komunitas — muncul pertanyaan: apakah toleransi cukup, atau bahkan tanpa sadar meneguhkan hierarki?

"Toleransi berarti saya menerima yang berbeda selama ia tidak mengganggu saya. Itu permulaan, bukan tujuan," kata Dr. Rina Kusuma, sosiolog dari Universitas Gadjah Mada. Baginya, istilah yang lebih jujur adalah "kesetaraan dalam perbedaan" — yang mengakui bahwa setiap kelompok punya hak yang sama, bukan hanya satu kelompok yang "sabar" menerima yang lain.

Argumen ini bukan tanpa kritik. Beberapa pegiat gereja dan pesantren menganggap istilah toleransi sudah berhasil menjaga perdamaian selama ini, dan mengubah istilah bisa memecah konsensus yang sudah dibangun susah payah.

Perdebatan ini penting bukan untuk memenangkan salah satu istilah, tapi untuk menunjukkan bahwa bahasa memengaruhi cara kita bertindak. Forum diskusi kami akan membuka ruang untuk dua sisi ini — tanpa men-judge siapa yang lebih benar, hanya mempersilakan setiap argumen diletakkan di atas meja.`,
      category: catToleransi,
      author: editor,
      tagSlugs: ["Pendidikan", "Media Sosial"],
      viewpoints: [
        {
          label: "Pihak yang mempertahankan istilah &lsquo;toleransi&rsquo;",
          summary:
            "Toleransi sudah terbukti menjaga perdamaian antar-kelompok di banyak daerah. Mengubah istilah berisiko memecah konsensus yang susah dibangun, dan istilah baru bisa terasa seperti teori yang tidak membumi.",
          sourceUrl: "https://www.example.com/sumber-toleransi",
        },
        {
          label: "Pihak yang mendorong istilah &lsquo;kesetaraan dalam perbedaan&rsquo;",
          summary:
            "Toleransi tanpa kesetaraan masih menempatkan satu kelompok sebagai 'yang sabar' dan yang lain sebagai 'yang harus ditoleransi'. Bahasa yang lebih akurat mendorong relasi yang setara, bukan sekadar rukun.",
          sourceUrl: "https://www.example.com/sumber-kesetaraan",
        },
      ],
    },
    {
      slug: "klarifikasi-uji-coba-aplikasi",
      title: "Klarifikasi: aplikasi &ldquo;Bubrah&rdquo; tidak menyimpan data lokasi pengguna",
      dek: "Beredar klaim di media sosial bahwa aplikasi baru &lsquo;Bubrah&rsquo; menyimpan data lokasi setiap penggunanya. Kami telusuri klaim ini dan menemukan: tidak ada bukti teknis untuk mendukungnya.",
      body: `Klaim: "Aplikasi Bubrah menyimpan setiap pergerakan penggunanya dan menjualnya ke advertiser."

Hasil penelusuran: Klaim ini pertama kali muncul di akun Twitter @infokonten123 pada 8 Juni 2026, tanpa rujukan teknis apa pun. Tim redaksi menghubungi tiga developer yang terlibat dalam proyek Bubrah, dan tidak satu pun yang mengakui adanya fitur pelacakan lokasi semacam itu.

Penjelasan dari pihak Bubble Tech (pengembang): "Aplikasi ini hanya meminta akses kamera dan mikrofon untuk fitur utamanya — penerjemah bahasa isyarat. Tidak ada izin lokasi di manifest Android, dan kami tidak pernah menulis kode yang mengumpulkan koordinat GPS."

Cek fakta ini bukan untuk menyatakan aplikasi Bubrah sempurna — setiap aplikasi punya risiko privasi tersendiri — tapi untuk menunjukkan bahwa klaim spesifik tentang "penyimpanan lokasi" tidak berdasar pada bukti yang bisa diverifikasi. Pembaca yang menemukan klaim serupa disarankan untuk menelusuri: siapa pertama kali mengunggah, apakah ada bukti teknis, dan apakah ada pihak resmi yang dimintai klarifikasi.`,
      category: catFakta,
      author: contributor,
      tagSlugs: ["Media Sosial"],
    },
    {
      slug: "rendah-hak-pilih-pemula",
      title: "Di balik angka partisipasi pemula: mengapa banyak yang memilih tidak memilih?",
      dek: "Angka partisipasi pemilih usia 17-22 tahun turun 8% di Pemilu 2024. Apakah ini soal apatisme, ketidakpercayaan, ataukah ada alasan struktural yang lebih halus?",
      body: `Data resmi KPU menunjukkan partisipasi pemilih usia 17-22 turun dari 81% (2019) menjadi 73% (2024). Wacana publik sering menyederhanakan fenomena ini sebagai "apatisme generasi muda". Pembicaraan dengan 24 pemilih pemula di tiga kota menunjukkan cerita yang lebih berlapis.

"Saya tidak percaya ada kandidat yang benar-benar mewakili saya, jadi saya tidak melihat gunanya datang ke TPS," kata seorang mahasiswi semester 6 di Yogyakarta. Alasan ini bukan apatis — ia mengikuti debat, ia membaca visi-misi — tapi ketidakpercayaan substantif terhadap sistem yang dirasa tidak memberi ruang untuk suaranya.

Ada juga yang menyebutkan alasan prosedural: "Saya harus kerja shift hari itu, dan aturan pindah TPS sangat ribet." Beberapa lainnya menunggu kawan, merasa sendiri di TPS bukan hal yang menarik.

Kabar baiknya: ketika ditanya apakah mereka akan ikut memilih kalau ada kandidat yang mereka rasa benar-benar mewakili, 19 dari 24 menjawab ya. Partisipasi bukan masalah minat — masalah representasi dan akses.`,
      category: catPolitik,
      author: contributor,
      tagSlugs: ["Pemilu", "Jakarta"],
    },
    {
      slug: "cerita-positif-lintas-kampung",
      title: "Festival kecil tiga kampung yang akhirnya jadi acara tahunan",
      dek: "Dimulai dari tukar makanan antar-rt, festival kampung ini sekarang masuk tahun keempat dan menarik pengunjung dari luar kota. Kunci keberhasilannya: tidak ada yang namanya 'penyelenggara utama'.",
      body: `Festival Kampung Bersila dimulai tahun 2023 dengan satu meja kecil di depan rumah Pak Darwis. Saat itu yang terjadi hanya: tetangga dari tiga RT berbeda membawa makanan rumahan dan menukarnya. Tidak ada anggaran, tidak ada spanduk, tidak ada jadwal resmi.

Empat tahun kemudian, festival ini tetap menggunakan prinsip yang sama. Yang berubah: sekarang ada jadwal — tiga hari setiap bulan Agustus — dan pengunjung dari luar kota mulai datang. Pak Darwis menekankan: "Yang kerja bukan saya, ini semua ibu-ibu PKK dan anak-anak muda yang bergantian."

Yang patut dicatat: tidak ada satu pun 'penyelenggara utama'. Tidak ada ketua panitia yang memegang keputusan akhir. Setiap RT mengusulkan satu kegiatan, dan kegiatannya dipilih berdasarkan siapa yang paling siap mengerjakannya — bukan siapa yang paling vokal.

"Ini bukan model untuk direplikasi 1:1," kata seorang peneliti sosial yang mengamati festival ini. "Tapi ini contoh bahwa acara komunitas bisa berkelanjutan tanpa hierarki yang kaku."`,
      category: catSosial,
      author: editor,
      tagSlugs: ["Pendidikan"],
    },
    {
      slug: "kontroversi-penamaan-kawasan",
      title: "Perdebatan penamaan kembali sebuah kawasan di Jakarta: apa yang sebenarnya dipertaruhkan?",
      dek: "Rencana pergantian nama sebuah kawasan menjadi perdebatan publik yang sengit. Melampaui argumen &lsquo;pro&rsquo; dan &lsquo;kontra&rsquo;, ada pertanyaan: siapa yang berhak memberi nama pada ruang publik?",
      body: `Wacana mengganti nama sebuah kawasan di Jakarta Pusat menjadi perdebatan yang merembet ke media sosial, ruang-ruang diskusi, hingga meja legislator daerah. Melampaui debat pro-kontra, pertanyaan yang lebih mendasar adalah: siapa yang seharusnya memutuskan nama sebuah ruang publik?

Sejarawan kota, Dr. Paramitha R., menyebut ada tiga kategori ruang publik dan masing-masing punya legitimasi berbeda: ruang yang dibangun negara, ruang yang tumbuh dari kebiasaan warga, dan ruang yang dinamai untuk memperingati sesuatu. "Nama bukan sekadar label — itu pernyataan tentang siapa yang kita anggap penting," katanya.

Pendukung pergantian nama berargumen bahwa nama lama mengandung bias kolonial yang sebaiknya ditinjau ulang. Penolak berargumen bahwa perubahan nama akan memutus memori kolektif warga yang sudah puluhan tahun hidup di kawasan itu.

Yang jarang diangkat: bagaimana warga sekitar — yang paling terdampak — dilibatkan dalam diskusi. Sampai saat ini, konsultasi publik yang dilakukan baru menyentuh tiga RT dari 27 RT di kawasan tersebut.`,
      category: catPolitik,
      author: editor,
      tagSlugs: ["Jakarta"],
      viewpoints: [
        {
          label: "Pendukung pergantian nama",
          summary:
            "Nama lama mengandung warisan kolonial yang sebaiknya dikritisi. Nama baru harus mencerminkan nilai-nilai yang ingin dijunjung oleh warga saat ini, termasuk menghargai sejarah lokal yang lebih tua dari era kolonial.",
          sourceUrl: "https://www.example.com/sumber-pendukung",
        },
        {
          label: "Penolak perubahan nama",
          summary:
            "Nama yang sudah dipakai puluhan tahun adalah bagian dari memori kolektif warga. Mengganti nama akan menimbulkan biaya adaptasi yang besar dan memutus kaitan emosional dengan tempat tinggal sendiri.",
          sourceUrl: "https://www.example.com/sumber-penolak",
        },
        {
          label: "Suara warga RT (kurang terdengar)",
          summary:
            "Warga RT yang paling terdampak paling sedikit dilibatkan dalam konsultasi. Beberapa di antaranya memiliki pendapat yang tidak persis sama dengan dua kubu di atas — tapi ruang diskusi publik belum memberi mereka mikrofon.",
        },
      ],
    },
    {
      slug: "opini-bukan-mediator-netral",
      title: "Opini: mengapa media tidak seharusnya berpura-pura menjadi &lsquo;mediator netral&rsquo;",
      dek: "Ketika liputan tentang dua kelompok yang berseteru disajikan sebagai 'kami hanya memberitakan kedua sisi', kita kehilangan kemampuan untuk bertanya: siapa yang paling dirugikan oleh framing ini?",
      body: `Ada asumsi yang bertahan lama di ruang redaksi: media yang baik adalah media yang "tidak memihak" — menyajikan dua sisi, lalu membiarkan pembaca memutuskan. Asumsi ini tampak netral, tapi punya konsekuensi yang jarang dibahas.

Ketika dua kelompok yang berseteru punya sumber daya yang tidak setara — akses ke juru bicara, kemampuan memproduksi rilis pers, kedekatan dengan ruang redaksi — maka "menyiakan kedua sisi" sebenarnya bukan berpihak pada netralitas, melainkan berpihak pada yang lebih kuat.

Bukan berarti media harus memilih salah satu sisi. Tapi media bisa — dan seharusnya — memilih pertanyaan mana yang diajukan, siapa yang diwawancarai, dan bagaimana konteks disajikan. Itu semua adalah keputusan editorial yang netralitas semu sering menyamarkannya.

Kalau kita jujur, hampir setiap kalimat dalam artikel adalah pilihan. Pertanyaannya bukan apakah kita berpihak — karena pasti iya — tapi apakah kita sudah jujur tentang pilihan-pilihan itu.`,
      category: catOpini,
      author: contributor,
      tagSlugs: ["Media Sosial"],
    },
    {
      slug: "laporan-kerusakan-lingkungan",
      title: "Laporan khusus: 12 sungai di Kalimantan Timur punya kadar merkuri di atas ambang",
      dek: "Investigasi enam bulan dengan dua laboratorium independen menunjukkan kadar merkuri di 12 sungai di Kalimantan Timur berada di atas ambang batas yang ditetapkan WHO. Berikut peta sebaran dan wawancara warga.",
      body: `Investigasi bersama dua laboratorium independen — Laboratorium Lingkungan ITB dan Lab Forensik Universitas Mulawarman — menunjukkan 12 sungai di Kalimantan Timur memiliki kadar merkuri total di atas 0,006 mg/L, ambang yang ditetapkan WHO untuk air minum. Angka ini belum tentu mencerminkan konsentrasi di ikan atau sedimen, yang biasanya lebih tinggi.

Sungai-sungai yang dimaksud termasuk Sungai Mahakam (segmen tengah dan hilir), Sungai Kutai, dan beberapa anak sungai yang berhulu dekat area pertambangan emas tanpa izin (PETI).

Warga yang diwawancarai — 18 orang dari 5 desa — konsisten menyebut dua hal: perubahan warna air dalam 5 tahun terakhir, dan menurunnya hasil tangkap ikan. "Dulu kami bisa dapat 8 kg ikan gabus dalam satu sore. Sekarang, 1 kg pun sulit," kata seorang nelayan di Segah.

Pemerintah daerah melalui Dinas Lingkungan Hidup menyatakan akan "menelaah lebih lanjut" — pernyataan yang sudah kami dengar tiga kali dalam dua tahun terakhir untuk kasus serupa. Pembaca yang ingin bertindak: salinan laporan lengkap dan metodologi tersedia di pranala ini, dan dapat dipakai untuk audiensi publik.`,
      category: catSosial,
      author: editor,
      tagSlugs: ["Kalimantan", "Lingkungan"],
    },
    {
      slug: "sekolah-ramah-anak",
      title: "Inovasi kecil dari sekolah dasar di Papua yang menurunkan angka putus sekolah",
      dek: "Sebuah SD di pedalaman Papua menurunkan angka putus sekolah dari 22% menjadi 6% dalam tiga tahun. Rahasianya: bukan kurikulum baru, melainkan kehadiran dua orang yang fokus pada kesejahteraan anak.",
      body: `SD Yaboisbanjid, di pedalaman Kabupaten Nabire, sempat memiliki angka putus sekolah 22% — rata-rata untuk daerah serupa. Tahun ajaran 2024/2025, angka itu turun menjadi 6%. Tidak ada tambahan anggaran signifikan. Tidak ada kurikulum baru dari pusat.

Yang berubah: kepala sekolah memutuskan merekrut dua orang — bukan guru, melainkan "pengurus kesejahteraan anak" — yang tugasnya sederhana: memastikan setiap anak makan pagi sebelum kelas, dan menghubungi keluarga dalam 24 jam kalau ada anak yang tidak masuk tiga hari berturut-turut.

"Ini terlihat sepele, tapi banyak anak di sini tidak makan pagi karena orang tuanya sudah ke ladang. Kalau perut kosong, belajar tidak terjadi," kata salah satu pengurus.

Tantangan terbesar program ini: keberlanjutan. Kedua posisi ini dibiayai dari sisa dana BOS dan sumbangan komite sekolah — bukan anggaran resmi. Kalau sekolah lain ingin meniru, mereka harus menemukan mekanisme pendanaan lokal sendiri.`,
      category: catSosial,
      author: contributor,
      tagSlugs: ["Papua", "Pendidikan"],
    },
  ];

  const articles = [];
  for (const a of articleSeed) {
    const created = await prisma.article.create({
      data: {
        slug: a.slug,
        title: a.title,
        dek: a.dek,
        body: a.body,
        status: "PUBLISHED",
        publishedAt: new Date(),
        authorId: a.author.id,
        categoryId: a.category.id,
        tags: {
          create: a.tagSlugs.map((slug) => ({
            tag: { connect: { name: slug } },
          })),
        },
        viewpoints: a.viewpoints
          ? {
              create: a.viewpoints.map((v, idx) => ({
                label: v.label,
                summary: v.summary,
                sourceUrl: v.sourceUrl,
                order: idx,
              })),
            }
          : undefined,
      },
    });
    articles.push(created);
  }

  // THREAD — all articles get a thread + 1 free discussion
  const articleWithThreadIds = new Set<string>();

  const thread1 = await prisma.thread.create({
    data: {
      title: "Diskusi: apakah &lsquo;kesetaraan dalam perbedaan&rsquo; menggantikan toleransi?",
      articleId: articles[1].id, // toleransi-vs-keadilan
    },
  });
  articleWithThreadIds.add(articles[1].id);

  const thread2 = await prisma.thread.create({
    data: {
      title: "Diskusi: siapa yang seharusnya memberi nama ruang publik?",
      articleId: articles[5].id, // kontroversi-penamaan-kawasan
    },
  });
  articleWithThreadIds.add(articles[5].id);

  // Threads for remaining articles (no replies in seed)
  for (const article of articles) {
    if (!articleWithThreadIds.has(article.id)) {
      await prisma.thread.create({
        data: {
          title: `Diskusi: ${article.title}`,
          articleId: article.id,
        },
      });
    }
  }

  const thread3 = await prisma.thread.create({
    data: {
      title: "Diskusi bebas: apa satu perubahan kecil di komunitas Anda yang berdampak besar?",
      articleId: null,
    },
  });

  // REPLIES — nested >=2 level, beberapa dengan sourceUrl
  const r1a = await prisma.reply.create({
    data: {
      threadId: thread1.id,
      authorId: reader.id,
      content:
        "Saya setuju bahwa toleransi saja tidak cukup. Selama saya memposisikan diri sebagai 'yang sabar menerima', saya sebenarnya tetap menempatkan diri saya di atas.",
    },
  });
  const r1b = await prisma.reply.create({
    data: {
      threadId: thread1.id,
      authorId: reader2.id,
      parentId: r1a.id,
      content:
        "Setuju dengan argumen di atas, tapi apakah istilah baru benar-benar menyelesaikan masalah, atau hanya memberi label berbeda pada relasi yang sama? <a href='https://www.example.com/sumber'>Saya rujuk ke studi sosiologi tentang framing bahasa</a>.",
      sourceUrl: "https://www.example.com/sumber-sosiologi",
    },
  });
  const r1c = await prisma.reply.create({
    data: {
      threadId: thread1.id,
      authorId: contributor.id,
      parentId: r1b.id,
      content:
        "Pertanyaan penting: relasi sosial memang tidak berubah karena istilah, tapi cara kita membicarakannya memengaruhi kebijakan. Kalau kita pakai 'kesetaraan', intervensi negara bisa berbeda dari 'toleransi' (yang biasanya tidak masuk anggaran).",
    },
  });
  await prisma.reply.create({
    data: {
      threadId: thread1.id,
      authorId: reader.id,
      parentId: r1c.id,
      content:
        "Saya bukan sosiolog, tapi sebagai warga: istilah baru memberi harapan bahwa kita tidak stuck di pola yang sudah ada. Itu sudah bernilai.",
    },
  });

  const r2a = await prisma.reply.create({
    data: {
      threadId: thread2.id,
      authorId: reader2.id,
      content:
        "Argumen 'memori kolektif' yang sering dipakai untuk menolak perubahan nama terdengar masuk akal, tapi memori kolektif siapa? Warga RT yang tidak dilibatkan jarang terlihat di wacana publik.",
    },
  });
  await prisma.reply.create({
    data: {
      threadId: thread2.id,
      authorId: editor.id,
      parentId: r2a.id,
      content:
        "Saya mencatat tiga dari 27 RT sudah dilibatkan. Itu memang belum cukup, dan artikel mengakui itu. Pertanyaannya: apakah konsultasi yang lebih luas akan menghasilkan jawaban yang berbeda, atau hanya menghasilkan lebih banyak suara untuk salah satu kubu yang sudah ada?",
    },
  });
  await prisma.reply.create({
    data: {
      threadId: thread2.id,
      authorId: reader.id,
      content:
        "Saya tinggal di kawasan yang sedang diperdekatkan namanya. Aspirasi saya: nama yang mencerminkan sejarah lokal, bukan hanya pahlawan nasional. Saya belum pernah diminta pendapat.",
    },
  });

  const r3a = await prisma.reply.create({
    data: {
      threadId: thread3.id,
      authorId: reader.id,
      content:
        "Di RT saya, kami mulai 'jemput anak' setiap pagi — dua orang tua bergantian mengantar anak-anak ke sekolah sambil mengobrol. Efeknya: orang tua jadi lebih kenal satu sama lain, dan kehadiran di sekolah meningkat.",
    },
  });
  await prisma.reply.create({
    data: {
      threadId: thread3.id,
      authorId: contributor.id,
      parentId: r3a.id,
      content:
        "Kecil tapi konsisten. Yang menarik dari pola ini: tidak butuh banyak uang, hanya butuh konsistensi dua orang per minggu.",
    },
  });

  // REACTIONS
  await prisma.reaction.createMany({
    data: [
      { replyId: r1a.id, userId: reader2.id, type: "STRONG_ARGUMENT" },
      { replyId: r1b.id, userId: editor.id, type: "STRONG_ARGUMENT" },
      { replyId: r1c.id, userId: reader.id, type: "OTHER_PERSPECTIVE" },
      { replyId: r2a.id, userId: editor.id, type: "STRONG_ARGUMENT" },
      { replyId: r3a.id, userId: contributor.id, type: "STRONG_ARGUMENT" },
    ],
  });

  // REPORT — 1 pending supaya dashboard moderasi tidak kosong
  await prisma.report.create({
    data: {
      replyId: r1b.id,
      reporterId: reader2.id, // dummy self-report, ditunjukkan untuk demo UI
      reason: "Mengandung klaim tanpa sumber kredibel",
      status: "PENDING",
    },
  });

  // hapus report dummy yang terlalu contrived
  await prisma.report.deleteMany();

  await prisma.report.create({
    data: {
      replyId: r2a.id,
      reporterId: reader.id,
      reason: "Nada komentar terasa menyerang, bukan mengkritik argumen",
      status: "PENDING",
    },
  });

  console.log("Seed selesai:");
  console.log(`  - User: ${await prisma.user.count()}`);
  console.log(`  - Category: ${await prisma.category.count()}`);
  console.log(`  - Tag: ${await prisma.tag.count()}`);
  console.log(`  - Article: ${await prisma.article.count()}`);
  console.log(`  - Thread: ${await prisma.thread.count()}`);
  console.log(`  - Reply: ${await prisma.reply.count()}`);
  console.log(`  - Reaction: ${await prisma.reaction.count()}`);
  console.log(`  - Report: ${await prisma.report.count()}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });