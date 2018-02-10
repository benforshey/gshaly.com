const timeline = {
  keyboardParse (e) {
    if (e.keyCode === 39 || e.keyCode === 40 || e.keyCode === 32) {  // forward (right, down, space)
      e.preventDefault()
      return this.navigate(true)
    } else if (e.keyCode === 37 || e.keyCode === 38) {  // back (left, up)
      e.preventDefault()
      return this.navigate(false)
    } else if (e.keyCode === 27) {  // exit (esc)
      e.preventDefault()
      return this.navigate()
    } else {
      return
    }
  },
  navigate (forward = null) {
    const context = document.querySelector(window.location.hash)

    if (forward) {
      window.location.href = context.querySelector('.arrow-next').href
    } else if (forward === false) {
      window.location.href = context.querySelector('.arrow-previous').href
    } else {
      window.location.href = '../'
    }
  },
  init () {
    this.anchorList = [...document.querySelectorAll('a[href^="#"]')]
    this.slideList = document.querySelectorAll('section')
    this.fullscreenWrap = document.querySelector('.fullscreen-wrap')

    // If JavaScript is working, add this style to the fullscreen-wrap element to prevent scrolling.
    this.fullscreenWrap.style.overflow = 'hidden'

    const sectionChildren = Array.from(this.slideList).filter(e => !(e.id.includes('cover-')))
    const addTransitions = function (parent, toggle) {
      const parts = parent.querySelectorAll('.timeline-text, .timeline-image')
      if (toggle === 0) {  // even; toggle allows for the image / text order switching on larger viewports
        parts[1].classList.add('fadeInLeft')
        parts[0].classList.add('fadeInRight')
      } else {
        parts[0].classList.add('fadeInLeft')
        parts[1].classList.add('fadeInRight')
      }
      parts[0].style.opacity = 1
      parts[1].style.opacity = 1
      return
    }

    const removeTransitions = function (parent) {
      const parts = parent.querySelectorAll('.timeline-text, .timeline-image')
      parts[0].style.opacity = 0
      parts[1].style.opacity = 0
      parts[0].classList.remove('fadeInLeft', 'fadeInRight')
      parts[1].classList.remove('fadeInLeft', 'fadeInRight')
      return
    }

    const setTransitions = function () {
      sectionChildren.map((e, i) => {
        if (window.location.hash === `#${e.id}`) {
          return addTransitions(e, i % 2)
        } else {
          return removeTransitions(e)
        }
      })
    }
    // TODO: loading with a hash already in the URL doesn't fire 'hashchange', causing the animation not to fire
    window.addEventListener('hashchange', setTransitions.bind(this))

    window.addEventListener('keydown', this.keyboardParse.bind(this), true)
    window.addEventListener('keypress', this.keyboardParse.bind(this), true)
  }
}

export default timeline

