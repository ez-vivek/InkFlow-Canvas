self.addEventListener('install', e => {
    e.waitUntil(
        caches.open('static').then(cache => {
            return cache.addAll([
                '/',
                '/index.html',
                '/Css/canvas.css',
                '/Css/canvas-responsive.css',
                '/Css/light-theme.css',
                '/Js/canvas.js',
                '/Js/sidebar.js',
                '/Images/logo.png'
            ]);
        })
    );
});

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(response => {
            return response || fetch(e.request);
        })
    );
});