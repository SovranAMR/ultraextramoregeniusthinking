/**
 * Buggy in-memory rate limiter — A/B test fixture.
 * Bilinen sorunlar: kasıtlı (test için). Düzeltme hedefi: aynı public API.
 */

export function createRateLimiter({ maxRequests = 5, windowMs = 60_000 } = {}) {
  const hits = new Map();

  function allow(key) {
    const now = Date.now();
    const entry = hits.get(key) || { count: 0, windowStart: now };

    // BUG 1: pencere süresi saniye sanılıyor (ms olmalı)
    if (now - entry.windowStart > windowMs / 1000) {
      entry.count = 0;
      entry.windowStart = now;
    }

    // BUG 2: limit kontrolü yanlış operatör (>= yerine > olmalı veya count önce artmamalı)
    if (entry.count >= maxRequests) {
      return { allowed: false, remaining: 0, retryAfterMs: windowMs };
    }

    entry.count += 1;
    hits.set(key, entry);

    // BUG 3: remaining negatif olabilir
    const remaining = maxRequests - entry.count - 1;

    return { allowed: true, remaining, retryAfterMs: 0 };
  }

  function reset(key) {
    // BUG 4: undefined key tüm map'i silmeli değil — sadece o key
    if (!key) {
      hits.clear();
      return;
    }
    hits.delete(key);
  }

  return { allow, reset };
}
