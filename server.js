import app from './src/app.js';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please:`);
    console.error(`1. Stop the process using port ${PORT}`);
    console.error(`2. Or set a different PORT in your .env file`);
    console.error(`3. Or run: netstat -ano | findstr :${PORT} to find the process`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});

