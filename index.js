const express = require('express')
const middle = require('./utils/utils')
const { createServer } = require('node:http')
const { join } = require('node:path')
const { Server } = require('socket.io')

const app = express()
const port = 5000
const server = createServer(app)
const io = new Server(server)

app.use(express.static(join(__dirname)))

app.get('/', middle, function (req, res) {
  return res.sendFile(join(__dirname, 'index.html' + __dirname, 'main.css'))
})

app.get('/chat', (req, res) => {
  return res.json({
    hello: 'world',
  })
})

io.on('connection', (socket) => {
  console.log('a user connected')

  // Emit when user curently typing message
  socket.on('typing', () => {
    socket.broadcast.emit('typing', socket.id)
  })

  // Emit when user stop typing message
  socket.on('stopTyping', () => {
    socket.broadcast.emit('stopTyping', socket.id)
  })

  // Pass message data with id user in an object emit
  socket.on('message', (message) => {
    io.emit('receptMessage', { msg: message, id: socket.id })
  })

  socket.on('disconnect', () => {
    console.log('a user disconnect')
  })
})

server.listen(port, () => {
  console.log(`App Socket listened on port:${port}`)
})
