const log = console.log

const http = require('http')
const path = require('path')
const express = require('express')
const socketio = require('socket.io')
require('./db/mongoose')
const User = require('./models/user')
const jwt = require('jsonwebtoken')

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


const getUserData = async(socket) => {
    const token = socket.handshake.auth.token
    const decoded = jwt.decode(token, 'dafuqelgamed')
    const user_id = decoded._id;
    return {
        token,
        user_id
    }
}
const getUserFriends = async(_id) => { 
    const user = await User.findOne({_id})
    return user.friends
}

io.on('connection',async (socket) => {
    log('New User has joined', socket.id)

    const {token , user_id} = await getUserData(socket)
    const friends = await getUserFriends(user_id)


    log(friends)
    socket.emit('message', 'Admin: Welcome!')
    socket.on('sendMessage', (message, callback) => {
        io.emit('message', message)
        callback()
    })

    socket.emit('userFriendsList', {
        friends
    })
})



server.listen(PORT, () => {
    log(`Server is up on port ${PORT}`)
})