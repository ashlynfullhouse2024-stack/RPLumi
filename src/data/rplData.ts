export interface TeacherProfile {
  name: string;
  nip: string;
  teacherBirth: string;
  teacherPhone: string;
  school: string;
  foundationName: string;
  arabicTitle: string;
  accreditation: string;
  nsm: string;
  npsn: string;
  schoolAddress: string;
  level: 'RA' | 'MI' | 'MTs' | 'MA';
  subject: string;
  grade: string;
  city: string;
  years: string;
  period: string;
  topic: string;
  productType: string;
  productLink: string;
  curriculum: string;
  headmaster: string;
  headmasterId: string;
  headmasterBirth: string;
  headmasterPosition: string;
  headmasterPhone: string;
  letterNumber: string;
  letterDate: string;
  experience: string;
}

export interface RplDocumentSpec {
  id: string;
  key: string; // e.g., "RPL01__sk"
  categoryCode: 'RPL01' | 'RPL02' | 'RPL03' | 'RPL04' | 'RPL05';
  title: string;
  description: string;
  promptTask: string;
  hoverSummary: string;
  hoverTip: string;
}

export interface RplCategory {
  code: 'RPL01' | 'RPL02' | 'RPL03' | 'RPL04' | 'RPL05';
  name: string;
  shortDesc: string;
  hoverDetail: string;
  hoverTip: string;
  documents: RplDocumentSpec[];
}

export interface DraftRecord {
  title: string;
  category: 'RPL01' | 'RPL02' | 'RPL03' | 'RPL04' | 'RPL05';
  content: string;
  updatedAt: number;
}

export interface EvidenceItem {
  id: string;
  name: string;
  label: string;
  category: 'RPL01' | 'RPL02' | 'RPL03' | 'RPL04' | 'RPL05';
  type: string;
  size: number;
  addedAt: number;
  data?: string; // Data URL for local export in ZIP
}

