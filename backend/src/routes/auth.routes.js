import express from 'express';
import { authenticateStudent, getSupabase } from '../services/supabaseService.js';

const router = express.Router();

/**
 * GET /api/auth/me
 */
router.get('/me', authenticateStudent, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized. Please sign in.'
    });
  }

  const supabase = await getSupabase();
  if (!supabase) {
    return res.json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        user_metadata: req.user.user_metadata
      }
    });
  }

  try {
    const { data: profile } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    return res.json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        profile: profile || req.user.user_metadata || null
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve student profile.' });
  }
});

/**
 * POST /api/auth/profile
 */
router.post('/profile', authenticateStudent, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized. Please sign in.'
    });
  }

  const { full_name, usn } = req.body;
  if (!full_name || !full_name.trim()) {
    return res.status(400).json({ success: false, error: 'Full name is required.' });
  }

  const supabase = await getSupabase();
  if (!supabase) {
    return res.json({
      success: true,
      message: 'Profile updated in local session.',
      profile: { id: req.user.id, full_name, usn, email: req.user.email }
    });
  }

  try {
    const { data, error } = await supabase
      .from('student_profiles')
      .upsert({
        id: req.user.id,
        full_name: full_name.trim(),
        usn: usn ? usn.trim() : null,
        email: req.user.email,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.json({ success: true, profile: data });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to update student profile.' });
  }
});

/**
 * GET /api/chat/sessions
 */
router.get('/sessions', authenticateStudent, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized.' });
  }

  const supabase = await getSupabase();
  if (!supabase) {
    return res.json({ success: true, sessions: [] });
  }

  try {
    const { data: sessions, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return res.json({ success: true, sessions: sessions || [] });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to fetch chat sessions.' });
  }
});

/**
 * DELETE /api/chat/sessions/:id
 */
router.delete('/sessions/:id', authenticateStudent, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized.' });
  }

  const sessionId = req.params.id;
  const supabase = await getSupabase();
  if (!supabase) {
    return res.json({ success: true, message: 'Deleted' });
  }

  try {
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', req.user.id);

    if (error) throw error;
    return res.json({ success: true, message: 'Session deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to delete session.' });
  }
});

export default router;
