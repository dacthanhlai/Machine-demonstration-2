import React, { useState } from 'react';
import { MachineComponent, SuctionSystemConfig, MaterialFeedConfig, ClearanceItem, TechnicalConflict } from '../types/machine';
import { useLanguage } from '../i18n';
import { X, Copy, Check, Download, FileText, CheckCircle2 } from 'lucide-react';

import { getLocalizedName, getLocalizedDiagnosticAlert } from '../utils/localization';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  components: MachineComponent[];
  suctionConfig: SuctionSystemConfig;
  materialConfig: MaterialFeedConfig;
  clearances: ClearanceItem[];
  conflicts: TechnicalConflict[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  components,
  suctionConfig,
  materialConfig,
  clearances,
  conflicts,
}) => {
  const { t, language } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'json' | 'report'>('report');

  if (!isOpen) return null;

  const exportData = {
    exportedAt: new Date().toISOString(),
    machineSummary: {
      totalComponents: components.length,
      material: materialConfig.materialName,
      feedRateKgH: materialConfig.feedRateKgPerHour,
      suctionVelocityMs: suctionConfig.airVelocity,
      safetyStatus: conflicts.length === 0
        ? (language === 'en' ? 'SAFE' : language === 'ko' ? '안전' : 'AN TOÀN')
        : (language === 'en' ? `${conflicts.length} ISSUES FLAGGED` : language === 'ko' ? `${conflicts.length}개 주의 항목` : `${conflicts.length} VẤN ĐỀ CẦN LƯU Ý`),
    },
    components,
    suctionConfig,
    materialConfig,
    clearances,
  };

  const jsonString = JSON.stringify(exportData, null, 2);

  const getTechnicalReport = () => {
    if (language === 'en') {
      return `=====================================================
INDUSTRIAL TEXTILE RECYCLING MACHINE SPECIFICATION REPORT
Export Time: ${new Date().toLocaleString('en-US')}
=====================================================

1. OPERATIONAL & MATERIAL PARAMETERS:
- Material Type: ${materialConfig.materialName}
- Feed Direction: ${materialConfig.feedDirection === 'left_to_right' ? 'Left to Right' : 'Right to Left'}
- Feed Speed: ${materialConfig.feedSpeedMPerMin} m/min (Throughput: ${materialConfig.feedRateKgPerHour} kg/h)
- Nominal Tension: ${materialConfig.nominalTensionN} N
- Suction System: ${suctionConfig.active ? 'ACTIVE' : 'OFF'} | Air Velocity: ${suctionConfig.airVelocity} m/s | Flow: ${suctionConfig.airflowRate} m3/h

2. MACHINE COMPONENTS & ROLLERS (${components.length} items):
${components
  .map(
    (c, i) =>
      ` ${i + 1}. ${getLocalizedName(c.name, 'en')} [${c.type}]
    - Center Coords: X=${c.x} mm, Y=${c.y} mm
    - Diameter Ø: ${c.diameter} mm | Length: ${c.length} mm
    - Rotation: ${c.rotationDir} | Speed: ${c.rpm} RPM
    - Surface: ${c.surfaceType}`
  )
  .join('\n')}

3. CLEARANCE DISTANCE MATRIX (mm):
${clearances
  .map(
    (cl) =>
      `- ${getLocalizedName(cl.nameA, 'en')} ↔ ${getLocalizedName(cl.nameB, 'en')}: ${cl.gapMm} mm [Target: ${cl.recommendedGapMin}-${cl.recommendedGapMax}mm] -> ${
        cl.gapMm < 0 ? 'COLLISION DANGER' : cl.status === 'optimal' ? 'OPTIMAL' : 'ADJUST'
      }`
  )
  .join('\n')}

4. DIAGNOSTIC SAFETY AUDIT:
${
  conflicts.length === 0
    ? '✔ ZERO TECHNICAL CONFLICTS DETECTED. Machine operates within safe engineering standards.'
    : conflicts
        .map((cf, i) => {
          const loc = getLocalizedDiagnosticAlert(cf, 'en');
          return `[${loc.level.toUpperCase()}] ${i + 1}. ${loc.title}\n   Details: ${loc.description}\n   Remedy: ${loc.recommendation}`;
        })
        .join('\n\n')
}
=====================================================`;
    }

    if (language === 'ko') {
      return `=====================================================
산업용 섬유 개섬기 기술 사양 및 안전 점검 보고서
출력 일시: ${new Date().toLocaleString('ko-KR')}
=====================================================

1. 운전 조건 및 원단 사양:
- 투입 원단 종류: ${materialConfig.materialName}
- 공급 방향: ${materialConfig.feedDirection === 'left_to_right' ? '좌측 -> 우측' : '우측 -> 좌측'}
- 공급 속도: ${materialConfig.feedSpeedMPerMin} m/min (시간당 생산량: ${materialConfig.feedRateKgPerHour} kg/h)
- 공칭 장력: ${materialConfig.nominalTensionN} N
- 집진 흡입 시스템: ${suctionConfig.active ? '가동 중' : '정지'} | 풍속: ${suctionConfig.airVelocity} m/s | 유량: ${suctionConfig.airflowRate} m3/h

2. 롤러 및 구성 부품 목록 (${components.length}개):
${components
  .map(
    (c, i) =>
      ` ${i + 1}. ${getLocalizedName(c.name, 'ko')} [${c.type}]
    - 중심 좌표: X=${c.x} mm, Y=${c.y} mm
    - 롤러 직경 Ø: ${c.diameter} mm | 면장: ${c.length} mm
    - 회전 방향: ${c.rotationDir} | 회전수: ${c.rpm} RPM
    - 표면 형태: ${c.surfaceType}`
  )
  .join('\n')}

3. 롤러 간극 실측 매트릭스 (CLEARANCE MATRIX):
${clearances
  .map(
    (cl) =>
      `- ${getLocalizedName(cl.nameA, 'ko')} ↔ ${getLocalizedName(cl.nameB, 'ko')}: ${cl.gapMm} mm [권장치: ${cl.recommendedGapMin}-${cl.recommendedGapMax}mm] -> ${
        cl.gapMm < 0 ? '충돌 위험' : cl.status === 'optimal' ? '적합' : '간극 조정 필요'
      }`
  )
  .join('\n')}

4. 기술 진단 및 안전 점검 결과:
${
  conflicts.length === 0
    ? '✔ 기술적 충돌 및 간섭 없음. 안전 규격 충족.'
    : conflicts
        .map((cf, i) => {
          const loc = getLocalizedDiagnosticAlert(cf, 'ko');
          return `[${loc.level.toUpperCase()}] ${i + 1}. ${loc.title}\n   세부사항: ${loc.description}\n   조치사항: ${loc.recommendation}`;
        })
        .join('\n\n')
}
=====================================================`;
    }

    return `=====================================================
BÁO CÁO KỸ THUẬT CẤU HÌNH & AN TOÀN MÁY XÉ VẢI CÔNG NGHIỆP
Thời gian xuất: ${new Date().toLocaleString('vi-VN')}
=====================================================

1. THÔNG SỐ VẬN HÀNH & NGUYÊN LIỆU:
- Loại nguyên liệu: ${materialConfig.materialName}
- Hướng cấp liệu: ${materialConfig.feedDirection === 'left_to_right' ? 'Trái sang Phải' : 'Phải sang Trái'}
- Tốc độ cấp: ${materialConfig.feedSpeedMPerMin} m/phút (Năng suất: ${materialConfig.feedRateKgPerHour} kg/giờ)
- Lực căng danh định: ${materialConfig.nominalTensionN} N
- Hệ thống hút gió: ${suctionConfig.active ? 'ĐANG BẬT' : 'TẮT'} | Tốc độ gió: ${suctionConfig.airVelocity} m/s | Lưu lượng: ${suctionConfig.airflowRate} m3/h

2. DANH MỤC TRỤC & CHI TIẾT MÁY (${components.length} chi tiết):
${components
  .map(
    (c, i) =>
      ` ${i + 1}. ${c.name} [${c.type}]
    - Tọa độ tâm: X=${c.x} mm, Y=${c.y} mm
    - Đường kính Ø: ${c.diameter} mm | Chiều dài: ${c.length} mm
    - Chiều quay: ${c.rotationDir} | Tốc độ: ${c.rpm} RPM
    - Bề mặt: ${c.surfaceType}`
  )
  .join('\n')}

3. BẢNG CỰ LY KHE HỞ THỰC TẾ (CLEARANCE MATRIX):
${clearances
  .map(
    (cl) =>
      `- ${cl.nameA} ↔ ${cl.nameB}: ${cl.gapMm} mm [Chuẩn: ${cl.recommendedGapMin}-${cl.recommendedGapMax}mm] -> ${
        cl.gapMm < 0 ? 'CẢNH BÁO VA CHẠM' : cl.status === 'optimal' ? 'ĐẠT CHUẨN' : 'CẦN CHỈNH'
      }`
  )
  .join('\n')}

4. KẾT QUẢ CHẨN ĐOÁN LỖI KỸ THUẬT:
${
  conflicts.length === 0
    ? '✔ KHÔNG CÓ XUNG ĐỘT KỸ THUẬT. Hệ thống đạt độ an toàn vận hành cao nhất.'
    : conflicts
        .map(
          (cf, i) =>
            `[${cf.level.toUpperCase()}] ${i + 1}. ${cf.title}
   Chi tiết: ${cf.description}
   Khắc phục: ${cf.recommendation}`
        )
        .join('\n\n')
}
=====================================================`;
  };

  const technicalReport = getTechnicalReport();
  const textToCopy = activeTab === 'json' ? jsonString : technicalReport;

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([textToCopy], { type: activeTab === 'json' ? 'application/json' : 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeTab === 'json' ? 'textile_machine_config.json' : 'textile_machine_technical_report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-semibold text-slate-100">{t('modal.export.title')}</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('report')}
            className={`pb-2.5 font-medium border-b-2 transition-colors ${
              activeTab === 'report' ? 'border-sky-500 text-sky-300' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('modal.export.pdf')} (.txt)
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`pb-2.5 font-medium border-b-2 transition-colors ${
              activeTab === 'json' ? 'border-sky-500 text-sky-300' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('modal.export.json')} (.json)
          </button>
        </div>

        {/* Code Content View */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-[11px] bg-slate-950 text-slate-300 whitespace-pre">
          {textToCopy}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-900">
          <span className="text-xs text-slate-400">
            {conflicts.length === 0 ? t('diagnostics.noConflicts') : `${conflicts.length} ${t('diagnostics.conflicts')}`}
          </span>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t('common.copied') : t('common.copy')}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('header.exportSpecs')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
