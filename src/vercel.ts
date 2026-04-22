import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import app from './app';
import config from './config';
import './config/cloudinary'; // Initialize Cloudinary

let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }
  try {
    await mongoose.connect(config.db_url as string);
    isConnected = true;
    console.log('🛢 Database connected successfully');
  } catch (error) {
    console.error('Failed to connect to database:', error);
  }
};

export default async (req: Request, res: Response) => {
  await connectToDatabase();
  app(req, res);
};
