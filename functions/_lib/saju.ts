import { Solar } from 'lunar-typescript';
import type { FreeAnalysisData, FiveElements, Pillar } from './schemas';
import type { AnalysisRequest } from './validators';

const stemsKo = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
const stemsEn = ['Gap', 'Eul', 'Byeong', 'Jeong', 'Mu', 'Gi', 'Gyeong', 'Sin', 'Im', 'Gye'];
const stemsJa = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const stemsHanja = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const branchesKo = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
const branchesEn = [
  'Ja',
  'Chuk',
  'In',
  'Myo',
  'Jin',
  'Sa',
  'O',
  'Mi',
  'Sin',
  'Yu',
  'Sul',
  'Hae',
];
const branchesJa = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const branchesHanja = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const stemElements = ['wood', 'wood', 'fire', 'fire', 'earth', 'earth', 'metal', 'metal', 'water', 'water'] as const;
const branchElements = [
  'water',
  'earth',
  'wood',
  'wood',
  'earth',
  'fire',
  'fire',
  'earth',
  'metal',
  'metal',
  'earth',
  'water',
] as const;

const hiddenBranchElements: SupportedElement[][] = [
  ['water'],
  ['earth', 'water', 'metal'],
  ['wood', 'fire', 'earth'],
  ['wood'],
  ['earth', 'wood', 'water'],
  ['fire', 'metal', 'earth'],
  ['fire', 'earth'],
  ['earth', 'fire', 'wood'],
  ['metal', 'water', 'earth'],
  ['metal'],
  ['earth', 'metal', 'fire'],
  ['water', 'wood'],
] as const;

type SupportedElement = keyof FiveElements;

const TIMEZONE_CONFIG: Record<string, { offsetHours: number; longitude: number; standardMeridian: number }> = {
  'Asia/Seoul': {
    offsetHours: 9,
    longitude: 126.978,
    standardMeridian: 135,
  },
};

function mod(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor;
}

function parseBirthParts(birthdate: string, birthtime?: string) {
  const [year, month, day] = birthdate.split('-').map((value) => Number.parseInt(value, 10));
  const [hour = 12, minute = 0] = (birthtime || '')
    .split(':')
    .map((value) => Number.parseInt(value || '0', 10));

  return {
    year,
    month,
    day,
    hour: Number.isFinite(hour) ? hour : 12,
    minute: Number.isFinite(minute) ? minute : 0,
  };
}

function getLocalizedStem(index: number, language: AnalysisRequest['language']) {
  if (language === 'ko') {
    return stemsKo[index];
  }

  if (language === 'ja') {
    return stemsJa[index];
  }

  return stemsEn[index];
}

function getLocalizedBranch(index: number, language: AnalysisRequest['language']) {
  if (language === 'ko') {
    return branchesKo[index];
  }

  if (language === 'ja') {
    return branchesJa[index];
  }

  return branchesEn[index];
}

function stemIndexFromKo(stem: string) {
  return Math.max(stemsKo.indexOf(stem), stemsHanja.indexOf(stem));
}

function branchIndexFromKo(branch: string) {
  return Math.max(branchesKo.indexOf(branch), branchesHanja.indexOf(branch));
}

function buildPillar(stemIndex: number, branchIndex: number, language: AnalysisRequest['language']): Pillar {
  return {
    stem: getLocalizedStem(stemIndex, language),
    branch: getLocalizedBranch(branchIndex, language),
  };
}

function getTimezoneConfig(timezone: string) {
  return TIMEZONE_CONFIG[timezone] || TIMEZONE_CONFIG['Asia/Seoul'];
}

function toCivilUtcMs(parts: ReturnType<typeof parseBirthParts>, timezone: string) {
  const { offsetHours } = getTimezoneConfig(timezone);
  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour - offsetHours, parts.minute, 0);
}

function getSolarCorrectionMinutes(timezone: string) {
  const config = getTimezoneConfig(timezone);
  return (config.longitude - config.standardMeridian) * 4;
}

function toTimezoneParts(utcMs: number, timezone: string) {
  const { offsetHours } = getTimezoneConfig(timezone);
  const local = new Date(utcMs + offsetHours * 60 * 60 * 1000);

  return {
    year: local.getUTCFullYear(),
    month: local.getUTCMonth() + 1,
    day: local.getUTCDate(),
    hour: local.getUTCHours(),
    minute: local.getUTCMinutes(),
  };
}

