import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import validationMiddleware from '../middlewares/validation.middleware';
import UserValidation from '../validations/client.validation';
import { checkClientDuplicate } from '../middlewares/user.middleware';

const router = Router();

router.post(
  '/register',
  validationMiddleware(UserValidation.registration),
  checkClientDuplicate,
  AuthController.register,
);

export default router;
