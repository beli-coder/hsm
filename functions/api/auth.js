// Auth API: POST (login), GET (check session), DELETE (logout)

export async function onRequestPost(context) {
  const { request, env } = context;

  // Rate limiting: max 10 attempts per IP per 15 minutes
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rateLimitKey = `ratelimit:${ip}`;
  const attempts = parseInt(await env.CMS.get(rateLimitKey) || '0', 10);

  if (attempts >= 10) {
    return json({ error: 'Too many login attempts. Try again later.' }, 429);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }

  const { username, password } = body;
  if (!username || !password) {
    return json({ error: 'Username and password required' }, 400);
  }

  // Verify credentials using constant-time comparison
  // Hardcoded credentials — safe because this code runs server-side on
  // Cloudflare Workers and is never sent to the browser.
  const ADMIN_USERNAME = env.ADMIN_USERNAME || 'admin';
  const ADMIN_PASSWORD = env.ADMIN_PASSWORD || 'ryder';

  const validUser = await timingSafeEqual(username, ADMIN_USERNAME);
  const validPass = await timingSafeEqual(password, ADMIN_PASSWORD);

  if (!validUser || !validPass) {
    // Increment rate limit
    await env.CMS.put(rateLimitKey, String(attempts + 1), { expirationTtl: 900 });
    return json({ error: 'Invalid credentials' }, 401);
  }

  // Clear rate limit on success
  await env.CMS.delete(rateLimitKey);

  // Create session token
  const token = generateToken();
  const session = {
    username,
    created: Date.now(),
    expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };

  await env.CMS.put(`session:${token}`, JSON.stringify(session), {
    expirationTtl: 86400, // KV auto-cleanup after 24h
  });

  return json({ ok: true }, 200, {
    'Set-Cookie': buildCookie('cms_session', token, 86400),
  });
}

export async function onRequestGet(context) {
  const { request, env } = context;

  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/(?:^|;\s*)cms_session=([^\s;]+)/);
  if (!match) {
    return json({ authenticated: false }, 200);
  }

  const token = match[1];
  const session = await env.CMS.get(`session:${token}`, 'json');

  if (!session || Date.now() > session.expires) {
    if (session) await env.CMS.delete(`session:${token}`);
    return json({ authenticated: false }, 200, {
      'Set-Cookie': buildCookie('cms_session', '', 0),
    });
  }

  return json({ authenticated: true, username: session.username }, 200);
}

export async function onRequestDelete(context) {
  const { request, env } = context;

  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/(?:^|;\s*)cms_session=([^\s;]+)/);
  if (match) {
    await env.CMS.delete(`session:${match[1]}`);
  }

  return json({ ok: true }, 200, {
    'Set-Cookie': buildCookie('cms_session', '', 0),
  });
}

// --- Helpers ---

function json(data, status, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

function generateToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function buildCookie(name, value, maxAge) {
  const parts = [
    `${name}=${value}`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=Strict`,
    `Max-Age=${maxAge}`,
  ];
  // Secure flag for production (HTTPS)
  parts.push('Secure');
  return parts.join('; ');
}

async function timingSafeEqual(a, b) {
  const enc = new TextEncoder();
  const aBuf = enc.encode(String(a));
  const bBuf = enc.encode(String(b));

  // Hash both to fixed-length for constant-time comparison
  const aHash = new Uint8Array(await crypto.subtle.digest('SHA-256', aBuf));
  const bHash = new Uint8Array(await crypto.subtle.digest('SHA-256', bBuf));

  if (aHash.length !== bHash.length) return false;
  let result = 0;
  for (let i = 0; i < aHash.length; i++) {
    result |= aHash[i] ^ bHash[i];
  }
  return result === 0;
}
