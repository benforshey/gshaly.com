import { setActivePage, insertAfter, throttle } from "./utility.js"

const teaKnowledge = {
  DOMNavPosition() {
    const currentDistanceToPageTop = window.scrollY

    if (currentDistanceToPageTop >= this.navOffset.top) {
      return document
        .querySelector(".teaKnowledge-nav-wrap")
        .classList.add("fixed") // needs to be freshly querired, for some reason
    } else {
      return document
        .querySelector(".teaKnowledge-nav-wrap")
        .classList.remove("fixed") // needs to be freshly querired, for some reason
    }
  },
  generateTableOfContents() {
    const activeLink = document.querySelector(
      ".teaKnowledge-sectionNav>.active"
    )
    const list = document.createElement("ol")
    const contentHeaders = document.querySelectorAll("section>h2")
    let innerHTML = ``

    ;[...contentHeaders].map(e => {
      // Build the link content.
      innerHTML += `<li class="teaKnowledge-tableOfContents"><a href="#${
        e.id
      }">${e.innerText}</a></li>`
    })

    list.innerHTML = innerHTML

    insertAfter(list, activeLink) // Insert the table of contents.
  },
  init() {
    this.sidebarNav = document.querySelectorAll(".teaKnowledge-nav a")
    this.navOffset = {}

    setActivePage(this.sidebarNav)
    this.generateTableOfContents()

    this.navOffset.top =
      document.querySelector(".teaKnowledge-nav-wrap").getBoundingClientRect()
        .top + window.scrollY

    window.addEventListener("scroll", throttle(this.DOMNavPosition, 100, this))
  },
}

export default teaKnowledge
