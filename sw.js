const V='cc-v7';
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(['./index.html','./icon.png']).catch(()=>{})));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{if(r&&r.status===200){const cl=r.clone();caches.open(V).then(x=>x.put(e.request,cl))}return r}).catch(()=>caches.match('./index.html'))))});
self.addEventListener('push',e=>{const d=e.data?e.data.json():{title:'CraftCost Pro',body:'إشعار جديد'};e.waitUntil(self.registration.showNotification(d.title,{body:d.body,icon:'./icon.png',badge:'./icon.png',dir:'rtl',lang:'ar'}))});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window'}).then(l=>{for(const c of l)if('focus'in c)return c.focus();return clients.openWindow('./')}))});
