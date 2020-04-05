const staticCacheName = 'site-static-v1';
const assets = [
    'index.html',
    'assets/js/libs/flickity.js',
    'assets/js/app.js',
    'assets/css/style.css',
    'assets/js/libs/fontello.js',
    'assets/images/placeholder-image.jpg',
    'assets/fonts/fjalla/FjallaOne-Regular.eot',
    'assets/fonts/fjalla/FjallaOne-Regular.eot?#iefix',
    'assets/fonts/fjalla/FjallaOne-Regular.woff2',
    'assets/fonts/fjalla/FjallaOne-Regular.woff',
    'assets/fonts/fjalla/FjallaOne-Regular.ttf',
    'assets/fonts/fjalla/FjallaOne-Regular.svg#FjallaOne-Regular',
    'assets/fonts/roboto/Roboto-Light.eot',
    'assets/fonts/roboto/Roboto-Light.eot?#iefix',
    'assets/fonts/roboto/Roboto-Light.woff2',
    'assets/fonts/roboto/Roboto-Light.woff',
    'assets/fonts/roboto/Roboto-Light.ttf',
    'assets/fonts/roboto/Roboto-Light.svg#Roboto-Light',
    'assets/fonts/roboto/Roboto-Medium.eot',
    'assets/fonts/roboto/Roboto-Medium.eot?#iefix',
    'assets/fonts/roboto/Roboto-Medium.woff2',
    'assets/fonts/roboto/Roboto-Medium.woff',
    'assets/fonts/roboto/Roboto-Medium.ttf',
    'assets/fonts/roboto/Roboto-Medium.svg#Roboto-Medium',
    'assets/fonts/roboto/Roboto-Regular.eot',
    'assets/fonts/roboto/Roboto-Regular.eot?#iefix',
    'assets/fonts/roboto/Roboto-Regular.woff2',
    'assets/fonts/roboto/Roboto-Regular.woff',
    'assets/fonts/roboto/Roboto-Regular.ttf',
    'assets/fonts/roboto/Roboto-Regular.svg#Roboto-Regular',
    'assets/fonts/roboto/Roboto-Bold.eot',
    'assets/fonts/roboto/Roboto-Bold.eot?#iefix',
    'assets/fonts/roboto/Roboto-Bold.woff2',
    'assets/fonts/roboto/Roboto-Bold.woff',
    'assets/fonts/roboto/Roboto-Bold.ttf',
    'assets/fonts/roboto/Roboto-Bold.svg#Roboto-Bold',
    'assets/fonts/roboto/Roboto-Italic.eot',
    'assets/fonts/roboto/Roboto-Italic.eot?#iefix',
    'assets/fonts/roboto/Roboto-Italic.woff2',
    'assets/fonts/roboto/Roboto-Italic.woff',
    'assets/fonts/roboto/Roboto-Italic.ttf',
    'assets/fonts/roboto/Roboto-Italic.svg#Roboto-Italic'
];
// install event
self.addEventListener('install', evt => {
    evt.waitUntil(
        caches.open(staticCacheName).then((cache) => {
            //console.log('caching shell assets');
            cache.addAll(assets);
        })
    );
});
// activate event
self.addEventListener('activate', evt => {
    evt.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== staticCacheName)
                .map(key => caches.delete(key))
            );
        })
    );
});

// fetch event
self.addEventListener('fetch', evt => {
    evt.respondWith(
        caches.match(evt.request).then(cacheRes => {
            return cacheRes || fetch(evt.request);
        })
    );
});



const dynamicCacheName = 'site-dynamic-v1';
// activate event
self.addEventListener('activate', evt => {
    evt.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key =>  key !== dynamicCacheName)
                .map(key => caches.delete(key))
            );
        })
    );
});
// fetch event
self.addEventListener('fetch', evt => {
    evt.respondWith(
        caches.match(evt.request).then(cacheRes => {
            return cacheRes || fetch(evt.request).then(fetchRes => {
                return caches.open(dynamicCacheName).then(cache => {
                    cache.put(evt.request.url, fetchRes.clone());
                    return fetchRes;
                })
            });
        })
    );
});
