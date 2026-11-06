RPLumi Simple — tanpa Firebase

Cara pakai:
1. Buka index.html melalui browser modern (Chrome/Edge). Karena fitur memakai JavaScript module dan CDN, jika dibuka langsung dari file lokal dan browser memblokir module, jalankan melalui hosting statis HTTPS atau server lokal sederhana.
2. Masukkan Gemini API Key milik guru.
3. Isi profil, pilih dokumen, generate, edit, lalu ekspor DOCX/PDF atau ZIP.
4. Profil, draf, dan file bukti disimpan di localStorage browser pada perangkat tersebut.
5. Gunakan Backup data untuk mengunduh JSON cadangan dan Pulihkan backup untuk memindahkannya ke perangkat/browser lain.

Batasan:
- Tidak ada akun, Firebase, database, atau sinkronisasi cloud.
- Data tidak otomatis tersedia di perangkat lain. Backup/restore diperlukan untuk pindah perangkat.
- API Key hanya di memori halaman dan tidak disimpan dalam backup/localStorage. Key dikirim langsung ke Google Gemini.
- Upload bukti disimpan sebagai data lokal browser; kapasitas browser terbatas. Backup JSON dapat membesar jika menyertakan banyak file. Untuk bukti besar, simpan juga salinan asli di perangkat.
- AI checker memeriksa isi draf dan metadata nama file, belum membaca isi PDF/DOCX/gambar.
- SK resmi harus diterbitkan lembaga; sertifikat editable hanya template kegiatan sah.
- RPLumi bukan aplikasi resmi Kemenag/PPG. Verifikasi format dan rubrik resmi terbaru.
