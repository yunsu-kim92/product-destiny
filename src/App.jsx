import { useEffect, useRef, useState } from 'react';
import Navbar from './components/Navbar.jsx';
import HeroSection from './components/HeroSection.jsx';
import DestinyForm from './components/DestinyForm.jsx';
import ServiceFlowCard from './components/ServiceFlowCard.jsx';
import ResultSection from './components/ResultSection.jsx';
import EditorialSection from './components/EditorialSection.jsx';
import PartnershipSection from './components/PartnershipSection.jsx';
import CommentsSection from './components/CommentsSection.jsx';
import FaqSection from './components/FaqSection.jsx';
import PolicySection from './components/PolicySection.jsx';
import StaticPage from './components/StaticPage.jsx';
import Footer from './components/Footer.jsx';
import { DEFAULT_LANGUAGE, LANGUAGES, translate } from './i18n/translations.js';
import { buildPageUrl } from './seo.js';
import { mockAnalyze } from './utils/mockAnalyze.js';
import { validateForm } from './utils/validateForm.js';

const supportedLanguages = new Set(LANGUAGES.map((languageOption) => languageOption.value));

const initialLanguage =
  typeof window !== 'undefined'
    ? supportedLanguages.has(window.localStorage.getItem('kdestiny-language'))
      ? window.localStorage.getItem('kdestiny-language')
      : DEFAULT_LANGUAGE
    : DEFAULT_LANGUAGE;

const initialFormData = {
  name: '',
  birthdate: '',
  birthtime: '',
  gender: '',
  language: initialLanguage,
  consent: false,
};

function getCurrentPath() {
  if (typeof window === 'undefined') {
    return '/';
  }

  return window.location.pathname || '/';
}

function HomePage({
  t,
  language,
  setLanguage,
  formSectionRef,
  guideSectionRef,
  resultsSectionRef,
  lockedReportRef,
  formData,
  loading,
  error,
  notice,
  result,
  submittedName,
  onChange,
  onSubmit,
  onRetry,
  onUnlock,
  onScrollToLocked,
}) {
  const scrollToRef = (targetRef) => {
    targetRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <div className="page-shell">
      <div className="container">
        <Navbar language={language} setLanguage={setLanguage} t={t} />
        <main>
          <HeroSection
            t={t}
            onPrimaryCta={() => scrollToRef(formSectionRef)}
            onSecondaryCta={() => scrollToRef(guideSectionRef)}
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
                onChange={onChange}
                onSubmit={onSubmit}
                onSecondaryAction={() => scrollToRef(resultsSectionRef)}
              />
              <ServiceFlowCard t={t} />
            </div>
          </section>

          <div ref={guideSectionRef}>
            <EditorialSection t={t} />
          </div>

          <ResultSection
            t={t}
            result={result}
            submittedName={submittedName}
            sectionRef={resultsSectionRef}
            lockedRef={lockedReportRef}
            onRetry={onRetry}
            onUnlock={onUnlock}
            onScrollToLocked={onScrollToLocked}
          />

          <PartnershipSection t={t} />
          <FaqSection t={t} />
          <CommentsSection t={t} />
          <PolicySection t={t} />
        </main>
        <Footer t={t} />
      </div>
    </div>
  );
}

