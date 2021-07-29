
const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId
const User = require('./user')
const Room = require('./room')

const messageSchema = new mongoose.Schema({

    room: {
        type: String,
        required: true
    },
    user: {
        type: ObjectId,
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