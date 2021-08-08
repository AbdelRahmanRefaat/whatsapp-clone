const log = console.log

const http = require('http')
const path = require('path')
const express = require('express')
const socketio = require('socket.io')
require('./db/mongoose')
const auth = require('./middleware/auth')
const {Message} = require('./models/message')
const Room = require('./models/room')
const {getUserData, getUserFriends} = require('./utils/user')
const {createRoomName, createRoom} = require('./utils/room')
const {generateMessage, saveMessage} = require('./utils/message')


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


app.get('/chat', auth, (req, res) => {
    log(req.url)
    res.status(201).sendFile(publicDirPath + '/chat.html')
})




io.on('connection',async (socket) => {
    await getUserData(socket)
    log('New User has joined', socket.user.username)
    const friends = await getUserFriends(socket.user._id)

    // room for 2-friends chatting
    let room

    // room name
    let room_name

    socket.on('sendMessage', async (_message, callback) => {
        const messageToSend = generateMessage(socket.user.username, _message)
        await saveMessage(room, messageToSend)
        io.to(room.name).emit('message', messageToSend)
        callback()
    })

    socket.emit('loadUserFriendsList', {
        friends
    })


    // notify for newly added users
    socket.on('new-user-added', async () => {
        const friends = await getUserFriends(socket.user._id)
        socket.emit('loadUserFriendsList', {
            friends
        })
       
    })

    socket.on('chat-to', async ({to}, callback) => {
        
        console.log(to, socket.user._id)
        let name = room_name = createRoomName(to, socket.user._id)
        room = await Room.findOne({name})
    
        if(!room){
            room = await createRoom(to, socket.user._id)
        }
        socket.join(room.name)
        callback(room.name) // aknowledge fn and send room name
    })
    socket.on('leave-chat', (room) => {
        socket.leave(room)
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