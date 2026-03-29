const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

// Simple memory cleanup every hour
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (now - record.lastReset > 3600000) {
        rateLimitMap.delete(key);
      }
    }
  }, 3600000);
}

export function isRateLimited(key: string, limit: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || (now - record.lastReset) > windowMs) {
    rateLimitMap.set(key, { count: 1, lastReset: now });
    return false;
  }

  record.count++;
  if (record.count > limit) {
    return true;
  }

  return false;
}

export function validateCSRF(request: any) {
  // Basic CSRF check: Origin/Referer must match host in production
  if (process.env.NODE_ENV === 'production') {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    if (origin && !origin.includes(host)) {
      return false;
    }
  }
  return true;
}
