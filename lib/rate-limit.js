// Simple in-memory rate limiter — no Redis needed for <1000 users
const store = new Map();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store) {
    if (now > record.resetAt) store.delete(key);
  }
}, 300000);

export function rateLimit(key, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  let record = store.get(key);
  if (!record || now > record.resetAt) {
    record = { count: 0, resetAt: now + windowMs };
  }
  record.count++;
  store.set(key, record);
  if (record.count > maxRequests) {
    return { allowed: false, remaining: 0, resetIn: Math.ceil((record.resetAt - now) / 1000) };
  }
  return { allowed: true, remaining: maxRequests - record.count, resetIn: Math.ceil((record.resetAt - now) / 1000) };
}