function getShiftedSolarParts(parts: ReturnType<typeof parseBirthParts>, timezone: string) {
  const civilUtcMs = toCivilUtcMs(parts, timezone);
  const correctedUtcMs = civilUtcMs + getSolarCorrectionMinutes(timezone) * 60 * 1000;
  const shiftedUtcMs = correctedUtcMs + 30 * 60 * 1000;

  return {
    corrected: toTimezoneParts(correctedUtcMs, timezone),
    shifted: toTimezoneParts(shiftedUtcMs, timezone),
  };
}

function getYearMonthPillars(parts: ReturnType<typeof parseBirthParts>, language: AnalysisRequest['language']) {
  const eightChar = Solar.fromYmdHms(parts.year, parts.month, parts.day, parts.hour, parts.minute, 0)
    .getLunar()
    .getEightChar();

  const yearStemIndex = stemIndexFromKo(eightChar.getYearGan());
  const yearBranchIndex = branchIndexFromKo(eightChar.getYearZhi());
  const monthStemIndex = stemIndexFromKo(eightChar.getMonthGan());
  const monthBranchIndex = branchIndexFromKo(eightChar.getMonthZhi());

  return {
    yearPillar: {
      pillar: buildPillar(yearStemIndex, yearBranchIndex, language),
      stemIndex: yearStemIndex,
      branchIndex: yearBranchIndex,
    },
    monthPillar: {
      pillar: buildPillar(monthStemIndex, monthBranchIndex, language),
      stemIndex: monthStemIndex,
      branchIndex: monthBranchIndex,
    },
  };
}

function getDayPillar(shiftedDate: ReturnType<typeof toTimezoneParts>, language: AnalysisRequest['language']) {
  const eightChar = Solar.fromYmdHms(shiftedDate.year, shiftedDate.month, shiftedDate.day, 12, 0, 0)
    .getLunar()
    .getEightChar();

  const stemIndex = stemIndexFromKo(eightChar.getDayGan());
  const branchIndex = branchIndexFromKo(eightChar.getDayZhi());

  return {
    pillar: buildPillar(stemIndex, branchIndex, language),
    stemIndex,
    branchIndex,
  };
}

function getHourPillar(
  dayStemIndex: number,
  shiftedTime: ReturnType<typeof toTimezoneParts>,
  language: AnalysisRequest['language'],
) {
  const totalMinutes = shiftedTime.hour * 60 + shiftedTime.minute;
  const branchIndex = mod(Math.floor(totalMinutes / 120), 12);
  const stemBase = mod(dayStemIndex, 5) * 2;
  const stemIndex = mod(stemBase + branchIndex, 10);

  return {
    pillar: buildPillar(stemIndex, branchIndex, language),
    stemIndex,
    branchIndex,
  };
}

function buildFiveElements(stemIndexes: number[], branchIndexes: number[]): FiveElements {
  const counts: FiveElements = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  for (const stemIndex of stemIndexes) {
    counts[stemElements[stemIndex] as SupportedElement] += 2;
  }

  for (const branchIndex of branchIndexes) {
    counts[branchElements[branchIndex] as SupportedElement] += 1;
  }

  const visiblePresence = new Set<SupportedElement>();

  for (const stemIndex of stemIndexes) {
    visiblePresence.add(stemElements[stemIndex] as SupportedElement);
  }

  for (const branchIndex of branchIndexes) {
    visiblePresence.add(branchElements[branchIndex] as SupportedElement);
  }

  const latentPresence = new Set<SupportedElement>();

  for (const branchIndex of branchIndexes) {
    for (const element of hiddenBranchElements[branchIndex]) {
      if (!visiblePresence.has(element)) {
        latentPresence.add(element);
      }
    }
  }

  for (const element of latentPresence) {
    counts[element] += 1;
  }

  return counts;
}

function getDominantElement(elements: FiveElements) {
  return Object.entries(elements).sort((a, b) => b[1] - a[1])[0]?.[0] as SupportedElement;
}

function getWeakestElement(elements: FiveElements) {
  return Object.entries(elements).sort((a, b) => a[1] - b[1])[0]?.[0] as SupportedElement;
}

function elementName(element: SupportedElement, language: AnalysisRequest['language']) {
  const labels = {
    ko: {
      wood: '목',
      fire: '화',
      earth: '토',
      metal: '금',
      water: '수',
    },
    en: {
      wood: 'Wood',
      fire: 'Fire',
      earth: 'Earth',
      metal: 'Metal',
      water: 'Water',
    },
    ja: {
      wood: '木',
      fire: '火',
      earth: '土',
      metal: '金',
      water: '水',
    },
  };

  return labels[language][element];
}

