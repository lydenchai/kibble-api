import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import connectDB from './utils/db';
import { startCronJobs } from './services/cron.service';


const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  startCronJobs();
  
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
