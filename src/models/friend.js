const mongoose = require('mongoose')

const friendSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId
    },
    username: {
        type: String,
    },
    email: {
        type: String,
        
    },
    is_active: {
        type: Boolean,
        default: false
    }
})

const Friend = mongoose.model('Friend', friendSchema)

module.exports = {
    friendSchema,
    Friend
}