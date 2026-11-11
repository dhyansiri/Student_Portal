import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { cosineSimilarity } from './embeddingService.js';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_PATH = path.resolve(__dirname, '../data/campus_vector_store.json');

const STOPWORDS = new Set([
  'a','an','and','are','as','at','be','by','can','could','do','does','for','from',
  'how','i','in','is','it','me','my','of','on','or','please','the','this','that',
  'to','what','when','where','which','who','whom','why','with','you','your','tell','about'
]);

export function tokenize(text) {
  return (String(text || '').toLowerCase().match(/[a-z0-9]+/g) || [])
    .filter(token => token.length > 1 && !STOPWORDS.has(token));
}

class CampusVectorStore {
  constructor() {
    this.metadata = null;
    this.documents = [];
    this.loaded = false;
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, 'utf-8');
        const data = JSON.parse(raw);
        if (data && Array.isArray(data.documents)) {
          this.metadata = {
            schemaVersion: data.schemaVersion || '1.0.0',
            embeddingModel: data.embeddingModel || 'unknown',
            embeddingDimensions: data.embeddingDimensions || 0,
            indexedAt: data.indexedAt || null,
            totalDocuments: data.documents.length
          };
          this.documents = data.documents;
          this.loaded = true;
          console.log(`[CampusVectorStore] Loaded ${this.documents.length} campus documents (${this.metadata.embeddingDimensions}d, ${this.metadata.embeddingModel}).`);
          return;
        }
      }
      console.warn('[CampusVectorStore] Vector store file not found or invalid at:', STORE_PATH);
      this.documents = [];
      this.loaded = false;
    } catch (err) {
      console.error('[CampusVectorStore] Failed to load vector store:', err.message);
      this.documents = [];
      this.loaded = false;
    }
  }

  isReady() {
    return this.loaded && this.documents.length > 0;
  }

  getMetadata() {
    return this.metadata || { totalDocuments: 0, loaded: false };
  }

  /**
   * Search campus documents using combined vector similarity and lexical matching
   */
  searchCampusDocuments({ query, queryEmbedding = null, topK = 5, categoryFilter = null }) {
    if (!this.documents.length) {
      return [];
    }

    const cleanQuery = String(query || '').toLowerCase().trim();
    const queryTokens = tokenize(cleanQuery);
    const storeDim = this.metadata?.embeddingDimensions;
    const storeModel = this.metadata?.embeddingModel;

    const queryVec = queryEmbedding?.vector || (Array.isArray(queryEmbedding) ? queryEmbedding : null);
    const queryVecDim = queryEmbedding?.dimension || (Array.isArray(queryVec) ? queryVec.length : null);
    const queryVecModel = queryEmbedding?.model || null;

    // Check embedding compatibility
    const isVectorCompatible = Array.isArray(queryVec) &&
      queryVecDim === storeDim &&
      (!queryVecModel || !storeModel || queryVecModel === storeModel);

    if (!isVectorCompatible && queryVec) {
      console.warn(`[CampusVectorStore] Vector dimension/model mismatch! Query: ${queryVecDim}d (${queryVecModel}), Store: ${storeDim}d (${storeModel}). Using lexical-only scoring.`);
    }

    const scoredDocs = this.documents.map(doc => {
      // 1. Vector score (cosine similarity)
      let vectorScore = 0;
      if (isVectorCompatible && Array.isArray(doc.embedding)) {
        vectorScore = Math.max(0, cosineSimilarity(queryVec, doc.embedding));
      }

      // 2. Lexical score
      const docSearchText = `${doc.title} ${doc.content} ${(doc.tags || []).join(' ')} ${doc.category}`.toLowerCase();
      let lexicalScore = 0;
      let matchedCount = 0;

      for (const token of queryTokens) {
        if (docSearchText.includes(token)) {
          matchedCount += 1;
          // Exact title/tag match bonus
          const inTitle = doc.title.toLowerCase().includes(token);
          const inTags = (doc.tags || []).some(t => t.toLowerCase().includes(token));
          lexicalScore += inTitle ? 2.0 : (inTags ? 1.5 : 1.0);
        }
      }

      const normalizedLexical = queryTokens.length > 0 ? (lexicalScore / (queryTokens.length * 1.5)) : 0;

      // 3. Category boost
      let categoryBoost = 0;
      if (categoryFilter && doc.category.toLowerCase() === categoryFilter.toLowerCase()) {
        categoryBoost = 0.25;
      }

      // 4. Combined weighted score
      // If vector is available: 0.50 vector + 0.40 lexical + 0.10 category boost
      // If lexical only: 0.80 lexical + 0.20 category boost
      let combinedScore = 0;
      if (isVectorCompatible) {
        combinedScore = (vectorScore * 0.50) + (Math.min(1, normalizedLexical) * 0.40) + categoryBoost;
      } else {
        combinedScore = (Math.min(1, normalizedLexical) * 0.80) + categoryBoost;
      }

      return {
        id: doc.id,
        category: doc.category,
        title: doc.title,
        content: doc.content,
        source: doc.source,
        tags: doc.tags,
        vectorScore: Number(vectorScore.toFixed(4)),
        lexicalScore: Number(normalizedLexical.toFixed(4)),
        score: Number(combinedScore.toFixed(4)),
        matchedTokens: matchedCount
      };
    });

    // Sort by highest combined score
    scoredDocs.sort((a, b) => b.score - a.score || b.matchedTokens - a.matchedTokens);
    return scoredDocs.slice(0, topK);
  }
}

// Singleton instance
export const vectorStore = new CampusVectorStore();
