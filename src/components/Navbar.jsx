import { LANGUAGES } from '../i18n/translations.js';

function Navbar({ language, setLanguage, t, isSubpage = false }) {
  const homePrefix = isSubpage ? '/#' : '#';

  return (
    <nav className="nav">
      <a className="brand" href={isSubpage ? '/' : '#top'}>
        <span className="brand-badge">K</span>
        <span>K-Destiny</span>
      </a>

      <div className="nav-right">
        <div className="nav-links">
          <a href={`${homePrefix}start`}>{t('nav.analyze')}</a>
          <a href={`${homePrefix}guide`}>{t('nav.guide')}</a>
          <a href={`${homePrefix}results`}>{t('nav.results')}</a>
          <a href="/about">{t('nav.about')}</a>
          <a href={`${homePrefix}partnership`}>{t('nav.partnership')}</a>
          <a href={`${homePrefix}faq`}>{t('nav.faq')}</a>
          <a href="/privacy">{t('nav.policy')}</a>
        </div>

        <select
          className="language-select"
          aria-label={t('nav.languageLabel')}
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
        >
          {LANGUAGES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </nav>
  );
}

export default Navbar;
