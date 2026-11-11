import express from 'express';
import { processCampusQuery } from '../services/ragEngine.js';
import { authenticateStudent, getSupabase } from '../services/supabaseService.js';

const router = express.Router();

/**
 * POST /api/chat
 * Canonical Presidency University AI Campus Helpdesk Chat Endpoint
 */
router.post('/chat', authenticateStudent, async (req, res) => {
  try {
    const userMessage = req.body.message || req.body.query || req.body.text;
    const history = req.body.conversationHistory || req.body.history || [];

    if (!userMessage || typeof userMessage !== 'string' || !userMessage.trim()) {
      return res.status(400).json({
        success: false,
        status: 'error',
        error: 'Missing required field: "message" must be a non-empty string.'
      });
    }

    if (userMessage.length > 2000) {
      return res.status(400).json({
        success: false,
        status: 'error',
        error: 'Message length exceeds maximum limit of 2000 characters.'
      });
    }

    const response = await processCampusQuery(
      userMessage.trim(),
      Array.isArray(history) ? history : []
    );

    // If user is authenticated and Supabase is connected, optionally record session/chat
    if (req.user && response.success) {
      try {
        const supabase = await getSupabase();
        if (supabase) {
          // Fire and forget chat logging if chat tables exist
          const sessionId = req.body.sessionId;
          if (sessionId) {
            await supabase.from('chat_messages').insert([
              { session_id: sessionId, user_id: req.user.id, role: 'user', content: userMessage.trim() },
              { session_id: sessionId, user_id: req.user.id, role: 'assistant', content: response.reply }
            ]).catch(() => {});
          }
        }
      } catch (_) {}
    }

    return res.json(response);
  } catch (err) {
    console.error('[Chat Route] Unexpected error:', err);
    return res.status(500).json({
      success: false,
      status: 'error',
      reply: 'An internal error occurred while processing your query. Please try again.',
      category: 'general',
      grounded: false,
      sources: []
    });
  }
});

export default router;
