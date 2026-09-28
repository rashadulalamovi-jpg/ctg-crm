// CTG Click Shop CRM — Service Worker
//
// Build-65 — সবচেয়ে গুরুত্বপূর্ণ সংশোধন: নতুন ভার্সন সত্যিই পৌঁছাবে।
//
// আগের ভুল: প্রতিটি আলাদা URL (?v=b62, ?v=b64 …) ক্যাশে আলাদা এন্ট্রি হিসেবে
// জমা হতো, কিন্তু পড়ার সময় {ignoreSearch:true} দিয়ে প্রথম মিলটাই ফেরত যেত —
// অর্থাৎ সেই একেবারে প্রথম দিনের কপিটাই। ফলে মালিক যতবারই রিফ্রেশ করুন,
// পুরনো কোডই চলত, আর "ঠিক করেছি" বলা ফিচার/ফিক্স তাঁর কাছে পৌঁছাত না।
//
// এখন: পেজের জন্য একটি মাত্র ক্যাশ-কী (INDEX_KEY)। নতুন কপি এলে সেই একই
// কী-তেই বসে, তাই পরের রিফ্রেশে নতুনটাই যায় — পুরনো কপি আর জমে থাকে না।
var CACHE = 'ctg-crm-v3';
var INDEX_KEY = './index.html';
var SHELL = ['./index.html', './manifest.json', './ctg_strategy_hub.js'];

self.addEventListener('install', function(e){
  self.skipWaiting();                               // নতুন SW অপেক্ষায় বসে থাকবে না
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

self.addEventListener('message', function(e){
  // পেজ "এখনই আপডেট" চাইলে পুরো ক্যাশ ফেলে দেওয়া হয়
  if(e.data && e.data.type === 'CTG_FORCE_UPDATE'){
    e.waitUntil(caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ return caches.delete(k); }));
    }).then(function(){
      return self.clients.matchAll().then(function(cl){
        cl.forEach(function(c){ c.postMessage({type:'CTG_CACHE_CLEARED'}); });
      });
    }));
  }
});

function sameOrigin(url){
  try{ return new URL(url, self.location.href).origin === self.location.origin; }
  catch(e){ return false; }
}
// পেজের অনুরোধ কিনা — ?v=... যাই থাকুক, সবই একই জিনিস
function isPageRequest(req){
  if(req.mode === 'navigate') return true;
  try{
    var p = new URL(req.url, self.location.href).pathname;
    return p.slice(-1) === '/' || p.slice(-11) === '/index.html';
  }catch(e){ return false; }
}

self.addEventListener('fetch', function(e){
  var req = e.request;
  if(req.method !== 'GET') return;
  if(!sameOrigin(req.url)) return;                  // Firebase/CDN স্পর্শ করা হয় না
  if(req.url.indexOf('/__') >= 0) return;

  var page = isPageRequest(req);
  var key  = page ? INDEX_KEY : req;                // পেজ হলে সবসময় একই কী

  e.respondWith(
    caches.open(CACHE).then(function(cache){
      return cache.match(key).then(function(hit){
        var net = fetch(req).then(function(res){
          if(res && res.status === 200 && res.type === 'basic'){
            var copy = res.clone();
            cache.put(key, copy).catch(function(){});   // একই কী — পুরনোটা বদলে যায়
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
