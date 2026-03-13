import { useMemo, useState } from 'react';

const DELETE_CONFIRM_TEXT = 'DELETE';

function formatTimestamp(value, locale) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function getProviderLabel(user) {
  const provider =
    user?.app_metadata?.provider || user?.identities?.[0]?.provider || 'email';

  if (provider === 'google') {
    return 'Google';
  }

  if (provider === 'email') {
    return 'Email';
  }

  return provider;
}

function MyPageDialog({
  t,
  language,
  isOpen,
  user,
  onClose,
  onChangePassword,
  onDeleteAccount,
}) {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [pendingAction, setPendingAction] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const profileRows = useMemo(
    () => [
      { label: t('mypage.email'), value: user?.email || '-' },
      { label: t('mypage.provider'), value: getProviderLabel(user) },
      {
        label: t('mypage.emailStatus'),
        value: user?.email_confirmed_at ? t('mypage.emailVerified') : t('mypage.emailUnverified'),
      },
      {
        label: t('mypage.createdAt'),
        value: formatTimestamp(user?.created_at, language),
      },
      {
        label: t('mypage.lastSignIn'),
        value: formatTimestamp(user?.last_sign_in_at, language),
      },
    ],
    [language, t, user],
  );

  if (!isOpen || !user) {
    return null;
  }

  const resetFeedback = () => {
    setError('');
    setNotice('');
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    resetFeedback();

    if (password.length < 6) {
      setError(t('mypage.passwordTooShort'));
      return;
    }

    if (password !== passwordConfirm) {
      setError(t('mypage.passwordMismatch'));
      return;
    }

    setPendingAction('password');

    try {
      const message = await onChangePassword(password);
      setNotice(message);
      setPassword('');
      setPasswordConfirm('');
    } catch (submissionError) {
      setError(
        submissionError instanceof Error && submissionError.message
          ? submissionError.message
          : t('mypage.genericError'),
      );
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
      const message = await onDeleteAccount();
      setNotice(message);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error && submissionError.message
          ? submissionError.message
          : t('mypage.genericError'),
      );
    } finally {
      setPendingAction('');
    }
  };

  return (
    <div className="auth-modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="auth-modal panel mypage-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mypage-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="auth-modal-head">
          <div>
            <span className="section-kicker">{t('mypage.kicker')}</span>
            <h2 className="section-title" id="mypage-dialog-title">
              {t('mypage.title')}
            </h2>
            <p className="section-subtitle">{t('mypage.subtitle')}</p>
          </div>
          <button className="auth-close" type="button" onClick={onClose} aria-label={t('auth.close')}>
            x
          </button>
        </div>

        {notice ? <div className="auth-notice">{notice}</div> : null}
        {error ? <div className="error-box is-visible">{error}</div> : null}

        <section className="mypage-section">
          <div className="mypage-section-head">
            <h3>{t('mypage.infoTitle')}</h3>
            <p>{t('mypage.infoDesc')}</p>
          </div>
          <div className="mypage-info-grid">
            {profileRows.map((row) => (
              <div className="mypage-info-card" key={row.label}>
                <span>{row.label}</span>
                <strong>{row.value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="mypage-section">
          <div className="mypage-section-head">
            <h3>{t('mypage.passwordTitle')}</h3>
            <p>{t('mypage.passwordDesc')}</p>
          </div>
          <form className="auth-form" onSubmit={handlePasswordSubmit}>
            <label className="field-group">
              <span className="field-label">{t('mypage.newPassword')}</span>
              <input
                className="field-input"
                type="password"
                autoComplete="new-password"
                placeholder={t('auth.passwordPlaceholder')}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                required
              />
              <span className="field-note auth-helper-text">{t('auth.passwordHint')}</span>
            </label>

            <label className="field-group">
              <span className="field-label">{t('mypage.confirmPassword')}</span>
              <input
                className="field-input"
                type="password"
                autoComplete="new-password"
                placeholder={t('mypage.confirmPasswordPlaceholder')}
                value={passwordConfirm}
                onChange={(event) => setPasswordConfirm(event.target.value)}
                minLength={6}
                required
              />
            </label>

            <button className="btn btn-primary" type="submit" disabled={pendingAction === 'password'}>
              {pendingAction === 'password' ? t('auth.pending') : t('mypage.changePassword')}
            </button>
          </form>
        </section>

        <section className="mypage-section mypage-section-danger">
          <div className="mypage-section-head">
            <h3>{t('mypage.deleteTitle')}</h3>
            <p>{t('mypage.deleteDesc')}</p>
          </div>
          <form className="auth-form" onSubmit={handleDeleteSubmit}>
            <label className="field-group">
              <span className="field-label">{t('mypage.deleteConfirmLabel')}</span>
              <input
                className="field-input"
                type="text"
                placeholder={DELETE_CONFIRM_TEXT}
                value={deleteConfirm}
                onChange={(event) => setDeleteConfirm(event.target.value)}
                required
              />
              <span className="field-note auth-helper-text">
                {t('mypage.deleteConfirmHint', { keyword: DELETE_CONFIRM_TEXT })}
              </span>
            </label>

            <button className="btn btn-danger" type="submit" disabled={pendingAction === 'delete'}>
              {pendingAction === 'delete' ? t('auth.pending') : t('mypage.deleteAccount')}
            </button>
          </form>
        </section>
      </section>
    </div>
  );
}

export default MyPageDialog;
