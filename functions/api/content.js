// Content API: GET (public), PUT (auth required)

export async function onRequestGet(context) {
  const { env } = context;

  const content = await env.CMS.get('content:site', 'json');
  if (!content) {
    return json({ exists: false }, 200);
  }
  return json({ exists: true, data: content }, 200);
}

export async function onRequestPut(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  // Validate the content structure (basic checks)
  if (!body || typeof body !== 'object') {
    return json({ error: 'Content must be an object' }, 400);
  }

  // Sanitize all string values to prevent XSS
  const sanitized = deepSanitize(body);

  await env.CMS.put('content:site', JSON.stringify(sanitized));

  return json({ ok: true }, 200);
}

// --- Helpers ---

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Basic HTML sanitization: strip script tags, event handlers, and dangerous attributes
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/data\s*:\s*text\/html/gi, '');
}

function deepSanitize(obj) {
  if (typeof obj === 'string') return sanitizeString(obj);
  if (Array.isArray(obj)) return obj.map(deepSanitize);
  if (obj && typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[sanitizeString(key)] = deepSanitize(value);
    }
    return result;
  }
  return obj;
}
