const express = require('express');
const next = require('next');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 3000;

// Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Prisma client
const prisma = new PrismaClient();

app.prepare().then(() => {
  const server = express();

  // Middleware for parsing JSON and form data
  server.use(express.json({ limit: '10mb' }));
  server.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static files
  server.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
  server.use(express.static(path.join(__dirname, 'public')));

  // Health check endpoint for cPanel
  server.get('/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // API routes for file uploads (if needed)
  server.post('/api/upload', (req, res) => {
    // Handle file uploads if needed
    res.json({ message: 'Upload endpoint' });
  });

  // Handle all other requests with Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  // Error handling
  server.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  // Start server
  server.listen(port, hostname, (err) => {
    if (err) {
      console.error('Error starting server:', err);
      return;
    }
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`> Port: ${port}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await prisma.$disconnect();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await prisma.$disconnect();
    process.exit(0);
  });
}).catch((err) => {
  console.error('Error during app preparation:', err);
  process.exit(1);
});
