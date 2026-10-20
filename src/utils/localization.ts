import { Language } from '../i18n/types';
import { TRANSLATIONS } from '../i18n/translations';
import { MachineComponent, TechnicalConflict } from '../types/machine';

export interface LocalizedPresetInfo {
  name: string;
  badge: string;
  description: string;
}

export function getLocalizedPreset(presetId: string, lang: Language): LocalizedPresetInfo {
  const t = (key: string, fallback: string) => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['vi']?.[key] || fallback;
  };

  switch (presetId) {
    case 'preset_standard_1_drum':
      return {
        name: t('preset.standard1Drum', 'Máy xé vải 1 trống xé tiêu chuẩn'),
        badge: t('preset.badgePopular', 'Phổ biến nhất'),
        description: t('preset.standard1DrumDesc', 'Cấu hình chuẩn cho xé giẻ vụn may mặc, vải thun...'),
      };
    case 'preset_carding_worker_stripper':
      return {
        name: t('preset.cardingWorkerStripper', 'Máy xé chải tinh (Worker & Stripper)'),
        badge: t('preset.badgeFine', 'Độ tơi xơ cao'),
        description: t('preset.cardingWorkerStripperDesc', 'Tổ hợp trục vệ tinh Worker & Stripper quanh trống lớn...'),
      };
    case 'preset_cascading_3_drum':
      return {
        name: t('preset.cascading3Drum', 'Dây chuyền xé liên hoàn 3 trống'),
        badge: t('preset.badgeIndustrial', 'Năng suất công nghiệp'),
        description: t('preset.cascading3DrumDesc', 'Dây chuyền xé thô đến xé tinh liên hoàn 3 tầng trống...'),
      };
    default:
      return {
        name: presetId,
        badge: 'Preset',
        description: '',
      };
  }
}

