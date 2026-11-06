import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

const ALLOWED_MODELS = new Set([
  'gemini-3.8-flash',
  'gemini-2.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
]);

function resolveModel(requested?: string): string {
  if (requested && ALLOWED_MODELS.has(requested)) {
    return requested;
  }
  return 'gemini-3.8-flash';
}

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY belum tersedia di server. Silakan periksa panel Settings > Secrets di AI Studio.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

app.post('/api/gemini/generate', async (req, res) => {
  try {
    const {
      categoryCode,
      categoryName,
      docTitle,
      promptTask,
      profile,
      evidenceList,
      extraInstructions,
      model,
    } = req.body;

    if (!categoryCode || !docTitle || !promptTask || !profile) {
      res.status(400).json({ error: 'Parameter dokumen atau profil guru belum lengkap.' });
      return;
    }

    const ai = getAiClient();
    const targetModel = resolveModel(model);

    const prompt = `Susun secara lengkap, sistematis, dan siap pakai draf dokumen RPL berikut untuk portofolio PPG Dalam Jabatan (Daljab) dengan mengacu pada format resmi Kop Madrasah/Sekolah dan Surat Keterangan Kepala Madrasah:
- Kode & Kategori RPL: ${categoryCode} — ${categoryName}
- Judul Dokumen: ${docTitle}
- Yayasan / Penyelenggara: ${profile.foundationName || 'Yayasan Pendidikan Islam / Kementerian Agama'}
- Nama Madrasah / Sekolah: ${profile.school || '-'} (Status: ${profile.accreditation || 'Terakreditasi'}, NSM: ${profile.nsm || '-'}, NPSN: ${profile.npsn || '-'})
- Alamat Madrasah: ${profile.schoolAddress || '-'}
- Jenjang Pendidikan: ${profile.level || 'MI/MTs/MA'}
- Kepala Madrasah: ${profile.headmaster || '-'} (NUPTK: ${profile.headmasterId || '-'}, TTL: ${profile.headmasterBirth || '-'}, No. HP: ${profile.headmasterPhone || '-'})
- Nama Guru: ${profile.name || '-'} (NUPTK: ${profile.nip || '-'}, TTL: ${profile.teacherBirth || '-'}, No. HP: ${profile.teacherPhone || '-'})
- Mata Pelajaran / Bidang: ${profile.subject || '-'}
- Kelas / Fase: ${profile.grade || '-'}
- Judul Karya / Topik Materi: ${profile.topic || 'Sesuaikan dengan mata pelajaran dan jenjang'}
- Jenis Produk: ${profile.productType || 'Modul'}
- Link / Tautan Produk: ${profile.productLink || '-'}
- Nomor Surat Keterangan: ${profile.letterNumber || '069 / S.Ket / MIS / X / 2025'}
- Tempat & Tanggal Surat: ${profile.letterDate || '-'}

Rincian Tugas Penyusunan Dokumen:
${promptTask}

Data Lengkap Profil Guru & Lembaga:
${JSON.stringify(profile, null, 2)}

Metadata Bukti Pendukung Lokal yang Tersedia pada Kategori ${categoryCode}:
${JSON.stringify(evidenceList || [], null, 2)}

Instruksi Khusus dari Guru:
${extraInstructions ? extraInstructions : 'Susun dokumen secara komprehensif, diawali format Kop Surat Madrasah & Surat Keterangan Kepala Madrasah (Yang bertanda tangan di bawah ini ... Menyatakan dengan sesungguhnya bahwa ...), diikuti isi lengkap perangkat/laporan.'}

Aturan Wajib Penyusunan:
1. Awali dokumen dengan bagian KOP SURAT MADRASAH dan SURAT KETERANGAN KEPALA MADRASAH sesuai format resmi (mencantumkan identitas Kepala Madrasah, identitas Guru, Judul Karya/Perangkat, Jenis Produk, Link/Tautan, dan blok tanda tangan Kepala Madrasah).
2. Setelah Surat Keterangan, tuliskan isi utama dokumen (${docTitle}) secara utuh, mendalam, dan siap pakai sesuai topik "${profile.topic || profile.subject}".
3. Sertakan bagian "Checklist Verifikasi Kelengkapan Berkas ${categoryCode}" di bagian akhir dokumen.`;

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: prompt,
      config: {
        systemInstruction:
          'Anda adalah RPLumi, asisten ahli penyusunan berkas Rekognisi Pembelajaran Lampau (RPL) PPG Dalam Jabatan untuk guru RA, MI, MTs, dan MA di Indonesia. Anda menghasilkan draf dokumen pendidikan berbahasa Indonesia baku yang mengikuti format tata naskah madrasah resmi dan langsung dapat digunakan guru.',
      },
    });

    const content = response.text;
    if (!content) {
      res.status(502).json({ error: 'Respons dari Gemini kosong. Silakan coba lagi.' });
      return;
    }

    res.json({ content, modelUsed: targetModel });
  } catch (err: any) {
    console.error('Error in /api/gemini/generate:', err);
    const status = err?.status || 500;
    const message =
      err?.message || 'Terjadi kesalahan saat menghubungi layanan Gemini AI di server.';
    res.status(status >= 400 && status < 600 ? status : 500).json({ error: message });
  }
});

