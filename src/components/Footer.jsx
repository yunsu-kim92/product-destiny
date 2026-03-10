function Footer({ t }) {
  return (
    <footer className="footer">
      <div className="footer-block">
        <span>{t('footer.left')}</span>
        <span>{t('footer.right')}</span>
      </div>
      <div className="footer-meta">
        <a href="/about">{t('footer.about')}</a>
        <a href="/privacy">{t('policy.privacyTitle')}</a>
        <a href="/terms">{t('policy.termsTitle')}</a>
        <a href="/refund">{t('policy.refundTitle')}</a>
        <a href="/contact">{t('policy.contactTitle')}</a>
      </div>
    </footer>
  );
}

export default Footer;
