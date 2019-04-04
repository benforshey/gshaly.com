/* eslint-env browser */
import "babel-polyfill"

import { addEventToArray, setActivePage, determinePage } from "./module/utility"
import navigation from "./module/navigation"
import masterProductList from "./module/masterProductList"
import * as ordering from "./module/ordering"
import timeline from "./module/timeline"
import teaKnowledge from "./module/teaKnowledge"

function docReady(callback) {
  if (document.readyState !== "loading") {
    return callback()
  }
  return document.addEventListener("DOMContentLoaded", callback)
}

function siteInit() {
  navigation.init()
  // Init modules of code specific to page.
  if (determinePage("company-history", true)) {
    timeline.init()
  }
  if (determinePage("master-product-list", true)) {
    masterProductList.init()
  }
  if (determinePage("ordering", true)) {
    ordering.form.init()
    ordering.FAQ.init()
  }
  if (determinePage("tea-knowledge", true)) {
    teaKnowledge.init()
  }

  // Set section nav active link.
  setActivePage(document.querySelectorAll(".section-nav a"))
}

if ("serviceWorker" in navigator) {
  // The service worker cannot access parent directories (apart from explicity setting scope),
  // so keep it in the root directory.
  navigator.serviceWorker
    .register("/service-worker.js")
    .then(registration => {
      console.log(
        `ServiceWorker registration successful with scope: ${
          registration.scope
        }`
      )
    })
    .catch(e => {
      console.log(`ServiceWorker registration failed: ${e}`)
    })
}

docReady(siteInit)
