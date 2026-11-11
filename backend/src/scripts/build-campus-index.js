import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getEmbedding, isValidVector } from '../services/embeddingService.js';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KNOWLEDGE_PATH = path.resolve(__dirname, '../data/campus_knowledge.json');
const STORE_PATH = path.resolve(__dirname, '../data/campus_vector_store.json');

export async function buildCampusIndex() {
  console.log('[IndexBuilder] Reading campus knowledge baseline from:', KNOWLEDGE_PATH);
  if (!fs.existsSync(KNOWLEDGE_PATH)) {
    throw new Error(`Knowledge file not found at ${KNOWLEDGE_PATH}`);
  }

  const raw = fs.readFileSync(KNOWLEDGE_PATH, 'utf-8');
  const items = JSON.parse(raw);
  console.log(`[IndexBuilder] Found ${items.length} knowledge entries to index.`);

  const records = [];
  let expectedModel = null;
  let expectedDim = null;

  for (const item of items) {
    const textToEmbed = `${item.title}. ${item.content} Relevant tags: ${(item.tags || []).join(', ')}`;
    const { vector, dimension, model } = await getEmbedding(textToEmbed);

    if (!isValidVector(vector)) {
      throw new Error(`Generated invalid vector for item ID: ${item.id}`);
    }

    if (!expectedModel) {
      expectedModel = model;
      expectedDim = dimension;
    } else {
      if (model !== expectedModel || dimension !== expectedDim) {
        throw new Error(
          `Embedding model/dimension mismatch during index build! Expected ${expectedModel} (${expectedDim}d), but got ${model} (${dimension}d)`
        );
      }
    }

    records.push({
      id: item.id,
      category: item.category,
      title: item.title,
      content: item.content,
      source: item.source,
      tags: item.tags || [],
      embedding: vector,
      dimension: dimension
    });

    console.log(`[IndexBuilder] Indexed ${item.id} [${item.category}] -> ${dimension}d (${model})`);
  }

  const storePayload = {
    schemaVersion: '1.0.0',
    indexedAt: new Date().toISOString(),
    embeddingModel: expectedModel,
    embeddingDimensions: expectedDim,
    totalDocuments: records.length,
    documents: records
  };

  fs.writeFileSync(STORE_PATH, JSON.stringify(storePayload, null, 2), 'utf-8');
  console.log(`[IndexBuilder] Successfully generated campus vector store: ${STORE_PATH}`);
  console.log(`[IndexBuilder] Model: ${expectedModel} | Dimension: ${expectedDim} | Docs: ${records.length}`);
  return storePayload;
}

// Allow direct CLI execution: node backend/src/scripts/build-campus-index.js
if (process.argv[1] && process.argv[1].endsWith('build-campus-index.js')) {
  buildCampusIndex()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('[IndexBuilder] Error building index:', err.message);
      process.exit(1);
    });
}
