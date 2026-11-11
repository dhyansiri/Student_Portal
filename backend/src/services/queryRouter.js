/**
 * Query Router:
 * Identifies greetings, casual queries, follow-ups, and maps student questions
 * to one of Presidency University's primary knowledge categories.
 */

const GREETING_ONLY = /^(hi|hii|hiii|hello|hey|heyy|namaste|good\s+(morning|afternoon|evening)|howdy|yo|sup)\s*[!.?,]*$/i;
const THANKS = /^(thanks|thank\s*you|thx|ty|great thanks|okay thanks|ok thanks|many thanks)\s*[!.?,]*$/i;
const CASUAL = /^(who\s+are\s+you|what\s+can\s+you\s+do|help|help\s+me|what\s+do\s+you\s+do|how\s+are\s+you|how\s+r\s+u|nice|cool|okay|ok)\s*[!.?,]*$/i;

const CATEGORY_PATTERNS = {
  academics: /\b(academic|academics|faculty\s+advisor|advisor|professor|course|subject|curriculum|syllabus|study|studies|cgpa|gpa|grades?|marks?)\b/i,
  attendance: /\b(attendance|minimum\s+attendance|shortage|bunk|attendance\s+percentage|attendance\s+criteria|condonation)\b/i,
  examinations: /\b(exam|examination|examinations|timetable|time\s*table|schedule|next\s+exam|date\s*sheet|hall\s*ticket|reval|revaluation|backlog|supple)\b/i,
  placements: /\b(placement|placements|career|job|jobs|internship|internships|training|recruit|recruitment|company|companies|placement\s+department|package)\b/i,
  library: /\b(library|book|books|reading\s+room|borrow|borrowing|journals?|library\s+timings?|e-library|digital\s+library)\b/i,
  hostel: /\b(hostel|room|rooms|warden|mess|food|stay|accommodation|hostel\s+complaint|hostel\s+administration|hostel\s+fee)\b/i,
  administration: /\b(administration|admin|administrative|certificate|certificates|transcript|transcripts|bonafide|student\s+records?|documents?|id\s+card|degree\s+certificate)\b/i,
  events: /\b(event|events|fest|fests|cultural|tech\s*fest|activities|seminar|webinar|workshop|announcement|announcements|celebration)\b/i
};

export function isGreetingOrCasual(text) {
  const q = String(text || '').trim();
  if (!q) return false;
  return GREETING_ONLY.test(q) || THANKS.test(q) || CASUAL.test(q);
}

export function detectCampusCategory(query, conversationHistory = []) {
  const q = String(query || '').trim();
  if (!q) return 'general';

  // Check direct query patterns
  for (const [category, pattern] of Object.entries(CATEGORY_PATTERNS)) {
    if (pattern.test(q)) {
      return category;
    }
  }

  // Follow-up context check from recent turns
  if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
    const recent = conversationHistory.slice(-4);
    for (let i = recent.length - 1; i >= 0; i--) {
      const msgText = String(recent[i]?.text || recent[i]?.content || recent[i]?.message || '');
      for (const [category, pattern] of Object.entries(CATEGORY_PATTERNS)) {
        if (pattern.test(msgText)) {
          return category;
        }
      }
    }
  }

  return 'general';
}

export function routeQuery(text, conversationHistory = []) {
  const q = String(text || '').trim();
  if (isGreetingOrCasual(q)) {
    return {
      type: 'casual',
      category: 'general'
    };
  }

  const category = detectCampusCategory(q, conversationHistory);
  return {
    type: 'campus_rag',
    category
  };
}
