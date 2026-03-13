import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import Navbar from './components/Navbar.jsx';
import HeroSection from './components/HeroSection.jsx';
import DestinyForm from './components/DestinyForm.jsx';
import ServiceFlowCard from './components/ServiceFlowCard.jsx';
import ResultSection from './components/ResultSection.jsx';
import QuickAnswersSection from './components/QuickAnswersSection.jsx';
import Footer from './components/Footer.jsx';
import ScrollTopButton from './components/ScrollTopButton.jsx';
import SubscriptionSection from './components/SubscriptionSection.jsx';
import AuthDialog from './components/AuthDialog.jsx';
import { DEFAULT_LANGUAGE, LANGUAGES, translate } from './i18n/translations.js';
import { buildPageUrl } from './seo.js';
import { getSupabaseClient, isSupabaseConfigured } from './lib/supabaseClient.js';
import {
  clearAnalysisCache,
  getCachedAnalysis,
  setCachedAnalysis,
} from './utils/analysisCache.js';
import { mockAnalyze } from './utils/mockAnalyze.js';
import { validateForm } from './utils/validateForm.js';

const EditorialSection = lazy(() => import('./components/EditorialSection.jsx'));
const PartnershipSection = lazy(() => import('./components/PartnershipSection.jsx'));
const CommentsSection = lazy(() => import('./components/CommentsSection.jsx'));
const FaqSection = lazy(() => import('./components/FaqSection.jsx'));
const PolicySection = lazy(() => import('./components/PolicySection.jsx'));
const StaticPage = lazy(() => import('./components/StaticPage.jsx'));

const supportedLanguages = new Set(LANGUAGES.map((languageOption) => languageOption.value));

function normalizeLanguage(value) {
  if (!value) {
    return null;
  }

  const normalized = String(value).toLowerCase().split('-')[0];
  return supportedLanguages.has(normalized) ? normalized : null;
}

function resolveInitialLanguage() {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE;
  }

  const storedLanguage = normalizeLanguage(window.localStorage.getItem('kdestiny-language'));
  if (storedLanguage) {
    return storedLanguage;
  }

  const browserLanguages = Array.isArray(window.navigator.languages)
    ? window.navigator.languages
    : [window.navigator.language];

  for (const candidate of browserLanguages) {
    const detected = normalizeLanguage(candidate);
    if (detected) {
      return detected;
    }
  }

  return DEFAULT_LANGUAGE;
}

const initialLanguage = resolveInitialLanguage();

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
  if (
    error instanceof Error &&
    error.message.trim() &&
    ![
      'API response was not valid JSON',
      'API response was not ok',
      'Failed to fetch',
    ].includes(error.message.trim())
  ) {
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
  loadingProgress,
  loadingStage,
  showScrollTop,
  authEnabled,
  authUser,
  onOpenAuth,
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
        <Navbar
          language={language}
          setLanguage={setLanguage}
          t={t}
          onNavigate={onNavigate}
          authEnabled={authEnabled}
          authUser={authUser}
          onOpenAuth={onOpenAuth}
        />
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
                loadingProgress={loadingProgress}
                loadingStage={loadingStage}
                error={error}
                notice={notice}
                onChange={onChange}
                onSubmit={onSubmit}
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
            onRetry={onRetry}
            onUnlock={onUnlock}
            onScrollToLocked={onScrollToLocked}
          />

          <SubscriptionSection t={t} />

          <Suspense fallback={null}>
            <FaqSection t={t} />
            <div ref={guideSectionRef}>
              <EditorialSection t={t} />
            </div>
            <PolicySection t={t} onNavigate={onNavigate} />
            <PartnershipSection t={t} />
            <CommentsSection t={t} />
          </Suspense>
        </main>
        <Footer t={t} onNavigate={onNavigate} />
        <ScrollTopButton t={t} visible={showScrollTop} />
      </div>
    </div>
  );
}

