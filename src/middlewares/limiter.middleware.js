import rateLimit from 'express-rate-limit';
import { TOO_MANY_REQUESTS } from 'http-status';
import ClientService from '../services/client.service';
import ResponseService from '../services/response.service';
import { QUOTA_METRICS, QUOTA_TYPES } from '../utils/variable';

/**
 * Generates a middleware that can applied to routes for rate limiting
 * @param {Number} totalRequests total number of requests
 * @param {Number} minutes minutes ex 1000 requests/1 minute
 * @returns {Function}
 */

export const rateLimiterMiddleware = (totalRequests, minutes = 1) => {
  return rateLimit({
    windowMs: minutes * 60 * 1000,
    max: totalRequests,
    standardHeaders: true,
    message: {
      status: TOO_MANY_REQUESTS,
      message: 'Too many requests, please try again later.',
    },
    onLimitReached: (req, res) => {
      console.log(req.rateLimit);
    },
  });
};

// handles GLOBAL rate limits for the entire api/server
// incase clusters/load balancing is in place the limits can be adjusted to fit the company's needs

export const generalRequestsRateLimiter = rateLimiterMiddleware(100);

/**
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @returns rateLimit middleware // handles client base rate limits based on purchase quotas
 */

export const clientBasedRequestsRateLimiter = async (req, res, next) => {
  const { client } = req;
  const apiKey = client.keys[0]; // TODO ADD support for many keys
  const { quotaType, quota, quotaUsed, quotaMetric, lastQuotaUpdate } = apiKey;
  const adjustedQuota = quotaMetric === QUOTA_METRICS[0] ? quota / 60 : quota;
  console.log(
    `${quotaType} rate limit being applied  (${adjustedQuota} Req / ${quotaMetric})`,
  );
  if (quotaType === QUOTA_TYPES[0]) {
    // GLOBAL RATELIMITS
    generalRequestsRateLimiter;
  } else if (quotaType === QUOTA_TYPES[1]) {
    // WINDOW RATELIMITS
    rateLimiterMiddleware(adjustedQuota);
  } else if (quotaType === QUOTA_TYPES[2]) {
    // MONTH RATELIMITS
    const remaining = quota - quotaUsed;
    if (remaining <= 0) {
      return ResponseService.error(
        TOO_MANY_REQUESTS,
        `You have reached your apiKey quota (${adjustedQuota} Req / ${quotaMetric})`,
        res,
      );
    }
    await ClientService.quotaUsageIncrease(apiKey);
  }
  next();
};
