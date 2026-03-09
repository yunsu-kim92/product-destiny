function PolicySection({ t }) {
  const policies = [
    { title: t('policy.privacyTitle'), description: t('policy.privacyDesc') },
    { title: t('policy.termsTitle'), description: t('policy.termsDesc') },
    { title: t('policy.refundTitle'), description: t('policy.refundDesc') },
    { title: t('policy.contactTitle'), description: t('policy.contactDesc') },
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
          <a className="policy-link" href="#" key={policy.title}>
            <strong>{policy.title}</strong>
            <span>{policy.description}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

export default PolicySection;
