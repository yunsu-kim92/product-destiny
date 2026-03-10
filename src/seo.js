export const SITE_URL = 'https://agentra.cc';
export const ALT_SITE_URL = 'https://product-destiny.pages.dev';

export function buildPageUrl(pathname = '/') {
  const normalizedPath = pathname === '/' ? '' : pathname;
  return `${SITE_URL}${normalizedPath}`;
}
