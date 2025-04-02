/* eslint-env browser */
import { addEventToArray, setActivePage, throttle } from "./utility.js";

const listing = {
  additionalInformationControl(e) {
    // The 'aria-controls' and ID of the hidden text match, so use that to get the element and apply necessary classes.
    const text = document.getElementById(
      e.target.getAttribute("aria-controls"),
    );

    // Toggle visiblity and animation classes on the text.
    text.classList.toggle("description-content-isCollapsed");
    text.classList.toggle("description-content-isExpanded");

    // Change the text on the button to show the correct description and toggle aria states.
    if (text.classList.contains("description-content-isExpanded")) {
      e.target.innerText = "<< show less";
      e.target.setAttribute("aria-expanded", "true");
      text.setAttribute("aria-hidden", "false");
    } else {
      e.target.innerText = "show more >>";
      e.target.setAttribute("aria-expanded", "false");
      text.setAttribute("aria-hidden", "true");
    }
    return;
  },
  checkboxFilter() {
    // Reset the value.
    listing.input.value = "";

    // Use listing.filterCheckbox because of document scope from Listener.
    const filterAND = listing.filterCheckbox
      .filter((el) => {
        return el.classList.contains("filter-and") && el.checked;
      })
      .map((el) => {
        return el.dataset.filter;
      });
    const filterOR = listing.filterCheckbox
      .filter((el) => {
        return el.classList.contains("filter-or") && el.checked;
      })
      .map((el) => {
        return el.dataset.filter;
      });

    // Single-word query.
    if (filterAND.length === 1 && filterOR.length === 0) {
      listing.input.value = filterAND[0];
    } else if (filterOR.length === 1 && filterAND.length === 0) {
      listing.input.value = filterOR[0];
    }

    // Two-word AND query.
    if (filterAND.length === 1 && filterOR.length === 1) {
      listing.input.value = `${filterAND[0]} and ${filterOR[0]}`;
    }

    // Multiple-word AND query.
    if (filterAND.length > 1 && filterOR.length === 0) {
      let query = "";
      filterAND.map((el, index, arr) => {
        if (index + 1 !== arr.length) {
          query += `${el} and `;
        } else {
          query += `${el}`;
        }
      });
      listing.input.value = query;
    }

    // Multiple-word OR query.
    if (filterOR.length > 1 && filterAND.length === 0) {
      let query = "";
      filterOR.map((el, index, arr) => {
        if (index + 1 !== arr.length) {
          query += `${el} or `;
        } else {
          query += `${el}`;
        }
      });
      listing.input.value = query;
    }

    // Multiple-word AND, single OR query.
    if (filterAND.length > 1 && filterOR.length === 1) {
      let query = "";
      filterAND.map((el, index, arr) => {
        if (index + 1 !== arr.length) {
          query += `${el} and `;
        } else {
          query += `${el}`;
        }
      });
      query += `, ${filterOR[0]}`;
      listing.input.value = query;
    }

    // Multiple-word OR, single AND query.
    if (filterOR.length > 1 && filterAND.length === 1) {
      let query = "";
      filterOR.map((el, index, arr) => {
        if (index + 1 !== arr.length) {
          query += `${el} or `;
        } else {
          query += `${el}`;
        }
      });
      query = `${filterAND[0]}, ` + query;
      listing.input.value = query;
    }

    // Multiple-word AND/OR query.
    if (filterOR.length > 1 && filterAND.length > 1) {
      let query = "";
      filterAND.map((el, index, arr) => {
        if (index + 1 !== arr.length) {
          query += `${el} and `;
        } else {
          query += `${el}`;
        }
      });

      query += ", ";

      filterOR.map((el, index, arr) => {
        if (index + 1 !== arr.length) {
          query += `${el} or `;
        } else {
          query += `${el}`;
        }
      });
      listing.input.value = query;
    }

    // Set visual effects on input, since programmatically changing value doesn't do this.
    listing.DOMSearchGroupState();
    // Filter the results.
    return listing.filterParse(listing.input.value);
  },
  countCheckedListingCheckboxes() {
    // For counting, get all the checked checkboxes.
    const quote = listing.listingCheckbox.filter((el) => el.checked);
    return quote.length;
  },
  countFilteredResults() {
    const count = {};

    count.total = this.queryElementList.length;
    count.unmatched =
      document.getElementsByClassName("listing-isHidden").length;
    count.matched = count.total - count.unmatched;

    return count;
  },
  filterParse(queryString = "") {
    // Trim & lowercase the query string
    const conditionedQueryString = queryString.trim().toLowerCase();

    // Split the query phrase at commas. Trim any excess whitespace.
    // Filter to return non-empty entries (a byproduct of split).
    this.querySplit.comma = conditionedQueryString
      .split(",")
      .map((element) => {
        return element.trim();
      })
      .filter((x) => {
        return !(x.length === 0);
      });

    // If the query contains the word 'and', split at 'and' (see regex).
    // Filter over to remove indexes with (just) the word 'and',
    // because I want the words surround the 'and', not the 'and'.
    // Finally, remove indexes that contain 'false'.
    this.querySplit.and = this.querySplit.comma
      .map((el) => {
        if (/(\s+and\s+)/g.test(el)) {
          return el.split(/(\s+and\s+)/g).filter((x) => {
            return !/(\s+and\s+)/g.test(x);
          });
        } else {
          return false;
        }
      })
      .filter((x) => {
        return x !== false;
      });

    // If the query contains the word 'or', split at 'or' (see regex).
    // Filter over to remove indexes with (just) the word 'or',
    // because I want the words surround the 'or', not the 'or'.
    // Finally, remove indexes that contain 'false'.
    this.querySplit.or = this.querySplit.comma
      .map((el) => {
        if (/(\s+or\s+)/g.test(el)) {
          return el.split(/(\s+or\s+)/g).filter((x) => {
            return !/(\s+or\s+)/g.test(x);
          });
        } else {
          return false;
        }
      })
      .filter((x) => {
        return x !== false;
      });

    // If the query does not contains the words 'or' or "and (see regex),
    // include it as a single query.
    // Finally, remove indexes that contain 'false'.
    this.querySplit.single = this.querySplit.comma
      .map((el) => {
        if (!/(\s+and\s+)/g.test(el) && !/(\s+or\s+)/g.test(el)) {
          return el;
        } else {
          return false;
        }
      })
      .filter((x) => {
        return x !== false;
      });

    this.querySplit.all = [].concat(
      this.querySplit.single,
      this.querySplit.and,
      this.querySplit.or,
    );

    return this.DOMFilterTables();
  },
  groupQueryElements() {
    // Return each listing's element.children.
    const allListingGroups = this.listingGroup.map((element) => {
      return Array.from(element.children);
    });

    // Map through all arrays of arrays, etc., returning a consolidated array of all listing rows on the page.
    return allListingGroups.map((element) => {
      return element.map((element) => {
        return this.queryElementList.push(element);
      });
    });
  },
  listingGroupAccordion(event) {
    let element = "";
    // I'm making an assumption that the header will be an adjacent sibling
    // to the table and that the clickable element will be a header or a button.
    if (event.target.nodeName === "BUTTON") {
      element = event.target.parentNode;
    } else if (event.target.nodeName === "H3") {
      element = event.target;
    } else {
      return false;
    }
    // Toggle the listing group header classes.
    element.classList.toggle("listingGroup-header-isExpanded");
    element.classList.toggle("listingGroup-header-isCollapsed");
    // Toggle the listing group classes & states.
    element.nextElementSibling.hidden
      ? element.nextElementSibling.removeAttribute("hidden")
      : (element.nextElementSibling.hidden = "true");
    element.nextElementSibling.classList.toggle("listingGroup-isExpanded");
    element.nextElementSibling.classList.toggle("listingGroup-isCollapsed");
  },
  saveQuoteAndRedirect() {
    // Called from an event listener; use global scope.
    function getCheckboxQuote() {
      // Create a list of all checked listing checkboxes.
      const checked = listing.listingCheckbox.filter((el) => {
        return el.checked;
      });
      const quote = [];

      // Map over checked list and set values to localStorage.
      checked.map((el) => {
        quote.push(
          el.parentNode.querySelector(".header-name").innerText.trim(),
        ); // Query the target directly, so as to not occasionaly capture the innerText of "Checkbox".
      });

      return quote;
    }
    const quote = getCheckboxQuote();

    localStorage.setItem("quote", JSON.stringify(quote));

    window.location.href = "/ordering/";
  },
  DOMSearchGroupState() {
    this.helperTextNode.classList.remove("helperText-isInserted");

    if (this.input.value === "") {
      this.filterSearchButton.style.background = "hsla(120, 55.6%, 28.2%, .4)";
      this.helperTextNode.innerHTML = `<p>try "iced and fruit", or "organic and iced, china or germany"</p>`;
      // this.helperTextNode.innerHTML = `<p>This will search through any text in the listing below. You can make complex searches: "iced and fruit", or "organic and iced, china or germany". But you must separate "and" and "or" with a comma.</p>`
      this.helperTextNode.classList.add("helperText-isInserted");
      return this.filterParse("");
    } else {
      this.filterSearchButton.style.background = "hsla(120, 55.6%, 28.2%, 1)";
      return;
    }
  },
  DOMFilterHelperText() {
    // Fetch the count of filtered results.
    const count = this.countFilteredResults();
    // const helperTextNode = document.querySelector('.filter-helperText')
    const resultNodeContextual = this.input.value
      ? `for "${this.input.value}"`
      : `shown`;

    this.helperTextNode.classList.remove("helperText-isInserted");

    if (count.matched === 0) {
      // If we're on the Master Product List and don't find a result...
      if (document.location.pathname.endsWith("master-product-list/")) {
        this.helperTextNode.innerHTML = `<p>Sorry, there don't seem to be any teas with those characteristics. If you'd like help, you can always call GS Haly using the contact information <a href="#footer">in the footer</a>.</p>`;
        return this.helperTextNode.classList.add("helperText-isInserted");
      } else {
        this.helperTextNode.innerHTML = `<p>Sorry, there don't seem to be any teas with those characteristics. You can always search the <a href="../">Master Product List</a>.</p>`;
        return this.helperTextNode.classList.add("helperText-isInserted");
      }
    }

    if (this.input.value === "") {
      this.helperTextNode.innerHTML = `<p>try "iced and fruit", or "organic and iced, china or germany"</p>`;
      // this.helperTextNode.innerHTML = `<p>This will search through any text in the listing below. You can make complex searches: "iced and fruit", or "organic and iced, china or germany". But you must separate "and" and "or" with a comma.</p>`
      return this.helperTextNode.classList.add("helperText-isInserted");
    } else {
      this.helperTextNode.innerHTML = `<p>${count.matched} of ${count.total} results ${resultNodeContextual}</p>`;
      return this.helperTextNode.classList.add("helperText-isInserted");
    }
  },
  DOMFilterTables() {
    // Start with a fresh slate (all rows unhidden).
    // Necessary because filter functions are destructive only so that one filter
    // may run, and another run after it to further reduce the visible rows.
    this.queryElementList.map((el) => {
      return el.classList.remove("listing-isHidden");
    });

    // Only run the single query if there's a single query.
    if (this.querySplit.single.length) {
      this.queryElementList.map((element) => {
        // Set a temporary array to push this element's results into.
        const queryFound = [];
        // Set searchable inner text to same case as query string.
        const conditionedInnerText = element?.innerText.toLowerCase();
        // Map searchable 'data-filter' attributes into array.
        const queryDataFilter = Array.from(
          element.querySelectorAll("[data-filter]"),
        ).map((element) => {
          return element?.dataset.filter.toLowerCase();
        });

        queryFound.push(
          queryDataFilter.some((el) => el.includes(this.querySplit.single)),
        );

        queryFound.push(conditionedInnerText.includes(this.querySplit.single));

        if (queryFound.indexOf(true) < 0) {
          return element.classList.add("listing-isHidden");
        } else {
          return;
        }
      });
    }

    // Only run the AND query if there's an AND query.
    if (this.querySplit.and.length) {
      this.queryElementList.map((element) => {
        // Set a temporary object to push this element's results into.
        const queryFound = {};
        // Create separate results array, because I later iterate over enumberables in queryFound.
        const results = [];
        // Set searchable inner text to same case as query string.
        const conditionedInnerText = element?.innerText.toLowerCase();
        // Map searchable 'data-filter' attributes into array.
        const queryDataFilter = Array.from(
          element.querySelectorAll("[data-filter]"),
        ).map((element) => {
          return element?.dataset.filter.toLowerCase();
        });

        // Map over split query.
        this.querySplit.and.map((queryStrings) => {
          // Map over each query string.
          queryStrings.map((queryString) => {
            // Temporary array to store results.
            // First push the results of the inner text search.
            const results = [];
            results.push(conditionedInnerText.includes(queryString));

            // Map over the dataFilter terms. May not be present and varies in length.
            // Push into results array (after inner text search results).
            queryDataFilter.map((dataFilterTerm) => {
              return results.push(dataFilterTerm.includes(queryString));
            });
            // Separated in an object by query terms and grouped into an array by results.
            queryFound[queryString] = results;
            return queryFound;
          });
        });

        // Parse and evalute what a match for AND looks like, pushing results into the queryFound object.
        // AND will push true if query has been found (true in array) per search term in text and dataFilter.
        // AND should be a flattened array of true, since each of the terms should have been found
        // either in the inner text or dataFilter.
        for (const property in queryFound) {
          // Push the found/not found boolean (per query-term namespace) into queryFound.results.
          if (queryFound[property].indexOf(true) > -1) {
            results.push(true);
          } else {
            results.push(false);
          }
        }

        // Hide the elements in which false is found.
        if (results.indexOf(false) > -1) {
          return element.classList.add("listing-isHidden");
        } else {
          return;
        }
      });
    }

    // Only run the OR query if there's an OR query.
    if (this.querySplit.or.length) {
      this.queryElementList.map((element) => {
        // Set a temporary object to push this element's results into.
        const queryFound = {};
        // Create separate results array, because I later iterate over enumberables in queryFound.
        const results = [];
        // Set searchable inner text to same case as query string.
        const conditionedInnerText = element?.innerText.toLowerCase();
        // Map searchable 'data-filter' attributes into array.
        const queryDataFilter = Array.from(
          element.querySelectorAll("[data-filter]"),
        ).map((element) => {
          return element?.dataset.filter.toLowerCase();
        });

        // Map over split query.
        this.querySplit.or.map((queryStrings) => {
          // Map over each query string.
          queryStrings.map((queryString) => {
            // Temporary array to store results.
            // First push the results of the inner text search.
            const results = [];
            results.push(conditionedInnerText.includes(queryString));

            // Map over the dataFilter terms. May not be present and varies in length.
            // Push into results array (after inner text search results).
            queryDataFilter.map((dataFilterTerm) => {
              return results.push(dataFilterTerm.includes(queryString));
            });
            // Separated in an object by query terms and grouped into an array by results.
            queryFound[queryString] = results;
            return queryFound;
          });
        });

        // Parse and evalute what a match for OR looks like, pushing results into the queryFound object.
        // OR will push true if query has been found (true in array) per search term in text and dataFilter.
        // OR should be a flattened array of at least one true, since any of the terms can be found
        // either in the inner text or dataFilter.
        for (const property in queryFound) {
          // Push the found/not found boolean (per query-term namespace) into queryFound.results.
          if (queryFound[property].indexOf(true) > -1) {
            results.push(true);
          } else {
            results.push(false);
          }
        }

        // Hide the elements in which true is not found.
        if (results.indexOf(true) < 0) {
          return element.classList.add("listing-isHidden");
        } else {
          return;
        }
      });
    }

    // Hide listing groups who's listings don't have any content showing.
    // Get the count of listings per listing group, then the hidden listings per group.
    // Compare the lengths, then hide the parent node (the listing group wrap).
    // Only do this on the Master Product Listing
    if (window.location.pathname.endsWith("master-product-list/")) {
      this.listingGroup.map((el) => {
        const listingCount = el.children.length;
        const hiddenListings = Array.from(el.children).filter((el) => {
          return el.classList.contains("listing-isHidden");
        });

        if (listingCount === hiddenListings.length) {
          return el.parentNode.classList.add("listingGroup-isHidden");
        } else {
          return el.parentNode.classList.remove("listingGroup-isHidden");
        }
      });
    }

    this.DOMSyncronizeCheckboxWithFilter();
    return this.DOMFilterHelperText();
  },
  // Called from an event handler, so using global scope.
  DOMQuoteCheckbox(event) {
    // Event delegation was used to target the listing group instead of each checkbox.
    // Exit function if the click wasn't on the input (or label, which maps to the input).
    if (event && event.target.nodeName !== "INPUT") {
      return;
    } else {
      // For counting, get all the checked checkboxes.
      const length = listing.countCheckedListingCheckboxes();

      // Remove the animation class if it's on from a previous length limit.
      listing.quoteButton.classList.remove("isFull");
      // Set inner text to show reflect number of checked.
      listing.quoteButton.innerText = `Request a Quote ${length}/5`;

      // TODO: This is an idea for filtering by checked state. It's not a quick addition, because the product list is indexed on load, and not updated. An idea to implement this would be to have a checkbox pop up in the helper text (once there are some checkd boxes) that gives the option of "show only selected items". I could then run a filter to add the hidden class to all listing items not checked.
      // if (event) {
      //   event.target.checked ? event.target.parentElement.dataset.checked = 'checked selected' : event.target.parentElement.dataset.checked = ''
      // }

      if (length >= 5) {
        // Disable all other checkboxes.
        listing.listingCheckbox.map((el) => {
          el.checked ? (el.disabled = false) : (el.disabled = true);
        });
        // Let the user know it's time to request a quote.
        listing.quoteButton.classList.add("isFull");
      } else {
        listing.listingCheckbox.map((el) => {
          el.disabled = false;
        });
      }
      // DOM doesn't retrigger animation unless element is reinserted (layout shift).
      // Clone (deep) & reinsert button.
      const el = document.querySelector(".quote-button");
      const clone = listing.quoteButton.cloneNode(true);
      el.parentNode.replaceChild(clone, el);
      clone.addEventListener("click", listing.saveQuoteAndRedirect);
      // Make sure quote button is properly positioned.
      return listing.DOMScrollElements();
    }
  },
  // Handles monitoring the position of DOM elements and applying classes for fixed scroll.
  DOMScrollElements() {
    const currentDistanceToPageTop = window.scrollY;

    if (currentDistanceToPageTop >= this.quoteButtonOffset.top) {
      return document.querySelector(".quote-button").classList.add("fixed"); // needs to be freshly querired, for some reason
    } else {
      return document.querySelector(".quote-button").classList.remove("fixed"); // needs to be freshly querired, for some reason
    }
  },
  // Syncronize the checkbox and filter input.
  DOMSyncronizeCheckboxWithFilter() {
    // Get a flat array of all query terms for strict matching.
    const eachQueryFlat = this.querySplit.all.reduce((a, b) => {
      return a.concat(b);
    }, []);
    // Map over all checkboxes and over the flat query array.
    // Test against the data-filter value and set the checkbox based on the result.
    return this.filterCheckbox.map((el) => {
      const regexp = new RegExp(`^${el.dataset.filter}`);
      const contains = eachQueryFlat.map((el) => {
        return regexp.test(el);
      });
      contains.includes(true) ? (el.checked = true) : (el.checked = false);
    });
  },
  init() {
    this.additionalInformationButtons = Array.from(
      document.querySelectorAll(".description-accordion-control"),
    );
    this.feedbackNode = document.createElement("p");
    // Filter checkboxes, used to...filter.
    this.filterCheckbox = Array.from(
      document.getElementsByClassName("filter-checkbox-native"),
    );
    this.filterForm = document.querySelector(".main-filter");
    this.filterSearchButton = document.querySelector(".filter-searchButton");
    this.helperTextNode = document.querySelector(".filter-helperText");
    // Used to add event listener to filter input.
    this.input = document.querySelector(".filter-input");
    this.inputClearButton = document.querySelector(".filter-input-clearButton");
    this.listingGroup = Array.from(
      document.getElementsByClassName("listingGroup"),
    );
    this.listingGroupHeader = Array.from(
      document.getElementsByClassName("listingGroup-header"),
    );
    this.listingCheckbox = Array.from(
      document.getElementsByClassName("listing-checkbox-native"),
    );
    // Array of booleans for determining if the query string was found in the search context.
    this.queryElementList = [];
    this.querySplit = {};
    this.quoteButton = document.querySelector(".quote-button");
    this.quoteButtonOffset = {};
    this.sidebarNav = document.querySelectorAll(".nav-listingType a");

    addEventToArray(
      {
        event: "click",
        arr: this.additionalInformationButtons,
      },
      this.additionalInformationControl,
    );
    // When table headers are clicked (targeted by classname), toggle the collapsed / expanded class name.
    // Expanded by default.
    addEventToArray(
      {
        event: "click",
        arr: this.listingGroupHeader,
      },
      this.listingGroupAccordion,
    );

    addEventToArray(
      {
        event: "change",
        arr: this.filterCheckbox,
      },
      this.checkboxFilter,
    );

    addEventToArray(
      {
        event: "click",
        arr: this.listingGroup,
      },
      this.DOMQuoteCheckbox,
    );

    this.quoteButtonOffset.top =
      document.querySelector(".quote-button").getBoundingClientRect().top +
      window.scrollY;
    // this.sidebarOffset.top = document.querySelector('.sidebar-wrap').getBoundingClientRect().top + window.scrollY

    window.addEventListener(
      "scroll",
      throttle(this.DOMScrollElements, 100, this),
    );

    this.filterForm.addEventListener(
      "submit",
      function (e) {
        e.preventDefault();
        return this.filterParse(this.input.value);
      }.bind(this),
    );

    // When focused upon, set the state.
    this.input.addEventListener("focus", this.DOMSearchGroupState.bind(this));

    // Fire quote function when button is clicked.
    this.quoteButton.addEventListener("click", this.saveQuoteAndRedirect);

    // Group all query elements into their respective master arrays.
    this.groupQueryElements();

    // Set active class on sidebar nav.
    setActivePage(this.sidebarNav);

    // Check / set quote button inner text & position (in case of back button from ordering form).
    this.DOMQuoteCheckbox();
  },
};

export default listing;
