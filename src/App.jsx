import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import Navbar from './components/Navbar.jsx';
import HeroSection from './components/HeroSection.jsx';
import DestinyForm from './components/DestinyForm.jsx';
import ServiceFlowCard from './components/ServiceFlowCard.jsx';
import ResultSection from './components/ResultSection.jsx';
import QuickAnswersSection from './components/QuickAnswersSection.jsx';
import Footer from './components/Footer.jsx';
import { DEFAULT_LANGUAGE, LANGUAGES, translate } from './i18n/translations.js';
import { buildPageUrl } from './seo.js';
import { mockAnalyze } from './utils/mockAnalyze.js';
import { validateForm } from './utils/validateForm.js';

const EditorialSection = lazy(() => import('./components/EditorialSection.jsx'));
const PartnershipSection = lazy(() => import('./components/PartnershipSection.jsx'));
const CommentsSection = lazy(() => import('./components/CommentsSection.jsx'));
const FaqSection = lazy(() => import('./components/FaqSection.jsx'));
const PolicySection = lazy(() => import('./components/PolicySection.jsx'));
const StaticPage = lazy(() => import('./components/StaticPage.jsx'));

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

function isLocalPreview() {
  if (typeof window === 'undefined') {
    return false;
  }

  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

function getSubmissionErrorMessage(error, t) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return t('networkError');
}

function getCurrentPath() {
  if (typeof window === 'undefined') {
    return '/';
  }

  return normalizePath(window.location.pathname || '/');
}

function normalizePath(pathname) {
  if (!pathname || pathname === '/') {
    return '/';
  }

  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

function HomePage({
  t,
  language,
  setLanguage,
  onNavigate,
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
        <Navbar language={language} setLanguage={setLanguage} t={t} onNavigate={onNavigate} />
        <main>
          <HeroSection
            t={t}
            onPrimaryCta={() => scrollToRef(formSectionRef)}
            onSecondaryCta={() => scrollToRef(guideSectionRef)}
          />

          <QuickAnswersSection t={t} />

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

          <Suspense fallback={null}>
            <div ref={guideSectionRef}>
              <EditorialSection t={t} />
            </div>
          </Suspense>

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

          <Suspense fallback={null}>
            <PartnershipSection t={t} />
            <FaqSection t={t} />
            <CommentsSection t={t} />
            <PolicySection t={t} onNavigate={onNavigate} />
          </Suspense>
        </main>
        <Footer t={t} onNavigate={onNavigate} />
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
      const homepageFaq = [
        {
          '@type': 'Question',
          name: t('geo.q1'),
          acceptedAnswer: {
            '@type': 'Answer',
            text: t('geo.a1'),
          },
        },
        {
          '@type': 'Question',
          name: t('geo.q2'),
          acceptedAnswer: {
            '@type': 'Answer',
            text: t('geo.a2'),
          },
        },
        {
          '@type': 'Question',
          name: t('geo.q3'),
          acceptedAnswer: {
            '@type': 'Answer',
            text: t('geo.a3'),
          },
        },
        {
          '@type': 'Question',
          name: t('geo.q4'),
          acceptedAnswer: {
            '@type': 'Answer',
            text: t('geo.a4'),
          },
        },
      ];

      const graph =
        pathname === '/'
          ? [
              {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: 'K-Destiny',
                url: pageUrl,
                inLanguage: language,
                description: routeMeta.description,
              },
              {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'K-Destiny',
                url: pageUrl,
                description: t('about.desc'),
                contactPoint: {
                  '@type': 'ContactPoint',
                  contactType: 'customer support',
                  url: buildPageUrl('/contact'),
                },
              },
              {
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: homepageFaq,
              },
            ]
          : [
              {
                '@context': 'https://schema.org',
                '@type': 'WebPage',
                name: routeMeta.title,
                url: pageUrl,
                inLanguage: language,
                description: routeMeta.description,
              },
            ];

      structuredData.textContent = JSON.stringify(graph, null, 2);
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

  const handleNavigate = (nextHref) => {
    if (typeof window === 'undefined') {
      return;
    }

    const nextUrl = new URL(nextHref, window.location.origin);
    const nextPath = `${normalizePath(nextUrl.pathname)}${nextUrl.search}`;

    window.history.pushState({}, '', `${nextPath}${nextUrl.hash}`);
    setPathname(normalizePath(nextUrl.pathname || '/'));

    if (nextUrl.hash) {
      requestAnimationFrame(() => {
        document.querySelector(nextUrl.hash)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      });
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        if (isLocalPreview()) {
          nextResult = await mockAnalyze(payload);
          setNotice(t('fallbackNotice'));
        } else {
          throw fetchError;
        }
      }

      setSubmittedName(payload.name || 'Guest');
      setResult(nextResult);
    } catch (submissionError) {
      setError(getSubmissionErrorMessage(submissionError, t));
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
          <Navbar
            language={language}
            setLanguage={setLanguage}
            t={t}
            isSubpage
            onNavigate={handleNavigate}
          />
          <main>
            <Suspense fallback={null}>
              <StaticPage
                title={activePage.title}
                description={activePage.description}
                sections={activePage.sections}
                cta={activePage.cta}
                onNavigate={handleNavigate}
              />
            </Suspense>
          </main>
          <Footer t={t} onNavigate={handleNavigate} />
        </div>
      </div>
    );
  }

  return (
    <HomePage
      t={t}
      language={language}
      setLanguage={setLanguage}
      onNavigate={handleNavigate}
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
