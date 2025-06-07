/**
 * Service Worker for Hydraulic Flatbed Truck Service
 * خدمة العمل في الخلفية لموقع سطحة هيدروليك
 */

const CACHE_NAME = 'hydraulic-flatbed-v1.0.0';
const STATIC_CACHE = 'static-cache-v1.0.0';
const DATA_CACHE = 'data-cache-v1.0.0';

// ملفات مهمة للتخزين المؤقت
const CORE_FILES = [
  '/',
  '/index.html',
  '/css/main.css',
  '/js/main.js',
  '/js/protection.js',
  '/js/pwa.js',
  '/manifest.json'
];

// ملفات البيانات
const DATA_FILES = [
  '/data/site.json',
  '/data/services.json',
  '/data/buttons.json',
  '/data/footer.json'
];

// ملفات خارجية مهمة
const EXTERNAL_FILES = [
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css'
];

// ==================== Install Event ====================
self.addEventListener('install', function(event) {
  console.log('📦 Service Worker: Installing');
  
  event.waitUntil(
    Promise.all([
      // تخزين الملفات الأساسية
      caches.open(STATIC_CACHE).then(function(cache) {
        console.log('📂 Caching core files');
        return cache.addAll([...CORE_FILES, ...EXTERNAL_FILES]);
      }),
      
      // تخزين ملفات البيانات
      caches.open(DATA_CACHE).then(function(cache) {
        console.log('📊 Caching data files');
        return cache.addAll(DATA_FILES);
      })
    ]).then(function() {
      console.log('✅ Service Worker: Installation complete');
      // تفعيل Service Worker فوراً
      self.skipWaiting();
    }).catch(function(error) {
      console.error('❌ Service Worker: Installation failed', error);
    })
  );
});

// ==================== Activate Event ====================
self.addEventListener('activate', function(event) {
  console.log('🔄 Service Worker: Activating');
  
  event.waitUntil(
    Promise.all([
      // تنظيف الذاكرة المؤقتة القديمة
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DATA_CACHE && 
                cacheName !== CACHE_NAME) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // السيطرة على جميع النوافذ المفتوحة
      self.clients.claim()
    ]).then(function() {
      console.log('✅ Service Worker: Activation complete');
      
      // إرسال رسالة للعميل
      self.clients.matchAll().then(function(clients) {
        clients.forEach(function(client) {
          client.postMessage({
            type: 'SW_ACTIVATED',
            message: 'Service Worker activated successfully'
          });
        });
      });
    })
  );
});

// ==================== Fetch Event ====================
self.addEventListener('fetch', function(event) {
  const requestUrl = new URL(event.request.url);
  
  // استراتيجية مختلفة حسب نوع الطلب
  if (requestUrl.pathname.startsWith('/data/')) {
    // ملفات البيانات - Network First مع Cache Fallback
    event.respondWith(handleDataRequest(event.request));
  } else if (requestUrl.pathname.includes('.')) {
    // الملفات الثابتة - Cache First مع Network Fallback
    event.respondWith(handleStaticRequest(event.request));
  } else {
    // الصفحات - Network First مع Cache Fallback
    event.respondWith(handlePageRequest(event.request));
  }
});

// ==================== Request Handlers ====================

// معالج ملفات البيانات - البيانات المحدثة أولاً
async function handleDataRequest(request) {
  try {
    // محاولة الحصول على بيانات جديدة
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // تحديث الذاكرة المؤقتة
      const cache = await caches.open(DATA_CACHE);
      await cache.put(request, networkResponse.clone());
      
      // إرسال إشعار للعميل
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'DATA_UPDATED',
            url: request.url
          });
        });
      });
      
      return networkResponse;
    }
  } catch (error) {
    console.warn('⚠️ Network failed for data request:', request.url);
  }
  
  // في حالة فشل الشبكة، استخدم الذاكرة المؤقتة
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // إذا لم توجد في الذاكرة المؤقتة، إرجاع استجابة افتراضية
  return new Response(JSON.stringify({
    error: 'No data available',
    message: 'البيانات غير متاحة حالياً'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// معالج الملفات الثابتة - الذاكرة المؤقتة أولاً
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // التحقق من التحديثات في الخلفية
    updateCacheInBackground(request);
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // تخزين في الذاكرة المؤقتة
      const cache = await caches.open(STATIC_CACHE);
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Failed to fetch static resource:', request.url);
    
    // إرجاع صفحة خطأ مخصصة
    if (request.destination === 'document') {
      return caches.match('/index.html');
    }
    
    return new Response('Resource not available offline', { status: 503 });
  }
}

// معالج الصفحات - الشبكة أولاً
async function handlePageRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // تحديث الذاكرة المؤقتة
      const cache = await caches.open(STATIC_CACHE);
      await cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.warn('⚠️ Network failed for page request:', request.url);
  }
  
  // استخدام الذاكرة المؤقتة أو الصفحة الرئيسية
  const cachedResponse = await caches.match(request);
  return cachedResponse || caches.match('/index.html');
}

