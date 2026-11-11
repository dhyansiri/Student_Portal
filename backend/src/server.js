import app from './app.js';
import { vectorStore } from './services/vectorStore.js';
import dotenv from 'dotenv';
dotenv.config();

const PORT = parseInt(process.env.PORT, 10) || 8080;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`================================================================`);
  console.log(`  Presidency University CampusBuddy AI Backend running on ${PORT}`);
  console.log(`  Web App:      http://localhost:${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`  Chat API:     POST http://localhost:${PORT}/api/chat`);
  console.log(`  Vector Store: ${vectorStore.isReady() ? 'Loaded & Ready' : 'Warning: Not Loaded'}`);
  console.log(`================================================================`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[Server Error] Port ${PORT} is already in use!`);
    console.error(`Please set a different PORT in .env (e.g. PORT=8081)\n`);
  } else {
    console.error('[Server Error]', err);
  }
});
