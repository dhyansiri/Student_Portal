import app from '../src/app.js';
import { EventEmitter } from 'events';

// In-process Express caller without opening network sockets
function callApp(method, url, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = new EventEmitter();
    req.method = method;
    req.url = url;
    req.originalUrl = url;
    req.headers = {
      'content-type': 'application/json',
      ...headers
    };
    req.body = body;

    let resBody = '';
    const resHeaders = {};
    const res = new EventEmitter();
    res.statusCode = 200;

    res.status = function(code) {
      res.statusCode = code;
      return res;
    };

    res.setHeader = function(name, value) {
      resHeaders[name.toLowerCase()] = value;
    };

    res.getHeader = function(name) {
      return resHeaders[name.toLowerCase()];
    };

    res.json = function(data) {
      resBody = data;
      resolve({ statusCode: res.statusCode, body: data, headers: resHeaders });
    };

    res.send = function(data) {
      resBody = data;
      resolve({ statusCode: res.statusCode, body: data, headers: resHeaders });
    };

    res.sendFile = function(filePath) {
      resolve({ statusCode: 200, file: filePath });
    };

    try {
      app.handle(req, res, (err) => {
        if (err) reject(err);
        else resolve({ statusCode: 404, body: 'Not found' });
      });
    } catch (err) {
      reject(err);
    }
  });
}

async function runInProcessTests() {
  console.log('Running In-Process API Route Tests...');
  let passed = 0;
  let failed = 0;

  function assert(cond, name, info = '') {
    if (cond) {
      console.log(`  [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${name} - ${info}`);
      failed++;
    }
  }

  // 1. GET /api/health
  const health = await callApp('GET', '/api/health');
  assert(health.statusCode === 200, 'GET /api/health returns 200');
  assert(health.body.status === 'ok', 'Health status is ok');
  assert(health.body.vectorStore.totalDocuments === 8, 'Health totalDocuments is 8');

  // 2. GET /api/categories
  const cats = await callApp('GET', '/api/categories');
  assert(cats.statusCode === 200, 'GET /api/categories returns 200');
  assert(cats.body.categories.length === 8, '8 categories returned', `Count: ${cats.body.categories?.length}`);

  // 3. GET /api/suggestions
  const suggs = await callApp('GET', '/api/suggestions');
  assert(suggs.statusCode === 200, 'GET /api/suggestions returns 200');
  assert(suggs.body.suggestions.length > 0, 'Suggestions returned');

  // 4. POST /api/chat valid query
  const chat1 = await callApp('POST', '/api/chat', {
    message: 'Whom should I contact for placement training?'
  });
  assert(chat1.statusCode === 200, 'POST /api/chat returns 200');
  assert(chat1.body.success === true, 'Chat success is true');
  assert(/placement\s+department/i.test(chat1.body.reply), 'Chat reply mentions Placement Department', `Reply: ${chat1.body.reply}`);
  assert(chat1.body.category === 'placements', 'Category is placements');

  // 5. POST /api/chat empty message validation
  const chat2 = await callApp('POST', '/api/chat', { message: '' });
  assert(chat2.statusCode === 400, 'POST /api/chat with empty message returns 400');

  // 6. POST /api/chat examination query
  const chat3 = await callApp('POST', '/api/chat', {
    message: 'Where can I find the examination timetable?'
  });
  assert(chat3.statusCode === 200, 'POST /api/chat exam query returns 200');
  assert(/official\s+university\s+channels/i.test(chat3.body.reply), 'Chat reply mentions official university channels');

  console.log(`\nIn-Process API Tests Completed: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runInProcessTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