// تحديث الذاكرة المؤقتة في الخلفية
async function updateCacheInBackground(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      await cache.put(request, networkResponse);
      
      console.log('🔄 Updated cache for:', request.url);
    }
  } catch (error) {
    // تجاهل أخطاء التحديث في الخلفية
  }
}

// ==================== Background Sync ====================
self.addEventListener('sync', function(event) {
  console.log('🔄 Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    console.log('🔄 Performing background sync');
    
    // تحديث البيانات المهمة
    const dataPromises = DATA_FILES.map(file => fetch(file));
    await Promise.allSettled(dataPromises);
    
    // إرسال إشعار للعميل
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'BACKGROUND_SYNC_COMPLETE',
          message: 'تم تحديث البيانات في الخلفية'
        });
      });
    });
    
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

// ==================== Push Notifications ====================
self.addEventListener('push', function(event) {
  console.log('📨 Push notification received');
  
  const options = {
    body: 'لديك إشعار جديد من سطحة هيدروليك',
    icon: '/assets/icon-192.png',
    badge: '/assets/badge-72.png',
    tag: 'hydraulic-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'فتح التطبيق',
        icon: '/assets/action-open.png'
      },
      {
        action: 'dismiss',
        title: 'إغلاق',
        icon: '/assets/action-close.png'
      }
    ],
    data: {
      url: '/',
      timestamp: Date.now()
    },
    lang: 'ar',
    dir: 'rtl'
  };
  
  let title = 'سطحة هيدروليك';
  
  if (event.data) {
    try {
      const data = event.data.json();
      title = data.title || title;
      options.body = data.body || options.body;
      options.data.url = data.url || options.data.url;
    } catch (error) {
      console.error('❌ Failed to parse push data:', error);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ==================== Notification Click ====================
self.addEventListener('notificationclick', function(event) {
  console.log('🔔 Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // البحث عن نافذة مفتوحة
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // فتح نافذة جديدة
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

// ==================== Message Handler ====================
self.addEventListener('message', function(event) {
  console.log('📩 Message received:', event.data);
  
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
        
      case 'GET_VERSION':
        event.source.postMessage({
          type: 'VERSION',
          version: CACHE_NAME
        });
        break;
        
      case 'FORCE_UPDATE':
        handleForceUpdate();
        break;
        
      case 'PERFORMANCE_DATA':
        handlePerformanceData(event.data);
        break;
        
      default:
        console.log('⚠️ Unknown message type:', event.data.type);
    }
  }
});

// معالج التحديث القسري
async function handleForceUpdate() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    
    console.log('🔄 Force update: All caches cleared');
    
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'FORCE_UPDATE_COMPLETE',
          message: 'تم تحديث التطبيق بنجاح'
        });
      });
    });
    
  } catch (error) {
    console.error('❌ Force update failed:', error);
  }
}

// معالج بيانات الأداء
function handlePerformanceData(data) {
  console.log('📊 Performance data received:', {
    loadTime: data.loadTime,
    cacheHitRate: calculateCacheHitRate()
  });
}

// حساب معدل إصابة الذاكرة المؤقتة
function calculateCacheHitRate() {
  // سيتم تطبيق هذا لاحقاً مع إحصائيات أكثر تفصيلاً
  return 'N/A';
}

// ==================== Error Handling ====================
self.addEventListener('error', function(event) {
  console.error('❌ Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', function(event) {
  console.error('❌ Service Worker unhandled rejection:', event.reason);
});

// ==================== Utility Functions ====================

// تنظيف الذاكرة المؤقتة القديمة
function cleanupOldCaches() {
  return caches.keys().then(function(cacheNames) {
    return Promise.all(
      cacheNames.map(function(cacheName) {
        if (cacheName !== STATIC_CACHE && 
            cacheName !== DATA_CACHE && 
            cacheName !== CACHE_NAME) {
          return caches.delete(cacheName);
        }
      })
    );
  });
}

// التحقق من صحة الاستجابة
function isValidResponse(response) {
  return response && 
         response.status === 200 && 
         response.type === 'basic';
}

console.log('🚀 Service Worker loaded successfully - Version:', CACHE_NAME);