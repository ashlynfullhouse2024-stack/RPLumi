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
    profile.foundationName || 'YAYASAN PENDIDIKAN ISLAM ISHLAHUDDINIYYAH PONDOK AREN';
  const arabic =
    profile.arabicTitle || 'الْمَدْرَسَةُ الْإِبْتِدَائِيَّةُ الْإِصْلَاحُ الدِّيْنِيَّةُ';
  const schoolName = profile.school || 'MI. ISHLAHUDDINIYYAH';
  const accred = profile.accreditation || 'TERAKREDITASI "B"';
  const nsm = profile.nsm || '111236740010';
  const npsn = profile.npsn || '60721485';
  const address =
    profile.schoolAddress ||
    'Jl. Panti Asuhan RT. 003 / 011 Kp. Ceger, Kel. Jurang Mangu Barat, Kec. Pondok Aren, Kota Tangerang Selatan 15423';
  const letterNumber = profile.letterNumber || '069 / S.Ket / MIS-ISHLAH / X / 2022';
  const letterDate = profile.letterDate || 'Tangerang Selatan, 12 Oktober 2022';

  const headmasterName = profile.headmaster || 'DAHLIAH, S.Ag.';
  const headmasterId = profile.headmasterId || '6447752654300042';
  const headmasterBirth = profile.headmasterBirth || 'Tangerang, 11 Mei 1967';
  const headmasterPos = profile.headmasterPosition || 'Kepala Madrasah';
  const headmasterPhone = profile.headmasterPhone || '08119793099';

  const teacherName = profile.name || 'M. FIRMANSYAH';
  const teacherId = profile.nip || '4344767668200003';
  const teacherBirth = profile.teacherBirth || 'Pekalongan, 12 Oktober 1989';
  const teacherSubject = profile.subject || 'Guru Kelas';
  const teacherPhone = profile.teacherPhone || '088809440112';

  const workTitle =
    profile.topic || 'Modul Pembelajaran Kelas 6 Tema 2 : Persatuan dalam Perbedaan';
  const productType = profile.productType || 'Modul';
  const productLink = profile.productLink || 'https://anyflip.com/dwike/xbuu/';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF2EA] border border-[#E7D8C9] rounded-xl p-3.5">
        <div className="text-xs text-[#5A392C]">
          <strong className="font-bold text-[#3B2820]">
            Pratinjau Format Resmi Surat Keterangan Kepala Madrasah:
          </strong>{' '}
          Otomatis mengikuti isian pada bagian 01. Profil & Kop Madrasah di atas.
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <HoverGuide
            title="Unduh Surat Keterangan (.docx)"
            description="Mengunduh halaman Surat Keterangan Kepala Madrasah lengkap dengan Kop Madrasah, tabel titik dua sejajar, dan blok tanda tangan dalam format Microsoft Word."
            position="top"
          >
            <button
              type="button"
              onClick={onExportDocx}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#4A2E23] bg-[#F4DFE2] hover:bg-[#EBCAD0] rounded-xl transition-colors whitespace-nowrap"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Unduh Surat Resmi (DOCX)</span>
            </button>
          </HoverGuide>

          <HoverGuide
            title="Unduh Surat Keterangan (.pdf)"
            description="Mengunduh Surat Keterangan Kepala Madrasah ukuran A4 siap cetak persis seperti contoh format PDF."
            position="top"
          >
            <button
              type="button"
              onClick={onExportPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#FFFDF9] bg-[#2E7D32] hover:bg-[#256628] rounded-xl transition-colors whitespace-nowrap"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Unduh Surat Resmi (PDF)</span>
            </button>
          </HoverGuide>
        </div>
      </div>

      {/* Visual A4 Paper Sheet Preview */}
      <div className="bg-white border border-[#D8CFC6] rounded-2xl p-6 sm:p-10 shadow-sm text-black font-serif max-w-[820px] mx-auto">
        {/* Kop Surat Madrasah */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pb-3">
          {/* Left Emblem */}
          <div className="w-20 h-20 rounded-full border-2 border-[#2E7D32] flex flex-col items-center justify-center text-center p-1 shrink-0 bg-[#F4FAF4]">
            <div className="w-16 h-16 rounded-full border border-[#2E7D32] flex flex-col items-center justify-center">
              <span className="text-[9px] font-bold text-[#2E7D32] leading-tight">MADRASAH</span>
              <span className="text-xs font-extrabold text-[#1B5E20]">{profile.level || 'MI'}</span>
            </div>
          </div>

          {/* Center Kop Text */}
          <div className="flex-1 text-center">
            <div className="text-xs sm:text-sm font-bold text-[#2E7D32] tracking-wide uppercase">
              {foundation}
            </div>
            {arabic && (
              <div className="text-base sm:text-xl font-bold text-[#1B5E20] my-1" dir="rtl">
                {arabic}
              </div>
            )}
            <div className="text-xl sm:text-2xl font-extrabold text-[#2E7D32] tracking-wide uppercase">
              {schoolName}
            </div>
            <div className="text-xs font-bold text-[#2E7D32] mt-0.5">STATUS : {accred}</div>
            <div className="text-xs font-bold text-[#1B5E20] font-mono tabular-nums">
              NSM : {nsm} &nbsp; NPSN : {npsn}
            </div>
          </div>
        </div>

        {/* Green Address Banner */}
        <div className="bg-[#2E7D32] text-white text-center py-1.5 px-3 text-[11px] sm:text-xs font-bold mb-6">
          {address}
        </div>

        {/* Letter Title */}
        <div className="text-center mb-6">
          <h3 className="text-base sm:text-lg font-bold underline tracking-wide uppercase">
            SURAT KETERANGAN
          </h3>
          <p className="text-xs sm:text-sm mt-0.5">Nomor : {letterNumber}</p>
        </div>

        {/* Letter Body */}
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed">
          <div>
            <p className="mb-1.5">Yang bertanda tangan di bawah ini :</p>
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="py-0.5 w-44 sm:w-56 align-top">Nama Lengkap</td>
                  <td className="py-0.5 w-4 align-top">:</td>
                  <td className="py-0.5 font-medium">{headmasterName}</td>
                </tr>
                <tr>
                  <td className="py-0.5 align-top">NUPTK</td>
                  <td className="py-0.5 align-top">:</td>
                  <td className="py-0.5 font-mono tabular-nums">{headmasterId}</td>
                </tr>
                <tr>
                  <td className="py-0.5 align-top">Tempat dan Tanggal Lahir</td>
                  <td className="py-0.5 align-top">:</td>
                  <td className="py-0.5">{headmasterBirth}</td>
                </tr>
                <tr>
                  <td className="py-0.5 align-top">Jabatan</td>
                  <td className="py-0.5 align-top">:</td>
                  <td className="py-0.5">{headmasterPos}</td>
                </tr>
                <tr>
                  <td className="py-0.5 align-top">Tempat Tugas</td>
                  <td className="py-0.5 align-top">:</td>
                  <td className="py-0.5">{schoolName}</td>
                </tr>
                <tr>
                  <td className="py-0.5 align-top">Alamat Madrasah</td>
                  <td className="py-0.5 align-top">:</td>
                  <td className="py-0.5">{address}</td>
                </tr>
                <tr>
                  <td className="py-0.5 align-top">No. HP</td>
                  <td className="py-0.5 align-top">:</td>
                  <td className="py-0.5 font-mono tabular-nums">{headmasterPhone}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <p className="mb-1.5">Menyatakan dengan sesungguhnya, bahwa :</p>
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="py-0.5 w-44 sm:w-56 align-top">Nama Lengkap</td>
                  <td className="py-0.5 w-4 align-top">:</td>
                  <td className="py-0.5 font-medium">{teacherName}</td>
                </tr>
                <tr>
                  <td className="py-0.5 align-top">NUPTK</td>
                  <td className="py-0.5 align-top">:</td>
                  <td className="py-0.5 font-mono tabular-nums">{teacherId}</td>
                </tr>
                <tr>
                  <td className="py-0.5 align-top">Tempat dan Tanggal Lahir</td>
                  <td className="py-0.5 align-top">:</td>
                  <td className="py-0.5">{teacherBirth}</td>
                </tr>
                <tr>
                  <td className="py-0.5 align-top">Mapel Yang Diampu</td>
                  <td className="py-0.5 align-top">:</td>
                  <td className="py-0.5">{teacherSubject}</td>
                </tr>
                <tr>
                  <td className="py-0.5 align-top">Tempat Tugas</td>
                  <td className="py-0.5 align-top">:</td>
                  <td className="py-0.5">{schoolName}</td>
                </tr>
                <tr>
                  <td className="py-0.5 align-top">No. HP</td>
                  <td className="py-0.5 align-top">:</td>
                  <td className="py-0.5 font-mono tabular-nums">{teacherPhone}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <p className="mb-1.5">
              Nama tersebut di atas adalah benar merupakan guru yang bertugas di {schoolName} yang
              telah membuat karya inovasi berupa :
            </p>
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="py-0.5 w-44 sm:w-56 align-top">Judul</td>
                  <td className="py-0.5 w-4 align-top">:</td>
                  <td className="py-0.5 font-medium">{workTitle}</td>
                </tr>
                <tr>
                  <td className="py-0.5 align-top">Jenis Produk</td>
                  <td className="py-0.5 align-top">:</td>
                  <td className="py-0.5">{productType}</td>
                </tr>
                <tr>
                  <td className="py-0.5 align-top">Link / Tautan</td>
                  <td className="py-0.5 align-top">:</td>
                  <td className="py-0.5 text-blue-700 underline break-all">{productLink}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            Demikian surat keterangan ini saya buat dengan sebenar-benarnya dan penuh tanggung
            jawab, agar dapat dipergunakan sebagaimana mestinya.
          </p>

          {/* Right Signature Block */}
          <div className="pt-6 flex justify-end">
            <div className="w-64 text-left">
              <p>{letterDate}</p>
              <p className="mb-16">{headmasterPos}</p>
              <p className="font-bold underline">{headmasterName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
