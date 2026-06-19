/**
 * chroma.service.js
 *
 * ChromaDB vector store integration.
 * Node.js calls ChromaDB's REST API via axios — no Python dependency.
 *
 * ChromaDB must be running at CHROMA_URL (default: http://localhost:8001)
 * Start it with: docker compose up chromadb
 *
 * All functions are wrapped in graceful try/catch.
 * If ChromaDB is unavailable, functions return null/empty — the interview
 * flow continues without vector context rather than crashing.
 */

import axios from "axios";

const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:8001";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// ─────────────────────────────────────────────
// EMBEDDING GENERATION via OpenRouter
// ─────────────────────────────────────────────
const generateEmbedding = async (text) => {
  const response = await axios.post(
    "https://openrouter.ai/api/v1/embeddings",
    {
      model: "openai/text-embedding-3-small",
      input: text.slice(0, 8000) // safety limit
    },
    {
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );
  return response.data.data[0].embedding;
};

// ─────────────────────────────────────────────
// GET OR CREATE CHROMADB COLLECTION
// One collection per user, named "user_{userId}"
// ─────────────────────────────────────────────
const getOrCreateCollection = async (userId) => {
  const collectionName = `user_${userId}`;

  try {
    // Try to fetch existing collection
    const getRes = await axios.get(
      `${CHROMA_URL}/api/v1/collections/${collectionName}`,
      { timeout: 5000 }
    );
    return getRes.data.id;
  } catch (err) {
    if (err.response?.status === 404) {
      // Create new collection with cosine similarity
      const createRes = await axios.post(
        `${CHROMA_URL}/api/v1/collections`,
        {
          name: collectionName,
          metadata: { "hnsw:space": "cosine" }
        },
        { timeout: 5000 }
      );
      return createRes.data.id;
    }
    throw err;
  }
};

// ─────────────────────────────────────────────
// UPSERT RESUME CHUNKS INTO CHROMADB
// Called after resume parsing in analyzeResume
// ─────────────────────────────────────────────
export const upsertResumeChunks = async (userId, chunks) => {
  if (!chunks || chunks.length === 0) return;

  try {
    const collectionId = await getOrCreateCollection(userId);

    // Generate embeddings for all chunks in parallel
    const embeddings = await Promise.all(
      chunks.map(c => generateEmbedding(c.content))
    );

    const ids = chunks.map((_, i) => `chunk_${i}`);
    const documents = chunks.map(c => c.content);
    const metadatas = chunks.map(c => ({ section: c.section }));

    await axios.post(
      `${CHROMA_URL}/api/v1/collections/${collectionId}/upsert`,
      { ids, embeddings, documents, metadatas },
      { timeout: 15000 }
    );

    console.log(`[ChromaDB] Upserted ${chunks.length} chunks for user ${userId}`);
  } catch (err) {
    // Non-fatal: log and continue — interview works without vector search
    console.warn(`[ChromaDB] upsertResumeChunks failed (is ChromaDB running?): ${err.message}`);
  }
};

// ─────────────────────────────────────────────
// SEARCH RESUME CONTEXT
// Called before generateQuestion to retrieve relevant resume sections
// Returns top-k most semantically relevant chunks as a single string
// ─────────────────────────────────────────────
export const searchResumeContext = async (userId, query, topK = 3) => {
  try {
    const collectionId = await getOrCreateCollection(userId);
    const queryEmbedding = await generateEmbedding(query);

    const response = await axios.post(
      `${CHROMA_URL}/api/v1/collections/${collectionId}/query`,
      {
        query_embeddings: [queryEmbedding],
        n_results: topK
      },
      { timeout: 10000 }
    );

    const documents = response.data.documents?.[0] || [];
    const metadatas = response.data.metadatas?.[0] || [];

    if (documents.length === 0) return null;

    // Format retrieved chunks with their section labels
    const formatted = documents.map((doc, i) => {
      const section = metadatas[i]?.section || "general";
      return `[${section}] ${doc}`;
    }).join("\n\n");

    console.log(`[ChromaDB] Retrieved ${documents.length} chunks for query: "${query.slice(0, 50)}..."`);
    return formatted;
  } catch (err) {
    // Non-fatal: return null, caller falls back to raw resumeText
    console.warn(`[ChromaDB] searchResumeContext failed: ${err.message}`);
    return null;
  }
};
