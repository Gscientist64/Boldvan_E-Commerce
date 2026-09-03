// backend/src/utils/lockout.ts
// In-memory per-account login lockout. Config values (max attempts / lock minutes)
// come from MarketplaceSettings and are supplied by the caller.

interface LockRecord {
  fails: number;
  lockedUntil: number;
}

const store = new Map<string, LockRecord>();

const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, rec] of store) {
    if (rec.lockedUntil > 0 && rec.lockedUntil <= now) {
      store.delete(key);
    }
  }
}, 60 * 1000);
// Do not keep the Node process alive just for the cleanup timer.
if (typeof cleanupInterval.unref === 'function') {
  cleanupInterval.unref();
}

/** Returns remaining lock seconds for the key (0 = not locked). */
export const getLoginLockRemaining = (key: string): number => {
  const rec = store.get(key);
  if (!rec || rec.lockedUntil <= 0) return 0;
  const remainingSeconds = Math.ceil((rec.lockedUntil - Date.now()) / 1000);
  if (remainingSeconds <= 0) {
    store.delete(key);
    return 0;
  }
  return remainingSeconds;
};

/**
 * Records a failed login. When failures reach maxAttempts the account is locked
 * for lockMs. Returns remaining lock seconds (0 = not locked yet).
 */
export const recordLoginFailure = (key: string, maxAttempts: number, lockMs: number): number => {
  const rec = store.get(key) || { fails: 0, lockedUntil: 0 };

  // Already locked? Leave it locked.
  if (rec.lockedUntil > Date.now()) {
    return Math.ceil((rec.lockedUntil - Date.now()) / 1000);
  }
  if (rec.lockedUntil > 0 && rec.lockedUntil <= Date.now()) {
    store.delete(key);
    return 0;
  }

  rec.fails += 1;
  if (rec.fails >= maxAttempts) {
    rec.lockedUntil = Date.now() + lockMs;
    rec.fails = 0;
  }
  store.set(key, rec);
  return rec.lockedUntil > 0 ? Math.ceil((rec.lockedUntil - Date.now()) / 1000) : 0;
};

/** Clears failures on successful login. */
export const clearLoginFailures = (key: string): void => {
  store.delete(key);
};
