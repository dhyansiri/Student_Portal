import { routeQuery, isGreetingOrCasual, detectCampusCategory } from './queryRouter.js';
import { getEmbedding } from './embeddingService.js';
import { vectorStore } from './vectorStore.js';
import { generateCasualResponse, generateCampusAnswer } from './geminiService.js';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Process incoming student query through the Campus RAG pipeline
 */
export async function processCampusQuery(queryText, conversationHistory = []) {
  const cleanQuery = String(queryText || '').trim();
  if (!cleanQuery) {
    return {
      success: false,
      status: 'invalid_query',
      reply: 'Please enter a valid question or query.',
      category: 'general',
      grounded: false,
      sources: []
    };
  }

  // 1. Check for casual greetings or pleasantries (bypass vector store completely)
  const routed = routeQuery(cleanQuery, conversationHistory);
  if (routed.type === 'casual') {
    const casualRes = await generateCasualResponse({
      query: cleanQuery,
      conversationHistory
    });

    return {
      success: true,
      status: 'success',
      mode: 'conversational',
      reply: casualRes.reply || 'Hello! How can I help you today with Presidency University information?',
      category: 'general',
      grounded: false,
      sources: [],
      engine: 'CampusBuddy Conversational'
    };
  }

  // 2. Identify campus category
  const detectedCategory = routed.category || detectCampusCategory(cleanQuery, conversationHistory);

  // 3. Generate query embedding
  const queryEmbedding = await getEmbedding(cleanQuery);

  // 4. Retrieve top matching campus documents
  const topK = parseInt(process.env.RAG_TOP_K, 10) || 5;
  const retrievedDocs = vectorStore.searchCampusDocuments({
    query: cleanQuery,
    queryEmbedding,
    topK,
    categoryFilter: detectedCategory !== 'general' ? detectedCategory : null
  });

  // 5. Evaluate relevance threshold
  const minScore = parseFloat(process.env.RAG_MIN_SCORE) || 0.28;
  const relevantDocs = retrievedDocs.filter(d => d.score >= minScore || d.matchedTokens > 0);

  if (relevantDocs.length === 0) {
    return {
      success: true,
      status: 'unknown',
      mode: 'rag',
      reply: 'This information is not available in my current university knowledge base. Please check the relevant official university communication channel or contact the appropriate department.',
      category: detectedCategory,
      grounded: false,
      sources: [],
      engine: 'CampusBuddy Policy Guard'
    };
  }

  // 6. Generate grounded answer via Gemini
  const answerResult = await generateCampusAnswer({
    query: cleanQuery,
    retrievedDocuments: relevantDocs,
    conversationHistory
  });

  return {
    success: answerResult.success,
    status: answerResult.status,
    mode: 'rag',
    reply: answerResult.reply,
    category: detectedCategory,
    grounded: answerResult.grounded ?? true,
    sources: answerResult.sources || relevantDocs.map(d => ({
      id: d.id,
      title: d.title,
      category: d.category,
      source: d.source
    })),
    engine: answerResult.engine || 'Google Gemini 2.5 Flash-Lite'
  };
}
