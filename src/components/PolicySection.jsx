import AppLink from './AppLink.jsx';

function PolicySection({ t, onNavigate }) {
  const policies = [
    {
      title: t('policy.privacyTitle'),
      description: t('policy.privacyDesc'),
      detail: t('policy.privacyDetail'),
      href: '/privacy',
    },
    {
      title: t('policy.termsTitle'),
      description: t('policy.termsDesc'),
      detail: t('policy.termsDetail'),
      href: '/terms',
    },
    {
      title: t('policy.refundTitle'),
      description: t('policy.refundDesc'),
      detail: t('policy.refundDetail'),
      href: '/refund',
    },
    {
      title: t('policy.contactTitle'),
      description: t('policy.contactDesc'),
      detail: t('policy.contactDetail'),
      href: '/contact',
    },
  ];

  return (
    <section className="section" id="policy">
      <div className="section-head">
        <span className="section-kicker">{t('policy.kicker')}</span>
        <h2 className="section-title">{t('policy.title')}</h2>
        <p className="section-subtitle">{t('policy.desc')}</p>
      </div>

      <div className="policy-links">
        {policies.map((policy) => (
          <AppLink
            className="policy-link"
            href={policy.href}
            key={policy.title}
            onNavigate={onNavigate}
          >
            <strong>{policy.title}</strong>
            <span>{policy.description}</span>
            <p>{policy.detail}</p>
          </AppLink>
        ))}
      </div>
    </section>
  );
}

export default PolicySection;
