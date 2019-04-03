const navigation = {
  toggleNav(event) {
    if (event.code === "Enter" || event.code === "Space") {
      return event.currentTarget.click()
    }
    return event
  },

  init() {
    const navButton = document.querySelector(".navTrigger-label-header")

    navButton.addEventListener("keydown", this.toggleNav)
  },
}

export default navigation
