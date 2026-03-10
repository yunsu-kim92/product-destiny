const CACHE_KEY = 'kdestiny-analysis-cache-v1';
const CACHE_VERSION = 1;
const MAX_CACHE_ENTRIES = 3;

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function normalizePayload(payload) {
  return {
    name: String(payload.name || '').trim().toLowerCase(),
    birthdate: String(payload.birthdate || '').trim(),
    birthtime: String(payload.birthtime || '').trim(),
    gender: String(payload.gender || '').trim(),
    language: String(payload.language || '').trim(),
  };
}

function buildCacheEntryKey(payload) {
  return JSON.stringify(normalizePayload(payload));
}

function readCacheStore() {
  if (!canUseStorage()) {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch {
    return {};
  }
}

function writeCacheStore(store) {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(store));
  } catch {
    // Ignore storage quota failures and keep the request flow usable.
  }
}

export function getCachedAnalysis(payload) {
  const store = readCacheStore();
  const entry = store[buildCacheEntryKey(payload)];

  if (!entry || entry.version !== CACHE_VERSION || !entry.data) {
    return null;
  }

  return entry.data;
}

export function setCachedAnalysis(payload, data) {
  const store = readCacheStore();
  const nextKey = buildCacheEntryKey(payload);
  const nextStore = {
    ...store,
    [nextKey]: {
      version: CACHE_VERSION,
      savedAt: Date.now(),
      data,
    },
  };

  const prunedEntries = Object.entries(nextStore)
    .sort(([, left], [, right]) => (right.savedAt || 0) - (left.savedAt || 0))
    .slice(0, MAX_CACHE_ENTRIES);

  writeCacheStore(Object.fromEntries(prunedEntries));
}
