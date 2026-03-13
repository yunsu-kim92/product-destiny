import { LANGUAGES } from '../i18n/translations.js';
import AppLink from './AppLink.jsx';

function Navbar({ language, setLanguage, t, isSubpage = false, onNavigate }) {
  const homePrefix = isSubpage ? '/#' : '#';

  return (
    <nav className="nav">
      <AppLink className="brand" href={isSubpage ? '/' : '#top'} onNavigate={onNavigate}>
        <span className="brand-badge">K</span>
        <span>K-Destiny</span>
      </AppLink>

      <div className="nav-right">
        <div className="nav-links">
          <a href={`${homePrefix}start`}>{t('nav.analyze')}</a>
          <a href={`${homePrefix}guide`}>{t('nav.guide')}</a>
          <a href={`${homePrefix}results`}>{t('nav.results')}</a>
          <AppLink href="/about" onNavigate={onNavigate}>
            {t('nav.about')}
          </AppLink>
          <a href={`${homePrefix}partnership`}>{t('nav.partnership')}</a>
          <a href={`${homePrefix}faq`}>{t('nav.faq')}</a>
          <AppLink href="/privacy" onNavigate={onNavigate}>
            {t('nav.policy')}
          </AppLink>
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
