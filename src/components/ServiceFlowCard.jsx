function ServiceFlowCard({ t }) {
  const steps = [
    { title: t('flow.step1Title'), description: t('flow.step1Desc') },
    { title: t('flow.step2Title'), description: t('flow.step2Desc') },
    { title: t('flow.step3Title'), description: t('flow.step3Desc') },
    { title: t('flow.step4Title'), description: t('flow.step4Desc') },
  ];

  return (
    <div className="card timeline-card">
      <div className="section-kicker">{t('flow.kicker')}</div>

      {steps.map((step, index) => (
        <div className="timeline-step" key={step.title}>
          <strong>{index + 1}</strong>
          <div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ServiceFlowCard;
