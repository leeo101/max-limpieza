/**
 * Simple in-memory rate limiter for Next.js API routes.
 * 
 * Note: In serverless environments (like Vercel), this state is local to the instance.
 * While not a global distributed lock, it provides a solid first layer of defense
 * against automated scripts and brute-force attempts on a single instance.
 */

type RateLimitRecord = {
  count: number;
  lastReset: number;
};


interface RateLimitOptions {
  interval: number; // in milliseconds
  uniqueTokenPerInterval: number; // max requests
}

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new Map<string, RateLimitRecord>();
  
  return {
    check: (limit: number, token: string) => {
      const now = Date.now();
      const record = tokenCache.get(token) || { count: 0, lastReset: now };

      if (now - record.lastReset > options.interval) {
        record.count = 1;
        record.lastReset = now;
      } else {
        record.count++;
      }

      tokenCache.set(token, record);

      return {
        isLimitReached: record.count > limit,
        current: record.count,
        limit,
        remaining: Math.max(0, limit - record.count),
      };
    },
  };
}

// Pre-configured limiters
export const orderLimiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 500,
});

export const loginLimiter = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 500,
});
