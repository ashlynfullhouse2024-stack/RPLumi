import React from 'react';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { TeacherProfile } from '../data/rplData';
import { HoverGuide } from './HoverGuide';

interface OfficialLetterPreviewProps {
  profile: TeacherProfile;
  onExportDocx: () => void;
  onExportPdf: () => void;
}

export function OfficialLetterPreview({
  profile,
  onExportDocx,
  onExportPdf,
}: OfficialLetterPreviewProps) {
  const foundation =
    profile.foundationName || 'YAYASAN PENDIDIKAN ISLAM CAHAYA BUNGA NUSANTARA';
  const arabic =
    profile.arabicTitle || 'الْمَدْرَسَةُ الْإِبْتِدَائِيَّةُ نُوْرُ الْأَزْهَارِ';
  const schoolName = profile.school || 'MI. NURUL AZHAR HARAPAN';
  const accred = profile.accreditation || 'TERAKREDITASI "A"';
  const nsm = profile.nsm || '111235009988';
  const npsn = profile.npsn || '60799887';
  const address =
    profile.schoolAddress ||
    'Jl. Melati Indah No. 45 RT. 002 / RW. 005 Kel. Sukamaju, Kec. Lembah Asri, Kota Bunga Raya 12345';
  const letterNumber = profile.letterNumber || '012 / S.Ket / MI-NAH / III / 2026';
  const letterDate = profile.letterDate || 'Kota Bunga Raya, 15 Maret 2026';

  const headmasterName = profile.headmaster || 'Hj. SITI NURHALIZA, M.Pd.I.';
  const headmasterId = profile.headmasterId || '1234567890123456';
  const headmasterBirth = profile.headmasterBirth || 'Kota Bunga Raya, 10 April 1975';
  const headmasterPos = profile.headmasterPosition || 'Kepala Madrasah';
  const headmasterPhone = profile.headmasterPhone || '081200001111';

  const teacherName = profile.name || 'AHMAD RASYID, S.Pd.';
  const teacherId = profile.nip || '9876543210987654';
  const teacherBirth = profile.teacherBirth || 'Lembah Asri, 22 Agustus 1992';
  const teacherSubject = profile.subject || 'Guru Kelas';
  const teacherPhone = profile.teacherPhone || '085700002222';

  const workTitle =
    profile.topic || 'Modul Pembelajaran Kelas 5 Tema Ekosistem dan Pelestarian Lingkungan';
  const productType = profile.productType || 'Modul';
  const productLink =
    profile.productLink || 'https://contoh-portofolio-guru.id/modul-ekosistem';

  const renderFieldRow = (label: string, value: string, isMono = false, isLink = false) => (
    <div className="grid grid-cols-1 sm:grid-cols-[190px_14px_1fr] gap-y-0.5 py-1 border-b border-stone-100 sm:border-none">
      <span className="text-stone-600 sm:text-black font-medium sm:font-normal">{label}</span>
      <span className="hidden sm:inline">:</span>
      <span
        className={`${isMono ? 'font-mono tabular-nums' : ''} ${
          isLink ? 'text-blue-700 underline break-all' : 'font-semibold sm:font-normal text-black'
        }`}
      >
        {value}
      </span>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF2EA] border border-[#E7D8C9] rounded-xl p-3.5">
        <div className="text-xs text-[#5A392C]">
          <strong className="font-bold text-[#3B2820]">
            Pratinjau Surat Keterangan Resmi (Contoh Nama & Alamat Fiktif):
          </strong>{' '}
          Ubah di tab Profil jika ingin menyesuaikan dengan data madrasah Anda.
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <HoverGuide
            title="Unduh Surat Keterangan (.docx)"
            description="Mengunduh Surat Keterangan Kepala Madrasah lengkap dengan Kop Madrasah dan tanda tangan dalam format Microsoft Word."
            position="top"
          >
            <button
              type="button"
              onClick={onExportDocx}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-[#4A2E23] bg-[#F4DFE2] hover:bg-[#EBCAD0] rounded-xl transition-colors whitespace-nowrap"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Unduh Word (DOCX)</span>
            </button>
          </HoverGuide>

          <HoverGuide
            title="Unduh Surat Keterangan (.pdf)"
            description="Mengunduh Surat Keterangan Kepala Madrasah ukuran A4 siap cetak dalam format PDF."
            position="top"
          >
            <button
              type="button"
              onClick={onExportPdf}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-[#FFFDF9] bg-[#2E7D32] hover:bg-[#256628] rounded-xl transition-colors whitespace-nowrap"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Unduh Cetak (PDF)</span>
            </button>
          </HoverGuide>
        </div>
      </div>

      {/* Visual A4 Paper Sheet Preview */}
      <div className="bg-white border border-[#D8CFC6] rounded-2xl p-4 sm:p-8 md:p-10 shadow-xs text-black font-serif max-w-[800px] mx-auto">
        {/* Kop Surat Madrasah */}
        <HoverGuide
          title="Kop Surat Resmi Madrasah / Yayasan"
          description="Menampilkan nama Yayasan, nama Madrasah, Status Akreditasi, NSM, dan NPSN. Saat ini menggunakan nama sekolah fiktif (MI. Nurul Azhar Harapan)."
          tip="Buka Langkah 1 (Profil Ringkas) → klik 'Ubah Kop Surat' untuk mengganti dengan nama madrasah Anda."
          badge="Bagian Kop"
          position="top"
          className="block"
        >
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 pb-3 rounded-lg hover:bg-emerald-50/40 transition-colors p-1">
            {/* Left Emblem */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-[#2E7D32] flex flex-col items-center justify-center text-center p-1 shrink-0 bg-[#F4FAF4]">
              <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-full border border-[#2E7D32] flex flex-col items-center justify-center">
                <span className="text-[8px] sm:text-[9px] font-bold text-[#2E7D32] leading-tight">
                  MADRASAH
                </span>
                <span className="text-[11px] sm:text-xs font-extrabold text-[#1B5E20]">
                  {profile.level || 'MI'}
                </span>
              </div>
            </div>

            {/* Center Kop Text */}
            <div className="flex-1 text-center">
              <div className="text-[11px] sm:text-sm font-bold text-[#2E7D32] tracking-wide uppercase leading-snug">
                {foundation}
              </div>
              {arabic && (
                <div className="text-sm sm:text-xl font-bold text-[#1B5E20] my-0.5" dir="rtl">
                  {arabic}
                </div>
              )}
              <div className="text-lg sm:text-2xl font-extrabold text-[#2E7D32] tracking-wide uppercase">
                {schoolName}
              </div>
              <div className="text-[11px] sm:text-xs font-bold text-[#2E7D32] mt-0.5">
                STATUS : {accred}
              </div>
              <div className="text-[11px] sm:text-xs font-bold text-[#1B5E20] font-mono tabular-nums">
                NSM : {nsm} &nbsp; NPSN : {npsn}
              </div>
            </div>
          </div>
        </HoverGuide>

        {/* Green Address Banner */}
        <HoverGuide
          title="Pita Alamat Lengkap Madrasah"
          description="Menampilkan alamat jalan, RT/RW, kelurahan, kecamatan, dan kota madrasah pada pita hijau Kop Surat."
          tip="Saat ini berisi alamat fiktif (Jl. Melati Indah No. 45, Kota Bunga Raya). Dapat diubah di pengaturan Kop Surat pada Langkah 1."
          badge="Alamat Kop"
          position="bottom"
          className="block"
        >
          <div className="bg-[#2E7D32] text-white text-center py-1.5 px-3 text-[10px] sm:text-xs font-bold mb-5 rounded-xs cursor-help">
            {address}
          </div>
        </HoverGuide>

        {/* Letter Title */}
        <HoverGuide
          title="Judul & Nomor Surat Keterangan"
          description="Nomor registrasi surat keluar dari madrasah untuk keperluan pengesahan berkas RPL PPG."
          tip="Format nomor surat dapat disesuaikan di Langkah 1 bagian Pengaturan Kop Surat."
          badge="Nomor Surat"
          position="bottom"
          className="block"
        >
          <div className="text-center mb-5 rounded-lg hover:bg-amber-50/40 p-1 transition-colors">
            <h3 className="text-sm sm:text-lg font-bold underline tracking-wide uppercase">
              SURAT KETERANGAN
            </h3>
            <p className="text-xs sm:text-sm mt-0.5">Nomor : {letterNumber}</p>
          </div>
        </HoverGuide>

        {/* Letter Body */}
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed">
          <HoverGuide
            title="Poin 1: Data Pejabat Penandatangan (Kepala Madrasah)"
            description="Berisi identitas Kepala Madrasah yang menerbitkan dan menandatangani surat keterangan."
            tip="Ubah Nama Kepala Madrasah, NUPTK, TTL, dan No. HP melalui panel 'Ubah Kop Surat' di Langkah 1."
            badge="Data Kamad"
            position="top"
            className="block"
          >
            <div className="rounded-lg hover:bg-amber-50/40 p-1.5 -mx-1.5 transition-colors">
              <p className="mb-1.5 font-medium">Yang bertanda tangan di bawah ini :</p>
              <div className="space-y-0.5">
                {renderFieldRow('Nama Lengkap', headmasterName)}
                {renderFieldRow('NUPTK', headmasterId, true)}
                {renderFieldRow('Tempat dan Tanggal Lahir', headmasterBirth)}
                {renderFieldRow('Jabatan', headmasterPos)}
                {renderFieldRow('Tempat Tugas', schoolName)}
                {renderFieldRow('Alamat Madrasah', address)}
                {renderFieldRow('No. HP', headmasterPhone, true)}
              </div>
            </div>
          </HoverGuide>

          <HoverGuide
            title="Poin 2: Data Guru Peserta PPG Daljab"
            description="Berisi identitas Bapak/Ibu Guru yang mengajukan berkas RPL (Nama Lengkap, NUPTK, TTL, Mapel, Tempat Tugas, dan No. HP)."
            tip="Otomatis mengikuti nama dan mata pelajaran yang Anda isi pada Langkah 1 (Profil Ringkas)."
            badge="Data Guru"
            position="top"
            className="block"
          >
            <div className="rounded-lg hover:bg-amber-50/40 p-1.5 -mx-1.5 transition-colors">
              <p className="mb-1.5 font-medium">Menyatakan dengan sesungguhnya, bahwa :</p>
              <div className="space-y-0.5">
                {renderFieldRow('Nama Lengkap', teacherName)}
                {renderFieldRow('NUPTK', teacherId, true)}
                {renderFieldRow('Tempat dan Tanggal Lahir', teacherBirth)}
                {renderFieldRow('Mapel Yang Diampu', teacherSubject)}
                {renderFieldRow('Tempat Tugas', schoolName)}
                {renderFieldRow('No. HP', teacherPhone, true)}
              </div>
            </div>
          </HoverGuide>

          <HoverGuide
            title="Poin 3: Pernyataan Karya Inovasi / Perangkat Pembelajaran"
            description="Menjelaskan judul karya/modul yang disusun oleh guru, jenis produk, serta tautan bukti karya."
            tip="Judul karya otomatis diambil dari kolom 'Judul Karya Inovasi / Topik Materi' di Langkah 1."
            badge="Karya Guru"
            position="top"
            className="block"
          >
            <div className="rounded-lg hover:bg-amber-50/40 p-1.5 -mx-1.5 transition-colors">
              <p className="mb-1.5">
                Nama tersebut di atas adalah benar merupakan guru yang bertugas di {schoolName} yang
                telah membuat karya inovasi berupa :
              </p>
              <div className="space-y-0.5">
                {renderFieldRow('Judul', workTitle)}
                {renderFieldRow('Jenis Produk', productType)}
                {renderFieldRow('Link / Tautan', productLink, false, true)}
              </div>
            </div>
          </HoverGuide>

          <p>
            Demikian surat keterangan ini saya buat dengan sebenar-benarnya dan penuh tanggung
            jawab, agar dapat dipergunakan sebagaimana mestinya.
          </p>

          {/* Right Signature Block */}
          <HoverGuide
            title="Poin 4: Blok Tanggal & Tanda Tangan Kepala Madrasah"
            description="Bagian pengesahan surat yang memuat kota, tanggal penerbitan, jabatan, serta nama lengkap Kepala Madrasah."
            tip="Siap dicetak pada kertas A4 lalu dibubuhi tanda tangan basah dan stempel madrasah."
            badge="Pengesahan"
            position="top"
            className="block"
          >
            <div className="pt-4 sm:pt-6 flex justify-end rounded-lg hover:bg-amber-50/40 p-1.5 transition-colors">
              <div className="w-56 sm:w-64 text-left">
                <p>{letterDate}</p>
                <p className="mb-14 sm:mb-16">{headmasterPos}</p>
                <p className="font-bold underline">{headmasterName}</p>
              </div>
            </div>
          </HoverGuide>
        </div>
      </div>
    </div>
  );
}