export const RPL_PROMPTS: Record<string, string> = {
  sk: `Buat dokumen "Surat Keterangan & Lembar Verifikasi Pembagian Tugas Mengajar" dengan format resmi Kop Surat Madrasah/Sekolah:
1. Kop Surat Lembaga: Nama Yayasan, Nama Madrasah/Sekolah, Status Akreditasi, NSM & NPSN, dan Alamat Lengkap.
2. Judul "SURAT KETERANGAN PEMBAGIAN TUGAS MENGAJAR" dan Nomor Surat.
3. Blok "Yang bertanda tangan di bawah ini:" (Nama Lengkap Kepala Madrasah, NUPTK/NIP, Tempat dan Tanggal Lahir, Jabatan, Tempat Tugas, Alamat Madrasah, No. HP).
4. Blok "Menyatakan dengan sesungguhnya, bahwa:" (Nama Lengkap Guru, NUPTK/NIP, Tempat dan Tanggal Lahir, Mapel Yang Diampu, Tempat Tugas, No. HP).
5. Tabel Rincian Beban Kerja Mengajar Guru (Mata Pelajaran, Kelas/Rombel, Jumlah Jam Tatap Muka/Minggu, Semester & Tahun Pelajaran) serta penutup surat dan blok tanda tangan Kepala Madrasah.`,

  rpp: `Buat dokumen "Modul Ajar / Rencana Pelaksanaan Pembelajaran (RPP)" yang sangat lengkap, diawali dengan Halaman Pengesahan / Surat Keterangan Kepala Madrasah sesuai format resmi Kop Madrasah:
1. Kop Surat Madrasah & Surat Keterangan Pengesahan Perangkat Pembelajaran (mencantumkan identitas Kepala Madrasah, identitas Guru, Judul Modul/RPP, Kelas/Tema, dan Tautan).
2. Informasi Umum: Identitas Modul, Kompetensi Awal, Profil Pelajar Pancasila & Profil Pelajar Rahmatan Lil Alamin (P5-PPRA), Sarana & Prasarana, Target Peserta Didik, dan Model Pembelajaran.
3. Komponen Inti: Capaian Pembelajaran (CP), Tujuan Pembelajaran (TP), Kriteria Ketercapaian Tujuan Pembelajaran (KKTP), Pemahaman Bermakna, dan Pertanyaan Pemantik.
4. Kegiatan Pembelajaran Terperinci: Pendahuluan, Kegiatan Inti (sintaks langkah demi langkah, diferensiasi), dan Penutup.
5. Asesmen Pembelajaran, Remedial & Pengayaan, serta Blok Tanda Tangan Kepala Madrasah dan Guru Mapel.`,

  materi: `Buat dokumen "Surat Keterangan Karya Modul & Bahan / Materi Ajar Lengkap" sesuai format resmi madrasah:
1. Halaman Pertama: SURAT KETERANGAN Kepala Madrasah (dengan Kop Yayasan/Madrasah, NSM, NPSN, Alamat, blok "Yang bertanda tangan di bawah ini" untuk Kepala Madrasah, blok "Menyatakan dengan sesungguhnya, bahwa" untuk Guru, serta keterangan telah membuat karya berupa Judul Materi/Modul, Jenis Produk: Modul, dan Link/Tautan publikasi).
2. Halaman Isi Materi Ajar: Identitas Materi, Petunjuk Belajar, Tujuan & Indikator Capaian, Peta Konsep, Uraian Materi Mendalam beserta Contoh Kontekstual, Rangkuman, Glosarium, dan Latihan Soal.`,

  lkpd: `Buat dokumen "Surat Keterangan & Lembar Kerja Peserta Didik (LKPD) Lengkap" yang siap cetak:
1. Halaman Pengantar: Surat Keterangan Kepala Madrasah (Format Kop Madrasah, identitas Kepala Madrasah & Guru, Judul LKPD, Jenis Produk: LKPD, dan Link/Tautan).
2. Isi LKPD: Identitas LKPD, Tujuan Kegiatan, Petunjuk Pengerjaan, Wacana / Stimulus Kontekstual sesuai topik, Langkah Kerja Aktivitas Kelompok, Tabel Ruang Jawaban Siswa, Pertanyaan Analisis HOTS, Kesimpulan, dan Rubrik Penilaian.`,

  media: `Buat dokumen "Surat Keterangan Karya Alat Peraga / Media Pembelajaran & Panduan Penggunaan":
1. Halaman Pertama: SURAT KETERANGAN Kepala Madrasah dengan format Kop Madrasah resmi (menyatakan bahwa guru benar bertugas di madrasah tersebut dan telah membuat karya inovasi/media pembelajaran berupa Judul Media, Jenis Produk, dan Link/Tautan).
2. Spesifikasi & Panduan Media: Tujuan Penggunaan, Analisis Kebutuhan Siswa, Desain Media, Alat dan Bahan, Langkah Pembuatan, Prosedur Penggunaan di Kelas, dan Evaluasi Media.`,

  instrumen: `Buat dokumen "Surat Keterangan & Instrumen Penilaian / Asesmen Pembelajaran Lengkap":
1. Pengesahan / Surat Keterangan Kepala Madrasah dengan Kop Madrasah resmi.
2. Matriks Kisi-Kisi Soal (Tujuan Pembelajaran, Materi, Indikator Soal, Level Kognitif, Bentuk & Nomor Soal).
3. Instrumen Asesmen Sikap, Naskah Soal Pilihan Ganda & Uraian HOTS lengkap dengan Kunci Jawaban dan Pedoman Penskoran, serta Rubrik Penilaian Keterampilan (Skor 1-4).`,

  sertifikat: `Buat dokumen "Template Sertifikat Kegiatan & Rekapitulasi Pengembangan Diri Guru":
1. Kerangka Sertifikat Kegiatan dengan penanda jelas "TEMPLATE — BUKAN SERTIFIKAT RESMI" (placeholder Nomor, Nama Guru, Peran, Nama Kegiatan, Penyelenggara, Tanggal, Jumlah JP, dan Struktur Materi).
2. Surat Keterangan Kepala Madrasah tentang Keaktifan Pengembangan Diri Guru beserta Tabel Rekapitulasi Sertifikat Pelatihan/Diklat.`,

  profesional: `Buat dokumen "Surat Keterangan & Portofolio Pengembangan Keprofesian Berkelanjutan (RPL03)":
1. Surat Keterangan Kepala Madrasah (Format Kop Madrasah resmi) yang menerangkan keaktifan guru dalam kegiatan KKG/MGMP dan pengembangan keprofesian.
2. Tabel Kegiatan Kolektif Guru (KKG/MGMP/Forum Ilmiah), Tabel Diklat/Bimtek, dan Daftar Karya/Modul Pembelajaran yang telah dibuat beserta Link/Tautannya.`,

  skadmin: `Buat dokumen "Surat Keterangan Pelaksanaan Kegiatan Administrasi & Tugas Tambahan (RPL04)" dengan format Kop Madrasah resmi:
1. Kop Surat Yayasan & Madrasah (Status Akreditasi, NSM, NPSN, Alamat Lengkap).
2. Judul "SURAT KETERANGAN" dan Nomor Surat.
3. Blok "Yang bertanda tangan di bawah ini:" (Data Kepala Madrasah lengkap dengan NUPTK, TTL, Jabatan, Tempat Tugas, Alamat, No. HP).
4. Blok "Menyatakan dengan sesungguhnya, bahwa:" (Data Guru lengkap dengan NUPTK, TTL, Mapel yang Diampu, Tempat Tugas, No. HP).
5. Pernyataan resmi pelaksanaan kegiatan administrasi pembelajaran / tugas tambahan beserta rincian tugas dan tanda tangan Kepala Madrasah.`,

  administrasi: `Buat dokumen "Rekapitulasi & Instrumen Administrasi Pembelajaran Lengkap (RPL04)" yang diawali Surat Keterangan Kepala Madrasah:
1. Surat Keterangan Kepala Madrasah tentang Kelengkapan Administrasi Kelas/Pembelajaran.
2. Checklist Administrasi Guru, Format Program Tahunan (Prota), Program Semester (Promes), Jurnal Harian Pembelajaran, Daftar Hadir Siswa, dan Rekap Nilai.`,

  ide: `Buat dokumen "Surat Keterangan Karya Inovasi & Laporan Bagian 1: Identifikasi Masalah & Ide Inovasi (RPL05)":
1. Halaman Pertama: SURAT KETERANGAN Kepala Madrasah persis sesuai format resmi (Kop Yayasan/Madrasah, NSM, NPSN, Alamat, blok identitas Kepala Madrasah, blok identitas Guru, pernyataan bahwa guru benar telah membuat karya inovasi berupa Judul Karya Inovasi, Jenis Produk: Modul/Media/Karya Inovasi, dan Link/Tautan, ditutup tanda tangan Kepala Madrasah).
2. Isi Laporan Bagian 1: Latar Belakang Kondisi Kelas, Identifikasi Masalah, Analisis Akar Penyebab, Gagasan Solusi Inovasi, Nilai Kebaruan, dan Indikator Keberhasilan.`,

  implementasi: `Buat dokumen "Surat Keterangan Karya Inovasi & Laporan Bagian 2: Rancangan & Implementasi Karya Inovasi (RPL05)":
1. Halaman Pertama: SURAT KETERANGAN Kepala Madrasah (format resmi Kop Madrasah, identitas Kepala Madrasah & Guru, Judul Karya Inovasi, Jenis Produk, dan Link/Tautan publikasi/flipbook/drive).
2. Isi Laporan Bagian 2: Desain Rancangan Karya Inovasi, Tahapan Persiapan, Skenario Implementasi Langkah demi Langkah di Kelas, Peran Guru & Siswa, serta Daftar Dokumentasi Bukti.`,

  evaluasi: `Buat dokumen "Surat Keterangan Karya Inovasi & Laporan Bagian 3: Evaluasi, Refleksi & Dampak Inovasi (RPL05)":
1. Halaman Pertama: SURAT KETERANGAN Kepala Madrasah (format resmi Kop Madrasah, identitas Kepala Madrasah & Guru, Judul Karya Inovasi, Jenis Produk, dan Link/Tautan).
2. Isi Laporan Bagian 3: Instrumen Evaluasi Dampak Inovasi, Perbandingan Kondisi Sebelum & Sesudah Inovasi, Analisis Dampak Positif bagi Siswa & Madrasah, Refleksi Guru, dan Rencana Tindak Lanjut.`,
};

