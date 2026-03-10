import { useEffect, useRef, useState } from 'react';
import Navbar from './components/Navbar.jsx';
import HeroSection from './components/HeroSection.jsx';
import DestinyForm from './components/DestinyForm.jsx';
import ServiceFlowCard from './components/ServiceFlowCard.jsx';
import ResultSection from './components/ResultSection.jsx';
import PartnershipSection from './components/PartnershipSection.jsx';
import CommentsSection from './components/CommentsSection.jsx';
import PolicySection from './components/PolicySection.jsx';
import Footer from './components/Footer.jsx';
import { DEFAULT_LANGUAGE, translate } from './i18n/translations.js';
import { mockAnalyze } from './utils/mockAnalyze.js';
import { validateForm } from './utils/validateForm.js';

const initialLanguage =
  typeof window !== 'undefined'
    ? window.localStorage.getItem('kdestiny-language') || DEFAULT_LANGUAGE
    : DEFAULT_LANGUAGE;

const initialFormData = {
  name: '',
  birthdate: '',
  birthtime: '',
  gender: '',
  language: initialLanguage,
  consent: false,
};

function App() {
  const [language, setLanguage] = useState(initialLanguage);
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [result, setResult] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState('');
  const [isFormLanguageDirty, setIsFormLanguageDirty] = useState(false);
  const formSectionRef = useRef(null);
  const resultsSectionRef = useRef(null);
  const lockedReportRef = useRef(null);

  const t = (key, values) => translate(key, language, values);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = t('pageTitle');

    const descriptionTag = document.querySelector('meta[name="description"]');
    if (descriptionTag) {
      descriptionTag.setAttribute('content', t('pageDescription'));
    }

    window.localStorage.setItem('kdestiny-language', language);
  }, [language]);

  useEffect(() => {
    if (!isFormLanguageDirty) {
      setFormData((current) => ({ ...current, language }));
    }
  }, [language, isFormLanguageDirty]);

  useEffect(() => {
    if (result && hasSubmitted) {
      resultsSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [result, hasSubmitted]);

  const scrollToRef = (targetRef) => {
    targetRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const handleFormChange = (name, value) => {
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (name === 'language') {
      setIsFormLanguageDirty(true);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setHasSubmitted(true);
    setError('');
    setNotice('');

    const payload = {
      ...formData,
      name: formData.name.trim(),
    };

    const validation = validateForm(payload, t);
    if (!validation.isValid) {
      setError(validation.errors[0]);
      return;
    }

    setLoading(true);

    try {
      let nextResult;

      try {
        const response = await fetch('/api/analyze-free', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const body = await response.json();

        if (!response.ok || !body?.ok) {
          throw new Error(body?.error?.message || 'API response was not ok');
        }

        nextResult = body.data;
      } catch (fetchError) {
        nextResult = await mockAnalyze(payload);
        setNotice(t('fallbackNotice'));
      }

      setSubmittedName(payload.name || 'Guest');
      setResult(nextResult);
    } catch (submissionError) {
      setError(t('networkError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="container">
        <Navbar language={language} setLanguage={setLanguage} t={t} />
        <HeroSection
          t={t}
          onPrimaryCta={() => scrollToRef(formSectionRef)}
          onSecondaryCta={() => scrollToRef(resultsSectionRef)}
        />

        <section className="section" id="start" ref={formSectionRef}>
          <div className="section-head">
            <span className="section-kicker">{t('form.kicker')}</span>
            <h2 className="section-title">{t('form.title')}</h2>
            <p className="section-subtitle">{t('form.desc')}</p>
          </div>

          <div className="service-grid">
            <DestinyForm
              t={t}
              formData={formData}
              loading={loading}
              error={error}
              notice={notice}
              onChange={handleFormChange}
              onSubmit={handleSubmit}
              onSecondaryAction={() => scrollToRef(resultsSectionRef)}
            />
            <ServiceFlowCard t={t} />
          </div>
        </section>

        <ResultSection
          t={t}
          result={result}
          submittedName={submittedName}
          sectionRef={resultsSectionRef}
          lockedRef={lockedReportRef}
          onRetry={() => scrollToRef(formSectionRef)}
          onUnlock={() => window.alert(t('unlockAlert'))}
          onScrollToLocked={() => scrollToRef(lockedReportRef)}
        />

        <PartnershipSection t={t} />
        <CommentsSection t={t} />
        <PolicySection t={t} />
        <Footer t={t} />
      </div>
    </div>
  );
}

export default App;
