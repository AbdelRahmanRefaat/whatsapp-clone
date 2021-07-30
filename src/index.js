const log = console.log

const http = require('http')
const path = require('path')
const express = require('express')
const socketio = require('socket.io')
require('./db/mongoose')
const User = require('./models/user')
const Room = require('./models/room')
const {Message} = require('./models/message')
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
    const user = await User.findOne({_id: decoded._id})
    socket.user = user
    return user
}
const getUserFriends = async(_id) => { 
    const user = await User.findOne({_id})
    return user.friends
}

const createRoom = async(to, user_id) => {
    let name
    if(to <= user_id){
        name = to.toString() + '' + user_id.toString()
    }else{
        name = user_id.toString() + '' + to.toString()
    }
    const room = new Room({name, users: [to, user_id] })
    await room.save()
    return room

}

// TODO: remove this 
const generateMessage = (username,message_body) => {
    return {
        message_body,
        username,
        createdAt: new Date().getTime()
    }
}


io.on('connection',async (socket) => {
    await getUserData(socket)
    log('New User has joined', socket.user.username)
    const friends = await getUserFriends(socket.user._id)
    // room for 2-friends chatting
    let room

    socket.emit('message', 'Admin: Welcome!')
    
    socket.on('sendMessage', async (message, callback) => {
        const messageToSend = generateMessage(socket.user.username, message)
        const msg = new Message(messageToSend)
        msg.room = room.name
        const res = await msg.save()
        log('Mesg', res)
        io.to(room.name).emit('message', messageToSend)
        callback()
    })

    socket.emit('userFriendsList', {
        friends
    })


    socket.on('chat-to', async ({to} ) => {
       
        if(to <= socket.user._id){
            const name = to.toString() + '' + socket.user._id.toString()
            room = await Room.findOne({name})
        }else{
            const name = socket.user._id.toString() + '' + to.toString()
            room = await Room.findOne({name})
        }

        if(!room){
            room = await createRoom(to, socket.user._id)
        }

        socket.join(room.name)
    })
})



server.listen(PORT, () => {
    log(`Server is up on port ${PORT}`)
})