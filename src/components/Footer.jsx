import AppLink from './AppLink.jsx';

function Footer({ t, onNavigate }) {
  return (
    <footer className="footer">
      <div className="footer-block">
        <span>{t('footer.left')}</span>
        <span>{t('footer.right')}</span>
      </div>
      <div className="footer-meta">
        <AppLink href="/about" onNavigate={onNavigate}>
          {t('footer.about')}
        </AppLink>
        <AppLink href="/privacy" onNavigate={onNavigate}>
          {t('policy.privacyTitle')}
        </AppLink>
        <AppLink href="/terms" onNavigate={onNavigate}>
          {t('policy.termsTitle')}
        </AppLink>
        <AppLink href="/refund" onNavigate={onNavigate}>
          {t('policy.refundTitle')}
        </AppLink>
        <AppLink href="/contact" onNavigate={onNavigate}>
          {t('policy.contactTitle')}
        </AppLink>
      </div>
    </footer>
  );
}

export default Footer;
