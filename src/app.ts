import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import routes from "./routes";
import notFound from "./app/middlewares/notFound";
import bodyParser from "body-parser";
import path from "path";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import { SECURITY_CONFIG } from "./config/security";
import { setupSwagger } from "./swagger.config";

dotenv.config();

const app = express();

// Security headers with Helmet
app.use(helmet(SECURITY_CONFIG.HELMET));

// Handle preflight requests with security configuration
app.use(cors(SECURITY_CONFIG.CORS));

// Increase payload limits to handle large file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Determine uploads path - works in both dev and production
// In dev: __dirname is 'src', so '../uploads'
// In prod: __dirname is 'dist', so '../uploads'
// Both resolve to project root /uploads
const uploadsPath = path.join(__dirname, '../uploads');
// console.log('📁 Uploads directory configured at:', uploadsPath);

// Serve static files BEFORE API routes to prevent conflicts
// This allows direct access to uploaded files without going through API middleware
app.use('/uploads', (req, res, next) => {
  // console.log('📁 Static file request:', req.method, req.url, req.path);
  next();
}, express.static(uploadsPath, {
  // Add options to help with file serving
  setHeaders: (res, filePath) => {
    // console.log('✅ Serving file:', filePath);
    // Set proper content type headers
    if (filePath.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
    }
  },
  fallthrough: true, // Pass to next middleware if file not found
  index: false, // Don't serve index.html for directory requests
}));

app.use("/api", routes);

// Setup Swagger API Documentation
setupSwagger(app);

app.get("/", (req, res) => {
    res.send("Hello mongodb!");
  });
  
  // Test endpoint for file uploads access
  app.get("/test-file-access", (req, res) => {
    const fs = require('fs');
    const uploadsPath = path.join(__dirname, '../uploads');
    const profileDocsPath = path.join(uploadsPath, 'profiledocs');
    
    const uploadsExists = fs.existsSync(uploadsPath);
    const profileDocsExists = fs.existsSync(profileDocsPath);
    
    let files: string[] = [];
    if (profileDocsExists) {
      try {
        files = fs.readdirSync(profileDocsPath).slice(0, 5); // First 5 files
      } catch (error) {
        files = ['Error reading directory'];
      }
    }
    
    res.json({
      message: "File access test",
      uploadsPath,
      uploadsExists,
      profileDocsPath,
      profileDocsExists,
      sampleFiles: files,
      staticMiddlewareActive: true,
      directAccessTest: files.length > 0 ? `${req.protocol}://${req.get('host')}/uploads/profiledocs/${files[0]}` : null,
      accessExample: `${req.protocol}://${req.get('host')}/uploads/profiledocs/filename.pdf`,
      serverPath: path.join(__dirname, '../uploads')
    });
  });

  // Test endpoint for Cloudinary connection
  app.get("/test-cloudinary", async (req, res) => {
    try {
      const cloudinary = require('./config/cloudinary').default;
      
      // Check environment variables
      const envCheck = {
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? '✓ Set' : '✗ Missing',
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? '✓ Set' : '✗ Missing',
        CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? '✓ Set' : '✗ Missing',
      };

      // Test connection
      let connectionTest;
      try {
        connectionTest = await cloudinary.api.ping();
      } catch (pingError: any) {
        connectionTest = { 
          error: pingError.message, 
          code: pingError.http_code 
        };
      }

      res.json({
        message: "Cloudinary Configuration Test",
        timestamp: new Date().toISOString(),
        environment: envCheck,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        connectionTest,
        status: connectionTest.status === 'ok' ? '✓ Connected' : '✗ Connection Failed'
      });
    } catch (error: any) {
      res.status(500).json({
        message: "Cloudinary test failed",
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // Test endpoint for CORS and payload size
  app.post("/api/test-cors", (req, res) => {
    res.json({
      message: "CORS is working correctly!",
      origin: req.headers.origin,
      method: req.method,
      payloadSize: JSON.stringify(req.body).length,
      timestamp: new Date().toISOString()
    });
  });

app.use(globalErrorHandler as any);

app.use(notFound as any);

export default app;




