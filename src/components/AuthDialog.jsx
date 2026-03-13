import { useEffect, useState } from 'react';

const initialFields = {
  email: '',
  password: '',
};

function mapAuthErrorMessage(error, t) {
  const message =
    error instanceof Error && error.message ? error.message.toLowerCase().trim() : '';

  if (!message) {
    return t('auth.genericError');
  }

  if (message.includes('email rate limit exceeded')) {
    return t('auth.errorEmailRateLimit');
  }

  if (message.includes('email not confirmed')) {
    return t('auth.errorEmailNotConfirmed');
  }

  if (message.includes('invalid login credentials')) {
    return t('auth.errorInvalidCredentials');
  }

  if (message.includes('password should be at least')) {
    return t('auth.errorWeakPassword');
  }

  if (message.includes('user already registered')) {
    return t('auth.errorAlreadyRegistered');
  }

  if (message.includes('invalid email')) {
    return t('auth.errorInvalidEmail');
  }

  return error.message;
}

function AuthDialog({
  t,
  isOpen,
  authReady,
  authEnabled,
  user,
  onClose,
  onSignIn,
  onSignInWithGoogle,
  onSignUp,
  onSignOut,
}) {
  const [mode, setMode] = useState('signin');
  const [fields, setFields] = useState(initialFields);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setMode('signin');
      setFields(initialFields);
      setPending(false);
      setError('');
      setNotice('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

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

  const handleSignOut = async () => {
    setPending(true);
    setError('');
    setNotice('');

    try {
      const message = await onSignOut();
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
      if (message) {
        setNotice(message);
      }
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
              {user ? t('auth.accountTitle') : t('auth.modalTitle')}
            </h2>
            <p className="section-subtitle">
              {user ? t('auth.accountSubtitle') : t('auth.modalSubtitle')}
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
        ) : user ? (
          <div className="auth-session-card">
            <div className="auth-user-line">
              <span>{t('auth.loggedInAs')}</span>
              <strong>{user.email}</strong>
            </div>
            {notice ? <div className="auth-notice">{notice}</div> : null}
            {error ? <div className="error-box is-visible">{error}</div> : null}
            <button className="btn btn-secondary" type="button" onClick={handleSignOut} disabled={pending}>
              {pending ? t('auth.pending') : t('auth.logout')}
            </button>
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
                {pending ? t('auth.pending') : t('auth.googleLogin')}
              </button>
              <p className="auth-social-note">{t('auth.googleHint')}</p>
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
                onClick={() => setMode('signin')}
              >
                {t('auth.loginTab')}
              </button>
              <button
                className={`auth-mode-button${mode === 'signup' ? ' is-active' : ''}`}
                type="button"
                role="tab"
                aria-selected={mode === 'signup'}
                onClick={() => setMode('signup')}
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
            </form>
          </>
        )}
      </section>
    </div>
  );
}

export default AuthDialog;
