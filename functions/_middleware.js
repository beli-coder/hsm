// Middleware: CORS headers + authentication guard for API routes.

async function verifySession(request, env) {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/(?:^|;\s*)cms_session=([^\s;]+)/);
  if (!match) return null;

  const token = match[1];
  const session = await env.CMS.get(`session:${token}`, 'json');
  if (!session) return null;

  // Check expiry (24 hours)
  if (Date.now() > session.expires) {
    await env.CMS.delete(`session:${token}`);
    return null;
  }
  return session;
}

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // --- Protect admin page ---
  if (path === '/admin' || path === '/admin.html') {
    // Let the static file through; auth is checked client-side via /api/auth GET
    return await next();
  }

  // --- API routes ---
  if (path.startsWith('/api/')) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request),
      });
    }

    // Public endpoints (no auth required)
    const isAuthLogin = path === '/api/auth' && request.method === 'POST';
    const isAuthCheck = path === '/api/auth' && request.method === 'GET';
    const isContentRead = path === '/api/content' && request.method === 'GET';
    const isMediaRead = path.startsWith('/api/media/') && request.method === 'GET';

    if (!isAuthLogin && !isAuthCheck && !isContentRead && !isMediaRead) {
      // Require authentication
      const session = await verifySession(request, env);
      if (!session) {
        return jsonResponse({ error: 'Unauthorized' }, 401, request);
      }
      // Verify origin to prevent CSRF
      const origin = request.headers.get('Origin');
      const requestUrl = new URL(request.url);
      if (origin && new URL(origin).host !== requestUrl.host) {
        return jsonResponse({ error: 'Invalid origin' }, 403, request);
      }
    }

    // Continue to the API handler
    const response = await next();

    // Add CORS headers to response
    const newHeaders = new Headers(response.headers);
    for (const [k, v] of Object.entries(corsHeaders(request))) {
      newHeaders.set(k, v);
    }
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  }

  // Non-API routes: pass through to static assets
  return await next();
}

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };
}

function jsonResponse(data, status, request) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(request),
    },
  });
}
