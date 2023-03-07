import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import errorMiddleware from './middlewares/error.middleware';
import requestLogger, { loggerFormat } from './utils/requestLogger';
import { generalRateLimiterMiddleware } from './middlewares/limiter.middleware';

const { NODE_ENV } = process.env;
const app = express();
app.use(generalRateLimiterMiddleware);
app.use(cors());
app.use(helmet());
if (NODE_ENV !== 'test') {
  app.use(morgan('dev'));
  app.use(morgan(loggerFormat, { stream: requestLogger.stream }));
}
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: '2mb' }));
app.use('/', routes);
app.use('/', errorMiddleware);

export default app;
