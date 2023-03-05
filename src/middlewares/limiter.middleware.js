import rateLimit from 'express-rate-limit';

const minutes = 1;
const max = 10;

export const generalRequestsRateLimiter = rateLimit({
  windowMs: minutes * 60 * 1000,
  max,
  standardHeaders: true,
  message: {
    status: 429,
    message: 'Too many requests, please try again later.',
  },
  onLimitReached: (req, res) => {
    console.log(req.rateLimit);
  },
});
