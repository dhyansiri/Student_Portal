import { processCampusQuery } from '../src/services/ragEngine.js';
import { routeQuery, isGreetingOrCasual, detectCampusCategory } from '../src/services/queryRouter.js';
import { vectorStore } from '../src/services/vectorStore.js';

async function runTests() {
  console.log('====================================================');
  console.log('  CampusBuddy AI — RAG Quality & Accuracy Tests');
  console.log('====================================================\n');

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

  // Test 1: Store is loaded
  assert(vectorStore.isReady(), 'Campus Vector Store is loaded and ready');
  const meta = vectorStore.getMetadata();
  assert(meta.totalDocuments === 8, '8 documents indexed in campus vector store', `Found: ${meta.totalDocuments}`);

  // Test 2: Casual Routing
  const greetingRoute = routeQuery('Hello');
  assert(greetingRoute.type === 'casual', 'Greeting "Hello" routes to casual');

  const greetingRes = await processCampusQuery('Hi');
  assert(greetingRes.mode === 'conversational', '"Hi" processed as conversational mode');

  // Test 3: Faculty Advisor
  const q1 = await processCampusQuery('Whom should I contact for academic problems?');
  assert(q1.success && /faculty\s+advisor/i.test(q1.reply), 'Academic problems mentions faculty advisor', `Reply: ${q1.reply}`);
  assert(q1.category === 'academics', 'Query category identified as academics');

  // Test 4: Examination Timetable
  const q2 = await processCampusQuery('Where can I find the examination timetable?');
  assert(q2.success && /official\s+university\s+channels/i.test(q2.reply), 'Exam timetable mentions official university channels', `Reply: ${q2.reply}`);
  assert(q2.category === 'examinations', 'Query category identified as examinations');

  // Test 5: Placement Training
  const q3 = await processCampusQuery('Whom should I contact for placement training?');
  assert(q3.success && /placement\s+department/i.test(q3.reply), 'Placement training mentions Placement Department', `Reply: ${q3.reply}`);
  assert(q3.category === 'placements', 'Query category identified as placements');

  // Test 6: Hostel Complaint
  const q4 = await processCampusQuery('How can I raise a hostel complaint?');
  assert(q4.success && /hostel\s+administration/i.test(q4.reply), 'Hostel complaint mentions Hostel Administration', `Reply: ${q4.reply}`);
  assert(q4.category === 'hostel', 'Query category identified as hostel');

  // Test 7: Exact Date of Next Exam (Explicitly not specified / unavailable)
  const q5 = await processCampusQuery('What is the exact date of my next examination?');
  assert(q5.success && /not\s+specified/i.test(q5.reply), 'Exact next exam date states not specified in sample data', `Reply: ${q5.reply}`);

  // Test 8: Attendance Requirement
  const q6 = await processCampusQuery('What is the minimum attendance requirement?');
  assert(q6.success && /attendance/i.test(q6.reply), 'Attendance query answered grounded in attendance regulation');

  // Test 9: Off-topic / Unrepresented unknown query
  const q7 = await processCampusQuery('What is the capital of Australia?');
  assert(!q7.grounded || q7.status === 'unknown', 'Off-topic question returns unknown or ungrounded', `Status: ${q7.status}, Grounded: ${q7.grounded}`);

  // Test 10: Follow-up question inherits category
  const followUpCat = detectCampusCategory('What about academic problems?', [{ role: 'user', content: 'Tell me about exams' }]);
  assert(followUpCat === 'academics', 'Direct query category takes priority in follow-up');

  console.log('\n====================================================');
  console.log(`  Tests completed: ${passed} passed, ${failed} failed.`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
