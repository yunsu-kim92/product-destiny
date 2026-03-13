import { useEffect, useState } from 'react';

const initialFields = {
  email: '',
  password: '',
};

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" style={{ marginRight: '8px', flexShrink: 0 }}>
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.0 24.0 0 0 0 0 21.56l7.98-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

function mapAuthErrorMessage(error, t) {
  const message =
    error instanceof Error && error.message ? error.message.toLowerCase().trim() : '';

  if (!message) return t('auth.genericError');
  if (message.includes('email rate limit exceeded')) return t('auth.errorEmailRateLimit');
  if (message.includes('email not confirmed')) return t('auth.errorEmailNotConfirmed');
  if (message.includes('invalid login credentials')) return t('auth.errorInvalidCredentials');
  if (message.includes('password should be at least')) return t('auth.errorWeakPassword');
  if (message.includes('user already registered')) return t('auth.errorAlreadyRegistered');
  if (message.includes('invalid email')) return t('auth.errorInvalidEmail');
  return error.message;
}

function AuthDialog({
  t,
  isOpen,
  authReady,
  authEnabled,
  onClose,
  onSignIn,
  onSignInWithGoogle,
  onSignUp,
  onRequestPasswordReset,
}) {
  const [mode, setMode] = useState('signin');
  const [fields, setFields] = useState(initialFields);
  const [resetEmail, setResetEmail] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setMode('signin');
      setFields(initialFields);
      setResetEmail('');
      setPending(false);
      setError('');
      setNotice('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setPending(true);
    setError('');
    setNotice('');
    try {
      const action = mode === 'signin' ? onSignIn : onSignUp;
      const message = await action(fields.email, fields.password);
      setNotice(message);
      if (mode === 'signin') {
        setFields(initialFields);
        onClose();
      }
    } catch (submissionError) {
      setError(mapAuthErrorMessage(submissionError, t));
    } finally {
      setPending(false);
    }
  };

  const handleResetSubmit = async (event) => {
    event.preventDefault();
    setPending(true);
    setError('');
    setNotice('');
    try {
      const message = await onRequestPasswordReset(resetEmail);
      setNotice(message);
    } catch (submissionError) {
      setError(mapAuthErrorMessage(submissionError, t));
    } finally {
      setPending(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setPending(true);
    setError('');
    setNotice('');
    try {
      const message = await onSignInWithGoogle();
      if (message) setNotice(message);
    } catch (submissionError) {
      setError(mapAuthErrorMessage(submissionError, t));
      setPending(false);
    }
  };

  return (
    <div className="auth-modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="auth-modal panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="auth-modal-head">
          <div>
            <span className="section-kicker">{t('auth.kicker')}</span>
            <h2 className="section-title" id="auth-dialog-title">
              {mode === 'forgot' ? t('mypage.forgotTitle') : t('auth.modalTitle')}
            </h2>
            <p className="section-subtitle">
              {mode === 'forgot' ? t('mypage.forgotDesc') : t('auth.modalSubtitle')}
            </p>
          </div>
          <button className="auth-close" type="button" onClick={onClose} aria-label={t('auth.close')}>
            x
          </button>
        </div>

        {!authEnabled ? (
          <div className="auth-message-block">
            <strong>{t('auth.configMissing')}</strong>
            <p>{t('auth.configHint')}</p>
          </div>
        ) : !authReady ? (
          <div className="auth-message-block">
            <strong>{t('auth.loading')}</strong>
          </div>
        ) : mode === 'forgot' ? (
          <div className="auth-forgot-section">
            <form className="auth-form" onSubmit={handleResetSubmit}>
              <label className="field-group">
                <span className="field-label">{t('auth.email')}</span>
                <input
                  className="field-input"
                  type="email"
                  autoComplete="email"
                  placeholder={t('auth.emailPlaceholder')}
                  value={resetEmail}
                  onChange={(event) => setResetEmail(event.target.value)}
                  required
                />
              </label>

              {notice ? <div className="auth-notice">{notice}</div> : null}
              {error ? <div className="error-box is-visible">{error}</div> : null}

              <button className="btn btn-primary" type="submit" disabled={pending}>
                {pending ? t('auth.pending') : t('mypage.sendReset')}
              </button>

              <button
                className="btn-text auth-back-link"
                type="button"
                onClick={() => setMode('signin')}
              >
                ← {t('auth.loginTab')}
              </button>
            </form>
          </div>
        ) : (
          <>
            <div className="auth-social-stack">
              <button
                className="auth-google-button"
                type="button"
                onClick={handleGoogleSignIn}
                disabled={pending}
              >
                <GoogleIcon />
                {pending ? t('auth.pending') : t('auth.googleLogin')}
              </button>
            </div>

            <div className="auth-divider" aria-hidden="true">
              <span>{t('auth.orDivider')}</span>
            </div>

            <div className="auth-mode-switch" role="tablist" aria-label={t('auth.modeLabel')}>
              <button
                className={`auth-mode-button${mode === 'signin' ? ' is-active' : ''}`}
                type="button"
                role="tab"
                aria-selected={mode === 'signin'}
                onClick={() => { setMode('signin'); setError(''); setNotice(''); }}
              >
                {t('auth.loginTab')}
              </button>
              <button
                className={`auth-mode-button${mode === 'signup' ? ' is-active' : ''}`}
                type="button"
                role="tab"
                aria-selected={mode === 'signup'}
                onClick={() => { setMode('signup'); setError(''); setNotice(''); }}
              >
                {t('auth.signupTab')}
              </button>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="field-group">
                <span className="field-label">{t('auth.email')}</span>
                <input
                  className="field-input"
                  type="email"
                  autoComplete="email"
                  placeholder={t('auth.emailPlaceholder')}
                  value={fields.email}
                  onChange={(event) =>
                    setFields((current) => ({ ...current, email: event.target.value }))
                  }
                  required
                />
              </label>

              <label className="field-group">
                <span className="field-label">{t('auth.password')}</span>
                <input
                  className="field-input"
                  type="password"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  placeholder={t('auth.passwordPlaceholder')}
                  value={fields.password}
                  onChange={(event) =>
                    setFields((current) => ({ ...current, password: event.target.value }))
                  }
                  minLength={6}
                  required
                />
                <span className="field-note auth-helper-text">{t('auth.passwordHint')}</span>
              </label>

              {notice ? <div className="auth-notice">{notice}</div> : null}
              {error ? <div className="error-box is-visible">{error}</div> : null}

              <button className="btn btn-primary" type="submit" disabled={pending}>
                {pending ? t('auth.pending') : mode === 'signin' ? t('auth.login') : t('auth.signup')}
              </button>

              {mode === 'signin' && (
                <button
                  className="btn-text auth-forgot-link"
                  type="button"
                  onClick={() => { setMode('forgot'); setError(''); setNotice(''); }}
                >
                  {t('mypage.forgotTitle')}
                </button>
              )}
            </form>
          </>
        )}
      </section>
    </div>
  );
}

export default AuthDialog;
