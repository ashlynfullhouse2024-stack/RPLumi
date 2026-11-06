import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronUp,
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
  Settings2,
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
  CamelliaBlossomSvg,
  FloralAmbientBackdrop,
  FloralCornerWatermark,
} from './components/FloralOrnaments';
import {
  FieldLabelWithGuide,
  HoverGuide,
  OnboardingWorkflowBar,
  WorkflowStepItem,
  WorkspaceTabId,
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

const STORAGE_KEY = 'rplumi_simple_v2';
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
  // Active Main Workspace Tab (prevents long vertical scrolling)
  const [activeTab, setActiveTab] = useState<WorkspaceTabId>('profil');

  // Toggle for Optional Kop Surat & Headmaster Details in Profile Tab
  const [showAdvancedKop, setShowAdvancedKop] = useState<boolean>(false);

  // Mobile Sidebar Accordion Toggle
  const [showMobileProgress, setShowMobileProgress] = useState<boolean>(false);

  // Teacher Profile — initialized with fictional school & teacher sample
  const [profile, setProfile] = useState<TeacherProfile>(SAMPLE_PROFILE);
  const [profileStatus, setProfileStatus] = useState<string>(
    'Perubahan tersimpan otomatis di browser perangkat ini.'
  );

  // Gemini Model Selection
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

  // Load initial state from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.profile && parsed.profile.name) {
        // Ensure any old real PDF name is replaced with fictional sample
        const isOldRealName =
          String(parsed.profile.school || '').toUpperCase().includes('ISHLAHUDDINIYYAH') ||
          String(parsed.profile.name || '').toUpperCase().includes('FIRMANSYAH');
        if (!isOldRealName) {
          setProfile((prev) => ({ ...prev, ...parsed.profile }));
        }
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
    setProfileStatus('Tersimpan otomatis di perangkat ini.');
  };

  const handleLoadSampleProfile = () => {
    setProfile(SAMPLE_PROFILE);
    persistState(SAMPLE_PROFILE, drafts, evidence);
    setProfileStatus(
      'Contoh data fiktif (MI Nurul Azhar Harapan — Kota Bunga Raya) berhasil dimuat.'
    );
  };

  const handleClearProfile = () => {
    setProfile(EMPTY_PROFILE);
    persistState(EMPTY_PROFILE, drafts, evidence);
    setProfileStatus('Formulir profil guru dikosongkan.');
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
        text: 'Lengkapi Nama Guru, Nama Madrasah/Sekolah, dan Mata Pelajaran terlebih dahulu.',
      });
      setActiveTab('profil');
      return;
    }

    setActiveTab('dokumen');
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
            text: `Dihentikan. ${completedCount} dari ${keysToGenerate.length} dokumen telah tersimpan.`,
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
      }

      if (!stopGenerationRef.current) {
        setGenStatus({
          type: 'success',
          text: `Selesai! ${completedCount} dokumen RPL berhasil disusun. Klik tab "Surat Resmi & Ekspor" untuk melihat atau mengunduh.`,
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
        text: 'Seluruh 13 dokumen RPL sudah tersedia!',
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
        text: 'Pilih berkas bukti terlebih dahulu.',
      });
      return;
    }

    const newItems: EvidenceItem[] = [];
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        setUploadStatus({
          type: 'error',
          text: `Berkas "${file.name}" melebihi batas 10 MB.`,
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
        text: `${newItems.length} berkas bukti disimpan untuk ${uploadCategory}.`,
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
    setActiveTab('ekspor');
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

    const templateContent = `${profile.foundationName || 'YAYASAN PENDIDIKAN ISLAM CAHAYA BUNGA NUSANTARA'}
${profile.school || 'MI. NURUL AZHAR HARAPAN'}
STATUS : ${profile.accreditation || 'TERAKREDITASI "A"'}
NSM : ${profile.nsm || '111235009988'}   NPSN : ${profile.npsn || '60799887'}
${profile.schoolAddress || 'Jl. Melati Indah No. 45 RT. 002 / RW. 005 Kel. Sukamaju, Kec. Lembah Asri, Kota Bunga Raya 12345'}
====================================================================

SURAT KETERANGAN
Nomor : ${profile.letterNumber || '012 / S.Ket / MI-NAH / III / 2026'}

Yang bertanda tangan di bawah ini :
Nama Lengkap            : ${profile.headmaster || 'Hj. SITI NURHALIZA, M.Pd.I.'}
NUPTK                   : ${profile.headmasterId || '1234567890123456'}
Tempat dan Tanggal Lahir: ${profile.headmasterBirth || 'Kota Bunga Raya, 10 April 1975'}
Jabatan                 : ${profile.headmasterPosition || 'Kepala Madrasah'}
Tempat Tugas            : ${profile.school || 'MI. NURUL AZHAR HARAPAN'}
Alamat Madrasah         : ${profile.schoolAddress || '-'}
No. HP                  : ${profile.headmasterPhone || '081200001111'}

Menyatakan dengan sesungguhnya, bahwa :
Nama Lengkap            : ${profile.name || 'AHMAD RASYID, S.Pd.'}
NUPTK                   : ${profile.nip || '9876543210987654'}
Tempat dan Tanggal Lahir: ${profile.teacherBirth || 'Lembah Asri, 22 Agustus 1992'}
Mapel Yang Diampu       : ${profile.subject || 'Guru Kelas'}
Tempat Tugas            : ${profile.school || 'MI. NURUL AZHAR HARAPAN'}
No. HP                  : ${profile.teacherPhone || '085700002222'}

Nama tersebut di atas adalah benar merupakan guru yang bertugas di ${profile.school || 'MI. NURUL AZHAR HARAPAN'} yang telah menyusun berkas ${spec.categoryCode} (${spec.title}) berupa :
Judul                   : ${profile.topic || spec.title}
Jenis Produk            : ${profile.productType || 'Modul'}
Link / Tautan           : ${profile.productLink || 'https://contoh-portofolio-guru.id/modul-ekosistem'}

Demikian surat keterangan ini saya buat dengan sebenar-benarnya dan penuh tanggung jawab, agar dapat dipergunakan sebagaimana mestinya.

${profile.letterDate || 'Kota Bunga Raya, 15 Maret 2026'}
${profile.headmasterPosition || 'Kepala Madrasah'}


${profile.headmaster || 'Hj. SITI NURHALIZA, M.Pd.I.'}
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
    setEditStatus(`Kerangka "${spec.title}" berhasil dibuat.`);
  };

  const handleExportDocx = async () => {
    if (!editDocKey || !drafts[editDocKey]) return;
    try {
      const currentDraft: DraftRecord = {
        ...drafts[editDocKey],
        content: editorContent,
      };
      await exportDraftToDocx(editDocKey, currentDraft, profile);
      setEditStatus(`Berkas ${editDocKey}.docx berhasil diunduh.`);
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
      setEditStatus(`Berkas ${editDocKey}.pdf berhasil diunduh.`);
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
        text: 'Portofolio ZIP (Surat Keterangan + folder RPL01–RPL05) berhasil diunduh.',
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
    setProfileStatus('Cadangan JSON berhasil diunduh.');
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
      setProfileStatus('Cadangan data berhasil dipulihkan.');
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

  // 4-Step Compact Tabbed Workflow
  const workflowSteps: WorkflowStepItem[] = useMemo(
    () => [
      {
        stepNumber: '01',
        id: 'profil',
        title: 'Profil Ringkas',
        shortDesc: 'Data guru & topik karya',
        badgeText: isProfileFilled ? 'Data siap ✓' : 'Isi 5 data inti',
        hoverTitle: 'Langkah 1: Isi Profil Ringkas Guru',
        hoverDetail:
          'Hanya 5 kolom utama yang perlu diisi (Nama Guru, Nama Sekolah/Madrasah, Jenjang/Kelas, Mapel, dan Judul Karya). Pengaturan Kop Surat bersifat opsional.',
        hoverTip:
          'Contoh data fiktif (MI Nurul Azhar Harapan) sudah terisi agar Anda bisa langsung mencoba!',
        isCompleted: isProfileFilled,
      },
      {
        stepNumber: '02',
        id: 'dokumen',
        title: 'Buat 13 Berkas',
        shortDesc: 'Generate otomatis dengan AI',
        badgeText: `${completedDocsCount}/13 berkas selesai`,
        hoverTitle: 'Langkah 2: Generate 13 Dokumen RPL dengan Gemini AI',
        hoverDetail:
          'Susun seluruh 13 dokumen wajib (SK, RPP, Materi, LKPD, Media, Instrumen Penilaian, Portofolio, Administrasi, dan Inovasi) sekaligus dengan 1 klik.',
        hoverTip: 'Anda juga bisa menekan tombol Generate pada satu dokumen tertentu saja.',
        isCompleted: completedDocsCount === totalDocsCount,
      },
      {
        stepNumber: '03',
        id: 'bukti_cek',
        title: 'Bukti & Cek AI',
        shortDesc: 'Lampirkan file & periksa draf',
        badgeText: `${evidence.length} file bukti`,
        hoverTitle: 'Langkah 3: Lampirkan Bukti & Pemeriksa AI',
        hoverDetail:
          'Unggah scan SK/sertifikat lokal untuk disertakan ke dalam ZIP, atau gunakan Pemeriksa AI untuk mengecek kelengkapan draf.',
        hoverTip: 'Langkah ini opsional namun sangat membantu kelengkapan portofolio.',
        isCompleted: evidence.length > 0 || Boolean(checkResult),
      },
      {
        stepNumber: '04',
        id: 'ekspor',
        title: 'Surat Resmi & Unduh',
        shortDesc: 'Surat Keterangan, DOCX & PDF',
        badgeText: 'Siap cetak & unduh',
        hoverTitle: 'Langkah 4: Surat Keterangan Resmi & Ekspor Berkas',
        hoverDetail:
          'Lihat pratinjau Surat Keterangan Kepala Madrasah ber-Kop Madrasah atau sunting ke-13 draf dokumen, lalu ekspor ke Word (.docx), PDF, atau ZIP.',
        hoverTip: 'Contoh surat sudah menggunakan nama sekolah dan alamat fiktif.',
        isCompleted: true,
      },
    ],
    [isProfileFilled, completedDocsCount, totalDocsCount, evidence.length, checkResult]
  );

  const filteredEvidence = useMemo(() => {
    if (evidenceFilter === 'ALL') return evidence;
    return evidence.filter((item) => item.category === evidenceFilter);
  }, [evidence, evidenceFilter]);

  return (
    <div className="relative min-h-screen flex flex-col text-[#3B2820]">
      {/* Full-Screen Shadowy Floral Backdrop ("di belakang screen seperti berbayang") */}
      <FloralAmbientBackdrop imagePath={HERO_IMAGE_PATH} />

      {/* Top Bar Contract: Zone 1 Brand Wordmark — Zone 2 Concise Nav Links — Zone 3 Primary CTA */}
      <header className="sticky top-0 z-30 bg-[#FFFDF9]/90 backdrop-blur-md border-b border-[#E7D8C9]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4 sm:gap-8">
          <HoverGuide
            title="Beranda RPLumi — Asisten Berkas RPL PPG"
            description="Klik logo ini untuk kembali ke Langkah 1 (Profil Ringkas Guru) kapan saja."
            badge="Beranda"
            position="bottom"
          >
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('profil');
              }}
              className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#5A392C] whitespace-nowrap shrink-0"
            >
              RPLumi
            </a>
          </HoverGuide>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#75584B]">
            <HoverGuide
              title="Poin 1 · Profil Ringkas Guru"
              description="Isi 6 data utama guru dan topik karya inovasi tanpa formulir panjang."
              tip="Contoh data sekolah fiktif sudah tersedia agar Anda bisa langsung mencoba."
              badge="Langkah 01"
              position="bottom"
            >
              <button
                type="button"
                onClick={() => setActiveTab('profil')}
                className={`hover:text-[#3B2820] transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'profil' ? 'text-[#3B2820] font-bold underline underline-offset-8' : ''
                }`}
              >
                Profil Guru
              </button>
            </HoverGuide>

            <HoverGuide
              title="Poin 2 · Generator 13 Dokumen RPL"
              description="Susun otomatis seluruh 13 berkas RPL sekaligus atau per kategori menggunakan Gemini AI."
              tip="Klik 'Generate Semua 13' untuk menyusun semua berkas secara berurutan."
              badge="Langkah 02"
              position="bottom"
            >
              <button
                type="button"
                onClick={() => setActiveTab('dokumen')}
                className={`hover:text-[#3B2820] transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'dokumen'
                    ? 'text-[#3B2820] font-bold underline underline-offset-8'
                    : ''
                }`}
              >
                Buat Dokumen ({completedDocsCount}/13)
              </button>
            </HoverGuide>

            <HoverGuide
              title="Poin 3 · Bukti & Pemeriksa AI"
              description="Lampirkan berkas bukti pendukung lokal dan periksa kesiapan draf dengan AI."
              tip="Semua file bukti yang Anda lampirkan otomatis masuk ke bundel ZIP."
              badge="Langkah 03"
              position="bottom"
            >
              <button
                type="button"
                onClick={() => setActiveTab('bukti_cek')}
                className={`hover:text-[#3B2820] transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'bukti_cek'
                    ? 'text-[#3B2820] font-bold underline underline-offset-8'
                    : ''
                }`}
              >
                Bukti & Cek AI
              </button>
            </HoverGuide>

            <HoverGuide
              title="Poin 4 · Surat Resmi & Ekspor"
              description="Lihat contoh Surat Keterangan ber-Kop Madrasah (dengan nama sekolah & alamat fiktif) serta ekspor ke Word (.docx) dan PDF."
              tip="Format dokumen siap dicetak di kertas A4."
              badge="Langkah 04"
              position="bottom"
            >
              <button
                type="button"
                onClick={() => setActiveTab('ekspor')}
                className={`hover:text-[#3B2820] transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'ekspor'
                    ? 'text-[#3B2820] font-bold underline underline-offset-8'
                    : ''
                }`}
              >
                Surat Resmi & Ekspor
              </button>
            </HoverGuide>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <HoverGuide
              title="Unduh Bundel Portofolio Lengkap (ZIP)"
              description="Mengunduh Surat Keterangan Resmi (.pdf & .docx) beserta seluruh draf RPL01–RPL05 dan lampiran bukti dalam satu file ZIP."
              tip="Sangat praktis untuk mengarsipkan seluruh portofolio sekaligus."
              badge="Ekspor ZIP"
              position="bottom"
            >
              <button
                type="button"
                onClick={handleDownloadAllZip}
                disabled={isExportingZip}
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-semibold text-[#FFFDF9] bg-[#6F4B3E] hover:bg-[#58392E] disabled:opacity-60 rounded-xl transition-colors whitespace-nowrap shrink-0"
              >
                {isExportingZip ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FolderArchive className="w-3.5 h-3.5" />
                )}
                <span>Unduh ZIP</span>
              </button>
            </HoverGuide>
          </div>
        </div>
      </header>

      {/* Main Content Container (above shadowy floral screen backdrop) */}
      <div id="top" className="relative z-10 max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 flex-1">
        {/* Calm, Understated Hero Banner with Soft Shadowy Floral Backdrop */}
        <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[#E5D3C2] bg-gradient-to-br from-[#FAF3EB]/92 via-[#F5E9DD]/90 to-[#EFE0D2]/90 text-[#4A3127] mb-5 shadow-xs backdrop-blur-xs">
          {/* Shadowy floral image & silhouette behind the hero banner */}
          <div
            className="absolute inset-0 bg-cover bg-right bg-no-repeat opacity-[0.15] mix-blend-multiply blur-[1.5px] pointer-events-none"
            style={{ backgroundImage: `url('${HERO_IMAGE_PATH}')` }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#FDF8F2]/92 via-[#FAF1E6]/82 to-[#F5E6D8]/70 pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-[11px] sm:text-xs font-medium text-[#7D5E4F] mb-1.5">
                <CamelliaBlossomSvg className="w-4 h-4 shrink-0" />
                <span>Ruang Kerja Administrasi Pendidik</span>
                <span aria-hidden="true">·</span>
                <span>RA / MI / MTs / MA</span>
              </div>

              <h1
                className="font-display text-lg sm:text-xl lg:text-2xl font-semibold tracking-tight text-[#432B21] leading-snug mb-1.5"
                style={{ textWrap: 'balance' }}
              >
                Pendamping Penyusunan Perangkat & Dokumentasi Pembelajaran
              </h1>

              <p className="text-xs sm:text-sm text-[#6E5346] leading-relaxed">
                Menata kelengkapan perangkat ajar, catatan profesi, serta surat keterangan madrasah
                secara bertahap dan rapi. Arahkan kursor ke setiap poin untuk melihat petunjuk.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <HoverGuide
                title="Susun Seluruh Dokumen Portofolio"
                description="Menyusun ke-13 draf dokumen perangkat dan portofolio secara berurutan sesuai profil pendidik."
                tip="Jika profil belum diubah, sistem akan menggunakan contoh data fiktif yang tersedia."
                badge="Otomatis"
                position="bottom"
              >
                <button
                  type="button"
                  onClick={handleGenerateAll13}
                  disabled={isGenerating}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold bg-[#6F4B3E] hover:bg-[#5A3B30] text-[#FFFDF9] disabled:opacity-60 rounded-xl transition-colors whitespace-nowrap shadow-xs"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#F6DFE2]" />
                  ) : (
                    <Wand2 className="w-4 h-4 text-[#F6DFE2]" />
                  )}
                  <span>
                    {isGenerating
                      ? `Menyusun (${genProgress.current}/${genProgress.total})...`
                      : 'Susun Semua Dokumen'}
                  </span>
                </button>
              </HoverGuide>

              <HoverGuide
                title="Pratinjau Format Surat Keterangan"
                description="Membuka halaman contoh format Surat Keterangan ber-Kop Madrasah (menggunakan identitas sekolah & alamat fiktif) yang siap diunduh ke PDF atau Word."
                tip="Anda dapat menyesuaikan identitas madrasah pada Poin 01."
                badge="Format Surat"
                position="bottom"
              >
                <button
                  type="button"
                  onClick={() => {
                    setEditorTab('official_letter');
                    setActiveTab('ekspor');
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-semibold bg-[#FFFDF9]/85 hover:bg-[#FFFDF9] text-[#5A392C] border border-[#DCC6B2] rounded-xl transition-colors whitespace-nowrap"
                >
                  <Eye className="w-4 h-4 text-[#6F4B3E]" />
                  <span>Pratinjau Format Surat</span>
                </button>
              </HoverGuide>
            </div>
          </div>
        </section>

        {/* 4-Step Compact Tabbed Navigation Bar with Live Guide Strip */}
        <OnboardingWorkflowBar
          steps={workflowSteps}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onLoadSampleProfile={handleLoadSampleProfile}
          onGenerateAll13={handleGenerateAll13}
        />

        {/* Workspace Grid: Focused Active Tab on Left/Main + Compact Progress Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_290px] gap-6 items-start">
          {/* Main Active Workspace Panel (Only 1 Tab Shown at a Time!) */}
          <main className="min-w-0">
            {/* TAB 1: PROFIL RINGKAS (Simple 6 core inputs + optional Kop accordion) */}
            {activeTab === 'profil' && (
              <section className="relative bg-[#FFFDF9]/92 backdrop-blur-xs border border-[#E7D8C9] rounded-2xl p-5 sm:p-6 shadow-xs">
                <FloralCornerWatermark className="w-32 h-32 absolute top-0 right-0" />

                <div className="relative z-10">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-[#EFE4D8]">
                    <div>
                      <div className="flex items-center gap-2">
                        <CamelliaBlossomSvg className="w-5 h-5 shrink-0" />
                        <h2 className="font-display text-lg sm:text-xl font-bold text-[#3B2820]">
                          Poin 1 · Profil Ringkas Guru
                        </h2>
                      </div>
                      <p className="text-xs text-[#876D60] mt-0.5">
                        Arahkan kursor ke label <strong>Petunjuk</strong> pada setiap isian untuk
                        melihat penjelasan fungsinya.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <HoverGuide
                        title="Muat Contoh Data Sekolah Fiktif"
                        description="Mengisi otomatis seluruh kolom dengan identitas fiktif (MI. Nurul Azhar Harapan, Kota Bunga Raya, Guru Ahmad Rasyid, S.Pd.) untuk uji coba cepat."
                        tip="Gunakan tombol ini jika Anda ingin langsung mencoba fitur Generate AI."
                        badge="Data Contoh"
                        position="top"
                      >
                        <button
                          type="button"
                          onClick={handleLoadSampleProfile}
                          className="px-3 py-1.5 text-xs font-semibold text-[#4A2E23] bg-[#F5DFE2] hover:bg-[#EED0D5] rounded-xl transition-colors whitespace-nowrap"
                        >
                          Isi Contoh Fiktif
                        </button>
                      </HoverGuide>

                      <HoverGuide
                        title="Kosongkan Formulir Profil"
                        description="Menghapus isian profil saat ini agar Anda dapat mengetik identitas Bapak/Ibu Guru sendiri dari awal."
                        tip="Draf dokumen yang sudah dibuat sebelumnya tidak akan ikut terhapus."
                        badge="Reset Form"
                        position="top"
                      >
                        <button
                          type="button"
                          onClick={handleClearProfile}
                          className="px-3 py-1.5 text-xs font-semibold text-[#7E6458] hover:text-[#3B2820] border border-[#E7D8C9] rounded-xl transition-colors whitespace-nowrap"
                        >
                          Kosongkan
                        </button>
                      </HoverGuide>
                    </div>
                  </div>

                  {/* Core Simple Fields (Only 6 essential inputs, each with Petunjuk popup!) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <FieldLabelWithGuide
                        label="Nama Lengkap Guru"
                        required
                        guideTitle="Isian Nama Lengkap & Gelar Guru"
                        guideDesc="Tuliskan nama lengkap Bapak/Ibu Guru beserta gelar akademik. Nama ini akan tercantum otomatis di seluruh 13 berkas RPL dan Surat Keterangan."
                        guideTip="Contoh: Ahmad Rasyid, S.Pd. atau Siti Aminah, S.Pd.I."
                      />
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => handleProfileChange('name', e.target.value)}
                        placeholder="Contoh: Ahmad Rasyid, S.Pd."
                        className="w-full px-3.5 py-2.5 text-sm bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                      />
                    </div>

                    <div>
                      <FieldLabelWithGuide
                        label="Nama Madrasah / Sekolah"
                        required
                        guideTitle="Isian Nama Satuan Pendidikan (Madrasah/Sekolah)"
                        guideDesc="Tuliskan nama RA, MI, MTs, atau MA tempat Bapak/Ibu bertugas. Digunakan pada Kop Surat dan identitas instansi di seluruh dokumen."
                        guideTip="Saat ini menggunakan contoh fiktif: MI. NURUL AZHAR HARAPAN."
                      />
                      <input
                        type="text"
                        value={profile.school}
                        onChange={(e) => handleProfileChange('school', e.target.value)}
                        placeholder="Contoh: MI. Nurul Azhar Harapan"
                        className="w-full px-3.5 py-2.5 text-sm bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <FieldLabelWithGuide
                          label="Jenjang"
                          guideTitle="Pilih Jenjang Madrasah"
                          guideDesc="Pilih jenjang satuan pendidikan (RA, MI, MTs, atau MA) agar struktur kurikulum, CP/TP, dan bahasa pembelajaran sesuai usia siswa."
                          guideTip="Logo Kop Surat juga otomatis menyesuaikan jenjang yang dipilih."
                        />
                        <select
                          value={profile.level}
                          onChange={(e) =>
                            handleProfileChange('level', e.target.value as TeacherProfile['level'])
                          }
                          className="w-full px-3 py-2.5 text-sm bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                        >
                          <option value="RA">RA</option>
                          <option value="MI">MI</option>
                          <option value="MTs">MTs</option>
                          <option value="MA">MA</option>
                        </select>
                      </div>
                      <div>
                        <FieldLabelWithGuide
                          label="Kelas"
                          guideTitle="Sasaran Kelas / Fase"
                          guideDesc="Tuliskan kelas atau kelompok usia siswa yang menjadi sasaran perangkat pembelajaran (RPP, LKPD, Media, dan Penilaian)."
                          guideTip="Contoh: Kelas 5, Kelas 8, atau Kelompok B."
                        />
                        <input
                          type="text"
                          value={profile.grade}
                          onChange={(e) => handleProfileChange('grade', e.target.value)}
                          placeholder="Kelas 5"
                          className="w-full px-3 py-2.5 text-sm bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                        />
                      </div>
                    </div>

                    <div>
                      <FieldLabelWithGuide
                        label="Mata Pelajaran yang Diampu"
                        required
                        guideTitle="Mata Pelajaran / Bidang Tugas"
                        guideDesc="Tuliskan mata pelajaran yang diampu oleh guru. Menentukan isi materi ajar, indikator soal, dan pernyataan pada Surat Keterangan."
                        guideTip="Contoh: Guru Kelas, Fiqih, Akidah Akhlak, Bahasa Arab, atau Matematika."
                      />
                      <input
                        type="text"
                        value={profile.subject}
                        onChange={(e) => handleProfileChange('subject', e.target.value)}
                        placeholder="Contoh: Guru Kelas / Fiqih / Akidah Akhlak"
                        className="w-full px-3.5 py-2.5 text-sm bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <FieldLabelWithGuide
                        label="Judul Karya Inovasi / Topik Materi Pembelajaran"
                        guideTitle="Judul Karya Inovatif / Topik Utama RPP & Modul"
                        guideDesc="Tuliskan topik pembelajaran atau judul modul/karya inovasi yang dibuat. Judul ini akan menjadi tema utama RPP, Materi, LKPD, Media, serta tertulis di Surat Keterangan."
                        guideTip="Contoh: Modul Pembelajaran Kelas 5 Tema Ekosistem dan Pelestarian Lingkungan."
                      />
                      <input
                        type="text"
                        value={profile.topic}
                        onChange={(e) => handleProfileChange('topic', e.target.value)}
                        placeholder="Contoh: Modul Pembelajaran Kelas 5 Tema Ekosistem dan Pelestarian Lingkungan"
                        className="w-full px-3.5 py-2.5 text-sm bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <FieldLabelWithGuide
                        label="Ringkasan Singkat Pengalaman & Metode Mengajar (Opsional)"
                        guideTitle="Pengalaman Mengajar & Kegiatan KKG/MGMP"
                        guideDesc="Tuliskan lama mengajar, metode yang sering digunakan (misal PBL/PjBL), atau kegiatan pengembangan diri untuk memperkaya narasi Portofolio (RPL03) dan Administrasi (RPL04)."
                        guideTip="Boleh dikosongkan jika ingin AI menyusun narasi standar secara otomatis."
                      />
                      <textarea
                        rows={2}
                        value={profile.experience}
                        onChange={(e) => handleProfileChange('experience', e.target.value)}
                        placeholder="Tuliskan singkat metode mengajar atau kegiatan KKG/MGMP yang diikuti..."
                        className="w-full px-3.5 py-2 text-sm bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                      />
                    </div>
                  </div>

                  {/* Collapsible Accordion for Optional Kop Surat & Headmaster Details */}
                  <div className="mt-5 pt-4 border-t border-[#EFE4D8]">
                    <HoverGuide
                      title="Pengaturan Opsional Kop Surat & Kepala Madrasah"
                      description="Klik tombol ini jika Anda ingin mengubah Nama Yayasan, Alamat Kop Surat, NSM/NPSN, Nomor Surat, atau Nama Kepala Madrasah."
                      tip="Disembunyikan secara bawaan agar tampilan layar tetap ringkas dan tidak memanjang."
                      badge="Opsional"
                      position="top"
                      className="block"
                    >
                      <button
                        type="button"
                        onClick={() => setShowAdvancedKop((prev) => !prev)}
                        className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-[#FAF2EA] hover:bg-[#F3E5D8] border border-[#E7D8C9] text-left transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Settings2 className="w-4 h-4 text-[#6F4B3E] shrink-0" />
                          <div className="min-w-0">
                            <span className="text-xs sm:text-sm font-bold text-[#3B2820] block">
                              Pengaturan Detail Kop Surat & Kepala Madrasah (Opsional)
                            </span>
                            <span className="text-[11px] text-[#7E6458] block truncate">
                              {profile.foundationName} · Kamad: {profile.headmaster}
                            </span>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#6F4B3E] shrink-0">
                          {showAdvancedKop ? (
                            <>
                              <span>Tutup</span>
                              <ChevronUp className="w-4 h-4" />
                            </>
                          ) : (
                            <>
                              <span>Ubah Kop Surat</span>
                              <ChevronDown className="w-4 h-4" />
                            </>
                          )}
                        </span>
                      </button>
                    </HoverGuide>

                    {showAdvancedKop && (
                      <div className="mt-3 p-4 rounded-xl bg-[#FCF9F5] border border-[#E7D8C9] space-y-4">
                        <div className="text-xs font-bold text-[#6F4B3E]">
                          Detail Kop Surat Madrasah & Kepala Madrasah (Saat ini berisi data fiktif)
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div className="sm:col-span-2">
                            <FieldLabelWithGuide
                              label="Nama Yayasan / Instansi Induk"
                              guideTitle="Nama Yayasan Penyelenggara pada Kop Surat"
                              guideDesc="Tampil pada baris paling atas Kop Surat Keterangan dengan warna hijau tua."
                              guideTip="Contoh fiktif: YAYASAN PENDIDIKAN ISLAM CAHAYA BUNGA NUSANTARA."
                            />
                            <input
                              type="text"
                              value={profile.foundationName}
                              onChange={(e) =>
                                handleProfileChange('foundationName', e.target.value)
                              }
                              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DFCBB8] rounded-lg"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <FieldLabelWithGuide
                              label="Alamat Lengkap Madrasah (Pita Kop Surat)"
                              guideTitle="Alamat Madrasah pada Pita Hijau Kop Surat"
                              guideDesc="Tampil di dalam pita blok hijau pada Kop Surat dan pada baris Alamat Madrasah."
                              guideTip="Contoh fiktif: Jl. Melati Indah No. 45 ... Kota Bunga Raya."
                            />
                            <input
                              type="text"
                              value={profile.schoolAddress}
                              onChange={(e) => handleProfileChange('schoolAddress', e.target.value)}
                              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DFCBB8] rounded-lg"
                            />
                          </div>

                          <div>
                            <FieldLabelWithGuide
                              label="NSM & NPSN"
                              guideTitle="Nomor Statistik Madrasah (NSM) & NPSN"
                              guideDesc="Nomor identitas resmi madrasah yang tercantum di bawah status akreditasi pada Kop Surat."
                              guideTip="Saat ini menggunakan nomor fiktif."
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={profile.nsm}
                                onChange={(e) => handleProfileChange('nsm', e.target.value)}
                                placeholder="NSM"
                                className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#DFCBB8] rounded-lg"
                              />
                              <input
                                type="text"
                                value={profile.npsn}
                                onChange={(e) => handleProfileChange('npsn', e.target.value)}
                                placeholder="NPSN"
                                className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#DFCBB8] rounded-lg"
                              />
                            </div>
                          </div>

                          <div>
                            <FieldLabelWithGuide
                              label="Nomor & Tanggal Surat Keterangan"
                              guideTitle="Nomor Surat & Tempat/Tanggal Penerbitan"
                              guideDesc="Nomor surat keluar madrasah serta kota dan tanggal penandatanganan di kanan bawah surat."
                              guideTip="Contoh: 012 / S.Ket / MI-NAH / III / 2026."
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={profile.letterNumber}
                                onChange={(e) =>
                                  handleProfileChange('letterNumber', e.target.value)
                                }
                                placeholder="Nomor Surat"
                                className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#DFCBB8] rounded-lg"
                              />
                              <input
                                type="text"
                                value={profile.letterDate}
                                onChange={(e) => handleProfileChange('letterDate', e.target.value)}
                                placeholder="Kota, Tanggal"
                                className="w-full px-3 py-2 text-xs bg-white border border-[#DFCBB8] rounded-lg"
                              />
                            </div>
                          </div>

                          <div>
                            <FieldLabelWithGuide
                              label="Nama Kepala Madrasah"
                              guideTitle="Nama Lengkap Kepala Madrasah"
                              guideDesc="Nama pejabat penandatangan yang menerbitkan Surat Keterangan dan mengesahkan berkas RPL."
                              guideTip="Contoh fiktif: Hj. SITI NURHALIZA, M.Pd.I."
                            />
                            <input
                              type="text"
                              value={profile.headmaster}
                              onChange={(e) => handleProfileChange('headmaster', e.target.value)}
                              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DFCBB8] rounded-lg"
                            />
                          </div>

                          <div>
                            <FieldLabelWithGuide
                              label="NUPTK / NIP Kepala Madrasah"
                              guideTitle="NUPTK atau NIP Kepala Madrasah"
                              guideDesc="Nomor identitas pendidik Kepala Madrasah pada bagian pembuka Surat Keterangan."
                            />
                            <input
                              type="text"
                              value={profile.headmasterId}
                              onChange={(e) => handleProfileChange('headmasterId', e.target.value)}
                              className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#DFCBB8] rounded-lg"
                            />
                          </div>

                          <div>
                            <FieldLabelWithGuide
                              label="TTL & No. HP Kepala Madrasah"
                              guideTitle="Tempat/Tanggal Lahir & Nomor HP Kepala Madrasah"
                              guideDesc="Data pelengkap Kepala Madrasah sesuai format Surat Keterangan Karya Inovatif."
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={profile.headmasterBirth}
                                onChange={(e) =>
                                  handleProfileChange('headmasterBirth', e.target.value)
                                }
                                placeholder="TTL Kamad"
                                className="w-full px-3 py-2 text-xs bg-white border border-[#DFCBB8] rounded-lg"
                              />
                              <input
                                type="text"
                                value={profile.headmasterPhone}
                                onChange={(e) =>
                                  handleProfileChange('headmasterPhone', e.target.value)
                                }
                                placeholder="No. HP Kamad"
                                className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#DFCBB8] rounded-lg"
                              />
                            </div>
                          </div>

                          <div>
                            <FieldLabelWithGuide
                              label="NUPTK, TTL & No. HP Guru"
                              guideTitle="NUPTK, Tempat/Tanggal Lahir & Nomor HP Guru"
                              guideDesc="Data pelengkap Bapak/Ibu Guru yang tercantum pada bagian isi Surat Keterangan."
                            />
                            <div className="grid grid-cols-3 gap-2">
                              <input
                                type="text"
                                value={profile.nip}
                                onChange={(e) => handleProfileChange('nip', e.target.value)}
                                placeholder="NUPTK Guru"
                                className="w-full px-2.5 py-2 text-xs font-mono bg-white border border-[#DFCBB8] rounded-lg"
                              />
                              <input
                                type="text"
                                value={profile.teacherBirth}
                                onChange={(e) =>
                                  handleProfileChange('teacherBirth', e.target.value)
                                }
                                placeholder="TTL Guru"
                                className="w-full px-2.5 py-2 text-xs bg-white border border-[#DFCBB8] rounded-lg"
                              />
                              <input
                                type="text"
                                value={profile.teacherPhone}
                                onChange={(e) =>
                                  handleProfileChange('teacherPhone', e.target.value)
                                }
                                placeholder="HP Guru"
                                className="w-full px-2.5 py-2 text-xs font-mono bg-white border border-[#DFCBB8] rounded-lg"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-2">
                            <FieldLabelWithGuide
                              label="Link / Tautan Karya (Opsional)"
                              guideTitle="Tautan Google Drive / Portofolio Karya"
                              guideDesc="Tautan menuju file karya inovatif atau perangkat pembelajaran yang dicantumkan di bagian bawah Surat Keterangan."
                            />
                            <input
                              type="text"
                              value={profile.productLink}
                              onChange={(e) => handleProfileChange('productLink', e.target.value)}
                              placeholder="https://contoh-portofolio-guru.id/modul-ekosistem"
                              className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#DFCBB8] rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Step Navigation */}
                  <div className="mt-5 pt-4 border-t border-[#EFE4D8] flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs text-[#876D60]">{profileStatus}</span>
                    <HoverGuide
                      title="Lanjut ke Poin 2: Buat 13 Berkas RPL"
                      description="Berpindah ke halaman generator dokumen untuk menyusun 13 berkas RPL menggunakan Gemini AI."
                      badge="Langkah Selanjutnya"
                      position="top"
                    >
                      <button
                        type="button"
                        onClick={() => setActiveTab('dokumen')}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-[#FFFDF9] bg-[#6F4B3E] hover:bg-[#58392E] rounded-xl transition-colors"
                      >
                        <span>Lanjut ke Langkah 2: Buat Dokumen RPL</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </HoverGuide>
                  </div>
                </div>
              </section>
            )}

            {/* TAB 2: GENERATOR 13 DOKUMEN RPL */}
            {activeTab === 'dokumen' && (
              <section className="relative bg-[#FFFDF9]/92 backdrop-blur-xs border border-[#E7D8C9] rounded-2xl p-5 sm:p-6 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[#EFE4D8]">
                  <div>
                    <div className="flex items-center gap-2">
                      <CamelliaBlossomSvg className="w-5 h-5 shrink-0" />
                      <h2 className="font-display text-lg sm:text-xl font-bold text-[#3B2820]">
                        Poin 2 · Buat 13 Dokumen RPL
                      </h2>
                    </div>
                    <p className="text-xs text-[#876D60] mt-0.5">
                      Arahkan kursor ke setiap kartu dokumen atau tombol untuk melihat petunjuk isi
                      dokumennya.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <HoverGuide
                      title="Centang Semua 13 Dokumen"
                      description="Memilih seluruh 13 dokumen RPL dari kategori RPL01 sampai RPL05 agar siap di-generate sekaligus."
                      badge="Pilih Semua"
                      position="top"
                    >
                      <button
                        type="button"
                        onClick={selectAll13Documents}
                        className="px-3 py-1.5 text-xs font-semibold text-[#5A392C] bg-[#F5EAE0] hover:bg-[#EAD8C8] rounded-xl transition-colors whitespace-nowrap"
                      >
                        Pilih Semua (13)
                      </button>
                    </HoverGuide>

                    <HoverGuide
                      title="Batalkan Pilihan Centang"
                      description="Mengosongkan centang pilihan dokumen jika Anda hanya ingin memilih 1 atau 2 dokumen tertentu."
                      badge="Reset Pilihan"
                      position="top"
                    >
                      <button
                        type="button"
                        onClick={clearSelection}
                        className="px-3 py-1.5 text-xs font-semibold text-[#7E6458] border border-[#E7D8C9] rounded-xl transition-colors whitespace-nowrap"
                      >
                        Reset ({pickedKeys.length})
                      </button>
                    </HoverGuide>
                  </div>
                </div>

                {/* Primary Batch Action Box */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF2EA] border border-[#E7D8C9] mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <HoverGuide
                      title="Instruksi Khusus untuk Gemini AI (Opsional)"
                      description="Tambahkan arahan khusus bila diperlukan, misalnya 'Gunakan model Problem Based Learning (PBL) alokasi waktu 2x35 menit'."
                      tip="Boleh dikosongkan karena sistem sudah memiliki format standar LPTK."
                      badge="Arahan AI"
                      position="top"
                      className="block"
                    >
                      <input
                        type="text"
                        value={extraInstructions}
                        onChange={(e) => setExtraInstructions(e.target.value)}
                        placeholder="Instruksi tambahan opsional (misal: alokasi waktu 2x35 menit, model PBL)..."
                        className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                      />
                    </HoverGuide>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <HoverGuide
                      title="Generate Seluruh 13 Berkas Sekaligus"
                      description="Menyusun ke-13 berkas RPL secara otomatis dari dokumen pertama hingga ke-13 menggunakan Gemini AI."
                      tip="Anda dapat menghentikan proses kapan saja dengan tombol Stop."
                      badge="Otomatis 13"
                      position="top"
                    >
                      <button
                        type="button"
                        onClick={handleGenerateAll13}
                        disabled={isGenerating}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-[#FFFDF9] bg-[#6F4B3E] hover:bg-[#58392E] disabled:opacity-60 rounded-xl transition-colors whitespace-nowrap"
                      >
                        {isGenerating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Wand2 className="w-4 h-4" />
                        )}
                        <span>Generate Semua 13</span>
                      </button>
                    </HoverGuide>

                    <HoverGuide
                      title="Generate Dokumen yang Dicentang Saja"
                      description={`Hanya menyusun ${pickedKeys.length} dokumen yang sedang Anda beri tanda centang pada daftar di bawah.`}
                      badge="Sesuai Centang"
                      position="top"
                    >
                      <button
                        type="button"
                        onClick={() => executeGenerateKeys(pickedKeys)}
                        disabled={isGenerating}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-[#4A2E23] bg-[#F4DFE2] hover:bg-[#EBCAD0] disabled:opacity-60 rounded-xl transition-colors whitespace-nowrap"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#6F4B3E]" />
                        <span>Terpilih ({pickedKeys.length})</span>
                      </button>
                    </HoverGuide>

                    {isGenerating && (
                      <button
                        type="button"
                        onClick={() => {
                          stopGenerationRef.current = true;
                        }}
                        className="inline-flex items-center justify-center gap-1 px-3 py-2.5 text-xs font-semibold text-[#C24B3B] bg-[#FDF1EF] border border-[#E8C2BC] rounded-xl"
                      >
                        <StopCircle className="w-4 h-4" />
                        <span>Stop</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Live Progress Bar */}
                {isGenerating && genProgress.total > 0 && (
                  <div className="mb-4 p-3 rounded-xl bg-[#FAF1E8] border border-[#E7D8C9]">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#5A392C] mb-1.5">
                      <span className="truncate pr-2">{genStatus.text}</span>
                      <span className="font-mono tabular-nums shrink-0">
                        {genProgress.current}/{genProgress.total}
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
                    className={`mb-4 text-xs font-medium ${
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

                {/* Category Filter Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4">
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 bg-[#F5ECE2] p-1 rounded-xl">
                    <HoverGuide
                      title="Tampilkan Seluruh 13 Dokumen"
                      description="Menampilkan semua dokumen dari kategori RPL01 hingga RPL05 dalam satu daftar."
                      badge="Semua"
                      position="top"
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedCategory('ALL')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                          selectedCategory === 'ALL'
                            ? 'bg-[#6F4B3E] text-[#FFFDF9]'
                            : 'text-[#6E5346]'
                        }`}
                      >
                        Semua (13)
                      </button>
                    </HoverGuide>
                    {RPL_CATEGORIES.map((cat) => (
                      <HoverGuide
                        key={cat.code}
                        title={`${cat.code} — ${cat.name}`}
                        description={cat.hoverDetail}
                        tip={cat.hoverTip}
                        badge={cat.code}
                        position="top"
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedCategory(cat.code)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                            selectedCategory === cat.code
                              ? 'bg-[#6F4B3E] text-[#FFFDF9]'
                              : 'text-[#6E5346]'
                          }`}
                        >
                          {cat.code} ({cat.documents.length})
                        </button>
                      </HoverGuide>
                    ))}
                  </div>

                  <HoverGuide
                    title="Pencarian Cepat Dokumen"
                    description="Ketik kata kunci seperti 'RPP', 'LKPD', 'SK', atau 'Inovasi' untuk menyaring kartu dokumen."
                    badge="Filter"
                    position="top"
                    className="relative sm:w-56 block"
                  >
                    <Search className="w-3.5 h-3.5 text-[#876D60] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari dokumen..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                    />
                  </HoverGuide>
                </div>

                {/* Compact Document Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                        badge={existingDraft ? 'Sudah Dibuat' : 'Belum Dibuat'}
                        position="top"
                        className="block"
                      >
                        <div
                          onClick={() => togglePickDocument(docSpec.key)}
                          className={`w-full h-full cursor-pointer rounded-xl border p-3.5 transition-colors flex flex-col justify-between ${
                            isThisGenerating
                              ? 'border-[#6F4B3E] bg-[#FBF2EE]'
                              : isChecked
                              ? 'border-[#8C6453] bg-[#FDF8F4]'
                              : 'border-[#E7D8C9] bg-[#FCF9F5]'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="mt-1 h-4 w-4 accent-[#6F4B3E] rounded cursor-pointer shrink-0"
                            />
                            <div className="min-w-0">
                              <h3 className="text-xs sm:text-sm font-bold text-[#3B2820] leading-snug">
                                {docSpec.title}
                              </h3>
                              <p className="text-[11px] text-[#7E6458] mt-0.5 line-clamp-2">
                                {docSpec.description}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 pt-2 border-t border-[#EFE4D8] flex items-center justify-between gap-2 text-[11px] text-[#876D60]">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="font-mono font-semibold text-[#5A392C]">
                                {docSpec.categoryCode}
                              </span>
                              <span aria-hidden="true">·</span>
                              {isThisGenerating ? (
                                <span className="text-[#6F4B3E] font-semibold inline-flex items-center gap-1">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  Menyusun...
                                </span>
                              ) : existingDraft ? (
                                <span className="text-[#3F6A45] font-semibold truncate">
                                  ✓ {wordCount} kata
                                </span>
                              ) : (
                                <span>○ Kosong</span>
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
                                className="px-2.5 py-1 text-[11px] font-semibold text-[#5A392C] bg-[#F4DFE2] hover:bg-[#EBCAD0] disabled:opacity-50 rounded-lg transition-colors"
                              >
                                {existingDraft ? 'Ulang' : 'Generate'}
                              </button>

                              {existingDraft && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectEditDoc(docSpec.key);
                                  }}
                                  className="text-[11px] font-semibold text-[#6F4B3E] hover:underline"
                                >
                                  Buka →
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </HoverGuide>
                    );
                  })}
                </div>

                {/* Bottom Step Navigation */}
                <div className="mt-5 pt-4 border-t border-[#EFE4D8] flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('profil')}
                    className="px-4 py-2 text-xs font-semibold text-[#6E5346] border border-[#E7D8C9] rounded-xl"
                  >
                    ← Kembali ke Profil
                  </button>
                  <HoverGuide
                    title="Buka Contoh Surat Resmi & Editor"
                    description="Melihat hasil draf yang sudah dibuat atau mengunduh Surat Keterangan Resmi ke Word (.docx) dan PDF."
                    badge="Ke Langkah 4"
                    position="top"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveTab('ekspor')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-[#FFFDF9] bg-[#6F4B3E] hover:bg-[#58392E] rounded-xl"
                    >
                      <span>Lihat Surat Resmi & Ekspor Berkas</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </HoverGuide>
                </div>
              </section>
            )}

            {/* TAB 3: BUKTI LOKAL & PEMERIKSA AI */}
            {activeTab === 'bukti_cek' && (
              <div className="space-y-6">
                {/* Bukti Pendukung Card */}
                <section className="bg-[#FFFDF9]/92 backdrop-blur-xs border border-[#E7D8C9] rounded-2xl p-5 sm:p-6 shadow-xs">
                  <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#EFE4D8]">
                    <CamelliaBlossomSvg className="w-5 h-5 shrink-0" />
                    <div>
                      <h2 className="font-display text-lg font-bold text-[#3B2820]">
                        Poin 3A · Lampirkan Bukti Pendukung Lokal (Opsional)
                      </h2>
                      <p className="text-xs text-[#876D60]">
                        File yang disimpan akan otomatis masuk ke folder Bukti/ saat mengunduh ZIP.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                    <div>
                      <FieldLabelWithGuide
                        label="Kategori RPL"
                        guideTitle="Pilih Kategori Bukti (RPL01–RPL05)"
                        guideDesc="Menentukan di folder kategori mana file bukti Anda akan ditempatkan saat mengekspor ZIP."
                      />
                      <select
                        value={uploadCategory}
                        onChange={(e) => setUploadCategory(e.target.value as RplCategory['code'])}
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl"
                      >
                        {RPL_CATEGORIES.map((cat) => (
                          <option key={cat.code} value={cat.code}>
                            {cat.code} — {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <FieldLabelWithGuide
                        label="Keterangan / Label Bukti"
                        guideTitle="Nama / Label File Bukti"
                        guideDesc="Berikan nama singkat agar mudah dikenali dalam daftar lampiran, misalnya 'Scan SK Pembagian Tugas 2025'."
                      />
                      <input
                        type="text"
                        value={evidenceLabel}
                        onChange={(e) => setEvidenceLabel(e.target.value)}
                        placeholder="Label bukti (contoh: SK Mengajar 2025)"
                        className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5 mb-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.txt"
                      className="flex-1 text-xs text-[#6E5346] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#F5EAE0] file:text-[#5A392C] bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl p-1.5"
                    />
                    <HoverGuide
                      title="Simpan File Bukti ke Portofolio"
                      description="Menyimpan file yang telah dipilih dari perangkat Anda agar otomatis ikut terbundel saat Anda mengunduh ZIP."
                      badge="Simpan File"
                      position="top"
                    >
                      <button
                        type="button"
                        onClick={handleUploadEvidence}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-[#FFFDF9] bg-[#6F4B3E] hover:bg-[#58392E] rounded-xl whitespace-nowrap"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Simpan Bukti</span>
                      </button>
                    </HoverGuide>
                  </div>

                  {uploadStatus.text && (
                    <div
                      className={`mb-3 text-xs font-medium ${
                        uploadStatus.type === 'error' ? 'text-[#C24B3B]' : 'text-[#3F6A45]'
                      }`}
                    >
                      {uploadStatus.text}
                    </div>
                  )}

                  {filteredEvidence.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      {filteredEvidence.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#FCF9F5] border border-[#E7D8C9] text-xs"
                        >
                          <div className="min-w-0">
                            <span className="font-mono font-bold text-[#6F4B3E] mr-2">
                              {item.category}
                            </span>
                            <span className="font-semibold text-[#3B2820]">{item.label}</span>
                            <span className="text-[#876D60] ml-2 font-mono">
                              ({formatBytes(item.size)})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveEvidence(item.id)}
                            className="text-[#C24B3B] hover:underline shrink-0"
                          >
                            Hapus
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* AI Document Checker Card */}
                <section className="bg-[#FFFDF9]/92 backdrop-blur-xs border border-[#E7D8C9] rounded-2xl p-5 sm:p-6 shadow-xs">
                  <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#EFE4D8]">
                    <CamelliaBlossomSvg className="w-5 h-5 shrink-0" />
                    <div>
                      <h2 className="font-display text-lg font-bold text-[#3B2820]">
                        Poin 3B · Pemeriksa Awal Dokumen AI
                      </h2>
                      <p className="text-xs text-[#876D60]">
                        Periksa kelengkapan draf dan bagian yang masih perlu dilengkapi sebelum
                        diunduh.
                      </p>
                    </div>
                  </div>

                  {draftKeys.length === 0 ? (
                    <div className="py-6 text-center bg-[#FCF9F5] border border-dashed border-[#DFCBB8] rounded-xl">
                      <p className="text-xs text-[#876D60] mb-3">
                        Belum ada draf dokumen yang dibuat.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('dokumen')}
                        className="px-4 py-2 text-xs font-semibold text-[#4A2E23] bg-[#F4DFE2] rounded-xl"
                      >
                        Ke Tab Buat Dokumen →
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <FieldLabelWithGuide
                            label="Pilih Draf Dokumen"
                            guideTitle="Dokumen yang Akan Diperiksa AI"
                            guideDesc="Pilih salah satu draf dokumen yang sudah di-generate untuk dievaluasi kelengkapan struktur dan isinya."
                          />
                          <select
                            value={checkDocKey}
                            onChange={(e) => setCheckDocKey(e.target.value)}
                            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl"
                          >
                            {draftKeys.map((k) => (
                              <option key={k} value={k}>
                                {drafts[k].category} · {drafts[k].title}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <FieldLabelWithGuide
                            label="Fokus Pemeriksaan (Opsional)"
                            guideTitle="Catatan Fokus Evaluasi"
                            guideDesc="Tuliskan hal spesifik yang ingin dicek oleh AI, misalnya 'Cek kesesuaian indikator HOTS dan langkah PBL'."
                          />
                          <input
                            type="text"
                            value={checkNotes}
                            onChange={(e) => setCheckNotes(e.target.value)}
                            placeholder="Catatan fokus pemeriksaan (opsional)..."
                            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5">
                        <HoverGuide
                          title="Mulai Pemeriksaan Kelengkapan dengan Gemini AI"
                          description="AI akan membaca draf Anda dan memberikan daftar ceklis bagian yang sudah kuat maupun bagian yang masih perlu diisi manual."
                          badge="Review AI"
                          position="top"
                        >
                          <button
                            type="button"
                            onClick={handleCheckDocument}
                            disabled={isChecking}
                            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#FFFDF9] bg-[#6F4B3E] hover:bg-[#58392E] disabled:opacity-60 rounded-xl"
                          >
                            {isChecking ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <FileCheck2 className="w-4 h-4" />
                            )}
                            <span>{isChecking ? 'Memeriksa...' : 'Periksa dengan Gemini AI'}</span>
                          </button>
                        </HoverGuide>

                        {checkResult && (
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(checkResult);
                              setCopiedCheck(true);
                              setTimeout(() => setCopiedCheck(false), 2000);
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#5A392C] bg-[#F5EAE0] rounded-xl"
                          >
                            {copiedCheck ? (
                              <Check className="w-3.5 h-3.5 text-[#3F6A45]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>{copiedCheck ? 'Tersalin' : 'Salin Hasil'}</span>
                          </button>
                        )}
                      </div>

                      {checkResult && (
                        <div className="bg-[#FCF9F5] border border-[#E7D8C9] rounded-xl p-4 max-h-80 overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed text-[#3B2820]">
                          {checkResult}
                        </div>
                      )}
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* TAB 4: SURAT RESMI & EDITOR EKSPOR */}
            {activeTab === 'ekspor' && (
              <section className="bg-[#FFFDF9]/92 backdrop-blur-xs border border-[#E7D8C9] rounded-2xl p-4 sm:p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-[#EFE4D8]">
                  <div>
                    <div className="flex items-center gap-2">
                      <CamelliaBlossomSvg className="w-5 h-5 shrink-0" />
                      <h2 className="font-display text-lg sm:text-xl font-bold text-[#3B2820]">
                        Poin 4 · Contoh Surat Resmi & Editor Berkas
                      </h2>
                    </div>
                    <p className="text-xs text-[#876D60] mt-0.5">
                      Arahkan kursor ke bagian-bagian surat di bawah untuk melihat petunjuk setiap
                      poin surat.
                    </p>
                  </div>

                  <div className="flex items-center gap-1 bg-[#F5ECE2] p-1 rounded-xl shrink-0">
                    <HoverGuide
                      title="Mode Pratinjau Surat Keterangan Resmi"
                      description="Menampilkan lembar Surat Keterangan Kepala Madrasah ber-Kop Madrasah (menggunakan nama sekolah & alamat fiktif) yang siap diunduh ke Word atau PDF."
                      badge="Surat Resmi"
                      position="top"
                    >
                      <button
                        type="button"
                        onClick={() => setEditorTab('official_letter')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                          editorTab === 'official_letter'
                            ? 'bg-[#6F4B3E] text-[#FFFDF9]'
                            : 'text-[#6E5346]'
                        }`}
                      >
                        Contoh Surat Resmi
                      </button>
                    </HoverGuide>

                    <HoverGuide
                      title="Mode Editor 13 Draf Dokumen RPL"
                      description="Membuka ruang sunting teks untuk melihat, mengedit, dan mengekspor masing-masing dari 13 draf dokumen RPL Anda ke DOCX atau PDF."
                      badge="Editor 13 Draf"
                      position="top"
                    >
                      <button
                        type="button"
                        onClick={() => setEditorTab('draft_editor')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                          editorTab === 'draft_editor'
                            ? 'bg-[#6F4B3E] text-[#FFFDF9]'
                            : 'text-[#6E5346]'
                        }`}
                      >
                        Editor Draf ({draftKeys.length})
                      </button>
                    </HoverGuide>
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-[#FAF2EA] border border-[#E7D8C9] rounded-xl p-3">
                      <span className="text-xs text-[#5A392C]">
                        Buat kerangka dokumen tanpa AI:
                      </span>
                      <div className="flex items-center gap-2">
                        <select
                          value={manualDocKeyToInit}
                          onChange={(e) => setManualDocKeyToInit(e.target.value)}
                          className="flex-1 sm:flex-initial px-2.5 py-1.5 text-xs bg-[#FFFDF9] border border-[#DFCBB8] rounded-lg"
                        >
                          {ALL_DOCUMENTS.map((doc) => (
                            <option key={doc.key} value={doc.key}>
                              {doc.categoryCode} · {doc.title}
                            </option>
                          ))}
                        </select>
                        <HoverGuide
                          title="Buat Kerangka Manual Cepat"
                          description="Membuat draf awal berformat Surat Keterangan tanpa perlu menunggu proses AI."
                          badge="Tanpa AI"
                          position="top"
                        >
                          <button
                            type="button"
                            onClick={handleCreateManualDraft}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#5A392C] bg-[#F4DFE2] rounded-lg shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Buat Kerangka</span>
                          </button>
                        </HoverGuide>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <select
                        value={editDocKey}
                        onChange={(e) => handleSelectEditDoc(e.target.value)}
                        disabled={draftKeys.length === 0}
                        className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl disabled:opacity-60"
                      >
                        {draftKeys.length === 0 ? (
                          <option value="">
                            Belum ada draf — silakan Generate di Langkah 2 atau klik Buat Kerangka
                          </option>
                        ) : (
                          draftKeys.map((k) => (
                            <option key={k} value={k}>
                              {drafts[k].category} · {drafts[k].title}
                            </option>
                          ))
                        )}
                      </select>

                      {editDocKey && drafts[editDocKey] && (
                        <div className="flex items-center gap-2 text-xs text-[#7E6458] shrink-0">
                          <span className="font-mono tabular-nums">
                            {countWords(editorContent)} kata
                          </span>
                          <span>·</span>
                          <span className="font-mono tabular-nums text-[#B06525]">
                            {countPlaceholders(editorContent)} placeholder
                          </span>
                        </div>
                      )}
                    </div>

                    <textarea
                      rows={14}
                      value={editorContent}
                      onChange={(e) => setEditorContent(e.target.value)}
                      placeholder="Pilih draf dokumen atau klik 'Buat Kerangka' di atas..."
                      className="w-full p-3.5 text-xs sm:text-sm font-mono leading-relaxed bg-[#FCF9F5] border border-[#DFCBB8] rounded-xl focus:outline-none focus:border-[#6F4B3E]"
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <HoverGuide
                        title="Simpan Perubahan Teks Draf"
                        description="Menyimpan hasil suntingan Anda ke penyimpanan browser agar siap diekspor ke DOCX, PDF, maupun ZIP."
                        badge="Simpan"
                        position="top"
                      >
                        <button
                          type="button"
                          onClick={handleSaveDraft}
                          disabled={!editDocKey}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-[#FFFDF9] bg-[#6F4B3E] disabled:opacity-50 rounded-xl"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Simpan</span>
                        </button>
                      </HoverGuide>

                      <HoverGuide
                        title="Unduh Draf Ini ke Microsoft Word (.docx)"
                        description="Mengekspor draf yang sedang dibuka menjadi file Word (.docx) lengkap dengan Kop Madrasah."
                        badge="File Word"
                        position="top"
                      >
                        <button
                          type="button"
                          onClick={handleExportDocx}
                          disabled={!editDocKey}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-[#4A2E23] bg-[#F4DFE2] disabled:opacity-50 rounded-xl"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Export DOCX</span>
                        </button>
                      </HoverGuide>

                      <HoverGuide
                        title="Unduh Draf Ini ke PDF (.pdf)"
                        description="Mengekspor draf yang sedang dibuka menjadi dokumen PDF ukuran A4 siap cetak."
                        badge="File PDF"
                        position="top"
                      >
                        <button
                          type="button"
                          onClick={handleExportPdf}
                          disabled={!editDocKey}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-[#4F6D52] bg-[#DCE8D8] disabled:opacity-50 rounded-xl"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>Export PDF</span>
                        </button>
                      </HoverGuide>

                      <HoverGuide
                        title="Salin Isi Draf ke Clipboard"
                        description="Menyalin seluruh teks draf agar dapat ditempel (paste) ke aplikasi lain."
                        badge="Copy"
                        position="top"
                      >
                        <button
                          type="button"
                          disabled={!editorContent}
                          onClick={() => {
                            navigator.clipboard.writeText(editorContent);
                            setCopiedEditor(true);
                            setTimeout(() => setCopiedEditor(false), 2000);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-[#6E5346] border border-[#E7D8C9] disabled:opacity-50 rounded-xl"
                        >
                          {copiedEditor ? (
                            <Check className="w-3.5 h-3.5 text-[#3F6A45]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>{copiedEditor ? 'Disalin' : 'Salin'}</span>
                        </button>
                      </HoverGuide>
                    </div>
                  </div>
                )}

                {editStatus && (
                  <div className="mt-3 text-xs font-medium text-[#3F6A45]">{editStatus}</div>
                )}
              </section>
            )}
          </main>

          {/* Compact Right Sidebar: Progress & Quick Tools (Collapsible on Mobile!) */}
          <aside className="space-y-4 lg:sticky lg:top-20">
            <section className="bg-[#FFFDF9]/92 backdrop-blur-xs border border-[#E7D8C9] rounded-2xl p-4 sm:p-5 shadow-xs">
              <HoverGuide
                title="Ringkasan Progres 13 Berkas RPL"
                description="Menunjukkan berapa banyak dokumen RPL wajib yang sudah berhasil disusun dari total 13 dokumen."
                tip="Klik salah satu kategori RPL01–RPL05 di bawah untuk langsung melihat dokumen di kategori tersebut."
                badge="Progres"
                position="left"
                className="block"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CamelliaBlossomSvg className="w-4 h-4 shrink-0" />
                      <h2 className="font-display text-sm sm:text-base font-bold text-[#4A3127]">
                        Progres Portofolio
                      </h2>
                    </div>
                    <span className="font-mono text-base font-bold text-[#6F4B3E] tabular-nums">
                      {completedDocsCount}/13 ({completionPercent}%)
                    </span>
                  </div>

                  <div className="h-2 w-full bg-[#F2E6DC] rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-gradient-to-r from-[#6F4B3E] to-[#6B8E6E] transition-all duration-200"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                </div>
              </HoverGuide>

              {missingDocsCount > 0 && (
                <HoverGuide
                  title="Lengkapi Otomatis Berkas yang Masih Kosong"
                  description={`Menyusun otomatis ${missingDocsCount} dokumen RPL yang belum dibuat tanpa menimpa draf yang sudah selesai.`}
                  badge="Pintasan AI"
                  position="left"
                  className="block"
                >
                  <button
                    type="button"
                    onClick={handleGenerateMissingOnly}
                    disabled={isGenerating}
                    className="w-full mb-3 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#4A2E23] bg-[#F5DFE2] hover:bg-[#EED0D5] disabled:opacity-60 rounded-xl transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#6F4B3E]" />
                    <span>Susun {missingDocsCount} Berkas yang Kosong</span>
                  </button>
                </HoverGuide>
              )}

              {/* Mobile Toggle for Details */}
              <button
                type="button"
                onClick={() => setShowMobileProgress((prev) => !prev)}
                className="lg:hidden w-full flex items-center justify-between pt-2 border-t border-[#EFE4D8] text-xs font-semibold text-[#6E5346]"
              >
                <span>Rincian Kategori & Backup Data</span>
                {showMobileProgress ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              <div className={`${showMobileProgress ? 'block' : 'hidden'} lg:block pt-3 border-t border-[#EFE4D8] space-y-3`}>
                <div className="space-y-1">
                  {RPL_CATEGORIES.map((cat) => {
                    const doneCount = cat.documents.filter((d) =>
                      Boolean(drafts[d.key]?.content)
                    ).length;
                    const totalCat = cat.documents.length;
                    return (
                      <HoverGuide
                        key={cat.code}
                        title={`${cat.code} · ${cat.name}`}
                        description={cat.hoverDetail}
                        tip="Klik untuk menyaring daftar dokumen khusus kategori ini."
                        badge={`${doneCount}/${totalCat} selesai`}
                        position="left"
                        className="block"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat.code);
                            setActiveTab('dokumen');
                          }}
                          className="w-full flex items-center justify-between text-left py-1.5 px-2 rounded-lg hover:bg-[#FAF1E8] text-xs transition-colors"
                        >
                          <span className="truncate text-[#4A3127]">
                            <span className="font-mono font-semibold">{cat.code}</span> · {cat.name}
                          </span>
                          <span className="font-mono text-xs font-semibold text-[#6F4B3E] tabular-nums shrink-0 ml-2">
                            {doneCount}/{totalCat}
                          </span>
                        </button>
                      </HoverGuide>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-[#EFE4D8]">
                  <FieldLabelWithGuide
                    label="Model Gemini AI"
                    guideTitle="Pilihan Model Gemini AI"
                    guideDesc="Pilih model AI untuk menyusun dokumen. Gemini 3.8 Flash direkomendasikan karena cepat dan menghasilkan struktur perangkat ajar yang lengkap."
                  />
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#FCF8F3] border border-[#DFCBB8] rounded-lg"
                  >
                    <option value="gemini-3.8-flash">Gemini 3.8 Flash (Rekomendasi)</option>
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                    <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-[#EFE4D8] grid grid-cols-2 gap-2">
                  <HoverGuide
                    title="Simpan Cadangan Data (.json)"
                    description="Mengunduh file cadangan berisi profil dan seluruh draf dokumen Anda agar bisa dibuka kembali di laptop atau HP lain."
                    badge="Backup"
                    position="top"
                    className="block"
                  >
                    <button
                      type="button"
                      onClick={handleExportBackup}
                      className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-2 text-xs font-semibold text-[#5A392C] bg-[#F5EAE0] hover:bg-[#EAD8C8] rounded-xl"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Backup</span>
                    </button>
                  </HoverGuide>

                  <HoverGuide
                    title="Pulihkan Cadangan Data (.json)"
                    description="Memuat kembali file cadangan (.json) yang pernah Anda simpan sebelumnya."
                    badge="Restore"
                    position="top"
                    className="block"
                  >
                    <button
                      type="button"
                      onClick={() => backupInputRef.current?.click()}
                      className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-2 text-xs font-semibold text-[#5A392C] bg-[#F5EAE0] hover:bg-[#EAD8C8] rounded-xl"
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
            </section>
          </aside>
        </div>
      </div>

      {/* Quiet Floral Choco Latte Footer */}
      <footer className="relative z-10 border-t border-[#E7D8C9] bg-[#F7EFE6]/85 backdrop-blur-xs py-4 px-4 sm:px-6 mt-8">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] sm:text-xs text-[#876D60] text-center sm:text-left">
          <div className="flex items-center gap-1.5">
            <CamelliaBlossomSvg className="w-3.5 h-3.5 shrink-0" />
            <span>RPLumi — Asisten Berkas RPL PPG Daljab · Penyimpanan lokal browser</span>
          </div>
          <div>Verifikasi selalu dokumen akhir dengan rubrik resmi LPTK.</div>
        </div>
      </footer>
    </div>
  );
}
