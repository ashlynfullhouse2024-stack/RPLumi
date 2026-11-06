import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  CheckSquare,
  Copy,
  Download,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  FolderArchive,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Square,
  StopCircle,
  Trash2,
  Upload,
  Wand2,
} from 'lucide-react';
import {
  ALL_DOCUMENTS,
  DraftRecord,
  EMPTY_PROFILE,
  EvidenceItem,
  RPL_CATEGORIES,
  RplCategory,
  SAMPLE_PROFILE,
  TeacherProfile,
} from './data/rplData';
import {
  BotanicalSprigSvg,
  CamelliaBlossomSvg,
  FloralCornerWatermark,
} from './components/FloralOrnaments';
import {
  HoverGuide,
  OnboardingWorkflowBar,
  WorkflowStepItem,
} from './components/HoverGuide';
import { OfficialLetterPreview } from './components/OfficialLetterPreview';
import {
  exportAllToZip,
  exportDraftToDocx,
  exportDraftToPdf,
  exportOfficialLetterToDocx,
  exportOfficialLetterToPdf,
  triggerDownload,
} from './utils/exportUtils';

const STORAGE_KEY = 'rplumi_simple_v1';
const HERO_IMAGE_PATH = '/src/assets/images/choco_latte_floral_hero_1793950570708.jpg';

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

function countWords(text: string): number {
  const trimmed = (text || '').trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function countPlaceholders(text: string): number {
  if (!text) return 0;
  const matches = text.match(/\[PERLU DILENGKAPI[^\]]*\]/gi);
  return matches ? matches.length : 0;
}

