import { TOO_MANY_REQUESTS } from 'http-status';
import Redis from 'ioredis';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import ClientService from '../services/client.service';
import ResponseService from '../services/response.service';
import { QUOTA_METRICS, QUOTA_TYPES } from '../utils/variable';

const redisClient = new Redis({ enableOfflineQueue: false });

const generateResponseHeaders = (rateLimiterRes, limit) => {
  return {
    'Retry-After': rateLimiterRes.msBeforeNext / 1000,
    'X-RateLimit-Limit': limit,
    'X-RateLimit-Remaining': rateLimiterRes.remainingPoints,
    'X-RateLimit-Reset': new Date(Date.now() + rateLimiterRes.msBeforeNext),
    'RateLimit-Limit': limit,
    'RateLimit-Remaining': rateLimiterRes.remainingPoints,
    'RateLimit-Reset': new Date(Date.now() + rateLimiterRes.msBeforeNext),
  };
};

const rateLimiterGeneratorRedis = (requestsPerMinute = 100, key, res, next) => {
  return new RateLimiterRedis({
    storeClient: redisClient,
    points: requestsPerMinute, // Number of points/requests
    duration: 60, // Per 60 seconds/Minute
  })
    .consume(key, 1)
    .then((rateLimiterRes) => {
      res.set(generateResponseHeaders(rateLimiterRes, requestsPerMinute));
      next();
    })
    .catch((_) => {
      res.status(TOO_MANY_REQUESTS).send({
        status: TOO_MANY_REQUESTS,
        message: 'Too many requests, please try again later.',
      });
    });
};

/**
 * client rate Limiter Middleware
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @returns {Function} Middleware
 */

const clientRateLimiterMiddleware = async (req, res, next) => {
  const { data } = req;
  let key = req.ip;
  // console.log('key=>', key, req.path.indexOf('/api') === 0);
  if (data) {
    const { client } = data;
    const { clientIdentifier } = client;
    key = clientIdentifier;
    console.log('key**', key);
    const apiKey = client.keys[0]; // TODO ADD support for many keys
    const { quotaType, quota, quotaUsed, quotaMetric } = apiKey;
    const adjustedQuota = quotaMetric === QUOTA_METRICS[0] ? quota / 60 : quota;
    console.log(
      `${quotaType} rate limit being applied  (${adjustedQuota} Req / ${quotaMetric})`,
    );
    if (quotaType === QUOTA_TYPES[0]) {
      // GLOBAL CLIENT RATELIMITS
      rateLimiterGeneratorRedis(100, key, res, next);
    } else if (quotaType === QUOTA_TYPES[1]) {
      // WINDOW RATELIMITS
      console.log('WINDOW');
      rateLimiterGeneratorRedis(adjustedQuota, key, res, next);
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
      next();
    }
  }
};

/**
 * general rate Limiter Middleware
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @returns {Function} Middleware
 */

export const generalRateLimiterMiddleware = async (req, res, next) => {
  const key = req.ip;
  rateLimiterGeneratorRedis(100, key, res, next);
};

export default clientRateLimiterMiddleware;
