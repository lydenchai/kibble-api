import mongoose from 'mongoose';

const connectDB = async (retries = 5) => {
  while (retries) {
    try {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kibble';
      await mongoose.connect(uri);
      console.log('MongoDB connected successfully');
      break;
    } catch (error) {
      console.error('MongoDB connection failed. Retries left:', retries, error);
      retries -= 1;
      console.log('Waiting 5 seconds before retrying...');
      await new Promise(res => setTimeout(res, 5000));
      if (retries === 0) {
        console.error('Could not connect to MongoDB after multiple attempts. Exiting...');
        process.exit(1);
      }
    }
  }
};

export default connectDB;
