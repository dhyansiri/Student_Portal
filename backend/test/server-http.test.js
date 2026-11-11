import app from '../src/app.js';
import http from 'http';

async function testHttpEndpoints() {
  console.log('Testing Server HTTP endpoints...');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5099, resolve));
  const port = 5099;

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName} - ${details}`);
      failed++;
    }
  }

  try {
    // 1. GET /api/health
    const healthRes = await fetch(`http://localhost:${port}/api/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'GET /api/health returns 200 OK');
    assert(healthData.status === 'ok', 'GET /api/health reports status ok');
    assert(healthData.vectorStore.totalDocuments === 8, 'Health reports 8 documents in vector store');

    // 2. GET /api/categories
    const catRes = await fetch(`http://localhost:${port}/api/categories`);
    const catData = await catRes.json();
    assert(catRes.status === 200, 'GET /api/categories returns 200 OK');
    assert(Array.isArray(catData.categories) && catData.categories.length >= 6, 'GET /api/categories returns categories array');

    // 3. POST /api/chat with valid query
    const chatRes = await fetch(`http://localhost:${port}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Whom should I contact for placement training?'
      })
    });
    const chatData = await chatRes.json();
    assert(chatRes.status === 200, 'POST /api/chat returns 200 OK');
    assert(chatData.success === true, 'POST /api/chat success flag is true');
    assert(/placement\s+department/i.test(chatData.reply), 'POST /api/chat reply mentions Placement Department', `Reply: ${chatData.reply}`);
    assert(chatData.category === 'placements', 'POST /api/chat categorized as placements');

    // 4. POST /api/chat with empty query (validation error)
    const emptyRes = await fetch(`http://localhost:${port}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '' })
    });
    assert(emptyRes.status === 400, 'POST /api/chat empty message returns 400 Bad Request');

    // 5. GET / serves static frontend HTML
    const htmlRes = await fetch(`http://localhost:${port}/`);
    const htmlText = await htmlRes.text();
    assert(htmlRes.status === 200, 'GET / serves frontend index.html');
    assert(htmlText.includes('CampusBuddy AI'), 'Served HTML contains CampusBuddy AI title');

    console.log(`\nHTTP Integration tests passed: ${passed}/${passed + failed}`);
  } finally {
    server.close();
  }

  if (failed > 0) process.exit(1);
}

testHttpEndpoints().catch(err => {
  console.error('Fatal HTTP test error:', err);
  process.exit(1);
});
