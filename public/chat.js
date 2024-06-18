document.addEventListener('DOMContentLoaded', function () {
  // input output socket bin to localhost
  const socket = io('http://localhost:5000/')
  const pseudo = getCookie('pseudo')
  //   console.log(socket.id)
  // get the channel path
  const channel = window.location.pathname.split('/').pop()
  console.log(channel)
  // join channelUser ${pseudo} joined channel: ${channel}
  // socket.emit('joinChannel', channel)
  socket.emit('joinChannel', { channel, pseudo })
  console.log(`User ${pseudo} joined channel: ${channel}`)
  // define const with html element
  const form = document.getElementById('form')
  const input = document.getElementById('input')
  const messages = document.getElementById('messages')
  const typing = document.getElementById('typing')
  //   const author = document.getElementById('author')
  // define variable for listen user input
  let typingTimeout

  // set true for notification
  let isUserActive = true

  function getCookie(cname) {
    let name = cname + '='
    let ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) == ' ') {
        c = c.substring(1)
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length)
      }
    }
    return ''
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    if (input.value) {
      socket.emit('message', input.value)
      input.value = ''
      clearTimeout(typingTimeout)
      socket.emit('stopTyping')
    }
  })

  input.addEventListener('input', () => {
    socket.emit('typing')
    clearTimeout(typingTimeout)
    typingTimeout = setTimeout(() => {
      socket.emit('stopTyping')
    }, 3000)
  })

  socket.on('typing', () => {
    typing.textContent = 'A user typing..'
  })

  socket.on('stopTyping', () => {
    typing.textContent = ''
  })

  socket.on('receptMessage', (data) => {
    console.log(data.pseudo)
    const item = document.createElement('li')
    const name = document.createElement('p')
    item.classList.add('list-group-item', 'list-group-item-light')
    item.textContent = data.msg
    name.textContent = data.pseudo
    if (data.id === socket.id) {
      item.classList.add(
        'd-flex',
        'flex-row-reverse',
        'p-2',
        'border',
        'border-white',
        'mb-2',
        'bg-danger',
        'text-white',
        'ms-auto',
        'rounded-start',
        'border-end-0'
      )
      item.style.maxWidth = 'fit-content'
      name.classList.add('text-end')
      //item.style.color = 'blue'
    } else {
      item.classList.add(
        'd-flex',
        'flex-row',
        'p-2',
        'border',
        'border-white',
        'mb-2',
        'bg-primary',
        'text-white',
        'me-auto',
        'rounded-end',
        'border-start-0'
      )
      // timer define for notification
      setTimeout(() => {
        if (!isUserActive) {
          notifyMe(item.textContent)
        }
      }, 5000)
      item.style.maxWidth = 'fit-content'
      name.classList.add('text-start')
    }

    messages.appendChild(item)
    messages.appendChild(name)
    window.scrollTo(0, document.body.scrollHeight)
  })

  // function to send notification with the current message
  function notifyMe(msg) {
    if (!('Notification' in window)) {
      console.log('This browser does not support dekstop notification')
    } else if (Notification.permission === 'granted') {
      new Notification(msg)
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(msg)
        }
      })
    }
  }

  // Listen if user is on the web page or not
  document.addEventListener('visibilitychange', function () {
    isUserActive = !document.hidden
    console.log(
      isUserActive ? 'User is on the page' : 'User is not on the page'
    )
  })

  if (
    Notification.permission !== 'granted' &&
    Notification.permission !== 'denied'
  ) {
    Notification.requestPermission()
  }
})
