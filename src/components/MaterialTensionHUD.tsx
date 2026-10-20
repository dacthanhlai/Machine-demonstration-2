import React from 'react';
import { MaterialFeedConfig, SuctionSystemConfig, TensionSegment, FabricRoutingConfig, MachineComponent, FabricPathStep } from '../types/machine';
import { useLanguage } from '../i18n';
import { ArrowLeftRight, Wind, Activity, Gauge, Flame, CheckCircle2, AlertTriangle, AlertCircle, Route, Sparkles, MoveUp, MoveDown, Check } from 'lucide-react';

interface MaterialTensionHUDProps {
  materialConfig: MaterialFeedConfig;
  onChangeMaterialConfig: (updated: MaterialFeedConfig) => void;
  suctionConfig: SuctionSystemConfig;
  onChangeSuctionConfig: (updated: SuctionSystemConfig) => void;
  tensions: TensionSegment[];
  fabricRouting: FabricRoutingConfig;
  onChangeFabricRouting: (updated: FabricRoutingConfig) => void;
  components: MachineComponent[];
  isRunning: boolean;
}

export const MaterialTensionHUD: React.FC<MaterialTensionHUDProps> = ({
  materialConfig,
  onChangeMaterialConfig,
  suctionConfig,
  onChangeSuctionConfig,
  tensions,
  fabricRouting,
  onChangeFabricRouting,
  components,
  isRunning,
}) => {
  const { t, language } = useLanguage();
  // Lấy danh sách các trục có thể luồn vải (trừ miệng hút)
  const availableRollers = components.filter((c) => c.type !== 'suction_hood');

  // Khởi tạo các bước nếu chưa có
  const steps = fabricRouting.steps.length > 0
    ? fabricRouting.steps
    : availableRollers.map((r, i) => ({
        rollerId: r.id,
        wrapMode: (i % 2 === 0 ? 'under' : 'over') as FabricPathStep['wrapMode'],
        enabled: true,
      }));

  const handleToggleStep = (rollerId: string) => {
    const existing = steps.find((s) => s.rollerId === rollerId);
    let newSteps: FabricPathStep[];
    if (existing) {
      newSteps = steps.map((s) => (s.rollerId === rollerId ? { ...s, enabled: !s.enabled } : s));
    } else {
      newSteps = [...steps, { rollerId, wrapMode: 'under', enabled: true }];
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

  return (
    <div className="p-4 space-y-4 text-xs text-slate-200">
      {/* 1. Hướng đi của nguyên liệu & Cấu hình cấp vải */}
      <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <ArrowLeftRight className="w-4 h-4 text-sky-400" /> {language === 'en' ? 'Raw Material Infeed' : language === 'ko' ? '원자재 공급 스트림' : 'Luồng Cấp Nguyên Liệu (Vải/Bông)'}
          </span>
          <span className="font-mono text-[11px] text-slate-400">{materialConfig.feedRateKgPerHour} kg/{language === 'en' ? 'h' : language === 'ko' ? '시간' : 'giờ'}</span>
        </div>

        {/* Chuyển đổi hướng cấp liệu Trái ➔ Phải hoặc Phải ➔ Trái */}
        <div>
          <label className="text-[11px] text-slate-400 mb-1.5 block">{language === 'en' ? 'Infeed travel direction:' : language === 'ko' ? '원단 이송 방향:' : 'Hướng di chuyển của vải/bông vào máy:'}</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChangeMaterialConfig({ ...materialConfig, feedDirection: 'left_to_right' })}
              className={`py-2 px-3 rounded border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                materialConfig.feedDirection === 'left_to_right'
                  ? 'bg-sky-950/80 border-sky-500 text-sky-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{language === 'en' ? 'Left ➔ Right (Std)' : language === 'ko' ? '좌 ➔ 우 (표준)' : 'Trái ➔ Phải (Tiêu chuẩn)'}</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeMaterialConfig({ ...materialConfig, feedDirection: 'right_to_left' })}
              className={`py-2 px-3 rounded border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                materialConfig.feedDirection === 'right_to_left'
                  ? 'bg-sky-950/80 border-sky-500 text-sky-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{language === 'en' ? 'Right ➔ Left (Rev)' : language === 'ko' ? '우 ➔ 좌 (역방향)' : 'Phải ➔ Trái (Nghịch)'}</span>
            </button>
          </div>
        </div>

        {/* Loại nguyên liệu đầu vào */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div>
            <label className="text-[11px] text-slate-400 mb-1 block">{language === 'en' ? 'Fabric material type:' : language === 'ko' ? '원단 종류:' : 'Chủng loại vải xé:'}</label>
            <select
              value={materialConfig.materialType}
              onChange={(e) =>
                onChangeMaterialConfig({
                  ...materialConfig,
                  materialType: e.target.value as MaterialFeedConfig['materialType'],
                })
              }
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-sky-500"
            >
              <option value="cotton_denim">{language === 'en' ? 'Cotton Denim Scrap' : language === 'ko' ? '데님 원단' : 'Vải bò / Denim dày (Khó xé)'}</option>
              <option value="knit_cotton">{language === 'en' ? 'Knitted Cotton' : language === 'ko' ? '니트 코튼' : 'Vải thun dệt kim Cotton (Dễ dãn)'}</option>
              <option value="synthetic_poly">{language === 'en' ? 'Synthetic Poly/PET' : language === 'ko' ? '합성 폴리/PET' : 'Vải sợi nhân tạo PE/Poly'}</option>
              <option value="blended_waste">{language === 'en' ? 'Blended Textile Waste' : language === 'ko' ? '혼방 재생 원단' : 'Vải vụn hỗn hợp may mặc'}</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 mb-1 block">{language === 'en' ? 'Feed speed (m/min):' : language === 'ko' ? '공급 속도 (m/분):' : 'Tốc độ nạp (m/phút):'}</label>
            <input
              type="number"
              min="2"
              max="60"
              value={materialConfig.feedSpeedMPerMin}
              onChange={(e) =>
                onChangeMaterialConfig({
                  ...materialConfig,
                  feedSpeedMPerMin: Number(e.target.value),
                })
              }
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 font-mono text-xs text-slate-200 outline-none focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      {/* 2. Tuyến Đường Luồn Vải & Hướng Đi Qua Các Trục (Fabric Threading Path) */}
      <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Route className="w-4 h-4 text-sky-400" /> {language === 'en' ? '3D Fabric Threading Route' : language === 'ko' ? '3D 원단 이송 경로' : 'Tuyến Đường Đi Của Vải / Bông (3D Routing)'}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onChangeFabricRouting({ ...fabricRouting, autoRoute: !fabricRouting.autoRoute })}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-colors ${
                fabricRouting.autoRoute
                  ? 'bg-sky-950/80 border-sky-600 text-sky-300'
                  : 'bg-slate-950 border-slate-700 text-slate-400'
              }`}
            >
              {fabricRouting.autoRoute ? (language === 'en' ? 'AUTO' : language === 'ko' ? '자동' : 'TỰ ĐỘNG') : (language === 'en' ? 'CUSTOM' : language === 'ko' ? '사용자 정의' : 'TỰ CHỌN')}
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-400">
          {language === 'en' ? 'Select rollers along fabric path, choose wrap mode (Top / Bottom / Carding Nip):' : language === 'ko' ? '원단이 통과할 롤러를 선택하고 감김 방식을 지정하세요:' : 'Chọn các trục mà dải vải/bông sẽ luồn qua, chọn cách quấn tiếp xúc (Mặt Trên / Mặt Dưới / Tiếp Tuyến Kẹp):'}
        </p>

        {/* Danh sách các trục trong tuyến luồn vải */}
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {availableRollers.map((r, idx) => {
            const step = steps.find((s) => s.rollerId === r.id);
            const isEnabled = step ? step.enabled : false;
            const wrapMode = step ? step.wrapMode : 'under';

            return (
              <div
                key={r.id}
                className={`p-2 rounded-lg border transition-all flex items-center justify-between gap-2 ${
                  isEnabled ? 'bg-slate-950 border-slate-700' : 'bg-slate-950/40 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={() => handleToggleStep(r.id)}
                    className="accent-sky-500 rounded cursor-pointer w-3.5 h-3.5"
                  />
                  <div className="overflow-hidden">
                    <span className="font-semibold text-slate-200 truncate block max-w-[130px]">{r.name}</span>
                    <span className="font-mono text-[9px] text-slate-500">Ø{r.diameter}mm</span>
                  </div>
                </div>

                {/* Chọn cách quấn tiếp xúc */}
                {isEnabled && (
                  <div className="flex items-center gap-1">
                    {(r.type === 'worker_roller' || r.type === 'stripper_roller') && (
                      <button
                        type="button"
                        onClick={() => handleChangeWrapMode(r.id, 'carding_gap')}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                          wrapMode === 'carding_gap' ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                        title={language === 'en' ? 'Fabric feeds inside technical carding gap' : language === 'ko' ? '원단이 정밀 소면 간극을 통해 통과' : 'Vải chạy trong khe chải kỹ thuật giữa trục và trống chính'}
                      >
                        {language === 'en' ? 'Carding' : language === 'ko' ? '소면' : 'Khe chải'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleChangeWrapMode(r.id, 'under')}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                        wrapMode === 'under' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                      title={r.type === 'main_drum' ? (language === 'en' ? 'Natural under-wrap: Around bottom cylinder arc (~180°)' : language === 'ko' ? '자연스러운 하부 감김: 드럼 바닥 통과 (~180°)' : 'Cung ôm tự nhiên: Qua đáy trống và lượn lên sườn ra (~180°)') : (language === 'en' ? 'Under wrap' : language === 'ko' ? '하부 감김' : 'Vải luồn vòng cung mặt dưới')}
                    >
                      {r.type === 'main_drum' ? (language === 'en' ? 'Full wrap' : language === 'ko' ? '완전 감김' : 'Ôm đầy đủ') : (language === 'en' ? 'Under' : language === 'ko' ? '하부' : 'Dưới')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChangeWrapMode(r.id, 'over')}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                        wrapMode === 'over' ? 'bg-sky-600 text-white font-bold' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                      title={language === 'en' ? 'Over drum/roller' : language === 'ko' ? '상부 감김' : 'Vải luồn qua mặt trên tang trống'}
                    >
                      {language === 'en' ? 'Over' : language === 'ko' ? '상부' : 'Trên'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChangeWrapMode(r.id, 'tangent')}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                        wrapMode === 'tangent' ? 'bg-amber-600 text-white font-bold' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                      title={language === 'en' ? 'Tangent blade nip contact' : language === 'ko' ? '나이프 엣지 접촉' : 'Tiếp xúc cắt mép dao'}
                    >
                      {language === 'en' ? 'Nip' : language === 'ko' ? '접선' : 'Mép cắt'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Thiết lập khổ rộng và màu dải vải 3D */}
        <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <label className="text-slate-400 block mb-1">{language === 'en' ? '3D Fabric Width (mm):' : language === 'ko' ? '3D 원단 폭 (mm):' : 'Khổ rộng vải 3D (mm):'}</label>
            <input
              type="number"
              min="400"
              max="2000"
              step="50"
              value={fabricRouting.clothWidthMm}
              onChange={(e) => onChangeFabricRouting({ ...fabricRouting, clothWidthMm: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 font-mono text-slate-200 outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">{language === 'en' ? '3D Fabric Color:' : language === 'ko' ? '3D 원단 색상:' : 'Màu dải vải 3D:'}</label>
            <select
              value={fabricRouting.clothColor}
              onChange={(e) => onChangeFabricRouting({ ...fabricRouting, clothColor: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 outline-none focus:border-sky-500"
            >
              <option value="#2563eb">{language === 'en' ? 'Indigo Blue (Denim)' : language === 'ko' ? '인디고 블루 (데님)' : 'Xanh Indigo (Denim / Vải Jean)'}</option>
              <option value="#f8fafc">{language === 'en' ? 'Cotton White' : language === 'ko' ? '코튼 화이트' : 'Trắng Tinh (Bông xơ Cotton)'}</option>
              <option value="#64748b">{language === 'en' ? 'Dark Grey (Mixed Scrap)' : language === 'ko' ? '다크 그레이 (혼방)' : 'Xám Đậm (Vải vụn hỗn hợp)'}</option>
              <option value="#f59e0b">{language === 'en' ? 'Khaki Amber (Flax/Hemp)' : language === 'ko' ? '카키 엠버 (마 섬유)' : 'Vàng Kaki (Sợi gai)'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Giả lập Lực căng vải theo thời gian thực (Real-time Tension Gauges) */}
      <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400" /> {language === 'en' ? 'Real-Time Fabric Tension Gauges' : language === 'ko' ? '실시간 원단 장력 모니터' : 'Lực Căng Vải Thời Gian Thực (Tension)'}
          </span>
          <span className="text-[10px] font-mono text-slate-400">{language === 'en' ? 'Unit: Newton (N)' : language === 'ko' ? '단위: 뉴턴 (N)' : 'Đơn vị: Newton (N)'}</span>
        </div>

        {tensions.length === 0 ? (
          <p className="text-[11px] text-slate-500 text-center py-2">{language === 'en' ? 'Not enough transition rollers to calculate continuous tension.' : language === 'ko' ? '연속 장력을 계산할 롤러가 충분하지 않습니다.' : 'Chưa đủ trục chuyển tiếp để tính lực căng liên tục.'}</p>
        ) : (
          <div className="space-y-2.5">
            {tensions.map((t) => {
              const isSnap = t.status === 'critical_snap';
              const isSlack = t.status === 'slack_wrap';
              const isHigh = t.status === 'warning_high';

              // Màu sắc thanh lực căng
              let barColor = 'bg-emerald-500';
              let badgeText = language === 'en' ? 'Optimal' : language === 'ko' ? '최적' : 'Tối ưu';
              let badgeColor = 'text-emerald-400 bg-emerald-950/70 border-emerald-700';

              if (isSnap) {
                barColor = 'bg-rose-500 animate-pulse';
                badgeText = language === 'en' ? 'Snap Risk' : language === 'ko' ? '단절 위험' : 'Nguy cơ đứt';
                badgeColor = 'text-rose-400 bg-rose-950/70 border-rose-700';
              } else if (isSlack) {
                barColor = 'bg-sky-500';
                badgeText = language === 'en' ? 'Slack / Piling' : language === 'ko' ? '원단 처짐/밀림' : 'Đùn dồn vải';
                badgeColor = 'text-sky-400 bg-sky-950/70 border-sky-700';
              } else if (isHigh) {
                barColor = 'bg-amber-500';
                badgeText = language === 'en' ? 'High Tension' : language === 'ko' ? '고장력' : 'Căng cao';
                badgeColor = 'text-amber-400 bg-amber-950/70 border-amber-700';
              }

              // % hiển thị thanh progress (tối đa 600N)
              const percent = Math.min(100, Math.max(5, (t.tensionN / 600) * 100));

              return (
                <div key={`${t.fromId}-${t.toId}`} className="p-2.5 bg-slate-950 rounded border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300 font-medium">
                      {t.fromName} ➔ {t.toName}
                    </span>
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${badgeColor}`}>
                      {badgeText}
                    </span>
                  </div>

                  {/* Thanh hiển thị lực căng */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${barColor}`} style={{ width: `${percent}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{language === 'en' ? 'Tension:' : language === 'ko' ? '장력:' : 'Lực căng:'} <strong className="text-slate-100">{t.tensionN} N</strong></span>
                    <span>{language === 'en' ? 'Draft ratio:' : language === 'ko' ? '연신비:' : 'Tỉ số kéo:'} <strong className="text-slate-100">{t.speedRatio}x</strong></span>
                    <span>V: {t.v1} ➔ {t.v2} m/m</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Hệ thống Hút Bụi & Thu Gom Bông Khí Động Học */}
      <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Wind className="w-4 h-4 text-emerald-400" /> {language === 'en' ? 'Lint Suction & Waste Collection' : language === 'ko' ? '분진 흡입 및 섬유 포집 시스템' : 'Hệ Thống Hút Bụi & Thu Gom Bông'}
          </span>
          <button
            type="button"
            onClick={() => onChangeSuctionConfig({ ...suctionConfig, active: !suctionConfig.active })}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
              suctionConfig.active ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {suctionConfig.active ? (language === 'en' ? 'ON' : language === 'ko' ? '켜짐' : 'ĐANG BẬT') : (language === 'en' ? 'OFF' : language === 'ko' ? '꺼짐' : 'ĐÃ TẮT')}
          </button>
        </div>

        {/* Tốc độ gió hút m/s */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{language === 'en' ? 'Air velocity at hood intake:' : language === 'ko' ? '흡입구 풍속:' : 'Vận tốc gió tại miệng hút:'}</span>
            <span className={`font-mono font-bold ${suctionConfig.airVelocity < 20 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {suctionConfig.airVelocity} m/s
            </span>
          </div>
          <input
            type="range"
            min="12"
            max="34"
            step="0.5"
            value={suctionConfig.airVelocity}
            onChange={(e) =>
              onChangeSuctionConfig({
                ...suctionConfig,
                airVelocity: Number(e.target.value),
              })
            }
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-slate-500 font-mono">
            <span>{language === 'en' ? 'Low (12 m/s)' : language === 'ko' ? '약함 (12 m/s)' : 'Yếu (12 m/s)'}</span>
            <span className="text-emerald-400 font-semibold">{language === 'en' ? 'Tearing Standard (22 - 26 m/s)' : language === 'ko' ? '개섬 표준 (22 - 26 m/s)' : 'Chuẩn xé vải (22 - 26 m/s)'}</span>
            <span>{language === 'en' ? 'High (34 m/s)' : language === 'ko' ? '강함 (34 m/s)' : 'Rất mạnh (34 m/s)'}</span>
          </div>
        </div>

        {/* Lưu lượng khí m3/h */}
        <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
          <div className="bg-slate-950 p-2 rounded border border-slate-800">
            <span className="text-slate-400 block text-[10px]">{language === 'en' ? 'Exhaust Airflow' : language === 'ko' ? '송풍기 풍량' : 'Lưu lượng quạt hút'}</span>
            <span className="font-mono font-semibold text-slate-100">{suctionConfig.airflowRate} m³/h</span>
          </div>
          <div className="bg-slate-950 p-2 rounded border border-slate-800">
            <span className="text-slate-400 block text-[10px]">{language === 'en' ? 'Duct Diameter' : language === 'ko' ? '덕트 직경' : 'Đường kính ống dẫn'}</span>
            <span className="font-mono font-semibold text-slate-100">Ø {suctionConfig.ductDiameter} mm</span>
          </div>
        </div>
      </div>
    </div>
  );
};
