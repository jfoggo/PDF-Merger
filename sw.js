importScripts('/cache-polyfill.js');


self.addEventListener('install', function(e) {
 e.waitUntil(
   caches.open('airhorner').then(function(cache) {
     return cache.addAll([
       '/',
       '/index.html',
       '/index.html#upload',
       '/index.html#select',
       '/index.html#merge',
       '/cache-polyfill.js',
       '/css/bootstrap.min.css',
       '/css/bootstrap.min.css.map',
       '/css/main.css',
       '/fonts/glyphicons-halflings-regular.eot',
       '/fonts/glyphicons-halflings-regular.svg',
       '/fonts/glyphicons-halflings-regular.ttf',
       '/fonts/glyphicons-halflings-regular.woff',
       '/fonts/glyphicons-halflings-regular.woff2',
       '/img/logo.png',
       '/img/snip1.png',
       '/img/snip2.png',
       '/img/snip3.png',
       '/img/welcome.png',
       '/js/bootstrap.min.js',
       '/js/displace.min.js',
       '/js/jquery.min.js',
       '/js/main.js',
       '/js/paul.js',
       '/manifest.json'
     ]);
   })
 );
});

self.addEventListener('fetch', function(event) {
  console.log(event.request.url);
 
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
 });
 