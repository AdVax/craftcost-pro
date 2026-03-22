// CraftCost Pro — Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            'AIzaSyDf1IiEsPJkVtcmRh7f8q5cIRYsxcO9IOc',
  authDomain:        'craftcost-pro.firebaseapp.com',
  projectId:         'craftcost-pro',
  storageBucket:     'craftcost-pro.firebasestorage.app',
  messagingSenderId: '353878742494',
  appId:             '1:353878742494:web:0f86d126c25f1c3d3c794f'
});

const messaging = firebase.messaging();

// Background push notifications
messaging.onBackgroundMessage(payload => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || 'CraftCost Pro', {
    body:  body || 'لديك إشعار جديد',
    icon:  './icon.png',
    badge: './icon.png',
    dir:   'rtl',
    lang:  'ar'
  });
});

// Notification click
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({type:'window',includeUncontrolled:true}).then(list => {
      for(const c of list) if('focus' in c) return c.focus();
      return clients.openWindow('./');
    })
  );
});

// App shell cache
const CACHE = 'cc-v3';
self.addEventListener('install',  e => { e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./index.html','./icon.png']).catch(()=>{})));self.skipWaiting() });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))));self.clients.claim() });
self.addEventListener('fetch',    e => { if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{if(r&&r.status===200){const cl=r.clone();caches.open(CACHE).then(x=>x.put(e.request,cl))}return r}).catch(()=>caches.match('./index.html')))) });
