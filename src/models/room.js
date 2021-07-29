const mongoose = require('mongoose')

const ObjectId = mongoose.Schema.Types.ObjectId
const {message} = require('./message')

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    users: [ObjectId],
    messages: [message],
    createdAt:{
        type: Date
    }
})

const Room = mongoose.model('Room', roomSchema)
module.exports = {Room}