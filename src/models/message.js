
const mongoose = require('mongoose')


const messageSchema = new mongoose.Schema({

    room: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    message_body: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    message_status: {
        type: Boolean,
        default: false
    }
})

const Message = mongoose.model('Message', messageSchema)

module.exports = {Message, messageSchema}