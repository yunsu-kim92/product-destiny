function PartnershipSection({ t }) {
  return (
    <section className="section" id="partnership">
      <details className="collapsible-section">
        <summary className="collapsible-summary">
          <div className="section-head collapsible-head">
            <span className="section-kicker">{t('partnership.kicker')}</span>
            <h2 className="section-title">{t('partnership.title')}</h2>
            <p className="section-subtitle">{t('partnership.desc')}</p>
          </div>
          <span className="collapsible-trigger">{t('common.expand')}</span>
        </summary>

        <div className="collapsible-body">
          <div className="partnership-layout">
            <div className="card partnership-card">
              <strong className="partnership-highlight">{t('partnership.highlight')}</strong>
              <p>{t('partnership.note')}</p>

              <div className="partnership-points">
                <div className="partnership-point">
                  <strong>{t('partnership.point1Title')}</strong>
                  <span>{t('partnership.point1Desc')}</span>
                </div>
                <div className="partnership-point">
                  <strong>{t('partnership.point2Title')}</strong>
                  <span>{t('partnership.point2Desc')}</span>
                </div>
                <div className="partnership-point">
                  <strong>{t('partnership.point3Title')}</strong>
                  <span>{t('partnership.point3Desc')}</span>
                </div>
              </div>
            </div>

            <form
              className="panel partnership-form"
              action="https://formspree.io/f/mbdzdven"
              method="POST"
            >
              <input type="hidden" name="_subject" value="K-Destiny partnership inquiry" />
              <input type="hidden" name="_language" value="ko" />

              <div className="form-grid">
                <label className="field-group">
                  <span className="field-label">{t('partnership.form.company')}</span>
                  <input
                    className="field-input"
                    type="text"
                    name="company"
                    placeholder={t('partnership.form.companyPlaceholder')}
                    required
                  />
                </label>

                <label className="field-group">
                  <span className="field-label">{t('partnership.form.name')}</span>
                  <input
                    className="field-input"
                    type="text"
                    name="name"
                    placeholder={t('partnership.form.namePlaceholder')}
                    required
                  />
                </label>

                <label className="field-group">
                  <span className="field-label">{t('partnership.form.email')}</span>
                  <input
                    className="field-input"
                    type="email"
                    name="email"
                    placeholder={t('partnership.form.emailPlaceholder')}
                    required
                  />
                </label>

                <label className="field-group">
                  <span className="field-label">{t('partnership.form.phone')}</span>
                  <input
                    className="field-input"
                    type="text"
                    name="phone"
                    placeholder={t('partnership.form.phonePlaceholder')}
                  />
                </label>

                <label className="field-group full">
                  <span className="field-label">{t('partnership.form.type')}</span>
                  <select
                    className="field-select"
                    name="partnershipType"
                    defaultValue="brand"
                    required
                  >
                    <option value="brand">{t('partnership.form.typeBrand')}</option>
                    <option value="media">{t('partnership.form.typeMedia')}</option>
                    <option value="affiliate">{t('partnership.form.typeAffiliate')}</option>
                    <option value="other">{t('partnership.form.typeOther')}</option>
                  </select>
                </label>

                <label className="field-group full">
                  <span className="field-label">{t('partnership.form.message')}</span>
                  <textarea
                    className="field-input field-textarea"
                    name="message"
                    placeholder={t('partnership.form.messagePlaceholder')}
                    rows="6"
                    required
                  />
                </label>
              </div>

              <div className="partnership-actions">
                <button className="btn btn-primary" type="submit">
                  {t('partnership.form.submit')}
                </button>
                <span className="partnership-caption">{t('partnership.form.caption')}</span>
              </div>
            </form>
          </div>
        </div>
      </details>
    </section>
  );
}

export default PartnershipSection;
