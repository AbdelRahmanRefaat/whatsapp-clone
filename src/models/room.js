const mongoose = require('mongoose')

const ObjectId = mongoose.Schema.Types.ObjectId
const {messageSchema} = require('./message')

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    users: [ObjectId],
    messages: [{
        message: messageSchema
    }],
    createdAt:{
        type: Date
    }
})

const Room = mongoose.model('Room', roomSchema)
module.exports = Room