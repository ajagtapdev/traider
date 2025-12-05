type RateLimitStore = Map<string, { count: number; lastReset: number }>;

const store: RateLimitStore = new Map();

export function rateLimit(ip: string, limit: number = 10, windowMs: number = 60000) {
  const now = Date.now();
  const record = store.get(ip) || { count: 0, lastReset: now };

  if (now - record.lastReset > windowMs) {
    record.count = 0;
    record.lastReset = now;
  }

  record.count += 1;
  store.set(ip, record);

  return record.count <= limit;
}

