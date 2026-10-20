import React, { useState } from 'react';
import { SavedConfiguration, MachineComponent, SuctionSystemConfig, MaterialFeedConfig } from '../types/machine';
import { useLanguage } from '../i18n';
import { X, Save, FolderOpen, Trash2, Download, Upload, ExternalLink, Copy, Check, Clock, Calendar, CheckCircle2 } from 'lucide-react';

interface SavedConfigsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedConfigs: SavedConfiguration[];
  onSaveCurrent: (name: string, notes?: string) => void;
  onLoadConfig: (config: SavedConfiguration) => void;
  onDeleteConfig: (id: string) => void;
  onImportConfig: (config: SavedConfiguration) => void;
  currentComponents: MachineComponent[];
  currentSuction: SuctionSystemConfig;
  currentMaterial: MaterialFeedConfig;
}

export const SavedConfigsModal: React.FC<SavedConfigsModalProps> = ({
  isOpen,
  onClose,
  savedConfigs,
  onSaveCurrent,
  onLoadConfig,
  onDeleteConfig,
  onImportConfig,
  currentComponents,
  currentSuction,
  currentMaterial,
}) => {
  const { t, language } = useLanguage();
  const [configName, setConfigName] = useState('');
  const [notes, setNotes] = useState('');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configName.trim()) return;
    onSaveCurrent(configName.trim(), notes.trim());
    setConfigName('');
    setNotes('');
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 2500);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.components && Array.isArray(json.components)) {
          const imported: SavedConfiguration = {
            id: `imported_${Date.now()}`,
            name: json.name || file.name.replace('.json', ''),
            savedAt: new Date().toISOString(),
            components: json.components,
            suctionConfig: json.suctionConfig || currentSuction,
            materialConfig: json.materialConfig || currentMaterial,
            notes: json.notes || 'Đã nhập từ tập tin máy tính',
          };
          onImportConfig(imported);
          setSaveSuccessNotice(true);
          setTimeout(() => setSaveSuccessNotice(false), 2500);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Lỗi đọc file JSON:', err);
      }
    };
    reader.readAsText(file);
  };

  const handleExportConfigToJson = (cfg: SavedConfiguration) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cfg, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${cfg.name.replace(/\s+/g, '_')}_textile_machine.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCurrentStateToJson = () => {
    const currentConfig: SavedConfiguration = {
      id: `config_${Date.now()}`,
      name: configName.trim() || 'Cau_hinh_may_xe_vai',
      savedAt: new Date().toISOString(),
      components: currentComponents,
      suctionConfig: currentSuction,
      materialConfig: currentMaterial,
      notes: notes.trim() || 'Xuất trực tiếp từ phần mềm mô phỏng',
    };
    handleExportConfigToJson(currentConfig);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 select-none">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <FolderOpen className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="text-base font-semibold text-slate-100">{t('modal.save.title')}</h2>
              <p className="text-xs text-slate-400">{t('modal.save.subtitle')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* 1. Mở qua tab mới */}
          <div className="p-4 bg-sky-950/40 rounded-xl border border-sky-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-sky-400" />
                <h3 className="font-semibold text-sm text-sky-200">{t('modal.save.openNewTabTitle')}</h3>
              </div>
              <p className="text-[11px] text-sky-300/80 mt-1">
                {t('modal.save.openNewTabDesc')}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
                title={language === 'en' ? 'Copy link to clipboard' : language === 'ko' ? '클립보드에 링크 복사' : 'Sao chép liên kết vào bộ nhớ tạm'}
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? t('modal.save.copiedLink') : t('modal.save.copyLink')}</span>
              </button>
              <a
                href={window.location.href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{t('modal.save.openTabBtn')}</span>
              </a>
            </div>
          </div>

          {/* 2. Form lưu cấu hình hiện tại */}
          <form onSubmit={handleSave} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Save className="w-4 h-4 text-emerald-400" /> {t('modal.save.saveCurrentTitle')}
              </h3>
              <span className="text-[11px] font-mono text-slate-500">
                {currentComponents.length} {language === 'en' ? 'parts / rollers' : language === 'ko' ? '개 부품/롤러' : 'chi tiết trục/dao'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">{t('modal.save.configNameLabel')}</label>
                <input
                  type="text"
                  required
                  placeholder={language === 'en' ? 'e.g. Heavy Denim Scrap Opener - Line 1' : language === 'ko' ? '예: 헤비 데님 개섬기 - 1호기' : 'VD: Cấu hình xé vải Jean dày - Xưởng 1'}
                  value={configName}
                  onChange={(e) => setConfigName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">{t('modal.save.notesLabel')}</label>
                <input
                  type="text"
                  placeholder={language === 'en' ? 'e.g. Knife gap 1.5mm, 820 RPM' : language === 'ko' ? '예: 나이프 간극 1.5mm, 820 RPM' : 'VD: Khe hở dao 1.5mm, 820 RPM'}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1">
              <span className="text-[11px] text-slate-500">
                {language === 'en' ? 'Auto-saved in browser local storage or download as .json file.' : language === 'ko' ? '브라우저 로컬 저장소에 자동 저장되거나 .json 파일로 다운로드됩니다.' : 'Tự động lưu vào trình duyệt của bạn (F5 không mất) hoặc tải file .json về máy.'}
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleExportCurrentStateToJson}
                  className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                  title={language === 'en' ? 'Download .json file to PC' : language === 'ko' ? 'PC에 .json 파일 다운로드' : 'Tải tập tin cấu hình .json về máy tính cá nhân'}
                >
                  <Download className="w-3.5 h-3.5 text-sky-400" />
                  <span>{t('modal.save.downloadJsonBtn')}</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{t('modal.save.saveBrowserBtn')}</span>
                </button>
              </div>
            </div>

            {saveSuccessNotice && (
              <div className="p-2.5 bg-emerald-950/80 border border-emerald-700 rounded-lg flex items-center gap-2 text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t('modal.save.savedSuccess')}</span>
              </div>
            )}
          </form>

          {/* 3. Hướng dẫn từng bước tạo & tự lưu mẫu máy */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <span className="font-semibold text-xs text-sky-300 flex items-center gap-1.5">
              💡 {language === 'en' ? 'Guide: How to create and save models' : language === 'ko' ? '가이드: 신규 모델 생성 및 저장 방법' : 'Hướng Dẫn: Cách tạo mẫu mới & tự lưu'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800/90">
                <strong className="text-white block mb-0.5">{language === 'en' ? '1. Start New Model' : language === 'ko' ? '1. 새 모델 시작' : '1. Bắt đầu mẫu mới'}</strong>
                <span className="text-slate-400">
                  {language === 'en' ? 'Click "New Machine" or select a preset as base, then customize rollers and gaps.' : language === 'ko' ? '"새 기계 생성" 또는 기본 프리셋을 선택한 후 롤러와 간극을 조정하세요.' : 'Bấm nút "Tạo máy mới" trên thanh công cụ hoặc chọn 1 mẫu có sẵn để làm khung sườn, sau đó thêm/xóa trục, kéo cự ly.'}
                </span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800/90">
                <strong className="text-white block mb-0.5">{language === 'en' ? '2. Name & Save' : language === 'ko' ? '2. 이름 지정 및 저장' : '2. Đặt tên & Lưu'}</strong>
                <span className="text-slate-400">
                  {language === 'en' ? 'Click "Save Model" (or press Ctrl + S), enter name, and click Save to Browser.' : language === 'ko' ? '"모델 저장"(또는 Ctrl + S)을 클릭하고 이름을 지정한 후 브라우저에 저장하세요.' : 'Bấm "Lưu cấu hình" (hoặc nhấn Ctrl + S), đặt tên mẫu và bấm Lưu vào trình duyệt.'}
                </span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800/90">
                <strong className="text-white block mb-0.5">{language === 'en' ? '3. Load & Export' : language === 'ko' ? '3. 불러오기 및 내보내기' : '3. Sử dụng & Tải file'}</strong>
                <span className="text-slate-400">
                  {language === 'en' ? 'Click "Load" to restore anytime, or download .json to share with colleagues.' : language === 'ko' ? '"불러오기"로 언제든 복원하거나 .json 파일을 다운로드하여 공유하세요.' : 'Bấm "Tải ra máy" để mở lại bất kỳ lúc nào, hoặc bấm nút tải 📥 để lưu file .json về máy tính gửi cho người khác.'}
                </span>
              </div>
            </div>
          </div>

          {/* 4. Danh sách cấu hình đã lưu */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sky-400" /> {t('modal.save.listTitle')} ({savedConfigs.length})
              </h3>

              {/* Nút nhập file từ máy tính */}
              <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-sky-400" />
                <span>{t('modal.save.importFileBtn')}</span>
                <input type="file" accept=".json" onChange={handleFileInput} className="hidden" />
              </label>
            </div>

            {savedConfigs.length === 0 ? (
              <div className="p-6 text-center bg-slate-950/60 rounded-xl border border-slate-800 text-slate-500">
                <p>{t('modal.save.emptyList')}</p>
                <p className="text-[11px] mt-1 text-slate-600">
                  {language === 'en' ? 'Enter a name above and click "Save to Browser" to create your first save.' : language === 'ko' ? '위에 이름을 입력하고 "브라우저에 저장"을 클릭하여 첫 저장본을 만드세요.' : 'Hãy nhập tên ở ô bên trên và bấm "Lưu vào trình duyệt" để tạo bản lưu đầu tiên.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {savedConfigs.map((cfg) => {
                  const dateStr = new Date(cfg.savedAt).toLocaleString(language === 'en' ? 'en-US' : language === 'ko' ? 'ko-KR' : 'vi-VN');
                  return (
                    <div
                      key={cfg.id}
                      className="p-3 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5 overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-200 text-xs truncate">{cfg.name}</span>
                          <span className="text-[10px] text-sky-400 font-mono bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800/60 shrink-0">
                            {cfg.components.length} {language === 'en' ? 'parts' : language === 'ko' ? '개 부품' : 'trục'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span>{dateStr}</span>
                          {cfg.notes && <span>· {cfg.notes}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            onLoadConfig(cfg);
                            onClose();
                          }}
                          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-medium transition-colors"
                          title={language === 'en' ? 'Load this configuration' : language === 'ko' ? '이 구성 불러오기' : 'Tải cấu hình này ra màn hình mô phỏng'}
                        >
                          {t('modal.save.loadBtn')}
                        </button>
                        <button
                          onClick={() => handleExportConfigToJson(cfg)}
                          className="p-1.5 text-slate-400 hover:text-sky-300 hover:bg-slate-800 rounded border border-transparent hover:border-slate-700 transition-colors"
                          title={language === 'en' ? 'Download .json file to PC' : language === 'ko' ? 'PC에 .json 파일 다운로드' : 'Tải tập tin .json của cấu hình này về máy tính'}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteConfig(cfg.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded transition-colors"
                          title={language === 'en' ? 'Delete this configuration' : language === 'ko' ? '이 구성 삭제' : 'Xóa cấu hình này'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-900">
          <span className="text-xs text-slate-500">
            {language === 'en' ? 'Data is automatically synced in your browser storage' : language === 'ko' ? '데이터가 브라우저 저장소에 자동 동기화됩니다' : 'Dữ liệu được tự động đồng bộ hóa trên trình duyệt của bạn'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
