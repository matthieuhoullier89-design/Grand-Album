/* Le Grand Album Napoléon : garde l'application en mémoire pour qu'elle s'ouvre vite et même sans réseau.
   À chaque ouverture, la page est d'abord demandée au site : si une nouvelle version existe, elle s'affiche tout de suite.
   Sans réseau (ou si le site ne répond pas en 4 secondes), c'est la copie gardée qui s'ouvre. */
const CACHE="grand-album-2";
const FICHIERS=["./","./manifest.webmanifest","./icon-192.png","./icon-512.png","./icon-maskable-512.png","./apple-touch-icon.png"];
self.addEventListener("install",e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FICHIERS)).then(()=>self.skipWaiting())); });
self.addEventListener("activate",e=>{ e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim())); });
self.addEventListener("fetch",e=>{
  const req=e.request; if(req.method!=="GET"||new URL(req.url).origin!==self.location.origin) return;
  if(req.mode==="navigate"){
    let garde=null;
    const reseau=fetch(req,{cache:"no-cache"}).then(res=>{ if(res&&res.ok){ const c=res.clone(); garde=caches.open(CACHE).then(x=>x.put("./",c)); } return res; });
    e.waitUntil(reseau.then(()=>garde).catch(()=>{}));
    const delai=new Promise(ok=>setTimeout(()=>ok(null),4000));
    e.respondWith(Promise.race([reseau.catch(()=>null),delai]).then(r=>r||caches.match("./")).then(r=>r||reseau));
    return;
  }
  const maj=caches.open(CACHE).then(c=>fetch(req,{cache:"no-cache"}).then(res=>res&&res.ok&&res.type==="basic"?c.put(req,res.clone()).then(()=>res):res));
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(hit=>hit||maj));
  e.waitUntil(maj.catch(()=>{}));
});
