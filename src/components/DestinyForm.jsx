import { LANGUAGES } from '../i18n/translations.js';
import AnalysisProgress from './AnalysisProgress.jsx';

function parseBirthTime(value) {
  if (!value) {
    return {
      period: '',
      hour12: '',
      minute: '',
    };
  }

  const [rawHour = '00', rawMinute = '00'] = value.split(':');
  const hour24 = Number.parseInt(rawHour, 10);
  const minute = Number.parseInt(rawMinute, 10);

  if (!Number.isFinite(hour24) || !Number.isFinite(minute)) {
    return {
      period: '',
      hour12: '',
      minute: '',
    };
  }

  const period = hour24 < 12 ? 'am' : 'pm';
  const normalizedHour = hour24 % 12 || 12;

  return {
    period,
    hour12: String(normalizedHour),
    minute: String(minute).padStart(2, '0'),
  };
}

function formatBirthTime(period, hour12, minute) {
  if (!period || !hour12 || minute === '') {
    return '';
  }

  const parsedHour = Number.parseInt(hour12, 10);
  const parsedMinute = Number.parseInt(minute, 10);

  if (!Number.isFinite(parsedHour) || !Number.isFinite(parsedMinute)) {
    return '';
  }

  const normalizedHour =
    period === 'am'
      ? parsedHour === 12
        ? 0
        : parsedHour
      : parsedHour === 12
        ? 12
        : parsedHour + 12;

  return `${String(normalizedHour).padStart(2, '0')}:${String(parsedMinute).padStart(2, '0')}`;
}

function DestinyForm({
  t,
  formData,
  loading,
  loadingProgress,
  loadingStage,
  error,
  notice,
  onChange,
  onSubmit,
  onSecondaryAction,
}) {
  const timeParts = parseBirthTime(formData.birthtime);
  const hourOptions = Array.from({ length: 12 }, (_, index) => String(index + 1));
  const minuteOptions = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'));

  const handleTimePartChange = (part, value) => {
    const nextPeriod = part === 'period' ? value : timeParts.period;
    const nextHour12 = part === 'hour12' ? value : timeParts.hour12;
    const nextMinute = part === 'minute' ? value : timeParts.minute;

    onChange('birthtime', formatBirthTime(nextPeriod, nextHour12, nextMinute));
  };

  return (
    <div className="panel">
      <form onSubmit={onSubmit} noValidate>
        <div className="form-grid">
          <div className="field-group">
            <label className="field-label" htmlFor="userName">
              {t('form.name')}
            </label>
            <input
              id="userName"
              name="name"
              className="field-input"
              type="text"
              autoComplete="name"
              placeholder={t('form.namePlaceholder')}
              value={formData.name}
              onChange={(event) => onChange('name', event.target.value)}
            />
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="birthDate">
              {t('form.birthdate')}
            </label>
            <input
              id="birthDate"
              name="birthdate"
              className="field-input"
              type="date"
              value={formData.birthdate}
              onChange={(event) => onChange('birthdate', event.target.value)}
            />
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="birthTime">
              {t('form.birthtime')}
            </label>
            <div className="time-select-grid">
              <select
                id="birthTime"
                name="birthtimePeriod"
                className="field-select"
                value={timeParts.period}
                onChange={(event) => handleTimePartChange('period', event.target.value)}
              >
                <option value="">{t('form.periodPlaceholder')}</option>
                <option value="am">{t('common.am')}</option>
                <option value="pm">{t('common.pm')}</option>
              </select>
              <select
                name="birthtimeHour"
                className="field-select"
                value={timeParts.hour12}
                onChange={(event) => handleTimePartChange('hour12', event.target.value)}
              >
                <option value="">{t('form.hourPlaceholder')}</option>
                {hourOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                name="birthtimeMinute"
                className="field-select"
                value={timeParts.minute}
                onChange={(event) => handleTimePartChange('minute', event.target.value)}
              >
                <option value="">{t('form.minutePlaceholder')}</option>
                {minuteOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <span className="field-note">{t('form.birthtimeNote')}</span>
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="gender">
              {t('form.gender')}
            </label>
            <select
              id="gender"
              name="gender"
              className="field-select"
              value={formData.gender}
              onChange={(event) => onChange('gender', event.target.value)}
            >
              <option value="">{t('form.genderPrefer')}</option>
              <option value="female">{t('form.genderFemale')}</option>
              <option value="male">{t('form.genderMale')}</option>
              <option value="other">{t('form.genderOther')}</option>
            </select>
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="formLanguage">
              {t('form.language')}
            </label>
            <select
              id="formLanguage"
              name="language"
              className="field-select"
              value={formData.language}
              onChange={(event) => onChange('language', event.target.value)}
            >
              {LANGUAGES.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group full">
            <label className="checkbox-row" htmlFor="consent">
              <input
                id="consent"
                name="consent"
                type="checkbox"
                checked={formData.consent}
                onChange={(event) => onChange('consent', event.target.checked)}
              />
              <span className="checkbox-copy">
                <strong>{t('form.consentTitle')}</strong>
                <span>{t('form.consentText')}</span>
              </span>
            </label>
          </div>
        </div>

        <div className="form-actions form-actions-top">
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {t('form.submit')}
          </button>
          <button className="btn btn-secondary" type="button" onClick={onSecondaryAction}>
            {t('form.secondaryCta')}
          </button>
        </div>
        <div className="form-trust-note">{t('form.avgTime')}</div>

        {loading ? (
          <AnalysisProgress t={t} progress={loadingProgress} stage={loadingStage} />
        ) : (
          <div className="form-status" aria-live="polite">
            {notice}
          </div>
        )}
        <div className={`error-box${error ? ' is-visible' : ''}`} role="alert">
          {error}
        </div>
      </form>

      <div className="analysis-note">{t('form.note')}</div>
    </div>
  );
}

export default DestinyForm;
