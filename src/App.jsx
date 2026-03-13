import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import Navbar from './components/Navbar.jsx';
import HeroSection from './components/HeroSection.jsx';
import DestinyForm from './components/DestinyForm.jsx';
import ServiceFlowCard from './components/ServiceFlowCard.jsx';
import ResultSection from './components/ResultSection.jsx';
import QuickAnswersSection from './components/QuickAnswersSection.jsx';
import Footer from './components/Footer.jsx';
import ScrollTopButton from './components/ScrollTopButton.jsx';
import SubscriptionSection from './components/SubscriptionSection.jsx';
import MyPagePage from './components/MyPagePage.jsx';
import { DEFAULT_LANGUAGE, translate } from './i18n/translations.js';
import { getSupabaseClient, isSupabaseConfigured } from './lib/supabaseClient.js';
import { mockAnalyze } from './utils/mockAnalyze.js';
import { setCachedAnalysis } from './utils/analysisCache.js';
import { validateForm } from './utils/validateForm.js';

const EditorialSection = lazy(() => import('./components/EditorialSection.jsx'));
const PartnershipSection = lazy(() => import('./components/PartnershipSection.jsx'));
const CommentsSection = lazy(() => import('./components/CommentsSection.jsx'));
const FaqSection = lazy(() => import('./components/FaqSection.jsx'));
const PolicySection = lazy(() => import('./components/PolicySection.jsx'));
const StaticPage = lazy(() => import('./components/StaticPage.jsx'));

const STATIC_PAGE_CONFIG = {
  '/about': {
    titleKey: 'about.title',
    descriptionKey: 'about.desc',
    cta: { href: '/#start', labelKey: 'about.cta' },
    sections: ['section1', 'section2', 'section3'],
  },
  '/privacy': {
    titleKey: 'privacy.title',
    descriptionKey: 'privacy.desc',
    cta: { href: '/contact', labelKey: 'privacy.cta' },
    sections: ['section1', 'section2', 'section3'],
  },
  '/terms': {
    titleKey: 'terms.title',
    descriptionKey: 'terms.desc',
    sections: ['section1', 'section2', 'section3'],
  },
  '/refund': {
    titleKey: 'refund.title',
    descriptionKey: 'refund.desc',
    sections: ['section1', 'section2', 'section3'],
  },
  '/contact': {
    titleKey: 'contact.title',
    descriptionKey: 'contact.desc',
    cta: { href: '/#partnership', labelKey: 'contact.cta' },
    sections: ['section1', 'section2', 'section3'],
  },
};

function getCurrentRoute() {
  return `${window.location.pathname}${window.location.hash}` || '/';
}

function getPathname(route) {
  return route.split('#')[0] || '/';
}

