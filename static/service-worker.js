/* eslint-env worker */
const cacheName = 'offlineFirst'
const cacheVersion = 'v0.0.7'
const cacheURIs = [  // If any file in this list fails, the whole service worker fails to install.
  // Pages
  '/',
  '/about-us/',
  '/about-us/company-history/',
  '/about-us/gs-haly-co-team/',
  '/about-us/our-passion/',
  '/ordering/',
  '/our-standards/',
  '/our-teas/',
  '/our-teas/master-product-list/',
  '/our-teas/master-product-list/accessory/',
  '/our-teas/master-product-list/black/',
  '/our-teas/master-product-list/decaffeinated/',
  '/our-teas/master-product-list/flavored-black/',
  '/our-teas/master-product-list/flavored-fruit-blend/',
  '/our-teas/master-product-list/flavored-green/',
  '/our-teas/master-product-list/green/',
  '/our-teas/master-product-list/herbal/',
  '/our-teas/master-product-list/oolong/',
  '/our-teas/master-product-list/pu-erh/',
  '/our-teas/master-product-list/scented/',
  '/our-teas/master-product-list/seasonal-micro-lots/',
  '/our-teas/master-product-list/white/',
  '/tea-knowledge/',
  '/tea-knowledge/glossary-of-terms/',
  '/tea-knowledge/how-to-cup/',
  '/tea-knowledge/matching-a-standard/',
  '/404.html',
  // Style
  '/dist/style/main.css',
  // Script
  '/dist/script/bundle.js',
  // Images

  // Fonts
  // There's no point in saving woff, when ServiceWorker is the less-suported technology.
  '/dist/font/lato-light-webfont.woff2',
  '/dist/font/lato-lightitalic-webfont.woff2',
  '/dist/font/lato-regular-webfont.woff2',
  '/dist/font/sortsmillgoudy-regular-webfont.woff2'
]

const errorText = `
<h1>Sorry, you&rsquo;re offline right now.</h1>
<h2>Error Code: 503&mdash;Service Unavailable</h2>
<p>When you regain internet connection, please try visiting this page again. If you are using a <a href="http://browsehappy.com/" target="_blank" rel="noopener noreferrer">modern browser</a>, each page you visit will save itself for future visits&mdash;even when your&rsquo;re offline.</p>
`

self.addEventListener('install', function (event) {
  console.log(`WORKER: ${event.type} started`)
  event.waitUntil(
    caches
      .open(`${cacheName}, ${cacheVersion}`)
      .then(function (cache) {
        console.log(`WORKER: ${event.type} event opened cache`)
        return cache.addAll(cacheURIs)
      })
      .then(function () {
        console.log(`WORKER: ${event.type} completed`)
      })
  )
})

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches
    .keys()  // This method returns a promise that resolves to an array of available cache keys.
    .then(function (keys) {
      return Promise.all(  // Return a promise that resolves when outdated caches are deleted.
        keys
          .filter(function (key) {  // Filter over the keys array.
            // Return an array of caches not starting with the cacheName and ending with the
            // cacheVersion.
            return !(key.startsWith(cacheName) && key.endsWith(cacheVersion))
          })
          .map(function (key) {  // Map over the filtered array.
            return caches.delete(key)  // Delete the caches, fulfilling the promise.
          })
      )
    })
    .then(function () {
      console.log(`WORKER: activate completed.`)
    })
  )
})

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') {
    console.log(`WORKER: is only set to respond to 'GET' requests. Fetch event '${event.request.method}' ignored for URL '${event.request.url}'`)

    const request = event.request

    return event.respondWith(  // Return the browser's original request, basically passing it through.
      fetch(request)
    )
  } else {
    event.respondWith(
    caches
    .match(event.request)
    .then(function (cached) {
      console.log(`WORKER: fetch event ${cached ? '(cached)' : '(network)'} `)

      const networked = fetch(event.request)

      // Regardless of cache success or failure, we are fetching a fresh copy
      // from the network to update our cache.
      .then(fetchedFromNetwork, unableToResolve)  // Handle network request success and failure.
      .catch(unableToResolve)  // Catch errors from fetchedFromNetwork handler.

      // If there's a cached response (a caches.match), return it from the cache.
      // Otherwise, return the networked response from fetch(event.request).
      return cached || networked

      function fetchedFromNetwork (response) {
        // Clone the response (a stream can only be consumed once), since we're consuming
        // this in both the ServiceWorker cache and the fetch request.
        const cacheCopy = response.clone()

        console.log(`WORKER: fetch response from network for: ${event.request.url}`)

        caches
          .open(`${cacheName}, ${cacheVersion}`)  // Open a cache to store the response.
          .then(function add (cache) {
            cache.put(event.request, cacheCopy)  // Store the response.
          })
          .then(function () {
            console.log(`WORKER: fetch response stored in cache for: ${event.request.url}`)
          })
        return response  // Fulfill the promise.
      }

      // No response from either cache or network. Send a meaningful response accordingly.
      function unableToResolve () {
        console.log(`WORKER: fetch request failed in both cache and network.`)
        return new Response(errorText, {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/html; charset=utf-8'
          })
        })
      }
    })
  )
  }
})
