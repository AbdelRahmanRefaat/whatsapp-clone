const log = console.log

const http = require('http')
const path = require('path')
const express = require('express')
const socketio = require('socket.io')
require('./db/mongoose')


// Routers
const userRouter = require('./routers/user')


const app = express()
const server = http.createServer(app)
const io = socketio(server)

const PORT = process.env.PORT || 3000

const publicDirPath = path.join(__dirname, '../public')

app.use(express.static(publicDirPath))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())




app.use(userRouter)


app.get('/chat', (req, res) => {
    log(req.url)
    res.status(201).sendFile(publicDirPath + '/chat.html')
})



io.on('connection', (socket) => {
    log('New User has joined', socket.id)

    socket.emit('message', 'Admin: Welcome!')
    socket.on('sendMessage', (message, callback) => {

        io.emit('message', message)

        callback()
    })
})



server.listen(PORT, () => {
    log(`Server is up on port ${PORT}`)
})