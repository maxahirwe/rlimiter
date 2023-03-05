import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import validationMiddleware from '../middlewares/validation.middleware';
import UserValidation from '../validations/client.validation';
import { checkClientDuplicate } from '../middlewares/user.middleware';
import authorizationMiddleware from '../middlewares/authorization.middleware';

const router = Router();

router.post(
  '/register',
  validationMiddleware(UserValidation.registration),
  checkClientDuplicate,
  AuthController.register,
);

router.get('/profile', authorizationMiddleware, AuthController.profile);

export default router;
