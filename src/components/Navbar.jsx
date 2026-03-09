import { LANGUAGES } from '../i18n/translations.js';

function Navbar({ language, setLanguage, t }) {
  return (
    <nav className="nav">
      <a className="brand" href="#top">
        <span className="brand-badge">K</span>
        <span>K-Destiny</span>
      </a>

      <div className="nav-right">
        <div className="nav-links">
          <a href="#start">{t('nav.analyze')}</a>
          <a href="#results">{t('nav.results')}</a>
          <a href="#policy">{t('nav.policy')}</a>
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
