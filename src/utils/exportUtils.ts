import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  UnderlineType,
  WidthType,
} from 'docx';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { DraftRecord, EvidenceItem, RPL_CATEGORIES, TeacherProfile } from '../data/rplData';

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

const NO_BORDER = {
  top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
};

function createKeyValueRow(label: string, value: string, isLink = false): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 34, type: WidthType.PERCENTAGE },
        borders: NO_BORDER,
        children: [
          new Paragraph({
            children: [new TextRun({ text: label, size: 23, font: 'Times New Roman' })],
            spacing: { after: 60 },
          }),
        ],
      }),
      new TableCell({
        width: { size: 3, type: WidthType.PERCENTAGE },
        borders: NO_BORDER,
        children: [
          new Paragraph({
            children: [new TextRun({ text: ':', size: 23, font: 'Times New Roman' })],
            spacing: { after: 60 },
          }),
        ],
      }),
      new TableCell({
        width: { size: 63, type: WidthType.PERCENTAGE },
        borders: NO_BORDER,
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: value || '-',
                size: 23,
                font: 'Times New Roman',
                color: isLink ? '1D4ED8' : '000000',
                underline: isLink ? { type: UnderlineType.SINGLE } : undefined,
              }),
            ],
            spacing: { after: 60 },
          }),
        ],
      }),
    ],
  });
}

function buildMadrasahHeaderParagraphs(profile: TeacherProfile): Paragraph[] {
  const foundation =
    profile.foundationName || 'YAYASAN PENDIDIKAN ISLAM / KEMENTERIAN AGAMA REPUBLIK INDONESIA';
  const schoolName = (profile.school || 'MADRASAH / SEKOLAH').toUpperCase();
  const accred = profile.accreditation || 'TERAKREDITASI "B"';
  const nsmText = profile.nsm ? `NSM : ${profile.nsm}` : 'NSM : -';
  const npsnText = profile.npsn ? `NPSN : ${profile.npsn}` : 'NPSN : -';
  const address =
    profile.schoolAddress ||
    (profile.city ? `Alamat: ${profile.school}, ${profile.city}` : 'Alamat Madrasah / Sekolah');

  const items: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: foundation.toUpperCase(),
          bold: true,
          size: 22,
          color: '2E7D32',
          font: 'Times New Roman',
        }),
      ],
      spacing: { after: 60 },
    }),
  ];

  if (profile.arabicTitle?.trim()) {
    items.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: profile.arabicTitle.trim(),
            bold: true,
            size: 28,
            color: '1B5E20',
            font: 'Times New Roman',
          }),
        ],
        spacing: { after: 60 },
      })
    );
  }

  items.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: schoolName,
          bold: true,
          size: 34,
          color: '2E7D32',
          font: 'Times New Roman',
        }),
      ],
      spacing: { after: 40 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `STATUS : ${accred}`,
          bold: true,
          size: 21,
          color: '2E7D32',
          font: 'Times New Roman',
        }),
      ],
      spacing: { after: 40 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `${nsmText}   ${npsnText}`,
          bold: true,
          size: 20,
          color: '1B5E20',
          font: 'Times New Roman',
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      shading: {
        type: ShadingType.CLEAR,
        color: 'auto',
        fill: '2E7D32',
      },
      children: [
        new TextRun({
          text: address,
          bold: true,
          size: 18,
          color: 'FFFFFF',
          font: 'Times New Roman',
        }),
      ],
      spacing: { before: 60, after: 280 },
    })
  );

  return items;
}

