import dotenv from 'dotenv';
dotenv.config();
import { processCampusQuery } from '../src/services/ragEngine.js';

async function testLiveRag() {
  console.log('Testing Live Campus RAG with configured Gemini API Key...\n');

  const queries = [
    'Hello, who are you?',
    'Whom should I contact for placement training?',
    'Where can I find the examination timetable?',
    'What is the exact date of my next examination?'
  ];

  for (const q of queries) {
    console.log(`>>> Question: "${q}"`);
    const res = await processCampusQuery(q);
    console.log(`[Status: ${res.status}] Mode: ${res.mode} | Grounded: ${res.grounded} | Engine: ${res.engine}`);
    console.log(`Reply: ${res.reply}`);
    if (res.sources?.length) {
      console.log(`Sources:`, res.sources.map(s => `${s.id} (${s.title})`));
    }
    console.log('------------------------------------------------------------\n');
  }
}

testLiveRag().catch(console.error);
