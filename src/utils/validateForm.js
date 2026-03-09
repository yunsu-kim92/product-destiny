export function validateForm(data, t) {
  const errors = [];

  if (!data.name) {
    errors.push(t('validationName'));
  }

  if (!data.birthdate) {
    errors.push(t('validationBirthdate'));
  }

  if (!data.consent) {
    errors.push(t('validationConsent'));
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