export async function createOfficialLetterDocxBlob(profile: TeacherProfile): Promise<Blob> {
  const headmasterTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: NO_BORDER,
    rows: [
      createKeyValueRow('Nama Lengkap', profile.headmaster || '[Nama Kepala Madrasah]'),
      createKeyValueRow('NUPTK / NIP', profile.headmasterId || '-'),
      createKeyValueRow('Tempat dan Tanggal Lahir', profile.headmasterBirth || '-'),
      createKeyValueRow('Jabatan', profile.headmasterPosition || 'Kepala Madrasah'),
      createKeyValueRow('Tempat Tugas', profile.school || '-'),
      createKeyValueRow('Alamat Madrasah', profile.schoolAddress || '-'),
      createKeyValueRow('No. HP', profile.headmasterPhone || '-'),
    ],
  });

  const teacherTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: NO_BORDER,
    rows: [
      createKeyValueRow('Nama Lengkap', profile.name || '[Nama Guru]'),
      createKeyValueRow('NUPTK / NIP', profile.nip || '-'),
      createKeyValueRow('Tempat dan Tanggal Lahir', profile.teacherBirth || '-'),
      createKeyValueRow('Mapel Yang Diampu', profile.subject || 'Guru Kelas'),
      createKeyValueRow('Tempat Tugas', profile.school || '-'),
      createKeyValueRow('No. HP', profile.teacherPhone || '-'),
    ],
  });

  const workTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: NO_BORDER,
    rows: [
      createKeyValueRow(
        'Judul',
        profile.topic || 'Modul Pembelajaran / Karya Inovasi Pembelajaran'
      ),
      createKeyValueRow('Jenis Produk', profile.productType || 'Modul'),
      createKeyValueRow('Link / Tautan', profile.productLink || '-', Boolean(profile.productLink)),
    ],
  });

  const dateLine =
    profile.letterDate ||
    `${profile.city || 'Tangerang Selatan'}, ${new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })}`;

  const doc = new Document({
    sections: [
      {
        children: [
          ...buildMadrasahHeaderParagraphs(profile),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'SURAT KETERANGAN',
                bold: true,
                size: 28,
                font: 'Times New Roman',
                underline: { type: UnderlineType.SINGLE },
              }),
            ],
            spacing: { after: 60 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `Nomor : ${profile.letterNumber || '069 / S.Ket / MIS / X / 2025'}`,
                size: 23,
                font: 'Times New Roman',
              }),
            ],
            spacing: { after: 280 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Yang bertanda tangan di bawah ini :',
                size: 23,
                font: 'Times New Roman',
              }),
            ],
            spacing: { after: 100 },
          }),
          headmasterTable,
          new Paragraph({
            children: [
              new TextRun({
                text: 'Menyatakan dengan sesungguhnya, bahwa :',
                size: 23,
                font: 'Times New Roman',
              }),
            ],
            spacing: { before: 220, after: 100 },
          }),
          teacherTable,
          new Paragraph({
            children: [
              new TextRun({
                text: `Nama tersebut di atas adalah benar merupakan guru yang bertugas di ${
                  profile.school || 'Madrasah'
                } yang telah membuat karya inovasi berupa :`,
                size: 23,
                font: 'Times New Roman',
              }),
            ],
            spacing: { before: 220, after: 100 },
          }),
          workTable,
          new Paragraph({
            children: [
              new TextRun({
                text: 'Demikian surat keterangan ini saya buat dengan sebenar-benarnya dan penuh tanggung jawab, agar dapat dipergunakan sebagaimana mestinya.',
                size: 23,
                font: 'Times New Roman',
              }),
            ],
            spacing: { before: 240, after: 360 },
          }),
          new Paragraph({
            indent: { left: 5200 },
            children: [
              new TextRun({
                text: dateLine,
                size: 23,
                font: 'Times New Roman',
              }),
            ],
            spacing: { after: 60 },
          }),
          new Paragraph({
            indent: { left: 5200 },
            children: [
              new TextRun({
                text: profile.headmasterPosition || 'Kepala Madrasah',
                size: 23,
                font: 'Times New Roman',
              }),
            ],
            spacing: { after: 960 },
          }),
          new Paragraph({
            indent: { left: 5200 },
            children: [
              new TextRun({
                text: profile.headmaster || 'DAHLIAH, S.Ag.',
                bold: true,
                size: 23,
                font: 'Times New Roman',
                underline: { type: UnderlineType.SINGLE },
              }),
            ],
          }),
        ],
      },
    ],
  });

  return Packer.toBlob(doc);
}

export async function exportOfficialLetterToDocx(profile: TeacherProfile) {
  const blob = await createOfficialLetterDocxBlob(profile);
  triggerDownload(blob, 'Surat_Keterangan_Kepala_Madrasah.docx');
}

