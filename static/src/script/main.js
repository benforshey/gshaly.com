/* eslint-env browser */
import { addEventToArray, setActivePage, determinePage } from './module/utility'
import masterProductList from './module/masterProductList'
import * as ordering from './module/ordering'
import scroll from './module/scroll'
import timeline from './module/timeline'
import teaKnowledge from './module/teaKnowledge'

const docReady = function (callback) {
  if (document.readyState !== 'loading') {
    return callback()
  } else {
    return document.addEventListener('DOMContentLoaded', callback)
  }
}

const setSmoothScrollOnAllHash = function () {
  // Get all links on the page with the hash property (mostly internal links).
  const links = Array.from(document.getElementsByTagName('a')).filter(el => el.hash)
  addEventToArray({
    event: 'click',
    arr: links
  }, (event) => {
    // event.preventDefault()
    scroll(event.target.hash, {
      duration: 250,
      offset: -16
    })
  })
}

const polyfill = function () {
  // Production steps of ECMA-262, Edition 6, 22.1.2.1
  if (!Array.from) {
    Array.from = (function () {
      var toStr = Object.prototype.toString
      var isCallable = function (fn) {
        return typeof fn === 'function' || toStr.call(fn) === '[object Function]'
      }
      var toInteger = function (value) {
        var number = Number(value)
        if (isNaN(number)) { return 0 }
        if (number === 0 || !isFinite(number)) { return number }
        return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number))
      }
      var maxSafeInteger = Math.pow(2, 53) - 1
      var toLength = function (value) {
        var len = toInteger(value)
        return Math.min(Math.max(len, 0), maxSafeInteger)
      }

      // The length property of the from method is 1.
      return function from (arrayLike/*, mapFn, thisArg */) {
        // 1. Let C be the this value.
        var C = this

        // 2. Let items be ToObject(arrayLike).
        var items = Object(arrayLike)

        // 3. ReturnIfAbrupt(items).
        if (arrayLike == null) {
          throw new TypeError('Array.from requires an array-like object - not null or undefined')
        }

        // 4. If mapfn is undefined, then let mapping be false.
        var mapFn = arguments.length > 1 ? arguments[1] : void undefined
        var T
        if (typeof mapFn !== 'undefined') {
          // 5. else
          // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
          if (!isCallable(mapFn)) {
            throw new TypeError('Array.from: when provided, the second argument must be a function')
          }

          // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
          if (arguments.length > 2) {
            T = arguments[2]
          }
        }

        // 10. Let lenValue be Get(items, "length").
        // 11. Let len be ToLength(lenValue).
        var len = toLength(items.length)

        // 13. If IsConstructor(C) is true, then
        // 13. a. Let A be the result of calling the [[Construct]] internal method
        // of C with an argument list containing the single item len.
        // 14. a. Else, Let A be ArrayCreate(len).
        var A = isCallable(C) ? Object(new C(len)) : new Array(len)

        // 16. Let k be 0.
        var k = 0
        // 17. Repeat, while k < len… (also steps a - h)
        var kValue
        while (k < len) {
          kValue = items[k]
          if (mapFn) {
            A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k)
          } else {
            A[k] = kValue
          }
          k += 1
        }
        // 18. Let putStatus be Put(A, "length", len, true).
        A.length = len
        // 20. Return A.
        return A
      }
    }())
  }

  // https://tc39.github.io/ecma262/#sec-array.prototype.includes
  if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, 'includes', {
      value: function (searchElement, fromIndex) {
        // 1. Let O be ? ToObject(this value).
        if (this == null) {
          throw new TypeError('"this" is null or not defined')
        }

        var o = Object(this)

        // 2. Let len be ? ToLength(? Get(O, "length")).
        var len = o.length >>> 0

        // 3. If len is 0, return false.
        if (len === 0) {
          return false
        }

        // 4. Let n be ? ToInteger(fromIndex).
        //    (If fromIndex is undefined, this step produces the value 0.)
        var n = fromIndex | 0

        // 5. If n ≥ 0, then
        //  a. Let k be n.
        // 6. Else n < 0,
        //  a. Let k be len + n.
        //  b. If k < 0, let k be 0.
        var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0)

        // 7. Repeat, while k < len
        while (k < len) {
          // a. Let elementK be the result of ? Get(O, ! ToString(k)).
          // b. If SameValueZero(searchElement, elementK) is true, return true.
          // c. Increase k by 1.
          // NOTE: === provides the correct "SameValueZero" comparison needed here.
          if (o[k] === searchElement) {
            return true
          }
          k++
        }

        // 8. Return false
        return false
      }
    })
  }

  if (!String.prototype.includes) {
    String.prototype.includes = function (search, start) {
      'use strict'
      if (typeof start !== 'number') {
        start = 0
      }

      if (start + search.length > this.length) {
        return false
      } else {
        return this.indexOf(search, start) !== -1
      }
    }
  }

  if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (searchString, position) {
      var subjectString = this.toString()
      if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
        position = subjectString.length
      }
      position -= searchString.length
      var lastIndex = subjectString.lastIndexOf(searchString, position)
      return lastIndex !== -1 && lastIndex === position
    }
  }
}

const siteInit = function () {
  // Polyfills.
  polyfill()

  // Init modules of code specific to page.
  if (determinePage('company-history', true)) {
    timeline.init()
  }
  if (determinePage('master-product-list', true)) {
    masterProductList.init()
  }
  if (determinePage('ordering', true)) {
    ordering.form.init()
    ordering.FAQ.init()
  }
  if (determinePage('tea-knowledge', true)) {
    teaKnowledge.init()
  }

  // Set section nav active link.
  setActivePage(document.querySelectorAll('.section-nav a'))

  // Set smooth scrolling default on all page links.
  setSmoothScrollOnAllHash()
}

if ('serviceWorker' in navigator) {
  // The service worker cannot access parent directories (apart from explicity setting scope), so keep it in the root directory.
  navigator.serviceWorker.register('/service-worker.js').then(function (registration) {
    console.log(`ServiceWorker registration successful with scope: ${registration.scope}`)
  }).catch(function (e) {
    console.log(`ServiceWorker registration failed: ${e}`)
  })
}

docReady(siteInit)
