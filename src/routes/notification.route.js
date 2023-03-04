import { Router } from 'express';
import NotificationController from '../controllers/notification.controller';
import authorizationMiddleware from '../middlewares/authorization.middleware';

const router = Router();

router.use(authorizationMiddleware);

router.post('/sms', NotificationController.sms);
router.post('/email', NotificationController.email);

export default router;
