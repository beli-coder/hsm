// Media API: POST upload, GET by ID, GET list, DELETE

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

// GET /api/media/:id — serve a stored image
// GET /api/media — list all media items
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const segments = url.pathname.split('/').filter(Boolean); // ['api', 'media', ...id]

  if (segments.length >= 3) {
    // Serve specific media file
    const id = segments.slice(2).join('/');
    const meta = await env.CMS.get(`media:meta:${id}`, 'json');
    if (!meta) {
      return new Response('Not found', { status: 404 });
    }
    const data = await env.CMS.get(`media:data:${id}`, 'arrayBuffer');
    if (!data) {
      return new Response('Not found', { status: 404 });
    }
    return new Response(data, {
      status: 200,
      headers: {
        'Content-Type': meta.type,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  }

  // List all media
  const list = await env.CMS.list({ prefix: 'media:meta:' });
  const items = [];
  for (const key of list.keys) {
    const meta = await env.CMS.get(key.name, 'json');
    if (meta) {
      items.push({
        id: key.name.replace('media:meta:', ''),
        ...meta,
      });
    }
  }
  return json({ items }, 200);
}

// POST /api/media — upload a new image
export async function onRequestPost(context) {
  const { request, env } = context;

  const contentType = request.headers.get('Content-Type') || '';

  if (contentType.includes('multipart/form-data')) {
    // Handle file upload
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return json({ error: 'No file provided' }, 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return json({ error: 'File too large. Maximum 2 MB.' }, 400);
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return json({ error: 'File type not allowed. Use JPEG, PNG, GIF, WebP, or SVG.' }, 400);
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const buffer = await file.arrayBuffer();

    // Store file data and metadata separately
    await env.CMS.put(`media:data:${id}`, buffer);
    await env.CMS.put(`media:meta:${id}`, JSON.stringify({
      name: sanitizeFilename(file.name),
      type: file.type,
      size: file.size,
      uploaded: new Date().toISOString(),
    }));

    return json({
      ok: true,
      id,
      url: `/api/media/${id}`,
    }, 201);
  }

  // Handle URL-based image reference
  if (contentType.includes('application/json')) {
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON' }, 400);
    }

    if (!body.url || typeof body.url !== 'string') {
      return json({ error: 'URL required' }, 400);
    }

    // Validate URL format
    try {
      new URL(body.url);
    } catch {
      return json({ error: 'Invalid URL format' }, 400);
    }

    const id = `url-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await env.CMS.put(`media:meta:${id}`, JSON.stringify({
      name: body.name || 'External Image',
      type: 'external',
      url: body.url,
      uploaded: new Date().toISOString(),
    }));

    return json({
      ok: true,
      id,
      url: body.url,
    }, 201);
  }

  return json({ error: 'Unsupported content type' }, 400);
}

// DELETE /api/media/:id
export async function onRequestDelete(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const segments = url.pathname.split('/').filter(Boolean);

  if (segments.length < 3) {
    return json({ error: 'Media ID required' }, 400);
  }

  const id = segments.slice(2).join('/');
  await env.CMS.delete(`media:meta:${id}`);
  await env.CMS.delete(`media:data:${id}`);

  return json({ ok: true }, 200);
}

// --- Helpers ---

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
}