export function createOfficialLetterPdf(profile: TeacherProfile): jsPDF {
  const pdf = new jsPDF({
    unit: 'mm',
    format: 'a4',
  });

  const foundation = (
    profile.foundationName || 'YAYASAN PENDIDIKAN ISLAM ISHLAHUDDINIYYAH PONDOK AREN'
  ).toUpperCase();
  const schoolName = (profile.school || 'MI. ISHLAHUDDINIYYAH').toUpperCase();
  const accred = `STATUS : ${profile.accreditation || 'TERAKREDITASI "B"'}`;
  const nsmNpsn = `NSM : ${profile.nsm || '111236740010'}   NPSN : ${profile.npsn || '60721485'}`;
  const address =
    profile.schoolAddress ||
    'Jl. Panti Asuhan RT. 003 / 011 Kp. Ceger, Kel. Jurang Mangu Barat, Kec. Pondok Aren, Kota Tangerang Selatan 15423';

  // Emblem Circle on Left of Kop Surat
  pdf.setDrawColor(46, 125, 50);
  pdf.setLineWidth(0.7);
  pdf.circle(28, 24, 11);
  pdf.setLineWidth(0.3);
  pdf.circle(28, 24, 9);
  pdf.setFont('times', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(46, 125, 50);
  pdf.text('MADRASAH', 28, 23, { align: 'center' });
  pdf.text(profile.level || 'MI', 28, 26.5, { align: 'center' });

  // Kop Surat Text
  pdf.setFont('times', 'bold');
  pdf.setFontSize(10.5);
  pdf.setTextColor(46, 125, 50);
  pdf.text(foundation, 112, 14, { align: 'center', maxWidth: 150 });

  pdf.setFontSize(18);
  pdf.text(schoolName, 112, 23, { align: 'center' });

  pdf.setFontSize(10);
  pdf.text(accred, 112, 28.5, { align: 'center' });

  pdf.setFontSize(9.5);
  pdf.setTextColor(35, 80, 38);
  pdf.text(nsmNpsn, 112, 33.5, { align: 'center' });

  // Green Address Bar matching the PDF example
  pdf.setFillColor(46, 125, 50);
  pdf.rect(14, 37, 182, 6.5, 'F');
  pdf.setFont('times', 'bold');
  pdf.setFontSize(8.2);
  pdf.setTextColor(255, 255, 255);
  pdf.text(address, 105, 41.3, { align: 'center', maxWidth: 178 });

  // Reset to Black for Body
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('times', 'bold');
  pdf.setFontSize(13.5);
  pdf.text('SURAT KETERANGAN', 105, 55, { align: 'center' });
  pdf.setLineWidth(0.45);
  pdf.setDrawColor(0, 0, 0);
  pdf.line(78, 56, 132, 56);

  pdf.setFont('times', 'normal');
  pdf.setFontSize(11);
  pdf.text(
    `Nomor : ${profile.letterNumber || '069 / S.Ket / MIS-ISHLAH / X / 2022'}`,
    105,
    61.5,
    { align: 'center' }
  );

  let y = 73;
  const leftX = 22;
  const colonX = 76;
  const valX = 79;

  const drawRow = (label: string, val: string, isLink = false) => {
    pdf.setFont('times', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(label, leftX, y);
    pdf.text(':', colonX, y);

    if (isLink && val) {
      pdf.setTextColor(29, 78, 216);
      const wrapped = pdf.splitTextToSize(val, 108);
      for (const line of wrapped) {
        pdf.text(line, valX, y);
        const w = pdf.getTextWidth(line);
        pdf.setDrawColor(29, 78, 216);
        pdf.setLineWidth(0.25);
        pdf.line(valX, y + 0.8, valX + w, y + 0.8);
        y += 6;
      }
      pdf.setTextColor(0, 0, 0);
    } else {
      const wrapped = pdf.splitTextToSize(val || '-', 108);
      for (const line of wrapped) {
        pdf.text(line, valX, y);
        y += 6;
      }
    }
  };

  pdf.text('Yang bertanda tangan di bawah ini :', leftX, y);
  y += 7;
  drawRow('Nama Lengkap', profile.headmaster || 'DAHLIAH, S.Ag.');
  drawRow('NUPTK', profile.headmasterId || '6447752654300042');
  drawRow('Tempat dan Tanggal Lahir', profile.headmasterBirth || 'Tangerang, 11 Mei 1967');
  drawRow('Jabatan', profile.headmasterPosition || 'Kepala Madrasah');
  drawRow('Tempat Tugas', profile.school || 'MI Ishlahuddiniyyah');
  drawRow('Alamat Madrasah', address);
  drawRow('No. HP', profile.headmasterPhone || '08119793099');

  y += 4;
  pdf.text('Menyatakan dengan sesungguhnya, bahwa :', leftX, y);
  y += 7;
  drawRow('Nama Lengkap', profile.name || 'M. FIRMANSYAH');
  drawRow('NUPTK', profile.nip || '4344767668200003');
  drawRow('Tempat dan Tanggal Lahir', profile.teacherBirth || 'Pekalongan, 12 Oktober 1989');
  drawRow('Mapel Yang Diampu', profile.subject || 'Guru Kelas');
  drawRow('Tempat Tugas', profile.school || 'MI Ishlahuddiniyyah');
  drawRow('No. HP', profile.teacherPhone || '088809440112');

  y += 4;
  const statement = `Nama tersebut di atas adalah benar merupakan guru yang bertugas di ${
    profile.school || 'MI Ishlahuddiniyyah'
  } yang telah membuat karya inovasi berupa :`;
  const stmtLines = pdf.splitTextToSize(statement, 166);
  for (const line of stmtLines) {
    pdf.text(line, leftX, y);
    y += 6;
  }
  y += 1;

  drawRow(
    'Judul',
    profile.topic || 'Modul Pembelajaran Kelas 6 Tema 2 : Persatuan dalam Perbedaan'
  );
  drawRow('Jenis Produk', profile.productType || 'Modul');
  drawRow('Link / Tautan', profile.productLink || 'https://anyflip.com/dwike/xbuu/', true);

  y += 4;
  const closing =
    'Demikian surat keterangan ini saya buat dengan sebenar-benarnya dan penuh tanggung jawab, agar dapat dipergunakan sebagaimana mestinya.';
  const closingLines = pdf.splitTextToSize(closing, 166);
  for (const line of closingLines) {
    pdf.text(line, leftX, y);
    y += 6;
  }

  y += 8;
  const sigX = 126;
  const dateLine =
    profile.letterDate ||
    `${profile.city || 'Tangerang Selatan'}, ${new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })}`;

  pdf.text(dateLine, sigX, y);
  y += 6;
  pdf.text(profile.headmasterPosition || 'Kepala Madrasah', sigX, y);
  y += 25;

  const headmasterName = profile.headmaster || 'DAHLIAH, S.Ag.';
  pdf.setFont('times', 'bold');
  pdf.text(headmasterName, sigX, y);
  const nameWidth = pdf.getTextWidth(headmasterName);
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.4);
  pdf.line(sigX, y + 1, sigX + nameWidth, y + 1);

  return pdf;
}

export async function exportOfficialLetterToPdf(profile: TeacherProfile) {
  const pdf = createOfficialLetterPdf(profile);
  pdf.save('Surat_Keterangan_Kepala_Madrasah.pdf');
}

export async function createDocxBlob(
  title: string,
  category: string,
  content: string,
  profile?: TeacherProfile
): Promise<Blob> {
  const lines = content.split('\n');
  const paragraphs: Paragraph[] = [];

  if (profile) {
    paragraphs.push(...buildMadrasahHeaderParagraphs(profile));
  }

  paragraphs.push(
    new Paragraph({
      text: `${category} — ${title}`,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 240 },
    })
  );

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (trimmed.startsWith('### ')) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.replace(/^###\s+/, ''),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 180, after: 80 },
        })
      );
    } else if (trimmed.startsWith('## ')) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.replace(/^##\s+/, ''),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 220, after: 100 },
        })
      );
    } else if (trimmed.startsWith('# ')) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.replace(/^#\s+/, ''),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        })
      );
    } else {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: rawLine.replace(/\*\*(.*?)\*\*/g, '$1'),
              size: 23,
              font: 'Times New Roman',
            }),
          ],
          spacing: { after: 100 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        children: paragraphs,
      },
    ],
  });

  return Packer.toBlob(doc);
}

