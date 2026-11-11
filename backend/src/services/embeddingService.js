import dotenv from 'dotenv';
dotenv.config();

/**
 * Deterministic string hash for token hashing
 */
function hashToken(str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

/**
 * Generate normalized deterministic 384-dimensional embedding vector
 */
export function createLocalEmbedding(text, dimensions = 384) {
  const vector = new Float32Array(dimensions);
  if (!text) return Array.from(vector);

  const cleanText = String(text).toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const tokens = cleanText.split(/\s+/).filter(t => t.length > 1);

  // Bag of n-grams (1-grams and 2-grams)
  const ngrams = [...tokens];
  for (let i = 0; i < tokens.length - 1; i++) {
    ngrams.push(`${tokens[i]}_${tokens[i + 1]}`);
  }

  for (const token of ngrams) {
    const hash = hashToken(token);
    const index = Math.abs(hash) % dimensions;
    const sign = (hash & 1) === 0 ? 1 : -1;
    vector[index] += sign;
  }

  // L2 Normalization
  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);

  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] /= norm;
    }
  }

  return Array.from(vector);
}

/**
 * Validates that an array contains only finite numbers
 */
export function isValidVector(vec) {
  return Array.isArray(vec) && vec.length > 0 && vec.every(n => typeof n === 'number' && Number.isFinite(n));
}

/**
 * Get embedding for a text string.
 * Supports:
 * 1. HuggingFace Qwen feature-extraction if token configured
 * 2. External OpenAI-compatible embedding API if configured
 * 3. Deterministic local-hash-v1 (384-dim) fallback
 */
export async function getEmbedding(text, targetModel = null) {
  const cleanText = String(text || '').trim();
  const timeoutMs = parseInt(process.env.EMBEDDING_TIMEOUT_MS, 10) || 12000;

  // 1. Check HuggingFace Qwen
  const hfToken = process.env.QWEN_HF_TOKEN || process.env.HF_TOKEN;
  const embeddingModelName = process.env.EMBEDDING_MODEL_NAME || 'Qwen/Qwen3-Embedding-0.6B';

  if (hfToken && (!targetModel || targetModel === embeddingModelName)) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const { HfInference } = await import('@huggingface/inference');
      const hf = new HfInference(hfToken);
      const res = await hf.featureExtraction({
        model: embeddingModelName,
        inputs: cleanText
      });
      clearTimeout(timeout);
      let vec = res;
      if (Array.isArray(res) && Array.isArray(res[0])) {
        vec = res[0];
      }
      if (isValidVector(vec)) {
        return {
          vector: vec,
          dimension: vec.length,
          model: embeddingModelName
        };
      }
    } catch (err) {
      clearTimeout(timeout);
      console.warn('[Embedding] HuggingFace inference failed or timed out:', err.message);
    }
  }

  // 2. Check external compatible embedding URL
  const embeddingUrl = process.env.EMBEDDING_API_URL;
  const apiKey = process.env.EMBEDDING_API_KEY;

  if (embeddingUrl) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(embeddingUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
        },
        body: JSON.stringify({
          model: embeddingModelName,
          input: cleanText
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (response.ok) {
        const data = await response.json();
        const vec = data?.data?.[0]?.embedding;
        if (isValidVector(vec)) {
          return {
            vector: vec,
            dimension: vec.length,
            model: embeddingModelName
          };
        }
      }
    } catch (err) {
      clearTimeout(timeout);
      console.warn('[Embedding] External embedding API error:', err.message);
    }
  }

  // 3. Fallback to deterministic local vectorizer
  const localVec = createLocalEmbedding(cleanText, 384);
  return {
    vector: localVec,
    dimension: 384,
    model: 'local-hash-v1'
  };
}

/**
 * Cosine similarity between two vectors
 */
export function cosineSimilarity(vecA, vecB) {
  if (!Array.isArray(vecA) || !Array.isArray(vecB) || vecA.length !== vecB.length || vecA.length === 0) {
    return 0;
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA <= 0 || normB <= 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
