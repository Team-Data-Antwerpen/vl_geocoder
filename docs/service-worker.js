(()=>{let e=[],a="";e=["index.html","manifest.webmanifest","icon-72x72.9f2452f4.png","icon-96x96.e9a99945.png","icon-144x144.9503324d.png","icon-192x192.e1ebb7e0.png","favicon.b70fabe2.ico","index.7d3eddbc.js","logo.2007b2df.svg","index.4d28c809.css"],a="235a0b47",addEventListener("install",(c=>c.waitUntil(async function(){const c=await caches.open(a);await c.addAll(e)}()))),addEventListener("activate",(e=>e.waitUntil(async function(){const e=await caches.keys();await Promise.all(e.map((e=>e!==a&&caches.delete(e))))}())))})();
//# sourceMappingURL=service-worker.js.map