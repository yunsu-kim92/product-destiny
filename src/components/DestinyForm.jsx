import { LANGUAGES } from '../i18n/translations.js';

function DestinyForm({
  t,
  formData,
  loading,
  error,
  notice,
  onChange,
  onSubmit,
  onSecondaryAction,
}) {
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
            <input
              id="birthTime"
              name="birthtime"
              className="field-input"
              type="time"
              value={formData.birthtime}
              onChange={(event) => onChange('birthtime', event.target.value)}
            />
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
                  {option.label}
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

        <div className="form-status" aria-live="polite">
          {loading ? t('loadingMessage') : notice}
        </div>
        <div className={`error-box${error ? ' is-visible' : ''}`} role="alert">
          {error}
        </div>
      </form>

      <div className="analysis-note">{t('form.note')}</div>
    </div>
  );
}

export default DestinyForm;
