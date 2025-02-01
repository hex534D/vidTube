import mongoose from 'mongoose';

import logger from '../logging/logger';
import { MONGO_URI, DB_NAME } from '../constants';

const databaseConnection = async () => {
  try {
    const db = await mongoose.connect(`${MONGO_URI}/${DB_NAME}`);
    logger.info(`MongoDB Server connected to host: ${db.connection.host}`);
  } catch (error) {
    logger.error('Unable to connect to Database ', error);
    process.exit(1);
  }
};

export default databaseConnection;