export async function exportDraftToDocx(
  docKey: string,
  draft: DraftRecord,
  profile?: TeacherProfile
) {
  const blob = await createDocxBlob(draft.title, draft.category, draft.content, profile);
  triggerDownload(blob, `${docKey}.docx`);
}

export async function exportDraftToPdf(
  docKey: string,
  draft: DraftRecord,
  profile?: TeacherProfile
) {
  const pdf = new jsPDF({
    unit: 'mm',
    format: 'a4',
  });

  let y = 16;

  if (profile) {
    const foundation = (
      profile.foundationName || 'YAYASAN PENDIDIKAN ISLAM / MADRASAH'
    ).toUpperCase();
    const schoolName = (profile.school || 'MADRASAH / SEKOLAH').toUpperCase();
    const accred = `STATUS : ${profile.accreditation || 'TERAKREDITASI "B"'}`;
    const nsmNpsn = `NSM : ${profile.nsm || '-'}   NPSN : ${profile.npsn || '-'}`;
    const address = profile.schoolAddress || profile.city || '';

    pdf.setFont('times', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(46, 125, 50);
    pdf.text(foundation, 105, y, { align: 'center', maxWidth: 170 });
    y += 6.5;

    pdf.setFontSize(15);
    pdf.text(schoolName, 105, y, { align: 'center' });
    y += 5;

    pdf.setFontSize(9.5);
    pdf.text(`${accred}   |   ${nsmNpsn}`, 105, y, { align: 'center' });
    y += 3.5;

    pdf.setFillColor(46, 125, 50);
    pdf.rect(16, y, 178, 6, 'F');
    pdf.setFontSize(8);
    pdf.setTextColor(255, 255, 255);
    pdf.text(address, 105, y + 4, { align: 'center', maxWidth: 174 });
    y += 12;
  }

  pdf.setTextColor(0, 0, 0);
  pdf.setFont('times', 'bold');
  pdf.setFontSize(12.5);
  const headerLines = pdf.splitTextToSize(`${draft.category} — ${draft.title}`, 174);
  for (const hLine of headerLines) {
    pdf.text(hLine, 18, y);
    y += 6.5;
  }

  y += 2;
  pdf.setFont('times', 'normal');
  pdf.setFontSize(10.5);

  const cleanText = draft.content.replace(/\*\*(.*?)\*\*/g, '$1');
  const bodyLines = pdf.splitTextToSize(cleanText, 174);

  for (const line of bodyLines) {
    if (y > 280) {
      pdf.addPage();
      y = 18;
    }
    pdf.text(line, 18, y);
    y += 5.5;
  }

  pdf.save(`${docKey}.pdf`);
}

export async function exportAllToZip(
  drafts: Record<string, DraftRecord>,
  evidence: EvidenceItem[],
  profile: TeacherProfile
) {
  const zip = new JSZip();

  const summaryLines = [
    'PORTOFOLIO BERKAS RPL PPG DALJAB — RPLumi',
    '==========================================',
    `Yayasan         : ${profile.foundationName || '-'}`,
    `Madrasah/Sekolah: ${profile.school || '-'} (${profile.accreditation || '-'})`,
    `NSM / NPSN      : ${profile.nsm || '-'} / ${profile.npsn || '-'}`,
    `Kepala Madrasah : ${profile.headmaster || '-'} (NUPTK: ${profile.headmasterId || '-'})`,
    `Nama Guru       : ${profile.name || '-'} (NUPTK: ${profile.nip || '-'})`,
    `Jenjang / Mapel : ${profile.level || '-'} / ${profile.subject || '-'}`,
    `Judul Karya     : ${profile.topic || '-'}`,
    `Link Produk     : ${profile.productLink || '-'}`,
    `Tanggal Unduh   : ${new Date().toISOString()}`,
  ];
  zip.file('INFO_PORTOFOLIO.txt', summaryLines.join('\n'));

  // Always include the formatted Official Surat Keterangan in the root of the ZIP
  try {
    const suketDocx = await createOfficialLetterDocxBlob(profile);
    zip.file('Surat_Keterangan_Kepala_Madrasah.docx', suketDocx);
    const suketPdf = createOfficialLetterPdf(profile).output('blob');
    zip.file('Surat_Keterangan_Kepala_Madrasah.pdf', suketPdf);
  } catch {
    // Ignore if optional generation fails
  }

  for (const cat of RPL_CATEGORIES) {
    const catFolder = zip.folder(cat.code);
    if (!catFolder) continue;

    for (const docSpec of cat.documents) {
      const draft = drafts[docSpec.key];
      if (draft && draft.content) {
        catFolder.file(`${docSpec.id}.txt`, draft.content);
        try {
          const docxBlob = await createDocxBlob(
            draft.title,
            draft.category,
            draft.content,
            profile
          );
          catFolder.file(`${docSpec.id}.docx`, docxBlob);
        } catch {
          // Fallback to txt if docx generation fails
        }
      }
    }
  }

  for (const item of evidence) {
    if (!item.data) continue;
    const catFolder = zip.folder(item.category);
    const buktiFolder = catFolder?.folder('Bukti');
    if (buktiFolder) {
      try {
        const res = await fetch(item.data);
        const blob = await res.blob();
        buktiFolder.file(item.name, blob);
      } catch {
        // Ignore corrupted data URL
      }
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  triggerDownload(zipBlob, 'RPLumi_Portofolio.zip');
}
