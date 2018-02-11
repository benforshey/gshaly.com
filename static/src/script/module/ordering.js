/* eslint-env browser */
/* global ga */


const form = {
  // Set the value from localStorage into the textbox and clear localStorage.
  DOMSetProducts() {
    const products = JSON.parse(localStorage.getItem('quote'));
    const baseText = `${products}`;
    const formattedText = baseText.replace(/,/g, ',\n');

    // Set value of textarea only if there's a value (in case of page refresh).
    if (products !== null) {
      this.products.value = formattedText;
    }

    localStorage.removeItem('quote');
  },
  navigatorStatus() {
    if (navigator.onLine) {
      form.button.innerText = 'send request';
      form.button.disabled = false;
      form.button.classList.remove('button-isDisabled');
    } else {
      form.button.innerText = 'offline';
      form.button.disabled = true;
      form.button.classList.add('button-isDisabled');
    }
  },
  sendFormData() {
    const AJAX = new XMLHttpRequest();
    const payload = new FormData(this.orderingForm);

    AJAX.addEventListener('load', (e) => {
      if (e.target.status === 200) {
        form.button.innerText = 'request sent';
        ga('send', 'event', { // since GA is loaded in the head, assume its presence
          eventCategory: 'Form',
          eventAction: 'send',
        });
        return form.orderingForm.reset();
      }
      ga('send', 'exception', { // since GA is loaded in the head, assume its presence
        exDescription: 'form send failure',
      });
      form.button.innerText = 'error in sending';
    });

    AJAX.open('POST', this.endpoint, true);
    AJAX.send(payload);
  },
  init() {
    this.button = document.querySelector('.form-button');
    this.orderingForm = document.querySelector('.orderingForm');
    this.products = document.querySelector('.form-products');
    this.endpoint = 'https://message.integrisweb.com/mail/';

    this.orderingForm.addEventListener('submit', (e) => { // Not sure why, but this cannot be a function reference (or else the AXAJ path is wrong). I have to prevent the default here and invoke the sendFormDatat() function in this anonymous function.
      e.preventDefault();
      form.sendFormData();
    });

    window.addEventListener('online', this.navigatorStatus);
    window.addEventListener('offline', this.navigatorStatus);

    this.DOMSetProducts();
  },
};

const FAQ = {
  // Use global scope for event listener.
  DOMFAQAccordion(event) {
    if (event.target.nodeName !== 'A') {
      return;
    }
    FAQ.FAQHeaders.map((el) => {
      el.classList.add('FAQ-header-isCollapsed');
      return el.nextElementSibling.classList.add('FAQ-isHidden');
    });
    event.target.parentElement.classList.remove('FAQ-header-isCollapsed');
    event.target.parentElement.nextElementSibling.classList.remove('FAQ-isHidden');
    event.target.parentElement.nextElementSibling.classList.add('FAQ-isExpanded');
  },
  init() {
    this.FAQ = document.querySelector('.aside-FAQ');
    this.FAQHeaders = Array.from(document.getElementsByTagName('dt'));

    this.FAQ.addEventListener('click', this.DOMFAQAccordion);

    // Initially, set hidden on all FAQ items but the first.
    this.FAQHeaders.map((el, idx) => {
      if (idx > 0) {
        el.nextElementSibling.classList.add('FAQ-isHidden');
        return el.classList.add('FAQ-header-isCollapsed');
      }
    });
  },
};

export {
  form,
  FAQ,
};
