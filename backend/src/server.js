import app from './app.js';
import { vectorStore } from './services/vectorStore.js';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`  Presidency University CampusBuddy AI Backend running on ${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`  Chat API:     POST http://localhost:${PORT}/api/chat`);
  console.log(`  Vector Store: ${vectorStore.isReady() ? 'Loaded & Ready' : 'Warning: Not Loaded'}`);
  console.log(`================================================================`);
});
