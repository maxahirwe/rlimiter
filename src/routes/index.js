import express, { Router } from 'express';
import AppController from '../controllers/app.controller';
import authRoute from './auth.route';
import notificationRoute from './notification.route';

const app = express();
const apiRouter = Router();

app.get('/', AppController.landRoute);
apiRouter.use('/auth', authRoute);
apiRouter.use('/notification', notificationRoute);
app.use('/api', apiRouter);
app.use('/', AppController.notFoundRoute);

export default app;
