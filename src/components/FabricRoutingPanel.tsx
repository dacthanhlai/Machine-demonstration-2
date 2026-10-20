import React from 'react';
import { FabricRoutingConfig, MaterialFeedConfig, MachineComponent, FabricPathStep } from '../types/machine';
import { calculateMaterialFeedRate } from '../utils/physicsEngine';
import { useLanguage } from '../i18n';
import { getLocalizedComponentName } from '../utils/localization';
import {
  Route,
  ArrowRightLeft,
  MoveUp,
  MoveDown,
  Check,
  Sparkles,
  Layers,
  Palette,
  Eye,
  RotateCcw,
  Scale,
  Gauge,
  Zap,
} from 'lucide-react';

interface FabricRoutingPanelProps {
  fabricRouting: FabricRoutingConfig;
  onChangeFabricRouting: (updated: FabricRoutingConfig) => void;
  materialConfig: MaterialFeedConfig;
  onChangeMaterialConfig: (updated: MaterialFeedConfig) => void;
  components: MachineComponent[];
  isRunning: boolean;
}

export const FabricRoutingPanel: React.FC<FabricRoutingPanelProps> = ({
  fabricRouting,
  onChangeFabricRouting,
  materialConfig,
  onChangeMaterialConfig,
  components,
  isRunning,
}) => {
  const { t, language } = useLanguage();
  // Lấy danh sách các trục và dao tham gia hành trình dải vải dệt (loại trừ miệng hút và trống ngưng kết)
  const routableComponents = components.filter((c) => c.type !== 'suction_hood' && c.type !== 'condenser_drum');

  const layers = materialConfig.fabricLayers || 2;
  const widthMm = fabricRouting.clothWidthMm || materialConfig.feedWidthMm || 850;
  const gsm = materialConfig.basisWeightGsm || 350;
  const speed = materialConfig.feedSpeedMPerMin || 12;

  const { kgPerHour, kgPerShift, linearMeterPerHour } = calculateMaterialFeedRate(
    speed,
    widthMm,
    gsm,
    layers
  );

  // Đảm bảo steps luôn chứa đầy đủ tất cả các trục hiện có trong máy (kể cả trục mới thêm vào)
  const existingStepMap = new Map((fabricRouting.steps || []).map((s) => [s.rollerId, s]));
  const steps: FabricPathStep[] = [];

  // 1. Giữ nguyên các trục đã được cấu hình trong fabricRouting.steps nếu component còn tồn tại
  (fabricRouting.steps || []).forEach((step) => {
    if (routableComponents.some((c) => c.id === step.rollerId)) {
      steps.push(step);
    }
  });

  // 2. Tự động đồng bộ các trục mới thêm vào máy (ví dụ: trục chải worker mới thêm vào)
  routableComponents.forEach((c) => {
    if (!existingStepMap.has(c.id)) {
      steps.push({
        rollerId: c.id,
        wrapMode:
          c.type === 'worker_roller' || c.type === 'stripper_roller'
            ? 'carding_gap'
            : c.type === 'cutter_knife'
            ? 'tangent'
            : 'under',
        enabled: true,
      });
    }
  });

  // 3. Nếu steps ban đầu rỗng hoàn toàn, tự động xếp theo thứ tự tọa độ
  if (steps.length === 0) {
    routableComponents
      .sort((a, b) =>
        materialConfig.feedDirection === 'left_to_right' ? a.x - b.x : b.x - a.x
      )
      .forEach((c) => {
        const isFeedBottom = c.id === 'feed_bottom' || c.id === 'feed_bottom_2';
        steps.push({
          rollerId: c.id,
          wrapMode:
            c.type === 'feed_roller'
              ? 'under'
              : c.type === 'cutter_knife'
              ? 'tangent'
              : c.type === 'worker_roller' || c.type === 'stripper_roller'
              ? 'carding_gap'
              : 'under',
          enabled: !isFeedBottom,
        });
      });
  }

  const handleToggleStep = (rollerId: string) => {
    const existing = steps.find((s) => s.rollerId === rollerId);
    let newSteps: FabricPathStep[];
    if (existing) {
      newSteps = steps.map((s) => (s.rollerId === rollerId ? { ...s, enabled: !s.enabled } : s));
    } else {
      const comp = components.find((c) => c.id === rollerId);
      const defaultMode =
        comp?.type === 'worker_roller' || comp?.type === 'stripper_roller'
          ? 'carding_gap'
          : comp?.type === 'cutter_knife'
          ? 'tangent'
          : 'under';
      newSteps = [...steps, { rollerId, wrapMode: defaultMode, enabled: true }];
    }
    onChangeFabricRouting({ ...fabricRouting, steps: newSteps, autoRoute: false });
  };

  const handleChangeWrapMode = (rollerId: string, wrapMode: FabricPathStep['wrapMode']) => {
    const newSteps = steps.map((s) => (s.rollerId === rollerId ? { ...s, wrapMode } : s));
    onChangeFabricRouting({ ...fabricRouting, steps: newSteps, autoRoute: false });
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= steps.length) return;
    const newSteps = [...steps];
    const temp = newSteps[index];
    newSteps[index] = newSteps[targetIdx];
    newSteps[targetIdx] = temp;
    onChangeFabricRouting({ ...fabricRouting, steps: newSteps, autoRoute: false });
  };

  const handleResetAutoRoute = () => {
    const autoSteps: FabricPathStep[] = routableComponents
      .sort((a, b) =>
        materialConfig.feedDirection === 'left_to_right' ? a.x - b.x : b.x - a.x
      )
      .map((c) => {
        const isFeedBottom = c.id === 'feed_bottom' || c.id === 'feed_bottom_2';
        return {
          rollerId: c.id,
          wrapMode:
            c.type === 'feed_roller'
              ? 'under'
              : c.type === 'cutter_knife'
              ? 'tangent'
              : c.type === 'worker_roller' || c.type === 'stripper_roller'
              ? 'carding_gap'
              : 'under',
          enabled: !isFeedBottom,
        };
      });
    onChangeFabricRouting({ ...fabricRouting, steps: autoSteps, autoRoute: false });
  };

  const colorPresets = [
    { label: language === 'en' ? 'Denim Blue' : language === 'ko' ? '데님 블루' : 'Xanh Denim', hex: '#2563eb' },
    { label: language === 'en' ? 'Cotton White' : language === 'ko' ? '코튼 화이트' : 'Trắng Cotton', hex: '#f8fafc' },
    { label: language === 'en' ? 'Recycled Grey' : language === 'ko' ? '재생 섬유 그레이' : 'Xám Sợi Tái Sinh', hex: '#64748b' },
    { label: language === 'en' ? 'Scrap Red' : language === 'ko' ? '원단 레드' : 'Đỏ Vải Vụn', hex: '#e11d48' },
    { label: language === 'en' ? 'Flax Khaki' : language === 'ko' ? '마 섬유 카키' : 'Vàng Kaki', hex: '#d97706' },
  ];

  return (
    <div className="p-4 space-y-4 text-xs text-slate-200">
      {/* 0. BỘ ĐIỀU KHIỂN KHỔ RỘNG VẢI & ĐỘ DÀY (HIGHLIGHTED CARD ĐẦU TIÊN) */}
      <div className="bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-900 p-4 rounded-xl border border-indigo-500/50 shadow-xl space-y-3.5">
        <div className="flex items-center justify-between border-b border-indigo-900/60 pb-2">
          <span className="font-bold text-indigo-200 flex items-center gap-2 text-sm">
            <Layers className="w-4 h-4 text-indigo-400" />{' '}
            {language === 'en' ? 'FABRIC WIDTH & THICKNESS CONTROLLER' : language === 'ko' ? '원단 폭 및 두께 제어기' : 'BỘ ĐIỀU KHIỂN KHỔ VẢI & ĐỘ DÀY'}
          </span>
          <span className="font-mono text-indigo-300 font-bold bg-indigo-950/90 border border-indigo-500/50 px-2.5 py-0.5 rounded-lg text-xs shadow-sm">
            {fabricRouting.clothWidthMm || 850} mm
          </span>
        </div>

        {/* Khổ rộng dải vải mm */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[11px] text-slate-300">
            <span>{t('viewport.fabricWidthLabel')}</span>
            <span className="font-mono text-indigo-300 font-bold text-xs">{fabricRouting.clothWidthMm || 850} mm</span>
          </div>
          <input
            type="range"
            min="400"
            max="2000"
            step="50"
            value={fabricRouting.clothWidthMm || 850}
            onChange={(e) => {
              const val = Number(e.target.value);
              onChangeFabricRouting({ ...fabricRouting, clothWidthMm: val });
              onChangeMaterialConfig({ ...materialConfig, feedWidthMm: val });
            }}
            className="w-full accent-indigo-400 cursor-pointer h-2 bg-slate-950 rounded-lg"
          />
          {/* Nút chọn nhanh */}
          <div className="grid grid-cols-5 gap-1.5 pt-0.5">
            {[600, 850, 1200, 1600, 2000].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => {
                  onChangeFabricRouting({ ...fabricRouting, clothWidthMm: w });
                  onChangeMaterialConfig({ ...materialConfig, feedWidthMm: w });
                }}
                className={`py-1 rounded text-[11px] font-mono border transition-all cursor-pointer ${
                  (fabricRouting.clothWidthMm || 850) === w
                    ? 'bg-indigo-600 text-white border-indigo-400 font-bold shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800'
                }`}
              >
                {w}mm
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 bg-slate-950/70 p-2 rounded border border-slate-800">
            <span>
              {language === 'en' ? 'Supported width: ' : language === 'ko' ? '지원 폭: ' : 'Khổ vải hỗ trợ: '}
              <strong className="text-slate-200 font-mono">400 - 2000 mm</strong>
            </span>
            <span className="text-emerald-400 font-medium">
              {language === 'en' ? '✓ Cylinders auto-scale to width' : language === 'ko' ? '✓ 실린더 폭 자동 동기화' : '✓ Tang trống tự động co giãn theo khổ'}
            </span>
          </div>
        </div>

        {/* Số lớp vải & Độ dày tương đương */}
        <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
          <div className="flex justify-between items-center text-[11px] text-slate-300">
            <span>{t('viewport.fabricThickLabel')}</span>
            <span className="font-mono text-sky-300 font-bold">
              {layers} {language === 'en' ? 'layers' : language === 'ko' ? '겹' : 'lớp'} (~{(layers * 0.9).toFixed(1)} mm)
            </span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 6, 8].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => {
                  const updated = { ...materialConfig, fabricLayers: l };
                  const newRate = calculateMaterialFeedRate(speed, widthMm, gsm, l).kgPerHour;
                  updated.feedRateKgPerHour = newRate;
                  onChangeMaterialConfig(updated);
                }}
                className={`flex-1 py-1 rounded text-xs font-mono font-semibold border transition-all ${
                  layers === l
                    ? 'bg-sky-600 text-white border-sky-400 font-bold shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800'
                }`}
              >
                {l}L
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 1. Hướng nạp nguyên liệu chính */}
      <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <ArrowRightLeft className="w-4 h-4 text-sky-400" />{' '}
            {language === 'en' ? 'Infeed Direction (Fabric / Cotton)' : language === 'ko' ? '원단 / 솜 공급 방향' : 'Hướng Nạp Vải / Bông Vào Máy'}
          </span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/70 px-2 py-0.5 rounded">
            {materialConfig.feedSpeedMPerMin} {t('common.mPerMin')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() =>
              onChangeMaterialConfig({ ...materialConfig, feedDirection: 'left_to_right' })
            }
            className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              materialConfig.feedDirection === 'left_to_right'
                ? 'bg-sky-600 border-sky-400 text-white shadow-md shadow-sky-950 font-bold'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <span>{t('tension.dirStandard')}</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onChangeMaterialConfig({ ...materialConfig, feedDirection: 'right_to_left' })
            }
            className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              materialConfig.feedDirection === 'right_to_left'
                ? 'bg-sky-600 border-sky-400 text-white shadow-md shadow-sky-950 font-bold'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <span>{t('tension.dirReverse')}</span>
          </button>
        </div>
      </div>

      {/* 2. CẤP LIỆU: Số lượng vải / xơ cấp vào (Feed Capacity & Volume) */}
      <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-emerald-400" />{' '}
            {language === 'en' ? 'Raw Material Infeed Throughput' : language === 'ko' ? '원자재 공급 처리량' : 'Số Lượng Vải / Bông Cấp Vào Máy'}
          </span>
          <span className="font-mono text-emerald-400 font-bold text-xs bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-800/80">
            {kgPerHour} {t('common.kgPerHour')}
          </span>
        </div>

        {/* Số lớp vải cấp vào */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>
              {language === 'en' ? 'Number of simultaneous feed layers:' : language === 'ko' ? '동시 공급 원단 겹수:' : 'Số lớp vải cấp cùng lúc (Dày mỏng):'}
            </span>
            <span className="font-mono text-sky-300 font-bold">
              {layers} {language === 'en' ? 'layers' : language === 'ko' ? '겹' : 'lớp'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 6, 8].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => {
                  const updated = { ...materialConfig, fabricLayers: l };
                  const newRate = calculateMaterialFeedRate(speed, widthMm, gsm, l).kgPerHour;
                  updated.feedRateKgPerHour = newRate;
                  onChangeMaterialConfig(updated);
                }}
                className={`flex-1 py-1 rounded text-xs font-mono font-semibold border transition-all ${
                  layers === l
                    ? 'bg-sky-600 text-white border-sky-400 font-bold shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800'
                }`}
              >
                {l}L
              </button>
            ))}
          </div>
        </div>

        {/* Định lượng vải GSM */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>{language === 'en' ? 'Fabric Basis Weight (GSM):' : language === 'ko' ? '원단 평량 (GSM):' : 'Định lượng vải (GSM):'}</span>
            <span className="font-mono text-slate-200 font-semibold">{gsm} g/m²</span>
          </div>
          <input
            type="range"
            min="150"
            max="750"
            step="25"
            value={gsm}
            onChange={(e) => {
              const val = Number(e.target.value);
              const updated = { ...materialConfig, basisWeightGsm: val };
              updated.feedRateKgPerHour = calculateMaterialFeedRate(speed, widthMm, val, layers).kgPerHour;
              onChangeMaterialConfig(updated);
            }}
            className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Tốc độ cấp liệu m/phút */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>{language === 'en' ? 'Infeed conveyor linear speed:' : language === 'ko' ? '공급 컨베이어 이송 속도:' : 'Tốc độ cấp băng chuyền vào:'}</span>
            <span className="font-mono text-emerald-300 font-semibold">{speed} {t('common.mPerMin')}</span>
          </div>
          <input
            type="range"
            min="2"
            max="25"
            step="0.5"
            value={speed}
            onChange={(e) => {
              const val = Number(e.target.value);
              const updated = { ...materialConfig, feedSpeedMPerMin: val };
              updated.feedRateKgPerHour = calculateMaterialFeedRate(val, widthMm, gsm, layers).kgPerHour;
              onChangeMaterialConfig(updated);
            }}
            className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Bảng tính sản lượng nạp liệu tức thời */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800 text-[11px]">
          <div className="p-2 bg-slate-950 rounded border border-slate-800">
            <span className="text-slate-400 text-[10px] block">
              {language === 'en' ? 'Hourly output:' : language === 'ko' ? '시간당 생산량:' : 'Sản lượng theo giờ:'}
            </span>
            <span className="font-mono text-emerald-400 font-bold text-xs">{kgPerHour} kg/h</span>
          </div>
          <div className="p-2 bg-slate-950 rounded border border-slate-800">
            <span className="text-slate-400 text-[10px] block">
              {language === 'en' ? '8h shift capacity:' : language === 'ko' ? '8시간 교대 생산량:' : 'Năng suất ca 8 tiếng:'}
            </span>
            <span className="font-mono text-sky-400 font-bold text-xs">~{kgPerShift} kg/shift</span>
          </div>
        </div>
      </div>

      {/* 2. Danh sách các trục trong tuyến đường đi của vải */}
      <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Route className="w-4 h-4 text-sky-400" />
            <span className="font-semibold text-slate-100">
              {language === 'en' ? 'Fabric Threading Route' : language === 'ko' ? '원단 경로 안내' : 'Lộ Trình Luồn Vải Qua Từng Trục'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleResetAutoRoute}
            className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded text-[10px] font-medium border border-slate-700 transition-colors"
            title={t('routing.autoRoute')}
          >
            <RotateCcw className="w-3 h-3" />
            <span>{language === 'en' ? 'Auto-Sort' : language === 'ko' ? '자동 정렬' : 'Tự động sắp xếp'}</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          {t('tension.pathInstructions')}
        </p>

        {/* Danh sách các bước luồn vải */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {steps.map((step, idx) => {
            const comp = components.find((c) => c.id === step.rollerId);
            if (!comp) return null;

            return (
              <div
                key={step.rollerId}
                className={`p-2.5 rounded-lg border transition-all ${
                  step.enabled
                    ? 'bg-slate-950 border-slate-700 shadow-sm'
                    : 'bg-slate-950/40 border-slate-800 opacity-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <input
                      type="checkbox"
                      checked={step.enabled}
                      onChange={() => handleToggleStep(step.rollerId)}
                      className="accent-sky-500 rounded cursor-pointer w-4 h-4 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-sky-400 font-bold">
                          #{idx + 1}
                        </span>
                        <span className="font-semibold text-slate-100 truncate block">
                          {getLocalizedComponentName(comp, language)}
                        </span>
                      </div>
                      <span className="font-mono text-[9px] text-slate-400">
                        Ø{comp.diameter}mm · X:{comp.x} Y:{comp.y}
                      </span>
                    </div>
                  </div>

                  {/* Nút dịch chuyển thứ tự */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveStep(idx, 'up')}
                      className="p-1 hover:bg-slate-800 disabled:opacity-30 text-slate-400 hover:text-slate-200 rounded"
                      title={language === 'en' ? 'Move step up' : language === 'ko' ? '순서 위로 이동' : 'Di chuyển lên trước'}
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === steps.length - 1}
                      onClick={() => handleMoveStep(idx, 'down')}
                      className="p-1 hover:bg-slate-800 disabled:opacity-30 text-slate-400 hover:text-slate-200 rounded"
                      title={language === 'en' ? 'Move step down' : language === 'ko' ? '순서 아래로 이동' : 'Di chuyển xuống sau'}
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Chọn cách quấn tiếp xúc nếu được bật */}
                {step.enabled && (
                  <>
                    {/* Trường hợp trục chải worker roller hoặc trục bóc stripper: Bổ sung chế độ chạy trong khe chải */}
                    {comp.type === 'worker_roller' || comp.type === 'stripper_roller' ? (
                      <div className="space-y-1.5 mt-2 pt-2 border-t border-slate-800/80">
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleChangeWrapMode(step.rollerId, 'carding_gap')}
                            className={`py-1.5 px-2 rounded text-[10px] font-bold transition-all text-center col-span-2 flex items-center justify-center gap-1.5 ${
                              step.wrapMode === 'carding_gap'
                                ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-400'
                                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-700'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                            <span>
                              {language === 'en' ? 'Carding Gap (Between roller & cylinder)' : language === 'ko' ? '소면 간극 통과 (실린더-롤러 사이)' : 'Giữa trục & trống (Chạy trong khe chải)'}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChangeWrapMode(step.rollerId, 'under')}
                            className={`py-1 px-1.5 rounded text-[10px] font-medium transition-colors text-center ${
                              step.wrapMode === 'under'
                                ? 'bg-indigo-600 text-white font-bold shadow-sm'
                                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                            }`}
                          >
                            {language === 'en' ? 'Outer Lower' : language === 'ko' ? '하부 외곽' : 'Vòng ngoài dưới'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChangeWrapMode(step.rollerId, 'over')}
                            className={`py-1 px-1.5 rounded text-[10px] font-medium transition-colors text-center ${
                              step.wrapMode === 'over'
                                ? 'bg-sky-600 text-white font-bold shadow-sm'
                                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                            }`}
                          >
                            {language === 'en' ? 'Outer Upper' : language === 'ko' ? '상부 외곽' : 'Vòng ngoài trên'}
                          </button>
                        </div>

                        <div className="p-2 bg-emerald-950/70 border border-emerald-700/60 rounded text-[10px] text-emerald-200 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>
                              {step.wrapMode === 'carding_gap'
                                ? (language === 'en' ? 'Material feeds precisely inside the 1.5 - 3mm technical carding gap' : language === 'ko' ? '원단 및 섬유가 실린더와 롤러 사이 1.5 - 3mm 소면 간극에서 개섬됩니다' : 'Dòng vải/xơ chạy kẹp chính xác trong khe hở kỹ thuật 1.5 - 3mm giữa trục chải và trống chính')
                                : (language === 'en' ? 'Material routes around satellite roller exterior' : language === 'ko' ? '원단이 위성 롤러 외곽으로 우회합니다' : 'Dòng vải chạy vòng ra ngoài trục vệ tinh')}
                            </span>
                          </span>
                          <span className="font-mono text-emerald-400 font-bold shrink-0 ml-1">
                            {step.wrapMode === 'carding_gap' ? (language === 'en' ? 'Carding Nip' : language === 'ko' ? '간극 닙' : 'Khe chải kẹp') : (language === 'en' ? 'Outer' : language === 'ko' ? '외곽' : 'Vòng ngoài')}
                          </span>
                        </div>
                      </div>
                    ) : comp.type === 'main_drum' ? (
                      <div className="space-y-1.5 mt-2 pt-2 border-t border-slate-800/80">
                        <div className="grid grid-cols-3 gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleChangeWrapMode(step.rollerId, 'under')}
                            className={`py-1.5 px-1.5 rounded text-[10px] font-bold transition-all text-center ${
                              step.wrapMode === 'under'
                                ? 'bg-indigo-600 text-white shadow-md ring-1 ring-indigo-400'
                                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                            }`}
                          >
                            {language === 'en' ? 'Under Wrap (~180°)' : language === 'ko' ? '하부 랩핑 (~180°)' : 'Ôm đáy & sườn ra'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChangeWrapMode(step.rollerId, 'over')}
                            className={`py-1.5 px-1.5 rounded text-[10px] font-medium transition-colors text-center ${
                              step.wrapMode === 'over'
                                ? 'bg-sky-600 text-white font-bold shadow-sm'
                                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                            }`}
                          >
                            {language === 'en' ? 'Top Wrap (~160°)' : language === 'ko' ? '상부 정점 (~160°)' : 'Ôm nửa trên đỉnh'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChangeWrapMode(step.rollerId, 'tangent')}
                            className={`py-1.5 px-1.5 rounded text-[10px] font-medium transition-colors text-center ${
                              step.wrapMode === 'tangent'
                                ? 'bg-emerald-600 text-white font-bold shadow-sm'
                                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                            }`}
                          >
                            {language === 'en' ? 'Tangent Nip' : language === 'ko' ? '접선 접촉' : 'Tiếp xúc xé'}
                          </button>
                        </div>

                        <div className="p-2 bg-indigo-950/70 border border-indigo-700/60 rounded text-[10px] text-indigo-200 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span>
                              {step.wrapMode === 'under'
                                ? (language === 'en' ? 'Natural under-wrap: From ledger knife around bottom cylinder arc (~180°)' : language === 'ko' ? '자연스러운 하부 감김: 나이프에서 실린더 바닥을 감싸 올라가는 경로 (~180°)' : 'Cung ôm tự nhiên: Ôm từ dao cắt qua đáy và lượn lên sườn ra (~180° chu vi)')
                                : step.wrapMode === 'over'
                                ? (language === 'en' ? 'Top cylinder arc: Over the top half of the drum (~160°)' : language === 'ko' ? '실린더 상부 랩핑: 드럼 윗부분 통과 (~160°)' : 'Cung ôm đỉnh trống: Đi qua nửa trên chu vi (~160°)')
                                : (language === 'en' ? 'Tangent: Touches opening point and transfers immediately' : language === 'ko' ? '접선: 개섬 지점에서 즉시 분리' : 'Tiếp tuyến: Chạm tiếp xúc điểm xé')}
                            </span>
                          </span>
                          <span className="font-mono text-emerald-400 font-bold shrink-0 ml-1">
                            {step.wrapMode === 'under' ? (language === 'en' ? 'Full ~180°' : language === 'ko' ? '완전 180°' : 'Ôm đầy đủ ~180°') : (language === 'en' ? 'Tangent' : language === 'ko' ? '접선' : 'Tiếp xúc')}
                          </span>
                        </div>
                      </div>
                    ) : comp.type === 'cutter_knife' ? (
                      <div className="space-y-1.5 mt-2 pt-2 border-t border-slate-800/80">
                        <div className="grid grid-cols-3 gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleChangeWrapMode(step.rollerId, 'over')}
                            className={`py-1.5 px-1.5 rounded text-[10px] font-bold transition-all text-center ${
                              step.wrapMode === 'over'
                                ? 'bg-sky-600 text-white shadow-md ring-1 ring-sky-400'
                                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                            }`}
                          >
                            {language === 'en' ? 'Over Knife' : language === 'ko' ? '나이프 상부' : 'Vòng trên dao cắt'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChangeWrapMode(step.rollerId, 'tangent')}
                            className={`py-1.5 px-1.5 rounded text-[10px] font-medium transition-colors text-center ${
                              step.wrapMode === 'tangent'
                                ? 'bg-emerald-600 text-white font-bold shadow-sm'
                                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                            }`}
                          >
                            {language === 'en' ? 'Blade Edge Nip' : language === 'ko' ? '나이프 엣지' : 'Tiếp xúc mũi dao'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChangeWrapMode(step.rollerId, 'under')}
                            className={`py-1.5 px-1.5 rounded text-[10px] font-medium transition-colors text-center ${
                              step.wrapMode === 'under'
                                ? 'bg-indigo-600 text-white font-bold shadow-sm'
                                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                            }`}
                          >
                            {language === 'en' ? 'Under Base' : language === 'ko' ? '베이스 하부' : 'Vòng dưới dao'}
                          </button>
                        </div>

                        <div className="p-2 bg-sky-950/70 border border-sky-700/60 rounded text-[10px] text-sky-200 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            <span>
                              {step.wrapMode === 'over'
                                ? (language === 'en' ? 'Standard opener: Fabric feeds under feed roller ➔ over bed knife ➔ drawn down into tearing nip.' : language === 'ko' ? '표준 개섬: 원단이 피드 롤러 아래 ➔ 베드 나이프 상부 ➔ 실린더 닙으로 당겨져 개섬됩니다.' : 'Chuẩn xé vải: Vải đi dưới feed roller ➔ qua tấm chắn mỏng ➔ vòng trên dao cắt ➔ bị trống lớn kéo xuống xé tại khe cắt.')
                                : step.wrapMode === 'tangent'
                                ? (language === 'en' ? 'Cutting edge contact: Fabric makes direct contact with blade tip before cylinder wire pulls it.' : language === 'ko' ? '나이프 팁 접촉: 실린더 침포가 당기기 전 나이프 엣지와 직접 접촉합니다.' : 'Tiếp xúc mép cắt: Vải tiếp xúc trực tiếp tại lưỡi dao trước khi răng trống kéo vào.')
                                : (language === 'en' ? 'Under knife bracket base.' : language === 'ko' ? '나이프 브래킷 하부 우회.' : 'Vòng qua đáy dưới của bệ dao cắt.')}
                            </span>
                          </span>
                          <span className="font-mono text-emerald-400 font-bold shrink-0 ml-1">
                            {step.wrapMode === 'over' ? (language === 'en' ? 'Standard' : language === 'ko' ? '표준' : 'Chuẩn máy xé') : step.wrapMode === 'tangent' ? (language === 'en' ? 'Edge Nip' : language === 'ko' ? '접선' : 'Tiếp xúc') : (language === 'en' ? 'Under' : language === 'ko' ? '하부' : 'Vòng dưới')}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="grid grid-cols-3 gap-1.5 mt-2 pt-2 border-t border-slate-800/80">
                          <button
                            type="button"
                            onClick={() => handleChangeWrapMode(step.rollerId, 'over')}
                            className={`py-1 px-1.5 rounded text-[10px] font-medium transition-colors text-center ${
                              step.wrapMode === 'over'
                                ? 'bg-sky-600 text-white font-bold shadow-sm'
                                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                            }`}
                          >
                            {language === 'en' ? 'Upper Wrap' : language === 'ko' ? '상부 랩핑' : 'Vòng trên'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChangeWrapMode(step.rollerId, 'under')}
                            className={`py-1 px-1.5 rounded text-[10px] font-medium transition-colors text-center ${
                              step.wrapMode === 'under'
                                ? 'bg-indigo-600 text-white font-bold shadow-sm'
                                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                            }`}
                          >
                            {language === 'en' ? 'Lower Wrap' : language === 'ko' ? '하부 랩핑' : 'Vòng dưới'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChangeWrapMode(step.rollerId, 'tangent')}
                            className={`py-1 px-1.5 rounded text-[10px] font-medium transition-colors text-center ${
                              step.wrapMode === 'tangent'
                                ? 'bg-emerald-600 text-white font-bold shadow-sm'
                                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                            }`}
                          >
                            {language === 'en' ? 'Tangent Nip' : language === 'ko' ? '접선 접촉' : 'Tiếp xúc cắt'}
                          </button>
                        </div>

                        {comp.type === 'feed_roller' && step.wrapMode === 'under' && (
                          <div className="mt-2 p-2 bg-indigo-950/70 border border-indigo-700/60 rounded text-[10px] text-indigo-200 flex items-center justify-between">
                            <span className="flex items-center gap-1.5 font-medium">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              <span>
                                {language === 'en' ? 'Standard rule: Passes under feed roller ➔ leads into knife & drum nip.' : language === 'ko' ? '표준 규칙: 피드 롤러 하부를 지나 ➔ 나이프 및 실린더 닙으로 진입합니다.' : 'Quy tắc chuẩn: Đi vòng dưới feed roller ➔ ôm trục chuyển vào khe dao & trống ➔ bị trống lớn cuốn xuống.'}
                              </span>
                            </span>
                            <span className="font-mono text-emerald-400 font-bold shrink-0 ml-1">
                              {language === 'en' ? 'Standard' : language === 'ko' ? '표준' : 'Chuẩn máy xé'}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Tùy chỉnh mô hình 3D: Khổ vải & Màu sắc & Bông xơ */}
      <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-3">
        <span className="font-semibold text-slate-200 flex items-center gap-1.5">
          <Palette className="w-4 h-4 text-sky-400" />{' '}
          {language === 'en' ? '3D Fabric & Fiber Visuals' : language === 'ko' ? '3D 원단 및 섬유 비주얼 설정' : 'Tùy Chỉnh Mô Hình Vải & Bông 3D'}
        </span>

        {/* Khổ rộng vải */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>{language === 'en' ? '3D Fabric Width:' : language === 'ko' ? '3D 원단 폭:' : 'Khổ rộng dải vải 3D:'}</span>
            <span className="font-mono text-sky-300 font-bold">{fabricRouting.clothWidthMm || 850} mm</span>
          </div>
          <input
            type="range"
            min="400"
            max="2000"
            step="50"
            value={fabricRouting.clothWidthMm || 850}
            onChange={(e) =>
              onChangeFabricRouting({ ...fabricRouting, clothWidthMm: Number(e.target.value) })
            }
            className="w-full accent-sky-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Màu sắc mô hình vải */}
        <div className="space-y-1.5 pt-1">
          <label className="text-[11px] text-slate-400 block">
            {language === 'en' ? '3D Woven Fabric Color:' : language === 'ko' ? '3D 직물 색상:' : 'Màu sắc tấm vải dệt 3D:'}
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {colorPresets.map((p) => (
              <button
                key={p.hex}
                type="button"
                onClick={() => onChangeFabricRouting({ ...fabricRouting, clothColor: p.hex })}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded border text-[10px] font-medium transition-all ${
                  fabricRouting.clothColor === p.hex
                    ? 'border-sky-400 bg-slate-800 text-white font-bold'
                    : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full border border-slate-600 shrink-0"
                  style={{ backgroundColor: p.hex }}
                />
                <span className="truncate">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bật hạt bông xơ 3D */}
        <label className="flex items-center gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={fabricRouting.fiberTuftParticles !== false}
            onChange={(e) =>
              onChangeFabricRouting({ ...fabricRouting, fiberTuftParticles: e.target.checked })
            }
            className="accent-sky-500 rounded cursor-pointer w-4 h-4"
          />
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            {language === 'en' ? 'Display 3D fluffy fiber tufts & suction airflow during operation' : language === 'ko' ? '기계 작동 중 3D 솜 뭉치 및 흡입 기류 표시' : 'Hiển thị cụm bông xơ 3D tơi xốp & luồng khí hút khi máy xé vải'}
          </span>
        </label>

        {/* Tùy chọn Ẩn / Hiện Cây cuộn vải cấp liệu 3D phía trước */}
        <label className="flex items-center gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={fabricRouting.showSupplyRoll !== false}
            onChange={(e) =>
              onChangeFabricRouting({ ...fabricRouting, showSupplyRoll: e.target.checked })
            }
            className="accent-indigo-500 rounded cursor-pointer w-4 h-4"
          />
          <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>{t('fabric.supplyRoll')} ({t('fabric.supplyRollToggle')})</span>
        </label>
      </div>

      {/* 4. Trạng thái chạy mô phỏng & Nguyên lý công nghệ chuẩn */}
      <div className="p-3 bg-slate-950 rounded-lg border border-emerald-950/60 text-[11px] text-slate-400 space-y-1.5">
        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
          <Eye className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t('routing.principleTitle')}</span>
        </div>
        <p className="leading-relaxed">
          {t('routing.principleBody')}
        </p>
      </div>
    </div>
  );
};