export const RPL_CATEGORIES: RplCategory[] = [
  {
    code: 'RPL01',
    name: 'Kompetensi Pedagogik',
    shortDesc: 'Bukti penugasan mengajar resmi dari kepala madrasah/sekolah atau yayasan.',
    hoverDetail:
      'Kategori RPL01 menilai rekam jejak penugasan mengajar aktif guru berdasarkan SK / Surat Keterangan Pembagian Tugas Mengajar.',
    hoverTip:
      'Siapkan pindaian (scan) SK Pembagian Tugas Mengajar yang bertanda tangan dan berstempel resmi lembaga.',
    documents: [
      {
        id: 'sk',
        key: 'RPL01__sk',
        categoryCode: 'RPL01',
        title: 'SK & Surat Keterangan Tugas Mengajar',
        description: 'Format Kop Madrasah, identitas Kamad & Guru, tabel JTM mengajar',
        promptTask: RPL_PROMPTS.sk,
        hoverSummary:
          'Menyusun Surat Keterangan & tabel verifikasi beban mengajar dengan format resmi Kop Madrasah.',
        hoverTip:
          'Pastikan nama, NUPTK, mapel, dan jumlah jam tatap muka (JTM) sesuai dengan SK asli dari madrasah/sekolah.',
      },
    ],
  },
  {
    code: 'RPL02',
    name: 'Penyusunan Perangkat Pembelajaran',
    shortDesc: 'Kelengkapan modul ajar/RPP, bahan ajar, LKPD, media, dan instrumen asesmen.',
    hoverDetail:
      'Kategori RPL02 mencakup 5 dokumen inti perangkat ajar lengkap dengan Surat Keterangan Pengesahan Kepala Madrasah.',
    hoverTip:
      'Isi kolom "Judul Karya / Topik Materi" di Profil Guru agar seluruh perangkat ajar selaras dalam satu tema.',
    documents: [
      {
        id: 'rpp',
        key: 'RPL02__rpp',
        categoryCode: 'RPL02',
        title: 'RPP / Modul Ajar + Pengesahan',
        description: 'Kop Madrasah, tujuan, langkah pembelajaran, diferensiasi, asesmen',
        promptTask: RPL_PROMPTS.rpp,
        hoverSummary:
          'Menghasilkan Modul Ajar / RPP lengkap diawali lembar pengesahan/keterangan Kepala Madrasah.',
        hoverTip:
          'Periksa kesesuaian Capaian Pembelajaran (CP) dengan regulasi kurikulum terbaru di satuan pendidikan Anda.',
      },
      {
        id: 'materi',
        key: 'RPL02__materi',
        categoryCode: 'RPL02',
        title: 'Materi / Modul Ajar + Surat Keterangan',
        description: 'Surat Keterangan Modul, peta konsep, uraian materi, latihan',
        promptTask: RPL_PROMPTS.materi,
        hoverSummary:
          'Menyusun Surat Keterangan pembuatan Modul Pembelajaran beserta naskah materi ajar lengkap.',
        hoverTip:
          'Cantumkan tautan flipbook / Google Drive modul Anda pada kolom Link/Tautan jika ada.',
      },
      {
        id: 'lkpd',
        key: 'RPL02__lkpd',
        categoryCode: 'RPL02',
        title: 'LKPD (Lembar Kerja Peserta Didik)',
        description: 'Surat Keterangan, stimulus kasus, langkah aktivitas, rubrik',
        promptTask: RPL_PROMPTS.lkpd,
        hoverSummary:
          'Menyusun lembar aktivitas siswa berisi petunjuk kerja, wacana studi kasus, ruang diskusi kelompok, soal analisis HOTS, dan rubrik.',
        hoverTip:
          'Pastikan aktivitas di LKPD nyambung dengan langkah Kegiatan Inti di RPP/Modul Ajar.',
      },
      {
        id: 'media',
        key: 'RPL02__media',
        categoryCode: 'RPL02',
        title: 'Alat Peraga / Media Pembelajaran',
        description: 'Surat Keterangan Karya Media, spesifikasi desain, prosedur pakai',
        promptTask: RPL_PROMPTS.media,
        hoverSummary:
          'Menyusun Surat Keterangan Karya Media Pembelajaran beserta spesifikasi alat/bahan dan panduan pemakaian di kelas.',
        hoverTip:
          'Lampirkan foto media/alat peraga atau tautan video/flipbook pada kolom Link Produk.',
      },
      {
        id: 'instrumen',
        key: 'RPL02__instrumen',
        categoryCode: 'RPL02',
        title: 'Instrumen Penilaian & Rubrik',
        description: 'Kisi-kisi, soal pengetahuan/keterampilan, kunci jawaban, rubrik',
        promptTask: RPL_PROMPTS.instrumen,
        hoverSummary:
          'Menyusun kisi-kisi asesmen, lembar observasi sikap, soal pilihan ganda & uraian HOTS, kunci jawaban, serta rubrik unjuk kerja.',
        hoverTip:
          'Indikator soal pada kisi-kisi harus selaras dengan Tujuan Pembelajaran (TP) pada Modul Ajar.',
      },
    ],
  },
  {
    code: 'RPL03',
    name: 'Kompetensi Profesional',
    shortDesc: 'Rekam jejak pengembangan diri, kegiatan KKG/MGMP, pelatihan, dan publikasi.',
    hoverDetail:
      'Kategori RPL03 mendokumentasikan pengembangan keprofesian berkelanjutan seperti diklat, workshop, KKG/MGMP, dan karya ilmiah.',
    hoverTip:
      'Kumpulkan sertifikat pelatihan/diklat yang mencantumkan jumlah Jam Pelajaran (JP) secara jelas.',
    documents: [
      {
        id: 'sertifikat',
        key: 'RPL03__sertifikat',
        categoryCode: 'RPL03',
        title: 'Template Sertifikat & Rekap JP',
        description: 'Template sertifikat kegiatan nyata & tabel rekapitulasi pelatihan',
        promptTask: RPL_PROMPTS.sertifikat,
        hoverSummary:
          'Menyediakan tabel rekapitulasi jam pelatihan (JP) beserta kerangka draf sertifikat untuk dokumentasi kegiatan nyata.',
        hoverTip:
          'Gunakan tabel rekapitulasi ini sebagai daftar pengantar saat mengunggah bundel sertifikat asli.',
      },
      {
        id: 'profesional',
        key: 'RPL03__profesional',
        categoryCode: 'RPL03',
        title: 'Portofolio Pengembangan Profesional',
        description: 'Surat Keterangan & rekap KKG/MGMP, seminar, diklat, karya profesi',
        promptTask: RPL_PROMPTS.profesional,
        hoverSummary:
          'Menyusun Surat Keterangan Kepala Madrasah & portofolio partisipasi KKG/MGMP, diklat kurikulum, dan karya modul yang pernah dibuat guru.',
        hoverTip:
          'Tuliskan pengalaman aktif di KKG/MGMP pada kolom Pengalaman di Profil Guru agar otomatis terangkum.',
      },
    ],
  },
  {
    code: 'RPL04',
    name: 'Administrasi Pembelajaran',
    shortDesc: 'Pengelolaan administrasi kelas, wali kelas, ekstrakurikuler, atau laboratorium.',
    hoverDetail:
      'Kategori RPL04 membuktikan ketertiban administrasi pembelajaran dan pelaksanaan tugas tambahan di madrasah/sekolah.',
    hoverTip:
      'Sertakan SK Wali Kelas, SK Pembina Ekstrakurikuler, atau Surat Keterangan Kepala Madrasah.',
    documents: [
      {
        id: 'skadmin',
        key: 'RPL04__skadmin',
        categoryCode: 'RPL04',
        title: 'SK & Surat Keterangan Administrasi',
        description: 'Surat Keterangan Kop Madrasah untuk tugas tambahan / administrasi',
        promptTask: RPL_PROMPTS.skadmin,
        hoverSummary:
          'Menyusun Surat Keterangan Pelaksanaan Kegiatan Administrasi dengan Kop Madrasah resmi beserta rincian tugas tambahan guru.',
        hoverTip:
          'Sesuaikan Nomor Surat dan Tanggal Surat dengan buku agenda surat keluar madrasah.',
      },
      {
        id: 'administrasi',
        key: 'RPL04__administrasi',
        categoryCode: 'RPL04',
        title: 'Rekap Administrasi Pembelajaran',
        description: 'Format Prota, Promes, jurnal mengajar, presensi, dan buku nilai',
        promptTask: RPL_PROMPTS.administrasi,
        hoverSummary:
          'Menyusun format Prota, Promes, Jurnal Agenda Harian Guru, Daftar Hadir Siswa, dan Rekap Nilai dalam satu dokumen siap pakai.',
        hoverTip:
          'Sangat berguna untuk melengkapi lampiran bukti administrasi kelas semester berjalan.',
      },
    ],
  },
  {
    code: 'RPL05',
    name: 'Inovasi Pembelajaran',
    shortDesc: 'Surat Keterangan Karya Inovasi (Format Kop Madrasah) & laporan inovasi lengkap.',
    hoverDetail:
      'Kategori RPL05 mendokumentasikan karya inovasi pembelajaran (Modul/Media/E-Book) lengkap dengan Surat Keterangan Kepala Madrasah.',
    hoverTip:
      'Format Surat Keterangan Kepala Madrasah pada RPL05 mencakup Kop Yayasan/Madrasah, NSM, NPSN, Judul, Jenis Produk, dan Link/Tautan.',
    documents: [
      {
        id: 'ide',
        key: 'RPL05__ide',
        categoryCode: 'RPL05',
        title: 'Surat Keterangan & Ide Karya Inovasi',
        description: 'Surat Keterangan Karya Inovasi (Kop Madrasah) + Analisis Masalah & Ide',
        promptTask: RPL_PROMPTS.ide,
        hoverSummary:
          'Menyusun Surat Keterangan Karya Inovasi resmi dari Kepala Madrasah (dengan Judul, Jenis Produk, dan Link/Tautan) beserta Bab 1 Identifikasi Masalah.',
        hoverTip:
          'Gunakan tab "Surat Resmi & Ekspor" untuk mengunduh khusus halaman Surat Keterangan ber-Kop Madrasah.',
      },
      {
        id: 'implementasi',
        key: 'RPL05__implementasi',
        categoryCode: 'RPL05',
        title: 'Rancangan & Implementasi Inovasi',
        description: 'Surat Keterangan Karya Inovasi + Desain & Skenario Penerapan',
        promptTask: RPL_PROMPTS.implementasi,
        hoverSummary:
          'Menyusun Surat Keterangan Karya Inovasi beserta Bab 2 Rancangan Desain, Tahapan Implementasi, dan Dokumentasi.',
        hoverTip:
          'Pastikan Link/Tautan produk inovasi dapat diakses publik oleh asesor.',
      },
      {
        id: 'evaluasi',
        key: 'RPL05__evaluasi',
        categoryCode: 'RPL05',
        title: 'Evaluasi, Refleksi & Dampak Inovasi',
        description: 'Surat Keterangan Karya Inovasi + Evaluasi Dampak & Tindak Lanjut',
        promptTask: RPL_PROMPTS.evaluasi,
        hoverSummary:
          'Menyusun Surat Keterangan Karya Inovasi beserta Bab 3 Evaluasi Dampak, Refleksi Guru, dan Rencana Tindak Lanjut.',
        hoverTip:
          'Pastikan bagian refleksi dan tindak lanjut selaras dengan karya modul/inovasi yang dibuat.',
      },
    ],
  },
];

