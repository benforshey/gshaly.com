const docReady = function(callback) {
  if (document.readyState !== "loading") {
    return callback()
  } else {
    return document.addEventListener("DOMContentLoaded", callback)
  }
}

const addEventToArray = (configObj, callback) => {
  const event = configObj.event
  const arr = configObj.arr

  return arr.map(index => {
    return index.addEventListener(event, callback)
  })
}

// A basic debounce function, which could use a rewrite.
const debounce = function(func, delay = 500) {
  let timeoutID // will be overwritten

  return function() {
    // would honestly like to attempt a rewrite with .bind()
    const context = this
    const args = arguments

    const later = function() {
      timeoutID = null
      // .apply() to current argument func rather than return a new one with .bind()
      func.apply(context, args)
    }

    clearTimeout(timeoutID)
    timeoutID = setTimeout(later, delay)
  }
}

// https://remysharp.com/2010/07/21/throttling-function-calls
const throttle = function(fn, threshhold, scope) {
  threshhold || (threshhold = 250)
  let last
  let deferTimer
  return function() {
    let context = scope || this
    let now = +new Date()
    let args = arguments

    if (last && now < last + threshhold) {
      // hold on to it
      clearTimeout(deferTimer)
      deferTimer = setTimeout(function() {
        last = now
        fn.apply(context, args)
      }, threshhold)
    } else {
      last = now
      fn.apply(context, args)
    }
  }
}

// A small function to wrap native insertBefore into insertAfter.
const insertAfter = function(newNode, referenceNode) {
  return referenceNode.parentNode.insertBefore(
    newNode,
    referenceNode.nextElementSibling
  )
}

// Match location.pathname to list of links and set active class.
const setActivePage = function(nodeList) {
  const nodeArray = Array.from(nodeList)
  const workingURL = {}
  workingURL.pathname = document.location.pathname

  if (document.location.hash.length) {
    workingURL.hash = document.location.hash
  }

  nodeArray.map(element => {
    if (
      element.href.endsWith(workingURL.pathname) ||
      element.href.endsWith(workingURL.hash)
    ) {
      element.classList.add("active")
      // element.setAttribute('aria-role', 'current')
    } else {
      element.classList.remove("active")
      // element.removeAttribute('aria-role')
    }
  })
}

const determinePage = (pageName, permissive) => {
  if (permissive) {
    return window.location.pathname.includes(pageName)
  } else {
    return window.location.pathname.endsWith(pageName)
  }
}

export {
  addEventToArray,
  debounce,
  docReady,
  throttle,
  insertAfter,
  setActivePage,
  determinePage,
}
