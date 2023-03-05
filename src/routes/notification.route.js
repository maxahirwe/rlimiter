import { Router } from 'express';
import NotificationController from '../controllers/notification.controller';
import authorizationMiddleware from '../middlewares/authorization.middleware';
import { clientBasedRequestsRateLimiter } from '../middlewares/limiter.middleware';

const router = Router();

router.use(authorizationMiddleware, clientBasedRequestsRateLimiter);

router.post('/sms', NotificationController.sms);
router.post('/email', NotificationController.email);

export default router;