export const ALL_DOCUMENTS: RplDocumentSpec[] = RPL_CATEGORIES.flatMap((c) => c.documents);

export const EMPTY_PROFILE: TeacherProfile = {
  name: '',
  nip: '',
  teacherBirth: '',
  teacherPhone: '',
  school: '',
  foundationName: '',
  arabicTitle: '',
  accreditation: 'TERAKREDITASI "A"',
  nsm: '',
  npsn: '',
  schoolAddress: '',
  level: 'MI',
  subject: '',
  grade: '',
  city: '',
  years: '',
  period: '2025/2026 - Genap',
  topic: '',
  productType: 'Modul',
  productLink: '',
  curriculum: 'Kurikulum Merdeka & KMA 450/2024',
  headmaster: '',
  headmasterId: '',
  headmasterBirth: '',
  headmasterPosition: 'Kepala Madrasah',
  headmasterPhone: '',
  letterNumber: '012 / S.Ket / MI-NAH / III / 2026',
  letterDate: '',
  experience: '',
};

/**
 * Fictional sample profile with dummy school name, dummy address, and dummy people
 */
export const SAMPLE_PROFILE: TeacherProfile = {
  name: 'AHMAD RASYID, S.Pd.',
  nip: '9876543210987654',
  teacherBirth: 'Lembah Asri, 22 Agustus 1992',
  teacherPhone: '085700002222',
  school: 'MI. NURUL AZHAR HARAPAN',
  foundationName: 'YAYASAN PENDIDIKAN ISLAM CAHAYA BUNGA NUSANTARA',
  arabicTitle: 'الْمَدْرَسَةُ الْإِبْتِدَائِيَّةُ نُوْرُ الْأَزْهَارِ',
  accreditation: 'TERAKREDITASI "A"',
  nsm: '111235009988',
  npsn: '60799887',
  schoolAddress:
    'Jl. Melati Indah No. 45 RT. 002 / RW. 005 Kel. Sukamaju, Kec. Lembah Asri, Kota Bunga Raya 12345',
  level: 'MI',
  subject: 'Guru Kelas',
  grade: 'Kelas 5',
  city: 'Kota Bunga Raya',
  years: '6 tahun',
  period: '2025/2026 - Genap',
  topic: 'Modul Pembelajaran Kelas 5 Tema Ekosistem dan Pelestarian Lingkungan',
  productType: 'Modul',
  productLink: 'https://contoh-portofolio-guru.id/modul-ekosistem',
  curriculum: 'Kurikulum Merdeka & KMA 450/2024',
  headmaster: 'Hj. SITI NURHALIZA, M.Pd.I.',
  headmasterId: '1234567890123456',
  headmasterBirth: 'Kota Bunga Raya, 10 April 1975',
  headmasterPosition: 'Kepala Madrasah',
  headmasterPhone: '081200001111',
  letterNumber: '012 / S.Ket / MI-NAH / III / 2026',
  letterDate: 'Kota Bunga Raya, 15 Maret 2026',
  experience:
    'Mengajar sebagai Guru Kelas 5 di MI Nurul Azhar Harapan, Kota Bunga Raya. Membuat karya inovasi berupa Modul Pembelajaran Digital Kelas 5 Tema Ekosistem dan Pelestarian Lingkungan, aktif dalam kegiatan KKG MI, serta menyusun perangkat pembelajaran terpadu.',
};
