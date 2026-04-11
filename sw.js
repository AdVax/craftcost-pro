/**
 * CraftCost Pro — Service Worker
 * الإصدار: 3.0 (Offline-First)
 * الاستراتيجية: Cache First مع Stale-While-Revalidate للموارد الخارجية
 */

const CACHE_VERSION = 'craftcost-v3';
const STATIC_CACHE  = `${CACHE_VERSION}-static`;
const FONTS_CACHE   = `${CACHE_VERSION}-fonts`;

// ============================================================
// الموارد الأساسية — يجب تخزينها عند التثبيت
// ============================================================
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-512x512.png',
  './apple-touch-icon.png',
];

// ============================================================
// الموارد الخارجية (الخطوط + الأيقونات)
// نخزّنها بعد أول تحميل ناجح
// ============================================================
const EXTERNAL_ORIGINS = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://cdnjs.cloudflare.com',
];

// ============================================================
// حدث التثبيت — تخزين الملفات الأساسية فوراً
// ============================================================
self.addEventListener('install', (event) => {
  console.log('[SW] تثبيت الإصدار:', CACHE_VERSION);

  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      // تفعيل هذا الإصدار فوراً دون انتظار إغلاق التبويبات القديمة
      return self.skipWaiting();
    })
  );
});

// ============================================================
// حدث التفعيل — حذف الكاشات القديمة
// ============================================================
self.addEventListener('activate', (event) => {
  console.log('[SW] تفعيل الإصدار:', CACHE_VERSION);

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('craftcost-') && name !== STATIC_CACHE && name !== FONTS_CACHE)
          .map((name) => {
            console.log('[SW] حذف كاش قديم:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      // التحكم الفوري في جميع الصفحات المفتوحة
      return self.clients.claim();
    })
  );
});

// ============================================================
// حدث الطلبات — القلب الرئيسي للـ Service Worker
// ============================================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // تجاهل الطلبات غير HTTP/HTTPS
  if (!request.url.startsWith('http')) return;

  // ============================================================
  // استراتيجية 1: الموارد الخارجية (خطوط + أيقونات)
  // Stale-While-Revalidate — نعطي الكاش أولاً، ونحدّث في الخلفية
  // ============================================================
  const isExternal = EXTERNAL_ORIGINS.some((origin) => request.url.startsWith(origin));
  if (isExternal) {
    event.respondWith(staleWhileRevalidate(request, FONTS_CACHE));
    return;
  }

  // ============================================================
  // استراتيجية 2: الملفات المحلية (HTML, PNG, الأصول)
  // Cache First — نعطي الكاش أولاً، وإن لم يوجد نذهب للشبكة
  // ============================================================
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }
});

// ============================================================
// دالة: Cache First
// المنطق: كاش → شبكة → حفظ في الكاش
// ============================================================
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    return cached; // ✅ من الكاش — يعمل بدون إنترنت
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      // حفظ نسخة في الكاش للمرة القادمة
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // ❌ لا يوجد كاش ولا شبكة — أعد صفحة الرئيسية كـ fallback
    console.warn('[SW] لا إنترنت، لا كاش لـ:', request.url);
    const fallback = await cache.match('./index.html');
    return fallback || new Response('التطبيق غير متاح حالياً', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

// ============================================================
// دالة: Stale-While-Revalidate
// المنطق: أعطِ الكاش فوراً، وحدّثه في الخلفية من الشبكة
// ============================================================
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  // تحديث الكاش في الخلفية (لا ننتظرها)
  const networkFetch = fetch(request)
    .then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => null); // تجاهل خطأ الشبكة في الخلفية

  // إن وُجد في الكاش → أعده فوراً (لا تنتظر الشبكة)
  return cached || networkFetch;
}

// ============================================================
// استقبال رسائل من الصفحة الرئيسية
// مثال: تحديث الكاش يدوياً، أو الحصول على حالة الإصدار
// ============================================================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }
});