app.post('/api/gemini/check', async (req, res) => {
  try {
    const {
      draftTitle,
      categoryCode,
      draftContent,
      profile,
      evidenceList,
      checkNotes,
      model,
    } = req.body;

    if (!draftTitle || !draftContent) {
      res.status(400).json({ error: 'Pilih draf dokumen yang memiliki isi terlebih dahulu.' });
      return;
    }

    const ai = getAiClient();
    const targetModel = resolveModel(model);

    const prompt = `Bertindak sebagai pemeriksa awal portofolio RPL PPG Daljab (bukan asesor resmi).
Periksa draf dokumen berikut:
- Judul Dokumen: ${draftTitle}
- Kategori RPL: ${categoryCode}
- Jenjang: ${profile?.level || '-'}
- Mata Pelajaran: ${profile?.subject || '-'}
- Topik / Materi: ${profile?.topic || '-'}

Isi Draf Dokumen:
"""
${draftContent}
"""

Metadata Bukti Pendukung pada Kategori ${categoryCode} (hanya nama dan label file lokal):
${JSON.stringify(evidenceList || [], null, 2)}

Catatan Tambahan dari Guru:
${checkNotes || 'Tidak ada catatan khusus.'}

Berikan hasil pemeriksaan awal yang terstruktur meliputi:
1. Ringkasan Kesiapan Dokumen & Kesesuaian Format Surat Keterangan / Kop Madrasah.
2. Evaluasi Komponen Utama (daftar setiap aspek dengan status: [Lengkap] / [Perlu Revisi] / [Belum Ada Bukti], beserta penjelasannya).
3. Daftar Placeholder [PERLU DILENGKAPI] yang masih perlu diisi oleh guru sebelum dicetak/diunggah.
4. Rekomendasi Perbaikan Prioritas.
5. Poin Penting yang Wajib Diverifikasi terhadap Rubrik Resmi LPTK/Kemenag.

Catatan: Jangan memberikan keputusan lulus/gagal atau skor angka mutlak.`;

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: prompt,
      config: {
        systemInstruction:
          'Anda adalah pemeriksa awal berkas RPL PPG Daljab yang teliti, konstruktif, dan objektif. Berikan umpan balik yang jelas dan langsung membantu guru melengkapi kekurangan dokumennya.',
      },
    });

    const result = response.text;
    if (!result) {
      res.status(502).json({ error: 'Respons pemeriksaan dari Gemini kosong.' });
      return;
    }

    res.json({ result, modelUsed: targetModel });
  } catch (err: any) {
    console.error('Error in /api/gemini/check:', err);
    const status = err?.status || 500;
    const message =
      err?.message || 'Terjadi kesalahan saat memeriksa dokumen dengan Gemini AI.';
    res.status(status >= 400 && status < 600 ? status : 500).json({ error: message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RPLumi server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
