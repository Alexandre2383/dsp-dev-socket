const express = require('express')
const middle = require('./utils/utils')
const { createServer } = require('node:http')
const { join } = require('node:path')
const { Server } = require('socket.io')
const cookieParser = require('cookie-parser') // add cookie parser

const app = express()
const port = 5000
const server = createServer(app)
const io = new Server(server)

app.use(express.static(join(__dirname, 'public')))

app.use(cookieParser())

app.get('/', middle, function (req, res) {
  return res.sendFile(join(__dirname, 'public', 'index.html'))
})

app.get('/chat', (req, res) => {
  return res.json({ hello: 'world' })
})

app.get('/chat/:channel', (req, res) => {
  // if the cookie is set
  const pseudo = req.cookies.pseudo
  if (!pseudo) {
    return res.redirect('/')
  }
  res.sendFile(join(__dirname, 'public', 'chat.html'))
})

io.on('connection', (socket) => {
  console.log('a user connected')
  console.log(socket.id)

  // get the pseudo set by the user
  socket.on('setPseudo', (pseudo) => {
    socket.pseudo = pseudo // bind the pseudo with socket
    console.log(`User ${socket.id} set pseudo to: ${pseudo}`)
  })

  // connexion to channel
  socket.on('joinChannel', ({ channel, pseudo }) => {
    socket.pseudo = pseudo
    socket.join(channel)
    console.log(`User ${pseudo} joined channel: ${channel}`)

    socket.on('message', (message) => {
      io.to(channel).emit('receptMessage', {
        msg: message,
        id: socket.id,
        pseudo: socket.pseudo,
      })
    })
  })

  // Pass message data with id user in an object emit
  socket.on('leaveChannel', (channel) => {
    socket.leave(channel)
    console.log(`User left channel: ${channel}`)
  })

  // Emit when user curently typing message
  socket.on('typing', () => {
    socket.broadcast.emit('typing', socket.id)
  })

  // Emit when user stop typing message
  socket.on('stopTyping', () => {
    socket.broadcast.emit('stopTyping', socket.id)
  })

  socket.on('disconnect', () => {
    console.log('a user disconnect')
  })
})

server.listen(port, () => {
  console.log(`App Socket listened on port:${port}`)
})
