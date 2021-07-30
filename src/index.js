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

const createRoomName = (to, user_id) => {
    let name
    if(to <= user_id){
        name = to.toString() + '' + user_id.toString()
    }else{
        name = user_id.toString() + '' + to.toString()
    } 
    return name
}

const createRoom = async(to, user_id) => {
    let name = createRoomName(to, user_id)

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

    // room name
    let room_name

    socket.emit('message', 'Admin: Welcome!')
    
    socket.on('sendMessage', async (_message, callback) => {
        const messageToSend = generateMessage(socket.user.username, _message)
        const message = new Message(messageToSend)
        message.room = room.name
        room.messages.push({message})
        await room.save()
        io.to(room.name).emit('message', messageToSend)
        callback()
    })

    socket.emit('userFriendsList', {
        friends
    })


    socket.on('chat-to', async ({to}, callback) => {
        
        let name = room_name = createRoomName(to, socket.user._id)
        room = await Room.findOne({name})
    
        if(!room){
            room = await createRoom(to, socket.user._id)
        }

        socket.join(room.name)
        callback() // aknowledge fn
    })


    socket.on('loadChatMessages', async (callback) => {
        const _room = await Room.findOne({name: room_name}).sort({'messages.message.createdAt': 'desc'})
        const messages = [..._room.messages]
        callback(messages)
    })
})



server.listen(PORT, () => {
    log(`Server is up on port ${PORT}`)
})