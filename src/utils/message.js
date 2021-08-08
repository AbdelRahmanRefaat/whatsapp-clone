const {Message} = require('../models/message')

const generateMessage = (username,message_body) => {
    return {
        message_body,
        username,
        createdAt: new Date().getTime()
    }
}

const saveMessage = async (room, messageToSend) => {
    const message = new Message(messageToSend)
    message.room = room.name
    room.messages.push({message})
    await room.save()
}

module.exports = {generateMessage, saveMessage}