// Netlify serverless function — handles Google OAuth token exchange & refresh
// Environment variables needed (set in Netlify dashboard):
//   GOOGLE_CLIENT_ID     — your OAuth client ID
//   GOOGLE_CLIENT_SECRET — your OAuth client secret

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': 'https://sunny-archer-es.github.io',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { action, code, redirect_uri, refresh_token } = body;
  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server not configured' }) };
  }

  try {
    // ── ACTION: exchange code for tokens (first sign-in) ──────────────────
    if (action === 'exchange') {
      if (!code || !redirect_uri) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing code or redirect_uri' }) };
      }

      const params = new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri,
        grant_type: 'authorization_code',
      });

      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      const data = await res.json();

      if (!res.ok) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: data.error_description || 'Exchange failed' }) };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_in: data.expires_in,
        }),
      };
    }

    // ── ACTION: refresh access token using stored refresh token ───────────
    if (action === 'refresh') {
      if (!refresh_token) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing refresh_token' }) };
      }

      const params = new URLSearchParams({
        refresh_token,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'refresh_token',
      });

      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      const data = await res.json();

      if (!res.ok) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: data.error_description || 'Refresh failed' }) };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          access_token: data.access_token,
          expires_in: data.expires_in,
        }),
      };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown action' }) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
