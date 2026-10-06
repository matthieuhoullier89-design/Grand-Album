/* Le Grand Album Napoléon : garde l'application en mémoire pour qu'elle s'ouvre vite et sans réseau.
   À chaque ouverture, la copie gardée s'affiche tout de suite ; la nouvelle version, s'il y en a une, est téléchargée en arrière-plan et servira à l'ouverture suivante. */
const CACHE="grand-album-1";
const FICHIERS=["./","./manifest.webmanifest","./icon-192.png","./icon-512.png","./icon-maskable-512.png","./apple-touch-icon.png"];
self.addEventListener("install",e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FICHIERS)).then(()=>self.skipWaiting())); });
self.addEventListener("activate",e=>{ e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim())); });
self.addEventListener("fetch",e=>{
  const req=e.request; if(req.method!=="GET"||new URL(req.url).origin!==self.location.origin) return;
  const cle=req.mode==="navigate"?new Request("./"):req;
  const maj=caches.open(CACHE).then(c=>fetch(req,{cache:"no-cache"}).then(res=>res&&res.ok&&res.type==="basic"?c.put(cle,res.clone()).then(()=>res):res));
  e.respondWith(caches.match(cle,{ignoreSearch:true}).then(hit=>hit||maj));
  e.waitUntil(maj.catch(()=>{}));
});
