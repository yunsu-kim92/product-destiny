import { useEffect, useMemo, useState, useCallback } from 'react';
import { getRecentCachedAnalyses } from '../utils/analysisCache.js';

const DELETE_CONFIRM_TEXT = 'DELETE';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" style={{ marginRight: '10px', flexShrink: 0 }}>
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.0 24.0 0 0 0 0 21.56l7.98-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

function formatTimestamp(value, locale) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function MyPagePage({
  t,
  language,
  authEnabled,
  authReady,
  user,
  onSignIn,
  onSignUp,
  onSignInWithGoogle,
  onRequestPasswordReset,
  onUpdateProfile,
  onChangePassword,
  onDeleteAccount,
  onSignOut,
}) {
  const [authMode, setAuthMode] = useState('signin');
  const [authFields, setAuthFields] = useState({ email: '', password: '' });
  const [resetEmail, setResetEmail] = useState('');
  const [profileName, setProfileName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [pendingAction, setPendingAction] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [activeSection, setActiveSection] = useState('results');
  const [expandedResult, setExpandedResult] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileName(user?.user_metadata?.display_name || '');
    }
  }, [user]);

  const cachedResults = useMemo(() => getRecentCachedAnalyses(), []);

  const resetFeedback = () => {
    setError('');
    setNotice('');
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    resetFeedback();
    setPendingAction('auth');
    try {
      const action = authMode === 'signin' ? onSignIn : onSignUp;
      const message = await action(authFields.email, authFields.password);
      setNotice(message);
      if (authMode === 'signin') setAuthFields({ email: '', password: '' });
    } catch (err) {
      setError(err.message || t('auth.genericError'));
    } finally {
      setPendingAction('');
    }
  };

  const handleGoogleSignIn = async () => {
    resetFeedback();
    setPendingAction('google');
    try {
      const message = await onSignInWithGoogle();
      setNotice(message);
    } catch (err) {
      setError(err.message || t('auth.genericError'));
    } finally {
      setPendingAction('');
    }
  };

  const handleResetSubmit = async (event) => {
    event.preventDefault();
    resetFeedback();
    setPendingAction('reset');
    try {
      const message = await onRequestPasswordReset(resetEmail);
      setNotice(message);
      setResetEmail('');
      setAuthMode('signin');
    } catch (err) {
      setError(err.message || t('auth.genericError'));
    } finally {
      setPendingAction('');
    }
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    resetFeedback();
    setPendingAction('profile');
    try {
      const message = await onUpdateProfile(profileName);
      setNotice(message);
    } catch (err) {
      setError(err.message);
    } finally {
      setPendingAction('');
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    resetFeedback();
    if (newPassword !== newPasswordConfirm) {
      setError(t('mypage.passwordMismatch'));
      return;
    }
    setPendingAction('password');
    try {
      const message = await onChangePassword(newPassword);
      setNotice(message);
      setNewPassword('');
      setNewPasswordConfirm('');
    } catch (err) {
      setError(err.message);
    } finally {
      setPendingAction('');
    }
  };

  const handleDeleteSubmit = async (event) => {
    event.preventDefault();
    resetFeedback();
    if (deleteConfirm !== DELETE_CONFIRM_TEXT) {
      setError(t('mypage.deleteConfirmError'));
      return;
    }
    setPendingAction('delete');
    try {
      await onDeleteAccount();
    } catch (err) {
      setError(err.message);
    } finally {
      setPendingAction('');
    }
  };

  if (!authReady) {
    return <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>{t('auth.loading')}</div>;
  }

  // ── Not logged in: login/signup view ──
  if (!user) {
    return (
      <div className="static-page mypage-auth-view">
        <div className="static-hero panel">
          <span className="section-kicker">{t('auth.kicker')}</span>
          <h1 className="static-title">{t('auth.modalTitle')}</h1>
          <p className="static-description">{t('auth.modalSubtitle')}</p>
        </div>

        <div className="auth-grid" style={{ maxWidth: '480px', margin: '0 auto' }}>
          <article className="panel static-section">
            {!authEnabled && (
              <>
                <div className="error-box is-visible">{t('auth.configMissing')}</div>
                <p style={{ color: 'var(--muted)', lineHeight: '1.7' }}>{t('auth.configHint')}</p>
              </>
            )}

            <button
              className="auth-google-button"
              onClick={handleGoogleSignIn}
              disabled={!authEnabled || pendingAction === 'google'}
            >
              <GoogleIcon />
              {pendingAction === 'google' ? t('auth.pending') : t('auth.googleLogin')}
            </button>

            <div className="auth-divider"><span>{t('auth.orDivider')}</span></div>

            {authMode === 'forgot' ? (
              <>
                <p style={{ color: 'var(--muted)', lineHeight: '1.7', marginBottom: '16px' }}>{t('mypage.forgotDesc')}</p>
                <form className="auth-form" onSubmit={handleResetSubmit}>
                  <div className="field-group">
                    <label className="field-label">{t('auth.email')}</label>
                    <input className="field-input" type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required />
                  </div>

                  {error && <div className="error-box is-visible">{error}</div>}
                  {notice && <div className="auth-notice">{notice}</div>}

                  <button className="btn btn-primary" type="submit" disabled={!authEnabled || !!pendingAction}>
                    {pendingAction === 'reset' ? t('auth.pending') : t('mypage.sendReset')}
                  </button>
                  <button type="button" className="btn-text auth-back-link" onClick={() => { setAuthMode('signin'); resetFeedback(); }}>
                    ← {t('auth.loginTab')}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="auth-mode-switch">
                  <button type="button" className={`auth-mode-button ${authMode === 'signin' ? 'is-active' : ''}`} onClick={() => { setAuthMode('signin'); resetFeedback(); }}>{t('auth.loginTab')}</button>
                  <button type="button" className={`auth-mode-button ${authMode === 'signup' ? 'is-active' : ''}`} onClick={() => { setAuthMode('signup'); resetFeedback(); }}>{t('auth.signupTab')}</button>
                </div>

                <form className="auth-form" onSubmit={handleAuthSubmit}>
                  <div className="field-group">
                    <label className="field-label">{t('auth.email')}</label>
                    <input className="field-input" type="email" value={authFields.email} onChange={e => setAuthFields({...authFields, email: e.target.value})} required />
                  </div>
                  <div className="field-group">
                    <label className="field-label">{t('auth.password')}</label>
                    <input className="field-input" type="password" value={authFields.password} onChange={e => setAuthFields({...authFields, password: e.target.value})} minLength={6} required />
                    <span className="field-note auth-helper-text">{t('auth.passwordHint')}</span>
                  </div>

                  {error && <div className="error-box is-visible">{error}</div>}
                  {notice && <div className="auth-notice">{notice}</div>}

                  <button className="btn btn-primary" type="submit" disabled={!authEnabled || !!pendingAction}>
                    {pendingAction === 'auth' ? t('auth.pending') : (authMode === 'signin' ? t('auth.login') : t('auth.signup'))}
                  </button>

                  {authMode === 'signin' && (
                    <button type="button" className="btn-text auth-forgot-link" onClick={() => { setAuthMode('forgot'); resetFeedback(); }}>
                      {t('mypage.forgotTitle')}
                    </button>
                  )}
                </form>
              </>
            )}
          </article>
        </div>
      </div>
    );
  }

  // ── Logged in: Dashboard ──
  const menuItems = [
    { key: 'results', label: t('mypage.resultsTitle'), icon: '📋' },
    { key: 'profile', label: t('mypage.profileTitle'), icon: '👤' },
    { key: 'password', label: t('mypage.passwordTitle'), icon: '🔒' },
    { key: 'delete', label: t('mypage.deleteTitle'), icon: '⚠️' },
  ];

  return (
    <div className="static-page mypage-dashboard-view">
      <div className="static-hero panel">
        <span className="section-kicker">{t('mypage.kicker')}</span>
        <h1 className="static-title">{t('mypage.title')}</h1>
        <p className="static-description">{user.user_metadata?.display_name || user.email}</p>
      </div>

      {notice && <div className="auth-notice" style={{ marginBottom: '20px' }}>{notice}</div>}
      {error && <div className="error-box is-visible" style={{ marginBottom: '20px' }}>{error}</div>}

      <div className="mypage-dashboard">
        {/* Sidebar menu */}
        <nav className="mypage-sidebar">
          {menuItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`mypage-menu-item${activeSection === item.key ? ' is-active' : ''}`}
              onClick={() => { setActiveSection(item.key); resetFeedback(); }}
            >
              <span className="mypage-menu-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
          <div className="mypage-menu-divider" />
          <button type="button" className="mypage-menu-item mypage-menu-logout" onClick={onSignOut}>
            {t('auth.logout')}
          </button>
        </nav>

        {/* Content area */}
        <div className="mypage-content">
          {/* ── My Results ── */}
          {activeSection === 'results' && (
            <article className="panel static-section">
              <h2 className="mypage-section-heading">{t('mypage.resultsTitle')}</h2>
              {cachedResults.length > 0 ? (
                <div className="mypage-results-list">
                  {cachedResults.map((res, i) => {
                    const isExpanded = expandedResult === i;
                    const reading = res.data?.reading;
                    const readingBlocks = reading ? [
                      { label: t('reading.sajuReading'), value: reading.sajuReading },
                      { label: t('reading.coreNature'), value: reading.coreNature },
                      { label: t('reading.lifeWorkFlow'), value: reading.lifeWorkFlow },
                      { label: t('reading.relationshipPattern'), value: reading.relationshipPattern },
                      { label: t('reading.guidance'), value: reading.guidance },
                    ].filter(b => b.value) : [];

                    return (
                      <div key={i} className={`mypage-result-item${isExpanded ? ' is-expanded' : ''}`}>
                        <button
                          type="button"
                          className="mypage-result-header"
                          onClick={() => setExpandedResult(isExpanded ? null : i)}
                        >
                          <div className="result-item-info">
                            <strong style={{ color: '#d4b068', fontSize: '1.1rem' }}>{res.input?.name || t('common.guest')}</strong>
                            <span className="result-item-date">{formatTimestamp(res.savedAt, language)}</span>
                          </div>
                          <div className="result-item-summary">
                            <span className="day-master-badge">{res.data?.dayMaster}</span>
                            <p style={{ lineHeight: '1.6' }}>
                              {reading?.coreNature
                                ? (isExpanded ? reading.coreNature : reading.coreNature.slice(0, 80) + (reading.coreNature.length > 80 ? '...' : ''))
                                : ''}
                            </p>
                          </div>
                          <span className="mypage-result-toggle">{isExpanded ? '▲' : '▼'}</span>
                        </button>

                        {isExpanded && readingBlocks.length > 0 && (
                          <div className="mypage-result-detail">
                            {readingBlocks.map((block) => (
                              <div className="mypage-reading-block" key={block.label}>
                                <span className="mypage-reading-label">{block.label}</span>
                                <p className="mypage-reading-value">{block.value}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: 'var(--muted)', padding: '20px 0' }}>{t('mypage.resultsEmpty')}</p>
              )}
            </article>
          )}

          {/* ── Profile Edit ── */}
          {activeSection === 'profile' && (
            <article className="panel static-section">
              <h2 className="mypage-section-heading">{t('mypage.profileTitle')}</h2>
              <div className="mypage-info-grid">
                <div className="mypage-info-card">
                  <span>{t('mypage.email')}</span>
                  <strong>{user.email}</strong>
                </div>
                <div className="mypage-info-card">
                  <span>{t('mypage.createdAt')}</span>
                  <strong>{formatTimestamp(user.created_at, language)}</strong>
                </div>
              </div>
              <form className="auth-form" onSubmit={handleProfileSubmit} style={{ marginTop: '20px' }}>
                <div className="field-group">
                  <label className="field-label">{t('mypage.displayName')}</label>
                  <input className="field-input" type="text" value={profileName} onChange={e => setProfileName(e.target.value)} placeholder={t('mypage.displayNamePlaceholder')} />
                </div>
                <button className="btn btn-primary" type="submit" disabled={pendingAction === 'profile'}>
                  {pendingAction === 'profile' ? t('auth.pending') : t('mypage.saveProfile')}
                </button>
              </form>
            </article>
          )}

          {/* ── Change Password ── */}
          {activeSection === 'password' && (
            <article className="panel static-section">
              <h2 className="mypage-section-heading">{t('mypage.passwordTitle')}</h2>
              <form className="auth-form" onSubmit={handlePasswordSubmit}>
                <div className="field-group">
                  <label className="field-label">{t('mypage.newPassword')}</label>
                  <input className="field-input" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={6} required />
                </div>
                <div className="field-group">
                  <label className="field-label">{t('mypage.confirmPassword')}</label>
                  <input className="field-input" type="password" value={newPasswordConfirm} onChange={e => setNewPasswordConfirm(e.target.value)} minLength={6} required />
                </div>
                <button className="btn btn-primary" type="submit" disabled={pendingAction === 'password'}>
                  {pendingAction === 'password' ? t('auth.pending') : t('mypage.changePassword')}
                </button>
              </form>
            </article>
          )}

          {/* ── Delete Account ── */}
          {activeSection === 'delete' && (
            <article className="panel static-section mypage-danger-zone">
              <h2 className="mypage-section-heading" style={{ color: 'var(--danger)' }}>{t('mypage.deleteTitle')}</h2>
              <p className="danger-text">{t('mypage.deleteDesc')}</p>
              <form className="auth-form" onSubmit={handleDeleteSubmit}>
                <div className="field-group">
                  <label className="field-label">{t('mypage.deleteConfirmLabel', { keyword: DELETE_CONFIRM_TEXT })}</label>
                  <input className="field-input" type="text" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder={DELETE_CONFIRM_TEXT} required />
                </div>
                <button className="btn btn-danger" type="submit" disabled={pendingAction === 'delete'}>
                  {pendingAction === 'delete' ? t('auth.pending') : t('mypage.deleteAccount')}
                </button>
              </form>
            </article>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyPagePage;
