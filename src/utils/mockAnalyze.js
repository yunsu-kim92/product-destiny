import { translate } from '../i18n/translations.js';

function getMockLocale(language) {
  return {
    dayMaster: translate('mock.dayMaster', language),
    signals: {
      coreTone: translate('mock.signalCoreTone', language),
      personalityHint: translate('mock.signalPersonality', language),
      workHint: translate('mock.signalWork', language),
      relationshipHint: translate('mock.signalRelationship', language),
      balanceHint: translate('mock.signalBalance', language),
    },
    reading: {
      sajuReading: translate('mock.readingSaju', language),
      coreNature: translate('mock.readingCoreNature', language),
      lifeWorkFlow: translate('mock.readingLifeWorkFlow', language),
      relationshipPattern: translate('mock.readingRelationshipPattern', language),
      guidance: translate('mock.readingGuidance', language),
      fullReportLocked: true,
    },
  };
}

export function mockAnalyze(payload) {
  const locale = getMockLocale(payload.language);
  const pillarLocale = {
    yearStem: translate('mock.pillarYearStem', payload.language),
    yearBranch: translate('mock.pillarYearBranch', payload.language),
    monthStem: translate('mock.pillarMonthStem', payload.language),
    monthBranch: translate('mock.pillarMonthBranch', payload.language),
    dayBranch: translate('mock.pillarDayBranch', payload.language),
    hourStem: translate('mock.pillarHourStem', payload.language),
    hourBranch: translate('mock.pillarHourBranch', payload.language),
  };

  return Promise.resolve({
    input: {
      name: payload.name,
      birthdate: payload.birthdate,
      birthtime: payload.birthtime || '',
      gender: payload.gender || '',
      language: payload.language,
      calendarType: 'solar',
      timezone: 'Asia/Seoul',
    },
    manse: {
      yearPillar: { stem: pillarLocale.yearStem, branch: pillarLocale.yearBranch },
      monthPillar: { stem: pillarLocale.monthStem, branch: pillarLocale.monthBranch },
      dayPillar: { stem: locale.dayMaster, branch: pillarLocale.dayBranch },
      hourPillar: { stem: pillarLocale.hourStem, branch: pillarLocale.hourBranch },
    },
    dayMaster: locale.dayMaster,
    fiveElements: {
      wood: 5,
      fire: 3,
      earth: 4,
      metal: 1,
      water: 2,
    },
    signals: locale.signals,
    reading: locale.reading,
  });
}
