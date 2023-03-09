import { Router } from 'express';
import NotificationController from '../controllers/notification.controller';
import authorizationMiddleware from '../middlewares/authorization.middleware';
import clientRateLimiterMiddleware from '../middlewares/limiter.middleware';

const router = Router();

router.use(authorizationMiddleware, clientRateLimiterMiddleware);

router.post('/sms', NotificationController.sms);
router.post('/email', NotificationController.email);

export default router;