function App() {
  const [language, setLanguage] = useState(initialLanguage);
  const [pathname, setPathname] = useState(getCurrentPath);
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [result, setResult] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState('');
  const [authUser, setAuthUser] = useState(null);
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const formSectionRef = useRef(null);
  const guideSectionRef = useRef(null);
  const resultsSectionRef = useRef(null);
  const lockedReportRef = useRef(null);

  const t = useCallback((key, values) => translate(key, language, values), [language]);

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
  }, [language, pathname, t]);

  useEffect(() => {
    const handlePopState = () => setPathname(getCurrentPath());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 720);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isLocalPreview()) {
      clearAnalysisCache();
    }
  }, []);

  useEffect(() => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      setAuthReady(true);
      return undefined;
    }

    let isMounted = true;

    supabase.auth
      .getSession()
      .then(({ data, error: sessionError }) => {
        if (!isMounted) {
          return;
        }

        if (sessionError) {
          console.error(sessionError);
        }

        setAuthUser(data.session?.user ?? null);
        setAuthReady(true);
      })
      .catch((sessionError) => {
        if (!isMounted) {
          return;
        }

        console.error(sessionError);
        setAuthReady(true);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setFormData((current) => ({ ...current, language }));
  }, [language]);

  useEffect(() => {
    if (result && hasSubmitted) {
      resultsSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [result, hasSubmitted]);

  useEffect(() => {
    if (!loading) {
      setLoadingProgress(0);
      setLoadingStage(0);
      return;
    }

    let frameId = 0;
    let timeoutId = 0;
    let current = 0;
    const stageThresholds = [14, 33, 56, 78, 100];

    const tick = () => {
      current = Math.min(current + Math.max(1, (100 - current) * 0.08), 92);
      const rounded = Math.round(current);
      setLoadingProgress(rounded);

      const nextStage = stageThresholds.findIndex((threshold) => rounded <= threshold);
      setLoadingStage(nextStage === -1 ? stageThresholds.length - 1 : nextStage);

      timeoutId = window.setTimeout(() => {
        frameId = window.requestAnimationFrame(tick);
      }, 180);
    };

    tick();

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, [loading]);

  const handleFormChange = (name, value) => {
    if (name === 'language') {
      setLanguage(value);
      return;
    }

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
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

  const handleOpenAuth = () => {
    setAuthDialogOpen(true);
  };

  const handleCloseAuth = () => {
    setAuthDialogOpen(false);
  };

  const requireSupabase = () => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      throw new Error(t('auth.configMissing'));
    }

    return supabase;
  };

  const handleSignUp = async (email, password) => {
    const supabase = requireSupabase();
    const redirectTo =
      typeof window === 'undefined' ? undefined : `${window.location.origin}/`;

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (signUpError) {
      throw signUpError;
    }

    if (data.session?.user) {
      return t('auth.signupSuccess');
    }

    return t('auth.checkEmail');
  };

  const handleSignIn = async (email, password) => {
    const supabase = requireSupabase();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      throw signInError;
    }

    return t('auth.signinSuccess');
  };

  const handleSignOut = async () => {
    const supabase = requireSupabase();
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      throw signOutError;
    }

    return t('auth.signoutSuccess');
  };

  const handleSignInWithGoogle = async () => {
    const supabase = requireSupabase();
    const redirectTo =
      typeof window === 'undefined' ? undefined : `${window.location.origin}/`;

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });

    if (oauthError) {
      throw oauthError;
    }

    return t('auth.googleRedirecting');
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
    const requestPayload = {
      ...payload,
      language,
    };

    const validation = validateForm(payload, t);
    if (!validation.isValid) {
      setError(validation.errors[0]);
      return;
    }

    const cachedResult = getCachedAnalysis(requestPayload);
    if (cachedResult) {
      setSubmittedName(payload.name || t('common.guest'));
      setResult(cachedResult);
      setNotice(t('cachedResultNotice'));
      return;
    }

    setLoading(true);
    setLoadingProgress(6);
    setLoadingStage(0);

    try {
      let nextResult;

      try {
        const response = await fetch('/api/analyze-free', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestPayload),
        });

        const rawBody = await response.text();
        let body;

        try {
          body = rawBody ? JSON.parse(rawBody) : null;
        } catch {
          throw new Error('API response was not valid JSON');
        }

        if (!response.ok || !body?.ok) {
          throw new Error(body?.error?.message || 'API response was not ok');
        }

        nextResult = body.data;
      } catch (fetchError) {
        if (isLocalPreview()) {
          nextResult = await mockAnalyze(payload);
          if (nextResult?.input) {
            nextResult.input.language = language;
          }
          setNotice(t('fallbackNotice'));
        } else {
          throw fetchError;
        }
      }

      setLoadingProgress(100);
      setLoadingStage(4);
      await new Promise((resolve) => window.setTimeout(resolve, 220));
      setSubmittedName(payload.name || t('common.guest'));
      setResult(nextResult);
      setCachedAnalysis(requestPayload, nextResult);
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
            authEnabled={isSupabaseConfigured}
            authUser={authUser}
            onOpenAuth={handleOpenAuth}
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
          <ScrollTopButton t={t} visible={showScrollTop} />
          <AuthDialog
            t={t}
            isOpen={authDialogOpen}
            authReady={authReady}
            authEnabled={isSupabaseConfigured}
            user={authUser}
            onClose={handleCloseAuth}
            onSignIn={handleSignIn}
            onSignInWithGoogle={handleSignInWithGoogle}
            onSignUp={handleSignUp}
            onSignOut={handleSignOut}
          />
        </div>
      </div>
    );
  }

  return (
    <>
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
        loadingProgress={loadingProgress}
        loadingStage={loadingStage}
        showScrollTop={showScrollTop}
        authEnabled={isSupabaseConfigured}
        authUser={authUser}
        onOpenAuth={handleOpenAuth}
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
      <AuthDialog
        t={t}
        isOpen={authDialogOpen}
        authReady={authReady}
        authEnabled={isSupabaseConfigured}
        user={authUser}
        onClose={handleCloseAuth}
        onSignIn={handleSignIn}
        onSignInWithGoogle={handleSignInWithGoogle}
        onSignUp={handleSignUp}
        onSignOut={handleSignOut}
      />
    </>
  );
}

export default App;
