import AppLink from './AppLink.jsx';

function StaticPage({ title, description, sections, cta, onNavigate }) {
  return (
    <section className="static-page">
      <div className="static-hero panel">
        <span className="section-kicker">Info</span>
        <h1 className="static-title">{title}</h1>
        <p className="static-description">{description}</p>
        {cta ? (
          <div className="cta-row">
            <AppLink className="btn btn-primary" href={cta.href} onNavigate={onNavigate}>
              {cta.label}
            </AppLink>
          </div>
        ) : null}
      </div>

      <div className="static-sections">
        {sections.map((section) => (
          <article className="panel static-section" key={section.title}>
            <h2>{section.title}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}

export default StaticPage;
