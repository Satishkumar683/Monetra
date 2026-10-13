// In-memory sliding window rate limiter
// Suitable for single-instance or serverless cold-cache rate limiting without external Redis dependencies

const rateLimitMap = new Map();

/**
 * Creates a rate limiter instance
 * @param {Object} options
 * @param {number} options.interval - Time window in milliseconds (default: 60,000ms = 1 min)
 * @param {number} options.max - Maximum requests allowed per window (default: 10)
 */
export function rateLimit({ interval = 60 * 1000, max = 10 } = {}) {
  return {
    /**
     * Check if an identifier (e.g. IP or user ID) has exceeded the rate limit
     * @param {string} identifier - Unique client identifier
     * @returns {{ success: boolean, limit: number, remaining: number, resetTime: number }}
     */
    check(identifier) {
      const now = Date.now();
      const clientData = rateLimitMap.get(identifier);

      if (!clientData || now > clientData.resetTime) {
        // Initialize or reset window
        const resetTime = now + interval;
        rateLimitMap.set(identifier, {
          count: 1,
          resetTime,
        });

        return {
          success: true,
          limit: max,
          remaining: max - 1,
          resetTime,
        };
      }

      // Inside current window
      if (clientData.count >= max) {
        return {
          success: false,
          limit: max,
          remaining: 0,
          resetTime: clientData.resetTime,
        };
      }

      clientData.count += 1;
      return {
        success: true,
        limit: max,
        remaining: max - clientData.count,
        resetTime: clientData.resetTime,
      };
    },
  };
}

/**
 * Extracts a client IP from request headers
 * @param {Request} request
 * @returns {string}
 */
export function getClientIp(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}