function buildSignals(
  dayStemIndex: number,
  elements: FiveElements,
  language: AnalysisRequest['language'],
) {
  const dominant = getDominantElement(elements);
  const weakest = getWeakestElement(elements);
  const dayMasterElement = stemElements[dayStemIndex] as SupportedElement;

  if (language === 'ko') {
    return {
      coreTone: `${elementName(dayMasterElement, language)} 기운을 중심으로 한 구조`,
      personalityHint: `${elementName(dominant, language)} 기운이 비교적 선명하게 드러나 자기 기준과 반응 방식이 분명한 편입니다.`,
      workHint: `${elementName(dayMasterElement, language)} 일간을 중심으로 일의 속도와 판단 기준이 형성되는 구조라, 환경보다 역할 정리가 중요하게 작용합니다.`,
      relationshipHint: `${elementName(weakest, language)} 기운이 약한 편이라 관계에서는 표현 방식이나 거리 조절에서 보완 포인트가 드러날 수 있습니다.`,
      balanceHint: `${elementName(dominant, language)} 기운이 강하고 ${elementName(weakest, language)} 기운이 약한 편이라, 무료 결과는 균형 포인트만 먼저 보여주고 심화 리포트에서 세부 흐름을 확장하는 구성이 적합합니다.`,
    };
  }

  if (language === 'ja') {
    return {
      coreTone: `${elementName(dayMasterElement, language)}の気を中心にした構造`,
      personalityHint: `${elementName(dominant, language)}の気が比較的強く表れ、自分なりの基準と反応の軸がはっきりしやすい命式です。`,
      workHint: `${elementName(dayMasterElement, language)}の日主を軸に仕事の進め方と判断基準が整いやすく、環境より役割整理の影響を受けやすい構造です。`,
      relationshipHint: `${elementName(weakest, language)}の気がやや弱いため、対人面では表現や距離感の調整が読みどころになります。`,
      balanceHint: `${elementName(dominant, language)}の気が強く、${elementName(weakest, language)}の気が軽いため、無料結果では全体バランスの要点を先に示し、詳細レポートで流れを広げる構成が適しています。`,
    };
  }

  return {
    coreTone: `A structure centered on ${elementName(dayMasterElement, language)} energy`,
    personalityHint: `${elementName(dominant, language)} appears comparatively strong, so personal standards and reactions tend to form clearly.`,
    workHint: `Because the day master is anchored in ${elementName(dayMasterElement, language)}, the chart suggests that role clarity matters more than surface pace.`,
    relationshipHint: `${elementName(weakest, language)} is relatively light, so relationship dynamics may reveal softer points around expression or pacing.`,
    balanceHint: `The chart leans toward ${elementName(dominant, language)} while ${elementName(weakest, language)} is lighter, making this free preview suitable for showing only the main balance notes before a deeper report.`,
  };
}

export function buildFreeAnalysisBase(payload: AnalysisRequest): Omit<FreeAnalysisData, 'reading'> {
  const parts = parseBirthParts(payload.birthdate, payload.birthtime);
  const { yearPillar, monthPillar } = getYearMonthPillars(parts, payload.language);
  const solarShift = getShiftedSolarParts(parts, payload.timezone);
  const dayPillar = getDayPillar(solarShift.shifted, payload.language);
  const hourPillar = getHourPillar(dayPillar.stemIndex, solarShift.shifted, payload.language);

  const fiveElements = buildFiveElements(
    [yearPillar.stemIndex, monthPillar.stemIndex, dayPillar.stemIndex, hourPillar.stemIndex],
    [yearPillar.branchIndex, monthPillar.branchIndex, dayPillar.branchIndex, hourPillar.branchIndex],
  );

  return {
    input: {
      name: payload.name,
      birthdate: payload.birthdate,
      birthtime: payload.birthtime || '',
      gender: payload.gender || '',
      language: payload.language,
      calendarType: payload.calendarType,
      timezone: payload.timezone,
    },
    manse: {
      yearPillar: yearPillar.pillar,
      monthPillar: monthPillar.pillar,
      dayPillar: dayPillar.pillar,
      hourPillar: hourPillar.pillar,
    },
    dayMaster: dayPillar.pillar.stem,
    fiveElements,
    signals: buildSignals(dayPillar.stemIndex, fiveElements, payload.language),
  };
}
