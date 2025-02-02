import express from 'express';
import morgan from 'morgan';
import cors from 'cors';

import logger from './logging/logger';
import healthCheckRouter from './routes/healthcheck.routes';

const app = express();
const morganFormat = ':method :url :status :response-time ms';

// cors
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// common express middleware
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ limit: '16kb', extended: true }));
app.use(express.static('public'));

// logging middleware
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(' ')[0],
          url: message.split(' ')[1],
          status: message.split(' ')[2],
          responseTime: message.split(' ')[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);

// routes
app.use('/api/v1/healthcheck', healthCheckRouter);

export { app };
