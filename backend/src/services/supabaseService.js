import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, '');
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

export async function getSupabase() {
  if (!supabaseUrl || !supabaseKey) return null;

  return {
    url: supabaseUrl,
    key: supabaseKey,
    from: (table) => ({
      select: () => ({
        eq: (col, val) => ({
          single: async () => ({ data: null, error: null }),
          order: () => Promise.resolve({ data: [], error: null })
        })
      }),
      insert: async () => ({ error: null }),
      upsert: () => ({
        select: () => ({
          single: async () => ({ data: null, error: null })
        })
      }),
      delete: () => ({
        eq: () => ({
          eq: () => Promise.resolve({ error: null })
        })
      })
    }),
    auth: {
      getUser: async (token) => {
        try {
          const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'apikey': supabaseKey
            }
          });
          if (res.ok) {
            const user = await res.json();
            return { data: { user }, error: null };
          }
          return { data: { user: null }, error: new Error('Invalid token') };
        } catch (err) {
          return { data: { user: null }, error: err };
        }
      }
    }
  };
}

/**
 * Middleware to authenticate requests via Supabase Bearer token
 */
export async function authenticateStudent(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  const supabase = await getSupabase();

  if (!supabase) {
    req.user = null;
    return next();
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      req.user = null;
    } else {
      req.user = user;
    }
  } catch (err) {
    console.warn('[Auth Middleware] Token validation error:', err.message);
    req.user = null;
  }

  next();
}
