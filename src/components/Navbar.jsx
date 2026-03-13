import AppLink from './AppLink.jsx';
import { LANGUAGES } from '../i18n/translations.js';

function Navbar({
  language,
  setLanguage,
  t,
  isSubpage = false,
  onNavigate,
  authUser = null,
}) {
  return (
    <nav className="nav">
      <AppLink className="brand" href={isSubpage ? '/' : '#top'} onNavigate={onNavigate}>
        <span className="brand-badge">K</span>
        <span>K-Destiny</span>
      </AppLink>

      <div className="nav-right">
        <div className="nav-links">
          <a href="#start" onClick={(e) => { e.preventDefault(); onNavigate('/#start'); }}>{t('nav.analyze')}</a>
          <AppLink href="/about" onNavigate={onNavigate}>{t('nav.about')}</AppLink>
          <AppLink href="/privacy" onNavigate={onNavigate}>{t('nav.policy')}</AppLink>
        </div>

        <div className="nav-auth-group">
          <AppLink
            className={`auth-trigger${authUser ? ' is-logged-in' : ''}`}
            href="/mypage"
            onNavigate={onNavigate}
          >
            {authUser ? t('mypage.open') : t('auth.openLogin')}
          </AppLink>
        </div>

        <select
          className="language-select"
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
