import React, { useState } from 'react';
import { useLanguage } from '../i18n';
import { X, ExternalLink, Copy, Check, Info, Globe, Monitor } from 'lucide-react';

interface OpenTabModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OpenTabModal: React.FC<OpenTabModalProps> = ({ isOpen, onClose }) => {
  const { t, language } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Đường link trực tiếp của ứng dụng (lấy động từ trình duyệt)
  const currentHref = typeof window !== 'undefined' ? window.location.href : '';
  const appUrl =
    currentHref && !currentHref.includes('about:blank')
      ? currentHref
      : 'https://ais-pre-c5hedmtgzmimd24z2gxb7g-476277255723.asia-southeast1.run.app';

  const handleCopy = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(appUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = appUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 select-none">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <ExternalLink className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="text-base font-semibold text-slate-100">{t('modal.openTab.title')}</h2>
              <p className="text-xs text-slate-400">{t('modal.openTab.desc')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs text-slate-300">
          {/* Thông báo lý do trình duyệt chặn popup */}
          <div className="p-3.5 bg-amber-950/40 border border-amber-800/80 rounded-xl flex items-start gap-2.5 text-amber-200 text-xs">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {language === 'en'
                ? 'Your browser may block automatic popup tabs from the embedded iframe sandbox. Click the button below or copy the URL to paste directly into your browser address bar.'
                : language === 'ko'
                ? '브라우저 보안으로 인해 임베디드 iframe 환경에서 팝업이 차단될 수 있습니다. 아래의 버튼을 누르거나 링크를 복사하여 브라우저 주소창에 직접 붙여넣으세요.'
                : 'Trình duyệt có thể chặn mở tab tự động từ khung nhúng (iframe sandbox). Bạn có thể bấm nút Mở tab bên dưới hoặc sao chép đường link rồi dán vào thanh địa chỉ của trình duyệt.'}
            </p>
          </div>

          {/* Ô hiển thị URL và nút Sao chép */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-400 block">
              {language === 'en' ? 'Direct Application Link:' : language === 'ko' ? '직접 연결 링크:' : 'Đường link trực tiếp của bạn:'}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-sky-300 outline-none select-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 flex items-center gap-1.5 shrink-0 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t('modal.openTab.copied') : t('modal.openTab.copyBtn')}</span>
              </button>
            </div>
            {copied && (
              <span className="text-[11px] text-emerald-400 font-medium block pt-0.5">
                {language === 'en'
                  ? '✓ Link copied to clipboard! Press Ctrl+V in a new browser tab.'
                  : language === 'ko'
                  ? '✓ 링크가 클립보드에 복사되었습니다! 새 탭에 Ctrl+V를 누르세요.'
                  : '✓ Đã sao chép link! Bạn chỉ cần nhấn Ctrl+V vào tab mới của trình duyệt.'}
              </span>
            )}
          </div>

          {/* Cách mở qua nút có sẵn trên giao diện AI Studio */}
          <div className="p-4 bg-slate-950 rounded-xl border border-sky-500/30 space-y-3 text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5 font-semibold text-sky-300 text-xs">
              <Monitor className="w-4 h-4 text-sky-400" />
              <span>
                {language === 'en'
                  ? 'Alternative: Click the "Open in new window" button in the upper preview header:'
                  : language === 'ko'
                  ? '대체 방법: 상단 미리보기 헤더의 "새 창에서 열기" 버튼을 클릭하세요:'
                  : 'Vị trí nút "Mở tab mới" trên thanh tiêu đề xem trước:'}
              </span>
            </div>

            {/* Minh họa trực quan */}
            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-700 space-y-1 font-mono text-[10px]">
              <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800">
                <span className="text-slate-500">{language === 'en' ? 'AI Studio Preview Frame' : language === 'ko' ? 'AI Studio 미리보기 프레임' : 'Khung xem trước'}</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">localhost:3000</span>
                  <span className="px-2 py-0.5 bg-sky-500 text-white rounded font-bold animate-pulse flex items-center gap-1 shadow-sm shadow-sky-400">
                    ↗ {language === 'en' ? 'CLICK HERE' : language === 'ko' ? '여기 클릭' : 'BẤM NÚT NÀY'}
                  </span>
                </div>
              </div>
              <p className="text-slate-400 font-sans text-[11px] pt-1">
                {language === 'en'
                  ? 'Clicking the ↗ icon at the top corner opens the application directly in a clean browser window.'
                  : language === 'ko'
                  ? '우측 상단의 ↗ 아이콘을 클릭하면 전체 브라우저 화면에서 원활하게 실행됩니다.'
                  : 'Bấm vào biểu tượng ↗ đó sẽ mở tab mới hoàn toàn không bị giới hạn!'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-900">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg text-xs font-medium transition-colors"
          >
            {t('common.close')}
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{t('modal.openTab.copyBtn')}</span>
            </button>
            <a
              href={appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t('modal.openTab.openNowBtn')}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