function App() {
  const [language, setLanguage] = useState(initialLanguage);
  const [pathname, setPathname] = useState(getCurrentPath);
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [result, setResult] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState('');
  const [isFormLanguageDirty, setIsFormLanguageDirty] = useState(false);
  const formSectionRef = useRef(null);
  const guideSectionRef = useRef(null);
  const resultsSectionRef = useRef(null);
  const lockedReportRef = useRef(null);

  const t = (key, values) => translate(key, language, values);

  useEffect(() => {
    document.documentElement.lang = language;
    const routeMap = {
      '/': { title: t('pageTitle'), description: t('pageDescription') },
      '/about': { title: t('about.metaTitle'), description: t('about.metaDescription') },
      '/privacy': {
        title: t('privacy.metaTitle'),
        description: t('privacy.metaDescription'),
      },
      '/terms': { title: t('terms.metaTitle'), description: t('terms.metaDescription') },
      '/refund': {
        title: t('refund.metaTitle'),
        description: t('refund.metaDescription'),
      },
      '/contact': {
        title: t('contact.metaTitle'),
        description: t('contact.metaDescription'),
      },
    };
    const routeMeta = routeMap[pathname] || routeMap['/'];
    const pageUrl = buildPageUrl(pathname);
    document.title = routeMeta.title;

    const descriptionTag = document.querySelector('meta[name="description"]');
    if (descriptionTag) {
      descriptionTag.setAttribute('content', routeMeta.description);
    }

    const canonicalLink =
      document.querySelector('link[rel="canonical"]') || document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    canonicalLink.setAttribute('href', pageUrl);
    if (!canonicalLink.parentNode) {
      document.head.appendChild(canonicalLink);
    }

    const upsertMeta = (selector, attr, value) => {
      const element = document.querySelector(selector);
      if (element) {
        element.setAttribute(attr, value);
      }
    };

    upsertMeta('meta[property="og:title"]', 'content', routeMeta.title);
    upsertMeta('meta[property="og:description"]', 'content', routeMeta.description);
    upsertMeta('meta[property="og:url"]', 'content', pageUrl);
    upsertMeta('meta[name="twitter:title"]', 'content', routeMeta.title);
    upsertMeta('meta[name="twitter:description"]', 'content', routeMeta.description);

    const structuredData = document.getElementById('structured-data');
    if (structuredData) {
      structuredData.textContent = JSON.stringify(
        {
          '@context': 'https://schema.org',
          '@type': pathname === '/' ? 'WebSite' : 'WebPage',
          name: routeMeta.title,
          url: pageUrl,
          inLanguage: language,
          description: routeMeta.description,
        },
        null,
        2,
      );
    }

    window.localStorage.setItem('kdestiny-language', language);
  }, [language, pathname]);

  useEffect(() => {
    const handlePopState = () => setPathname(getCurrentPath());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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

  const pageConfigs = {
    '/about': {
      title: t('about.title'),
      description: t('about.desc'),
      cta: { href: '/#start', label: t('about.cta') },
      sections: [
        {
          title: t('about.section1Title'),
          body: [t('about.section1Body1'), t('about.section1Body2')],
        },
        {
          title: t('about.section2Title'),
          body: [t('about.section2Body1'), t('about.section2Body2')],
        },
        {
          title: t('about.section3Title'),
          body: [t('about.section3Body1'), t('about.section3Body2')],
        },
      ],
    },
    '/privacy': {
      title: t('privacy.title'),
      description: t('privacy.desc'),
      cta: { href: '/contact', label: t('privacy.cta') },
      sections: [
        {
          title: t('privacy.section1Title'),
          body: [t('privacy.section1Body1'), t('privacy.section1Body2')],
        },
        {
          title: t('privacy.section2Title'),
          body: [t('privacy.section2Body1'), t('privacy.section2Body2')],
        },
        {
          title: t('privacy.section3Title'),
          body: [t('privacy.section3Body1'), t('privacy.section3Body2')],
        },
      ],
    },
    '/terms': {
      title: t('terms.title'),
      description: t('terms.desc'),
      sections: [
        { title: t('terms.section1Title'), body: [t('terms.section1Body1'), t('terms.section1Body2')] },
        { title: t('terms.section2Title'), body: [t('terms.section2Body1'), t('terms.section2Body2')] },
        { title: t('terms.section3Title'), body: [t('terms.section3Body1'), t('terms.section3Body2')] },
      ],
    },
    '/refund': {
      title: t('refund.title'),
      description: t('refund.desc'),
      sections: [
        { title: t('refund.section1Title'), body: [t('refund.section1Body1'), t('refund.section1Body2')] },
        { title: t('refund.section2Title'), body: [t('refund.section2Body1'), t('refund.section2Body2')] },
        { title: t('refund.section3Title'), body: [t('refund.section3Body1'), t('refund.section3Body2')] },
      ],
    },
    '/contact': {
      title: t('contact.title'),
      description: t('contact.desc'),
      cta: { href: '/#partnership', label: t('contact.cta') },
      sections: [
        {
          title: t('contact.section1Title'),
          body: [t('contact.section1Body1'), t('contact.section1Body2')],
        },
        {
          title: t('contact.section2Title'),
          body: [t('contact.section2Body1'), t('contact.section2Body2')],
        },
        {
          title: t('contact.section3Title'),
          body: [t('contact.section3Body1'), t('contact.section3Body2')],
        },
      ],
    },
  };

  const activePage = pageConfigs[pathname];

  if (activePage) {
    return (
      <div className="page-shell">
        <div className="container">
          <Navbar language={language} setLanguage={setLanguage} t={t} isSubpage />
          <main>
            <StaticPage
              title={activePage.title}
              description={activePage.description}
              sections={activePage.sections}
              cta={activePage.cta}
            />
          </main>
          <Footer t={t} />
        </div>
      </div>
    );
  }

  return (
    <HomePage
      t={t}
      language={language}
      setLanguage={setLanguage}
      formSectionRef={formSectionRef}
      guideSectionRef={guideSectionRef}
      resultsSectionRef={resultsSectionRef}
      lockedReportRef={lockedReportRef}
      formData={formData}
      loading={loading}
      error={error}
      notice={notice}
      result={result}
      submittedName={submittedName}
      onChange={handleFormChange}
      onSubmit={handleSubmit}
      onRetry={() =>
        formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      onUnlock={() => window.alert(t('unlockAlert'))}
      onScrollToLocked={() =>
        lockedReportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    />
  );
}

export default App;