function App() {
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [route, setRoute] = useState(getCurrentRoute);
  const [formData, setFormData] = useState({ name: '', birthdate: '', birthtime: '', gender: '', language: DEFAULT_LANGUAGE, consent: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [result, setResult] = useState(null);
  const [submittedName, setSubmittedName] = useState('');
  const [authUser, setAuthUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const formSectionRef = useRef(null);
  const resultsSectionRef = useRef(null);
  const lockedReportRef = useRef(null);
  const guideSectionRef = useRef(null);

  const t = (key, values) => translate(key, language, values);
  const pathname = getPathname(route);

  const handleNavigate = (href) => {
    const nextUrl = new URL(href, window.location.origin);
    const nextRoute = `${nextUrl.pathname}${nextUrl.hash}` || '/';
    window.history.pushState({}, '', nextRoute);
    setRoute(nextRoute);
  };

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) { setAuthReady(true); return; }
    
    supabase.auth.getSession().then(({ data }) => {
      setAuthUser(data.session?.user ?? null);
      setAuthReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user ?? null;
      setAuthUser(user);
      if (event === 'SIGNED_IN') handleNavigate('/mypage');
      if (event === 'SIGNED_OUT') handleNavigate('/');
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handlePopState = () => setRoute(getCurrentRoute());
    window.addEventListener('popstate', handlePopState);

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (pathname !== '/') {
      window.scrollTo(0, 0);
      return;
    }

    const hash = route.includes('#') ? route.slice(route.indexOf('#')) : '';
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    window.requestAnimationFrame(() => {
      document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
    });
  }, [pathname, route]);

  const createAuthError = (message) => {
    const error = new Error(message);
    error.displayMessage = message;
    return error;
  };

  const requireSupabase = () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw createAuthError(t('auth.configMissing'));
    }

    return supabase;
  };

  const mapAuthErrorMessage = (err) => {
    const source = `${err?.message || ''} ${err?.code || ''}`.toLowerCase();
    if (source.includes('email rate limit')) return t('auth.errorEmailRateLimit');
    if (source.includes('email not confirmed')) return t('auth.errorEmailNotConfirmed');
    if (source.includes('invalid login credentials')) return t('auth.errorInvalidCredentials');
    if (source.includes('weak password')) return t('auth.errorWeakPassword');
    if (source.includes('already registered') || source.includes('user already registered')) return t('auth.errorAlreadyRegistered');
    if (source.includes('invalid email')) return t('auth.errorInvalidEmail');
    return err?.displayMessage || err?.message || t('auth.genericError');
  };

  const buildStaticPageProps = (currentPathname) => {
    const config = STATIC_PAGE_CONFIG[currentPathname];
    if (!config) {
      return null;
    }

    return {
      title: t(config.titleKey),
      description: t(config.descriptionKey),
      cta: config.cta ? { href: config.cta.href, label: t(config.cta.labelKey) } : null,
      sections: config.sections.map((sectionKey) => ({
        title: t(`${config.titleKey.split('.')[0]}.${sectionKey}Title`),
        body: [
          t(`${config.titleKey.split('.')[0]}.${sectionKey}Body1`),
          t(`${config.titleKey.split('.')[0]}.${sectionKey}Body2`),
        ],
      })),
    };
  };

  const handleFormChange = (name, value) => {
    if (name === 'language') {
      setLanguage(value);
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    const validation = validateForm(formData, t);
    if (!validation.isValid) { setError(validation.errors[0]); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/analyze-free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, language })
      });
      const body = await res.json();
      if (res.ok && body.ok) {
        setResult(body.data);
        setSubmittedName(formData.name);
        setCachedAnalysis({ ...formData, language }, body.data);
      } else {
        throw new Error('API FAIL');
      }
    } catch {
      // FORCE MOCK ON ANY ERROR
      const res = await mockAnalyze(formData);
      setResult(res);
      setSubmittedName(formData.name);
      setCachedAnalysis(formData, res);
      setNotice(t('fallbackNotice'));
    } finally {
      setLoading(false);
      resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDeleteAccount = async () => {
    const supabase = requireSupabase();
    const { data, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !data.session?.access_token) {
      throw createAuthError(t('mypage.deleteNeedsSession'));
    }

    const response = await fetch('/api/account-delete', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${data.session.access_token}`,
      },
    });

    const body = await response.json().catch(() => null);
    if (!response.ok || !body?.ok) {
      const message =
        body?.message ||
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
          ? t('mypage.deleteLocalDevHint')
          : t('mypage.deleteFailed'));
      throw createAuthError(message);
    }

    await supabase.auth.signOut();
    setNotice(t('mypage.deleteSuccess'));
    handleNavigate('/');
  };

  const staticPageProps = buildStaticPageProps(pathname);

  if (pathname === '/mypage') {
    return (
      <div className="page-shell">
        <div className="container">
          <Navbar language={language} setLanguage={setLanguage} t={t} isSubpage onNavigate={handleNavigate} authUser={authUser} />
          <main>
            <MyPagePage
              t={t} language={language} authEnabled={isSupabaseConfigured} authReady={authReady} user={authUser}
              onSignIn={async (email, password) => {
                try {
                  const supabase = requireSupabase();
                  const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
                  if (authError) throw authError;
                  return t('auth.signinSuccess');
                } catch (err) {
                  throw createAuthError(mapAuthErrorMessage(err));
                }
              }}
              onSignUp={async (email, password) => {
                try {
                  const supabase = requireSupabase();
                  const { data, error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { emailRedirectTo: `${window.location.origin}/mypage` },
                  });
                  if (authError) throw authError;
                  return data.session ? t('auth.signupSuccess') : t('auth.checkEmail');
                } catch (err) {
                  throw createAuthError(mapAuthErrorMessage(err));
                }
              }}
              onSignInWithGoogle={async () => {
                try {
                  const supabase = requireSupabase();
                  const { error: authError } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: { redirectTo: `${window.location.origin}/mypage` },
                  });
                  if (authError) throw authError;
                  return t('auth.googleRedirecting');
                } catch (err) {
                  throw createAuthError(mapAuthErrorMessage(err));
                }
              }}
              onRequestPasswordReset={async (email) => {
                try {
                  const supabase = requireSupabase();
                  const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/mypage`,
                  });
                  if (authError) throw authError;
                  return t('mypage.resetEmailSent');
                } catch (err) {
                  throw createAuthError(mapAuthErrorMessage(err));
                }
              }}
              onUpdateProfile={async (name) => {
                try {
                  const supabase = requireSupabase();
                  const { error: authError } = await supabase.auth.updateUser({ data: { display_name: name } });
                  if (authError) throw authError;
                  return t('mypage.profileSaved');
                } catch (err) {
                  throw createAuthError(mapAuthErrorMessage(err));
                }
              }}
              onChangePassword={async (password) => {
                if (password.length < 6) {
                  throw createAuthError(t('mypage.passwordTooShort'));
                }

                try {
                  const supabase = requireSupabase();
                  const { error: authError } = await supabase.auth.updateUser({ password });
                  if (authError) throw authError;
                  return t('mypage.passwordChanged');
                } catch (err) {
                  throw createAuthError(mapAuthErrorMessage(err));
                }
              }}
              onDeleteAccount={handleDeleteAccount}
              onSignOut={async () => {
                const supabase = getSupabaseClient();
                if (!supabase) return;
                await supabase.auth.signOut();
              }}
            />
          </main>
          <Footer t={t} onNavigate={handleNavigate} />
        </div>
      </div>
    );
  }

  if (staticPageProps) {
    return (
      <div className="page-shell">
        <div className="container">
          <Navbar
            language={language}
            setLanguage={setLanguage}
            t={t}
            isSubpage
            onNavigate={handleNavigate}
            authUser={authUser}
            /* onSignOut handled in MyPage */
          />
          <main>
            <Suspense fallback={null}>
              <StaticPage {...staticPageProps} onNavigate={handleNavigate} />
            </Suspense>
          </main>
          <Footer t={t} onNavigate={handleNavigate} />
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="container">
        <Navbar language={language} setLanguage={setLanguage} t={t} onNavigate={handleNavigate} authUser={authUser} />
        <main>
          <HeroSection t={t} onPrimaryCta={() => formSectionRef.current?.scrollIntoView({ behavior: 'smooth' })} onSecondaryCta={() => guideSectionRef.current?.scrollIntoView({ behavior: 'smooth' })} />
          <QuickAnswersSection t={t} />
          <section className="section" id="start" ref={formSectionRef}>
            <div className="service-grid">
              <DestinyForm t={t} formData={formData} loading={loading} error={error} notice={notice} onChange={handleFormChange} onSubmit={handleFormSubmit} onSecondaryAction={() => resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth' })} />
              <ServiceFlowCard t={t} />
            </div>
          </section>
          <ResultSection t={t} result={result} submittedName={submittedName} sectionRef={resultsSectionRef} lockedRef={lockedReportRef} onRetry={() => formSectionRef.current?.scrollIntoView({ behavior: 'smooth' })} onUnlock={() => handleNavigate('/mypage')} onScrollToLocked={() => lockedReportRef.current?.scrollIntoView({ behavior: 'smooth' })} />
          <SubscriptionSection t={t} />
          <Suspense fallback={null}>
            <FaqSection t={t} />
            <div ref={guideSectionRef}><EditorialSection t={t} /></div>
            <PolicySection t={t} onNavigate={handleNavigate} />
            <PartnershipSection t={t} />
            <CommentsSection t={t} />
          </Suspense>
        </main>
        <Footer t={t} onNavigate={handleNavigate} />
        <ScrollTopButton t={t} visible={true} />
      </div>
    </div>
  );
}

export default App;
