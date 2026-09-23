// CTG Click Shop CRM — Service Worker
// আগের sw.js ভাঙা ছিল (শুধু কিছু ড্যাশ), তাই কোনো ক্যাশ হতো না এবং প্রতিবার
// ৯৪০KB পুরো ফাইল আবার নামত — ধীর লাইনে যাতে ৭৬ সেকেন্ড লাগত।
// কৌশল: stale-while-revalidate — ক্যাশ থেকে সাথে সাথে দেখানো হয়, পেছনে নতুন
// ভার্সন নামে। নতুন ভার্সন এলে পেজকে জানানো হয়, নিজে থেকে বদলে দেওয়া হয় না।
var CACHE = 'ctg-crm-v1';
var SHELL = ['./', './index.html', './manifest.json', './ctg_strategy_hub.js'];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      return Promise.all(SHELL.map(function(u){
        return c.add(new Request(u, {cache:'reload'})).catch(function(){});
      }));
    })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ return k===CACHE ? null : caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

function sameOrigin(url){
  try{ return new URL(url, self.location.href).origin === self.location.origin; }
  catch(e){ return false; }
}

self.addEventListener('fetch', function(e){
  var req = e.request;
  if(req.method !== 'GET') return;
  if(!sameOrigin(req.url)) return;                 // Firebase/CDN স্পর্শ করা হয় না
  if(req.url.indexOf('/__') >= 0) return;

  e.respondWith(
    caches.open(CACHE).then(function(cache){
      return cache.match(req, {ignoreSearch:true}).then(function(hit){
        var net = fetch(req).then(function(res){
          if(res && res.status === 200 && res.type === 'basic'){
            var copy = res.clone();
            cache.put(req, copy).catch(function(){});
            // ক্যাশে কিছু ছিল, আর নতুনটা আলাদা — মালিককে জানানো হয়
            if(hit){
              Promise.all([hit.clone().text(), res.clone().text()]).then(function(t){
                if(t[0] !== t[1]){
                  self.clients.matchAll().then(function(cl){
                    cl.forEach(function(c){ c.postMessage({type:'CTG_UPDATE_READY'}); });
                  });
                }
              }).catch(function(){});
            }
          }
          return res;
        }).catch(function(){ return hit; });
        return hit || net;                          // ক্যাশ থাকলে সাথে সাথেই
      });
    })
  );
});
