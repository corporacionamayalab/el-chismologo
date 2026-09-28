/* ============================================================
   Service Worker — Chismólogo
   Estrategia:
   - Estáticos (_next/static, íconos, fuentes, imágenes): Cache-First
   - Navegación HTML: Network-First con fallback offline
   - Supabase REST: Network-First (NO cachear)
   - Supabase Realtime (WebSocket): NO interceptar
   - /ymix34 (admin): NO cachear NUNCA
   - /api/*: NO cachear NUNCA
   ============================================================ */

const VERSION = 'chismologo-v1.0.0';
const STATIC_CACHE = `${VERSION}-static`;
const PAGES_CACHE = `${VERSION}-pages`;
const OFFLINE_URL = '/offline';

/* Recursos precargados al instalar */
const PRECACHE_URLS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

/* ---------- INSTALL ---------- */
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      await cache.addAll(PRECACHE_URLS).catch(() => {});
      self.skipWaiting();
    })()
  );
});

/* ---------- ACTIVATE ---------- */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => !k.startsWith(VERSION))
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

/* ---------- HELPERS ---------- */
function isAdmin(url) {
  return url.pathname.startsWith('/ymix34');
}

function isApi(url) {
  return url.pathname.startsWith('/api/');
}

function isSupabase(url) {
  return url.hostname.includes('supabase.co');
}

function isSupabaseRealtime(url) {
  return url.protocol === 'wss:' || url.pathname.includes('/realtime/');
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/screenshots/') ||
    /\.(?:css|js|woff2?|ttf|otf|png|jpg|jpeg|svg|webp|gif|ico)$/i.test(url.pathname)
  );
}

function isNavigation(request) {
  return request.mode === 'navigate';
}

/* ---------- FETCH ---------- */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo GET
  if (request.method !== 'GET') return;

  // WebSocket / Realtime → dejar pasar
  if (isSupabaseRealtime(url)) return;

  // Admin → NUNCA cachear
  if (isAdmin(url)) return;

  // API → NUNCA cachear
  if (isApi(url)) return;

  // Supabase REST → red, sin cachear
  if (isSupabase(url)) {
    event.respondWith(fetch(request));
    return;
  }

  // Estáticos → Cache-First
  if (isStaticAsset(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const response = await fetch(request);
          if (response.ok) cache.put(request, response.clone());
          return response;
        } catch {
          return cached || Response.error();
        }
      })()
    );
    return;
  }

  // Navegación → Network-First + fallback offline
  if (isNavigation(request)) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          const cache = await caches.open(PAGES_CACHE);
          if (response.ok) cache.put(request, response.clone());
          return response;
        } catch {
          const cache = await caches.open(PAGES_CACHE);
          const cached = await cache.match(request);
          if (cached) return cached;
          const offline = await caches.match(OFFLINE_URL);
          return offline || new Response('Sin conexión', { status: 503 });
        }
      })()
    );
    return;
  }

  // Resto → red normal
  event.respondWith(fetch(request).catch(() => caches.match(request)));
});

/* ---------- MENSAJES (forzar update) ---------- */
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});