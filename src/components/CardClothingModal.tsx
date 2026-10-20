import React, { useEffect, useRef, useState } from 'react';
import { MachineComponent } from '../types/machine';
import { useLanguage } from '../i18n';
import {
  Sparkles,
  X,
  Sliders,
  HelpCircle,
  Check,
  ZoomIn,
  Layers,
  Cpu,
  Info,
  Camera,
} from 'lucide-react';
import cardClothingMacroImg from '../assets/images/card_clothing_macro_1791863975392.jpg';

interface CardClothingModalProps {
  isOpen: boolean;
  onClose: () => void;
  components: MachineComponent[];
  selectedComponentId: string | null;
  onUpdateComponent: (updated: MachineComponent) => void;
}

export const CardClothingModal: React.FC<CardClothingModalProps> = ({
  isOpen,
  onClose,
  components,
  selectedComponentId,
  onUpdateComponent,
}) => {
  const { t, language } = useLanguage();
  const [activeId, setActiveId] = useState<string>(
    selectedComponentId || components.find((c) => c.type === 'main_drum')?.id || components[0]?.id || ''
  );
  const [visualMode, setVisualMode] = useState<'diagram' | 'real_photo'>('real_photo');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Sync with selected component if it changes
  useEffect(() => {
    if (selectedComponentId) {
      setActiveId(selectedComponentId);
    }
  }, [selectedComponentId]);

  const currentComp = components.find((c) => c.id === activeId) || components[0];

  const pitchMm = currentComp?.toothPitchMm || (currentComp?.type === 'main_drum' ? 3.2 : 2.8);
  const heightMm = currentComp?.toothHeightMm || (currentComp?.type === 'main_drum' ? 4.8 : 3.5);
  const angleDeg = currentComp?.toothAngleDeg || (currentComp?.type === 'main_drum' ? 70 : 65);
  const cardType = currentComp?.cardClothingType || 'metallic_sawtooth';

  // Draw realistic procedural card clothing tooth profile & microscopic surface on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentComp) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Background: Steel drum cylinder surface with fine brushed metallic gradient
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(0.5, '#1e293b');
    bgGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Grid lines for engineering scale
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.5;
    const gridSize = 20;
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    if (currentComp.type === 'cutter_knife') {
      // Vát lưỡi dao cắt
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(40, 180);
      ctx.lineTo(w - 40, 60);
      ctx.lineTo(w - 40, 100);
      ctx.lineTo(40, 220);
      ctx.closePath();
      ctx.fill();

      // Mép vát mài sắc
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(40, 180);
      ctx.lineTo(w - 40, 60);
      ctx.lineTo(w - 40, 75);
      ctx.lineTo(40, 195);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(language === 'en' ? 'TUNGSTEN CARBIDE BLADE PROFILE' : language === 'ko' ? '초경합금 나이프 블레이드 프로파일' : 'LƯỠI DAO HỢP KIM TÔI CỨNG (TUNGSTEN CARBIDE BLADE)', 50, 40);
      return;
    }

    // Top section: Realistic Card Clothing Helical Strips (Mặt cắt dải lá kim quấn xoắn ốc)
    ctx.fillStyle = '#64748b';
    ctx.font = '10px monospace';
    ctx.fillText(language === 'en' ? 'METALLIC CARD CLOTHING SAWTOOTH PROFILE' : language === 'ko' ? '침포 와이어 톱니 단면 프로파일' : 'MÔ PHỎNG MẶT CẮT PROFILE RĂNG CƯA ĐỒ KIM (CARD CLOTHING PROFILE)', 16, 22);

    const baselineY = 160;
    const toothStep = Math.max(30, pitchMm * 12);
    const toothH = Math.max(25, heightMm * 14);
    const tiltOffset = (Math.tan(((90 - angleDeg) * Math.PI) / 180) * toothH);

    // Base strip foundation
    ctx.fillStyle = '#334155';
    ctx.fillRect(16, baselineY, w - 32, 28);
    ctx.fillStyle = '#475569';
    ctx.fillRect(16, baselineY + 28, w - 32, 6);

    // Draw sawtooth teeth along baseline
    ctx.save();
    for (let x = 30; x < w - 40; x += toothStep) {
      // Back flank & front face
      const tipX = x + tiltOffset;
      const tipY = baselineY - toothH;

      // Tooth shadow / bevel
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(x, baselineY);
      ctx.lineTo(tipX, tipY);
      ctx.lineTo(x + toothStep * 0.85, baselineY);
      ctx.closePath();
      ctx.fill();

      // Front rake cutting face highlight (mặt trước ăn sợi)
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.moveTo(x, baselineY);
      ctx.lineTo(tipX, tipY);
      ctx.lineTo(tipX + 3, tipY + 2);
      ctx.lineTo(x + 4, baselineY);
      ctx.closePath();
      ctx.fill();

      // Sharp tooth apex tip (mũi kim nhọn hoắt ánh kim)
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(tipX, tipY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Indicator of direction
      if (x === 30) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(tipX, tipY - 12);
        ctx.lineTo(tipX, baselineY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '10px monospace';
        ctx.fillText(language === 'en' ? `Rake angle: ${angleDeg}°` : language === 'ko' ? `경사각: ${angleDeg}°` : `Góc nghiêng: ${angleDeg}°`, tipX + 6, tipY + 15);
        ctx.fillText(`H = ${heightMm}mm`, tipX + 6, tipY + 30);
        ctx.fillText(language === 'en' ? `Pitch p = ${pitchMm}mm` : language === 'ko' ? `피치 p = ${pitchMm}mm` : `Bước p = ${pitchMm}mm`, x, baselineY + 20);
      }
    }
    ctx.restore();

    // Bottom section: Microscopic surface texture preview (Mặt trên nhìn từ trên xuống)
    ctx.fillStyle = '#64748b';
    ctx.font = '10px monospace';
    ctx.fillText(language === 'en' ? 'METALLIC WIRE WINDING DENSITY ON CYLINDER' : language === 'ko' ? '드럼 침포 와이어 권취 밀도' : 'BỀ MẶT THỰC TẾ TRỐNG QUẤN DÂY KIM (METALLIC WIRE WINDING DENSITY)', 16, 215);

    const surfaceTopY = 225;
    const surfaceH = 95;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(16, surfaceTopY, w - 32, surfaceH);

    // Draw tightly wound wire bands
    const bandHeight = 12;
    for (let y = surfaceTopY; y < surfaceTopY + surfaceH; y += bandHeight) {
      // Interlocking wire groove
      ctx.fillStyle = (y / bandHeight) % 2 === 0 ? '#334155' : '#1e293b';
      ctx.fillRect(16, y, w - 32, bandHeight - 1);

      // Rows of sharp pin teeth tips
      for (let x = 24; x < w - 32; x += 14) {
        const jitter = ((x * 13) % 5) - 2;
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(x + jitter, y + 4, 2, 4);

        // Specular apex glint
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x + jitter, y + 3, 2, 1.5);
      }
    }
  }, [currentComp, pitchMm, heightMm, angleDeg, cardType]);

  if (!isOpen) return null;

  const handleApplyPreset = (type: 'coarse_denim' | 'medium_knit' | 'fine_carding' | 'pinned_lag') => {
    if (!currentComp) return;
    let newPitch = 3.2;
    let newHeight = 4.8;
    let newAngle = 70;
    let newType: MachineComponent['cardClothingType'] = 'metallic_sawtooth';

    if (type === 'coarse_denim') {
      newPitch = 4.2;
      newHeight = 5.2;
      newAngle = 72;
      newType = 'metallic_sawtooth';
    } else if (type === 'medium_knit') {
      newPitch = 3.0;
      newHeight = 4.5;
      newAngle = 68;
      newType = 'metallic_sawtooth';
    } else if (type === 'fine_carding') {
      newPitch = 2.2;
      newHeight = 3.8;
      newAngle = 65;
      newType = 'metallic_sawtooth';
    } else if (type === 'pinned_lag') {
      newPitch = 8.0;
      newHeight = 9.5;
      newAngle = 80;
      newType = 'pinned_lag';
    }

    onUpdateComponent({
      ...currentComp,
      toothPitchMm: newPitch,
      toothHeightMm: newHeight,
      toothAngleDeg: newAngle,
      cardClothingType: newType,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-950 border border-sky-800/80 text-sky-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                {t('modal.cardClothing.title')}
              </h2>
              <p className="text-xs text-slate-400">
                {t('modal.cardClothing.subtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Chọn trục xem đồ kim */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              {t('modal.cardClothing.selectPart')}
            </label>
            <div className="flex flex-wrap gap-2">
              {components.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    c.id === activeId
                      ? 'bg-sky-600 border-sky-400 text-white font-bold shadow-md shadow-sky-950'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {c.name} (Ø{c.diameter}mm)
                </button>
              ))}
            </div>
          </div>

          {/* Visual Showcase: Ảnh thực tế & Bản vẽ vi mô Profile */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setVisualMode('real_photo')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    visualMode === 'real_photo'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{t('modal.cardClothing.realPhotoTitle')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisualMode('diagram')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    visualMode === 'diagram'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>{t('modal.cardClothing.diagramTitle')}</span>
                </button>
              </div>

              <span className="font-mono text-[11px] text-slate-400">
                {language === 'en' ? 'Rake angle' : language === 'ko' ? '경사각' : 'Góc cào'}: <strong className="text-sky-300">{angleDeg}°</strong> | {language === 'en' ? 'Pitch p' : language === 'ko' ? '피치 p' : 'Bước p'}: <strong className="text-emerald-300">{pitchMm}mm</strong> | {language === 'en' ? 'Height' : language === 'ko' ? '높이' : 'Cao'}: <strong className="text-amber-300">{heightMm}mm</strong>
              </span>
            </div>

            <div className="rounded-xl border border-slate-700 overflow-hidden bg-slate-950 p-1 shadow-inner relative">
              {visualMode === 'real_photo' ? (
                <div className="relative group overflow-hidden rounded-lg">
                  <img
                    src={cardClothingMacroImg}
                    alt={language === 'en' ? 'Metallic Card Clothing Wire on Industrial Drum' : language === 'ko' ? '산업용 드럼 침포 와이어 톱니' : 'Bề mặt kim răng cưa trên trống xé công nghiệp (Metallic Card Clothing Wire)'}
                    className="w-full h-72 object-cover object-center rounded-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex flex-col justify-end p-4 pointer-events-none">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-sky-600/90 text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                        {language === 'en' ? 'Main Cylinder Drum' : language === 'ko' ? '메인 실린더 드럼' : 'Trống Xé Công Nghiệp (Main Cylinder Drum)'}
                      </span>
                      <span className="text-slate-300 text-xs font-mono">
                        {language === 'en' ? 'Helical Wire Winding' : language === 'ko' ? '나선형 와이어 권취' : 'Dải thép dập răng cưa quấn xoắn ốc (Helical Wire Winding)'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 max-w-xl">
                      {language === 'en'
                        ? 'Close-up of hardened steel card wire coiled tightly around cylinder surface. Forward rake angle (~70°) vigorously tears fabric scrap and fiber tufts at 700 - 950 RPM.'
                        : language === 'ko'
                        ? '드럼 표면에 촘촘히 감긴 고주파 열처리 침포 와이어 상세. 70° 전향 경사각 톱니가 700 - 950 RPM으로 회전하며 원단 조각을 강력하게 개섬합니다.'
                        : 'Cận cảnh các vòng dải kim thép tôi cứng quấn sát nhau quanh thân tang trống. Răng kim nghiêng góc trước 70° cào xé nát xơ vải vụn và bông khi trống quay 700 - 950 RPM.'}
                    </p>
                  </div>
                </div>
              ) : (
                <canvas
                  ref={canvasRef}
                  width={700}
                  height={330}
                  className="w-full h-auto block rounded-lg"
                />
              )}
            </div>
          </div>

          {/* Preset công nghệ xé vải */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-slate-200 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-sky-400" /> {language === 'en' ? 'Standard Clothing Presets by Material' : language === 'ko' ? '원단 종류별 표준 침포 규격' : 'Cấu Hình Tiêu Chuẩn Theo Chủng Loại Vải Cấp'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{language === 'en' ? 'Graf / Trützschler Standard' : language === 'ko' ? 'Graf / Trützschler 표준' : 'Tiêu chuẩn Graf / Trützschler'}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => handleApplyPreset('coarse_denim')}
                className="p-2.5 rounded-lg border border-slate-800 hover:border-sky-500 bg-slate-900 text-left transition-all hover:bg-slate-850"
              >
                <div className="font-bold text-xs text-slate-200">{language === 'en' ? 'Denim Scrap' : language === 'ko' ? '데님 원단' : 'Xé Vải Bò (Denim)'}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{language === 'en' ? 'Coarse tooth, heavy pull' : language === 'ko' ? '굵은 톱니, 강한 개섬력' : 'Răng thưa cao, lực cào mạnh'}</div>
                <div className="text-[10px] font-mono text-sky-400 mt-1">p: 4.2mm · H: 5.2mm · 72°</div>
              </button>

              <button
                onClick={() => handleApplyPreset('medium_knit')}
                className="p-2.5 rounded-lg border border-slate-800 hover:border-sky-500 bg-slate-900 text-left transition-all hover:bg-slate-850"
              >
                <div className="font-bold text-xs text-slate-200">{language === 'en' ? 'Knitted Cotton' : language === 'ko' ? '니트 코튼' : 'Xé Vải Thun (Knit)'}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{language === 'en' ? 'Medium tooth, fiber preserving' : language === 'ko' ? '중간 톱니, 섬유장 보존' : 'Răng trung bình, giữ xơ dài'}</div>
                <div className="text-[10px] font-mono text-emerald-400 mt-1">p: 3.0mm · H: 4.5mm · 68°</div>
              </button>

              <button
                onClick={() => handleApplyPreset('fine_carding')}
                className="p-2.5 rounded-lg border border-slate-800 hover:border-sky-500 bg-slate-900 text-left transition-all hover:bg-slate-850"
              >
                <div className="font-bold text-xs text-slate-200">{language === 'en' ? 'Fine Carding' : language === 'ko' ? '미세 소면' : 'Chải Tơi Mịn (Fine)'}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{language === 'en' ? 'Fine wire, fluffy cotton tufts' : language === 'ko' ? '미세 와이어, 벌키 솜 가공' : 'Kim nhuyễn, đánh tơi thành cụm bông'}</div>
                <div className="text-[10px] font-mono text-amber-400 mt-1">p: 2.2mm · H: 3.8mm · 65°</div>
              </button>

              <button
                onClick={() => handleApplyPreset('pinned_lag')}
                className="p-2.5 rounded-lg border border-slate-800 hover:border-sky-500 bg-slate-900 text-left transition-all hover:bg-slate-850"
              >
                <div className="font-bold text-xs text-slate-200">{language === 'en' ? 'Pinned Lags' : language === 'ko' ? '핀 래그 (스파이크)' : 'Bản Đinh Nhọn (Lags)'}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{language === 'en' ? 'Heavy steel pins for primary tear' : language === 'ko' ? '초기 거친 파쇄용 강철 핀' : 'Đinh thép nhọn xé thô ban đầu'}</div>
                <div className="text-[10px] font-mono text-rose-400 mt-1">p: 8.0mm · H: 9.5mm · 80°</div>
              </button>
            </div>
          </div>

          {/* Giải đáp câu hỏi của người dùng về hình ảnh cụ thể */}
          <div className="p-4 bg-sky-950/40 rounded-xl border border-sky-800/60 text-xs text-sky-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sky-300">
              <Info className="w-4 h-4 text-sky-400 shrink-0" />
              <span>{language === 'en' ? 'Technical Note on Card Clothing Wire' : language === 'ko' ? '침포 와이어 기술 안내' : 'Thông tin kỹ thuật: Quy chuẩn đồ kim công nghiệp'}</span>
            </div>
            <p className="leading-relaxed text-slate-300 text-[11px]">
              {language === 'en'
                ? 'The 3D model automatically renders realistic metallic sawtooth wire coiled helically around the cylinder according to textile recycling standards:'
                : language === 'ko'
                ? '3D 시뮬레이션은 섬유 재활용 표준 규격에 따라 실린더 표면에 나선형으로 권취된 침포 와이어를 자동으로 렌더링합니다:'
                : 'Hệ thống mô phỏng 3D tạo sẵn đồ họa kim răng cưa kim loại cuộn xoắn ốc (Metallic Card Clothing Wire) chuẩn công nghiệp dệt tái chế:'}
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-300">
              <li>
                <strong>{language === 'en' ? 'Main Drum:' : language === 'ko' ? '메인 드럼:' : 'Trống lớn (Main Drum):'}</strong> {language === 'en' ? 'Hardened sawtooth wire wrapped tightly around drum. Forward rake angle of 68° - 75° provides powerful carding at high RPM.' : language === 'ko' ? '열처리된 고강도 톱니 와이어가 드럼을 감싸며 68° - 75° 전향각으로 고속 개섬을 수행합니다.' : 'Bọc dải kim thép tôi dập răng cưa nhọn, quấn xoắn ốc sát nhau quanh thân trống. Răng nghiêng về phía trước góc 68° - 75° để cào xé mạnh khi quay tốc độ cao.'}
              </li>
              <li>
                <strong>{language === 'en' ? 'Worker & Stripper:' : language === 'ko' ? '워커 & 스트리퍼:' : 'Trục Chải & Trục Bóc (Worker & Stripper):'}</strong> {language === 'en' ? 'Point-to-point opposing teeth hold fiber web, carding and transferring fibers back to main cylinder.' : language === 'ko' ? '대향각(Point-to-point) 침포가 섬유 웹을 잡고 빗질하여 메인 실린더로 전달합니다.' : 'Răng kim nghiêng góc đối kháng nhau (Point-to-point) để giữ lớp xơ và kéo tơi, sau đó bóc trả lại cho trống chính.'}
              </li>
              <li>
                <strong>{language === 'en' ? 'Feed Roller:' : language === 'ko' ? '피드 롤러:' : 'Trục cấp liệu (Feed Roller):'}</strong> {language === 'en' ? 'Longitudinally fluted steel rollers firmly clamp fabric edge, preventing bulk feeding into drum.' : language === 'ko' ? '종방향 홈 가공 강철 롤러가 원단을 단단히 잡아 실린더로 한 번에 빨려 들어가는 것을 방지합니다.' : 'Bề mặt khía rãnh dọc (Fluted Steel) kẹp chặt mép vải để dao và trống không cuốn nguyên tấm vào.'}
              </li>
            </ul>
            <p className="text-[11px] text-sky-300 italic pt-1">
              💡 {language === 'en' ? 'If your factory uses specific wire brands (e.g. Graf, Groz-Beckert), simply type your pitch (p) and angle in the Inspector panel!' : language === 'ko' ? '공장에서 특정 브랜드(예: Graf, Groz-Beckert)의 침포를 사용하는 경우 인스펙터 패널에서 피치(p)와 각도를 직접 입력하세요!' : 'Nếu nhà máy bạn đang dùng đồ kim của hãng đặc biệt (ví dụ Graf Thụy Sĩ, Groz-Beckert Đức, hoặc kim nội địa Đài Loan), bạn chỉ cần gõ bước răng (p) và góc nghiêng (độ) ở bảng trên là mô hình 3D tự cập nhật tức thì!'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg text-xs transition-colors shadow-md"
          >
            {t('modal.cardClothing.closeBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};