export default function App() {
  // Teacher Profile — initialized with the PDF Example Profile if nothing is saved yet so user immediately sees the exact format
  const [profile, setProfile] = useState<TeacherProfile>(SAMPLE_PROFILE);
  const [profileStatus, setProfileStatus] = useState<string>(
    'Format Kop Madrasah & Surat Keterangan disesuaikan dengan contoh MI Ishlahuddiniyyah.'
  );

  // Gemini Model Selection (uses server-side Gemini API)
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash');

  // Document Selection & Generation
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pickedKeys, setPickedKeys] = useState<string[]>(ALL_DOCUMENTS.map((d) => d.key));
  const [extraInstructions, setExtraInstructions] = useState<string>('');
  const [drafts, setDrafts] = useState<Record<string, DraftRecord>>({});
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeGeneratingKey, setActiveGeneratingKey] = useState<string | null>(null);
  const [genProgress, setGenProgress] = useState<{ current: number; total: number }>({
    current: 0,
    total: 0,
  });
  const stopGenerationRef = useRef<boolean>(false);
  const [genStatus, setGenStatus] = useState<{
    type: 'idle' | 'info' | 'success' | 'error';
    text: string;
  }>({
    type: 'idle',
    text: '',
  });

  // Hero Image Fallback State
  const [heroImgError, setHeroImgError] = useState<boolean>(false);

  // Supporting Evidence
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [uploadCategory, setUploadCategory] = useState<RplCategory['code']>('RPL01');
  const [evidenceLabel, setEvidenceLabel] = useState<string>('');
  const [evidenceFilter, setEvidenceFilter] = useState<string>('ALL');
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'idle' | 'info' | 'success' | 'error';
    text: string;
  }>({
    type: 'idle',
    text: '',
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const backupInputRef = useRef<HTMLInputElement | null>(null);

  // AI Document Checker
  const [checkDocKey, setCheckDocKey] = useState<string>('');
  const [checkNotes, setCheckNotes] = useState<string>('');
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [checkStatus, setCheckStatus] = useState<{
    type: 'idle' | 'info' | 'success' | 'error';
    text: string;
  }>({
    type: 'idle',
    text: '',
  });
  const [checkResult, setCheckResult] = useState<string>('');
  const [copiedCheck, setCopiedCheck] = useState<boolean>(false);

  // Editor & Export Mode ('official_letter' vs 'draft_editor')
  const [editorTab, setEditorTab] = useState<'official_letter' | 'draft_editor'>('official_letter');
  const [editDocKey, setEditDocKey] = useState<string>('');
  const [editorContent, setEditorContent] = useState<string>('');
  const [editStatus, setEditStatus] = useState<string>('');
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);
  const [copiedEditor, setCopiedEditor] = useState<boolean>(false);
  const [manualDocKeyToInit, setManualDocKeyToInit] = useState<string>('RPL01__sk');

  // Load initial state from localStorage (compatible with rplumi_simple_v1)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.profile && parsed.profile.name) {
        setProfile((prev) => ({ ...prev, ...parsed.profile }));
      }
      if (parsed.drafts && typeof parsed.drafts === 'object') {
        setDrafts(parsed.drafts);
        const firstKey = Object.keys(parsed.drafts)[0];
        if (firstKey) {
          setEditDocKey(firstKey);
          setCheckDocKey(firstKey);
          setEditorContent(parsed.drafts[firstKey]?.content || '');
        }
      }
      if (Array.isArray(parsed.evidence)) {
        setEvidence(
          parsed.evidence.map((e: any, idx: number) => ({
            id: e.id || `ev_${idx}_${Date.now()}`,
            name: e.name || 'Berkas',
            label: e.label || e.name || 'Berkas Bukti',
            category: e.category || 'RPL01',
            type: e.type || 'application/octet-stream',
            size: e.size || 0,
            addedAt: e.addedAt || Date.now(),
            data: e.data,
          }))
        );
      }
    } catch (err) {
      console.warn('Gagal memuat data lokal:', err);
    }
  }, []);

  // Persist changes to localStorage
  const persistState = (
    nextProfile: TeacherProfile,
    nextDrafts: Record<string, DraftRecord>,
    nextEvidence: EvidenceItem[]
  ) => {
    try {
      const payload = {
        profile: nextProfile,
        drafts: nextDrafts,
        evidence: nextEvidence.map(({ data, ...meta }) => meta),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.warn('Penyimpanan lokal penuh:', err);
    }
  };

  // Sync checkDocKey & editDocKey when drafts change
  const draftKeys = useMemo(() => Object.keys(drafts), [drafts]);

  useEffect(() => {
    if (draftKeys.length > 0) {
      if (!editDocKey || !drafts[editDocKey]) {
        const first = draftKeys[0];
        setEditDocKey(first);
        setEditorContent(drafts[first]?.content || '');
      }
      if (!checkDocKey || !drafts[checkDocKey]) {
        setCheckDocKey(draftKeys[0]);
      }
    }
  }, [draftKeys, drafts, editDocKey, checkDocKey]);

  const handleProfileChange = (field: keyof TeacherProfile, value: string) => {
    const updated = { ...profile, [field]: value };
    setProfile(updated);
    persistState(updated, drafts, evidence);
    setProfileStatus('Profil, Kop Madrasah, dan draf tersimpan otomatis di browser ini.');
  };

  const handleLoadSampleProfile = () => {
    setProfile(SAMPLE_PROFILE);
    persistState(SAMPLE_PROFILE, drafts, evidence);
    setProfileStatus(
      'Data contoh sesuai format PDF (MI Ishlahuddiniyyah — M. Firmansyah & Dahliah, S.Ag.) berhasil dimuat.'
    );
  };

  const handleClearProfile = () => {
    setProfile(EMPTY_PROFILE);
    persistState(EMPTY_PROFILE, drafts, evidence);
    setProfileStatus('Formulir profil guru dikosongkan.');
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Filtered Documents
  const visibleDocuments = useMemo(() => {
    const baseDocs =
      selectedCategory === 'ALL'
        ? ALL_DOCUMENTS
        : RPL_CATEGORIES.find((c) => c.code === selectedCategory)?.documents || [];

    if (!searchQuery.trim()) return baseDocs;
    const q = searchQuery.toLowerCase();
    return baseDocs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.categoryCode.toLowerCase().includes(q)
    );
  }, [selectedCategory, searchQuery]);

  const togglePickDocument = (key: string) => {
    setPickedKeys((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const selectAllVisible = () => {
    const visibleKeys = visibleDocuments.map((d) => d.key);
    setPickedKeys((prev) => Array.from(new Set([...prev, ...visibleKeys])));
  };

  const selectAll13Documents = () => {
    setPickedKeys(ALL_DOCUMENTS.map((d) => d.key));
  };

  const clearSelection = () => {
    setPickedKeys([]);
  };

  // Core Batch / Single Generator Function
  const executeGenerateKeys = async (keysToGenerate: string[]) => {
    if (keysToGenerate.length === 0) {
      setGenStatus({
        type: 'error',
        text: 'Pilih minimal satu dokumen RPL yang ingin dibuat.',
      });
      return;
    }

    const activeProfile = profile;
    if (
      !activeProfile.name.trim() ||
      !activeProfile.school.trim() ||
      !activeProfile.subject.trim()
    ) {
      setGenStatus({
        type: 'error',
        text: 'Lengkapi Nama Lengkap, Madrasah/Sekolah, dan Mata Pelajaran pada Profil Guru terlebih dahulu (atau klik "Muat Contoh sesuai PDF").',
      });
      scrollToSection('section-profil');
      return;
    }

    setIsGenerating(true);
    stopGenerationRef.current = false;
    setGenProgress({ current: 0, total: keysToGenerate.length });

    const updatedDrafts = { ...drafts };
    let lastGeneratedKey = '';
    let completedCount = 0;

    try {
      for (let i = 0; i < keysToGenerate.length; i++) {
        if (stopGenerationRef.current) {
          setGenStatus({
            type: 'info',
            text: `Penyusunan dihentikan oleh pengguna. ${completedCount} dari ${keysToGenerate.length} dokumen telah tersimpan.`,
          });
          break;
        }

        const key = keysToGenerate[i];
        const docSpec = ALL_DOCUMENTS.find((d) => d.key === key);
        const cat = RPL_CATEGORIES.find((c) => c.code === docSpec?.categoryCode);
        if (!docSpec || !cat) continue;

        setActiveGeneratingKey(key);
        setGenProgress({ current: i + 1, total: keysToGenerate.length });
        setGenStatus({
          type: 'info',
          text: `Menyusun (${i + 1}/${keysToGenerate.length}): ${cat.code} — ${docSpec.title}...`,
        });

        const categoryEvidence = evidence
          .filter((e) => e.category === cat.code)
          .map((e) => ({ name: e.name, label: e.label }));

        const response = await fetch('/api/gemini/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            categoryCode: cat.code,
            categoryName: cat.name,
            docTitle: docSpec.title,
            promptTask: docSpec.promptTask,
            profile: activeProfile,
            evidenceList: categoryEvidence,
            extraInstructions,
            model: selectedModel,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || `Gagal menyusun ${docSpec.title}.`);
        }

        updatedDrafts[key] = {
          title: docSpec.title,
          category: cat.code,
          content: data.content,
          updatedAt: Date.now(),
        };
        lastGeneratedKey = key;
        completedCount++;

        setDrafts({ ...updatedDrafts });
        persistState(activeProfile, updatedDrafts, evidence);
      }

      if (lastGeneratedKey && updatedDrafts[lastGeneratedKey]) {
        setEditDocKey(lastGeneratedKey);
        setCheckDocKey(lastGeneratedKey);
        setEditorContent(updatedDrafts[lastGeneratedKey].content);
        setEditorTab('draft_editor');
      }

      if (!stopGenerationRef.current) {
        setGenStatus({
          type: 'success',
          text: `Selesai! ${completedCount} dokumen RPL berhasil disusun dengan Gemini AI dan siap diedit atau diunduh.`,
        });
      }
    } catch (err: any) {
      setGenStatus({
        type: 'error',
        text: err?.message || 'Terjadi kesalahan saat menyusun dokumen.',
      });
    } finally {
      setIsGenerating(false);
      setActiveGeneratingKey(null);
    }
  };

  const handleGenerateAll13 = () => {
    const allKeys = ALL_DOCUMENTS.map((d) => d.key);
    setPickedKeys(allKeys);
    executeGenerateKeys(allKeys);
  };

  const handleGenerateMissingOnly = () => {
    const missingKeys = ALL_DOCUMENTS.filter((d) => !drafts[d.key]?.content).map((d) => d.key);
    if (missingKeys.length === 0) {
      setGenStatus({
        type: 'success',
        text: 'Seluruh 13 dokumen RPL sudah tersedia! Gunakan tombol "Generate Semua 13 Dokumen" jika ingin menyusun ulang semuanya.',
      });
      return;
    }
    setPickedKeys(missingKeys);
    executeGenerateKeys(missingKeys);
  };

  // Upload Local Supporting Evidence
  const handleUploadEvidence = async () => {
    const files = fileInputRef.current?.files ? Array.from(fileInputRef.current.files) : [];
    if (files.length === 0) {
      setUploadStatus({
        type: 'error',
        text: 'Pilih satu atau beberapa berkas bukti terlebih dahulu.',
      });
      return;
    }

    const newItems: EvidenceItem[] = [];
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        setUploadStatus({
          type: 'error',
          text: `Berkas "${file.name}" melebihi batas ukuran 10 MB.`,
        });
        continue;
      }

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      newItems.push({
        id: `ev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        label: evidenceLabel.trim() || file.name,
        category: uploadCategory,
        type: file.type || 'application/octet-stream',
        size: file.size,
        addedAt: Date.now(),
        data: dataUrl,
      });
    }

    if (newItems.length > 0) {
      const nextEvidence = [...evidence, ...newItems];
      setEvidence(nextEvidence);
      persistState(profile, drafts, nextEvidence);
      setEvidenceLabel('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setUploadStatus({
        type: 'success',
        text: `${newItems.length} berkas bukti berhasil disimpan untuk kategori ${uploadCategory}.`,
      });
    }
  };

  const handleRemoveEvidence = (id: string) => {
    const nextEvidence = evidence.filter((item) => item.id !== id);
    setEvidence(nextEvidence);
    persistState(profile, drafts, nextEvidence);
  };

  // Run AI Document Checker
  const handleCheckDocument = async () => {
    const targetDraft = drafts[checkDocKey];
    if (!targetDraft) {
      setCheckStatus({
        type: 'error',
        text: 'Belum ada draf dokumen yang dipilih untuk diperiksa.',
      });
      return;
    }

    setIsChecking(true);
    setCheckStatus({
      type: 'info',
      text: `Memeriksa kelengkapan draf "${targetDraft.title}" (${targetDraft.category})...`,
    });

    try {
      const categoryEvidence = evidence
        .filter((e) => e.category === targetDraft.category)
        .map((e) => ({ name: e.name, label: e.label }));

      const response = await fetch('/api/gemini/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftTitle: targetDraft.title,
          categoryCode: targetDraft.category,
          draftContent: targetDraft.content,
          profile,
          evidenceList: categoryEvidence,
          checkNotes,
          model: selectedModel,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal memeriksa dokumen.');
      }

      setCheckResult(data.result);
      setCheckStatus({
        type: 'success',
        text: 'Pemeriksaan awal selesai.',
      });
    } catch (err: any) {
      setCheckStatus({
        type: 'error',
        text: err?.message || 'Terjadi kesalahan saat memeriksa draf.',
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Editor Handlers
  const handleSelectEditDoc = (key: string) => {
    setEditDocKey(key);
    setEditorContent(drafts[key]?.content || '');
    setEditorTab('draft_editor');
    setEditStatus('');
  };

  const handleSaveDraft = () => {
    if (!editDocKey || !drafts[editDocKey]) {
      setEditStatus('Pilih atau buat draf terlebih dahulu.');
      return;
    }
    const updatedDrafts: Record<string, DraftRecord> = {
      ...drafts,
      [editDocKey]: {
        ...drafts[editDocKey],
        content: editorContent,
        updatedAt: Date.now(),
      },
    };
    setDrafts(updatedDrafts);
    persistState(profile, updatedDrafts, evidence);
    setEditStatus('Perubahan draf berhasil disimpan di browser.');
  };

  const handleCreateManualDraft = () => {
    const spec = ALL_DOCUMENTS.find((d) => d.key === manualDocKeyToInit);
    if (!spec) return;

    if (drafts[spec.key]) {
      setEditDocKey(spec.key);
      setEditorContent(drafts[spec.key].content);
      setEditorTab('draft_editor');
      setEditStatus(`Membuka draf ${spec.title} yang sudah ada.`);
      return;
    }

    const templateContent = `${profile.foundationName || 'YAYASAN PENDIDIKAN ISLAM'}
${profile.school || 'MADRASAH / SEKOLAH'}
STATUS : ${profile.accreditation || 'TERAKREDITASI "B"'}
NSM : ${profile.nsm || '-'}   NPSN : ${profile.npsn || '-'}
${profile.schoolAddress || '-'}
====================================================================

SURAT KETERANGAN
Nomor : ${profile.letterNumber || '069 / S.Ket / MIS / X / 2025'}

Yang bertanda tangan di bawah ini :
Nama Lengkap            : ${profile.headmaster || '-'}
NUPTK                   : ${profile.headmasterId || '-'}
Tempat dan Tanggal Lahir: ${profile.headmasterBirth || '-'}
Jabatan                 : ${profile.headmasterPosition || 'Kepala Madrasah'}
Tempat Tugas            : ${profile.school || '-'}
Alamat Madrasah         : ${profile.schoolAddress || '-'}
No. HP                  : ${profile.headmasterPhone || '-'}

Menyatakan dengan sesungguhnya, bahwa :
Nama Lengkap            : ${profile.name || '-'}
NUPTK                   : ${profile.nip || '-'}
Tempat dan Tanggal Lahir: ${profile.teacherBirth || '-'}
Mapel Yang Diampu       : ${profile.subject || '-'}
Tempat Tugas            : ${profile.school || '-'}
No. HP                  : ${profile.teacherPhone || '-'}

Nama tersebut di atas adalah benar merupakan guru yang bertugas di ${profile.school || '-'} yang telah menyusun berkas ${spec.categoryCode} (${spec.title}) berupa :
Judul                   : ${profile.topic || spec.title}
Jenis Produk            : ${profile.productType || 'Modul'}
Link / Tautan           : ${profile.productLink || '-'}

Demikian surat keterangan ini saya buat dengan sebenar-benarnya dan penuh tanggung jawab, agar dapat dipergunakan sebagaimana mestinya.

${profile.letterDate || `${profile.city || 'Tangerang Selatan'}, 12 Oktober 2025`}
${profile.headmasterPosition || 'Kepala Madrasah'}


${profile.headmaster || '[Nama Kepala Madrasah]'}
`;

    const updatedDrafts: Record<string, DraftRecord> = {
      ...drafts,
      [spec.key]: {
        title: spec.title,
        category: spec.categoryCode,
        content: templateContent,
        updatedAt: Date.now(),
      },
    };
    setDrafts(updatedDrafts);
    setEditDocKey(spec.key);
    setCheckDocKey(spec.key);
    setEditorContent(templateContent);
    setEditorTab('draft_editor');
    persistState(profile, updatedDrafts, evidence);
    setEditStatus(`Kerangka Surat Keterangan & "${spec.title}" berhasil dibuat.`);
  };

  const handleExportDocx = async () => {
    if (!editDocKey || !drafts[editDocKey]) return;
    try {
      const currentDraft: DraftRecord = {
        ...drafts[editDocKey],
        content: editorContent,
      };
      await exportDraftToDocx(editDocKey, currentDraft, profile);
      setEditStatus(`Berkas ${editDocKey}.docx (dengan Kop Madrasah) berhasil diunduh.`);
    } catch (err: any) {
      setEditStatus(`Gagal mengekspor DOCX: ${err?.message || 'Error'}`);
    }
  };

  const handleExportPdf = async () => {
    if (!editDocKey || !drafts[editDocKey]) return;
    try {
      const currentDraft: DraftRecord = {
        ...drafts[editDocKey],
        content: editorContent,
      };
      await exportDraftToPdf(editDocKey, currentDraft, profile);
      setEditStatus(`Berkas ${editDocKey}.pdf (dengan Kop Madrasah) berhasil diunduh.`);
    } catch (err: any) {
      setEditStatus(`Gagal mengekspor PDF: ${err?.message || 'Error'}`);
    }
  };

  const handleExportOfficialLetterDocx = async () => {
    try {
      await exportOfficialLetterToDocx(profile);
      setEditStatus('Surat_Keterangan_Kepala_Madrasah.docx berhasil diunduh.');
    } catch (err: any) {
      setEditStatus(`Gagal mengunduh DOCX: ${err?.message || 'Error'}`);
    }
  };

  const handleExportOfficialLetterPdf = async () => {
    try {
      await exportOfficialLetterToPdf(profile);
      setEditStatus('Surat_Keterangan_Kepala_Madrasah.pdf berhasil diunduh.');
    } catch (err: any) {
      setEditStatus(`Gagal mengunduh PDF: ${err?.message || 'Error'}`);
    }
  };

  const handleDownloadAllZip = async () => {
    setIsExportingZip(true);
    try {
      await exportAllToZip(drafts, evidence, profile);
      setGenStatus({
        type: 'success',
        text: 'Portofolio ZIP (termasuk Surat_Keterangan_Kepala_Madrasah.pdf/.docx dan folder RPL01–RPL05) berhasil diunduh.',
      });
    } catch (err: any) {
      setGenStatus({
        type: 'error',
        text: `Gagal membuat ZIP: ${err?.message || 'Error'}`,
      });
    } finally {
      setIsExportingZip(false);
    }
  };

  // Backup & Restore JSON
  const handleExportBackup = () => {
    const payload = {
      profile,
      drafts,
      evidence: evidence.map(({ data, ...meta }) => meta),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    triggerDownload(blob, 'RPLumi_Backup.json');
    setProfileStatus('Cadangan data JSON berhasil diunduh.');
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const nextProfile = { ...EMPTY_PROFILE, ...(parsed.profile || {}) };
      const nextDrafts = parsed.drafts || {};
      const nextEvidence = Array.isArray(parsed.evidence) ? parsed.evidence : [];

      setProfile(nextProfile);
      setDrafts(nextDrafts);
      setEvidence(nextEvidence);
      persistState(nextProfile, nextDrafts, nextEvidence);

      const firstKey = Object.keys(nextDrafts)[0] || '';
      setEditDocKey(firstKey);
      setCheckDocKey(firstKey);
      setEditorContent(firstKey ? nextDrafts[firstKey]?.content || '' : '');
      setProfileStatus('Cadangan data berhasil dipulihkan ke perangkat ini.');
    } catch {
      setProfileStatus('Berkas cadangan (.json) tidak valid.');
    } finally {
      if (backupInputRef.current) backupInputRef.current.value = '';
    }
  };

  // Progress Metrics
  const totalDocsCount = ALL_DOCUMENTS.length; // 13
  const completedDocsCount = ALL_DOCUMENTS.filter((d) => Boolean(drafts[d.key]?.content)).length;
  const missingDocsCount = totalDocsCount - completedDocsCount;
  const completionPercent = Math.round((completedDocsCount / totalDocsCount) * 100);

  const isProfileFilled = Boolean(
    profile.name.trim() && profile.school.trim() && profile.subject.trim()
  );

  // 5-Step Guided Onboarding Workflow State
  const workflowSteps: WorkflowStepItem[] = useMemo(
    () => [
      {
        stepNumber: '01',
        id: 'step-profil',
        targetSectionId: 'section-profil',
        title: 'Isi Kop & Profil Guru',
        shortDesc: 'Lengkapi Kop Madrasah, data Kepala Madrasah, data Guru, dan Judul Karya.',
        hoverTitle: 'Langkah 1: Lengkapi Kop Madrasah, Kepala Madrasah & Guru',
        hoverDetail:
          'Format mengikuti contoh resmi MI Ishlahuddiniyyah: mencakup Kop Yayasan/Madrasah, NSM, NPSN, identitas Kepala Madrasah (penandatangan), identitas Guru, Judul Karya, Jenis Produk, dan Link/Tautan.',
        hoverTip:
          'Data contoh dari PDF MI Ishlahuddiniyyah sudah terisi otomatis sehingga Anda bisa langsung melihat pratinjaunya!',
        isCompleted: isProfileFilled,
        actionLabel: isProfileFilled ? 'Profil & Kop Siap ✓' : 'Isi Profil →',
      },
      {
        stepNumber: '02',
        id: 'step-generate',
        targetSectionId: 'section-dokumen',
        title: 'Generate 13 Dokumen RPL',
        shortDesc: 'Susun otomatis SK, RPP, Materi, LKPD, Media, Soal, hingga Inovasi.',
        hoverTitle: 'Langkah 2: Generate Semua 13 Dokumen dengan Gemini AI',
        hoverDetail:
          'Anda dapat menekan tombol "Generate Semua 13 Dokumen RPL" untuk menyusun seluruh berkas dari RPL01 s.d. RPL05 lengkap dengan Surat Keterangan Kepala Madrasah.',
        hoverTip:
          'Tambahkan instruksi khusus pada kotak Instruksi Khusus AI sebelum menekan Generate.',
        isCompleted: completedDocsCount === totalDocsCount,
        actionLabel:
          completedDocsCount > 0
            ? `${completedDocsCount}/13 Draf Tersusun`
            : 'Mulai Generate →',
      },
      {
        stepNumber: '03',
        id: 'step-bukti',
        targetSectionId: 'section-bukti',
        title: 'Lampirkan Bukti Lokal',
        shortDesc: 'Unggah scan SK, sertifikat, atau foto kegiatan untuk bundel ZIP.',
        hoverTitle: 'Langkah 3: Simpan Bukti Pendukung Fisik/Digital',
        hoverDetail:
          'Unggah file PDF, gambar foto kegiatan, atau scan SK resmi dari perangkat Anda ke kategori RPL01–RPL05. File ini akan otomatis masuk ke folder Bukti/ saat Anda mengunduh ZIP.',
        hoverTip:
          'Beri nama label bukti yang jelas, misalnya "SK Pembagian Tugas Mengajar Ganjil 2025/2026".',
        isCompleted: evidence.length > 0,
        actionLabel:
          evidence.length > 0 ? `${evidence.length} Bukti Tersimpan` : 'Unggah Bukti →',
      },
      {
        stepNumber: '04',
        id: 'step-checker',
        targetSectionId: 'section-checker',
        title: 'Periksa dengan AI Checker',
        shortDesc: 'Evaluasi kelengkapan draf & daftar placeholder sebelum disahkan.',
        hoverTitle: 'Langkah 4: Pemeriksaan Awal Kelengkapan Berkas',
        hoverDetail:
          'Fitur Pemeriksa AI akan membaca draf Anda dan mendeteksi bagian mana yang sudah lengkap, bagian mana yang masih bertanda [PERLU DILENGKAPI], serta memberikan saran perbaikan.',
        hoverTip:
          'Gunakan hasil review ini sebagai daftar periksa mandiri sebelum menyerahkan berkas ke sistem PPG.',
        isCompleted: Boolean(checkResult),
        actionLabel: checkResult ? 'Sudah Diperiksa ✓' : 'Periksa Draf →',
      },
      {
        stepNumber: '05',
        id: 'step-export',
        targetSectionId: 'section-editor',
        title: 'Surat Resmi & Ekspor',
        shortDesc: 'Pratinjau Surat Keterangan Kop Madrasah & unduh DOCX/PDF/ZIP.',
        hoverTitle: 'Langkah 5: Pratinjau Surat Keterangan Resmi & Ekspor DOCX/PDF',
        hoverDetail:
          'Lihat pratinjau langsung Surat Keterangan Kepala Madrasah ber-Kop Madrasah (persis contoh PDF MI Ishlahuddiniyyah) dan unduh dalam format Word (.docx) atau PDF (.pdf).',
        hoverTip:
          'Klik tab "Pratinjau Surat Keterangan Resmi" di bagian 05 untuk mengunduh PDF/DOCX siap tanda tangan.',
        isCompleted: true,
        actionLabel: 'Lihat Surat Resmi →',
      },
    ],
    [isProfileFilled, completedDocsCount, totalDocsCount, evidence.length, checkResult]
  );

  const filteredEvidence = useMemo(() => {
    if (evidenceFilter === 'ALL') return evidence;
    return evidence.filter((item) => item.category === evidenceFilter);
  }, [evidence, evidenceFilter]);

  return (
    <div className="min-h-screen flex flex-col text-[#3B2820]">
      {/* Top Bar Contract: Zone 1 Brand Wordmark — Zone 2 Concise Nav Links with Hover Popups — Zone 3 Single Primary CTA */}
      <header className="sticky top-0 z-30 bg-[#FFFDF9]/90 backdrop-blur-md border-b border-[#E7D8C9]">
        <div className="max-w-[1360px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <HoverGuide
            title="RPLumi — Beranda Portofolio"
            description="Asisten penyusunan 13 berkas Rekognisi Pembelajaran Lampau (RPL) PPG Dalam Jabatan bernuansa Choco Latte Floral."
            tip="Klik untuk kembali ke bagian paling atas halaman."
            position="bottom"
          >
            <a
              href="#top"
              className="font-display text-2xl font-bold tracking-tight text-[#5A392C] whitespace-nowrap shrink-0"
            >
              RPLumi
            </a>
          </HoverGuide>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#75584B]">
            <HoverGuide
              title="Menu 01 · Kop Madrasah, Kamad & Profil Guru"
              description="Tempat mengisi Kop Yayasan/Madrasah (NSM, NPSN, Akreditasi, Alamat), identitas Kepala Madrasah, identitas Guru, serta Judul & Link Karya Inovasi."
              tip="Sudah terisi contoh sesuai PDF MI Ishlahuddiniyyah agar bisa langsung dicoba."
              badge="Langkah 1"
              position="bottom"
            >
              <a
                href="#section-profil"
                className="hover:text-[#3B2820] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
              >
                Profil & Kop
              </a>
            </HoverGuide>

            <HoverGuide
              title="Menu 02 · Generator 13 Dokumen RPL"
              description="Pusat pembuatan draf otomatis untuk RPL01 (SK Mengajar), RPL02 (RPP, Materi, LKPD, Media, Asesmen), RPL03 (Profesional), RPL04 (Administrasi), dan RPL05 (Inovasi)."
              tip="Tersedia tombol Generate Semua 13 Dokumen sekaligus maupun Generate per dokumen."
              badge="Langkah 2"
              position="bottom"
            >
              <a
                href="#section-dokumen"
                className="hover:text-[#3B2820] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
              >
                Dokumen RPL
              </a>
            </HoverGuide>

            <HoverGuide
              title="Menu 03 · Bukti Pendukung Lokal"
              description="Tempat menyimpan berkas fisik/digital seperti scan SK, sertifikat pelatihan, atau foto kegiatan kelas dari perangkat Anda."
              tip="Semua file bukti yang diunggah akan dikelompokkan otomatis ke folder RPL01–RPL05 saat unduh ZIP."
              badge="Langkah 3"
              position="bottom"
            >
              <a
                href="#section-bukti"
                className="hover:text-[#3B2820] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
              >
                Bukti Pendukung
              </a>
            </HoverGuide>

            <HoverGuide
              title="Menu 04 · Pemeriksa Awal AI"
              description="Mengevaluasi kelengkapan isi draf dokumen RPL Anda, menandai bagian [PERLU DILENGKAPI], dan memberi saran perbaikan."
              tip="Gunakan sebelum mencetak atau mengunggah berkas ke sistem LPTK."
              badge="Langkah 4"
              position="bottom"
            >
              <a
                href="#section-checker"
                className="hover:text-[#3B2820] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
              >
                Pemeriksa AI
              </a>
            </HoverGuide>

            <HoverGuide
              title="Menu 05 · Pratinjau Surat Resmi & Editor"
              description="Menampilkan pratinjau Surat Keterangan Kepala Madrasah ber-Kop Madrasah (persis contoh PDF) serta editor untuk ke-13 berkas RPL."
              tip="Bisa langsung diekspor ke Word (.docx) dan PDF (.pdf)."
              badge="Langkah 5"
              position="bottom"
            >
              <a
                href="#section-editor"
                className="hover:text-[#3B2820] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
              >
                Surat Resmi & Ekspor
              </a>
            </HoverGuide>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <HoverGuide
              title="Unduh Bundel Portofolio Lengkap (ZIP)"
              description="Mengemas Surat Keterangan Kepala Madrasah (.pdf & .docx), seluruh draf dokumen RPL01–RPL05, serta file bukti pendukung ke dalam satu arsip RPLumi_Portofolio.zip."
              tip="Struktur folder di dalam ZIP sudah otomatis rapi per kategori RPL."
              position="bottom"
            >
              <button
                type="button"
                onClick={handleDownloadAllZip}
                disabled={isExportingZip}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#FFFDF9] bg-[#6F4B3E] hover:bg-[#58392E] disabled:opacity-60 rounded-xl transition-colors whitespace-nowrap shrink-0"
              >
                {isExportingZip ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FolderArchive className="w-3.5 h-3.5" />
                )}
                <span>Unduh Portofolio ZIP</span>
              </button>
            </HoverGuide>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <div id="top" className="max-w-[1360px] w-full mx-auto px-6 py-8 flex-1">
        {/* Hero Split Section — Choco Latte & Floral Botanical Theme */}
        <section className="relative overflow-hidden rounded-3xl border border-[#DFCBB8] bg-gradient-to-br from-[#5E3E32] via-[#6F4B3E] to-[#8C6453] text-[#FFF9F3] mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Left Copy & Primary Generator Trigger */}
            <div className="lg:col-span-7 p-7 sm:p-9 lg:p-10 flex flex-col justify-between relative z-10">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#F5DFE2] mb-3">
                  <CamelliaBlossomSvg className="w-4 h-4 shrink-0" />
                  <span>Asisten Portofolio Mengajar</span>
                  <span aria-hidden="true">·</span>
                  <span>Format Resmi Kop Madrasah</span>
                  <span aria-hidden="true">·</span>
                  <span>RA / MI / MTs / MA</span>
                </div>

                <h1
                  className="font-display text-2xl sm:text-3xl lg:text-[38px] font-bold tracking-tight text-[#FFFDF9] leading-[1.18] mb-4"
                  style={{ textWrap: 'balance' }}
                >
                  Susun seluruh 13 berkas RPL & Surat Keterangan Kepala Madrasah otomatis dengan
                  Gemini AI.
                </h1>

                <p className="text-sm sm:text-base text-[#F4E5DA] leading-relaxed max-w-2xl mb-6">
                  Mendukung format resmi Kop Surat Yayasan/Madrasah (NSM, NPSN, Status Akreditasi,
                  Identitas Kepala Madrasah & Guru, Judul Karya, Jenis Produk, dan Link AnyFlip /
                  Drive) serta penyusunan otomatis 13 berkas RPL sekaligus.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <HoverGuide
                    title="Penyusunan Otomatis 13 Dokumen Sekaligus"
                    description="Menjalankan Gemini AI untuk menyusun seluruh 13 dokumen wajib RPL (RPL01 s.d. RPL05) secara berurutan lengkap dengan Kop Madrasah & Surat Keterangan."
                    tip="Klik untuk langsung menyusun ke-13 berkas sesuai profil yang terisi."
                    badge="1-Klik Lengkap"
                    position="bottom"
                  >
                    <button
                      type="button"
                      onClick={handleGenerateAll13}
                      disabled={isGenerating}
                      className="inline-flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold bg-[#F6DFE2] hover:bg-[#FCECEF] text-[#4A2E23] disabled:opacity-60 rounded-xl transition-colors whitespace-nowrap shrink-0"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#6F4B3E]" />
                      ) : (
                        <Wand2 className="w-4 h-4 text-[#6F4B3E]" />
                      )}
                      <span>
                        {isGenerating
                          ? `Menyusun Dokumen (${genProgress.current}/${genProgress.total})...`
                          : 'Generate Semua 13 Dokumen RPL'}
                      </span>
                    </button>
                  </HoverGuide>

                  <HoverGuide
                    title="Lihat Pratinjau Surat Keterangan Resmi"
                    description="Langsung menuju pratinjau Surat Keterangan Kepala Madrasah ber-Kop Madrasah (persis contoh PDF MI Ishlahuddiniyyah) yang siap diunduh ke PDF atau Word."
                    position="bottom"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setEditorTab('official_letter');
                        scrollToSection('section-editor');
                      }}
                      className="inline-flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold bg-white/15 hover:bg-white/25 text-[#FFFDF9] border border-white/25 rounded-xl transition-colors whitespace-nowrap shrink-0"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Lihat Format Surat Resmi</span>
                    </button>
                  </HoverGuide>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#EED9CB]">
                  <span>Format Kop Surat Madrasah siap ekspor PDF & DOCX</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    {completedDocsCount}/13 dokumen selesai
                  </span>
                </div>
              </div>
            </div>

            {/* Right Floral Choco Latte Illustration */}
            <div className="lg:col-span-5 relative min-h-[240px] lg:min-h-full bg-[#52352A] overflow-hidden">
              {!heroImgError ? (
                <img
                  src={HERO_IMAGE_PATH}
                  alt="Ilustrasi meja kerja Choco Latte dengan bunga kamelia krem, kelopak sakura merah muda, dan daun eukaliptus"
                  referrerPolicy="no-referrer"
                  onError={() => setHeroImgError(true)}
                  className="w-full h-full lg:h-full object-cover object-center"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#6F4B3E] to-[#4A3127] text-center">
                  <CamelliaBlossomSvg className="w-12 h-12 mb-3" />
                  <p className="font-display text-lg text-[#FFFDF9]">
                    RPLumi Choco Latte Edition
                  </p>
                  <p className="text-xs text-[#EBD6C7] mt-1">
                    Ruang kerja penyusunan portofolio guru PPG Daljab
                  </p>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#5E3E32]/85 via-[#5E3E32]/20 to-transparent pointer-events-none" />
            </div>
          </div>
        </section>

        {/* Interactive 5-Step Onboarding & Workflow Bar for Teachers */}
        <OnboardingWorkflowBar
          steps={workflowSteps}
          onJumpToSection={scrollToSection}
          onLoadSampleProfile={handleLoadSampleProfile}
          onGenerateAll13={handleGenerateAll13}
        />

        {/* Two-Column Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[310px_1fr] gap-8 items-start">
          {/* Left Sidebar: Progress, AI Model Config & Backup */}
          <aside className="space-y-6 lg:sticky lg:top-24">
            {/* Progres RPL Card with Floral Touch */}
            <section className="relative overflow-hidden bg-[#FFFDF9] border border-[#E7D8C9] rounded-2xl p-5">
              <FloralCornerWatermark className="w-28 h-28 absolute -top-3 -right-3" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <CamelliaBlossomSvg className="w-4 h-4 shrink-0" />
                    <h2 className="font-display text-base font-bold text-[#4A3127]">
                      Progres Portofolio RPL
                    </h2>
                  </div>
                  <span className="font-mono text-lg font-bold text-[#6F4B3E] tabular-nums">
                    {completionPercent}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-[#876D60] mb-2.5">
                  <span>Kelengkapan 13 dokumen wajib</span>
                  <span className="font-mono tabular-nums">
                    {completedDocsCount} / {totalDocsCount} dokumen
                  </span>
                </div>

                <div className="h-2.5 w-full bg-[#F2E6DC] rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-gradient-to-r from-[#6F4B3E] via-[#8F6554] to-[#6B8E6E] transition-all duration-200"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>

                {/* Quick Batch Generator Button in Sidebar */}
                {missingDocsCount > 0 && (
                  <HoverGuide
                    title="Susun Dokumen yang Belum Dibuat"
                    description={`Menyusun otomatis hanya ${missingDocsCount} dokumen RPL yang saat ini masih kosong tanpa menimpa dokumen yang sudah Anda edit.`}
                    tip="Sangat praktis untuk melengkapi sisa dokumen secara bertahap."
                    position="bottom"
                    className="block w-full mb-4"
                  >
                    <button
                      type="button"
                      onClick={handleGenerateMissingOnly}
                      disabled={isGenerating}
                      className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-[#4A2E23] bg-[#F5DFE2] hover:bg-[#EED0D5] disabled:opacity-60 rounded-xl transition-colors whitespace-nowrap"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-[#6F4B3E]" />
                      )}
                      <span>Susun {missingDocsCount} Dokumen yang Belum Ada</span>
                    </button>
                  </HoverGuide>
                )}

                {/* Per-Category Breakdown */}
                <div className="border-t border-[#EFE4D8] pt-4 space-y-2">
                  <div className="text-xs font-semibold text-[#6E5346] mb-1">
                    Rincian Kategori RPL01–RPL05
                  </div>
                  {RPL_CATEGORIES.map((cat) => {
                    const doneCount = cat.documents.filter((d) =>
                      Boolean(drafts[d.key]?.content)
                    ).length;
                    const totalCat = cat.documents.length;
                    const evidenceCount = evidence.filter((e) => e.category === cat.code).length;

                    return (
                      <HoverGuide
                        key={cat.code}
                        title={`${cat.code} — ${cat.name}`}
                        description={cat.hoverDetail}
                        tip={cat.hoverTip}
                        badge={`${doneCount}/${totalCat} selesai`}
                        position="right"
                        className="block w-full"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat.code);
                            scrollToSection('section-dokumen');
                          }}
                          className="w-full flex items-center justify-between text-left py-1.5 px-2.5 rounded-xl hover:bg-[#FAF1E8] transition-colors group"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="text-xs font-semibold text-[#4A3127] group-hover:text-[#6F4B3E] truncate">
                              <span className="font-mono">{cat.code}</span> · {cat.name}
                            </div>
                            <div className="text-[11px] text-[#876D60]">
                              {evidenceCount} berkas bukti pendukung
                            </div>
                          </div>
                          <span
                            className={`font-mono text-xs font-semibold tabular-nums shrink-0 ${
                              doneCount === totalCat
                                ? 'text-[#3F6A45]'
                                : doneCount > 0
                                ? 'text-[#B06525]'
                                : 'text-[#876D60]'
                            }`}
                          >
                            {doneCount}/{totalCat}
                          </span>
                        </button>
                      </HoverGuide>
                    );
                  })}
                </div>

                {/* Model Selection */}
                <div className="border-t border-[#EFE4D8] mt-4 pt-4">
                  <HoverGuide
                    title="Pilihan Model Gemini AI"
                    description="Menentukan varian model Gemini yang digunakan server untuk menyusun dan memeriksa berkas Anda."
                    tip="Gunakan Gemini 3.8 Flash untuk hasil paling komprehensif, atau Flash Lite untuk kecepatan ekstra."
                    position="top"
                    className="block w-full"
                  >
                    <div>
                      <label
                        htmlFor="gemini-model-select"
                        className="block text-xs font-semibold text-[#6E5346] mb-1.5"
                      >
                        Model Gemini AI
                      </label>
                      <select
                        id="gemini-model-select"
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#FCF8F3] border border-[#DFCBB8] rounded-xl text-[#3B2820] focus:outline-none focus:border-[#6F4B3E]"
                      >
                        <option value="gemini-3.8-flash">
                          Gemini 3.8 Flash (Cepat & Lengkap)
                        </option>
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                        <option value="gemini-3.1-flash-lite">
                          Gemini 3.1 Flash Lite (Ekstra Cepat)
                        </option>
                      </select>
                    </div>
                  </HoverGuide>
                </div>

                {/* Backup & Restore Controls */}
                <div className="border-t border-[#EFE4D8] mt-4 pt-4">
                  <div className="text-xs font-semibold text-[#6E5346] mb-2">
                    Cadangan Data Perangkat
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <HoverGuide
                      title="Simpan Cadangan (Backup JSON)"
                      description="Mengunduh seluruh data Profil Guru dan seluruh draf dokumen RPL Anda ke dalam satu file RPLumi_Backup.json."
                      tip="Simpan file ini di Google Drive atau flashdisk jika ingin melanjutkan kerja di laptop lain."
                      position="top"
                      className="block"
                    >
                      <button
                        type="button"
                        onClick={handleExportBackup}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#5A392C] bg-[#F5EAE0] hover:bg-[#EAD8C8] rounded-xl transition-colors whitespace-nowrap"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Backup JSON</span>
                      </button>
                    </HoverGuide>

                    <HoverGuide
                      title="Pulihkan Cadangan Data"
                      description="Memuat kembali file RPLumi_Backup.json yang pernah Anda simpan sebelumnya ke dalam aplikasi ini."
                      tip="Seluruh profil dan draf akan langsung kembali seperti semula."
                      position="top"
                      className="block"
                    >
                      <button
                        type="button"
                        onClick={() => backupInputRef.current?.click()}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#5A392C] bg-[#F5EAE0] hover:bg-[#EAD8C8] rounded-xl transition-colors whitespace-nowrap"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Pulihkan</span>
                      </button>
                    </HoverGuide>
                    <input
                      ref={backupInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleImportBackup}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Daftar 13 Dokumen Cepat (Quick Jump) */}
            <section className="bg-[#FFFDF9] border border-[#E7D8C9] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="font-display text-sm font-bold text-[#4A3127]">
                  Daftar 13 Berkas Guru
                </h3>
                <BotanicalSprigSvg className="w-20 h-5" />
              </div>
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {ALL_DOCUMENTS.map((doc) => {
                  const hasDraft = Boolean(drafts[doc.key]?.content);
                  const isGeneratingThis = activeGeneratingKey === doc.key;
                  return (
                    <button
                      key={doc.key}
                      type="button"
                      title={`${doc.categoryCode} — ${doc.title}: ${doc.hoverSummary}`}
                      onClick={() => {
                        if (hasDraft) {
                          handleSelectEditDoc(doc.key);
                          scrollToSection('section-editor');
                        } else {
                          setSelectedCategory(doc.categoryCode);
                          scrollToSection('section-dokumen');
                        }
                      }}
                      className="w-full flex items-center justify-between gap-2 text-left px-2.5 py-1.5 rounded-lg hover:bg-[#FAF1E8] transition-colors text-xs"
                    >
                      <span className="truncate text-[#4A3127]">
                        <span className="font-mono text-[11px] text-[#876D60]">
                          {doc.categoryCode}
                        </span>{' '}
                        · {doc.title}
                      </span>
                      <span className="shrink-0 font-mono text-[11px]">
                        {isGeneratingThis ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6F4B3E]" />
                        ) : hasDraft ? (
                          <span className="text-[#3F6A45] font-semibold">✓ Siap</span>
                        ) : (
                          <span className="text-[#A08679]">○ Kosong</span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          </aside>

          {/* Right Main Workspace */}
          <main className="space-y-8 min-w-0">
            {/* 01. Profil Guru & Kop Madrasah */}
            <section
              id="section-profil"
              className="relative overflow-hidden bg-[#FFFDF9] border border-[#E7D8C9] rounded-2xl p-6 scroll-mt-20"
            >
              <FloralCornerWatermark className="w-36 h-36 absolute -top-4 -right-4" />

              <div className="relative z-10">
                <div className="flex flex-wrap items-start justify-between gap-4 pb-5 mb-5 border-b border-[#EFE4D8]">
                  <div>
                    <div className="flex items-center gap-2">
                      <CamelliaBlossomSvg className="w-5 h-5 shrink-0" />
                      <h2 className="font-display text-xl font-bold text-[#3B2820]">
                        01. Kop Surat Madrasah, Kepala Madrasah & Profil Guru
                      </h2>
                    </div>
                    <p className="text-xs text-[#876D60] mt-1">
                      Disusun sesuai contoh format resmi Surat Keterangan Madrasah (Kop Yayasan,
                      NSM, NPSN, Identitas Kepala Madrasah, Identitas Guru, Judul Produk & Link).
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <HoverGuide
                      title="Muat Contoh Sesuai PDF (MI Ishlahuddiniyyah)"
                      description="Mengisi seluruh kolom dengan contoh persis dari PDF Surat Keterangan MI Ishlahuddiniyyah (Kamad: Dahliah, S.Ag. & Guru: M. Firmansyah)."
                      position="bottom"
                    >
                      <button
                        type="button"
                        onClick={handleLoadSampleProfile}
                        className="px-3.5 py-1.5 text-xs font-semibold text-[#4A2E23] bg-[#F5DFE2] hover:bg-[#EED0D5] rounded-xl transition-colors whitespace-nowrap"
                      >
                        Muat Contoh Sesuai PDF
                      </button>
                    </HoverGuide>

                    <HoverGuide
                      title="Kosongkan Formulir"
                      description="Menghapus isian pada kolom profil untuk mulai mengisi data madrasah/sekolah Anda sendiri."
                      position="bottom"
                    >
                      <button
                        type="button"
                        onClick={handleClearProfile}
                        className="px-3 py-1.5 text-xs font-semibold text-[#7E6458] hover:text-[#3B2820] border border-[#E7D8C9] rounded-xl transition-colors whitespace-nowrap"
                      >
                        Reset
                      </button>
                    </HoverGuide>
                  </div>
                </div>

                {/* Sub-group A: Kop Surat Madrasah / Yayasan */}
                <div className="mb-6 pb-5 border-b border-[#EFE4D8]">
                  <div className="text-xs font-bold text-[#6F4B3E] mb-3">
                    A. Data Kop Surat Yayasan & Madrasah / Sekolah
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-[#5A392C] mb-1.5">
                        Nama Yayasan / Instansi Induk (Kop Baris 1)
                      </label>
                      <input
                        type="text"
                        value={profile.foundationName}
                        onChange={(e) => handleProfileChange('foundationName', e.target.value)}
                        placeholder="YAYASAN PENDIDIKAN ISLAM ISHLAHUDDINIYYAH PONDOK AREN"
                        className="w-full px-3.5 py-2 text-sm bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5A392C] mb-1.5">
                        Teks Arab / Kaligrafi Kop (Opsional)
                      </label>
                      <input
                        type="text"
                        dir="rtl"
                        value={profile.arabicTitle}
                        onChange={(e) => handleProfileChange('arabicTitle', e.target.value)}
                        placeholder="الْمَدْرَسَةُ الْإِبْتِدَائِيَّةُ..."
                        className="w-full px-3.5 py-2 text-sm bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5A392C] mb-1.5">
                        Nama Madrasah / Sekolah <span className="text-[#C24B3B]">*</span>
                      </label>
                      <input
                        type="text"
                        value={profile.school}
                        onChange={(e) => handleProfileChange('school', e.target.value)}
                        placeholder="MI. ISHLAHUDDINIYYAH"
                        className="w-full px-3.5 py-2 text-sm bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5A392C] mb-1.5">
                        Jenjang Pendidikan
                      </label>
                      <select
                        value={profile.level}
                        onChange={(e) =>
                          handleProfileChange('level', e.target.value as TeacherProfile['level'])
                        }
                        className="w-full px-3.5 py-2 text-sm bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                      >
                        <option value="RA">RA (Raudhatul Athfal)</option>
                        <option value="MI">MI (Madrasah Ibtidaiyah)</option>
                        <option value="MTs">MTs (Madrasah Tsanawiyah)</option>
                        <option value="MA">MA (Madrasah Aliyah)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5A392C] mb-1.5">
                        Status Akreditasi
                      </label>
                      <input
                        type="text"
                        value={profile.accreditation}
                        onChange={(e) => handleProfileChange('accreditation', e.target.value)}
                        placeholder='TERAKREDITASI "B"'
                        className="w-full px-3.5 py-2 text-sm bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5A392C] mb-1.5">
                        Nomor Statistik Madrasah (NSM)
                      </label>
                      <input
                        type="text"
                        value={profile.nsm}
                        onChange={(e) => handleProfileChange('nsm', e.target.value)}
                        placeholder="111236740010"
                        className="w-full px-3.5 py-2 text-sm font-mono bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5A392C] mb-1.5">
                        NPSN
                      </label>
                      <input
                        type="text"
                        value={profile.npsn}
                        onChange={(e) => handleProfileChange('npsn', e.target.value)}
                        placeholder="60721485"
                        className="w-full px-3.5 py-2 text-sm font-mono bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5A392C] mb-1.5">
                        Nomor Surat Keterangan
                      </label>
                      <input
                        type="text"
                        value={profile.letterNumber}
                        onChange={(e) => handleProfileChange('letterNumber', e.target.value)}
                        placeholder="069 / S.Ket / MIS-ISHLAH / X / 2022"
                        className="w-full px-3.5 py-2 text-sm font-mono bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-[#5A392C] mb-1.5">
                        Alamat Lengkap Madrasah (Pita Hijau Kop Surat)
                      </label>
                      <input
                        type="text"
                        value={profile.schoolAddress}
                        onChange={(e) => handleProfileChange('schoolAddress', e.target.value)}
                        placeholder="Jl. Panti Asuhan RT. 003 / 011 Kp. Ceger, Kel. Jurang Mangu Barat, Kec. Pondok Aren..."
                        className="w-full px-3.5 py-2 text-sm bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5A392C] mb-1.5">
                        Tempat & Tanggal Surat
                      </label>
                      <input
                        type="text"
                        value={profile.letterDate}
                        onChange={(e) => handleProfileChange('letterDate', e.target.value)}
                        placeholder="Tangerang Selatan, 12 Oktober 2022"
                        className="w-full px-3.5 py-2 text-sm bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                      />
                    </div>
                  </div>
                </div>

                {/* Sub-group B: Data Kepala Madrasah (Penandatangan) */}
                <div className="mb-6 pb-5 border-b border-[#EFE4D8]">
                  <div className="text-xs font-bold text-[#6F4B3E] mb-3">
                    B. Yang Bertanda Tangan di Bawah Ini (Kepala Madrasah / Sekolah)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#5A392C] mb-1.5">
                        Nama Lengkap Kepala Madrasah
                      </label>
                      <input
                        type="text"
                        value={profile.headmaster}
                        onChange={(e) => handleProfileChange('headmaster', e.target.value)}
                        placeholder="DAHLIAH, S.Ag."
                        className="w-full px-3.5 py-2 text-sm bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5A392C] mb-1.5">
                        NUPTK / NIP Kepala Madrasah
                      </label>
                      <input
                        type="text"
                        value={profile.headmasterId}
                        onChange={(e) => handleProfileChange('headmasterId', e.target.value)}
                        placeholder="6447752654300042"
                        className="w-full px-3.5 py-2 text-sm font-mono bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5A392C] mb-1.5">
                        Tempat & Tanggal Lahir Kamad
                      </label>
                      <input
                        type="text"
                        value={profile.headmasterBirth}
                        onChange={(e) => handleProfileChange('headmasterBirth', e.target.value)}
                        placeholder="Tangerang, 11 Mei 1967"
                        className="w-full px-3.5 py-2 text-sm bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5A392C] mb-1.5">
                        No. HP Kepala Madrasah
                      </label>
                      <input
                        type="text"
                        value={profile.headmasterPhone}
                        onChange={(e) => handleProfileChange('headmasterPhone', e.target.value)}
                        placeholder="08119793099"
                        className="w-full px-3.5 py-2 text-sm font-mono bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                      />
                    </div>
                  </div>
                </div>

                {/* Sub-group C: Data Guru & Karya Inovasi / Modul */}
                <div>
                  <div className="text-xs font-bold text-[#6F4B3E] mb-3">
                    C. Data Guru & Karya Inovasi / Perangkat Pembelajaran
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="profile-name"
                        className="block text-xs font-semibold text-[#5A392C] mb-1.5"
                      >
                        Nama Lengkap Guru <span className="text-[#C24B3B]">*</span>
                      </label>
                      <input
                        id="profile-name"
                        type="text"
                        value={profile.name}
                        onChange={(e) => handleProfileChange('name', e.target.value)}
                        placeholder="M. FIRMANSYAH"
                        className="w-full px-3.5 py-2 text-sm bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="profile-nip"
                        className="block text-xs font-semibold text-[#5A392C] mb-1.5"
                      >
                        NUPTK / NIP Guru
                      </label>
                      <input
                        id="profile-nip"
                        type="text"
                        value={profile.nip}
                        onChange={(e) => handleProfileChange('nip', e.target.value)}
                        placeholder="4344767668200003"
                        className="w-full px-3.5 py-2 text-sm font-mono bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5A392C] mb-1.5">
                        Tempat & Tanggal Lahir Guru
                      </label>
                      <input
                        type="text"
                        value={profile.teacherBirth}
                        onChange={(e) => handleProfileChange('teacherBirth', e.target.value)}
                        placeholder="Pekalongan, 12 Oktober 1989"
                        className="w-full px-3.5 py-2 text-sm bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="profile-subject"
                        className="block text-xs font-semibold text-[#5A392C] mb-1.5"
                      >
                        Mapel Yang Diampu <span className="text-[#C24B3B]">*</span>
                      </label>
                      <input
                        id="profile-subject"
                        type="text"
                        value={profile.subject}
                        onChange={(e) => handleProfileChange('subject', e.target.value)}
                        placeholder="Guru Kelas / Fiqih / Akidah Akhlak"
                        className="w-full px-3.5 py-2 text-sm bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5A392C] mb-1.5">
                        Kelas / Fase
                      </label>
                      <input
                        type="text"
                        value={profile.grade}
                        onChange={(e) => handleProfileChange('grade', e.target.value)}
                        placeholder="Kelas 6"
                        className="w-full px-3.5 py-2 text-sm bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5A392C] mb-1.5">
                        No. HP Guru
                      </label>
                      <input
                        type="text"
                        value={profile.teacherPhone}
                        onChange={(e) => handleProfileChange('teacherPhone', e.target.value)}
                        placeholder="088809440112"
                        className="w-full px-3.5 py-2 text-sm font-mono bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label
                        htmlFor="profile-topic"
                        className="block text-xs font-semibold text-[#5A392C] mb-1.5"
                      >
                        Judul Karya Inovasi / Modul Pembelajaran
                      </label>
                      <input
                        id="profile-topic"
                        type="text"
                        value={profile.topic}
                        onChange={(e) => handleProfileChange('topic', e.target.value)}
                        placeholder="Modul Pembelajaran Kelas 6 Tema 2 : Persatuan dalam Perbedaan"
                        className="w-full px-3.5 py-2 text-sm bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5A392C] mb-1.5">
                        Jenis Produk
                      </label>
                      <input
                        type="text"
                        value={profile.productType}
                        onChange={(e) => handleProfileChange('productType', e.target.value)}
                        placeholder="Modul / Media Interaktif / LKPD"
                        className="w-full px-3.5 py-2 text-sm bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-[#5A392C] mb-1.5">
                        Link / Tautan Karya (AnyFlip / Google Drive / YouTube)
                      </label>
                      <input
                        type="text"
                        value={profile.productLink}
                        onChange={(e) => handleProfileChange('productLink', e.target.value)}
                        placeholder="https://anyflip.com/dwike/xbuu/"
                        className="w-full px-3.5 py-2 text-sm font-mono bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5A392C] mb-1.5">
                        Periode Tahun Ajaran
                      </label>
                      <input
                        type="text"
                        value={profile.period}
                        onChange={(e) => handleProfileChange('period', e.target.value)}
                        placeholder="2025/2026 - Genap"
                        className="w-full px-3.5 py-2 text-sm bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label
                        htmlFor="profile-experience"
                        className="block text-xs font-semibold text-[#5A392C] mb-1.5"
                      >
                        Pengalaman Faktual, Metode & Praktik Pembelajaran
                      </label>
                      <textarea
                        id="profile-experience"
                        rows={2}
                        value={profile.experience}
                        onChange={(e) => handleProfileChange('experience', e.target.value)}
                        placeholder="Tuliskan pengalaman mengajar nyata, metode pembelajaran, kegiatan KKG/MGMP, dan karya inovasi..."
                        className="w-full px-3.5 py-2 text-sm bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-xs text-[#876D60]">{profileStatus}</div>
              </div>
            </section>

            {/* 02. Pilih & Generate Semua Dokumen RPL */}
            <section
              id="section-dokumen"
              className="relative overflow-hidden bg-[#FFFDF9] border border-[#E7D8C9] rounded-2xl p-6 scroll-mt-20"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 pb-5 mb-5 border-b border-[#EFE4D8]">
                <div>
                  <div className="flex items-center gap-2">
                    <CamelliaBlossomSvg className="w-5 h-5 shrink-0" />
                    <h2 className="font-display text-xl font-bold text-[#3B2820]">
                      02. Generator Dokumen RPL (13 Berkas Lengkap)
                    </h2>
                  </div>
                  <p className="text-xs text-[#876D60] mt-1">
                    Arahkan kursor pada kategori atau kartu dokumen untuk melihat penjelasan berkas.
                    Anda dapat menyusun semua 13 berkas sekaligus atau memilih per dokumen.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <HoverGuide
                    title="Centang Seluruh 13 Berkas"
                    description="Memilih seluruh 13 dokumen RPL pada kategori RPL01 hingga RPL05 sekaligus."
                    position="bottom"
                  >
                    <button
                      type="button"
                      onClick={selectAll13Documents}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#5A392C] bg-[#F5EAE0] hover:bg-[#EAD8C8] rounded-xl transition-colors whitespace-nowrap"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Centang Semua 13</span>
                    </button>
                  </HoverGuide>

                  <HoverGuide
                    title="Pilih Dokumen pada Tab Ini"
                    description="Menambahkan seluruh dokumen yang sedang tampil pada tab kategori aktif ke dalam daftar pilihan."
                    position="bottom"
                  >
                    <button
                      type="button"
                      onClick={selectAllVisible}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#5A392C] bg-[#F5EAE0] hover:bg-[#EAD8C8] rounded-xl transition-colors whitespace-nowrap"
                    >
                      <span>Pilih Kategori Ini</span>
                    </button>
                  </HoverGuide>

                  <HoverGuide
                    title="Hapus Centang Pilihan"
                    description="Mengosongkan centang pilihan dokumen agar Anda dapat memilih satu atau dua berkas tertentu saja."
                    position="bottom"
                  >
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#7E6458] hover:text-[#3B2820] border border-[#E7D8C9] rounded-xl transition-colors whitespace-nowrap"
                    >
                      <Square className="w-3.5 h-3.5" />
                      <span>Bersihkan ({pickedKeys.length})</span>
                    </button>
                  </HoverGuide>
                </div>
              </div>

              {/* Category Filter Tabs & Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-1.5 flex-wrap bg-[#F5ECE2] p-1.5 rounded-xl">
                  <HoverGuide
                    title="Tampilkan Seluruh 13 Dokumen"
                    description="Menampilkan semua jenis dokumen dari kategori RPL01 sampai RPL05 dalam satu daftar lengkap."
                    badge="13 Berkas"
                    position="bottom"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('ALL')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                        selectedCategory === 'ALL'
                          ? 'bg-[#6F4B3E] text-[#FFFDF9]'
                          : 'text-[#6E5346] hover:text-[#3B2820]'
                      }`}
                    >
                      Semua (13)
                    </button>
                  </HoverGuide>

                  {RPL_CATEGORIES.map((cat) => {
                    const active = selectedCategory === cat.code;
                    return (
                      <HoverGuide
                        key={cat.code}
                        title={`${cat.code} — ${cat.name}`}
                        description={cat.hoverDetail}
                        tip={cat.hoverTip}
                        badge={`${cat.documents.length} Dokumen`}
                        position="bottom"
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedCategory(cat.code)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                            active
                              ? 'bg-[#6F4B3E] text-[#FFFDF9]'
                              : 'text-[#6E5346] hover:text-[#3B2820]'
                          }`}
                        >
                          {cat.code} ({cat.documents.length})
                        </button>
                      </HoverGuide>
                    );
                  })}
                </div>

                <div className="relative sm:w-64">
                  <Search className="w-3.5 h-3.5 text-[#876D60] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari jenis berkas RPL..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                  />
                </div>
              </div>

              {/* Document Selection Grid with Hover Popups */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-5">
                {visibleDocuments.map((docSpec) => {
                  const isChecked = pickedKeys.includes(docSpec.key);
                  const existingDraft = drafts[docSpec.key];
                  const wordCount = existingDraft ? countWords(existingDraft.content) : 0;
                  const isThisGenerating = activeGeneratingKey === docSpec.key;

                  return (
                    <HoverGuide
                      key={docSpec.key}
                      title={`${docSpec.categoryCode} · ${docSpec.title}`}
                      description={docSpec.hoverSummary}
                      tip={docSpec.hoverTip}
                      badge={existingDraft ? 'Draf Tersedia' : 'Siap Disusun'}
                      position="top"
                      className="block"
                    >
                      <div
                        onClick={() => togglePickDocument(docSpec.key)}
                        className={`w-full h-full cursor-pointer rounded-2xl border p-4 transition-colors flex flex-col justify-between ${
                          isThisGenerating
                            ? 'border-[#6F4B3E] bg-[#FBF2EE]'
                            : isChecked
                            ? 'border-[#8C6453] bg-[#FDF8F4]'
                            : 'border-[#E7D8C9] bg-[#FCF9F5] hover:border-[#C9B3A1]'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2.5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="mt-1 h-4 w-4 accent-[#6F4B3E] rounded cursor-pointer"
                              />
                              <div>
                                <h3 className="text-sm font-bold text-[#3B2820] leading-snug">
                                  {docSpec.title}
                                </h3>
                                <p className="text-xs text-[#7E6458] mt-1 leading-relaxed">
                                  {docSpec.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Clean Unboxed Metadata Line + Single-Doc Actions */}
                        <div className="mt-3.5 pt-2.5 border-t border-[#EFE4D8] flex items-center justify-between gap-2 text-[11px] text-[#876D60]">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-mono font-semibold text-[#5A392C]">
                              {docSpec.categoryCode}
                            </span>
                            <span aria-hidden="true">·</span>
                            {isThisGenerating ? (
                              <span className="text-[#6F4B3E] font-semibold inline-flex items-center gap-1">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Sedang disusun AI...
                              </span>
                            ) : existingDraft ? (
                              <span className="text-[#3F6A45] font-semibold truncate">
                                ✓ Draf siap ({wordCount} kata)
                              </span>
                            ) : (
                              <span>○ Belum dibuat</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              disabled={isGenerating}
                              onClick={(e) => {
                                e.stopPropagation();
                                executeGenerateKeys([docSpec.key]);
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold text-[#5A392C] bg-[#F4DFE2]/80 hover:bg-[#F4DFE2] disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap"
                            >
                              {existingDraft ? 'Susun Ulang' : 'Generate'}
                            </button>

                            {existingDraft && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectEditDoc(docSpec.key);
                                  scrollToSection('section-editor');
                                }}
                                className="text-[11px] font-semibold text-[#6F4B3E] hover:underline whitespace-nowrap"
                              >
                                Editor →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </HoverGuide>
                  );
                })}
              </div>

              {/* Extra Instructions for AI */}
              <div className="mb-4">
                <label
                  htmlFor="extra-instructions"
                  className="block text-xs font-semibold text-[#5A392C] mb-1.5"
                >
                  Instruksi Khusus untuk Gemini AI (Opsional — Berlaku untuk Semua Dokumen yang
                  Digenerate)
                </label>
                <textarea
                  id="extra-instructions"
                  rows={2}
                  value={extraInstructions}
                  onChange={(e) => setExtraInstructions(e.target.value)}
                  placeholder="Contoh: Gunakan alokasi waktu 2 x 35 menit, sertakan pendekatan pembelajaran berdiferensiasi dan integrasi nilai moderasi beragama / P5-PPRA..."
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                />
              </div>

              {/* Action Buttons Bar */}
              <div className="flex flex-wrap items-center gap-3">
                <HoverGuide
                  title="Generate Seluruh 13 Dokumen RPL Sekaligus"
                  description="Menyusun ke-13 berkas RPL secara otomatis dari awal hingga selesai menggunakan Gemini AI."
                  tip="Anda tetap dapat menghentikan antrean kapan saja di tengah proses."
                  badge="Semua 13 Berkas"
                  position="top"
                >
                  <button
                    type="button"
                    onClick={handleGenerateAll13}
                    disabled={isGenerating}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-[#FFFDF9] bg-[#6F4B3E] hover:bg-[#58392E] disabled:opacity-60 rounded-xl transition-colors whitespace-nowrap"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Wand2 className="w-4 h-4" />
                    )}
                    <span>Generate Semua 13 Dokumen RPL</span>
                  </button>
                </HoverGuide>

                <HoverGuide
                  title="Generate Dokumen yang Dicentang"
                  description={`Hanya menyusun ${pickedKeys.length} dokumen yang Anda beri tanda centang pada daftar di atas.`}
                  position="top"
                >
                  <button
                    type="button"
                    onClick={() => executeGenerateKeys(pickedKeys)}
                    disabled={isGenerating}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#4A2E23] bg-[#F4DFE2] hover:bg-[#EBCAD0] disabled:opacity-60 rounded-xl transition-colors whitespace-nowrap"
                  >
                    <Sparkles className="w-4 h-4 text-[#6F4B3E]" />
                    <span>Generate Dokumen Terpilih ({pickedKeys.length})</span>
                  </button>
                </HoverGuide>

                {isGenerating && (
                  <button
                    type="button"
                    onClick={() => {
                      stopGenerationRef.current = true;
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-[#C24B3B] bg-[#FDF1EF] hover:bg-[#F9DFDB] border border-[#E8C2BC] rounded-xl transition-colors whitespace-nowrap"
                  >
                    <StopCircle className="w-4 h-4" />
                    <span>Hentikan Antrean</span>
                  </button>
                )}

                <HoverGuide
                  title="Unduh Bundel ZIP RPL01–RPL05"
                  description="Mengunduh Surat Keterangan Kepala Madrasah (.pdf/.docx) beserta seluruh draf dalam format .docx dan .txt ke dalam satu file ZIP."
                  position="top"
                >
                  <button
                    type="button"
                    onClick={handleDownloadAllZip}
                    disabled={isExportingZip}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#4F6D52] bg-[#DCE8D8] hover:bg-[#CADBC4] disabled:opacity-60 rounded-xl transition-colors whitespace-nowrap"
                  >
                    <FolderArchive className="w-4 h-4" />
                    <span>Download Semua RPL (ZIP)</span>
                  </button>
                </HoverGuide>
              </div>

              {/* Live Batch Progress Bar */}
              {isGenerating && genProgress.total > 0 && (
                <div className="mt-4 p-3.5 rounded-xl bg-[#FAF1E8] border border-[#E7D8C9]">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#5A392C] mb-1.5">
                    <span>{genStatus.text}</span>
                    <span className="font-mono tabular-nums">
                      {genProgress.current} / {genProgress.total}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#EAD8C8] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#6F4B3E] transition-all duration-200"
                      style={{
                        width: `${Math.round((genProgress.current / genProgress.total) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {!isGenerating && genStatus.text && (
                <div
                  className={`mt-3 text-xs font-medium ${
                    genStatus.type === 'error'
                      ? 'text-[#C24B3B]'
                      : genStatus.type === 'success'
                      ? 'text-[#3F6A45]'
                      : 'text-[#6F4B3E]'
                  }`}
                >
                  {genStatus.text}
                </div>
              )}
            </section>

            {/* 03. Bukti Pendukung */}
            <section
              id="section-bukti"
              className="bg-[#FFFDF9] border border-[#E7D8C9] rounded-2xl p-6 scroll-mt-20"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 pb-5 mb-5 border-b border-[#EFE4D8]">
                <div>
                  <div className="flex items-center gap-2">
                    <CamelliaBlossomSvg className="w-5 h-5 shrink-0" />
                    <h2 className="font-display text-xl font-bold text-[#3B2820]">
                      03. Bukti Pendukung Lokal
                    </h2>
                  </div>
                  <p className="text-xs text-[#876D60] mt-1">
                    Unggah SK, sertifikat, foto kegiatan, PDF, atau DOCX. Berkas disimpan di browser
                    dan otomatis disertakan dalam subfolder Bukti saat mengunduh bundel ZIP.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="upload-category"
                    className="block text-xs font-semibold text-[#5A392C] mb-1.5"
                  >
                    Kategori RPL
                  </label>
                  <select
                    id="upload-category"
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as RplCategory['code'])}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                  >
                    {RPL_CATEGORIES.map((cat) => (
                      <option key={cat.code} value={cat.code}>
                        {cat.code} — {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="evidence-label"
                    className="block text-xs font-semibold text-[#5A392C] mb-1.5"
                  >
                    Nama / Keterangan Bukti
                  </label>
                  <input
                    id="evidence-label"
                    type="text"
                    value={evidenceLabel}
                    onChange={(e) => setEvidenceLabel(e.target.value)}
                    placeholder="Contoh: Surat Keterangan Modul Kelas 6 MI Ishlahuddiniyyah"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.txt"
                  className="flex-1 text-xs text-[#6E5346] file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#F5EAE0] file:text-[#5A392C] hover:file:bg-[#EAD8C8] bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl p-1.5"
                />
                <button
                  type="button"
                  onClick={handleUploadEvidence}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#FFFDF9] bg-[#6F4B3E] hover:bg-[#58392E] rounded-xl transition-colors whitespace-nowrap shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Simpan Bukti di Perangkat</span>
                </button>
              </div>

              {uploadStatus.text && (
                <div
                  className={`mb-4 text-xs font-medium ${
                    uploadStatus.type === 'error' ? 'text-[#C24B3B]' : 'text-[#3F6A45]'
                  }`}
                >
                  {uploadStatus.text}
                </div>
              )}

              {/* Evidence List Table */}
              <div className="border-t border-[#EFE4D8] pt-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-semibold text-[#5A392C]">
                    Daftar Bukti Tersimpan ({filteredEvidence.length})
                  </span>
                  <div className="flex items-center gap-1 bg-[#F5ECE2] p-1 rounded-lg">
                    {(['ALL', 'RPL01', 'RPL02', 'RPL03', 'RPL04', 'RPL05'] as const).map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setEvidenceFilter(code)}
                        className={`px-2 py-1 text-[11px] font-semibold rounded transition-colors whitespace-nowrap ${
                          evidenceFilter === code
                            ? 'bg-[#FFFDF9] text-[#3B2820]'
                            : 'text-[#7E6458] hover:text-[#3B2820]'
                        }`}
                      >
                        {code === 'ALL' ? 'Semua' : code}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredEvidence.length === 0 ? (
                  <div className="py-8 text-center bg-[#FCF9F5] border border-dashed border-[#DFCBB8] rounded-xl">
                    <p className="text-xs text-[#876D60]">
                      Belum ada berkas bukti pendukung pada tampilan ini.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-[#E7D8C9] rounded-xl">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#E7D8C9] bg-[#FAF3EB] text-[11px] font-semibold text-[#6E5346]">
                          <th className="py-2.5 px-3.5">Label & Nama Berkas</th>
                          <th className="py-2.5 px-3.5">Kategori</th>
                          <th className="py-2.5 px-3.5 text-right">Ukuran</th>
                          <th className="py-2.5 px-3.5 text-right">Tindakan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EFE4D8] text-xs">
                        {filteredEvidence.map((item) => (
                          <tr key={item.id} className="hover:bg-[#FCF9F5]">
                            <td className="py-2.5 px-3.5">
                              <div className="font-semibold text-[#3B2820]">{item.label}</div>
                              <div className="text-[11px] text-[#876D60] truncate max-w-md">
                                {item.name}
                              </div>
                            </td>
                            <td className="py-2.5 px-3.5 font-mono text-xs text-[#5A392C]">
                              {item.category}
                            </td>
                            <td className="py-2.5 px-3.5 text-right font-mono text-xs text-[#7E6458] tabular-nums">
                              {formatBytes(item.size)}
                            </td>
                            <td className="py-2.5 px-3.5 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveEvidence(item.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#C24B3B] hover:bg-[#FDF2F0] rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Hapus</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>

            {/* 04. AI Document Checker */}
            <section
              id="section-checker"
              className="bg-[#FFFDF9] border border-[#E7D8C9] rounded-2xl p-6 scroll-mt-20"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 pb-5 mb-5 border-b border-[#EFE4D8]">
                <div>
                  <div className="flex items-center gap-2">
                    <CamelliaBlossomSvg className="w-5 h-5 shrink-0" />
                    <h2 className="font-display text-xl font-bold text-[#3B2820]">
                      04. Pemeriksa Awal Dokumen AI
                    </h2>
                  </div>
                  <p className="text-xs text-[#876D60] mt-1">
                    Pemeriksaan mandiri terhadap kelengkapan struktur draf dan kecocokan daftar bukti
                    pendukung sebelum diserahkan kepada asesor.
                  </p>
                </div>
              </div>

              {draftKeys.length === 0 ? (
                <div className="py-8 px-4 text-center bg-[#FCF9F5] border border-dashed border-[#DFCBB8] rounded-xl">
                  <p className="text-xs text-[#876D60] mb-3">
                    Belum ada draf dokumen yang tersedia untuk diperiksa. Klik tombol di bawah untuk
                    menyusun seluruh dokumen RPL terlebih dahulu.
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerateAll13}
                    disabled={isGenerating}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#4A2E23] bg-[#F4DFE2] hover:bg-[#EBCAD0] rounded-xl transition-colors"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Generate Semua 13 Dokumen RPL</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="check-doc-select"
                        className="block text-xs font-semibold text-[#5A392C] mb-1.5"
                      >
                        Pilih Draf Dokumen
                      </label>
                      <select
                        id="check-doc-select"
                        value={checkDocKey}
                        onChange={(e) => setCheckDocKey(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                      >
                        {draftKeys.map((k) => (
                          <option key={k} value={k}>
                            {drafts[k].category} · {drafts[k].title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="check-notes"
                        className="block text-xs font-semibold text-[#5A392C] mb-1.5"
                      >
                        Catatan / Fokus Pemeriksaan (Opsional)
                      </label>
                      <input
                        id="check-notes"
                        type="text"
                        value={checkNotes}
                        onChange={(e) => setCheckNotes(e.target.value)}
                        placeholder="Contoh: Periksa kesesuaian Surat Keterangan dan tujuan pembelajaran..."
                        className="w-full px-3.5 py-2.5 text-sm bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleCheckDocument}
                      disabled={isChecking}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-[#FFFDF9] bg-[#6F4B3E] hover:bg-[#58392E] disabled:opacity-60 rounded-xl transition-colors whitespace-nowrap"
                    >
                      {isChecking ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <FileCheck2 className="w-4 h-4" />
                      )}
                      <span>{isChecking ? 'Memeriksa Draf...' : 'Periksa dengan Gemini AI'}</span>
                    </button>

                    {checkResult && (
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(checkResult);
                          setCopiedCheck(true);
                          setTimeout(() => setCopiedCheck(false), 2000);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#5A392C] bg-[#F5EAE0] hover:bg-[#EAD8C8] rounded-xl transition-colors whitespace-nowrap"
                      >
                        {copiedCheck ? (
                          <Check className="w-3.5 h-3.5 text-[#3F6A45]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedCheck ? 'Tersalin' : 'Salin Hasil Review'}</span>
                      </button>
                    )}
                  </div>

                  {checkStatus.text && (
                    <div
                      className={`text-xs font-medium ${
                        checkStatus.type === 'error'
                          ? 'text-[#C24B3B]'
                          : checkStatus.type === 'success'
                          ? 'text-[#3F6A45]'
                          : 'text-[#6F4B3E]'
                      }`}
                    >
                      {checkStatus.text}
                    </div>
                  )}

                  <div className="bg-[#FCF9F5] border border-[#E7D8C9] rounded-xl p-4 min-h-[140px] whitespace-pre-wrap text-xs sm:text-sm text-[#3B2820] leading-relaxed">
                    {checkResult ||
                      'Hasil pemeriksaan komponen, status bukti pendukung, dan rekomendasi perbaikan akan tampil di sini.'}
                  </div>
                </div>
              )}
            </section>

            {/* 05. Pratinjau Format Surat Resmi & Editor Dokumen */}
            <section
              id="section-editor"
              className="bg-[#FFFDF9] border border-[#E7D8C9] rounded-2xl p-6 scroll-mt-20"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 pb-5 mb-5 border-b border-[#EFE4D8]">
                <div>
                  <div className="flex items-center gap-2">
                    <CamelliaBlossomSvg className="w-5 h-5 shrink-0" />
                    <h2 className="font-display text-xl font-bold text-[#3B2820]">
                      05. Format Surat Keterangan Resmi & Editor Ekspor (DOCX / PDF)
                    </h2>
                  </div>
                  <p className="text-xs text-[#876D60] mt-1">
                    Lihat pratinjau Surat Keterangan Kepala Madrasah sesuai contoh PDF atau sunting
                    naskah lengkap 13 berkas RPL.
                  </p>
                </div>

                {/* Mode Switch Tabs: Official Letter Preview vs Text Draft Editor */}
                <div className="flex items-center gap-1.5 bg-[#F5ECE2] p-1.5 rounded-xl shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditorTab('official_letter')}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                      editorTab === 'official_letter'
                        ? 'bg-[#6F4B3E] text-[#FFFDF9]'
                        : 'text-[#6E5346] hover:text-[#3B2820]'
                    }`}
                  >
                    Format Surat Keterangan Resmi
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorTab('draft_editor')}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                      editorTab === 'draft_editor'
                        ? 'bg-[#6F4B3E] text-[#FFFDF9]'
                        : 'text-[#6E5346] hover:text-[#3B2820]'
                    }`}
                  >
                    Editor 13 Draf RPL ({draftKeys.length})
                  </button>
                </div>
              </div>

              {editorTab === 'official_letter' ? (
                <OfficialLetterPreview
                  profile={profile}
                  onExportDocx={handleExportOfficialLetterDocx}
                  onExportPdf={handleExportOfficialLetterPdf}
                />
              ) : (
                <div className="space-y-4">
                  {/* Manual Template Creator Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF2EA] border border-[#E7D8C9] rounded-xl p-3">
                    <span className="text-xs text-[#5A392C]">
                      Ingin membuat kerangka Surat Keterangan & Dokumen manual?
                    </span>
                    <div className="flex items-center gap-2">
                      <select
                        value={manualDocKeyToInit}
                        onChange={(e) => setManualDocKeyToInit(e.target.value)}
                        aria-label="Pilih jenis dokumen untuk dibuat manual"
                        className="px-2.5 py-1.5 text-xs bg-[#FFFDF9] border border-[#DFCBB8] rounded-lg focus:outline-none focus:border-[#6F4B3E]"
                      >
                        {ALL_DOCUMENTS.map((doc) => (
                          <option key={doc.key} value={doc.key}>
                            {doc.categoryCode} · {doc.title}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleCreateManualDraft}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#5A392C] bg-[#F4DFE2] hover:bg-[#EBCAD0] rounded-lg transition-colors whitespace-nowrap shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Buat Kerangka</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <label
                        htmlFor="edit-doc-select"
                        className="block text-xs font-semibold text-[#5A392C] mb-1.5"
                      >
                        Pilih Draf yang Sedang Diedit ({draftKeys.length}/13 Tersedia)
                      </label>
                      <select
                        id="edit-doc-select"
                        value={editDocKey}
                        onChange={(e) => handleSelectEditDoc(e.target.value)}
                        disabled={draftKeys.length === 0}
                        className="w-full px-3.5 py-2.5 text-sm bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E] disabled:opacity-60"
                      >
                        {draftKeys.length === 0 ? (
                          <option value="">Belum ada draf tersedia</option>
                        ) : (
                          draftKeys.map((k) => (
                            <option key={k} value={k}>
                              {drafts[k].category} · {drafts[k].title}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    {/* Live Document Metrics */}
                    {editDocKey && drafts[editDocKey] && (
                      <div className="flex items-center gap-3 text-xs text-[#7E6458] sm:pt-5 shrink-0">
                        <span className="font-mono tabular-nums">
                          {countWords(editorContent)} kata
                        </span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={`font-mono tabular-nums ${
                            countPlaceholders(editorContent) > 0
                              ? 'text-[#B06525] font-semibold'
                              : 'text-[#3F6A45]'
                          }`}
                        >
                          {countPlaceholders(editorContent)} bagian perlu dilengkapi
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="draft-editor-textarea"
                      className="block text-xs font-semibold text-[#5A392C] mb-1.5"
                    >
                      Isi Dokumen
                    </label>
                    <textarea
                      id="draft-editor-textarea"
                      rows={15}
                      value={editorContent}
                      onChange={(e) => setEditorContent(e.target.value)}
                      placeholder="Klik 'Generate Semua 13 Dokumen RPL' di atas untuk menyusun seluruh berkas dengan Gemini AI, atau klik 'Buat Kerangka'..."
                      className="w-full p-4 text-xs sm:text-sm font-mono leading-relaxed bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      disabled={!editDocKey}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-[#FFFDF9] bg-[#6F4B3E] hover:bg-[#58392E] disabled:opacity-50 rounded-xl transition-colors whitespace-nowrap"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Simpan Perubahan</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportDocx}
                      disabled={!editDocKey}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-[#4A2E23] bg-[#F4DFE2] hover:bg-[#EBCAD0] disabled:opacity-50 rounded-xl transition-colors whitespace-nowrap"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Export DOCX (+ Kop Madrasah)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportPdf}
                      disabled={!editDocKey}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-[#4F6D52] bg-[#DCE8D8] hover:bg-[#CADBC4] disabled:opacity-50 rounded-xl transition-colors whitespace-nowrap"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Export PDF (+ Kop Madrasah)</span>
                    </button>

                    <button
                      type="button"
                      disabled={!editorContent}
                      onClick={() => {
                        navigator.clipboard.writeText(editorContent);
                        setCopiedEditor(true);
                        setTimeout(() => setCopiedEditor(false), 2000);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-[#6E5346] hover:text-[#3B2820] border border-[#E7D8C9] disabled:opacity-50 rounded-xl transition-colors whitespace-nowrap"
                    >
                      {copiedEditor ? (
                        <Check className="w-3.5 h-3.5 text-[#3F6A45]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedEditor ? 'Disalin' : 'Salin Teks'}</span>
                    </button>
                  </div>
                </div>
              )}

              {editStatus && (
                <div className="mt-3 text-xs font-medium text-[#3F6A45]">{editStatus}</div>
              )}
            </section>
          </main>
        </div>
      </div>

      {/* Quiet Floral Choco Latte Footer */}
      <footer className="border-t border-[#E7D8C9] bg-[#F7EFE6]/80 py-6 px-6 mt-12">
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#876D60]">
          <div className="flex items-center gap-2">
            <CamelliaBlossomSvg className="w-4 h-4 shrink-0" />
            <span>
              RPLumi — Asisten Penyusunan 13 Berkas RPL PPG Daljab · Penyimpanan lokal browser
            </span>
          </div>
          <div>
            Bukan aplikasi resmi Kemenag / LPTK. Pastikan selalu memverifikasi berkas dengan rubrik
            resmi terbaru.
          </div>
        </div>
      </footer>
    </div>
  );
}