export function getLocalizedName(rawName: string, lang: Language, type?: string): string {
  if (lang === 'vi') return rawName;

  const name = rawName.toLowerCase();
  const isCopy = rawName.includes('Bản sao') || rawName.includes('(Copy)');
  const copySuffix = lang === 'en' ? ' (Copy)' : ' (사본)';

  if (lang === 'en') {
    if (name.includes('ép trên') || name.includes('upper')) return `Upper Feed Roller${isCopy ? copySuffix : ''}`;
    if (name.includes('ép dưới') || name.includes('lower')) return `Lower Feed Roller${isCopy ? copySuffix : ''}`;
    if (name.includes('dao cắt') || name.includes('cutter') || name.includes('knife') || name.includes('dao gạt')) {
      const match = rawName.match(/#(\d+)/);
      return match ? `Fixed Ledger Knife #${match[1]}${isCopy ? copySuffix : ''}` : `Fixed Ledger Knife${isCopy ? copySuffix : ''}`;
    }
    if (name.includes('trống xé') || name.includes('trống chính') || name.includes('cylinder') || name.includes('drum')) {
      const match = rawName.match(/#(\d+)/);
      return match ? `Main Cylinder #${match[1]}${isCopy ? copySuffix : ''}` : `Main Tearing Cylinder${isCopy ? copySuffix : ''}`;
    }
    if (name.includes('worker') || name.includes('trục chải')) {
      const match = rawName.match(/#(\d+)/);
      return match ? `Worker Roller #${match[1]}${isCopy ? copySuffix : ''}` : `Worker Roller${isCopy ? copySuffix : ''}`;
    }
    if (name.includes('stripper') || name.includes('trục bóc')) {
      const match = rawName.match(/#(\d+)/);
      return match ? `Stripper Roller #${match[1]}${isCopy ? copySuffix : ''}` : `Stripper Roller${isCopy ? copySuffix : ''}`;
    }
    if (name.includes('hút') || name.includes('suction')) {
      const match = rawName.match(/#(\d+)/);
      return match ? `Suction Vacuum Hood #${match[1]}${isCopy ? copySuffix : ''}` : `Suction Vacuum Hood${isCopy ? copySuffix : ''}`;
    }
    if (name.includes('ngưng kết') || name.includes('condenser')) {
      const match = rawName.match(/#(\d+)/);
      return match ? `Condenser Cage Drum #${match[1]}${isCopy ? copySuffix : ''}` : `Condenser Cage Drum${isCopy ? copySuffix : ''}`;
    }
    if (name.includes('chổi') || name.includes('brush')) return `Wire Cleaning Brush${isCopy ? copySuffix : ''}`;
    if (name.includes('ép cấp') || name.includes('feed')) {
      const match = rawName.match(/#(\d+)/);
      return match ? `Feed Roller #${match[1]}${isCopy ? copySuffix : ''}` : `Feed Roller${isCopy ? copySuffix : ''}`;
    }
    if (name.includes('cây cuộn vải') || name.includes('supply roll')) return 'Fabric Supply Roll';
  }

  if (lang === 'ko') {
    if (name.includes('ép trên') || name.includes('upper')) return `상부 피드 롤러 (Feed Upper)${isCopy ? copySuffix : ''}`;
    if (name.includes('ép dưới') || name.includes('lower')) return `하부 피드 롤러 (Feed Lower)${isCopy ? copySuffix : ''}`;
    if (name.includes('dao cắt') || name.includes('cutter') || name.includes('knife') || name.includes('dao gạt')) {
      const match = rawName.match(/#(\d+)/);
      return match ? `하부 고정 나이프 #${match[1]}${isCopy ? copySuffix : ''}` : `하부 고정 나이프 (Fixed Knife)${isCopy ? copySuffix : ''}`;
    }
    if (name.includes('trống xé') || name.includes('trống chính') || name.includes('cylinder') || name.includes('drum')) {
      const match = rawName.match(/#(\d+)/);
      return match ? `메인 개섬 실린더 #${match[1]}${isCopy ? copySuffix : ''}` : `메인 개섬 실린더 (Main Cylinder)${isCopy ? copySuffix : ''}`;
    }
    if (name.includes('worker') || name.includes('trục chải')) {
      const match = rawName.match(/#(\d+)/);
      return match ? `워커 롤러 #${match[1]}${isCopy ? copySuffix : ''}` : `워커 롤러 (Worker Roller)${isCopy ? copySuffix : ''}`;
    }
    if (name.includes('stripper') || name.includes('trục bóc')) {
      const match = rawName.match(/#(\d+)/);
      return match ? `스트리퍼 롤러 #${match[1]}${isCopy ? copySuffix : ''}` : `스트리퍼 롤러 (Stripper Roller)${isCopy ? copySuffix : ''}`;
    }
    if (name.includes('hút') || name.includes('suction')) {
      const match = rawName.match(/#(\d+)/);
      return match ? `진공 흡입 후드 #${match[1]}${isCopy ? copySuffix : ''}` : `진공 흡입 후드 (Suction Hood)${isCopy ? copySuffix : ''}`;
    }
    if (name.includes('ngưng kết') || name.includes('condenser')) {
      const match = rawName.match(/#(\d+)/);
      return match ? `타공 콘덴서 드럼 #${match[1]}${isCopy ? copySuffix : ''}` : `타공 콘덴서 드럼 (Condenser Drum)${isCopy ? copySuffix : ''}`;
    }
    if (name.includes('chổi') || name.includes('brush')) return `침포 브러시 롤러${isCopy ? copySuffix : ''}`;
    if (name.includes('ép cấp') || name.includes('feed')) {
      const match = rawName.match(/#(\d+)/);
      return match ? `피드 롤러 #${match[1]}${isCopy ? copySuffix : ''}` : `피드 롤러${isCopy ? copySuffix : ''}`;
    }
    if (name.includes('cây cuộn vải') || name.includes('supply roll')) return '원단 공급 롤 스탠드';
  }

  return rawName;
}

export function getLocalizedComponentName(
  comp: MachineComponent | { name: string; type?: string },
  lang: Language
): string {
  if (!comp) return '';
  return getLocalizedName(comp.name, lang, comp.type);
}

export function getLocalizedModelName(name: string, lang: Language): string {
  if (lang === 'vi') return name;

  if (name.includes('1 trống tiêu chuẩn') || name.includes('tiêu chuẩn')) {
    return lang === 'en' ? 'Standard 1-Cylinder Opener' : '표준 1-실린더 개섬기';
  }
  if (name.includes('Worker & Stripper') || name.includes('chải tinh')) {
    return lang === 'en' ? 'Fine Carding Opener (Worker & Stripper)' : '정밀 소면 개섬기 (워커 & 스트리퍼)';
  }
  if (name.includes('liên hoàn 3 trống') || name.includes('3-Stage')) {
    return lang === 'en' ? '3-Stage Cascading Opener Line' : '3단 연속 개섬 라인 (3-Stage Opener)';
  }
  if (name.includes('Dàn máy mới') || name.includes('mới #')) {
    const match = name.match(/#(\d+)/);
    const num = match ? `#${match[1]}` : '';
    return lang === 'en' ? `New Machine Setup ${num}` : `신규 기계 모델 ${num}`;
  }
  if (name.includes('Bản lưu')) {
    return lang === 'en' ? `${name.replace('(Bản lưu)', '(Saved)')}` : `${name.replace('(Bản lưu)', '(저장본)')}`;
  }
  return name;
}

export function getLocalizedDiagnosticAlert(
  conflict: TechnicalConflict,
  lang: Language
): TechnicalConflict {
  if (lang === 'vi') return conflict;

  const id = conflict.id;

  if (id.startsWith('col-')) {
    // Mechanical collision
    const gapMatch = conflict.title.match(/(-?\d+(\.\d+)?)/) || conflict.description.match(/(-?\d+(\.\d+)?\s*mm)/);
    const gapStr = gapMatch ? gapMatch[0] : '';
    return {
      ...conflict,
      title:
        lang === 'en'
          ? `Critical Mechanical Collision: Components Intersecting (${gapStr})`
          : `심각한 기계적 간섭 및 충돌: 부품 교차 발생 (${gapStr})`,
      description:
        lang === 'en'
          ? `Surfaces are physically intersecting (${gapStr}). Cylinder wire teeth or blades will fracture and spark immediately upon startup!`
          : `부품 표면이 물리적으로 교차하고 있습니다 (${gapStr}). 기계 가동 시 침포 톱니 또는 나이프가 즉시 파손되어 화재 스파크 위험이 있습니다!`,
      recommendation:
        lang === 'en'
          ? 'Reposition roller coordinates or use the Gap Calibrator to ensure safe working clearance.'
          : '롤러 축 좌표를 이동하거나 간극 교정기를 사용하여 안전 간극을 확보하세요.',
    };
  }

  if (id.startsWith('tight-')) {
    const gapMatch = conflict.title.match(/(\d+(\.\d+)?\s*mm)/);
    const gapStr = gapMatch ? gapMatch[0] : '';
    return {
      ...conflict,
      title:
        lang === 'en'
          ? `Clearance Gap Too Narrow (${gapStr})`
          : `간극이 너무 좁음 (${gapStr})`,
      description:
        lang === 'en'
          ? 'Clearance is smaller than standard textile engineering safety limits. Excessive friction heat may burn cotton fibers or warp the cylinder shaft.'
          : '간극이 기술적 안전 권장치보다 좁습니다. 마찰열로 인해 원단 섬유가 탄화되거나 롤러 축이 열변형될 위험이 있습니다.',
      recommendation:
        lang === 'en'
          ? 'Adjust working clearance to recommended standard range (1.0 - 3.0 mm).'
          : '권장 표준 간극 범위(1.0 - 3.0 mm)로 조정하세요.',
    };
  }

  if (id.startsWith('wide-')) {
    return {
      ...conflict,
      title:
        lang === 'en'
          ? 'Carding Gap Too Wide: Inefficient Fiber Opening'
          : '소면 간극 과다: 개섬 효율 저하',
      description:
        lang === 'en'
          ? 'Clearance gap exceeds effective carding distance. Rag fabric pieces will pass through without being shredded into individual fibers.'
          : '간극이 너무 넓어 원단 조각이 침포에 충분히 걸리지 않고 그대로 통과하여 개섬 효율이 급격히 떨어집니다.',
      recommendation:
        lang === 'en'
          ? 'Narrow the gap to standard carding tolerance for optimal pin penetration.'
          : '침포 걸림 효과를 극대화하기 위해 간극을 좁히세요.',
    };
  }

  if (id === 'feed-jam-same-dir') {
    return {
      ...conflict,
      title:
        lang === 'en'
          ? 'Feed Rollers Rotation Conflict: Same Direction'
          : '피드 롤러 회전 방향 충돌: 동일 방향 회전',
      description:
        lang === 'en'
          ? 'Both feed rollers are rotating in the same direction! At the pinch nip, one surface pushes forward while the other pushes backward, jamming fabric instantly!'
          : '상하부 피드 롤러가 동일한 방향으로 회전하고 있습니다! 닙 접촉면에서 서로 반대 방향으로 밀어내어 원단이 즉시 끼이고 기계가 멈춥니다!',
      recommendation:
        lang === 'en'
          ? 'Reverse direction of one roller so they nip material forward into the machine.'
          : '원단을 기계 내부로 원활히 투입할 수 있도록 한쪽 롤러의 회전 방향을 반전시키세요.',
    };
  }

  if (id === 'feed-reverse-dir') {
    return {
      ...conflict,
      title:
        lang === 'en'
          ? 'Feed Rollers Rotating in Reverse: Ejecting Fabric'
          : '피드 롤러 역회전: 원단 밀어냄',
      description:
        lang === 'en'
          ? 'The current rotational direction pushes fabric backwards out of the machine instead of pulling it in.'
          : '현재 회전 방향이 원단을 개섬기 내부로 유입하지 않고 외부로 역방향 배출하고 있습니다.',
      recommendation:
        lang === 'en'
          ? 'Reverse rotation on both feed rollers to match infeed direction.'
          : '투입 진행 방향에 맞게 상하 피드 롤러의 회전 방향을 반전시키세요.',
    };
  }

  if (id.startsWith('drum-low-rpm')) {
    return {
      ...conflict,
      title:
        lang === 'en'
          ? 'Main Cylinder Speed Too Low'
          : '메인 실린더 회전 속도 부족',
      description:
        lang === 'en'
          ? 'Main cylinder requires minimum surface velocity of 600 - 1200 m/min to generate inertial carding impact. Low speeds cause severe cylinder clogging.'
          : '메인 실린더는 관성 개섬력을 형성하기 위해 최소 600~1200 m/분의 원주 속도가 필요합니다. 저속 운전 시 드럼 막힘이 발생합니다.',
      recommendation:
        lang === 'en'
          ? 'Increase cylinder RPM to recommended 600 - 1000 RPM range.'
          : '메인 실린더 RPM을 권장치인 600~1000 RPM으로 상향 조정하세요.',
    };
  }

  if (id.startsWith('knife-angle-conflict')) {
    return {
      ...conflict,
      title:
        lang === 'en'
          ? 'Ledger Knife Position Conflicts with Cylinder Rotation'
          : '고정 나이프와 실린더 회전 충돌',
      description:
        lang === 'en'
          ? 'Ledger knife blade opposes cylinder teeth travel directly, causing teeth breakage and heavy impact.'
          : '고정 나이프의 날 방향이 실린더 침포 진행 방향과 역방향으로 마주쳐 침포 파손 위험이 높습니다.',
      recommendation:
        lang === 'en'
          ? 'Position knife tangent to drum rotation or reverse drum direction.'
          : '나이프를 접선 위치로 조정하거나 드럼 회전 방향을 전환하세요.',
    };
  }

  if (id.startsWith('tension-snap')) {
    return {
      ...conflict,
      title:
        lang === 'en'
          ? 'Critical Web Tension: Risk of Fabric Tearing'
          : '위험 수준 장력: 원단 파단 및 찢어짐 위험',
      description:
        lang === 'en'
          ? 'Inter-roller tension exceeds tensile limits due to excessive speed ratio. Web will snap abruptly!'
          : '속도 차이로 인해 롤러 간 장력이 원단의 인장 한계를 초과하여 파단될 위험이 있습니다!',
      recommendation:
        lang === 'en'
          ? 'Synchronize speeds or reduce speed differential between consecutive rollers.'
          : '인접 롤러 간 속도 차이를 줄여 장력을 완화하세요.',
    };
  }

  if (id.startsWith('tension-slack')) {
    return {
      ...conflict,
      title:
        lang === 'en'
          ? 'Web Slack & Sagging: Risk of Roller Wrapping'
          : '원단 처짐 및 느슨함: 롤러 말림 위험',
      description:
        lang === 'en'
          ? 'Succeeding roller surface speed is slower than preceding roller. Fabric bunches up and wraps around rollers!'
          : '후속 롤러 속도가 선행 롤러보다 느려 원단이 밀리고 롤러 표면에 말려 들어갈 위험이 있습니다!',
      recommendation:
        lang === 'en'
          ? 'Increase downstream roller RPM or decrease upstream infeed speed.'
          : '후속 롤러의 RPM을 올리거나 선행 롤러의 속도를 낮춰 속도를 동기화하세요.',
    };
  }

  if (id === 'suction-missing') {
    return {
      ...conflict,
      title:
        lang === 'en'
          ? 'No Pneumatic Suction Exhaust Hood Configured'
          : '진공 집진 흡입 후드 미배치',
      description:
        lang === 'en'
          ? 'Textile tearing produces massive airborne lint and dust. Lack of suction causes chamber clogging and fire hazards.'
          : '폐섬유 개섬 시 대량의 분진과 미세 섬유가 발생합니다. 흡입 후드가 없으면 챔버가 막히고 화재 위험이 발생합니다.',
      recommendation:
        lang === 'en'
          ? 'Add at least one Suction Hood above or behind the main cylinder.'
          : '메인 실린더 상단 또는 후방에 최소 1개 이상의 진공 흡입 후드를 추가하세요.',
    };
  }

  if (id.startsWith('suction-velocity-low')) {
    return {
      ...conflict,
      title:
        lang === 'en'
          ? 'Duct Air Velocity Too Low'
          : '흡입 풍속 부족 (덕트 내 퇴적 위험)',
      description:
        lang === 'en'
          ? 'Pneumatic conveyance of shredded cotton fibers requires minimum 22 - 26 m/s air velocity to prevent settling.'
          : '개섬된 섬유를 덕트 내에 퇴적시키지 않고 이송하기 위해서는 최소 22~26 m/s 이상의 풍속이 필요합니다.',
      recommendation:
        lang === 'en'
          ? 'Increase suction fan capacity or reduce duct diameter.'
          : '송풍기 용량을 늘리거나 덕트 단면적을 축소하여 풍속을 높이세요.',
    };
  }

  if (id.startsWith('suction-too-far')) {
    return {
      ...conflict,
      title:
        lang === 'en'
          ? 'Suction Hood Located Too Far From Cylinder'
          : '흡입 후드 위치가 실린더와 너무 멂',
      description:
        lang === 'en'
          ? 'Excessive distance reduces centrifugal fiber capture efficiency, allowing fluff to escape onto machine floor.'
          : '흡입 후드가 실린더에서 너무 멀리 떨어져 있어 원심력으로 방출되는 섬유의 집진 효율이 저하됩니다.',
      recommendation:
        lang === 'en'
          ? 'Move suction hood closer to cylinder tangential discharge zone (35 - 70 mm).'
          : '흡입 후드를 실린더 원심 분사 접선 부근(35~70 mm)으로 가깝게 배치하세요.',
    };
  }

  return conflict;
}
