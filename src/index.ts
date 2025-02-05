import dotenv from 'dotenv';
dotenv.config();

import { app } from './app';
import logger from './logging/logger';
import databaseConnection from './db/connection';

const PORT = process.env.PORT || 8001;

app.listen(PORT, async () => {
  logger.info(`Server is running on port ${PORT}...`);
  try {
    await databaseConnection();
  } catch (error) {
    logger.error('Error in connecting to MongoDB', error);
  }
});
