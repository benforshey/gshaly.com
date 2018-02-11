/* eslint-env browser */
import 'babel-polyfill';

import { addEventToArray, setActivePage, determinePage } from './module/utility';
import masterProductList from './module/masterProductList';
import * as ordering from './module/ordering';
import scroll from './module/scroll';
import timeline from './module/timeline';
import teaKnowledge from './module/teaKnowledge';

function docReady(callback) {
  if (document.readyState !== 'loading') {
    return callback();
  }
  return document.addEventListener('DOMContentLoaded', callback);
}

function setSmoothScrollOnAllHash() {
  // Get all links on the page with the hash property (mostly internal links).
  const links = Array.from(document.getElementsByTagName('a')).filter(el => el.hash);
  addEventToArray({
    event: 'click',
    arr: links,
  }, (event) => {
    // event.preventDefault()
    scroll(event.target.hash, {
      duration: 250,
      offset: -16,
    });
  });
}

function siteInit() {
  // Init modules of code specific to page.
  if (determinePage('company-history', true)) {
    timeline.init();
  }
  if (determinePage('master-product-list', true)) {
    masterProductList.init();
  }
  if (determinePage('ordering', true)) {
    ordering.form.init();
    ordering.FAQ.init();
  }
  if (determinePage('tea-knowledge', true)) {
    teaKnowledge.init();
  }

  // Set section nav active link.
  setActivePage(document.querySelectorAll('.section-nav a'));

  // Set smooth scrolling default on all page links.
  setSmoothScrollOnAllHash();
}

if ('serviceWorker' in navigator) {
  // The service worker cannot access parent directories (apart from explicity setting scope),
  // so keep it in the root directory.
  navigator.serviceWorker.register('/service-worker.js').then((registration) => {
    console.log(`ServiceWorker registration successful with scope: ${registration.scope}`);
  }).catch((e) => {
    console.log(`ServiceWorker registration failed: ${e}`);
  });
}

docReady(siteInit);
